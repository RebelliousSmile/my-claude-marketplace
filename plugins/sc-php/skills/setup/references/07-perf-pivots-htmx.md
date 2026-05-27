---
paths:
  - "**/*.html"
  - "**/*.blade.php"
  - "**/*.twig"
  - "templates/**/*.html"
---

# Perf pivots — HTMX (hybride backend SSR)

Stack-specific overrides applied **in addition** to backend pivots when `htmx.org` is detected. Concatenate with Laravel / Symfony / Django / WordPress pivots. Loaded by `web-optimize`.

## §1 — Render-blocking

- HTMX CDN avec `defer` (~14 KB gzip) ; pas besoin de bundler sauf extension custom
- Extensions HTMX (`json-enc`, `morphdom-swap`, `sse`) chargées seulement si utilisées sur la page (pas globalement)

## §4 — Bundle

- Préférer CDN `htmx.org@2.x` ; bundler avec esbuild seulement si tree-shaking de plugins
- Alpine + HTMX souvent combinés : voir `perf-pivots-alpine.md` ; minimiser le risque d'event double-handling (`hx-on::after-swap` vs `x-init`)

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
