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
  python measure.py --config <cfg> --out <project>/<qa-dir>/fidelity/<page>-B.json
  python measure.py --config <cfg> --mode A --side wp --out <file>

--out is the CONSUMER's responsibility: always an absolute path into the consuming project's
QA/artifacts tree (gitignored), never plugin-relative. The script writes wherever it is told;
keeping reports out of the plugin is a caller convention (see the copycat agent / fidelity gate).

Config (JSON):
  {
    "maquette_url": "...", "maquette_page": "<setPage key|null>",
    "wp_url": "...",
    "breakpoints": [{"name":"desktop","width":1440,"height":900,"maq_viewport":"desktop"}],
    "props": ["fontSize", ...],
    "targets": [{"name":"Hero · title","maq":"<sel>","wp":"<sel>"}],
    "headings_sel": {"maq":"h1, h2","wp":"h1, h2"},   # optional — completeness scan scope
    "coverage_ack": false                              # optional — acknowledge fewer targets than headings
  }

Report shape (per breakpoint):
  Mode B
    - diff row    : {"element","prop","maquette","local","match": bool}
    - missing row : {"element",
                     "missing": {"maquette": "present"|"absent", "wp": "present"|"absent"},
                     "searched": {"maquette": <sel>, "wp": <sel>}}
      -> "present"|"absent" is explicit on purpose: do NOT infer presence from null.
  Mode A
    - value row   : {"element","values": {<prop>: <computed>}}
    - missing row : {"element","missing": true, "searched": {<side>: <sel>}}

Top-level (Mode B) — STRUCTURAL GATES, computed by the script, not claimed by the caller:
  "completeness": {"maquette_headings":[...], "wp_headings":[...],
                   "missing_in_wp":[...], "extra_in_wp":[...]}
      -> structure before pixels: a heading present in the mockup but absent in the target
         is a missing SECTION, the dominant delta. Defeats hero-only tunnel vision.
  "coverage": {"wp_headings": N, "measured_targets": M, "ok": bool, "warning": "..."}
      -> fewer targets than headings => under-coverage (a hero-only config "passing" while
         the body is unmeasured). OPEN unless config sets "coverage_ack": true.
  "summary": {"verdict": "CLOSED"|"OPEN", "closed": bool, "reasons": [...],
              "total_diff": D, "total_missing": K, "missing_sections": S}
      -> CLOSED iff D==0 AND K==0 AND no missing section AND coverage ok.
         The CALLER MUST cite summary.verdict — closure is asserted from THIS, never from
         inspecting one's own edit. "verified by grep of source" is not closure.
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

# JS injected to enumerate visible heading texts (structural completeness scan).
_HEADINGS = """(sel) => Array.from(document.querySelectorAll(sel))
  .map(e => (e.textContent || '').replace(/\\s+/g, ' ').trim())
  .filter(Boolean)"""


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


def _headings(page, sel):
    return page.evaluate(_HEADINGS, sel)


def measure(cfg: dict, mode: str, side: str) -> dict:
    report: dict = {"mode": mode, "maquette_page": cfg.get("maquette_page"), "breakpoints": {}}
    props = cfg["props"]
    targets = cfg["targets"]
    hsel = cfg.get("headings_sel", {"maq": "h1, h2", "wp": "h1, h2"})
    maq_headings = wp_headings = None

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
                        if maq_headings is None:
                            maq_headings = _headings(m, hsel.get("maq", "h1, h2"))
                    if mode == "B" or side == "wp":
                        w = ctx.new_page()
                        w.goto(cfg["wp_url"], wait_until="networkidle", timeout=20000)
                        w.wait_for_timeout(300)
                        wp = _grab(w, targets, props, "wp")
                        if wp_headings is None:
                            wp_headings = _headings(w, hsel.get("wp", "h1, h2"))
                finally:
                    ctx.close()

                rows = []
                for t in targets:
                    name = t["name"]
                    if mode == "A":
                        src = maq if side == "maq" else wp
                        v = src[name]
                        rows.append({"element": name, "missing": True, "searched": {side: v["__missing"]}}
                                    if "__missing" in v
                                    else {"element": name, "values": v})
                        continue
                    m_v, w_v = maq[name], wp[name]
                    if "__missing" in m_v or "__missing" in w_v:
                        rows.append({"element": name,
                                     "missing": {"maquette": "absent" if "__missing" in m_v else "present",
                                                 "wp": "absent" if "__missing" in w_v else "present"},
                                     "searched": {"maquette": t.get("maq"), "wp": t.get("wp")}})
                        continue
                    for p in props:
                        rows.append({"element": name, "prop": p,
                                     "maquette": m_v[p], "local": w_v[p], "match": m_v[p] == w_v[p]})
                report["breakpoints"][bp["name"]] = rows
        finally:
            browser.close()

    if mode == "B":
        _apply_ledger(report, cfg.get("ledger", []))
        report["completeness"] = _completeness(maq_headings or [], wp_headings or [])
        report["coverage"] = _coverage(wp_headings or [], targets, bool(cfg.get("coverage_ack", False)))
        report["summary"] = _verdict(report)
    return report


