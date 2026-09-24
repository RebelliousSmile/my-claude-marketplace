#!/usr/bin/env python3
"""Rendered geometry/visibility checks for canonical wireframes."""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import sys
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import url2pathname

NAV_TIMEOUT_MS = 20000


def intersects(a: dict, b: dict, tolerance: float = 0.5) -> bool:
    return min(a["right"], b["right"]) - max(a["left"], b["left"]) > tolerance and min(a["bottom"], b["bottom"]) - max(a["top"], b["top"]) > tolerance


def inside(inner: dict, outer: dict, tolerance: float = 1.0) -> bool:
    return inner["left"] >= outer["left"] - tolerance and inner["right"] <= outer["right"] + tolerance and inner["top"] >= outer["top"] - tolerance and inner["bottom"] <= outer["bottom"] + tolerance


def request_allowed(url: str, root: Path) -> bool:
    """The board is a standalone local file: it may load itself and assets beside it, and
    nothing else. This, not a Chromium sandbox, is what keeps the rendered page off the
    network and away from the rest of the disk."""
    parsed = urlparse(url)
    if parsed.scheme in ("data", "blob", "about"):
        return True
    if parsed.scheme != "file" or parsed.netloc not in ("", "localhost"):
        return False
    try:
        Path(url2pathname(parsed.path)).resolve().relative_to(root)
    except (ValueError, OSError):
        return False
    return True


def _static_lint(path: Path, report_path: Path) -> int:
    """Runs the static lint in this interpreter: same arguments, report and exit code as its
    command line, without paying a second Python start-up per board."""
    script = Path(__file__).resolve().parents[2] / "tools" / "wireframes-lint.py"
    spec = importlib.util.spec_from_file_location("wireframes_lint", script)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.main([str(path), "--report", str(report_path)])


