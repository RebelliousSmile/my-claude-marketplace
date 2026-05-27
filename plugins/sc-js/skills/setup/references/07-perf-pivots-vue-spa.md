---
paths:
  - "vite.config.ts"
  - "vite.config.js"
  - "src/**/*.vue"
  - "index.html"
---

# Perf pivots — Vue SPA (Vite + Vue, no SSR)

Stack-specific overrides for the generic 12-section perf checklist when auditing a Vue SPA built with Vite (no SSR). Loaded by `web-optimize`.

## §1 — Render-blocking critical path

- Pas de SSR → tout le HTML initial est minimal
- Critical path = `<link rel="modulepreload">` du chunk entry + CSS critique inliné par Vite
- `index.html` doit rester < 50 KB (squelette + skeletons + meta tags)

## §2 — LCP

- Preload above-fold hero via `<link rel="preload" as="image" fetchpriority="high">` dans `index.html`, OU défini dynamiquement avant `app.mount`
- Pour responsive : `<link rel="preload" as="image" imagesrcset="..." imagesizes="...">` (pas juste `href`)

## §4 — JS bundle (CRITIQUE)

- `vite.config.ts` `build.rollupOptions.output.manualChunks` pour isoler vendors lourds
- Route-based code-split : `defineAsyncComponent` + `<Suspense>` côté `<router-view>`
- Vite report : `pnpm vite build --mode production` + `vite-plugin-visualizer` ou `rollup-plugin-visualizer`
- Heavy editor libs (CodeMirror, TinyMCE, EasyMDE) NEVER in entry chunk — dynamic `import()` triggered on edit page only

## §7 — SSR

- **N/A** — remplacer par "Initial HTML reste < 50 KB ; squelette + skeletons + meta"

## §9 — Backend / DB

- **N/A** si SPA pure consommant une API externe
- Remplacer par : "API latency p95 < 300ms ; auditer les calls Promise.all qui devraient être 1 endpoint batched"

## §10 — Client-side storage

- Pas de SSR → guards `process.client` inutiles
- Quota et XSS toujours valides
- IndexedDB pour datasets volumineux, `navigator.storage.persist()` pour éviter eviction
