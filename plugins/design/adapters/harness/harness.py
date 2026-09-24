#!/usr/bin/env python3
"""
design:harness — standalone HTML maquette generator.

Produces a single auto-contained HTML file exposing window.setPage(key) /
window.setViewport(mode) and a .preview-bar toolbar. The file is driven by the
fidelity oracle (adapters/measure/measure.py) and the copycat fan-out.

Usage:
  python harness.py --out maquette.html
  python harness.py --out maquette.html --title "My Site" --lang fr --pages "home:Accueil, contact:Contact"
  python harness.py --out maquette.html --title "My Site" --pages-json pages.json
  python harness.py --out maquette.html --contract <dir>   # inline the contract's tokens

Default (no --pages / --pages-json): single placeholder page "page-1" / "Page 1".

pages.json format — list of objects (or {"pages": [...]}):
  [{"key": "home", "label": "Accueil", "route": "/", "source": "pages/index.vue"},
   {"key": "companies", "label": "Entreprises", "route": "/entreprises",
    "source": "pages/entreprises/index.vue", "theme": "entreprise", "group": "Public"}]

--contract (opt-in): inline the contract's already-generated stylesheet adapter — the
  policies.json § adapters[] entry whose consumer is "stylesheet" — into the maquette, so
  the reference speaks the same tokens the implementation is linted against. Nothing is
  derived or regenerated here (option C): the artifact is read as produced by generate.py.

Exit-code space — the WHOLE program, not just --contract: 0 the file is written; 3 the
  contract is 1.x (no release.json) — migrate it (tools/migrate-contract.py); 2 any invalid
  invocation — unreadable/malformed --pages-json, invalid page set, missing or structurally
  invalid contract artifact. Never 1, never 4 (references/harness-contract.md).
"""

import argparse
import html
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "tools"))
from _common import fail as _fail, read_json  # noqa: E402


# ─── Exit-code space ─────────────────────────────────────────────────────────
# 0 / 2 / 3 for the whole program — never 1, never 4 (references/harness-contract.md).
# _fail, from tools/_common.py, prints and returns the 2.


# ─── Page parsing ────────────────────────────────────────────────────────────

def parse_pages_str(s):
    """Parse "key:Label, key2:Label 2" into list of {"key", "label"} dicts."""
    pages = []
    for item in s.split(","):
        item = item.strip()
        if not item:
            continue
        if ":" in item:
            key, _, label = item.partition(":")
            pages.append({"key": key.strip(), "label": label.strip()})
        else:
            pages.append({"key": item, "label": item})
    return pages


def key_to_fn(key):
    """Convert 'my-page-key' → 'pageMyPageKey'."""
    parts = key.replace("-", " ").replace("_", " ").split()
    return "page" + "".join(p.capitalize() for p in parts)


def load_pages_json(path):
    """Read --pages-json into a page list. Returns (pages, code); code is None on success.

    No read path may surface a Python traceback to the caller: every failure is a 2
    naming the file and the cause.
    """
    src = Path(path)
    try:
        raw = src.read_text(encoding="utf-8")
    except FileNotFoundError:
        return None, _fail(f"--pages-json: no such file: {src}")
    except UnicodeDecodeError as exc:
        return None, _fail(f"--pages-json is not UTF-8 text: {src}\n  {exc}")
    except OSError as exc:
        return None, _fail(f"--pages-json is unreadable: {src}\n  {exc}")
    try:
        data = json.loads(raw)
    except ValueError as exc:
        return None, _fail(f"--pages-json is not valid JSON: {src}\n  {exc}")

    if isinstance(data, list):
        entries = data
    elif isinstance(data, dict):
        entries = data.get("pages")
        if not isinstance(entries, list):
            return None, _fail(f'--pages-json object has no "pages" list: {src}')
    else:
        return None, _fail(f"--pages-json is neither a list nor an object: {src}")

    pages = []
    for i, entry in enumerate(entries):
        if not isinstance(entry, dict):
            return None, _fail(
                f'--pages-json entry {i} is not an object: {src}\n'
                f'  Expected {{"key": "...", "label": "..."}}, got {type(entry).__name__}.')
        key = entry.get("key")
        if not isinstance(key, str):
            return None, _fail(f'--pages-json entry {i} has no string "key": {src}')
        label = entry.get("label")
        # label is optional — fall back to the key, as parse_pages_str already does.
        page = {"key": key, "label": label if isinstance(label, str) and label.strip() else key}
        for field in ("group", "route", "source", "theme"):
            value = entry.get(field)
            if value is not None and not isinstance(value, str):
                return None, _fail(
                    f'--pages-json entry {i} has a non-string "{field}": {src}')
            if isinstance(value, str) and value.strip():
                page[field] = value.strip()
        pages.append(page)
    return pages, None


