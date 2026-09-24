#!/usr/bin/env python3
"""Static validator for canonical design wireframe HTML."""
from __future__ import annotations

import argparse
import importlib.util
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GENERATOR = ROOT / "adapters" / "wireframes" / "wireframes.py"


def load_generator():
    spec = importlib.util.spec_from_file_location("design_wireframes_generator", GENERATOR)
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load wireframe generator validation")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class Scan(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[tuple[str, dict[str, str | None], dict[str, str | None]]] = []
        self.manifest_chunks: list[str] = []
        self.in_manifest = False
        self.styles: list[str] = []
        self.in_style = False
        self.external: list[str] = []
        self.elements: list[dict] = []
        self.annotations: list[dict] = []
        self.annotation_stack: list[dict] = []
        self.text_chunks: list[str] = []
        self.units: set[str] = set()
        self.states: set[tuple[str, str]] = set()
        self.viewports: set[tuple[str, str, str]] = set()
        self.primary: set[tuple[str, str, str, str]] = set()
        self.placeholders = 0

    def handle_starttag(self, tag: str, attrs_list: list[tuple[str, str | None]]) -> None:
        attrs = dict(attrs_list)
        inherited = dict(self.stack[-1][2]) if self.stack else {"unit": None, "state": None, "viewport": None}
        context = inherited
        if attrs.get("data-wireframe-unit"):
            context["unit"] = attrs["data-wireframe-unit"]
            self.units.add(str(context["unit"]))
        if attrs.get("data-wireframe-state"):
            context["state"] = attrs["data-wireframe-state"]
            if context["unit"]:
                self.states.add((str(context["unit"]), str(context["state"])))
        if attrs.get("data-wireframe-viewport"):
            context["viewport"] = attrs["data-wireframe-viewport"]
            if context["unit"] and context["state"]:
                self.viewports.add((str(context["unit"]), str(context["state"]), str(context["viewport"])))
        if "wireframe-placeholder" in (attrs.get("class") or "").split():
            self.placeholders += 1
        self.stack.append((tag, attrs, context))
        if tag == "script" and attrs.get("id") == "wireframe-manifest" and attrs.get("type") == "application/json":
            self.in_manifest = True
        if tag == "style":
            self.in_style = True
        element_id = attrs.get("data-wireframe-element")
        if element_id:
            row = {**context, "id": element_id, "tag": tag, "attrs": attrs}
            self.elements.append(row)
            if attrs.get("data-wireframe-primary") == "true" and all(context.values()):
                self.primary.add((str(context["unit"]), str(context["state"]), str(context["viewport"]), str(element_id)))
        if "data-wireframe-annotation" in attrs:
            annotation = {**context, "tag": tag, "text": "", "depth": len(self.stack)}
            self.annotations.append(annotation)
            self.annotation_stack.append(annotation)
        self._external(tag, attrs)

    def _external(self, tag: str, attrs: dict[str, str | None]) -> None:
        if tag == "script" and attrs.get("src"):
            self.external.append(f"script src={attrs['src']}")
        if tag == "link" and (attrs.get("rel") or "").lower() == "stylesheet":
            self.external.append(f"stylesheet href={attrs.get('href', '')}")
        resource_attrs = {"img": ["src", "srcset"], "source": ["src", "srcset"], "video": ["src", "poster"], "audio": ["src"], "iframe": ["src"]}
        for name in resource_attrs.get(tag, []):
            value = attrs.get(name)
            if value and not value.startswith("data:"):
                self.external.append(f"{tag} {name}={value}")

    def handle_endtag(self, tag: str) -> None:
        if tag == "script" and self.in_manifest:
            self.in_manifest = False
        if tag == "style":
            self.in_style = False
        if self.annotation_stack and self.annotation_stack[-1]["tag"] == tag:
            self.annotation_stack.pop()
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] == tag:
                del self.stack[index:]
                break

    def handle_data(self, data: str) -> None:
        if self.in_manifest:
            self.manifest_chunks.append(data)
        elif self.in_style:
            self.styles.append(data)
        else:
            value = " ".join(data.split())
            if value:
                self.text_chunks.append(value)
                if self.annotation_stack:
                    annotation = self.annotation_stack[-1]
                    annotation["text"] += (" " if annotation["text"] else "") + value


