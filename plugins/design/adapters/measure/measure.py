#!/usr/bin/env python3
"""Fidelity oracle — compares computed styles between a mockup and a target render,
per breakpoint, property by property. Deterministic: same inputs -> same numbers
(the numbers come from Chromium via Playwright, not from an LLM).

Two modes:
  B (default) — diff a mockup page against a target render (mockup<->target).
  A           — extract computed styles from a single side (seed a greenfield contract).

The mockup may be an SPA exposing window.setPage()/window.setViewport() (mauceri v2);
those hooks are called when present. Output is a per-breakpoint JSON report written
in UTF-8 (avoids console encoding loss); a short summary is printed to stdout.

Usage:
  python measure.py --config configs/mentions-legales.json --out out/mentions-legales.json
  python measure.py --config <cfg> --mode A --side wp --out <file>

Config (JSON):
  {
    "maquette_url": "...", "maquette_page": "<setPage key|null>",
    "wp_url": "...",
    "breakpoints": [{"name":"desktop","width":1440,"height":900,"maq_viewport":"desktop"}],
    "props": ["fontSize", ...],
    "targets": [{"name":"Hero · title","maq":"<sel>","wp":"<sel>"}]
  }
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from playwright.sync_api import sync_playwright

# JS injected to read getComputedStyle for each target on the current page.
_GRAB = """(args) => {
  const { targets, props, side } = args;
  const out = {};
  for (const t of targets) {
    const sel = t[side];
    const el = sel ? document.querySelector(sel) : null;
    if (!el) { out[t.name] = { __missing: sel || null }; continue; }
    const cs = getComputedStyle(el);
    const o = {};
    for (const p of props) o[p] = cs[p];
    out[t.name] = o;
  }
  return out;
}"""


def _prepare_mockup(page, page_key, maq_viewport):
    """Drive the SPA mockup: set its viewport mode + page, hide preview chrome."""
    if maq_viewport:
        page.evaluate("(v) => window.setViewport && window.setViewport(v)", maq_viewport)
    if page_key:
        page.evaluate("(k) => window.setPage && window.setPage(k)", page_key)
    page.evaluate("() => { const b = document.querySelector('.preview-bar'); if (b) b.style.display = 'none'; }")
    page.wait_for_timeout(400)


def _grab(page, targets, props, side):
    return page.evaluate(_GRAB, {"targets": targets, "props": props, "side": side})


def measure(cfg: dict, mode: str, side: str) -> dict:
    report: dict = {"mode": mode, "maquette_page": cfg.get("maquette_page"), "breakpoints": {}}
    props = cfg["props"]
    targets = cfg["targets"]

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        try:
            for bp in cfg["breakpoints"]:
                ctx = browser.new_context(viewport={"width": bp["width"], "height": bp["height"]})
                try:
                    maq = wp = None
                    if mode == "B" or side == "maq":
                        m = ctx.new_page()
                        m.goto(cfg["maquette_url"], wait_until="networkidle", timeout=20000)
                        _prepare_mockup(m, cfg.get("maquette_page"), bp.get("maq_viewport"))
                        maq = _grab(m, targets, props, "maq")
                    if mode == "B" or side == "wp":
                        w = ctx.new_page()
                        w.goto(cfg["wp_url"], wait_until="networkidle", timeout=20000)
                        w.wait_for_timeout(300)
                        wp = _grab(w, targets, props, "wp")
                finally:
                    ctx.close()

                rows = []
                for t in targets:
                    name = t["name"]
                    if mode == "A":
                        src = maq if side == "maq" else wp
                        v = src[name]
                        rows.append({"element": name, "missing": v["__missing"]} if "__missing" in v
                                    else {"element": name, "values": v})
                        continue
                    m_v, w_v = maq[name], wp[name]
                    if "__missing" in m_v or "__missing" in w_v:
                        rows.append({"element": name,
                                     "missing": {"maquette": m_v.get("__missing", False) if "__missing" in m_v else None,
                                                 "wp": w_v.get("__missing", False) if "__missing" in w_v else None}})
                        continue
                    for p in props:
                        rows.append({"element": name, "prop": p,
                                     "maquette": m_v[p], "local": w_v[p], "match": m_v[p] == w_v[p]})
                report["breakpoints"][bp["name"]] = rows
        finally:
            browser.close()
    return report


def _summarize(report: dict) -> str:
    lines = []
    for bp, rows in report["breakpoints"].items():
        diffs = sum(1 for r in rows if r.get("match") is False)
        oks = sum(1 for r in rows if r.get("match") is True)
        missing = sum(1 for r in rows if "missing" in r)
        lines.append(f"  {bp:8s} : {oks} match · {diffs} diff · {missing} missing")
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser(description="Fidelity oracle (computed-style diff, per breakpoint).")
    ap.add_argument("--config", required=True, help="Path to the JSON config.")
    ap.add_argument("--out", required=True, help="Path to write the JSON report (UTF-8).")
    ap.add_argument("--mode", choices=["A", "B"], default="B", help="A=extract one side, B=diff mockup<->target.")
    ap.add_argument("--side", choices=["maq", "wp"], default="wp", help="Mode A only: which side to extract.")
    args = ap.parse_args()

    cfg = json.loads(Path(args.config).read_text(encoding="utf-8"))
    report = measure(cfg, args.mode, args.side)

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Report -> {out}")
    print(_summarize(report))


if __name__ == "__main__":
    main()