def validate_pages(pages):
    """Refuse a page set that would yield a false or dead harness. Returns a code, or None.

    Called AFTER the "no pages defined" branch: an empty list is that branch's message.
    """
    by_key = {}
    by_fn = {}
    for i, page in enumerate(pages):
        key = page.get("key")
        if not isinstance(key, str) or not key.strip():
            return _fail(f"Error: page {i} has an empty or blank key.")
        if key in by_key:
            return _fail(f"Error: duplicate page key {key!r} (pages {by_key[key]} and {i}).")
        by_key[key] = i
        fn = key_to_fn(key)
        # UAX-31, shared by Python and JS: isidentifier() is stricter than JS, never
        # wrongly so, and it accepts 'café' where an ASCII regex would not.
        if not fn.isidentifier():
            return _fail(
                f"Error: page key {key!r} derives the invalid function name {fn!r}.\n"
                "  A page key is a slug (letters, digits, '-' or '_'), never a URL path: "
                "the site serves /contact/, the key is 'contact'.")
        if fn in by_fn:
            return _fail(
                f"Error: page keys {by_fn[fn]!r} and {key!r} both derive the function name "
                f"{fn!r}; '-', '_' and letter case do not distinguish two pages.")
        by_fn[fn] = key
    return None


# ─── HTML fragment builders ──────────────────────────────────────────────────

def js_literal(s):
    """A JS string literal for `s` — quotes, backslashes and newlines all covered."""
    # HTML parses </script> before JavaScript does, even inside a JS string. Escaping
    # angle brackets and ampersands keeps page metadata inert in the first script.
    return (json.dumps(s, ensure_ascii=False)
            .replace("<", "\\u003c").replace(">", "\\u003e").replace("&", "\\u0026"))


def comment_text(value):
    """Single-line text safe inside the generated HTML framing comment."""
    flat = " ".join(str(value).splitlines()).strip()
    # Escape markup as well as the comment terminator: the framing is inert, but copied
    # user metadata must never look like authored HTML to downstream tools or humans.
    return re.sub(r"-(?=-)", "- ", html.escape(flat, quote=False))

def build_options(pages):
    """<option> / <optgroup> HTML for the page selector."""
    ungrouped = [p for p in pages if not p.get("group")]
    groups = {}
    for p in pages:
        g = p.get("group")
        if g:
            groups.setdefault(g, []).append(p)

    lines = []
    for p in ungrouped:
        key, label = html.escape(p["key"]), html.escape(p["label"])
        lines.append(f'        <option value="{key}">{label}</option>')
    for g_name, g_pages in groups.items():
        lines.append(f'        <optgroup label="{html.escape(g_name)}">')
        for p in g_pages:
            key, label = html.escape(p["key"]), html.escape(p["label"])
            lines.append(f'          <option value="{key}">{label}</option>')
        lines.append("        </optgroup>")
    return "\n".join(lines)


def build_functions(pages):
    """JS page function declarations (one per page, returning placeholder HTML)."""
    lines = []
    for p in pages:
        fn = key_to_fn(p["key"])
        k = js_literal(p["key"])
        # placeholder() writes the label through innerHTML: same html.escape as the
        # <option>, so the selector and the page show one and the same text.
        lbl = js_literal(html.escape(p["label"]))
        lines.append(f"  function {fn}() {{ return placeholder({k}, {lbl}); }}")
    return "\n".join(lines)


def build_page_context(pages):
    """Human/LLM mapping from harness keys to the supplied real sources."""
    lines = []
    for page in pages:
        details = []
        if page.get("route"):
            details.append(f"route: {comment_text(page['route'])}")
        if page.get("source"):
            details.append(f"source: {comment_text(page['source'])}")
        if page.get("theme"):
            details.append(f"theme: {comment_text(page['theme'])}")
        suffix = " | ".join(details) if details else "source non fournie"
        lines.append(
            f"    • {comment_text(page['key'])} — {comment_text(page['label'])} | {suffix}")
    return "\n".join(lines)