def finding(rule: str, message: str, **details) -> dict:
    return {"rule": rule, "message": message, **details}


def lint_text(text: str, path: Path) -> dict:
    errors: list[dict] = []
    warnings: list[dict] = []
    scan = Scan()
    try:
        scan.feed(text)
        scan.close()
    except Exception as exc:
        return report(path, [finding("html-parse", f"HTML cannot be parsed: {exc}")], warnings, None)
    if not re.match(r"\s*<!doctype html>", text, re.I):
        errors.append(finding("canonical-doctype", "canonical doctype is missing"))
    if text.count('id="wireframe-manifest"') != 1:
        errors.append(finding("manifest-count", "exactly one embedded manifest is required"))
    try:
        manifest = json.loads("".join(scan.manifest_chunks))
        generator = load_generator()
        generator.validate_manifest(manifest)
    except Exception as exc:
        return report(path, errors + [finding("manifest-invalid", str(exc))], warnings, None)
    if scan.placeholders:
        errors.append(finding("unfilled-placeholder", "generated author placeholder remains"))
    for dependency in sorted(set(scan.external)):
        errors.append(finding("external-resource", "standalone HTML cannot depend on an external resource", dependency=dependency))
    css = "\n".join(scan.styles)
    if re.search(r"@import\s", css, re.I):
        errors.append(finding("external-css-import", "CSS @import is forbidden"))
    for url in re.findall(r"url\(([^)]+)\)", css, re.I):
        clean = url.strip(" \t\r\n\"'")
        if clean and not clean.startswith("data:") and not clean.startswith("#"):
            errors.append(finding("external-css-url", "CSS display resources must be embedded", value=clean))
    expected_viewports = ["desktop", "mobile"] if "responsive" in manifest["pillars"] else None
    element_rows = {(str(e["unit"]), str(e["state"]), str(e["viewport"]), str(e["id"])) for e in scan.elements if all((e["unit"], e["state"], e["viewport"]))}
    duplicate_rows = [row for row in element_rows if sum(1 for e in scan.elements if (str(e["unit"]), str(e["state"]), str(e["viewport"]), str(e["id"])) == row) > 1]
    for row in sorted(duplicate_rows):
        errors.append(finding("element-duplicate", "element appears more than once in one rendered frame", unit=row[0], state=row[1], viewport=row[2], element=row[3]))
    for unit in manifest["units"]:
        uid = unit["id"]
        if uid not in scan.units:
            errors.append(finding("unit-missing", "declared unit is absent", unit=uid))
        viewports = expected_viewports or [unit["context"]]
        for state in unit["states"]:
            sid = state["id"]
            if (uid, sid) not in scan.states:
                errors.append(finding("state-missing", "declared state is absent", unit=uid, state=sid))
            for viewport in viewports:
                if (uid, sid, viewport) not in scan.viewports:
                    errors.append(finding("viewport-missing", "declared viewport is absent", unit=uid, state=sid, viewport=viewport))
                for element_id in state["elementIds"]:
                    if (uid, sid, viewport, element_id) not in element_rows:
                        errors.append(finding("element-missing", "declared element is absent from rendered frame", unit=uid, state=sid, viewport=viewport, element=element_id))
                primary = unit.get("primaryAction")
                if primary and primary in state["elementIds"] and (uid, sid, viewport, primary) not in scan.primary:
                    errors.append(finding("primary-unmarked", "primary action must carry data-wireframe-primary=true", unit=uid, state=sid, viewport=viewport, element=primary))
        annotations = [a for a in scan.annotations if a["unit"] == uid]
        if len(annotations) > 2:
            errors.append(finding("annotation-count", "a unit may contain at most two annotations", unit=uid, count=len(annotations)))
        for annotation in annotations:
            if len(annotation["text"]) > 60:
                errors.append(finding("annotation-length", "annotation exceeds 60 characters", unit=uid, length=len(annotation["text"])))
            if annotation["tag"] in {"p", "ul", "ol"}:
                errors.append(finding("annotation-shape", "annotation cannot be a paragraph or list", unit=uid))
        if "existing-context" in manifest["pillars"] and not any(s.get("showsExistingContext") for s in unit["states"]):
            errors.append(finding("existing-context-state", "one state must show existing context", unit=uid))
    if "representative-content" in manifest["pillars"]:
        joined = " ".join(scan.text_chunks)
        if re.search(r"\blorem ipsum\b|\b(?:titre|texte|title|text)\b", joined, re.I):
            errors.append(finding("representative-content", "generic placeholder content is forbidden"))
    return report(path, errors, warnings, manifest)


