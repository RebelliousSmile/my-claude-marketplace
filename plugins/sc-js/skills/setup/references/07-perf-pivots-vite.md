---
paths:
  - "vite.config.ts"
  - "vite.config.js"
---

# Perf pivots — Vite (build tool, hybride avec n'importe quel backend)

Stack-specific overrides applied **in addition** to backend pivots when `vite.config.{js,ts}` or `@vitejs/plugin-*` is detected (Laravel + Vite, Django + Vite, etc.). Loaded by `web-optimize`.

## §0 — Pre-flight

- `pnpm vite build 2>&1 | tee build.log` — capturer entry chunk size, vendor chunks, total bytes (raw + gzip) AVANT toute optim
- **Warnings load-bearing** :
  - `dynamic import will not move` = import statique dans l'entry chunk — dégradation TBT directe
  - `chunk size limit exceeded` (> 500 KB gzip)
  - `Circular dependency` sur dépendance partagée
- PSI : variance ±15 normale en mode hybride ; 5 runs, médiane comme référence

## §1 — Critical path

- Le tag d'intégration backend (`{% vite_asset %}` Django, `@vite([...])` Laravel) doit produire des URLs hashées (manifest.json) — vérifier `last-modified` matchant le déploiement
- CSS critique above-fold : extraction via plugin (`vite-plugin-critical`, ou hand-inline tokens + layout) — Vite ne le fait pas par défaut
- Scripts en `<head>` : vérifier que les tags `<script>` non-Vite dans les templates backend ont `defer` ou `async`

## §2 — LCP

- Images above-fold dans les templates backend (Blade/Twig/Django) — `fetchpriority="high"` directement dans le template HTML
- URL hashée via manifest Vite : `{{ vite_asset('src/images/hero.webp') }}` (Django) ou `{{ Vite::asset('resources/images/hero.webp') }}` (Laravel)
- `<picture>` **interdit** above-fold
- `<link rel="preload" as="image">` dans `<head>` du template backend avec l'URL hashée Vite
- Responsive : `srcset` et `sizes` dans le `<img>` du template backend

## §3 — CLS

- `width`/`height` dans les templates backend (Blade, Twig, Django) sur tout `<img>`
- `font-display: swap` dans le CSS Vite (`resources/css/app.css` ou `src/css/app.css`)
- Éléments injectés dynamiquement par composants Vue/Alpine : `min-height` réservé dans le CSS

## §4 — Bundle (CRITIQUE — Vite porte le bundle)

- **Heavy editor libs** (EasyMDE, CodeMirror, TinyMCE) JAMAIS dans entry chunk — split via dynamic `import()` triggered uniquement sur pages d'édition
- `vite build --report` (ou `rollup-plugin-visualizer`) — flag toute dep > 30% du bundle
- Per-route bundle : split entry par type de page (`main.js` minimal + `editor.js` lazy + `admin.js` lazy)
- `manualChunks` configuré pour isoler vendors lourds (Alpine plugins, htmx extensions, icon collections)
- Icon framework purgé (UnoCSS, Tabler, Lucide) — vérifier CSS final < 50 KB gzip
- Build warnings load-bearing :
  ```bash
  pnpm vite build 2>&1 | grep -E "(dynamic import will not move|warn|ERROR)"
  ```

## §5 — CSS

- `import 'virtual:uno.css'` (UnoCSS) — `safelist` audité, chaque entrée justifiée (classe dynamique depuis backend)
- `transition: all` interdit → `transition: transform, opacity`
- Détecter : `grep -rn "transition.*all" src/` et dans les templates backend

## §6 — Caching

- `vite build` produit `manifest.json` consommé par le backend → vérifier que le tag `{% vite_asset %}` / `@vite()` lit bien le manifest et émet des URLs avec hash
- `STATIC_URL` (Django) ou `public/build/` (Laravel) servi en `Cache-Control: public, max-age=31536000, immutable` (assets hashés)
- Routes HTML backend : `Cache-Control: no-cache, no-store, must-revalidate` pour routes auth ; cache CDN configurable pour routes publiques statiques

## §7 — SSR

- **N/A** — Vite est un build tool client-only ; le rendu HTML est géré par le backend (Laravel, Django, etc.)
- Voir les pivots backend correspondants pour §7 SSR/rendering

## §8 — INP / TBT

- `requestIdleCallback(() => { /* analytics init */ })` pour différer le JS non-critique
- `document.addEventListener('DOMContentLoaded', ...)` pour le code qui doit s'exécuter après le DOM mais pas de façon urgente
- Écouter `IntersectionObserver` pour activer les composants below-fold
- Débouncer les handlers `input` et `keyup` : `let timer; input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(fn, 300); })`

## §9 — Backend / TTFB

- **N/A** — Vite ne gère pas le backend ; voir les pivots backend correspondants (Laravel, Django)
- TTFB = performance du serveur backend qui sert le HTML ; Vite n'intervient pas dans ce chemin

## §10 — Storage

- Service Worker (Vite PWA) : cache name versionné par déploiement (sinon `pnpm build` n'invalide rien chez les clients)
- Vite est client-only → pas de problème SSR sur `localStorage` ; le backend ne peut pas accéder au localStorage navigateur

## §11 — Verification

- Critère déterministe : taille entry chunk (vite-bundle-visualizer), nombre de chunks lazy générés, taille CSS final (gzip)
- PSI : médiane post-fix (≥ 5 runs) vs maximum pré-fix
- `ls -lh dist/assets/*.js | sort -k5 -h` pour vérifier la distribution des chunks
