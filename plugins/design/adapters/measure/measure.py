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
  python measure.py --config <cfg> --out <file> --ledger-registry <project>/ds-deviation-ledger.md

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
    "headings_sel": {"maq":"h1, h2","wp":"h1, h2"},       # optional — completeness scan scope
    "coverage_ack": {"sections":["..."],"reason":"..."},  # optional — justify which sections
                                                          # are deliberately unmeasured (non-empty
                                                          # sections list required to disable guard)
    "check_text": true,                                       # optional — global default OR per-target:
                                                              # targets:[{"name":…,"check_text":true}]
                                                              # Compare textContent where label parity
                                                              # is meaningful (eyebrow, CTA, stat label).
                                                              # NEVER set globally on prose targets
                                                              # (body, testimonials) — those diverge
                                                              # legitimately from placeholder copy.
                                                              # Use per-target to avoid false diffs. (P11)
    "collections": [                                          # optional — sequence parity check
      {"name":"Stats hero","maq":".stat-item","wp":".stat-item",
       "ack":{"id":"DEV-004","reason":"..."}}               # P13 — sanction a deliberate divergence
      # Oracle enumerates ALL matching elements on both sides, normalises their text, diffs the
      # sequences → count diff, per-index label mismatch, missing/extra items, reordering.
      # ok:false with no ack contributes to OPEN verdict like missing_sections.
      # P13 — "ack":{"id":"DEV-xxx","reason":"..."} sanctions a deliberate content/structure
      # divergence (different business content). Acked ok:false entries are excluded from
      # collection_failures. Their id is validated via --ledger-registry like row-level ledger.
    ],
    "ledger": [                                           # deviation-ledger entries
      {"id":"DEV-001","target":"Hero · title","prop":"fontSize","why":"..."}
      # id (DEV-xxx) is REQUIRED — unsigned entries are surfaced in ledger_ids for human review.
      # If --ledger-registry is provided, each id is validated against that file; an id absent
      # from the registry forces verdict=OPEN.
    ]
  }

Report shape (per breakpoint):
  Mode B
    - diff row    : {"element","prop","maquette","local","match": bool}
                    if ledgered: adds "ledgered":true, "why":"...", "ledger_id":"DEV-xxx"
    - missing row : {"element",
                     "missing": {"maquette": "present"|"absent", "wp": "present"|"absent"},
                     "searched": {"maquette": <sel>, "wp": <sel>}}
      -> "present"|"absent" is explicit on purpose: do NOT infer presence from null.
  Mode A
    - value row   : {"element","values": {<prop>: <computed>}}
    - missing row : {"element","missing": true, "searched": {<side>: <sel>}}

Top-level (Mode B) — STRUCTURAL GATES, computed by the script, not claimed by the caller:
  "ledger_ids":   ["DEV-001", ...]   -> ids declared in config ledger (for human cross-check)
  "ledger_unused":[{"id","target","prop"}, ...]
      -> ledger entries that matched no actual diff (stale sanction or already-fixed delta).
         Non-blocking for verdict but signals ledger bloat.
  "completeness": {"maquette_headings":[...], "wp_headings":[...],
                   "missing_in_wp":[...], "extra_in_wp":[...]}
      -> structure before pixels: a heading present in the mockup but absent in the target
         is a missing SECTION, the dominant delta. Defeats hero-only tunnel vision.
  "coverage": {"wp_headings": N, "measured_targets": M, "ok": bool, "warning": "...",
               "ack_sections": [...]}
      -> fewer targets than headings => under-coverage (a hero-only config "passing" while
         the body is unmeasured). OPEN unless coverage_ack supplies a non-empty sections list.
  "collections": [{"name","maq_count","wp_count",
                   "diffs":[{"index","maquette","wp","match":bool}],
                   "missing_in_wp":[...], "extra_in_wp":[...], "ok":bool,
                   "acked":bool, "ack_id":"DEV-xxx", "ack_reason":"..."}]  # P13 — when ack present
      -> sequence parity: count mismatch, per-index label diff, missing/extra items, reordering.
         Catches stat-block drift, card counts, nav items — structures invisible to getComputedStyle.
         ok:false with no ack contributes to OPEN verdict. ok:false with ack is excluded from
         collection_failures (ack_id validated via --ledger-registry). ack_unused:true when ok:true
         and ack is present (stale sanction). Measured once (content is layout-independent).
  "summary": {"verdict": "CLOSED"|"OPEN", "closed": bool, "reasons": [...],
              "total_diff": D, "total_missing": K, "missing_sections": S,
              "collection_failures": N,   # P13: only unacked failures
              "collection_acked": N,      # P13: present only if > 0 (acked sanctions applied)
              "ledger_ids": [...],        # P13: includes collection ack ids
              "ledger_unused_count": N}
      -> CLOSED iff D==0 AND K==0 AND no missing section AND coverage ok
         AND collection_failures==0 (unacked only) AND all ledger ids validated.
         The CALLER MUST cite summary.verdict — closure is asserted from THIS, never from
         inspecting one's own edit. "verified by grep of source" is not closure.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from difflib import SequenceMatcher
