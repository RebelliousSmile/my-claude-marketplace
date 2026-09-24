#!/usr/bin/env python3
"""Generate the canonical standalone design wireframe shell."""
from __future__ import annotations

import argparse
import html
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "tools"))
from _common import atomic_write  # noqa: E402

SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
PILLARS = {"responsive", "representative-content", "existing-context", "brand"}
CONTEXTS = {"responsive", "desktop", "mobile", "intrinsic"}
LANG = re.compile(r"^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{1,8})*$")


class InputError(ValueError):
    pass


def load_manifest(path: Path) -> dict:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise InputError(f"cannot read manifest {path}: {exc}") from exc
    if not isinstance(value, dict):
        raise InputError("manifest root must be an object")
    validate_manifest(value)
    return value


def validate_manifest(manifest: dict) -> None:
    allowed = {"schemaVersion", "title", "lang", "pillars", "references", "units"}
    unknown = sorted(set(manifest) - allowed)
    if unknown:
        raise InputError(f"unknown manifest field(s): {', '.join(unknown)}")
    if manifest.get("schemaVersion") != 1:
        raise InputError("schemaVersion must be 1")
    if not isinstance(manifest.get("title"), str) or not manifest["title"].strip():
        raise InputError("title must be a non-empty string")
    if "lang" in manifest and not (isinstance(manifest["lang"], str) and LANG.match(manifest["lang"])):
        raise InputError("lang must be a BCP 47 language tag such as fr or en-GB")
    pillars = manifest.get("pillars")
    if not isinstance(pillars, list) or len(pillars) != len(set(pillars)) or not set(pillars) <= PILLARS:
        raise InputError("pillars must be a unique list of known values")
    refs = manifest.get("references")
    units = manifest.get("units")
    if not isinstance(refs, list):
        raise InputError("references must be a list")
    if not isinstance(units, list) or not units:
        raise InputError("units must be a non-empty list")
    ref_ids = _unique_ids(refs, "reference")
    unit_ids = _unique_ids(units, "unit")
    for unit in units:
        _validate_unit(unit, set(pillars), ref_ids, unit_ids)


def _unique_ids(items: list, label: str) -> set[str]:
    ids: set[str] = set()
    for index, item in enumerate(items):
        if not isinstance(item, dict):
            raise InputError(f"{label} at index {index} must be an object")
        item_id = item.get("id")
        if not isinstance(item_id, str) or not SLUG.fullmatch(item_id):
            raise InputError(f"{label} at index {index} has invalid id")
        if item_id in ids:
            raise InputError(f"duplicate {label} id: {item_id}")
        ids.add(item_id)
    return ids


def _validate_unit(unit: dict, pillars: set[str], ref_ids: set[str], unit_ids: set[str]) -> None:
    uid = unit["id"]
    if unit.get("type") not in {"page", "fragment", "component"}:
        raise InputError(f"unit {uid}: invalid type")
    context = unit.get("context")
    if context not in CONTEXTS:
        raise InputError(f"unit {uid}: invalid context")
    if "responsive" in pillars and context != "responsive":
        raise InputError(f"unit {uid}: responsive pillar requires responsive context")
    if "responsive" not in pillars and context == "responsive":
        raise InputError(f"unit {uid}: responsive context requires responsive pillar")
    if context == "intrinsic" and not isinstance(unit.get("containerWidth"), int):
        raise InputError(f"unit {uid}: intrinsic context requires containerWidth")
    elements = unit.get("elements")
    states = unit.get("states")
    if not isinstance(elements, list) or not elements or not isinstance(states, list) or not states:
        raise InputError(f"unit {uid}: elements and states must be non-empty lists")
    element_ids = _unique_ids(elements, f"element in {uid}")
    state_ids = _unique_ids(states, f"state in {uid}")
    primary = unit.get("primaryAction")
    if primary is not None and primary not in element_ids:
        raise InputError(f"unit {uid}: primaryAction does not resolve")
    if unit.get("initialState") not in state_ids:
        raise InputError(f"unit {uid}: initialState does not resolve")
    parents = {e["id"]: e.get("parent") for e in elements}
    for state in states:
        present = state.get("elementIds")
        if not isinstance(present, list) or not present or not set(present) <= element_ids:
            raise InputError(f"unit {uid} state {state['id']}: elementIds do not resolve")
        for pair in state.get("allowedOverlaps", []):
            if not isinstance(pair, list) or len(pair) != 2 or pair[0] == pair[1] or not set(pair) <= set(present):
                raise InputError(f"unit {uid} state {state['id']}: invalid allowedOverlaps")
            if parents.get(pair[0]) != parents.get(pair[1]):
                raise InputError(f"unit {uid} state {state['id']}: overlap elements must be peers")
    for transition in unit.get("transitions", []):
        if transition.get("from") not in state_ids or transition.get("to") not in state_ids:
            raise InputError(f"unit {uid}: transition state does not resolve")
        if transition.get("controlId") not in element_ids or not str(transition.get("trigger", "")).strip():
            raise InputError(f"unit {uid}: transition control/trigger is invalid")
    for field in ("contextReferenceIds", "brandReferenceIds"):
        if not set(unit.get(field, [])) <= ref_ids:
            raise InputError(f"unit {uid}: {field} contains an unknown reference")
    if "representative-content" in pillars and not unit.get("contentScenarios"):
        raise InputError(f"unit {uid}: representative-content requires contentScenarios")
    if "existing-context" in pillars and not unit.get("contextReferenceIds"):
        raise InputError(f"unit {uid}: existing-context requires contextReferenceIds")
    if "brand" in pillars and not unit.get("brandReferenceIds"):
        raise InputError(f"unit {uid}: brand requires brandReferenceIds")
    if unit.get("type") != "page" and (unit.get("parentPage") and unit["parentPage"] not in unit_ids):
        raise InputError(f"unit {uid}: parentPage does not resolve")


