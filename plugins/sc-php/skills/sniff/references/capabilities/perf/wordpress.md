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
- Build commande thème (si build system) : `npm run build` ou `pnpm run build` depuis le dossier thème — vérifier qu'un build prod existant est bien déployé
- Warnings load-bearing WP (deprecated hooks, missing translations) : traiter avant PSI run car certains ajoutent du HTML en head
- PSI variance attendue ±10 pts sur WordPress partagé ; collecter ≥ 3 mesures avant de conclure

## §1 — Critical path

- Active theme `functions.php` → audit des `wp_enqueue_script` / `wp_enqueue_style` globaux : combien chargés sur la home ?
- Bannir les `wp_enqueue_script` sans `array('jquery')` justifié si possible (jQuery = ~85 KB)
- Critical CSS plugins (Autoptimize, WP Rocket, Perfmatters) — auditer leur config, pas activation par défaut

## §2 — LCP

- Image hero above-fold : ajouter `fetchpriority="high"` et `loading="eager"` (supprimer `loading="lazy"` si présent)
- Preload hero via `functions.php` :
  ```php
  add_action('wp_head', function () {
      echo '<link rel="preload" as="image" href="' . get_template_directory_uri() . '/images/hero.webp">';
  }, 1);
  ```
  Ou via `wp_preload_resources()` (WP 6.1+) : `add_filter('wp_preload_resources', fn($r) => array_merge($r, [['as' => 'image', 'href' => '...']]))`
- `<picture>` INTERDIT above-fold ; utiliser `wp_get_attachment_image()` avec srcset natif WP (`sizes` auto-calculées) :
  ```php
  echo wp_get_attachment_image($attachment_id, 'large', false, ['fetchpriority' => 'high', 'loading' => 'eager']);
  ```

## §3 — CLS

- Lazy loading natif WordPress 5.5+ activé par défaut ; vérifier que les images critiques **above-fold** ont `fetchpriority="high"` et **PAS** `loading="lazy"`
- Images sans `width`/`height` → CLS garanti ; toujours laisser WP ajouter les attributs via `wp_get_attachment_image()` qui génère `width` et `height` automatiquement à partir des métadonnées
- FOUT polices : `wp_enqueue_style('fonts', 'https://fonts.googleapis.com/css2?family=...&display=swap')` — vérifier `display=swap` dans l'URL Google Fonts ou dans la `@font-face` locale

## §4 — Bundle

- Heartbeat API (`/wp-admin/admin-ajax.php?action=heartbeat`) → polling 15s par admin connecté ; désactiver côté front-end via `wp_deregister_script('heartbeat')`
- Gutenberg bloque CSS frontend : `wp-block-library` enqueued par défaut (~50 KB) — désactiver via `wp_dequeue_style('wp-block-library')` si pas de blocs sur la page
- Emojis JS bloqué : `remove_action('wp_head', 'print_emoji_detection_script', 7)` + 3 autres

## §5 — CSS

- Theme + plugins peuvent enqueue 10-30 stylesheets → audit count via Query Monitor
- Combine + minify via plugin (WP Rocket, Autoptimize) — auditer le manifest généré
- Si Tailwind dans le thème : purge obligatoire `content: ['**/*.php']` (ou chemins thème explicites)
- Désactiver les CSS blocs Gutenberg si non utilisés en front :
  ```php
  add_action('wp_enqueue_scripts', function () {
      wp_dequeue_style('wp-block-library');
      wp_dequeue_style('classic-theme-styles');
  }, 100);
  ```

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

- WP SSR pur → TBT vient entièrement du JS frontend ; bannir jQuery si non réellement utilisé (`wp_deregister_script('jquery')` côté front si thème vanilla)
- Auditer les plugins front-end JS — chaque plugin actif = bundle additionnel
- Désactiver le plugin "test" en prod (ex: contact form 7 reCaptcha sur toutes pages)
- Code JS critique minimal : `wp_add_inline_script('theme-script', 'initLazyLoad()', 'after')` plutôt qu'un fichier supplémentaire
- Gutenberg : supprimer le CSS de styles classiques si non utilisé :
  ```php
  remove_action('wp_enqueue_scripts', 'wp_enqueue_classic_theme_styles');
  ```

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
