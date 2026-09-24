#!/usr/bin/env python3
"""Classify and inventory author HTML without modifying it."""
from __future__ import annotations

import argparse
import hashlib
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

from _common import atomic_json

VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
GENERIC_CLASS_TOKENS = {"container", "wrapper", "row", "col", "column"}
TOGGLE_PAIR_RE = re.compile(r'getElementById\(["\']([\w-]+)["\']\)\.classList\.(?:toggle|add|remove)\(["\']([\w-]+)["\']\)')
COMMIT_HASH_RE = re.compile(r"\b[0-9a-f]{7,40}\b")
FILE_PATH_RE = re.compile(r"(?:[\w.-]+/)+[\w.-]+\.\w+")
TICKET_RE = re.compile(r"#\d+|\b[A-Z]+-\d+\b")


def annotation_risk_reasons(text: str) -> list[str]:
    reasons = []
    if len(text) > 60: reasons.append("length")
    if COMMIT_HASH_RE.search(text): reasons.append("commit-hash")
    if FILE_PATH_RE.search(text): reasons.append("file-path")
    if TICKET_RE.search(text): reasons.append("ticket-reference")
    return reasons


class InventoryParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.tags: list[str] = []
        self.styles = 0
        self.scripts = 0
        self.resources: list[dict] = []
        self.external: list[str] = []
        self.units: list[str] = []
        self.unit_candidates: list[str] = []
        self.states: list[str] = []
        self.annotations = 0
        self.annotation_records: list[tuple[int, str]] = []
        self.ambiguous = False
        self.hidden_interactions: list[str] = []
        # Structural sibling grouping (candidate unit signals, correlated with
        # a script toggle in main() before ever reaching unitCandidates).
        self.structural_groups: dict[str, set[str]] = {}
        self._stack: list[dict] = [{"tag": None, "children": []}]
        self._annotation_stack: list[list] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        self.tags.append(tag)
        if tag == "style": self.styles += 1
        if tag == "script": self.scripts += 1
        if values.get("data-wireframe-unit"): self.units.append(values["data-wireframe-unit"] or "")
        if values.get("data-wireframe-unit-candidate"): self.unit_candidates.append(values["data-wireframe-unit-candidate"] or "")
        if values.get("data-wireframe-state"): self.states.append(values["data-wireframe-state"] or "")
        is_annotation = "data-wireframe-annotation" in values
        if is_annotation: self.annotations += 1
        if "data-wireframe-ambiguous" in values or "data-wireframe-unit-candidate" in values and values.get("data-wireframe-unit-candidate") == "ambiguous":
            self.ambiguous = True
        if "hidden" in values or "display:none" in (values.get("style") or "").replace(" ", "").lower():
            self.hidden_interactions.append(tag)
        resource_fields = {"link": "href", "script": "src", "img": "src", "video": "src", "audio": "src", "source": "src"}
        field = resource_fields.get(tag)
        if field and values.get(field):
            value = values[field] or ""
            self.resources.append({"tag": tag, "attribute": field, "value": value})
            if re.match(r"^(?:https?:)?//", value) or value.startswith("/"):
                self.external.append(value)
        node = {"tag": tag, "classes": set((values.get("class") or "").split()), "id": values.get("id")}
        self._stack[-1]["children"].append(node)
        if is_annotation:
            self._annotation_stack.append([self.annotations, ""])
        if tag not in VOID_TAGS:
            node["children"] = []
            node["is_annotation"] = is_annotation
            self._stack.append(node)

    def handle_endtag(self, tag: str) -> None:
        if len(self._stack) > 1 and self._stack[-1]["tag"] == tag:
            finished = self._stack.pop()
            self._analyze_siblings(finished["children"])
            if finished.get("is_annotation") and self._annotation_stack:
                index, text = self._annotation_stack.pop()
                self.annotation_records.append((index, text))

    def handle_data(self, data: str) -> None:
        if self._annotation_stack:
            self._annotation_stack[-1][1] += data

    def _analyze_siblings(self, children: list[dict]) -> None:
        buckets: dict[tuple[str, str], list[str | None]] = {}
        for child in children:
            for cls in child["classes"] - GENERIC_CLASS_TOKENS:
                buckets.setdefault((child["tag"], cls), []).append(child["id"])
        for (tag, cls), ids in buckets.items():
            if len(ids) >= 2:
                self.structural_groups.setdefault(f"{tag}.{cls}", set()).update(i for i in ids if i)

    def finalize(self) -> None:
        """Force-close any frame HTMLParser never matched an end tag for, then analyze the root."""
        while len(self._stack) > 1:
            finished = self._stack.pop()
            self._analyze_siblings(finished["children"])
            if finished.get("is_annotation") and self._annotation_stack:
                index, text = self._annotation_stack.pop()
                self.annotation_records.append((index, text))
        self._analyze_siblings(self._stack[0]["children"])


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source")
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    source, output = Path(args.source).resolve(), Path(args.out).resolve()
    if source == output:
        print("Error: inventory output must differ from source", file=sys.stderr); return 2
    try:
        raw = source.read_bytes()
        text = raw.decode("utf-8")
    except (OSError, UnicodeError) as exc:
        print(f"Error: cannot read source: {exc}", file=sys.stderr); return 2
    probe = InventoryParser()
    try: probe.feed(text)
    except Exception as exc:
        print(f"Error: cannot parse source HTML: {exc}", file=sys.stderr); return 2
    probe.finalize()
    if re.search(r"(?:classList\.(?:add|remove|toggle)|\.hidden\s*=|style\.display\s*=)", text):
        probe.hidden_interactions.append("script-driven-visibility")
    canonical = bool(re.search(r'<script[^>]+id=["\']wireframe-manifest["\']', text, re.I) and probe.units)
    if probe.ambiguous:
        classification = "ambiguous"
    elif canonical:
        classification = "canonical-wireframe"
    elif re.search(r"<!doctype\s+html|<html(?:\s|>)", text, re.I):
        classification = "html-document"
    else:
        classification = "html-fragment"
    blocks = []
    for kind, count in (("markup", len(probe.tags)), ("style", probe.styles), ("script", probe.scripts), ("annotation", probe.annotations)):
        if count:
            blocks.append({"id": kind, "count": count, "disposition": "unresolved" if classification == "ambiguous" else "pending-review"})
    # Structural candidates are advisory: a shared tag+class among >=2 siblings is not
    # promoted to unitCandidates unless a script toggle actually references a member id.
    structural_unit_candidates: set[str] = set()
    transition_candidates: list[dict] = []
    seen_pairs: set[tuple[str, str]] = set()
    for element_id, cls in TOGGLE_PAIR_RE.findall(text):
        for fingerprint, member_ids in probe.structural_groups.items():
            if element_id in member_ids:
                structural_unit_candidates.add(fingerprint)
                pair = (element_id, cls)
                if pair not in seen_pairs:
                    seen_pairs.add(pair)
                    transition_candidates.append({"trigger": element_id, "target": cls})
    annotation_risks = []
    for index, raw_text in probe.annotation_records:
        reasons = annotation_risk_reasons(raw_text.strip())
        if reasons:
            annotation_risks.append({"index": index, "reasons": reasons})
    decisions = []
    if classification == "ambiguous": decisions.append("unit-and-state-mapping")
    if probe.resources: decisions.append("resource-dependency-omission")
    if probe.hidden_interactions: decisions.append("hidden-content-interaction")
    if annotation_risks: decisions.append("annotation-contract-risk")
    result = {
        "schemaVersion": 1,
        "source": {"path": str(source), "sha256": hashlib.sha256(raw).hexdigest()},
        "classification": classification,
        "inventory": {
            "blocks": blocks,
            "resources": probe.resources,
            "externalDependencies": sorted(set(probe.external)),
            "unitCandidates": sorted(set(probe.units + probe.unit_candidates) | structural_unit_candidates),
            "transitionCandidates": sorted(transition_candidates, key=lambda pair: (pair["trigger"], pair["target"])),
            "states": sorted(set(probe.states)),
            "annotations": probe.annotations,
            "annotationRisks": annotation_risks,
            "hiddenContentInteractions": probe.hidden_interactions,
        },
        "decisions": decisions,
        "canNormalize": classification != "ambiguous"
    }
    try: atomic_json(output, result)
    except OSError as exc:
        print(f"Error: cannot write inventory: {exc}", file=sys.stderr); return 2
    print(output)
    return 1 if classification == "ambiguous" else 0


if __name__ == "__main__":
    raise SystemExit(main())