from pathlib import Path

from playwright.sync_api import sync_playwright

# JS injected to read getComputedStyle for each target on the current page.
# When check_text is true, also captures __text (normalised textContent) for P7 text-parity.
_GRAB = """(args) => {
  const { targets, props, side, check_text } = args;
  const out = {};
  for (const t of targets) {
    const sel = t[side];
    const el = sel ? document.querySelector(sel) : null;
    if (!el) { out[t.name] = { __missing: sel || null }; continue; }
    const cs = getComputedStyle(el);
    const o = {};
    for (const p of props) o[p] = cs[p];
    const do_text = t.check_text !== undefined ? t.check_text : check_text;
    if (do_text) o['__text'] = (el.textContent || '').replace(/\\s+/g, ' ').trim();
    out[t.name] = o;
  }
  return out;
}"""

# JS injected to enumerate visible heading texts (structural completeness scan).
_HEADINGS = """(sel) => Array.from(document.querySelectorAll(sel))
  .map(e => (e.textContent || '').replace(/\\s+/g, ' ').trim())
  .filter(Boolean)"""

# JS injected to enumerate all items of a collection (P8 sequence parity).
_COLLECT = """(args) => {
  const { collections, side } = args;
  const out = {};
  for (const c of collections) {
    const sel = c[side];
    const els = sel ? Array.from(document.querySelectorAll(sel)) : [];
    out[c.name] = els.map(e => (e.textContent || '').replace(/\\s+/g, ' ').trim());
  }
  return out;
}"""

# JS injected to isolate the active .preview-frame by detaching non-active ones (P3).
# Each breakpoint opens a fresh page, so detaching is safe and permanent for this measurement.
_ISOLATE_FRAME = """(v) => {
  document.querySelectorAll('.preview-frame').forEach(f => {
    const isActive = v === 'desktop'
      ? !f.classList.contains('tablet') && !f.classList.contains('mobile')
      : f.classList.contains(v);
    if (!isActive && f.parentNode) f.parentNode.removeChild(f);
  });
}"""


def _prepare_mockup(page, page_key, maq_viewport):
    """Drive the SPA mockup: set its viewport mode + page, hide preview chrome,
    then isolate the active .preview-frame so querySelector targets the right DOM."""
    if maq_viewport:
        page.evaluate("(v) => window.setViewport && window.setViewport(v)", maq_viewport)
    if page_key:
        page.evaluate("(k) => window.setPage && window.setPage(k)", page_key)
    page.evaluate("() => { const b = document.querySelector('.preview-bar'); if (b) b.style.display = 'none'; }")
    # Detach non-active frames so document.querySelector hits the right one (P3).
    page.evaluate(_ISOLATE_FRAME, maq_viewport or "desktop")
    page.wait_for_timeout(400)


def _grab(page, targets, props, side, check_text=False):
    return page.evaluate(_GRAB, {"targets": targets, "props": props, "side": side,
                                 "check_text": check_text})


def _headings(page, sel):
    return page.evaluate(_HEADINGS, sel)


def _collect(page, collections, side):
    return page.evaluate(_COLLECT, {"collections": collections, "side": side})


