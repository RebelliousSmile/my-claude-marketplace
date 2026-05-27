---
paths:
  - "vite.config.ts"
  - "vite.config.js"
---

# Perf pivots — Vite (build tool, hybride avec n'importe quel backend)

Stack-specific overrides applied **in addition** to backend pivots when `vite.config.{js,ts}` or `@vitejs/plugin-*` is detected (Laravel + Vite, Django + Vite, etc.). Loaded by `web-optimize`.

## §0 — Pre-flight

- `pnpm vite build` — capturer entry chunk size, vendor chunks, total bytes (raw + gzip) AVANT toute optim

## §1 — Critical path

- Le tag d'intégration backend (`{% vite_asset %}` Django, `@vite([...])` Laravel) doit produire des URLs hashées (manifest.json) — vérifier `last-modified` matchant le déploiement
- CSS critique above-fold : extraction via plugin (`vite-plugin-critical`, ou hand-inline tokens + layout) — Vite ne le fait pas par défaut

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

## §6 — Caching

- `vite build` produit `manifest.json` consommé par le backend → vérifier que le tag `{% vite_asset %}` / `@vite()` lit bien le manifest et émet des URLs avec hash
- `STATIC_URL` (Django) ou `public/build/` (Laravel) servi en `Cache-Control: public, max-age=31536000, immutable` (assets hashés)

## §10 — Storage

- Service Worker (Vite PWA) : cache name versionné par déploiement (sinon `pnpm build` n'invalide rien chez les clients)
