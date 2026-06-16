#!/usr/bin/env python3
"""
design:harness — standalone HTML maquette generator.

Produces a single auto-contained HTML file exposing window.setPage(key) /
window.setViewport(mode) and a .preview-bar toolbar. The file is driven by the
fidelity oracle (adapters/measure/measure.py) and the copycat fan-out.

Usage:
  python harness.py --out maquette.html
  python harness.py --out maquette.html --title "My Site" --pages "home:Accueil, contact:Contact"
  python harness.py --out maquette.html --title "My Site" --pages-json pages.json

Default (no --pages / --pages-json): single placeholder page "page-1" / "Page 1".

pages.json format — list of objects (or {"pages": [...]}):
  [{"key": "home", "label": "Accueil"}, {"key": "about", "label": "À propos", "group": "Info"}]
"""

import argparse
import json
import sys
from pathlib import Path


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


# ─── HTML fragment builders ──────────────────────────────────────────────────

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
        lines.append(f'        <option value="{p["key"]}">{p["label"]}</option>')
    for g_name, g_pages in groups.items():
        lines.append(f'        <optgroup label="{g_name}">')
        for p in g_pages:
            lines.append(f'          <option value="{p["key"]}">{p["label"]}</option>')
        lines.append("        </optgroup>")
    return "\n".join(lines)


def build_functions(pages):
    """JS page function declarations (one per page, returning placeholder HTML)."""
    lines = []
    for p in pages:
        fn = key_to_fn(p["key"])
        k = p["key"].replace("'", "\\'")
        lbl = p["label"].replace("'", "\\'").replace("<", "&lt;").replace(">", "&gt;")
        lines.append(f"  function {fn}() {{ return placeholder('{k}', '{lbl}'); }}")
    return "\n".join(lines)


def build_registry(pages):
    """JS object literal entries for the pages const."""
    lines = []
    for p in pages:
        fn = key_to_fn(p["key"])
        k = p["key"].replace("'", "\\'")
        lines.append(f"    '{k}': {fn},")
    return "\n".join(lines)


# ─── Template ────────────────────────────────────────────────────────────────
# Uses %%PLACEHOLDER%% substitution — no .format() — so {} in HTML/CSS/JS are literal.

