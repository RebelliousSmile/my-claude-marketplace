#!/usr/bin/env python3
"""Build an atomic, review-bound wireframe handoff for design:harness."""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import tempfile
from pathlib import Path

from _common import sha256_hex
from wireframes_common import green, targets_artifact


class HandoffError(ValueError): pass


def load_json(path: Path) -> dict:
    try: value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc: raise HandoffError(f"cannot read {path}: {exc}") from exc
    if not isinstance(value, dict): raise HandoffError(f"{path} must contain a JSON object")
    return value


def extract_manifest(html: str) -> dict:
    found = re.findall(r'<script[^>]*id=["\']wireframe-manifest["\'][^>]*>([\s\S]*?)</script>', html, re.I)
    if len(found) != 1: raise HandoffError("artifact must contain exactly one wireframe manifest")
    try: return json.loads(found[0])
    except json.JSONDecodeError as exc: raise HandoffError(f"invalid embedded manifest: {exc}") from exc


def extract_state(html: str, unit: str, state: str) -> str:
    pattern = rf"<!-- AUTHOR STATE {re.escape(unit)} {re.escape(state)} (desktop|mobile|intrinsic) -->([\s\S]*?)<!-- END AUTHOR STATE {re.escape(unit)} {re.escape(state)} \1 -->"
    matches = re.findall(pattern, html)
    if not matches: raise HandoffError(f"missing author body for {unit}/{state}")
    preferred = next((body for viewport, body in matches if viewport == "desktop"), matches[0][1])
    return preferred.strip()


def extract_styles(html: str) -> str:
    match = re.search(r"/\* ===== AUTHOR STYLES — LLM MAY EDIT BETWEEN THESE MARKERS ===== \*/([\s\S]*?)/\* ===== END AUTHOR STYLES ===== \*/", html)
    if not match: raise HandoffError("missing governed author styles")
    return match.group(1).strip()


def verify_receipt(receipt: dict, artifact: Path, static_path: Path, rendered_path: Path) -> None:
    if receipt.get("status") != "accepted": raise HandoffError("review receipt is absent, revoked, or not accepted")
    for key, path in (("artifact", artifact), ("staticReport", static_path), ("renderedReport", rendered_path)):
        expected = receipt.get(key, {}).get("sha256")
        if not expected or expected != sha256_hex(path): raise HandoffError(f"review receipt is stale for {key}")


def build(manifest: dict, html: str, artifact_digest: str, tablet: str) -> tuple[dict, dict, dict]:
    pages, bodies, helpers, state_inventory, fragment_mappings = [], {}, [], [], []
    page_ids = {u.get("id") for u in manifest.get("units", []) if u.get("type") == "page"}
    for unit in manifest.get("units", []):
        uid, kind = unit.get("id"), unit.get("type")
        if kind != "page":
            if unit.get("parentPage") not in page_ids or not str(unit.get("parentZone", "")).strip():
                raise HandoffError(f"unit {uid}: fragment/component needs explicit parentPage and parentZone")
            fragment_mappings.append({"unit": uid, "parentPage": unit["parentPage"], "parentZone": unit["parentZone"]})
            continue
        harness = unit.get("harness")
        if not isinstance(harness, dict) or not harness.get("key"): raise HandoffError(f"page {uid}: harness metadata is required")
        page = {"key": harness["key"], "label": harness.get("label") or unit.get("title") or harness["key"]}
        for field in ("group", "route", "source", "theme"):
            if harness.get(field): page[field] = harness[field]
        pages.append(page)
        bodies[harness["key"]] = extract_state(html, uid, unit["initialState"])
        non_initial = {state["id"] for state in unit.get("states", []) if state.get("id") != unit.get("initialState")}
        dispositions = harness.get("stateDispositions")
        if not isinstance(dispositions, list): raise HandoffError(f"page {uid}: stateDispositions must be a list")
        by_state = {entry.get("state"): entry for entry in dispositions if isinstance(entry, dict)}
        if set(by_state) != non_initial or len(by_state) != len(dispositions): raise HandoffError(f"page {uid}: every non-initial state needs exactly one disposition")
        transitions = {(t.get("to"), t.get("trigger")) for t in unit.get("transitions", [])}
        for state_id in sorted(non_initial):
            entry = by_state[state_id]
            disposition = entry.get("disposition")
            if disposition == "unresolved": raise HandoffError(f"page {uid} state {state_id}: unresolved disposition")
            if disposition in {"reference-only", "omitted"} and not str(entry.get("reason", "")).strip():
                raise HandoffError(f"page {uid} state {state_id}: {disposition} requires a reason")
            if disposition == "retained-interactive":
                if not str(entry.get("afterRender", "")).strip() or not any(target == state_id and trigger for target, trigger in transitions):
                    raise HandoffError(f"page {uid} state {state_id}: retained-interactive requires transition and afterRender")
                helpers.append(entry["afterRender"].strip())
            elif disposition not in {"reference-only", "omitted"}:
                raise HandoffError(f"page {uid} state {state_id}: invalid disposition")
            state_inventory.append({"unit": uid, **entry})
    if not pages: raise HandoffError("handoff contains no page unit")
    link = {"artifactSha256": artifact_digest}
    pages_json = {"schemaVersion": 1, **link, "pages": pages}
    payload = {"schemaVersion": 1, **link, "pages": bodies, "styles": extract_styles(html), "sharedHelpers": "", "afterRender": "\n\n".join(helpers)}
    handoff = {"schemaVersion": 1, **link, "tabletPolicy": tablet, "invokeHarness": tablet != "defer", "states": state_inventory, "fragmentMappings": fragment_mappings}
    return pages_json, payload, handoff


def write_bundle(directory: Path, values: tuple[dict, dict, dict]) -> None:
    if directory.exists(): raise HandoffError("output directory must not already exist")
    directory.parent.mkdir(parents=True, exist_ok=True)
    temporary = Path(tempfile.mkdtemp(prefix=f".{directory.name}.", dir=directory.parent))
    try:
        for name, value in zip(("pages.json", "migration-payload.json", "handoff.json"), values):
            (temporary / name).write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8", newline="\n")
        os.replace(temporary, directory)
    except Exception:
        for child in temporary.iterdir(): child.unlink()
        temporary.rmdir()
        raise


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    for flag in ("artifact", "static-report", "rendered-report", "receipt", "out-dir"):
        parser.add_argument(f"--{flag}", required=True)
    parser.add_argument("--tablet-policy", required=True, choices=["desktop-derived", "mobile-derived", "defer"])
    args = parser.parse_args()
    try:
        artifact, static_path, rendered_path = Path(args.artifact).resolve(), Path(args.static_report).resolve(), Path(args.rendered_report).resolve()
        receipt, static, rendered = load_json(Path(args.receipt)), load_json(static_path), load_json(rendered_path)
        if not green(static, rendered): raise HandoffError("static and rendered reports must both be green")
        if not targets_artifact(static, artifact) or not targets_artifact(rendered, artifact): raise HandoffError("reports do not target the exact artifact")
        verify_receipt(receipt, artifact, static_path, rendered_path)
        html = artifact.read_text(encoding="utf-8")
        values = build(extract_manifest(html), html, receipt["artifact"]["sha256"], args.tablet_policy)
        write_bundle(Path(args.out_dir).resolve(), values)
        print(Path(args.out_dir).resolve()); return 0
    except (HandoffError, OSError, UnicodeError) as exc:
        print(f"Error: {exc}", file=sys.stderr); return 2


if __name__ == "__main__":
    raise SystemExit(main())