def _diff_collections(maq_items: dict, wp_items: dict, collections: list) -> list:
    """Diff two sides of each named collection: count, LCS-aligned label diffs, missing/extra (P8+P12).

    P12 — uses SequenceMatcher (LCS) for per-item alignment so a single insertion at position 0
    does not cascade all subsequent items as false mismatches. The set-based missing_in_wp /
    extra_in_wp remain the authoritative verdict input; diffs[] is a human-readable trace.

    P13 — collection-level ack: {"id":"DEV-xxx","reason":"..."} on a config entry sanctions
    a deliberate content/structure divergence (mirrors row-level ledger). An acked ok:false entry
    does NOT contribute to collection_failures. ack_unused:true when ok:true and ack is present.
    """
    result = []
    for c in collections:
        name = c["name"]
        maq = [_norm(t) for t in maq_items.get(name, [])]
        wp = [_norm(t) for t in wp_items.get(name, [])]
        diffs: list = []
        sm = SequenceMatcher(None, maq, wp, autojunk=False)
        for tag, i1, i2, j1, j2 in sm.get_opcodes():
            if tag == "equal":
                for k in range(i2 - i1):
                    diffs.append({"index": i1 + k, "maquette": maq[i1 + k],
                                  "wp": wp[j1 + k], "match": True})
            else:  # replace / delete / insert
                maq_sl, wp_sl = maq[i1:i2], wp[j1:j2]
                for k in range(max(len(maq_sl), len(wp_sl))):
                    mv = maq_sl[k] if k < len(maq_sl) else None
                    wv = wp_sl[k] if k < len(wp_sl) else None
                    diffs.append({"index": i1 + k if k < len(maq_sl) else None,
                                  "maquette": mv, "wp": wv, "match": False})
        maq_set, wp_set = set(maq), set(wp)
        ok = maq == wp
        entry: dict = {
            "name": name,
            "maq_count": len(maq),
            "wp_count": len(wp),
            "diffs": diffs,
            "missing_in_wp": [t for t in maq if t not in wp_set],
            "extra_in_wp": [t for t in wp if t not in maq_set],
            "ok": ok,
        }
        # P13 — propagate ack from config entry
        ack = c.get("ack")
        if ack:
            entry["ack_id"] = ack.get("id", "")
            entry["ack_reason"] = ack.get("reason", "")
            if not ok:
                entry["acked"] = True
            else:
                entry["ack_unused"] = True
        result.append(entry)
    return result


def measure(cfg: dict, mode: str, side: str) -> dict:
    report: dict = {"mode": mode, "maquette_page": cfg.get("maquette_page"), "breakpoints": {}}
    props = cfg["props"]
    targets = cfg["targets"]
    check_text = cfg.get("check_text", False)
    collections = cfg.get("collections", [])
    hsel = cfg.get("headings_sel", {"maq": "h1, h2", "wp": "h1, h2"})
    maq_headings = wp_headings = None
    maq_coll = wp_coll = None  # collected once across breakpoints (content is layout-independent)

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
                        maq = _grab(m, targets, props, "maq", check_text)
                        if maq_headings is None:
                            maq_headings = _headings(m, hsel.get("maq", "h1, h2"))
                        if collections and maq_coll is None:
                            maq_coll = _collect(m, collections, "maq")
                    if mode == "B" or side == "wp":
                        w = ctx.new_page()
                        w.goto(cfg["wp_url"], wait_until="networkidle", timeout=20000)
                        w.wait_for_timeout(300)
                        wp = _grab(w, targets, props, "wp", check_text)
                        if wp_headings is None:
                            wp_headings = _headings(w, hsel.get("wp", "h1, h2"))
                        if collections and wp_coll is None:
                            wp_coll = _collect(w, collections, "wp")
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
                    # P7+P11 — text parity: emit when JS captured __text (per-target or global)
                    if "__text" in m_v and "__text" in w_v:
                        mt, wt = _norm(m_v["__text"]), _norm(w_v["__text"])
                        rows.append({"element": name, "prop": "text",
                                     "maquette": mt, "local": wt, "match": mt == wt})
                report["breakpoints"][bp["name"]] = rows
        finally:
            browser.close()

    if mode == "B":
        _apply_ledger(report, cfg.get("ledger", []))
        report["completeness"] = _completeness(maq_headings or [], wp_headings or [])
        report["coverage"] = _coverage(wp_headings or [], targets, cfg.get("coverage_ack"))
        # P8 — collection parity (evaluated once, content is layout-independent)
        if collections:
            report["collections"] = _diff_collections(maq_coll or {}, wp_coll or {}, collections)
            # P13 — merge collection ack ids into ledger_ids for --ledger-registry validation
            coll_ack_ids = [c["ack_id"] for c in report["collections"] if "ack_id" in c]
            if coll_ack_ids:
                report["ledger_ids"] = report.get("ledger_ids", []) + coll_ack_ids
        report["summary"] = _verdict(report)
    return report