def report(path: Path, errors: list[dict], warnings: list[dict], manifest: dict | None) -> dict:
    return {
        "schemaVersion": 1,
        "file": str(path),
        "manifestValid": manifest is not None,
        "applicable": ["format", "mandatory-core"] + ([] if manifest is None else list(manifest.get("pillars", []))),
        "errors": errors,
        "warnings": warnings,
        "summary": {"valid": not errors, "errorCount": len(errors), "warningCount": len(warnings)},
    }


def safe_fix(text: str, result: dict, manifest: dict) -> tuple[str, list[str]]:
    fixed = text
    applied: list[str] = []
    declared = {e["id"] for unit in manifest["units"] for e in unit["elements"]}
    missing = [e for e in result["errors"] if e["rule"] == "element-missing"]
    for error in missing:
        element_id = error["element"]
        if element_id not in declared:
            continue
        start = f"<!-- AUTHOR STATE {error['unit']} {error['state']} {error['viewport']} -->"
        end = f"<!-- END AUTHOR STATE {error['unit']} {error['state']} {error['viewport']} -->"
        block_pattern = re.compile(re.escape(start) + r"([\s\S]*?)" + re.escape(end))
        block_match = block_pattern.search(fixed)
        if not block_match:
            continue
        block = block_match.group(1)
        tag_pattern = re.compile(rf'(<[a-zA-Z][^>]*\bid="{re.escape(element_id)}"(?![^>]*data-wireframe-element)[^>]*)(>)')
        if len(tag_pattern.findall(block)) == 1:
            repaired = tag_pattern.sub(rf'\1 data-wireframe-element="{element_id}"\2', block, count=1)
            fixed = fixed[: block_match.start(1)] + repaired + fixed[block_match.end(1) :]
            applied.append(f"data-wireframe-element:{error['unit']}:{error['state']}:{error['viewport']}:{element_id}")
    return fixed, applied


def main() -> int:
    parser = argparse.ArgumentParser(description="Static lint for canonical design wireframes")
    parser.add_argument("file")
    parser.add_argument("--report")
    parser.add_argument("--fix", action="store_true")
    parser.add_argument("--fix-out")
    args = parser.parse_args()
    path = Path(args.file).resolve()
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as exc:
        print(f"Error: cannot read {path}: {exc}", file=sys.stderr)
        return 2
    result = lint_text(text, path)
    if args.fix:
        if not args.fix_out:
            print("Error: --fix requires --fix-out", file=sys.stderr)
            return 2
        try:
            manifest = json.loads("".join(ScanManifest.extract(text)))
            fixed, applied = safe_fix(text, result, manifest)
            out = Path(args.fix_out).resolve()
            if out == path:
                print("Error: --fix-out must differ from input", file=sys.stderr)
                return 2
            out.write_text(fixed, encoding="utf-8", newline="\n")
            result = lint_text(fixed, out)
            result["fixes"] = applied
        except Exception as exc:
            print(f"Error: cannot apply safe fixes: {exc}", file=sys.stderr)
            return 2
    encoded = json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    if args.report:
        Path(args.report).write_text(encoded, encoding="utf-8", newline="\n")
    else:
        sys.stdout.write(encoded)
    return 0 if result["summary"]["valid"] else 1


class ScanManifest(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.active = False
        self.chunks: list[str] = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == "script" and values.get("id") == "wireframe-manifest":
            self.active = True

    def handle_endtag(self, tag):
        if tag == "script" and self.active:
            self.active = False

    def handle_data(self, data):
        if self.active:
            self.chunks.append(data)

    @classmethod
    def extract(cls, text: str) -> list[str]:
        parser = cls()
        parser.feed(text)
        return parser.chunks


if __name__ == "__main__":
    raise SystemExit(main())
