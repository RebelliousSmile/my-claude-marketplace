#!/usr/bin/env python3
"""Full-page screenshots per breakpoint, for both the mockup and the target render.
Companion to measure.py (computed-style oracle) — pixels for the eye, numbers for the gate.

The mockup may be an SPA (window.setPage/setViewport); preview chrome and the mobile
phone-frame are neutralized before capture so the screenshot is the bare page.

Usage:
  python screenshot.py --config configs/<page>.json --out out/shots
Outputs: <out>/<page>__<side>__<breakpoint>.png  (side is mockup | implementation,
filenames NFC-normalized). Config keys are the ones config-gen.py emits: reference_url,
reference_page, mockup_viewport, implementation_url — one vocabulary with measure.py, loaded and
checked by its load_config; a bare URL path resolves relative to the config file, as there.
Exit 2 on an unreadable or malformed config, before any browser starts.
"""
from __future__ import annotations

import argparse
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from measure import (  # noqa: E402
    MOCKUP_SETTLE_MS, NAV_TIMEOUT_MS, SETTLE_MS, ConfigError, _resolve_url, load_config)

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


def capture(cfg: dict, out_dir: Path, base_dir: Path) -> list[Path]:
    out_dir.mkdir(parents=True, exist_ok=True)
    page_key = cfg.get("reference_page") or "page"
    written: list[Path] = []

    from playwright.sync_api import sync_playwright  # lazy: a bad config exits 2 without it

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        try:
            for bp in cfg["breakpoints"]:
                ctx = browser.new_context(viewport={"width": bp["width"], "height": bp["height"]})
                try:
                    # mockup side — the reference that decides
                    ref_url = cfg.get("reference_url")
                    ref_page = cfg.get("reference_page")
                    if ref_url:
                        m = ctx.new_page()
                        m.goto(_resolve_url(ref_url, base_dir), wait_until="networkidle", timeout=NAV_TIMEOUT_MS)
                        if bp.get("mockup_viewport"):
                            m.evaluate("(v) => window.setViewport && window.setViewport(v)", bp["mockup_viewport"])
                        if ref_page:
                            m.evaluate("(k) => window.setPage && window.setPage(k)", ref_page)
                        m.evaluate(_PREPARE)
                        m.wait_for_timeout(MOCKUP_SETTLE_MS)
                        p = out_dir / f"{_slug(page_key)}__mockup__{bp['name']}.png"
                        m.screenshot(path=str(p), full_page=True)
                        written.append(p)
                    # implementation side — what is measured against the reference
                    impl_url = cfg.get("implementation_url")
                    if impl_url:
                        w = ctx.new_page()
                        w.goto(_resolve_url(impl_url, base_dir), wait_until="networkidle", timeout=NAV_TIMEOUT_MS)
                        w.wait_for_timeout(SETTLE_MS)
                        p = out_dir / f"{_slug(page_key)}__implementation__{bp['name']}.png"
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

    try:
        cfg = load_config(args.config)
    except ConfigError as exc:
        print(f"config error: {exc}", file=sys.stderr)
        sys.exit(2)
    shots = capture(cfg, Path(args.out), Path(args.config).resolve().parent)
    print(f"{len(shots)} screenshot(s) -> {Path(args.out)}")
    for s in shots:
        print(f"  {s.name}")


if __name__ == "__main__":
    main()