def build_metadata(pages):
    """JS page metadata used to apply the frozen contract theme at runtime."""
    lines = []
    for page in pages:
        fields = []
        for field in ("route", "source", "theme"):
            if page.get(field):
                fields.append(f"{field}: {js_literal(page[field])}")
        lines.append(f"    {js_literal(page['key'])}: {{{', '.join(fields)}}},")
    return "\n".join(lines)


def build_registry(pages):
    """JS object literal entries for the pages const."""
    lines = []
    for p in pages:
        lines.append(f"    {js_literal(p['key'])}: {key_to_fn(p['key'])},")
    return "\n".join(lines)


# ─── Template ────────────────────────────────────────────────────────────────
# Uses %%PLACEHOLDER%% substitution — no .format() — so {} in HTML/CSS/JS are literal.

TEMPLATE = r"""<!DOCTYPE html>
<html lang="%%LANG%%">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>%%TITLE%% — maquette de référence</title>
%%TOKENS_STYLE%%
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #1F2A37; overflow: hidden; }

  /* ===== Preview chrome — HIDDEN by the fidelity oracle before measuring ===== */
  .preview-bar {
    position: fixed; top: 0; left: 0; right: 0; height: 56px; z-index: 9999;
    display: flex; align-items: center; justify-content: space-between; padding: 0 24px;
    background: #1F2A37; color: #fff; border-bottom: 1px solid rgba(255,255,255,.1);
  }
  .preview-bar__brand { font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 12px; }
  .preview-bar__brand small { font-size: 12px; font-weight: 400; color: rgba(255,255,255,.5); letter-spacing: .04em; text-transform: uppercase; }
  .preview-bar__controls { display: flex; gap: 12px; align-items: center; }
  .page-select {
    background: rgba(255,255,255,.08); color: #fff; border: 1px solid rgba(255,255,255,.15);
    padding: 8px 32px 8px 14px; font-size: 13px; font-weight: 500; border-radius: 8px; cursor: pointer;
    appearance: none; -webkit-appearance: none; min-width: 220px;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2'><polyline points='6 9 12 15 18 9'/></svg>");
    background-repeat: no-repeat; background-position: right 10px center;
  }
  .page-select option { background: #1F2A37; }
  .page-select optgroup { font-weight: 600; }
  .viewport-toggle { display: flex; gap: 4px; padding: 4px; background: rgba(255,255,255,.08); border-radius: 8px; }
  .viewport-btn {
    background: transparent; border: none; color: rgba(255,255,255,.7); padding: 6px 12px;
    font-size: 13px; font-weight: 500; border-radius: 6px; cursor: pointer;
    display: flex; align-items: center; gap: 6px; transition: all .2s;
  }
  .viewport-btn svg { width: 14px; height: 14px; }
  .viewport-btn:hover { color: #fff; }
  .viewport-btn.active { background: #fff; color: #1F2A37; }

  /* ===== Stage + device frame ===== */
  .preview-stage { position: fixed; top: 56px; left: 0; right: 0; bottom: 0; overflow-y: auto; background: #f0f0f0; }
  .preview-frame {
    width: 100%; max-width: 100%; margin: 0 auto; position: relative; overflow-x: hidden;
    background: #fff; transition: max-width .4s cubic-bezier(.22,1,.36,1);
  }
  .preview-frame.tablet { max-width: 834px; border-radius: 24px; outline: 10px solid #1F2A37; box-shadow: 0 30px 80px rgba(0,0,0,.25); margin: 34px auto; overflow: hidden; }
  .preview-frame.mobile { max-width: 390px; border-radius: 32px; outline: 8px solid #1F2A37; box-shadow: 0 30px 80px rgba(0,0,0,.3); margin: 40px auto; overflow: hidden; }
  /* 834 / 390 are fixed device samples, not contract breakpoints — see the RESPONSIVE note.
     The bezel is an outline, never a border: a border would sit inside the box (box-sizing:
     border-box) and shrink the content box below the sample width, charging the difference to
     a conformant implementation when the fidelity oracle measures percentage-derived values.
     The margins absorb the outline (24+10, 32+8) so the visual gap is unchanged. */
  #page-container { display: block; width: 100%; }

  /* Placeholder until a page function is filled in, and the render error state. */
  .ph { padding: 80px 32px; text-align: center; color: #6B7280; }
  .ph h1 { font-size: 28px; color: #1F2A37; margin-bottom: 12px; font-weight: 600; }
  .ph p { font-size: 14px; line-height: 1.6; }
  .ph p + p { margin-top: 12px; }
  .ph code { background: #F4F4F4; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
  .ph--error h1 { color: #B42318; }
  .ph--error .ph__message { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: #B42318; }

  /* Author responsive overrides: `.preview-frame.mobile <sel>` / `.preview-frame.tablet <sel>`
     They fire both in manual preview (frame class) AND under the fidelity oracle, which
     toggles the same class via window.setViewport. Viewport-dependent rules are class-based;
     accessibility preference queries (reduced motion, contrast, forced colors) remain allowed.
     The three frames are device samples (desktop fluid · tablet 834 · mobile 390),
     not contract breakpoints: nothing here is derived from tokens.json § breakpoint.*. */

  /* ===== AUTHOR PAGE STYLES — LLM MAY EDIT BETWEEN THESE MARKERS ===== */
  /* ===== END AUTHOR PAGE STYLES ===== */
</style>
</head>
<body>
<!--
  ============================================================================
  MAQUETTE DE RÉFÉRENCE · %%TITLE_COMMENT%%
  Généré par : design:harness (adapters/harness/harness.py)
  ============================================================================
  À QUOI SERT CE FICHIER
    Formaliser une maquette pour le plugin `design` : piloté par l'oracle de
    fidélité (adapters/measure/measure.py) et par le fan-out `copycat`.
    Contrat : window.setPage(key) · window.setViewport(mode) · barre .preview-bar.

  COMMENT LE REMPLIR (1 page = 1 fonction)
    1. Dans le 1er <script>, chaque page est une fonction `pageXxx()` qui RETOURNE
       le HTML de la page (template literal). Remplace le corps :
           function pageHome() { return placeholder('home', 'Accueil'); }
       devient :
           function pageHome() { return `
             <header class="site-header">...</header>
             <main>...</main>
             <footer class="site-footer">...</footer>
           `; }
    2. Le HTML retourné est injecté dans #page-container : PAS de
       <html>/<head>/<body> ni de <style> global dans la fonction.
       Les styles vont dans le <style> du <head>.
    3. La clé de page doit correspondre à la valeur de l'<option> ET
       au champ "reference_page" du config measure. Trois branches, un seul
       ensemble : renommer une clé sans renommer les deux autres produit une
       page injoignable, ou une mesure d'un vide. Vérifiable :
           node tools/harness-runtime-check.mjs <fichier.html> \
             [--oracle-config <config.json>]

  RÈGLES ORACLE (fidélité mesurée)
    • Sélecteurs STABLES et sémantiques (BEM : .hero__title, .card__price).
    • Un seul h1 par page ; hiérarchie de titres réelle (h2/h3 par section).
    • NE PAS modifier .preview-bar, les registres ni le contrôle hors zones auteur.
    • URLs absolues ou data: pour images / fonts (fichier servi en statique).

  CONTEXTE DES PAGES (clé → route/source/thème)
%%PAGE_CONTEXT%%
    Inspecter la source exacte de la page avant de l'écrire. Ne pas inventer un
    contenu absent de la source. Le runtime applique automatiquement `theme` sur
    #page-container via data-theme avant chaque rendu.

  RESPONSIVE
    Écrire les variations device en CLASSE dans le <style> du <head> :
        .preview-frame.mobile .hero__title { font-size: 28px; }
        .preview-frame.tablet .hero__inner { grid-template-columns: 1fr; }
    JAMAIS de media query de largeur/orientation : la classe bascule à l'aperçu manuel ET sous l'oracle
    (qui appelle window.setViewport). Les trois cadres sont des ÉCHANTILLONS
    device — desktop (fluide) · tablet 834 · mobile 390 — pas des breakpoints
    du contrat : rien ici ne dérive de tokens.json § breakpoint.*.
    Les media queries de préférence/accessibilité restent admises :
    prefers-reduced-motion, prefers-contrast, forced-colors, prefers-color-scheme.

  ============================================================================
  PROMPT LLM (à copier pour faire remplir une page depuis sa source)
  ============================================================================
    « Voici une maquette de référence "%%TITLE_COMMENT%%" (harness HTML auto-contenu avec
      .preview-bar, registre `pages` de fonctions, responsive par classe
      .preview-bar, registre `pages`, responsive par classe
      .preview-frame.mobile|tablet). Pour la page "<CLÉ>", consulte sa route,
      sa source et son thème dans CONTEXTE DES PAGES. Reproduis fidèlement la
      source sans inventer de contenu. Modifie uniquement les zones auteur :
      le corps de `pageXxx()` pour le HTML, AUTHOR PAGE STYLES pour son CSS,
      AUTHOR SHARED HELPERS pour les helpers purs partagés et, seulement si le mode
      interactif a été choisi, AUTHOR AFTER RENDER pour les comportements visibles.
      Retourne du HTML sans <html>/<head>/<body>, avec classes STABLES BEM et un
      seul h1. Écris les variations device avec .preview-frame.mobile / .tablet,
      jamais avec des media queries de viewport. Ne modifie ni .preview-bar,
      ni le registre, ni les métadonnées, ni le contrôle hors zones auteur. »%%CONTRACT_NOTE_HEADER%%
  ============================================================================
-->
  <div class="preview-bar">
    <div class="preview-bar__brand">
      %%TITLE%% <small>maquette</small>
    </div>
    <div class="preview-bar__controls">
      <select class="page-select" id="page-select" aria-label="Page">
%%PAGE_OPTIONS%%
      </select>
      <div class="viewport-toggle" role="group" aria-label="Device">
        <button class="viewport-btn active" data-viewport="desktop" type="button" aria-pressed="true"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> Desktop</button>
        <button class="viewport-btn" data-viewport="tablet" type="button" aria-pressed="false"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="18" r="1" fill="currentColor" stroke="none"/></svg> Tablette</button>
        <button class="viewport-btn" data-viewport="mobile" type="button" aria-pressed="false"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="18" r="1" fill="currentColor" stroke="none"/></svg> Mobile</button>
      </div>
    </div>
  </div>

  <div class="preview-stage">
    <div class="preview-frame" id="preview-frame">
      <div id="page-container" class="site"></div>
    </div>
  </div>

  <script>
    // ===== Page registry — one function per page, returning the page HTML string. =====
    // FILL EACH PAGE: replace `placeholder(...)` body with the page markup:
    //   function pageHome() { return `<header class="site-header">…</header><main>…</main>`; }
    // Rules:
    //   • return ONLY the page content (no <html>/<head>/<body>); global styles go in <head>.
    //   • stable, semantic class names (BEM) — the fidelity oracle measures by CSS selector.
    //   • device variations as `.preview-frame.mobile|tablet <sel>` in <head>, no viewport media queries.
    //   • edit CSS only between the AUTHOR PAGE STYLES markers in <head>.
    //   • never edit .preview-bar, registries, metadata, or control code outside author zones.%%CONTRACT_NOTE_RULES%%
    // ===== AUTHOR SHARED HELPERS — PURE ONLY; NO DOM, NETWORK, OR TIMERS =====
    // Shared markup helpers belong here so repeated icons/chrome are not copied into every page.
    // ===== END AUTHOR SHARED HELPERS =====

    function placeholder(key, label) {
      return '<div class="ph"><h1>' + label + '</h1>'
        + '<p>Page <code>' + key + '</code> — remplacez le corps de la fonction '
        + 'dans le registre <code>pages</code> ci-dessous.</p></div>';
    }

%%PAGE_FUNCTIONS%%

    const pages = {
%%PAGE_REGISTRY%%
    };

    const pageMetadata = {
%%PAGE_METADATA%%
    };
  </script>

  <script>
    let currentPage = %%FIRST_PAGE_KEY%%;
    let currentViewport = 'desktop';
    const container = document.getElementById('page-container');
    const frame = document.getElementById('preview-frame');
    const select = document.getElementById('page-select');

    function esc(s) {
      return String(s).replace(/[&<>]/g, function (c) {
        return c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;';
      });
    }
    function keyToFn(key) {
      return 'page' + key.replace(/[-_]/g, ' ').split(/\s+/).filter(Boolean)
        .map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); }).join('');
    }
    function errorBlock(key, err) {
      return '<div class="ph ph--error"><h1>⚠ La page « ' + esc(key) + ' » n\'a pas pu être rendue</h1>'
        + '<p class="ph__message">' + esc(err && err.message ? err.message : err) + '</p>'
        + '<p>Corrigez <code>' + esc(keyToFn(key)) + '()</code> dans ce fichier.</p></div>';
    }

    // ===== AUTHOR AFTER RENDER — INTERACTIVE MODE ONLY =====
    // Bind page-local behaviour below. This hook runs after every page render.
    function afterPageRender(root, page) {}
    // ===== END AUTHOR AFTER RENDER =====

    function render() {
      let markup;
      try {
        const meta = pageMetadata[currentPage] || {};
        if (meta.theme) container.setAttribute('data-theme', meta.theme);
        else container.removeAttribute('data-theme');
        // The lookup is inside the try: when the first <script> died, `pages` is not
        // defined and THIS line throws — before any page function is even called.
        const fn = pages[currentPage];
        markup = fn ? fn()
          : '<div class="ph"><h1>Page introuvable</h1><p>Aucune fonction n\'est enregistrée pour '
            + '<code>' + esc(currentPage) + '</code>.</p></div>';
      } catch (e) {
        // Rendered state, never a propagated exception: the fidelity oracle calls
        // window.setPage(key) unguarded and must get a DOM, not a stack trace.
        console.error('[harness] page "' + currentPage + '" failed to render:', e);
        markup = errorBlock(currentPage, e);
      }
      container.innerHTML = markup;
      try {
        afterPageRender(container, currentPage);
      } catch (e) {
        console.error('[harness] page "' + currentPage + '" behaviour failed:', e);
        container.innerHTML = errorBlock(currentPage, e);
      }
      const stage = document.querySelector('.preview-stage');
      if (stage) stage.scrollTop = 0;
    }
    function setPage(page) {
      currentPage = page;
      if (select && select.value !== page) select.value = page;
      try { history.replaceState(null, '', '#' + encodeURIComponent(page)); } catch (e) {}
      render();
    }
    function setViewport(vp) {
      currentViewport = vp;
      frame.classList.remove('tablet', 'mobile');
      if (vp === 'tablet' || vp === 'mobile') frame.classList.add(vp);
      document.querySelectorAll('.viewport-btn').forEach(b => {
        // Visual state and exposed state move together — they cannot diverge.
        const on = b.dataset.viewport === vp;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    window.setPage = setPage;
    window.setViewport = setViewport;

    select.addEventListener('change', e => setPage(e.target.value));
    document.querySelectorAll('.viewport-btn').forEach(
      b => b.addEventListener('click', () => setViewport(b.dataset.viewport))
    );

    (function init() {
      // decodeURIComponent THROWS on a malformed fragment (#%E0%A4%A), so it belongs
      // inside the try: outside it, the URIError aborted init() before setViewport()
      // and render(), leaving #page-container empty — a blank file with no error block.
      // Same reason as in render(): reading the registry is what throws when the
      // page-functions script died. Swallowing here lets render() report it on screen.
      try {
        const hash = decodeURIComponent((location.hash || '').slice(1));
        if (hash && pages[hash]) { currentPage = hash; if (select) select.value = hash; }
      } catch (e) {}
      setViewport('desktop');
      render();
    })();
  </script>
</body>
</html>
"""