def _apply_ledger(report: dict, ledger: list) -> None:
    """Tag diffs sanctioned by a deviation-ledger entry (target+prop) so the verdict can
    exclude them. A ledgered diff is EXPLICIT (why recorded), never silent omission."""
    why = {(e["target"], e["prop"]): e.get("why", "") for e in ledger}
    keys = set(why)
    for rows in report["breakpoints"].values():
        for r in rows:
            if r.get("match") is False and (r["element"], r["prop"]) in keys:
                r["ledgered"] = True
                r["why"] = why[(r["element"], r["prop"])]


def _norm(s: str) -> str:
    """Normalize typographic punctuation so a curly-quote target (wptexturize) and a
    straight-quote mockup compare equal — a section is missing by STRUCTURE, not by
    the renderer's smart-quotes."""
    return (s.replace("’", "'").replace("‘", "'")
             .replace("“", '"').replace("”", '"')
             .replace("–", "-").replace("—", "-").replace(" ", " "))


def _completeness(maq_headings: list, wp_headings: list) -> dict:
    """Structure before pixels: which section headings exist on each side (quote-normalized)."""
    maq_n, wp_n = {_norm(h) for h in maq_headings}, {_norm(h) for h in wp_headings}
    return {"maquette_headings": maq_headings, "wp_headings": wp_headings,
            "missing_in_wp": [h for h in maq_headings if _norm(h) not in wp_n],
            "extra_in_wp": [h for h in wp_headings if _norm(h) not in maq_n]}


def _coverage(wp_headings: list, targets: list, ack: bool) -> dict:
    """Fewer measured targets than headings => the body is likely unmeasured (tunnel vision)."""
    cov = {"wp_headings": len(wp_headings), "measured_targets": len(targets)}
    if not ack and len(targets) < len(wp_headings):
        cov["ok"] = False
        cov["warning"] = (f"under-coverage: {len(targets)} targets for {len(wp_headings)} headings — "
                          f"add a target per section or set coverage_ack:true with justification")
    else:
        cov["ok"] = True
    return cov


def _verdict(report: dict) -> dict:
    total_diff = total_missing = ledgered = 0
    for rows in report["breakpoints"].values():
        for r in rows:
            if r.get("match") is False:
                if r.get("ledgered"):
                    ledgered += 1
                else:
                    total_diff += 1
        total_missing += sum(1 for r in rows if "missing" in r)
    missing_sections = report.get("completeness", {}).get("missing_in_wp", [])
    cov = report.get("coverage", {})
    reasons = []
    if total_diff:
        reasons.append(f"{total_diff} unledgered style diff(s)")
    if total_missing:
        reasons.append(f"{total_missing} missing target(s) — stale selector or absent element")
    if missing_sections:
        reasons.append(f"{len(missing_sections)} section(s) missing in target: {missing_sections}")
    if not cov.get("ok", True):
        reasons.append(cov.get("warning", "under-coverage"))
    closed = not reasons
    return {"verdict": "CLOSED" if closed else "OPEN", "closed": closed, "reasons": reasons,
            "total_diff": total_diff, "ledgered_diff": ledgered, "total_missing": total_missing,
            "missing_sections": len(missing_sections)}


def _summarize(report: dict) -> str:
    lines = []
    for bp, rows in report["breakpoints"].items():
        diffs = sum(1 for r in rows if r.get("match") is False and not r.get("ledgered"))
        led = sum(1 for r in rows if r.get("ledgered"))
        oks = sum(1 for r in rows if r.get("match") is True)
        missing = sum(1 for r in rows if "missing" in r)
        lines.append(f"  {bp:8s} : {oks} match · {diffs} diff · {led} ledgered · {missing} missing")
    comp = report.get("completeness")
    if comp and comp["missing_in_wp"]:
        lines.append(f"  ! sections missing in target : {comp['missing_in_wp']}")
    cov = report.get("coverage")
    if cov and not cov.get("ok", True):
        lines.append(f"  ! {cov['warning']}")
    s = report.get("summary")
    if s:
        lines.append(f"  VERDICT  : {s['verdict']}" + ("" if s["closed"] else f" — {'; '.join(s['reasons'])}"))
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
