---
paths:
  - "artisan"
  - "composer.json"
  - "config/**/*.php"
  - "app/**/*.php"
  - "routes/**/*.php"
  - "resources/views/**/*.blade.php"
---

# Perf pivots — Laravel

Stack-specific overrides applied when `composer.json` contains `laravel/framework`. Loaded by `web-optimize`. Concatenate with Vite pivots if `vite.config.js` is present.

## §0 — Pre-flight

- `php artisan optimize` en production : config cache, route cache, view cache, event cache
- `php artisan about` → version PHP, Laravel, environment ; vérifier `APP_ENV=production` et `APP_DEBUG=false`
- Telescope / Debugbar **désactivé** en prod (gros impact)

## §1 — Critical path

- `@vite([...])` directive lit `public/build/manifest.json` → URLs hashées ; vérifier que le manifest est rebuilt à chaque deploy
- CSS critique above-fold : extraction custom OU `@vite` + Tailwind purge ; éviter d'attacher toute la lib Tailwind sur chaque page
- Pas de framework JS au top-level d'un layout Blade — chaque `<script>` doit être justifié

## §4 — Bundle

- Vite + Laravel : `manualChunks` configuré pour isoler vendors lourds (Alpine plugins, charts, editors)
- `@vite` doit produire des URLs avec hash → cache-busting auto à chaque `pnpm build`

## §6 — Caching

- `Cache::remember()` / `Cache::flexible()` (Laravel 11+) pour mémoïser les queries hot path
- Driver : Redis recommandé en prod, jamais `file` driver pour cache partagé
- `Cache-Control: public, max-age=31536000, immutable` sur `public/build/*` (assets hashés)
- HTTP cache pour pages SSR statiques : `->header('Cache-Control', 'public, max-age=300')` + CDN

## §7 — Server-side rendering (Blade)

- `@include` profond → coût compilation ; préférer composants Blade `<x-component>` (cache de compilation)
- View composers : éviter les `View::composer('*', ...)` (s'exécutent sur chaque vue rendue)
- Inertia / Livewire : voir leurs propres pivots, traiter comme hybride SPA/SSR

## §8 — INP / TBT (côté client)

- Livewire `wire:loading.delay` pour éviter les flickers ; `wire:model.lazy` ou `.debounce.300ms` pour inputs
- Hydratation Inertia : auditer les props passées (`->only(['minimal_set'])`) — pas de full models avec relations

## §9 — Backend / runtime

- **Octane** (Swoole / RoadRunner / FrankenPHP) : warm process, bootstrap supprimé → 5-10× throughput
  - Mémoire partagée entre requests → audit obligatoire des static state, singletons, requêtes Eloquent en propriété
- **Horizon** pour queues : metrics `failed`, `runtime`, `throughput` par queue
- Queues : push les emails, notifications, webhooks, imports — jamais sync sur web request
- `php artisan queue:work --max-jobs=1000 --max-time=3600` (recyclage worker)
- Eager loading obligatoire — voir `data-pivots-eloquent.md`

## §10 — Storage

- Backend SSR (Blade) : pas de SSR hydration → `localStorage` / `sessionStorage` côté JS uniquement, jamais top-level (sauf Alpine `<script defer>`)
- Items SSR-guard JS (`process.client`, `typeof window`) **N/A**
- Inertia : hydratation Vue/React côté client → revenir aux pivots SPA pour storage

## §11 — Verification

- `php artisan route:list --columns=method,uri,middleware` → audit des middlewares lourds sur routes publiques
- `XHGUI` / `Tideways` / `Blackfire` pour profiling APM
- Lighthouse / PageSpeed runs avec `APP_DEBUG=false` obligatoire (sinon dump dev pollue les métriques)