def _frames(unit: dict, responsive: bool) -> list[tuple[str, str]]:
    if responsive:
        return [("desktop", "1440px"), ("mobile", "390px")]
    context = unit["context"]
    width = f"{unit['containerWidth']}px" if context == "intrinsic" else ("1440px" if context == "desktop" else "390px")
    return [(context, width)]


def render(manifest: dict) -> str:
    title = html.escape(manifest["title"])
    lang = html.escape(manifest.get("lang", "fr"))
    # The manifest is agent-written and inlined in a <script> block: `</script>` in a title
    # would close it. JSON escapes keep the value identical once parsed.
    manifest_json = (
        json.dumps(manifest, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        .replace("&", "\\u0026").replace("<", "\\u003c").replace(">", "\\u003e")
    )
    sections: list[str] = []
    responsive = "responsive" in manifest["pillars"]
    for unit in manifest["units"]:
        states: list[str] = []
        for state in unit["states"]:
            frames: list[str] = []
            for viewport, width in _frames(unit, responsive):
                marker = f"AUTHOR STATE {unit['id']} {state['id']} {viewport}"
                frames.append(
                    f'<div class="wireframe-frame" data-wireframe-viewport="{viewport}" style="--wireframe-width:{width}">'
                    f'<div class="wireframe-canvas" data-wireframe-canvas="{unit["id"]}:{state["id"]}:{viewport}">'
                    f'<!-- {marker} --><div class="wireframe-placeholder">À composer</div><!-- END {marker} -->'
                    "</div></div>"
                )
            states.append(
                f'<section class="wireframe-state" data-wireframe-state="{state["id"]}">'
                f'<h3>{html.escape(state.get("label") or state["id"])}</h3><div class="wireframe-frames">{"".join(frames)}</div></section>'
            )
        sections.append(
            f'<section class="wireframe-unit" data-wireframe-unit="{unit["id"]}" data-wireframe-type="{unit["type"]}">'
            f'<h2>{html.escape(unit["title"])}</h2>{"".join(states)}</section>'
        )
    return f'''<!doctype html>
<html lang="{lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{title}</title>
  <style>
    :root{{--board-bg:#eef0f3;--ink:#20242a;--line:#858d99;--paper:#fff}}
    *{{box-sizing:border-box}} html{{font-family:Arial,sans-serif;color:var(--ink);background:var(--board-bg)}}
    body{{margin:0;padding:24px}} header{{max-width:1440px;margin:0 auto 24px}} h1,h2,h3{{margin:0 0 12px}}
    .wireframe-unit{{max-width:1488px;margin:0 auto 32px;padding:16px;border:1px solid var(--line);background:var(--paper)}}
    .wireframe-state{{margin-top:20px}} .wireframe-frames{{display:flex;gap:20px;align-items:flex-start;overflow-x:auto}}
    .wireframe-frame{{width:var(--wireframe-width);min-width:min(var(--wireframe-width),100%);max-width:100%;border:1px solid var(--line);background:var(--paper)}}
    .wireframe-frame::before{{content:attr(data-wireframe-viewport);display:block;padding:6px 10px;border-bottom:1px solid var(--line);font-size:12px;text-transform:uppercase}}
    .wireframe-canvas{{width:100%;min-height:180px;padding:16px;overflow-x:hidden}} .wireframe-placeholder{{padding:32px;border:1px dashed var(--line);text-align:center;color:#68707a}}
    [data-wireframe-annotation]{{font-size:12px}}
    /* ===== AUTHOR STYLES — LLM MAY EDIT BETWEEN THESE MARKERS ===== */
    /* ===== END AUTHOR STYLES ===== */
  </style>
</head>
<body>
  <header><h1>{title}</h1></header>
  <main>{''.join(sections)}</main>
  <script id="wireframe-manifest" type="application/json">{manifest_json}</script>
  <script>
    /* ===== AUTHOR INTERACTIONS — OPTIONAL HELPERS ONLY ===== */
    /* ===== END AUTHOR INTERACTIONS ===== */
  </script>
</body>
</html>
'''


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate a canonical design wireframe board")
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    try:
        manifest_path = Path(args.manifest).resolve()
        out = Path(args.out).resolve()
        if manifest_path == out:
            raise InputError("output must differ from manifest input")
        atomic_write(out, render(load_manifest(manifest_path)))
        print(out)
        return 0
    except InputError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 2
    except OSError as exc:
        print(f"Error: cannot write output: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
