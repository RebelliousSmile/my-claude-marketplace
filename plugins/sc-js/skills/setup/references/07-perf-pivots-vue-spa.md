---
paths:
  - "vite.config.ts"
  - "vite.config.js"
  - "src/**/*.vue"
  - "index.html"
---

# Perf pivots — Vue SPA (Vite + Vue, no SSR)

Stack-specific overrides for the generic 12-section perf checklist when auditing a Vue SPA built with Vite (no SSR). Loaded by `web-optimize`.

## §0 — Pre-flight

- Build : `pnpm vite build 2>&1 | tee build.log` — capturer entry chunk size, vendor chunks, total bytes
- **Warnings load-bearing** :
  - `dynamic import will not move` = import statique dans l'entry chunk — dégradation TBT directe
  - `chunk size limit exceeded` (> 500 KB gzip) = vendor non-splitté
  - `Circular dependency` sur une dépendance partagée = risque d'entry chunk gonflé
- **PSI runs** : ≥ 5 runs, médiane comme référence ; variance ±15 normale sur SPA hébergée sur CDN

## §1 — Render-blocking critical path

- Pas de SSR → tout le HTML initial est minimal
- Critical path = `<link rel="modulepreload">` du chunk entry + CSS critique inliné par Vite
- `index.html` doit rester < 50 KB (squelette + skeletons + meta tags)
- CSS critique above-fold : Vite génère un `<link rel="stylesheet">` bloquant pour le CSS du composant racine → inliner via `vite-plugin-critical` ou manuellement dans `<style>` de `index.html`
- Scripts en `<head>` : vérifier `index.html` — tout script non-Vite doit avoir `defer` ou `async`

## §2 — LCP

- `<img>` **direct** sans `<picture>` above-fold — ERR_ABORTED Chrome si `<picture>` intercepte le preload scanner
- `fetchpriority="high"` sur le `<img>` LCP : `<img :src="hero" fetchpriority="high" loading="eager">`
- Preload above-fold hero via `<link rel="preload" as="image" fetchpriority="high">` dans `index.html`, OU défini dynamiquement avant `app.mount`
- Pour responsive : `<link rel="preload" as="image" imagesrcset="hero_480.webp 480w, hero_1024.webp 1024w" imagesizes="(max-width: 640px) 480px, 1024px">`
- `<picture>` **interdit** above-fold ; autorisé below-fold

## §3 — CLS

- `width` + `height` HTML explicites sur tout `<img>` — le navigateur réserve l'espace avant chargement
- `font-display: swap` dans `src/assets/fonts.css` pour chaque `@font-face`
- Composants injectés après le premier render (auth modals, cookie banners) : `min-height` réservé ou `position: fixed` pour éviter de pousser le contenu

## §4 — JS bundle (CRITIQUE)

- `vite.config.ts` `build.rollupOptions.output.manualChunks` pour isoler vendors lourds
- Route-based code-split : `defineAsyncComponent` + `<Suspense>` côté `<router-view>`
- Vite report : `pnpm vite build --mode production` + `vite-plugin-visualizer` ou `rollup-plugin-visualizer`
- Heavy editor libs (CodeMirror, TinyMCE, EasyMDE) NEVER in entry chunk — dynamic `import()` triggered on edit page only
- Vérifier entry chunk : `ls -lh dist/assets/*.js | sort -k5 -h` — l'entry doit rester < 100 KB gzip

## §5 — CSS

- Tailwind purge via `content: ['./index.html', './src/**/*.{vue,ts}']` dans `tailwind.config.ts`
- `transition: all` interdit → `transition: transform, opacity`
- Détecter : `grep -rn "transition.*all" src/`
- Taille cible : < 20 KB gzip après purge

## §6 — Caching & hosting

- Assets hashés `dist/assets/*` : `Cache-Control: public, max-age=31536000, immutable` (configurer côté CDN/nginx)
- `index.html` (SPA shell) : `Cache-Control: no-cache, no-store, must-revalidate` — sinon les déploiements ne sont pas pris en compte
- Service Worker (Vite PWA) : cache name versionné par hash de déploiement

## §7 — SSR

- **N/A** — SPA 100% client-side ; pas d'hydration mismatch possible
- Initial HTML reste < 50 KB (squelette + skeletons + meta)
- Si migration vers SSR prévue : voir `perf-pivots-nuxt.md`

## §8 — INP / TBT

- `window.requestIdleCallback(() => { /* heavy analytics init */ })` pour différer le travail non-critique
- `IntersectionObserver` pour charger les composants below-fold
- Listes > 100 items : `vue-virtual-scroller` ou `@tanstack/vue-virtual`
- Débouncer : `useDebounceFn(handler, 300)` / `useThrottleFn` (VueUse) sur `input`, `keyup`, `scroll`
- `{ passive: true }` sur tous les listeners `scroll` et `touchstart`

## §9 — Backend / DB

- **N/A** si SPA pure consommant une API externe
- API latency p95 < 300ms ; auditer les calls `Promise.all` qui devraient être 1 endpoint batché
- TTFB = first fetch API — s'assurer que l'API est close géographiquement ou derrière un CDN edge

## §10 — Client-side storage

- Pas de SSR → guards `process.client` inutiles — `localStorage` toujours disponible
- Quota et XSS toujours valides
- IndexedDB pour datasets volumineux, `navigator.storage.persist()` pour éviter eviction

## §11 — Verification

- Critère déterministe : taille entry chunk (bytes) avant/après, nombre de chunks lazy créés
- PSI : médiane post-fix (≥ 5 runs) > maximum pré-fix = gain réel
- LCP mesuré en local via WebPageTest ou Lighthouse CLI : `lighthouse https://... --output json | jq '.audits.lcp'`
