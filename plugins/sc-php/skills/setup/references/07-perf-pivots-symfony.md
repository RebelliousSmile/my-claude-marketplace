---
paths:
  - "symfony.lock"
  - "composer.json"
  - "config/**/*.yaml"
  - "src/**/*.php"
  - "templates/**/*.twig"
---

# Perf pivots — Symfony

Stack-specific overrides applied when `symfony/framework-bundle` is present. Loaded by `web-optimize`.

## §0 — Pre-flight

- `bin/console about` → vérifier env=prod, debug=false
- Profiler (`web_profiler`) désactivé en prod (`when: dev`)
- `composer dump-autoload --optimize --no-dev --classmap-authoritative` en production

## §1 — Critical path

- Webpack Encore / AssetMapper / Vite : choix dépend du projet — vérifier que les hashes asset existent en prod
- Twig blocks `{% block stylesheets %}` → bundle CSS critique inline OU `<link rel="preload">` avant le reste

## §4 — Bundle

- AssetMapper (Symfony 6.4+) → import maps, pas de bundling JS, fingerprinting natif
- Si Webpack Encore : `Encore.splitEntryChunks()` activé, `enableVersioning(true)` pour cache-busting
- Si Vite : voir `perf-pivots-vite.md`

## §5 — CSS

- Tailwind avec Symfony : purge configuré sur `templates/**/*.twig` + `src/**/*.php` (form themes)
- `safelist` documenté pour les classes dynamiques côté serveur

## §6 — Caching

- HTTP cache via `Cache-Control` + ESI (`<esi:include>`) pour fragments dynamiques dans page cachée
- App cache : `Symfony\Contracts\Cache\CacheInterface` → adapter Redis en prod (`cache.adapter.redis`)
- `framework.http_cache.enabled: true` pour reverse proxy Symfony intégré (ou Varnish externe)
- `Cache-Control: public, max-age=31536000, immutable` sur `public/build/*` (assets hashés)

## §7 — Server-side rendering (Twig)

- Twig cache compilé : `var/cache/prod/twig/` doit exister après `cache:warmup`
- `{% include %}` profond → coût ; `{% embed %}` ou composants UX (Twig Components Symfony UX) avec cache
- `{% render(controller(...)) %}` sub-requests : coûteux, considérer `{{ render_esi(...) }}` pour fragments cachables

## §8 — INP / TBT

- Symfony UX Turbo / Stimulus : auditer les `data-controller` (chaque controller hydrate à la connexion DOM)
- Live components : voir `wire:loading` équivalents Symfony — `data-loading-state`

## §9 — Backend / runtime

- **OPcache OBLIGATOIRE en prod** : `opcache.enable=1`, `opcache.memory_consumption=256`, `opcache.max_accelerated_files=20000`, `opcache.validate_timestamps=0` (revalidate=0 = no stat)
- **Preloading PHP 7.4+** : `opcache.preload=/path/to/preload.php` (déploiement avec reload php-fpm obligatoire)
- **Messenger** pour async : email, notifications, imports → transport AMQP/Redis/Doctrine
- `bin/console messenger:consume async --time-limit=3600` (recyclage worker)
- Doctrine N+1 → voir `data-pivots-doctrine.md`
- **FrankenPHP** worker mode : équivalent Octane Laravel, garde le kernel chaud → audit state partagé

## §10 — Storage

- SSR PHP → `localStorage` côté JS uniquement
- Stimulus controllers : `connect()` peut lire storage, mais éviter dans le constructor

## §11 — Verification

- `bin/console debug:router` → middlewares & firewalls par route
- Blackfire / SymfonyInsight pour profiling
- `bin/console cache:warmup --env=prod` exécuté à chaque déploiement
