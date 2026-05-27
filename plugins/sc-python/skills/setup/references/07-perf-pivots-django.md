---
paths:
  - "manage.py"
  - "**/settings.py"
  - "**/settings/*.py"
  - "**/wsgi.py"
  - "**/asgi.py"
  - "**/urls.py"
  - "**/views.py"
  - "**/templates/**/*.html"
---

# Perf pivots — Django

Stack-specific overrides applied when `django` is in `requirements.txt` / `pyproject.toml`. Loaded by `web-optimize`.

## §0 — Pre-flight

- `DEBUG=False` en prod **OBLIGATOIRE** (sinon stack traces fuites + perf)
- Django Debug Toolbar : `INSTALLED_APPS` uniquement en dev (via `if DEBUG`)
- `python manage.py check --deploy` → audit sécurité + perf settings

## §1 — Critical path

- Templates Django : `{% load static %}` + ManifestStaticFilesStorage → URLs hashées
- `<link rel="stylesheet" href="{% static 'critical.css' %}">` pour CSS critique
- `whitenoise.middleware.WhiteNoiseMiddleware` pour servir static avec cache headers immutable

## §4 — Bundle

- Si Vite intégré (`django-vite`) : voir `perf-pivots-vite.md` ; tag `{% vite_asset %}` lit le manifest
- Sinon, collectstatic + ManifestStaticFilesStorage → assets hashés natifs

## §6 — Caching

- `CACHES = {'default': {'BACKEND': 'django.core.cache.backends.redis.RedisCache', ...}}`
- `@cache_page(60 * 15)` decorator pour pages full SSR cachables
- Template fragment caching : `{% cache 600 sidebar request.user.username %}` pour blocs lourds
- `cache.get_or_set(key, callable, timeout)` pour mémoriser queries hot path
- `Cache-Control: public, max-age=31536000, immutable` sur `STATIC_URL` (Whitenoise le fait avec `STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'`)

## §7 — Server-side rendering

- Templates Django compilés à la première utilisation puis cachés ; `loaders` configurés en prod :
  ```python
  TEMPLATES = [{
    'OPTIONS': {
      'loaders': [
        ('django.template.loaders.cached.Loader', [
          'django.template.loaders.filesystem.Loader',
          'django.template.loaders.app_directories.Loader',
        ]),
      ],
    },
  }]
  ```
- `{% include %}` profond → coût ; préférer `{% with %}` pour mémoriser une expression
- Context processors : chaque processor execute à CHAQUE render → auditer leur coût (queries DB cachées notamment)

## §8 — INP / TBT

- Django SSR pur, mais si htmx / Alpine : voir leurs pivots
- Forms server-side validation : éviter le full reload, préférer htmx swap

## §9 — Backend / runtime

- **ASGI > WSGI** pour async views et long-lived connections (SSE, WebSocket via Channels)
- Gunicorn workers : `2 × CPU + 1` ; threading vs async workers selon I/O bound
- **Middleware budget** : chaque middleware execute par request → audit `MIDDLEWARE` liste, ordre matters
  - `SessionMiddleware` lit DB par request (sauf `SESSION_ENGINE = 'django.contrib.sessions.backends.cache'`)
  - `LocaleMiddleware` parse Accept-Language
- ORM N+1 → voir `data-pivots-django-orm.md`
- Celery / Django-Q pour tâches async (emails, imports, exports)

## §10 — Storage

- SSR Django → `localStorage` côté JS uniquement
- Items SSR-guard JS (`process.client`, `typeof window`) **N/A**
- Sessions Django : DB par défaut (1 query/request) — passer en cache backend (`SESSION_ENGINE = 'django.contrib.sessions.backends.cached_db'` ou pur `cache`)

## §11 — Verification

- `silk` profiler pour mesurer view + queries par endpoint
- `django-debug-toolbar` (dev) → query count, time, panel SQL
- Sentry / OpenTelemetry pour APM en prod
