#!/usr/bin/env python3
"""Fidelity oracle — compares computed styles between a mockup and an implementation render,
per breakpoint, property by property. Deterministic: same inputs -> same numbers
(the numbers come from Chromium via Playwright, not from an LLM).

Two modes:
  B (default) — diff a mockup page against an implementation render (mockup<->implementation).
  A           — extract computed styles from a single side (seed a greenfield contract).

The mockup may be an SPA exposing window.setPage()/window.setViewport();
those hooks are called when present. Output is a per-breakpoint JSON report written
in UTF-8 (avoids console encoding loss); a short summary is printed to stdout.

Colour normalisation (introduced in design 2.7.0 — this file carries no version constant of its
own; its version is the plugin's, in .claude-plugin/plugin.json). Properties listed in COLOR_PROPS
are compared through _normalize_color(), which folds a computed colour to a canonical
`rgba(r, g, b, a)` tuple (channels rounded to 0-255, alpha to 4 decimals) before the equality test.
Without it the oracle reported `rgba(255, 255, 255, 0.7)` and `color(srgb 1 1 1 / 0.7)` — the same
colour, serialised two ways by Chromium depending on whether the author wrote rgba() or
color-mix(in srgb, …) — as a style difference. This is a canonical form, NOT a tolerance: two
genuinely different colours still differ, and a value that fails to parse falls back to raw string
equality rather than being treated as a match. Only sRGB folds; see _normalize_one's docstring for
the colour spaces deliberately left out.

--ledger-registry is REQUIRED — the oracle asserts conformity from the per-property comparison
alone, and every tolerated exception must resolve to an active entry of deviations.json carrying
an expected value. There is no unregistered tolerance: absent the registry the tool exits 2
instead of measuring, so a green run can never come from an unvouched sanction.

Usage:
  python measure.py --config <cfg> --ledger-registry <dir>/deviations.json \
                    --out <project>/<qa-dir>/fidelity/<page>-B.json
  python measure.py --config <cfg> --mode A --side mockup --ledger-registry <dir>/deviations.json \
                    --out <file>

--out is the CONSUMER's responsibility: always an absolute path into the consuming project's
QA/artifacts tree (gitignored), never plugin-relative. The script writes wherever it is told;
keeping reports out of the plugin is a caller convention (see the copycat agent / fidelity gate).

Config (JSON):
  {
    "reference_url": "...", "reference_page": "<setPage key|null>",   # the mockup side
    "implementation_url": "...",                                      # the implementation side
    # reference_url / implementation_url carrying a scheme (http://, file://) are used verbatim.
    # A value with no scheme is a path RELATIVE TO THE CONFIG FILE, resolved to a file:// URL —
    # so a self-contained fixture stays portable across machines (no baked absolute path).
    "breakpoints": [{"name":"desktop","width":1440,"height":900,"mockup_viewport":"desktop"}],
    "props": ["fontSize", ...],                  # global list; optional only when every target
                                                  # declares its own "props"
    "targets": [{"name":"Hero · title","mockup":"<sel>","implementation":"<sel>",
                 "props": ["display", ...]}],     # optional per-target props REPLACE the global
                                                  # list for that target (contract-schema § oracle)
    "headings_sel": {"mockup":"h1, h2","implementation":"h1, h2"},  # optional — completeness scope
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
      {"name":"Stats hero","mockup":".stat-item","implementation":".stat-item",
       "ack":{"id":"DEV-004","reason":"..."}}               # P13 — sanction a deliberate divergence
      # Oracle enumerates ALL matching elements on both sides, normalises their text, diffs the
      # sequences → count diff, per-index label mismatch, missing/extra items, reordering.
      # ok:false with no ack contributes to OPEN verdict like missing_sections.
      # P13 — "ack":{"id":"DEV-xxx","reason":"..."} sanctions a deliberate content/structure
      # divergence (different business content). Acked ok:false entries are excluded from
      # collection_failures. Their id is validated via --ledger-registry like row-level ledger.
    ],
    "ledger": [                                           # deviation references
      {"id":"DEV-001","target":"Hero · title","prop":"fontSize","why":"..."}
      # id (DEV-xxx) is REQUIRED — unsigned entries are surfaced in ledger_ids for human review.
      # Each id is validated against --ledger-registry (deviations.json): an id that is not an
      # active entry carrying an expected value, or one past its expiry, forces verdict=OPEN.
    ],
    "ownership": {                                       # optional; required for FSE DS closure
      "surfaces": [
        {"name":"front","url":"http://localhost:8888"},
        {"name":"editor","url":"http://localhost:8888/wp-admin/site-editor.php",
         "frame_selector":"iframe[name=editor-canvas]","requires_auth":true,
         "storage_state_env":"WP_EDITOR_STORAGE_STATE"}
      ],
      "targets": [
        {"name":"Button · link","selector":".btn-pinceau > .wp-block-button__link",
         "class":"btn-pinceau","prop":"background-color",
         "sources":["button.css","fse-bindings.css"]}
      ]
      # Authentication is environment-only: storage_state_env (Playwright JSON/path) or
      # auth_hook_env (JavaScript). Missing editor authentication is ownership_unrealized.
    }
  }

Report shape (per breakpoint):
  Mode B
    - diff row    : {"element","prop","mockup","implementation","match": bool}
                    if ledgered: adds "ledgered":true, "why":"...", "ledger_id":"DEV-xxx"
    - missing row : {"element",
                     "missing": {"mockup": "present"|"absent", "implementation": "present"|"absent"},
                     "searched": {"mockup": <sel>, "implementation": <sel>}}
      -> "present"|"absent" is explicit on purpose: do NOT infer presence from null.
  Mode A
    - value row   : {"element","values": {<prop>: <computed>}}
    - missing row : {"element","missing": true, "searched": {<side>: <sel>}}

Top-level (Mode B) — STRUCTURAL GATES, computed by the script, not claimed by the caller:
  "ledger_ids":   ["DEV-001", ...]   -> ids declared in config ledger (for human cross-check)
  "ledger_unused":[{"id","target","prop"}, ...]
      -> ledger entries that matched no actual diff (stale sanction or already-fixed delta).
         Non-blocking for verdict but signals ledger bloat.
  "completeness": {"mockup_headings":[...], "implementation_headings":[...],
                   "missing_in_implementation":[...], "extra_in_implementation":[...]}
      -> structure before pixels: a heading present in the mockup but absent in the
         implementation is a missing SECTION, the dominant delta. Defeats hero-only tunnel vision.
  "coverage": {"implementation_headings": N, "measured_targets": M, "ok": bool, "warning": "...",
               "ack_sections": [...]}
      -> fewer targets than headings => under-coverage (a hero-only config "passing" while
         the body is unmeasured). OPEN unless coverage_ack supplies a non-empty sections list.
  "collections": [{"name","mockup_count","implementation_count",
                   "diffs":[{"index","mockup","implementation","match":bool}],
                   "missing_in_implementation":[...], "extra_in_implementation":[...], "ok":bool,
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
              "ledger_unused_count": N,
              "ownership_failures": N, "ownership_unrealized": N}
      -> CLOSED iff D==0 AND K==0 AND no missing section AND coverage ok
         AND collection_failures==0 (unacked only) AND all ledger ids validated
         AND every configured ownership row passes on every surface and breakpoint.
         The CALLER MUST cite summary.verdict — closure is asserted from THIS, never from
         inspecting one's own edit. "verified by grep of source" is not closure.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import date, datetime, timezone
from difflib import SequenceMatcher
from pathlib import Path

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
    for (const p of (t.props && t.props.length ? t.props : props)) o[p] = cs[p];
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

# Runtime cascade ownership probe. It walks the active author rules, retains declarations that
# match the measured node, and applies the author-cascade dimensions relevant to a DS/platform
# conflict (importance, inline style, specificity, then source order). The returned winner is
# classified in Python so the same provenance rule is unit-testable without Chromium.
_OWNERSHIP = """(target) => {
  const el = document.querySelector(target.selector);
  if (!el) {
    const nearby = target.diagnostic_selector ? Array.from(document.querySelectorAll(target.diagnostic_selector))
      .slice(0, 5).map(node => {
        const chain = []; let current = node;
        for (let i = 0; current && i < 5; i++, current = current.parentElement)
          chain.push({tag: current.tagName.toLowerCase(), classes: Array.from(current.classList || [])});
        return chain;
      }) : undefined;
    return {unrealized: `missing element: ${target.selector}`, nearby};
  }
  const prop = target.prop;
  const candidates = [];
  let order = 0;
  let layerOrder = 0;

  function splitSelectors(value) {
    const out = []; let start = 0, depth = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === '(' || value[i] === '[') depth += 1;
      else if (value[i] === ')' || value[i] === ']') depth -= 1;
      else if (value[i] === ',' && depth === 0) { out.push(value.slice(start, i).trim()); start = i + 1; }
    }
    out.push(value.slice(start).trim());
    return out.filter(Boolean);
  }

  function withoutWhere(value) {
    let out = '';
    for (let i = 0; i < value.length;) {
      if (value.startsWith(':where(', i)) {
        let depth = 1; i += 7;
        while (i < value.length && depth) { depth += (value[i] === '(') - (value[i] === ')'); i += 1; }
      } else { out += value[i]; i += 1; }
    }
    return out;
  }

  function specificity(selector) {
    const clean = withoutWhere(selector);
    const ids = (clean.match(/#[\\w-]+/g) || []).length;
    const classes = (clean.match(/\\.[\\w-]+|\\[[^\\]]+\\]|(?<!:):(?!:)[\\w-]+(?:\\([^)]*\\))?/g) || []).length;
    const types = (clean.replace(/#[\\w-]+|\\.[\\w-]+|\\[[^\\]]+\\]|::?[\\w-]+(?:\\([^)]*\\))?|[>+~*]/g, ' ')
      .match(/(?:^|\\s)[a-zA-Z][\\w-]*/g) || []).length;
    const pseudoElements = (clean.match(/::[\\w-]+/g) || []).length;
    return [0, ids, classes, types + pseudoElements];
  }

  function visit(rules, source, layer = null) {
    for (const rule of Array.from(rules || [])) {
      order += 1;
      if (rule.type === 1 && rule.selectorText) {
        const matched = splitSelectors(rule.selectorText).filter(s => {
          try { return el.matches(s); } catch (_) { return false; }
        });
        const value = rule.style.getPropertyValue(prop);
        if (matched.length && value) {
          matched.sort((a, b) => {
            const sa = specificity(a), sb = specificity(b);
            for (let i = 0; i < 4; i++) if (sa[i] !== sb[i]) return sb[i] - sa[i];
            return 0;
          });
          candidates.push({source, selector: matched[0], value: value.trim(),
            important: rule.style.getPropertyPriority(prop) === 'important',
            specificity: specificity(matched[0]), order, layer});
        }
      } else if (rule.styleSheet && rule.styleSheet.cssRules) {
        visit(rule.styleSheet.cssRules, rule.styleSheet.href || source, layer);
      } else if (rule.cssRules) {
        if (rule.media && !matchMedia(rule.media.mediaText).matches) continue;
        const isLayer = String(rule.constructor && rule.constructor.name).includes('Layer');
        const nestedSource = rule.styleSheet && rule.styleSheet.href ? rule.styleSheet.href : source;
        visit(rule.cssRules, nestedSource, isLayer ? ++layerOrder : layer);
      }
    }
  }

  for (const sheet of Array.from(document.styleSheets)) {
    const source = sheet.href || `inline:${order}`;
    try { visit(sheet.cssRules, source); } catch (_) { /* cross-origin sheet: not inspectable */ }
  }
  const inline = el.style.getPropertyValue(prop);
  if (inline) candidates.push({source: 'inline-style', selector: '<inline>', value: inline.trim(),
    important: el.style.getPropertyPriority(prop) === 'important', specificity: [1, 0, 0, 0],
    order: ++order, layer: null, inline: true});
  if (!candidates.length) return {unrealized: `no inspectable declaration for ${prop}`,
    computed: getComputedStyle(el).getPropertyValue(prop).trim()};
  candidates.sort((a, b) => {
    if (a.important !== b.important) return a.important ? 1 : -1;
    if (a.inline !== b.inline && (a.inline || b.inline)) return a.inline ? 1 : -1;
    const aLayered = a.layer !== null, bLayered = b.layer !== null;
    if (aLayered !== bLayered) {
      if (a.important) return aLayered ? 1 : -1;
      return aLayered ? -1 : 1;
    }
    if (aLayered && a.layer !== b.layer) return a.important ? b.layer - a.layer : a.layer - b.layer;
    for (let i = 0; i < 4; i++) if (a.specificity[i] !== b.specificity[i]) return a.specificity[i] - b.specificity[i];
    return a.order - b.order;
  });
  return {computed: getComputedStyle(el).getPropertyValue(prop).trim(), winner: candidates[candidates.length - 1]};
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


def _prepare_mockup(page, page_key, mockup_viewport):
    """Drive the SPA mockup: set its viewport mode + page, hide preview chrome,
    then isolate the active .preview-frame so querySelector targets the right DOM."""
    if mockup_viewport:
        page.evaluate("(v) => window.setViewport && window.setViewport(v)", mockup_viewport)
    if page_key:
        page.evaluate("(k) => window.setPage && window.setPage(k)", page_key)
    page.evaluate("() => { const b = document.querySelector('.preview-bar'); if (b) b.style.display = 'none'; }")
    # Detach non-active frames so document.querySelector hits the right one (P3).
    page.evaluate(_ISOLATE_FRAME, mockup_viewport or "desktop")
    page.wait_for_timeout(400)


def _target_props(target: dict, props: list) -> list:
    """Props measured on one target: its own list replaces the global one; absent, the global
    list applies. Mirrors contract-schema § oracle.json (element props override the default)."""
    return target.get("props") or props


class ConfigError(Exception):
    """A config the oracle cannot run: an input error (exit 2), never a violation (exit 1)."""


def load_config(path: str | Path) -> dict:
    """Read and shape-check a measure config before any browser starts.

    Shared with screenshot.py: one vocabulary, one validation, one exit code for a bad input.
    """
    try:
        cfg = json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        raise ConfigError(f"config {path}: unreadable - {exc}") from exc
    if not isinstance(cfg, dict):
        raise ConfigError(f"config {path}: the root must be a JSON object")
    targets = cfg.get("targets")
    if not isinstance(targets, list) or not targets:
        raise ConfigError(f"config {path}: 'targets' must be a non-empty list")
    for i, target in enumerate(targets):
        if not isinstance(target, dict) or not isinstance(target.get("name"), str):
            raise ConfigError(f"config {path}: targets[{i}] must be an object with a string 'name'")
    breakpoints = cfg.get("breakpoints")
    if not isinstance(breakpoints, list) or not breakpoints:
        raise ConfigError(f"config {path}: 'breakpoints' must be a non-empty list")
    for i, bp in enumerate(breakpoints):
        if not (isinstance(bp, dict) and isinstance(bp.get("name"), str)
                and all(isinstance(bp.get(k), int) and bp[k] > 0 for k in ("width", "height"))):
            raise ConfigError(f"config {path}: breakpoints[{i}] needs a string 'name' and "
                              "positive integer 'width' and 'height'")
    return cfg


def _targets_without_props(cfg: dict) -> list:
    """Target names left with no prop to measure: no own list and no global fallback."""
    if cfg.get("props"):
        return []
    return [t["name"] for t in cfg.get("targets", []) if not t.get("props")]


def _grab(page, targets, props, side, check_text=False):
    return page.evaluate(_GRAB, {"targets": targets, "props": props, "side": side,
                                 "check_text": check_text})


def _headings(page, sel):
    return page.evaluate(_HEADINGS, sel)


def _collect(page, collections, side):
    return page.evaluate(_COLLECT, {"collections": collections, "side": side})


def _diff_collections(mock_items: dict, impl_items: dict, collections: list) -> list:
    """Diff two sides of each named collection: count, LCS-aligned label diffs, missing/extra (P8+P12).

    P12 — uses SequenceMatcher (LCS) for per-item alignment so a single insertion at position 0
    does not cascade all subsequent items as false mismatches. The set-based missing/extra remain
    the authoritative verdict input; diffs[] is a human-readable trace.

    P13 — collection-level ack: {"id":"DEV-xxx","reason":"..."} on a config entry sanctions
    a deliberate content/structure divergence (mirrors row-level ledger). An acked ok:false entry
    does NOT contribute to collection_failures. ack_unused:true when ok:true and ack is present.
    """
    result = []
    for c in collections:
        name = c["name"]
        mock = [_norm(t) for t in mock_items.get(name, [])]
        impl = [_norm(t) for t in impl_items.get(name, [])]
        diffs: list = []
        sm = SequenceMatcher(None, mock, impl, autojunk=False)
        for tag, i1, i2, j1, j2 in sm.get_opcodes():
            if tag == "equal":
                for k in range(i2 - i1):
                    diffs.append({"index": i1 + k, "mockup": mock[i1 + k],
                                  "implementation": impl[j1 + k], "match": True})
            else:  # replace / delete / insert
                mock_sl, impl_sl = mock[i1:i2], impl[j1:j2]
                for k in range(max(len(mock_sl), len(impl_sl))):
                    mv = mock_sl[k] if k < len(mock_sl) else None
                    iv = impl_sl[k] if k < len(impl_sl) else None
                    diffs.append({"index": i1 + k if k < len(mock_sl) else None,
                                  "mockup": mv, "implementation": iv, "match": False})
        mock_set, impl_set = set(mock), set(impl)
        ok = mock == impl
        entry: dict = {
            "name": name,
            "mockup_count": len(mock),
            "implementation_count": len(impl),
            "diffs": diffs,
            "missing_in_implementation": [t for t in mock if t not in impl_set],
            "extra_in_implementation": [t for t in impl if t not in mock_set],
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


def _resolve_url(raw: str, base_dir: Path) -> str:
    """A config URL with a scheme is used verbatim; a bare path is resolved relative to the config
    file and turned into a file:// URL, so a committed fixture needs no machine-specific path."""
    if re.match(r"^[a-z][a-z0-9+.-]*://", raw, re.IGNORECASE):
        return raw
    return (base_dir / raw).resolve().as_uri()


# --- colour normalisation (2.7.0) ------------------------------------------------------------
# Properties whose computed value is a colour, and only those. Everything else keeps raw string
# equality: normalising a non-colour property would corrupt the comparison it is meant to protect.
COLOR_PROPS = frozenset({
    "color", "backgroundColor", "borderColor", "borderTopColor",
    "outlineColor", "textDecorationColor",
})

_NAMED_COLORS = {
    "transparent": (0, 0, 0, 0.0),
    "black": (0, 0, 0, 1.0),
    "white": (255, 255, 255, 1.0),
}

_RE_FUNC = re.compile(r"^(rgba?|color)\((.*)\)$", re.IGNORECASE | re.DOTALL)
_RE_HEX = re.compile(r"^#([0-9a-f]{3,8})$", re.IGNORECASE)


def _split_top_level(value: str) -> list[str]:
    """Split a computed value on top-level whitespace, keeping parenthesised groups intact.

    `borderColor` serialises as a shorthand of up to four colours, and each of those may itself be
    `rgba(255, 255, 255, 0.7)` — full of spaces and commas. A naive split would shred it.
    """
    out, depth, cur = [], 0, []
    for ch in value:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth = max(0, depth - 1)
        if depth == 0 and ch.isspace():
            if cur:
                out.append("".join(cur))
                cur = []
            continue
        cur.append(ch)
    if cur:
        out.append("".join(cur))
    return out


def _chan(tok: str, scale: float) -> float | None:
    """One colour channel: a number, or a percentage of `scale`. None if it is neither."""
    tok = tok.strip()
    if not tok:
        return None
    try:
        if tok.endswith("%"):
            return float(tok[:-1]) * scale / 100.0
        return float(tok)
    except ValueError:
        return None


def _alpha(tok: str) -> float | None:
    """Alpha as a 0-1 float; accepts `0.7` and `70%`."""
    a = _chan(tok, 1.0)
    return None if a is None else max(0.0, min(1.0, a))


def _normalize_one(value: str) -> str | None:
    """Canonicalise a single colour to `rgba(r, g, b, a)`; None when unparseable.

    Handles `rgb()`/`rgba()` (comma or space separated), `color(srgb r g b / a)`, `#rgb`/`#rgba`/
    `#rrggbb`/`#rrggbbaa`, and the `transparent`/`currentcolor` keywords. Channels are rounded to
    integers 0-255 and alpha to 4 decimals, so this is an exact canonical form and never a
    tolerance: `#FFFFFF` and `#FFFFEE` normalise to different strings, as do alpha 0.7 and 0.71.

    LIMITATION: only the sRGB space folds. `color(display-p3 …)`, `lab()`, `lch()`, `oklab()`,
    `oklch()` and `hsl()` are NOT converted — they return None and the caller falls back to string
    equality, which is a false diff at worst, never a false match. `color-mix()` never reaches here:
    the browser has already resolved it by the time getComputedStyle reports it (in srgb it
    serialises as `color(srgb …)`, which is exactly the artefact this function exists to absorb).
    """
    v = value.strip()
    if not v:
        return None
    low = v.lower()

    if low == "currentcolor":
        return "currentcolor"
    if low in _NAMED_COLORS:
        r, g, b, a = _NAMED_COLORS[low]
        return f"rgba({r}, {g}, {b}, {round(a, 4):g})"

    m = _RE_HEX.match(v)
    if m:
        h = m.group(1)
        if len(h) in (3, 4):
            h = "".join(c * 2 for c in h)
        if len(h) not in (6, 8):
            return None
        r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
        a = int(h[6:8], 16) / 255.0 if len(h) == 8 else 1.0
        return f"rgba({r}, {g}, {b}, {round(a, 4):g})"

    m = _RE_FUNC.match(v)
    if not m:
        return None
    fn, body = m.group(1).lower(), m.group(2)

    # Alpha is after a slash in the modern syntax, or the 4th comma-separated argument.
    alpha_tok = None
    if "/" in body:
        body, _, alpha_tok = body.partition("/")

    parts = [p for p in re.split(r"[,\s]+", body.strip()) if p]

    if fn == "color":
        if not parts or parts[0].lower() != "srgb":
            return None          # display-p3, lab, … deliberately not folded
        parts = parts[1:]
        scale = 255.0            # color(srgb …) channels are 0-1
    else:
        scale = 255.0
        if len(parts) == 4 and alpha_tok is None:
            alpha_tok = parts[3]
            parts = parts[:3]

    if len(parts) != 3:
        return None

    chans = []
    for p in parts:
        c = _chan(p, 255.0)
        if c is None:
            return None
        # color(srgb …) is 0-1 unless written as a percentage; rgb() is already 0-255.
        if fn == "color" and not p.strip().endswith("%"):
            c *= scale
        chans.append(max(0, min(255, int(round(c)))))

    a = 1.0 if alpha_tok is None else _alpha(alpha_tok)
    if a is None:
        return None
    return f"rgba({chans[0]}, {chans[1]}, {chans[2]}, {round(a, 4):g})"


def _normalize_color(value: str) -> str | None:
    """Canonicalise a whole computed colour value, shorthand included; None when unparseable.

    `borderColor` may carry 1-4 colours. Every component must parse, or the whole value is None and
    the caller keeps string equality — a value we do not fully understand is never declared a match.
    """
    if not isinstance(value, str):
        return None
    toks = _split_top_level(value.strip())
    if not toks:
        return None
    normed = [_normalize_one(t) for t in toks]
    if any(n is None for n in normed):
        return None
    return " ".join(normed)


def _color_match(prop: str, mockup, implementation) -> bool:
    """Compare one property. Colour-valued properties compare by canonical value, everything else
    by raw string. An unparseable colour falls back to string equality — never to True."""
    if prop in COLOR_PROPS:
        m, i = _normalize_color(mockup), _normalize_color(implementation)
        if m is not None and i is not None:
            return m == i
    return mockup == implementation


def _owner_is_expected(winner: dict, target: dict) -> bool:
    """True only when the winning declaration comes from an authorised DS sheet and selector."""
    source = str(winner.get("source", "")).replace("\\", "/").split("?")[0]
    expected_sources = [str(s).replace("\\", "/").split("?")[0]
                        for s in target.get("sources", [])]
    source_ok = any(source == s or source.endswith("/" + s) or source.endswith("/" + Path(s).name)
                    for s in expected_sources)
    expected_class = target.get("class", "").lstrip(".")
    selector = str(winner.get("selector", ""))
    class_ok = bool(expected_class and re.search(
        rf"(?<![\w-])\.{re.escape(expected_class)}(?![\w-])", selector))
    return source_ok and class_ok


def _classify_ownership(result: dict, target: dict) -> dict:
    """Attach a deterministic status to one browser observation (pure/testable boundary)."""
    row = {"element": target.get("name", target.get("selector")),
           "selector": target.get("selector"), "prop": target.get("prop")}
    if result.get("unrealized"):
        row.update({"status": "unrealized", "reason": result["unrealized"]})
        if result.get("nearby") is not None:
            row["nearby"] = result["nearby"]
        if "computed" in result:
            row["computed"] = result["computed"]
        return row
    row.update({"computed": result.get("computed"), "winner": result.get("winner")})
    row["status"] = "pass" if _owner_is_expected(result.get("winner", {}), target) else "fail"
    if row["status"] == "fail":
        row["reason"] = "winning declaration is not owned by the expected DS class and stylesheet"
    return row


def _unrealized_ownership_rows(targets: list, reason: str) -> list[dict]:
    return [_classify_ownership({"unrealized": target.get("unrealized_reason", reason)}, target)
            for target in targets]


def _measure_ownership(browser, cfg: dict, base_dir: Path) -> dict:
    """Measure cascade provenance on every configured surface and breakpoint.

    Editor authentication is supplied only through environment variables. `storage_state_env`
    points to either a Playwright state file or JSON value; `auth_hook_env` points to JavaScript
    evaluated after navigation. No credential or session material belongs in the config.
    """
    ownership = cfg.get("ownership")
    if not ownership:
        return {}
    targets = ownership.get("targets", [])
    measured: dict = {}
    for surface in ownership.get("surfaces", []):
        surface_name = surface["name"]
        measured[surface_name] = {}
        state_env = surface.get("storage_state_env")
        hook_env = surface.get("auth_hook_env")
        state_raw = os.environ.get(state_env, "") if state_env else ""
        hook = os.environ.get(hook_env, "") if hook_env else ""
        requires_auth = bool(surface.get("requires_auth"))
        for bp in cfg["breakpoints"]:
            if requires_auth and not state_raw and not hook:
                measured[surface_name][bp["name"]] = _unrealized_ownership_rows(
                    targets, f"authenticated surface unavailable; set {state_env or hook_env}")
                continue
            context_args = {"viewport": {"width": bp["width"], "height": bp["height"]}}
            if state_raw:
                try:
                    context_args["storage_state"] = json.loads(state_raw)
                except ValueError:
                    context_args["storage_state"] = str(Path(state_raw).expanduser())
            ctx = browser.new_context(**context_args)
            try:
                page = ctx.new_page()
                page.goto(_resolve_url(surface["url"], base_dir), wait_until="networkidle", timeout=20000)
                if hook:
                    was_login = "wp-login.php" in page.url
                    page.evaluate(hook)
                    page.wait_for_timeout(750)
                    if was_login:
                        page.wait_for_url(re.compile(r"^(?!.*wp-login\.php).*$"),
                                          wait_until="load", timeout=20000)
                    else:
                        page.wait_for_load_state("load", timeout=20000)
                    page.wait_for_timeout(300)
                scope = page
                frame_selector = surface.get("frame_selector")
                if frame_selector:
                    page.wait_for_selector(frame_selector, state="attached", timeout=20000)
                    handle = page.query_selector(frame_selector)
                    scope = handle.content_frame() if handle else None
                if scope is None:
                    measured[surface_name][bp["name"]] = _unrealized_ownership_rows(
                        targets, f"editor canvas unavailable: {frame_selector}")
                    continue
                rows = []
                for target in targets:
                    if target.get("unrealized_reason") or not target.get("prop"):
                        rows.extend(_unrealized_ownership_rows([target], "no declared DS property"))
                        continue
                    rows.append(_classify_ownership(scope.evaluate(_OWNERSHIP, target), target))
                measured[surface_name][bp["name"]] = rows
            except Exception as exc:  # browser/navigation failures are evidence gaps, not tracebacks
                measured[surface_name][bp["name"]] = _unrealized_ownership_rows(
                    targets, f"surface measurement failed: {exc}")
            finally:
                ctx.close()
    return measured


def measure(cfg: dict, mode: str, side: str, base_dir: Path) -> dict:
    report: dict = {"mode": mode, "mockup_page": cfg.get("reference_page"), "breakpoints": {}}
    props = cfg.get("props") or []
    targets = cfg["targets"]
    check_text = cfg.get("check_text", False)
    collections = cfg.get("collections", [])
    hsel = cfg.get("headings_sel", {"mockup": "h1, h2", "implementation": "h1, h2"})
    mock_headings = impl_headings = None
    mock_coll = impl_coll = None  # collected once across breakpoints (content is layout-independent)

    from playwright.sync_api import sync_playwright  # lazy: pure helpers stay importable without it

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        try:
            for bp in cfg["breakpoints"]:
                ctx = browser.new_context(viewport={"width": bp["width"], "height": bp["height"]})
                try:
                    mock = impl = None
                    if mode == "B" or side == "mockup":
                        m = ctx.new_page()
                        m.goto(_resolve_url(cfg["reference_url"], base_dir),
                               wait_until="networkidle", timeout=20000)
                        _prepare_mockup(m, cfg.get("reference_page"), bp.get("mockup_viewport"))
                        mock = _grab(m, targets, props, "mockup", check_text)
                        if mock_headings is None:
                            mock_headings = _headings(m, hsel.get("mockup", "h1, h2"))
                        if collections and mock_coll is None:
                            mock_coll = _collect(m, collections, "mockup")
                    if mode == "B" or side == "implementation":
                        w = ctx.new_page()
                        w.goto(_resolve_url(cfg["implementation_url"], base_dir),
                               wait_until="networkidle", timeout=20000)
                        w.wait_for_timeout(300)
                        impl = _grab(w, targets, props, "implementation", check_text)
                        if impl_headings is None:
                            impl_headings = _headings(w, hsel.get("implementation", "h1, h2"))
                        if collections and impl_coll is None:
                            impl_coll = _collect(w, collections, "implementation")
                finally:
                    ctx.close()

                rows = []
                for t in targets:
                    name = t["name"]
                    if mode == "A":
                        src = mock if side == "mockup" else impl
                        v = src[name]
                        rows.append({"element": name, "missing": True, "searched": {side: v["__missing"]}}
                                    if "__missing" in v
                                    else {"element": name, "values": v})
                        continue
                    m_v, i_v = mock[name], impl[name]
                    if "__missing" in m_v or "__missing" in i_v:
                        rows.append({"element": name,
                                     "missing": {"mockup": "absent" if "__missing" in m_v else "present",
                                                 "implementation": "absent" if "__missing" in i_v else "present"},
                                     "searched": {"mockup": t.get("mockup"),
                                                  "implementation": t.get("implementation")}})
                        continue
                    for p in _target_props(t, props):
                        rows.append({"element": name, "prop": p,
                                     "mockup": m_v[p], "implementation": i_v[p],
                                     "match": _color_match(p, m_v[p], i_v[p])})
                    # P7+P11 — text parity: emit when JS captured __text (per-target or global)
                    if "__text" in m_v and "__text" in i_v:
                        mt, it = _norm(m_v["__text"]), _norm(i_v["__text"])
                        rows.append({"element": name, "prop": "text",
                                     "mockup": mt, "implementation": it, "match": mt == it})
                report["breakpoints"][bp["name"]] = rows
            if mode == "B" and cfg.get("ownership"):
                report["ownership"] = _measure_ownership(browser, cfg, base_dir)
        finally:
            browser.close()

    if mode == "B":
        _apply_ledger(report, cfg.get("ledger", []))
        report["completeness"] = _completeness(mock_headings or [], impl_headings or [])
        report["coverage"] = _coverage(impl_headings or [], targets, cfg.get("coverage_ack"))
        # P8 — collection parity (evaluated once, content is layout-independent)
        if collections:
            report["collections"] = _diff_collections(mock_coll or {}, impl_coll or {}, collections)
            # P13 — merge collection ack ids into ledger_ids for --ledger-registry validation
            coll_ack_ids = [c["ack_id"] for c in report["collections"] if "ack_id" in c]
            if coll_ack_ids:
                report["ledger_ids"] = report.get("ledger_ids", []) + coll_ack_ids
        report["summary"] = _verdict(report)
    return report


def _apply_ledger(report: dict, ledger: list) -> None:
    """Tag diffs sanctioned by a deviation reference (target+prop+id).

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


def _load_deviations(registry_path: str) -> tuple[dict, list[str]]:
    """Load deviations.json and index its active entries by id.

    A structurally invalid registry is a validation error string, never a traceback: measure.py
    must not exit 1 (the violation code) on a malformed registry. Returns (active_by_id, errors).
    """
    try:
        raw = Path(registry_path).read_text(encoding="utf-8")
    except OSError as exc:
        return {}, [f"ledger-registry unreadable: {exc}"]
    try:
        data = json.loads(raw)
    except ValueError as exc:
        return {}, [f"ledger-registry is not valid JSON ({registry_path}): {exc}"]
    if not isinstance(data, dict):
        return {}, [f"ledger-registry must be a JSON object ({registry_path})"]
    active = data.get("active", [])
    if not isinstance(active, list):
        return {}, [f"ledger-registry .active must be an array ({registry_path})"]
    by_id: dict = {}
    for e in active:
        if isinstance(e, dict) and e.get("id"):
            by_id[e["id"]] = e
    return by_id, []


def _expired(expires: str, today: date) -> bool:
    """A deviation past its declared expiry no longer sanctions. A malformed date is not treated
    as expired here — it is surfaced as its own reason — so the verdict never turns on a parse."""
    try:
        return date.fromisoformat(str(expires)) < today
    except ValueError:
        return False


def _validate_ledger_registry(report: dict, registry_path: str, today: date) -> list[str]:
    """Verify each ledger id the config references resolves to an ACTIVE deviation that carries an
    expected value and has not expired. Any failure is a reason string; the caller forces OPEN.

    deviations.json is the authority (references/deviations-schema.md): an id sanctions a delta
    only if it is in active[], carries a non-empty `expected`, and — if it declares `expires` —
    has not passed it against the run clock. Absence, no expected, or expiry each reopen the verdict.
    Returns a list of validation error strings (empty = every referenced id is a valid sanction).
    """
    by_id, errors = _load_deviations(registry_path)
    if errors:
        return errors
    for eid in report.get("ledger_ids", []):
        if not eid:
            continue  # unsigned entries are already surfaced via ledger_ids (empty strings)
        entry = by_id.get(eid)
        if entry is None:
            errors.append(f"ledger id {eid} absent des écarts actifs de {registry_path} — "
                          "exception qui référence un écart inexistant ou révolu")
            continue
        if not str(entry.get("expected", "")).strip():
            errors.append(f"ledger id {eid} sans valeur 'expected' dans {registry_path} — "
                          "rien à sanctionner")
        expires = entry.get("expires")
        if expires and _expired(expires, today):
            errors.append(f"ledger id {eid} expiré le {expires} — l'écart ne sanctionne plus")
        elif expires and not _valid_date(expires):
            errors.append(f"ledger id {eid} : date d'expiration illisible '{expires}' (ISO-8601 attendu)")
    return errors


def _valid_date(value: str) -> bool:
    try:
        date.fromisoformat(str(value))
        return True
    except ValueError:
        return False


def _norm(s: str) -> str:
    """Normalize typographic punctuation so a curly-quote target (wptexturize) and a
    straight-quote mockup compare equal — a section is missing by STRUCTURE, not by
    the renderer's smart-quotes."""
    return (s.replace("’", "'").replace("‘", "'")
             .replace("”", '"').replace("“", '"')
             .replace("–", "-").replace("—", "-").replace(" ", " "))


def _completeness(mock_headings: list, impl_headings: list) -> dict:
    """Structure before pixels: which section headings exist on each side (quote-normalized)."""
    mock_n, impl_n = {_norm(h) for h in mock_headings}, {_norm(h) for h in impl_headings}
    return {"mockup_headings": mock_headings, "implementation_headings": impl_headings,
            "missing_in_implementation": [h for h in mock_headings if _norm(h) not in impl_n],
            "extra_in_implementation": [h for h in impl_headings if _norm(h) not in mock_n]}


def _coverage(impl_headings: list, targets: list, ack) -> dict:
    """Fewer measured targets than headings => the body is likely unmeasured (tunnel vision).

    coverage_ack must be a structured dict {"sections": [...], "reason": "..."}
    with a non-empty sections list to disable the guard. A bare boolean true is
    accepted for backward compatibility but triggers a migration warning.
    """
    cov = {"implementation_headings": len(impl_headings), "measured_targets": len(targets)}

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

    under = len(targets) < len(impl_headings)
    if not under or ack_sections:
        cov["ok"] = True
        if ack_legacy:
            cov["ok"] = True
            cov["warning"] = ("coverage_ack: upgrade to structured form "
                              '{"sections":[...],"reason":"..."} — bare true accepted but opaque')
    else:
        cov["ok"] = False
        if ack_legacy:
            cov["warning"] = (f"under-coverage: {len(targets)} targets for {len(impl_headings)} headings — "
                              "coverage_ack:true accepted but opaque; upgrade to "
                              '{"sections":[...],"reason":"..."} listing the sections deliberately skipped')
        else:
            cov["warning"] = (f"under-coverage: {len(targets)} targets for {len(impl_headings)} headings — "
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
    missing_sections = report.get("completeness", {}).get("missing_in_implementation", [])
    cov = report.get("coverage", {})
    ledger_ids = report.get("ledger_ids", [])
    ledger_unused = report.get("ledger_unused", [])
    # P13 — separate acked from non-acked collection failures
    all_collections = report.get("collections", [])
    failed_collections = [c for c in all_collections if not c.get("ok") and not c.get("acked")]
    acked_collections = [c for c in all_collections if c.get("acked")]
    unused_ack_collections = [c for c in all_collections if c.get("ack_unused")]
    ownership_rows = [row for surface in report.get("ownership", {}).values()
                      for rows in surface.values() for row in rows]
    ownership_failures = sum(1 for row in ownership_rows if row.get("status") == "fail")
    ownership_unrealized = sum(1 for row in ownership_rows if row.get("status") == "unrealized")

    reasons = []
    if total_diff:
        reasons.append(f"{total_diff} unledgered style diff(s)")
    if total_missing:
        reasons.append(f"{total_missing} missing target(s) — stale selector or absent element")
    if missing_sections:
        reasons.append(f"{len(missing_sections)} section(s) missing in implementation: {missing_sections}")
    if not cov.get("ok", True):
        reasons.append(cov.get("warning", "under-coverage"))
    for fc in failed_collections:
        reasons.append(f"collection '{fc['name']}': {fc['mockup_count']} mockup vs "
                       f"{fc['implementation_count']} implementation"
                       + (f", missing: {fc['missing_in_implementation']}" if fc["missing_in_implementation"] else "")
                       + (f", extra: {fc['extra_in_implementation']}" if fc["extra_in_implementation"] else ""))
    # Unsigned ledger entries (no id) — includes unsigned collection acks: surfaced but not alone blocking
    unsigned = [eid for eid in ledger_ids if not eid]
    if unsigned:
        reasons.append(f"{len(unsigned)} unsigned ledger entry(ies) — add 'id' (DEV-xxx) and "
                       "register it in deviations.json § active")
    if ownership_failures:
        reasons.append(f"{ownership_failures} cascade ownership failure(s)")
    if ownership_unrealized:
        reasons.append(f"{ownership_unrealized} cascade ownership check(s) unrealized")

    closed = not reasons
    summary: dict = {"verdict": "CLOSED" if closed else "OPEN", "closed": closed, "reasons": reasons,
                     "total_diff": total_diff, "ledgered_diff": ledgered, "total_missing": total_missing,
                     "missing_sections": len(missing_sections),
                     "collection_failures": len(failed_collections),
                     "ownership_failures": ownership_failures,
                     "ownership_unrealized": ownership_unrealized,
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
    if comp and comp["missing_in_implementation"]:
        lines.append(f"  ! sections missing in implementation : {comp['missing_in_implementation']}")
    cov = report.get("coverage")
    if cov and not cov.get("ok", True):
        lines.append(f"  ! {cov['warning']}")
    for fc in report.get("collections", []):
        if not fc.get("ok"):
            head = f"collection '{fc['name']}': {fc['mockup_count']} mockup vs {fc['implementation_count']} implementation"
            miss = f"  missing={fc['missing_in_implementation']}" if fc["missing_in_implementation"] else ""
            extra = f"  extra={fc['extra_in_implementation']}" if fc["extra_in_implementation"] else ""
            if fc.get("acked"):
                lines.append(f"  ~ {head} [ACKED {fc.get('ack_id') or 'unsigned'}]{miss}{extra}")
            else:
                lines.append(f"  ! {head}{miss}{extra}")
        elif fc.get("ack_unused"):
            lines.append(f"  ~ collection '{fc['name']}': ok but ack {fc.get('ack_id') or 'unsigned'} unused")
    unused = report.get("ledger_unused", [])
    if unused:
        ids = [e.get("id") or "(unsigned)" for e in unused]
        lines.append(f"  ! ledger_unused ({len(unused)}) — no matching diff: {ids}")
    for surface, breakpoints in report.get("ownership", {}).items():
        for bp, rows in breakpoints.items():
            passed = sum(1 for row in rows if row.get("status") == "pass")
            failed = sum(1 for row in rows if row.get("status") == "fail")
            unrealized = sum(1 for row in rows if row.get("status") == "unrealized")
            lines.append(f"  ownership {surface}/{bp}: {passed} pass · {failed} fail · "
                         f"{unrealized} unrealized")
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
                    help="A=extract one side, B=diff mockup<->implementation.")
    ap.add_argument("--side", choices=["mockup", "implementation"], default="implementation",
                    help="Mode A only: which side to extract.")
    ap.add_argument("--ledger-registry", required=True,
                    help="Path to deviations.json. REQUIRED: every tolerated exception must resolve "
                         "to an active entry carrying an expected value. Each ledger id in the config "
                         "is validated against this file; an id that is not an active, unexpired entry "
                         "with an expected value forces verdict=OPEN.")
    args = ap.parse_args()

    try:
        cfg = load_config(args.config)
    except ConfigError as exc:
        print(f"config error: {exc}", file=sys.stderr)
        sys.exit(2)
    unmeasurable = _targets_without_props(cfg)
    if unmeasurable:
        print("config error: no global 'props' and no per-target 'props' for: "
              + ", ".join(unmeasurable), file=sys.stderr)
        sys.exit(2)
    base_dir = Path(args.config).resolve().parent
    report = measure(cfg, args.mode, args.side, base_dir)

    # P1 — validate ledger ids against deviations.json (the authority) in mode B
    if args.mode == "B":
        today = datetime.now(timezone.utc).date()
        registry_errors = _validate_ledger_registry(report, args.ledger_registry, today)
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