# ─── Contract resolution (opt-in --contract) ─────────────────────────────────
# Option C: inline the ALREADY-generated stylesheet adapter. Nothing is derived or
# regenerated here — the harness reads what generate.py produced. Exit-code space is
# 0 / 2 / 3, never 1, never 4 (master § Exit-code space; references/harness-contract.md).

RELEASE = "release.json"
POLICIES = "policies.json"

CONTRACT_NOTE_RULES = (
    "\n    //   • when a contract is supplied, consume inline tokens via var(--…) and obey"
    "\n    //     every frozen policy copied into the framing comment above."
)


def build_contract_note(policies, stylesheet_inlined):
    """Copy frozen policy guidance into the LLM framing; never derive new rules."""
    lines = ["\n\n  CONTRAT FOURNI (--contract)"]
    if stylesheet_inlined:
        lines.extend([
            "    La feuille de tokens générée est inline dans le <head>, avant le chrome.",
            "    Consomme ces tokens via var(--…) ; ne code jamais en dur couleur/espacement/typo.",
        ])
    else:
        lines.append("    Aucune feuille de tokens stylesheet n'est inline ; ne prétends pas la conformité visuelle.")
    mode = policies.get("mode")
    if isinstance(mode, str) and mode.strip():
        lines.append(f"    Mode gelé : {comment_text(mode)}")
    rules = policies.get("usage", {}).get("rules") if isinstance(policies.get("usage"), dict) else None
    copied = []
    if isinstance(rules, list):
        for rule in rules:
            if not isinstance(rule, dict):
                continue
            rule_id = rule.get("id")
            description = rule.get("description")
            if isinstance(rule_id, str) and isinstance(description, str):
                copied.append(f"      • [{comment_text(rule_id)}] {comment_text(description)}")
    if copied:
        lines.append("    Règles gelées copiées de policies.json § usage.rules :")
        lines.extend(copied)
    else:
        lines.append("    policies.json ne déclare aucune usage.rules à recopier.")
    return "\n".join(lines)