def _browser_check(path: Path, executable: str | None) -> tuple[list[dict], list[str]]:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError as exc:
        raise RuntimeError("Playwright 1.60.0 is required; install adapters/measure/requirements.txt") from exc
    errors: list[dict] = []
    blocked: list[str] = []
    root = path.parent.resolve()

    def guard(route) -> None:
        url = route.request.url
        if request_allowed(url, root):
            route.continue_()
        else:
            blocked.append(url)
            route.abort()

    with sync_playwright() as pw:
        launch = {"headless": True}
        if executable:
            launch["executable_path"] = executable
        try:
            browser = pw.chromium.launch(**launch)
        except Exception as exc:
            raise RuntimeError(f"Chromium cannot start: {exc}") from exc
        try:
            page = browser.new_page(viewport={"width": 1920, "height": 1080})
            page.route("**/*", guard)
            page.goto(path.as_uri(), wait_until="load", timeout=NAV_TIMEOUT_MS)
            page.add_style_tag(content="*,*::before,*::after{animation:none!important;transition:none!important}")
            page.evaluate("() => document.fonts && document.fonts.ready")
            observed = page.evaluate("""() => {
              const manifest = JSON.parse(document.getElementById('wireframe-manifest').textContent);
              const rows = [];
              for (const unit of manifest.units) {
                const unitNode = document.querySelector(`[data-wireframe-unit="${unit.id}"]`);
                for (const state of unit.states) {
                  const stateNode = unitNode && unitNode.querySelector(`[data-wireframe-state="${state.id}"]`);
                  const frames = stateNode ? Array.from(stateNode.querySelectorAll('[data-wireframe-viewport]')) : [];
                  for (const frame of frames) {
                    const viewport = frame.dataset.wireframeViewport;
                    const canvas = frame.querySelector('[data-wireframe-canvas]');
                    const boxes = {};
                    for (const id of state.elementIds) {
                      const el = canvas && canvas.querySelector(`[data-wireframe-element="${id}"]`);
                      if (!el) { boxes[id] = null; continue; }
                      const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
                      boxes[id] = {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,
                        visible:cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) !== 0 && r.width > 0 && r.height > 0};
                    }
                    const c = canvas && canvas.getBoundingClientRect();
                    rows.push({unit:unit.id,state:state.id,viewport,frameWidth:frame.getBoundingClientRect().width,
                      canvas:c && {left:c.left,right:c.right,top:c.top,bottom:c.bottom},
                      overflow:canvas ? canvas.scrollWidth - canvas.clientWidth : null, boxes});
                  }
                }
              }
              return {manifest, rows};
            }""")
        finally:
            browser.close()
    manifest = observed["manifest"]
    units = {u["id"]: u for u in manifest["units"]}
    states = {(u["id"], s["id"]): s for u in manifest["units"] for s in u["states"]}
    for row in observed["rows"]:
        unit, state = units[row["unit"]], states[(row["unit"], row["state"])]
        location = {"unit": row["unit"], "state": row["state"], "viewport": row["viewport"]}
        expected_width = 1440 if row["viewport"] == "desktop" else 390 if row["viewport"] == "mobile" else unit.get("containerWidth", row["frameWidth"])
        if abs(row["frameWidth"] - expected_width) > 1:
            errors.append({"rule": "frame-width", "message": "rendered frame width differs from contract", **location, "expected": expected_width, "observed": row["frameWidth"]})
        if row["overflow"] is not None and row["overflow"] > 1:
            errors.append({"rule": "horizontal-overflow", "message": "canvas scrollWidth exceeds clientWidth", **location, "pixels": row["overflow"], "frameWidth": row["frameWidth"], "canvas": row["canvas"]})
        for element_id, box in row["boxes"].items():
            if box is None or not box["visible"]:
                errors.append({"rule": "element-hidden", "message": "declared element is not visibly rendered", **location, "element": element_id, "box": box})
            elif row["canvas"] and not inside(box, row["canvas"]):
                errors.append({"rule": "element-clipped", "message": "declared element leaves its canvas", **location, "element": element_id, "box": box})
        parents = {e["id"]: e.get("parent") for e in unit["elements"]}
        allowed = {tuple(sorted(pair)) for pair in state.get("allowedOverlaps", [])}
        ids = state["elementIds"]
        for index, left in enumerate(ids):
            for right in ids[index + 1 :]:
                if parents.get(left) != parents.get(right):
                    continue
                a, b = row["boxes"].get(left), row["boxes"].get(right)
                if a and b and a["visible"] and b["visible"] and intersects(a, b) and tuple(sorted((left, right))) not in allowed:
                    errors.append({"rule": "element-collision", "message": "peer elements overlap without allowedOverlaps", **location, "elements": [left, right], "boxes": {left: a, right: b}})
    return errors, blocked


def main() -> int:
    parser = argparse.ArgumentParser(description="Rendered checks for a canonical wireframe")
    parser.add_argument("file")
    parser.add_argument("--report", required=True)
    parser.add_argument("--static-report")
    parser.add_argument("--chromium", default=os.environ.get("WIREFRAMES_CHROMIUM"))
    args = parser.parse_args()
    path = Path(args.file).resolve()
    if not path.is_file():
        print(f"Error: unreadable wireframe: {path}", file=sys.stderr)
        return 2
    static_report = Path(args.static_report).resolve() if args.static_report else Path(args.report).resolve().with_suffix(".static.json")
    static_exit = _static_lint(path, static_report)
    if static_exit != 0:
        print(f"Error: static lint must pass before rendered checks (exit {static_exit})", file=sys.stderr)
        return 2 if static_exit == 2 else 1
    try:
        errors, blocked = _browser_check(path, args.chromium)
    except RuntimeError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 2
    result = {
        "schemaVersion": 1,
        "file": str(path),
        "static": {"status": "passed", "report": str(static_report)},
        "rendered": {"status": "passed" if not errors else "failed", "errors": errors,
                     "blockedRequests": blocked},
        "review": {"status": "required"},
        "summary": {"validCandidate": not errors, "errorCount": len(errors)}
    }
    Path(args.report).write_text(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8", newline="\n")
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
