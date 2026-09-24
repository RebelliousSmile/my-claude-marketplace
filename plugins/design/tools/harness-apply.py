#!/usr/bin/env python3
"""Apply a reviewed author payload to a fresh canonical harness.

The tool deliberately does not scrape or interpret arbitrary HTML. A browser/agent first
produces an explicit migration payload; this applicator makes the risky serialization and
zone replacement deterministic and atomic.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import tempfile
from pathlib import Path


def fail(message: str) -> "NoReturn":
    print(f"Error: {message}", file=sys.stderr)
    raise SystemExit(2)


def js_string(value: str) -> str:
    encoded = json.dumps(value, ensure_ascii=False)
    return (
        encoded.replace("</script", "<\\/script")
        .replace("\u2028", "\\u2028")
        .replace("\u2029", "\\u2029")
    )


def raw_script(value: str, field: str) -> str:
    if re.search(r"</script", value, re.IGNORECASE):
        fail(f"{field} contains </script>; raw author JavaScript cannot cross the script boundary")
    return value.strip("\n")


def raw_style(value: str, field: str) -> str:
    if re.search(r"</\s*style", value, re.IGNORECASE):
        fail(f"{field} contains </style>; author CSS cannot cross the style boundary")
    return value


def replace_zone(text: str, start: str, end: str, content: str) -> str:
    pattern = re.compile(f"({re.escape(start)})([\\s\\S]*?)({re.escape(end)})")
    matches = list(pattern.finditer(text))
    if len(matches) != 1:
        fail(f"expected exactly one governed zone {start!r}, found {len(matches)}")
    body = f"\n{content.rstrip()}\n" if content.strip() else "\n"
    return pattern.sub(lambda match: match.group(1) + body + match.group(3), text, count=1)


def load_payload(path: Path) -> dict:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        fail(f"cannot read payload {path}: {error}")
    if not isinstance(payload, dict):
        fail("payload must be a JSON object")
    pages = payload.get("pages")
    page_bodies = payload.get("pageBodies")
    if bool(pages) == bool(page_bodies):
        fail("payload must define exactly one non-empty object: pages or pageBodies")
    selected = pages if pages else page_bodies
    if not isinstance(selected, dict):
        fail("payload.pages or payload.pageBodies must be an object")
    for key, content in selected.items():
        if not isinstance(key, str) or not isinstance(content, str):
            fail("every page entry must map a string key to a string")
    for field in ("styles", "sharedHelpers", "afterRender"):
        if field in payload and not isinstance(payload[field], str):
            fail(f"payload.{field} must be a string")
    return payload


def apply_payload(harness: str, payload: dict) -> str:
    result = harness
    page_entries = payload.get("pages") or payload["pageBodies"]
    uses_bodies = "pageBodies" in payload
    for key, content in page_entries.items():
        registry = re.search(
            rf'^\s*{re.escape(json.dumps(key, ensure_ascii=False))}:\s*(page[A-Za-z0-9_$]+),\s*$',
            result,
            re.MULTILINE,
        )
        if not registry:
            fail(f"payload page {key!r} is absent from the harness registry")
        function_name = registry.group(1)
        placeholder = re.compile(
            rf"^(\s*)function\s+{re.escape(function_name)}\(\)\s*\{{\s*return\s+placeholder\([^\n]*\);\s*\}}\s*$",
            re.MULTILINE,
        )
        if len(placeholder.findall(result)) != 1:
            fail(f"{function_name} is not a fresh generated placeholder; refusing a lossy overwrite")
        if uses_bodies:
            body = raw_script(content, f"pageBodies[{key!r}]")
            replacement = lambda match, body=body: (
                f"{match.group(1)}function {function_name}() {{\n{body}\n{match.group(1)}}}"
            )
        else:
            replacement = lambda match, content=content: (
                f"{match.group(1)}function {function_name}() {{ return {js_string(content)}; }}"
            )
        result = placeholder.sub(replacement, result, count=1)

    result = replace_zone(
        result,
        "/* ===== AUTHOR PAGE STYLES — LLM MAY EDIT BETWEEN THESE MARKERS ===== */",
        "/* ===== END AUTHOR PAGE STYLES ===== */",
        raw_style(payload.get("styles", ""), "styles"),
    )
    result = replace_zone(
        result,
        "// ===== AUTHOR SHARED HELPERS — PURE ONLY; NO DOM, NETWORK, OR TIMERS =====",
        "// ===== END AUTHOR SHARED HELPERS =====",
        raw_script(payload.get("sharedHelpers", ""), "sharedHelpers"),
    )

    after = raw_script(payload.get("afterRender", ""), "afterRender")
    hook = re.compile(r"^(\s*)function afterPageRender\(root, page\) \{\}\s*$", re.MULTILINE)
    if len(hook.findall(result)) != 1:
        fail("expected one fresh afterPageRender hook")
    body = f"\n{after}\n" if after else ""
    result = hook.sub(
        lambda match: f"{match.group(1)}function afterPageRender(root, page) {{{body}{match.group(1)}}}",
        result,
        count=1,
    )
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--harness", required=True, type=Path)
    parser.add_argument("--payload", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()

    try:
        source = args.harness.resolve()
        output = args.out.resolve()
        if source == output:
            fail("--out must differ from --harness")
        harness = source.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as error:
        fail(f"cannot read harness {args.harness}: {error}")

    result = apply_payload(harness, load_payload(args.payload))
    output.parent.mkdir(parents=True, exist_ok=True)
    temp_name = None
    try:
        with tempfile.NamedTemporaryFile(
            "w", encoding="utf-8", dir=output.parent, prefix=f".{output.name}.", delete=False
        ) as temp:
            temp.write(result)
            temp_name = temp.name
        os.replace(temp_name, output)
    except OSError as error:
        if temp_name:
            try:
                os.unlink(temp_name)
            except OSError:
                pass
        fail(f"cannot write {output}: {error}")
    print(f"Harness author payload applied -> {output}")


if __name__ == "__main__":
    main()