def resolve_tokens_style(contract):
    """Resolve the contract's stylesheet adapter into an inline <style> block.

    Returns (style, note, code). code is None on success; style is the <style> block, or ""
    when the contract declares no stylesheet adapter (scaffold, one stderr warning).
    A non-None code (3 = 1.x contract, 2 = missing/unreadable/invalid artifact) means
    the caller stops with that code — the file is not written.
    """
    cdir = Path(contract)
    release = cdir / RELEASE
    if not release.is_file():
        # Absence alone means 1.x — the only branch that yields 3.
        print(f"1.x contract: no {RELEASE} in {cdir.resolve()}\n"
              f"  Migrate it first: python tools/migrate-contract.py --contract {contract}",
              file=sys.stderr)
        return None, None, 3
    try:
        json.loads(release.read_text(encoding="utf-8"))
    except (ValueError, OSError) as exc:
        # Present but corrupt is a broken contract, not a 1.x one: exit 2, not 3.
        return None, None, _fail(f"Unreadable {RELEASE}: {exc}\n  {release.resolve()}\n"
                           "  A present but invalid release.json is a broken contract, "
                           "not 1.x — fix the artifact or re-freeze the contract.")

    policies_path = cdir / POLICIES
    policies, code = read_json(policies_path)
    if code is not None:
        return None, None, code
    if not isinstance(policies, dict):
        return None, None, _fail(f"{POLICIES} is not an object: {policies_path.resolve()}")

    adapters = policies.get("adapters")
    entry = None
    if isinstance(adapters, list):
        for candidate in adapters:
            if isinstance(candidate, dict) and candidate.get("consumer") == "stylesheet":
                entry = candidate
                break
    if entry is None:
        print(f"Warning: no adapters[] entry declares consumer \"stylesheet\" in {POLICIES}; "
              "continuing in scaffold mode (no tokens inlined).", file=sys.stderr)
        return "", build_contract_note(policies, False), None

    artifact = entry.get("artifact")
    if not isinstance(artifact, str) or not artifact:
        return None, None, _fail(f"{POLICIES} adapters[].artifact is not a non-empty string: "
                           f"{policies_path.resolve()}")
    # The artifact path is confined BEFORE the file is opened: a refused path is never
    # read. `cdir / artifact` protects nothing on its own — pathlib lets an absolute
    # operand win outright, and a relative "../…" simply walks out. relative_to() under
    # try/except, not is_relative_to(), which would floor the interpreter at 3.9.
    css_path = (cdir / artifact).resolve()
    root = cdir.resolve()
    try:
        css_path.relative_to(root)
    except ValueError:
        return None, None, _fail(f"Declared stylesheet adapter resolves outside the contract "
                           f"directory: {css_path}\n"
                           f"  Contract directory: {root}\n"
                           f"  Declared in: {policies_path.resolve()}\n"
                           f"  Paths are resolved, so a symlinked artifact directory "
                           f"pointing outside the contract is refused here too.\n"
                           f"  Declare an artifact inside the contract directory.")
    try:
        css = css_path.read_text(encoding="utf-8")
    except (OSError, ValueError):
        # Option C: the harness never derives the stylesheet — generate.py owns it.
        return None, None, _fail(f"Declared stylesheet adapter is absent or unreadable: "
                           f"{css_path}\n"
                           f"  Generate it first: python tools/generate.py --contract {contract}")
    # The stylesheet is inlined verbatim inside <style>…</style>. A closing style tag is
    # the one sequence that leaves CSS and re-enters HTML, so it is refused, never
    # escaped: tools/generate.py never emits it, so the refusal has no legitimate false
    # positive, and escaping would ship an artifact nobody understands.
    breakout = re.search(r"</\s*style", css, re.I)
    if breakout:
        return None, None, _fail(f"Structurally invalid stylesheet adapter: it closes the "
                           f"<style> context ({breakout.group(0)!r} at offset "
                           f"{breakout.start()}).\n"
                           f"  {css_path}\n"
                           f"  A generated stylesheet never contains that sequence.\n"
                           f"  Re-generate it: python tools/generate.py --contract {contract}")
    style = "<style>\n" + css.rstrip("\n") + "\n</style>"
    return style, build_contract_note(policies, True), None