TEMPLATE = r"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>%%TITLE%% — maquette de référence</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
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
  .preview-frame.tablet { max-width: 834px; border-radius: 24px; border: 10px solid #1F2A37; box-shadow: 0 30px 80px rgba(0,0,0,.25); margin: 24px auto; overflow: hidden; }
  .preview-frame.mobile { max-width: 390px; border-radius: 32px; border: 8px solid #1F2A37; box-shadow: 0 30px 80px rgba(0,0,0,.3); margin: 32px auto; overflow: hidden; }
  #page-container { display: block; width: 100%; }

  /* Placeholder until a page function is filled in. */
  .ph { padding: 80px 32px; text-align: center; color: #6B7280; }
  .ph h2 { font-size: 28px; color: #1F2A37; margin-bottom: 12px; font-weight: 600; }
  .ph p { font-size: 14px; line-height: 1.6; }
  .ph code { background: #F4F4F4; padding: 2px 6px; border-radius: 4px; font-size: 13px; }

  /* Author responsive overrides: `.preview-frame.mobile <sel>` / `.preview-frame.tablet <sel>`
     They fire both in manual preview (frame class) AND under the fidelity oracle (real viewport + class).
     @media also works under the oracle (it sets the viewport to the breakpoint width). */
</style>
</head>
<body>
<!--
  ============================================================================
  MAQUETTE DE RÉFÉRENCE · %%TITLE%%
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
       au champ "maquette_page" du config measure.

  RÈGLES ORACLE (fidélité mesurée)
    • Sélecteurs STABLES et sémantiques (BEM : .hero__title, .card__price).
    • Un seul h1 par page ; hiérarchie de titres réelle (h2/h3 par section).
    • NE PAS modifier .preview-bar ni les <script> de contrôle.
    • URLs absolues ou data: pour images / fonts (fichier servi en statique).

  RESPONSIVE
    Écrire les variations device en CLASSE dans le <style> du <head> :
        .preview-frame.mobile .hero__title { font-size: 28px; }
        .preview-frame.tablet .hero__inner { grid-template-columns: 1fr; }
    @media fonctionne aussi pour la mesure oracle (l'oracle met la fenêtre
    au breakpoint réel), mais le class-based est préféré pour l'aperçu manuel.
    Devices : desktop (fluide) · tablet 834 · mobile 390.

  ============================================================================
  PROMPT LLM (à copier pour faire remplir une page depuis un visuel/brief)
  ============================================================================
    « Voici une maquette de référence "%%TITLE%%" (harness HTML auto-contenu avec
      .preview-bar, registre `pages` de fonctions, responsive par classe
      .preview-frame.mobile|tablet). À partir du visuel/brief que je te donne
      pour la page "<CLÉ>", remplis UNIQUEMENT le corps de la fonction `pageXxx()` :
      retourne le HTML (sans <html>/<head>/<body>), classes STABLES BEM,
      hiérarchie de titres (un seul h1), styles dans le <style> du <head> —
      variations device en .preview-frame.mobile / .preview-frame.tablet
      (jamais @media dans les fonctions). Ne modifie pas .preview-bar ni les scripts. »
  ============================================================================
-->
  <div class="preview-bar">
    <div class="preview-bar__brand">
      %%TITLE%% <small>maquette</small>
    </div>
    <div class="preview-bar__controls">
      <select class="page-select" id="page-select">
%%PAGE_OPTIONS%%
      </select>
      <div class="viewport-toggle" role="group" aria-label="Device">
        <button class="viewport-btn active" data-viewport="desktop" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> Desktop</button>
        <button class="viewport-btn" data-viewport="tablet" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="18" r="1" fill="currentColor" stroke="none"/></svg> Tablette</button>
        <button class="viewport-btn" data-viewport="mobile" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="18" r="1" fill="currentColor" stroke="none"/></svg> Mobile</button>
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
    //   • device variations as `.preview-frame.mobile|tablet <sel>` in <head> (not @media).
    //   • never edit .preview-bar or the control scripts below.
    function placeholder(key, label) {
      return '<div class="ph"><h2>' + label + '</h2>'
        + '<p>Page <code>' + key + '</code> — remplacez le corps de la fonction '
        + 'dans le registre <code>pages</code> ci-dessous.</p></div>';
    }

%%PAGE_FUNCTIONS%%

    const pages = {
%%PAGE_REGISTRY%%
    };
  </script>

  <script>
    let currentPage = '%%FIRST_PAGE_KEY%%';
    let currentViewport = 'desktop';
    const container = document.getElementById('page-container');
    const frame = document.getElementById('preview-frame');
    const select = document.getElementById('page-select');

    function render() {
      const fn = pages[currentPage];
      container.innerHTML = fn ? fn() : '<div class="ph"><h2>Page introuvable</h2></div>';
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
      document.querySelectorAll('.viewport-btn').forEach(
        b => b.classList.toggle('active', b.dataset.viewport === vp)
      );
    }

    window.setPage = setPage;
    window.setViewport = setViewport;

    select.addEventListener('change', e => setPage(e.target.value));
    document.querySelectorAll('.viewport-btn').forEach(
      b => b.addEventListener('click', () => setViewport(b.dataset.viewport))
    );

    (function init() {
      const hash = decodeURIComponent((location.hash || '').slice(1));
      if (hash && pages[hash]) { currentPage = hash; if (select) select.value = hash; }
      setViewport('desktop');
      render();
    })();
  </script>
</body>
</html>
"""


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser(description="design:harness — HTML maquette generator")
    ap.add_argument("--out", required=True, help="Output HTML file path")
    ap.add_argument("--title", default="Maquette", help='Project title (default: "Maquette")')
    ap.add_argument("--pages", default=None,
                    help='Pages as "key:Label, key2:Label 2" (default: page-1:Page 1)')
    ap.add_argument("--pages-json", default=None,
                    help="Path to JSON file — list [{key, label, group?}] or {pages: [...]}")
    args = ap.parse_args()

    if args.pages_json:
        data = json.loads(Path(args.pages_json).read_text("utf-8"))
        pages = data if isinstance(data, list) else data.get("pages", [])
    elif args.pages:
        pages = parse_pages_str(args.pages)
    else:
        pages = [{"key": "page-1", "label": "Page 1"}]

    if not pages:
        print("Error: no pages defined.", file=sys.stderr)
        sys.exit(1)

    html = (TEMPLATE
            .replace("%%TITLE%%", args.title)
            .replace("%%PAGE_OPTIONS%%", build_options(pages))
            .replace("%%PAGE_FUNCTIONS%%", build_page_functions(pages))
            .replace("%%PAGE_REGISTRY%%", build_registry(pages))
            .replace("%%FIRST_PAGE_KEY%%", pages[0]["key"]))

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding="utf-8")
    print(f"✓ Harness written → {out}  ({len(pages)} page(s))")


if __name__ == "__main__":
    main()
