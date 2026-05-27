---
paths:
  - "wp-config.php"
  - "wp-content/themes/**/*.php"
  - "wp-content/plugins/**/*.php"
  - "wp-content/mu-plugins/**/*.php"
---

# Perf pivots — WordPress

Stack-specific overrides applied when `wp-config.php` is detected. Loaded by `web-optimize`.

## §0 — Pre-flight

- `WP_DEBUG=false`, `WP_DEBUG_LOG=false`, `SCRIPT_DEBUG=false` en prod
- Query Monitor activé en dev pour profiling, **désactivé** en prod (perf impact)
- Auditer `wp_options.autoload='yes'` count : > 1 MB total autoload = red flag (chaque request lit tout)

## §1 — Critical path

- Active theme `functions.php` → audit des `wp_enqueue_script` / `wp_enqueue_style` globaux : combien chargés sur la home ?
- Bannir les `wp_enqueue_script` sans `array('jquery')` justifié si possible (jQuery = ~85 KB)
- Critical CSS plugins (Autoptimize, WP Rocket, Perfmatters) — auditer leur config, pas activation par défaut

## §3 — CLS

- Lazy loading natif WordPress 5.5+ activé par défaut ; vérifier que les images critiques **above-fold** ont `fetchpriority="high"` et **PAS** `loading="lazy"`
- Images sans `width`/`height` → CLS garanti ; toujours laisser WP ajouter les attributs

## §4 — Bundle

- Heartbeat API (`/wp-admin/admin-ajax.php?action=heartbeat`) → polling 15s par admin connecté ; désactiver côté front-end via `wp_deregister_script('heartbeat')`
- Gutenberg bloque CSS frontend : `wp-block-library` enqueued par défaut (~50 KB) — désactiver via `wp_dequeue_style('wp-block-library')` si pas de blocs sur la page
- Emojis JS bloqué : `remove_action('wp_head', 'print_emoji_detection_script', 7)` + 3 autres

## §5 — CSS

- Theme + plugins peuvent enqueue 10-30 stylesheets → audit count via Query Monitor
- Combine + minify via plugin (WP Rocket, Autoptimize) — auditer le manifest généré

## §6 — Caching

- **Page cache OBLIGATOIRE** en prod : WP Rocket / W3 Total Cache / LiteSpeed Cache / Cache Enabler
- **Object cache** : Redis ou Memcached via `wp-content/object-cache.php` drop-in → divise les queries DB par 10
- CDN sur `wp-content/uploads/*` + assets thème — `Cache-Control: public, max-age=31536000`
- Transients API (`set_transient`) pour mémoriser des queries lourdes côté code thème

## §7 — Server-side rendering

- PHP template → fully SSR, pas d'hydratation par défaut
- Gutenberg "render callback" blocks → rendus PHP, pas JS hydration
- Évite `the_post()` loop avec N relations : voir data pivots queries WP

## §8 — INP / TBT

- Auditer les plugins front-end JS — chaque plugin actif = bundle additionnel
- Désactiver le plugin "test" en prod (ex: contact form 7 reCaptcha sur toutes pages)

## §9 — Backend / database

- `WP_Query` avec `meta_query` non-indexé → table scan ; ajouter index sur `wp_postmeta(meta_key, meta_value(191))` pour les keys hot path
- `posts_per_page=-1` interdit (load all) — toujours pagination
- Bannir `get_posts()` dans `the_loop` (N+1 silencieux)
- ACF `get_field()` répété → mémoïser en variable locale
- `wp_options.autoload='yes'` : nettoyer les entrées transients expirées via `delete_expired_transients()` quotidien

## §10 — Storage

- SSR PHP → `localStorage` côté JS uniquement (admin bar, comment forms)
- Cookies WP (`wordpress_logged_in_*`) → toujours `httpOnly`, `secure` en HTTPS

## §11 — Verification

- Query Monitor → query count par page, slow queries, N+1
- New Relic / Blackfire pour APM
- Hosting managé (Kinsta, WP Engine, Cloudways) intègre souvent NewRelic + page cache