# ─── Template substitution ───────────────────────────────────────────────────

_SENTINEL = re.compile(r"%%(\w+)%%(\n?)")


def missing_sentinels(template, values):
    """Sentinels the template names and `values` does not carry.

    The scan is on the TEMPLATE only, never on a value: a --title reading
    "%%PAGE_OPTIONS%%" is not a missing key, it is text. A dropped or misspelled key,
    on the other hand, ships `%%FOO%%` in the HTML at exit 0 — the dead-file-at-green
    defect one level up, which is why it is a 2 and not a warning.
    """
    return sorted({name for name, _ in _SENTINEL.findall(template)} - set(values))


def substitute(template, values):
    """Fill every %%SENTINEL%% in one pass.

    One pass, not a chain of .replace(): a value injected by one sentinel is never
    rescanned as the next — a --title reading "%%PAGE_OPTIONS%%" stays literal.
    Callers check missing_sentinels() first; an unknown name is left literal here so
    that user text is never eaten.
    """
    def repl(match):
        name, eol = match.group(1), match.group(2)
        if name not in values:
            return match.group(0)
        value = values[name]
        # %%TOKENS_STYLE%% absorbs its own line when there is no stylesheet to inline.
        if name == "TOKENS_STYLE" and not value:
            return ""
        return value + eol

    return _SENTINEL.sub(repl, template)


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser(description="design:harness — HTML maquette generator")
    ap.add_argument("--out", required=True, help="Output HTML file path")
    ap.add_argument("--title", default="Maquette", help='Project title (default: "Maquette")')
    ap.add_argument("--lang", default="en", help='Document language for <html lang> (default: "en")')
    ap.add_argument("--pages", default=None,
                    help='Pages as "key:Label, key2:Label 2" (default: page-1:Page 1)')
    ap.add_argument("--pages-json", default=None,
                    help="Path to JSON file — list [{key, label, group?}] or {pages: [...]}")
    ap.add_argument("--contract", default=None,
                    help="Contract dir — inline its generated stylesheet adapter (opt-in)")
    args = ap.parse_args()

    # Opt-in contract coupling. Absent, style stays "" and the scaffold path is unchanged.
    style = ""
    contract_note = ""
    if args.contract is not None:
        style, contract_note, code = resolve_tokens_style(args.contract)
        if code is not None:
            return code

    if args.pages_json:
        pages, code = load_pages_json(args.pages_json)
        if code is not None:
            return code
    elif args.pages:
        pages = parse_pages_str(args.pages)
    else:
        pages = [{"key": "page-1", "label": "Page 1"}]

    if not pages:
        # An invocation error, not a violation (1) — 1 is not in the harness code space.
        print("Error: no pages defined.", file=sys.stderr)
        return 2

    code = validate_pages(pages)
    if code is not None:
        return code

    values = {
        "TOKENS_STYLE": style,
        "CONTRACT_NOTE_HEADER": contract_note,
        "CONTRACT_NOTE_RULES": CONTRACT_NOTE_RULES if args.contract is not None else "",
        "LANG": html.escape(args.lang),
        "TITLE": html.escape(args.title),
        # An HTML comment ends at "-->": break every "--" run so a title cannot close it.
        "TITLE_COMMENT": comment_text(args.title),
        "PAGE_CONTEXT": build_page_context(pages),
        "PAGE_OPTIONS": build_options(pages),
        "PAGE_FUNCTIONS": build_functions(pages),
        "PAGE_REGISTRY": build_registry(pages),
        "PAGE_METADATA": build_metadata(pages),
        "FIRST_PAGE_KEY": js_literal(pages[0]["key"]),
    }

    absent = missing_sentinels(TEMPLATE, values)
    if absent:
        return _fail(
            "Error: the template names sentinel(s) no value fills: "
            + ", ".join(f"%%{n}%%" for n in absent)
            + "\n  A generator bug, not an invocation error — but writing the file anyway "
            "would ship the literal sentinel in the HTML at exit 0.")

    document = substitute(TEMPLATE, values)

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(document, encoding="utf-8")
    print(f"Harness written -> {out}  ({len(pages)} page(s))")
    return 0


if __name__ == "__main__":
    sys.exit(main())
