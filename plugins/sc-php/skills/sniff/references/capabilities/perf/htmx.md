---
paths:
  - "**/*.html"
  - "**/*.blade.php"
  - "**/*.twig"
  - "templates/**/*.html"
---

# Perf pivots — HTMX (hybride backend SSR)

Stack-specific overrides applied **in addition** to backend pivots when `htmx.org` is detected. Concatenate with Laravel / Symfony / Django / WordPress pivots. Loaded by `web-optimize`.

## §0 — Pre-flight

- HTMX n'a pas de build propre ; si bundlé avec esbuild/Vite : `npm run build` / `pnpm run build` depuis le dossier assets
- Pages HTMX = SSR pur côté backend → variance PSI attendue ±10 pts selon le serveur ; collecter ≥ 3 mesures
- Vérifier que le CDN `htmx.min.js` est bien servi avec `Cache-Control: public, max-age=31536000` (immuable pour version figée)
- `htmx.config.selfRequestsOnly = true` en prod pour limiter les requêtes hors domaine

## §1 — Render-blocking

- HTMX CDN avec `defer` (~14 KB gzip) ; pas besoin de bundler sauf extension custom
- Extensions HTMX (`json-enc`, `morphdom-swap`, `sse`) chargées seulement si utilisées sur la page (pas globalement)

## §2 — LCP

- HTML pur côté serveur : `<img src="..." fetchpriority="high" loading="eager" width="1440" height="800" alt="...">`
- Preload hero dans `<head>` (rendu par le backend) : `<link rel="preload" as="image" href="/images/hero.webp">`
- `<picture>` INTERDIT above-fold — utiliser `<img>` direct avec format optimisé (WebP, AVIF)
- Les fragments HTMX ne sont PAS dans le `<head>` — le preload doit venir du layout principal

## §3 — CLS

- `width` et `height` explicites obligatoires sur tout `<img>` dans les fragments HTML retournés par les endpoints HTMX
- FOUT : `font-display: swap` dans le CSS principal (chargé dans le `<head>`, pas dans les fragments)
- `hx-swap="outerHTML"` sur un élément de taille variable → CLS potentiel : réserver la hauteur avec `min-height` CSS ou un skeleton avant le premier swap

## §4 — Bundle

- Préférer CDN `htmx.org@2.x` ; bundler avec esbuild seulement si tree-shaking de plugins
- Alpine + HTMX souvent combinés : voir `perf-pivots-alpine.md` ; minimiser le risque d'event double-handling (`hx-on::after-swap` vs `x-init`)

## §5 — CSS

- Pas de framework CSS imposé par HTMX ; si Tailwind : purge obligatoire sur tous les templates backend (`.blade.php`, `.twig`, `.html`)
- `transition: all` interdit — invalide le compositing GPU ; préférer des propriétés spécifiques (`transition: opacity 0.2s`)
- Minifier le CSS (esbuild, lightning CSS) même sans build HTMX côté JS

## §6 — Caching

- Réponses HTMX = fragments HTML, **cachables** comme du HTML normal — auditer `Cache-Control` côté backend
- `Vary: HX-Request` obligatoire si le même URL retourne page complète OU fragment selon le header HTMX

## §7 — Server-side rendering

- `hx-target` swap zones doivent être **stables** : `id` fixe, pas de regen côté serveur
- `hx-boost` sur `<body>` transforme tous les liens en AJAX → audit que les pages cibles renvoient bien le full HTML avec `<head>` quand request initial, pas seulement fragment

## §8 — INP / TBT

- `hx-trigger="keyup changed delay:300ms"` debounce les inputs de recherche
- `hx-indicator` obligatoire sur actions > 200ms pour feedback visuel
- `hx-disabled-elt="this"` pour éviter double-submit pendant que la requête est en cours
- `setInterval` polling : `hx-trigger="every 30s"` mais auditer la charge serveur cumulée × users connectés

## §9 — Backend / runtime

- Endpoints retournant des fragments HTML : doivent rester < 50ms (pas de N+1, pas de big aggregation)
- Si fragment > 50ms, considérer `hx-trigger="revealed"` (lazy load on scroll) ou `hx-trigger="load delay:100ms"` (deferred)
- Headers de réponse pour piloter HTMX : `HX-Redirect`, `HX-Trigger` (pour CustomEvent côté client), `HX-Push-Url`

## §10 — Storage

- HTMX swap remplace le DOM → tout state JS (Alpine `x-data`, vanilla event listeners) **perdu** après swap
- Solutions :
  - `Alpine.$persist` pour state cross-swap (localStorage backed)
  - `hx-preserve` attribute sur les éléments à garder pendant le swap
  - Re-init listeners dans `htmx:afterSwap` event handler
- `hx-on::after-swap` pour ré-attacher comportements custom

## §11 — Verification

- Auditer les `hx-*` attributes en surplus (`hx-swap="innerHTML"` est le défaut, à virer si pas surchargé)
- Network tab : chaque interaction HTMX = 1 round-trip — comparer vs SPA pour estimer trade-off UX
