---
paths:
  - "nuxt.config.ts"
  - "pages/**/*.vue"
  - "components/**/*.vue"
  - "layouts/**/*.vue"
  - "app.vue"
---

# Perf pivots — Nuxt 3

Stack-specific overrides for the generic 12-section perf checklist when auditing a Nuxt 3 project. Loaded by the `web-optimize` skill when this file is present.

## §0 — Pre-flight

- Caractériser le **noise floor PSI** (variance ±29 sur build identique est documentée). Baseline déterministe (bytes / chunks) primaire ; PSI score secondaire
- `pnpm nuxt build 2>&1 | tee build.log` pour capturer warnings, chunk sizes, errors

## §2 — LCP (hero / above-fold image)

- Above-fold hero → `<img :src="webp">` **direct** sans `<picture>` :
  - Le Chrome preload scanner fetch `<img src>` AVANT `<picture>` → ERR_ABORTED sur JPG fallback → Inspector Issue → "Bonnes pratiques" -4%
  - Responsive → utiliser `srcset`/`sizes` directement sur `<img>`
- Hero LCP = `<img>` **obligatoire** — jamais `div :style="background-image"`
  - WICG LCP API : background-image invisible au preload scanner → LCP dégradé
  - `background-image` acceptable uniquement pour éléments décoratifs below-fold

## §4 — JS bundle & lazy-loading

- `useFirebase()` (ou autre SDK lourd) lazy via `defineAsyncComponent` / `import()` dynamique
- Vite warning `dynamic import will not move` est **load-bearing** — toute occurrence indique un import statique qui pollue l'entry chunk
- Modulepreload Nitro stripper : signatures dans `shared/<sdk>SdkSignatures.js` (source unique) + tripwire postbuild `verify-marketing-strip.mjs` si stack le justifie
- Au build :
  ```bash
  pnpm nuxt build 2>&1 | grep -E "(dynamic import will not move|warn|ERROR)"
  pnpm nuxt build 2>&1 | grep -i "modulepreload"
  ls -lh .output/public/_nuxt/*.js | sort -k5 -h | tail -10
  ```

## §6 — Caching & hosting

- `firebase.json` (si Firebase Hosting) : `trailingSlash`, `routeRules` Nuxt
- `nuxt.config.ts` `routeRules` : `prerender: true` sur routes statiques, `ssr: false` sur routes client-only
- Assets hashés `/_nuxt/*` servis en `Cache-Control: public, max-age=31536000, immutable`

## §7 — SSR / hydration

- `<ClientOnly>` autour des composants accédant à `window` / `localStorage`
- Hydration mismatches → vérifier que le HTML rendu serveur matche l'état initial client
- Prerender list (`nuxt.config.ts` `nitro.prerender.routes`) à auditer
- Routes `ssr: false` → fallback `200.html` (vérifier qu'aucun strip postbuild ne corrompt ce fichier)

## §9 — Backend / DB (TTFB)

- Si stack Firebase : voir `data-pivots-firebase.md` (sc-tiers)
- Si stack Prisma : voir `data-pivots-prisma.md` (sc-js)
- SSR critical path ≤ 3 queries séquentielles — `Promise.all` impératif

## §10 — Client-side storage (voir aussi `perf-storage-ssr.md`)

- Pas de `localStorage` top-level dans un module (`window` undefined côté serveur → crash build/render)
- Auth via Firebase Auth : token en IndexedDB interne (`firebaseLocalStorageDb`), JAMAIS `document.cookie` token
- Pinia store avec TTL pour cache reference data plutôt que `localStorage` brut

## §11 — Verification

- Succès = **delta déterministe** (bytes, chunks) primaire ; médiane PSI > max baseline = secondaire
- Tripwire postbuild si stripping critique (signatures shared/) — fail build si regression
