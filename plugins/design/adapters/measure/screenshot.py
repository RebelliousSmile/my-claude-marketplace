#!/usr/bin/env python3
"""Full-page screenshots per breakpoint, for both the mockup and the target render.
Companion to measure.py (computed-style oracle) — pixels for the eye, numbers for the gate.

The mockup may be an SPA (window.setPage/setViewport); preview chrome and the mobile
phone-frame are neutralized before capture so the screenshot is the bare page.

Usage:
  python screenshot.py --config configs/<page>.json --out out/shots
Outputs: <out>/<page>__<side>__<breakpoint>.png  (filenames NFC-normalized).
"""
from __future__ import annotations

import argparse
import json
import unicodedata
from pathlib import Path

from playwright.sync_api import sync_playwright

# Strip preview chrome + neutralize the mobile phone-frame so fullPage is the bare page.
_PREPARE = """() => {
  const bar = document.querySelector('.preview-bar'); if (bar) bar.style.display = 'none';
  document.documentElement.style.height = 'auto';
  document.documentElement.style.overflow = 'visible';
  document.body.style.height = 'auto';
  document.body.style.overflow = 'visible';
  const frame = document.getElementById('preview-frame');
  if (frame) {
    Object.assign(frame.style, { paddingTop: '0', height: 'auto', overflow: 'visible',
      border: 'none', borderRadius: '0', boxShadow: 'none', margin: '0', maxWidth: '100%' });
  }
  const stage = document.querySelector('.preview-stage');
  if (stage) Object.assign(stage.style, { overflow: 'visible', height: 'auto', padding: '0', background: 'transparent' });
}"""


def _slug(s: str) -> str:
    return unicodedata.normalize("NFC", s).replace("/", "-").strip("-") or "page"


def capture(cfg: dict, out_dir: Path) -> list[Path]:
    out_dir.mkdir(parents=True, exist_ok=True)
    page_key = cfg.get("maquette_page") or "page"
    written: list[Path] = []

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        try:
            for bp in cfg["breakpoints"]:
                ctx = browser.new_context(viewport={"width": bp["width"], "height": bp["height"]})
                try:
                    # mockup side
                    if cfg.get("maquette_url"):
                        m = ctx.new_page()
                        m.goto(cfg["maquette_url"], wait_until="networkidle", timeout=20000)
                        if bp.get("maq_viewport"):
                            m.evaluate("(v) => window.setViewport && window.setViewport(v)", bp["maq_viewport"])
                        if cfg.get("maquette_page"):
                            m.evaluate("(k) => window.setPage && window.setPage(k)", cfg["maquette_page"])
                        m.evaluate(_PREPARE)
                        m.wait_for_timeout(500)
                        p = out_dir / f"{_slug(page_key)}__maq__{bp['name']}.png"
                        m.screenshot(path=str(p), full_page=True)
                        written.append(p)
                    # target side
                    if cfg.get("wp_url"):
                        w = ctx.new_page()
                        w.goto(cfg["wp_url"], wait_until="networkidle", timeout=20000)
                        w.wait_for_timeout(300)
                        p = out_dir / f"{_slug(page_key)}__wp__{bp['name']}.png"
                        w.screenshot(path=str(p), full_page=True)
                        written.append(p)
                finally:
                    ctx.close()
        finally:
            browser.close()
    return written


def main():
    ap = argparse.ArgumentParser(description="Per-breakpoint full-page screenshots (mockup + target).")
    ap.add_argument("--config", required=True)
    ap.add_argument("--out", default="out/shots")
    args = ap.parse_args()

    cfg = json.loads(Path(args.config).read_text(encoding="utf-8"))
    shots = capture(cfg, Path(args.out))
    print(f"{len(shots)} screenshot(s) -> {Path(args.out)}")
    for s in shots:
        print(f"  {s.name}")


if __name__ == "__main__":
    main()