def _apply_ledger(report: dict, ledger: list) -> None:
    """Tag diffs sanctioned by a deviation-ledger entry (target+prop+id).

    Each entry MUST carry an 'id' field (DEV-xxx). Entries without id are applied
    but flagged as unsigned (visible in report['ledger_ids'] as empty string).
    Unused entries — those that match no actual diff — are collected in
    report['ledger_unused'] to prevent silent ledger bloat (P2).
    """
    entry_map = {(e["target"], e["prop"]): (e.get("why", ""), e.get("id", ""))
                 for e in ledger}
    consumed: set = set()
    for rows in report["breakpoints"].values():
        for r in rows:
            k = (r.get("element", ""), r.get("prop", ""))
            if r.get("match") is False and k in entry_map:
                why, eid = entry_map[k]
                r["ledgered"] = True
                r["why"] = why
                if eid:
                    r["ledger_id"] = eid
                consumed.add(k)

    report["ledger_ids"] = [e.get("id", "") for e in ledger]
    report["ledger_unused"] = [
        {"id": e.get("id", ""), "target": e["target"], "prop": e["prop"]}
        for e in ledger if (e["target"], e["prop"]) not in consumed
    ]


def _validate_ledger_registry(report: dict, registry_path: str) -> list[str]:
    """Verify each ledger id against a deviation-ledger registry file.

    Returns a list of validation error strings (empty = all ids present).
    Only ids that are non-empty strings are checked (unsigned entries are skipped
    here; they are already surfaced via ledger_ids as empty strings).
    """
    try:
        registry_content = Path(registry_path).read_text(encoding="utf-8")
    except OSError as exc:
        return [f"ledger-registry unreadable: {exc}"]
    errors = []
    for eid in report.get("ledger_ids", []):
        if eid and not re.search(re.escape(eid), registry_content):
            errors.append(f"ledger entry {eid} absent du registre ({registry_path})")
    return errors


def _norm(s: str) -> str:
    """Normalize typographic punctuation so a curly-quote target (wptexturize) and a
    straight-quote mockup compare equal — a section is missing by STRUCTURE, not by
    the renderer's smart-quotes."""
    return (s.replace("’", "'").replace("‘", "'")
             .replace("”", '"').replace("“", '"')
             .replace("–", "-").replace("—", "-").replace(" ", " "))


def _completeness(maq_headings: list, wp_headings: list) -> dict:
    """Structure before pixels: which section headings exist on each side (quote-normalized)."""
    maq_n, wp_n = {_norm(h) for h in maq_headings}, {_norm(h) for h in wp_headings}
    return {"maquette_headings": maq_headings, "wp_headings": wp_headings,
            "missing_in_wp": [h for h in maq_headings if _norm(h) not in wp_n],
            "extra_in_wp": [h for h in wp_headings if _norm(h) not in maq_n]}


