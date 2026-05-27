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
- **Warnings load-bearing** (ne pas ignorer) :
  - `dynamic import will not move` = import statique dans l'entry chunk — dégradation directe du TBT
  - `chunk size limit exceeded` (> 500 KB gzip) = trop de code dans un chunk
  - `[warn] modulepreload` manquant sur un chunk critique
- **PSI runs recommandés** : ≥ 5 runs successifs, médiane comme valeur de référence ; écarter max et min ; conserver la variance (ex. ±5 points = bruit normal)

## §1 — Critical path

- CSS critique : Nuxt (Vite) injecte les styles du layout en `<link rel="stylesheet">` dans le `<head>` SSR ; pour inliner le CSS above-fold, utiliser `@layer critical` dans `assets/css/critical.css` référencé via `nuxt.config.ts app.head.link`
- Scripts en `<head>` : vérifier `nuxt.config.ts app.head.script[]` — tout script manuel doit avoir `defer: true` ou `async: true` ; les chunks `_nuxt/*.js` Nuxt sont `<link rel="modulepreload">` (non-bloquants) ; identifier les scripts bloquants : `grep -r '<script' .output/server/chunks/ | grep -v 'defer\|async\|modulepreload'`
- Fonts : `useHead({ link: [{ rel: 'preload', as: 'font', href: '/fonts/inter.woff2', crossorigin: 'anonymous' }] })` — URL stable car la police est dans `public/` (pas de hash Nuxt)
- Scripts tiers : `useScript()` (Nuxt Scripts module) avec `trigger: 'onNuxtReady'` ou `loadingStrategy: 'idle'` — jamais de `<script src>` nu dans `app.vue`

## §2 — LCP (hero / above-fold image)

- Above-fold hero → `<img :src="webp">` **direct** sans `<picture>` :
  - Le Chrome preload scanner fetch `<img src>` AVANT `<picture>` → ERR_ABORTED sur JPG fallback → Inspector Issue → "Bonnes pratiques" -4%
  - Responsive → utiliser `srcset`/`sizes` directement sur `<img>`
- Hero LCP = `<img>` **obligatoire** — jamais `div :style="background-image"`
  - WICG LCP API : background-image invisible au preload scanner → LCP dégradé
  - `background-image` acceptable uniquement pour éléments décoratifs below-fold
- `fetchpriority="high"` : `<img :src="webp" fetchpriority="high" loading="eager">` — attribut HTML natif, aucun composant wrapper nécessaire
- `<link rel="preload" as="image">` : via `useHead({ link: [{ rel: 'preload', as: 'image', imagesrcset: `${img480} 480w, ${img1024} 1024w`, imagesizes: '(max-width: 640px) 480px, 1024px' }] })` dans le composant hero
- Responsive hero : `<img :src="webp_1024" :srcset="`${webp_480} 480w, ${webp_1024} 1024w`" sizes="(max-width: 640px) 480px, 1024px" width="1024" height="576">`

## §3 — CLS

- Réserver l'espace : `width` + `height` HTML obligatoires sur tout `<img>` → le navigateur calcule l'aspect-ratio avant le chargement
- `@nuxt/image` (`<NuxtImg>`) injecte automatiquement `width`/`height` si les dimensions sont connues au build
- FOUT : dans `assets/css/fonts.css`, déclarer `font-display: swap` sur chaque `@font-face` ; pour les fonts Google : `preconnect` + `display=swap` dans l'URL
- Éléments injectés dynamiquement (cookie banner, auth UI) : utiliser `min-height` réservé + `position: fixed` pour ne pas pousser le contenu existant

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

## §5 — CSS

- Purge : Tailwind CSS V4 purge automatiquement via `@source` dans `assets/css/tailwind.css` ; vérifier avec `pnpm nuxt build && ls -lh .output/public/_nuxt/*.css`
- Propriétés à éviter : `transition: all` re-compose tout à chaque frame → utiliser uniquement `transition: transform, opacity`
- Détecter : `grep -rn "transition.*all\|transition: all" assets/ components/ layouts/`
- Taille cible CSS pages marketing : < 20 KB gzip (Tailwind purged)

## §6 — Caching & hosting

- Assets hashés `/_nuxt/*` servis en `Cache-Control: public, max-age=31536000, immutable`
- Routes HTML SSR : par défaut Nuxt ne met pas en cache côté CDN ; configurer via `routeRules: { '/': { cache: { maxAge: 60, staleMaxAge: 300, swr: true } } }` dans `nuxt.config.ts`
- Routes prerenderées : `Cache-Control: public, max-age=0, stale-while-revalidate=60` (déploiement = invalidation)
- `firebase.json` (si Firebase Hosting) : routes SSR → `Cache-Control: no-cache, no-store, must-revalidate` ; routes prerenderées → `Cache-Control: public, max-age=0, stale-while-revalidate=60`
- `nuxt.config.ts` `routeRules` : `prerender: true` sur routes statiques, `ssr: false` sur routes client-only

## §7 — SSR / hydration

- `<ClientOnly>` autour des composants accédant à `window` / `localStorage`
- Hydration mismatches → vérifier que le HTML rendu serveur matche l'état initial client ; les mismatches apparaissent en console sous `[Vue warn] Hydration text content mismatch`
- Prerender list (`nuxt.config.ts` `nitro.prerender.routes`) à auditer
- Routes `ssr: false` → fallback `200.html` (vérifier qu'aucun strip postbuild ne corrompt ce fichier)

## §8 — INP / TBT

- Déférer travail lourd : `onNuxtReady(() => { /* heavy analytics init, chat widget */ })` dans plugins `plugins/analytics.client.ts`
- `useIntersectionObserver` (VueUse) pour charger composants lourds uniquement quand visibles
- Listes > 100 items : `vue-virtual-scroller` ou `@tanstack/vue-virtual`
- Débouncer : `useDebounceFn(handler, 300)` / `useThrottleFn` (VueUse) sur handlers `input`, `keyup`, `scroll`
- Event passifs : `<div @scroll.passive="handler">` (modificateur Vue `.passive`) — évite `preventDefault()` silencieux bloquant le thread principal

## §9 — Backend / DB (TTFB)

- Si stack Firebase : voir `data-pivots-firebase.md` (sc-tiers)
- Si stack Prisma : voir `data-pivots-prisma.md` (sc-js)
- SSR critical path ≤ 3 queries séquentielles — `Promise.all` impératif
- Cold start Nitro/Vercel Functions : `min_instances: 1` si TTFB cold > 1 s et trafic continu

## §10 — Client-side storage (voir aussi `perf-storage-ssr.md`)

- Pas de `localStorage` top-level dans un module (`window` undefined côté serveur → crash build/render)
- Auth via Firebase Auth : token en IndexedDB interne (`firebaseLocalStorageDb`), JAMAIS `document.cookie` token
- Pinia store avec TTL pour cache reference data plutôt que `localStorage` brut
- Guard SSR : `if (process.client) { localStorage.setItem(...) }` ou wrapper dans `onMounted`

## §11 — Verification

- Succès = **delta déterministe** (bytes, chunks) primaire ; médiane PSI > max baseline = secondaire
- Comparer : médiane post-fix (≥ 5 runs) vs maximum pré-fix ; si médiane > max = gain réel
- Tripwire postbuild si stripping critique (signatures shared/) — fail build si regression
