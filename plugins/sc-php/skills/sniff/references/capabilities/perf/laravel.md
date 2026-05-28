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

## §2 — LCP

- Image hero above-fold : `<img src="{{ Vite::asset('resources/images/hero.webp') }}" fetchpriority="high" loading="eager" width="1440" height="800" alt="...">`
- `<picture>` INTERDIT above-fold (délai supplémentaire de négociation format) ; utiliser `<img>` direct avec format optimisé
- Preload hero via Blade : `@push('head') <link rel="preload" as="image" href="{{ Vite::asset('resources/images/hero.webp') }}"> @endpush`
- Responsive srcset avec hash Vite :
  ```blade
  <img src="{{ Vite::asset('resources/images/hero-800.webp') }}"
       srcset="{{ Vite::asset('resources/images/hero-400.webp') }} 400w,
               {{ Vite::asset('resources/images/hero-800.webp') }} 800w"
       sizes="(max-width: 768px) 400px, 800px"
       fetchpriority="high" loading="eager" width="800" height="450" alt="...">
  ```

## §3 — CLS

- `width` et `height` explicites obligatoires sur tout `<img>` Blade — sans eux le navigateur ne peut pas réserver l'espace
- FOUT : ajouter `font-display: swap` dans `resources/css/app.css` pour toute `@font-face` custom
- Livewire : réserver l'espace du composant avec `min-height` ou un skeleton Blade pendant la connexion initiale
- Inertia : éviter les injections conditionnelles qui modifient la hauteur de layout après hydratation

## §4 — Bundle

- Vite + Laravel : `manualChunks` configuré pour isoler vendors lourds (Alpine plugins, charts, editors)
- `@vite` doit produire des URLs avec hash → cache-busting auto à chaque `pnpm build`

## §5 — CSS

- Tailwind purge config dans `vite.config.js` :
  ```js
  content: [
    './resources/views/**/*.blade.php',
    './resources/js/**/*.vue',
    './resources/js/**/*.js',
  ]
  ```
- `transition: all` à proscrire — invalide l'optimisation du browser compositor ; grep : `grep -rn "transition.*all" resources/css/ resources/js/`
- Vérifier que `@apply` ne charge pas des utilities non purgées en prod

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

- PHP SSR → le TBT vient du JS client, pas du serveur ; prioriser la réduction du JS bloquant
- Livewire `wire:loading.delay` pour éviter les flickers ; `wire:model.lazy` ou `.debounce.300ms` pour inputs
- Vue/Inertia : `defineAsyncComponent(() => import('./HeavyComponent.vue'))` pour composants non-critiques
- Code non-prioritaire : `requestIdleCallback(() => initAnalytics())` pour différer l'init post-LCP
- Event listeners sur `scroll`/`touchstart` : toujours `{ passive: true }` pour ne pas bloquer le thread de rendu
- Hydratation Inertia : auditer les props passées (`->only(['minimal_set'])`) — pas de full models avec relations

## §9 — Backend / runtime

- Path critique : **max 3 queries séquentielles** sur hot path ; compter avec `DB::listen()` ou Debugbar
- `DB::listen(function ($query) { Log::debug($query->sql, ['time' => $query->time]); })` pour audit ponctuel dans `AppServiceProvider`
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