def _coverage(wp_headings: list, targets: list, ack) -> dict:
    """Fewer measured targets than headings => the body is likely unmeasured (tunnel vision).

    coverage_ack must be a structured dict {"sections": [...], "reason": "..."}
    with a non-empty sections list to disable the guard. A bare boolean true is
    accepted for backward compatibility but triggers a migration warning.
    """
    cov = {"wp_headings": len(wp_headings), "measured_targets": len(targets)}

    # Parse coverage_ack
    ack_sections: list = []
    ack_legacy = False
    if isinstance(ack, dict):
        ack_sections = ack.get("sections") or []
        if ack_sections:
            cov["ack_sections"] = ack_sections
            cov["ack_reason"] = ack.get("reason", "")
    elif ack is True:
        ack_legacy = True

    under = len(targets) < len(wp_headings)
    if not under or ack_sections:
        cov["ok"] = True
        if ack_legacy:
            cov["ok"] = True
            cov["warning"] = ("coverage_ack: upgrade to structured form "
                              '{"sections":[...],"reason":"..."} — bare true accepted but opaque')
    else:
        cov["ok"] = False
        if ack_legacy:
            cov["warning"] = (f"under-coverage: {len(targets)} targets for {len(wp_headings)} headings — "
                              "coverage_ack:true accepted but opaque; upgrade to "
                              '{"sections":[...],"reason":"..."} listing the sections deliberately skipped')
        else:
            cov["warning"] = (f"under-coverage: {len(targets)} targets for {len(wp_headings)} headings — "
                              'set coverage_ack:{"sections":[...],"reason":"..."} listing sections '
                              "deliberately not measured (non-empty list required)")
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
    ledger_ids = report.get("ledger_ids", [])
    ledger_unused = report.get("ledger_unused", [])
    # P13 — separate acked from non-acked collection failures
    all_collections = report.get("collections", [])
    failed_collections = [c for c in all_collections if not c.get("ok") and not c.get("acked")]
    acked_collections = [c for c in all_collections if c.get("acked")]
    unused_ack_collections = [c for c in all_collections if c.get("ack_unused")]

    reasons = []
    if total_diff:
        reasons.append(f"{total_diff} unledgered style diff(s)")
    if total_missing:
        reasons.append(f"{total_missing} missing target(s) — stale selector or absent element")
    if missing_sections:
        reasons.append(f"{len(missing_sections)} section(s) missing in target: {missing_sections}")
    if not cov.get("ok", True):
        reasons.append(cov.get("warning", "under-coverage"))
    for fc in failed_collections:
        reasons.append(f"collection '{fc['name']}': {fc['maq_count']} maq vs {fc['wp_count']} wp"
                       + (f", missing: {fc['missing_in_wp']}" if fc["missing_in_wp"] else "")
                       + (f", extra: {fc['extra_in_wp']}" if fc["extra_in_wp"] else ""))
    # Unsigned ledger entries (no id) — includes unsigned collection acks: surfaced but not alone blocking
    unsigned = [eid for eid in ledger_ids if not eid]
    if unsigned:
        reasons.append(f"{len(unsigned)} unsigned ledger entry(ies) — add 'id' (DEV-xxx) and register in ds-deviation-ledger.md")

    closed = not reasons
    summary: dict = {"verdict": "CLOSED" if closed else "OPEN", "closed": closed, "reasons": reasons,
                     "total_diff": total_diff, "ledgered_diff": ledgered, "total_missing": total_missing,
                     "missing_sections": len(missing_sections),
                     "collection_failures": len(failed_collections),
                     "ledger_ids": ledger_ids,
                     "ledger_unused_count": len(ledger_unused)}
    if acked_collections:
        summary["collection_acked"] = len(acked_collections)
    if unused_ack_collections:
        summary["collection_ack_unused"] = [{"name": c["name"], "ack_id": c.get("ack_id", "")}
                                            for c in unused_ack_collections]
    return summary


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
    for fc in report.get("collections", []):
        if not fc.get("ok"):
            if fc.get("acked"):
                lines.append(f"  ~ collection '{fc['name']}': {fc['maq_count']} maq vs {fc['wp_count']} wp"
                             + f" [ACKED {fc.get('ack_id') or 'unsigned'}]"
                             + (f"  missing={fc['missing_in_wp']}" if fc["missing_in_wp"] else "")
                             + (f"  extra={fc['extra_in_wp']}" if fc["extra_in_wp"] else ""))
            else:
                lines.append(f"  ! collection '{fc['name']}': {fc['maq_count']} maq vs {fc['wp_count']} wp"
                             + (f"  missing={fc['missing_in_wp']}" if fc["missing_in_wp"] else "")
                             + (f"  extra={fc['extra_in_wp']}" if fc["extra_in_wp"] else ""))
        elif fc.get("ack_unused"):
            lines.append(f"  ~ collection '{fc['name']}': ok but ack {fc.get('ack_id') or 'unsigned'} unused")
    unused = report.get("ledger_unused", [])
    if unused:
        ids = [e.get("id") or "(unsigned)" for e in unused]
        lines.append(f"  ! ledger_unused ({len(unused)}) — no matching diff: {ids}")
    s = report.get("summary")
    if s:
        lines.append(f"  VERDICT  : {s['verdict']}" + ("" if s["closed"] else f" — {'; '.join(s['reasons'])}"))
    return "\n".join(lines)


def main():
    # P10 — fix UnicodeEncodeError on Windows (cp1252 stdout) when _summarize emits →/★/·
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser(description="Fidelity oracle (computed-style diff, per breakpoint).")
    ap.add_argument("--config", required=True, help="Path to the JSON config.")
    ap.add_argument("--out", required=True, help="Path to write the JSON report (UTF-8).")
    ap.add_argument("--mode", choices=["A", "B"], default="B",
                    help="A=extract one side, B=diff mockup<->target.")
    ap.add_argument("--side", choices=["maq", "wp"], default="wp",
                    help="Mode A only: which side to extract.")
    ap.add_argument("--ledger-registry", default=None,
                    help="Path to the canonical ds-deviation-ledger.md. When provided, each "
                         "ledger id in the config is validated against this file; an id absent "
                         "from the registry forces verdict=OPEN.")
    args = ap.parse_args()

    cfg = json.loads(Path(args.config).read_text(encoding="utf-8"))
    report = measure(cfg, args.mode, args.side)

    # P1 — validate ledger ids against the canonical registry if provided
    if args.ledger_registry and args.mode == "B":
        registry_errors = _validate_ledger_registry(report, args.ledger_registry)
        if registry_errors:
            s = report.get("summary", {})
            s["reasons"] = registry_errors + s.get("reasons", [])
            s["verdict"] = "OPEN"
            s["closed"] = False
            report["summary"] = s

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Report -> {out}")
    print(_summarize(report))


if __name__ == "__main__":
    main()
