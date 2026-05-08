---
name: perf-checklist-django
description: Reusable performance checklist for pure Django (SSR templates, full-page render). Frontend pivots (Vite, Alpine.js, HTMX) live in `references/framework-mapping.md` and are concatenated at audit time when the project's manifests detect them.
---

# Django Performance Checklist — `{route or feature}`

> Target metrics: TTFB ≤ 600ms p95 backend, LCP ≤ 2.5s mobile, CLS ≤ 0.1, INP ≤ 200ms (PSI mobile @ Slow 4G / 4× CPU). SQL queries per page ≤ 10.
> Fill `🟢 / 🟡 / 🔴 / N/A` per item. Add `file:line` references when fixing.
> **Scope**: pure Django SSR. For hybrid stacks (Django + Vite / Alpine / HTMX), concatenate the matching sections from `.claude/skills/web-optimize/references/framework-mapping.md` at audit time.

## 0. Pre-flight

- [ ] **Primary deterministic metric** defined BEFORE coding (SQL queries removed, bytes saved, p95 TTFB delta) — load-bearing success signal
- [ ] **3-5 PSI mobile runs** captured (`https://pagespeed.web.dev/`, 5-min interval) to characterize noise floor — single-run baseline is unfalsifiable
- [ ] PSI anonymous API limit (~25/day) noted — for 5+ runs use the web UI manually OR a Google API key. Local Lighthouse ≠ PSI cloud (medians NOT comparable)
- [ ] `django-debug-toolbar` enabled in dev — captured **per-route SQL query count** baseline before any change
- [ ] Acceptance threshold defined per metric BEFORE coding — primary deterministic + secondary PSI median

## 1. Render-blocking critical path

- [ ] No third-party CSS loaded synchronously in `<head>` — Google Fonts via `<link rel=stylesheet>` IS render-blocking (use `&display=swap` + preconnect, OR self-host via WhiteNoise)
- [ ] `<link rel="preconnect">` reserved to **above-fold** origins; deferred origins use `dns-prefetch` only
- [ ] No origin in `preconnect` whose request is never actually fired (grep `<link rel="(preconnect|dns-prefetch)"` then verify against Network panel)
- [ ] `collectstatic` outputs hashed filenames (manifest-based storage) — verify `last-modified` and content-hash on `static/**` matches latest deploy
- [ ] Critical CSS for above-fold inlined when feasible (hand-inline tokens + layout, or third-party `critical` extraction)
- [ ] Third-party JS (Plausible, GTM, Sentry) deferred via `<script defer>` or `requestIdleCallback`
- [ ] `<script>` placed at `</body>` (or `defer`) — never blocking `<head>` without `defer`

## 2. LCP (image / hero)

- [ ] Hero image carries `<link rel="preload" as="image" fetchpriority="high">` in `<head>` — `fetchpriority` mandatory, not optional
- [ ] Responsive hero uses `imagesrcset` + `imagesizes` in preload (NOT plain `href` — browser preloads largest variant otherwise)
- [ ] Hero `<img>` carries `fetchpriority="high"` `loading="eager"` `decoding="async"`
- [ ] **Above-fold LCP image uses `<img src="webp">` directly — NO `<picture>` wrapper**: Chrome preload scanner fetches `<img src>` before `<picture>` evaluation → fallback JPG ERR_ABORTED → Inspector Issue
- [ ] Below-fold images: `<picture><source webp><img jpg></picture>` pattern OK (preload scanner doesn't aggressively fetch lazy images)
- [ ] Explicit `width` + `height` on every `<img>` matching intrinsic dimensions (CLS guard)
- [ ] Below-fold images: `loading="lazy"` `decoding="async"` no `fetchpriority`
- [ ] `MEDIA_URL` images served via long-cache headers OR Whitenoise OR CDN — not raw Django dev server
- [ ] User-uploaded avatars resized server-side (PIL/Pillow `thumbnail()`) — never serve full-size raw uploads as inline avatars

## 3. CLS

- [ ] Reserved space for async content: skeletons, fixed `min-height`, aspect-ratio boxes
- [ ] `font-display: swap` set on all `@font-face` declarations
- [ ] Self-hosted fonts use **stable public URL** (`/static/fonts/...`), preload `as="font" crossorigin`
- [ ] No Django messages framework banner shifting layout above-fold (use reserved height)

## 4. JS bundle size & lazy-loading (Django-rendered HTML, minimal JS)

- [ ] Total JS budget defined per page type (e.g. < 50 KB gzip for marketing routes, < 200 KB gzip for editor routes) — even with no JS framework
- [ ] No `<script>` tags inline in templates with logic > 5 lines — extract to a built JS bundle
- [ ] No jQuery loaded "just in case" — every dependency justified
- [ ] No CDN-loaded JS framework on every page (Bootstrap JS, FontAwesome JS) when only used on specific pages

## 5. CSS

- [ ] Total CSS bundle < 50 KB gzip on marketing routes
- [ ] No `transition-all` / `transition: all` — restrict to specific composited properties (`transform`, `opacity`)
- [ ] No global `* { transition: ... }` selector
- [ ] Custom CSS variables used for theme tokens (light/dark), not duplicated rules
- [ ] No render-blocking external CSS framework loaded by CDN (Bootstrap, Boxicons, FontAwesome)

## 6. Caching & hosting

- [ ] **WhiteNoise** `STORAGES["staticfiles"]` set to `CompressedManifestStaticFilesStorage` (not `CompressedStaticFilesStorage`) — manifest enables long-cache hashed URLs
- [ ] `WHITENOISE_MAX_AGE = 31536000` set (1 year) for hashed assets
- [ ] HTML `Cache-Control: private, max-age=0, must-revalidate` (logged-in views) OR `public, max-age=300, s-maxage=3600` (public pages)
- [ ] Django `@cache_page` or `cache_control` decorator on hot public pages (home, explorer, about)
- [ ] `@vary_on_headers("Accept-Language")` on i18n views
- [ ] Template fragment caching (`{% load cache %}` + `{% cache 600 key %}`) on expensive partials (sidebar, footer with stats)
- [ ] Low-level cache API on heavy aggregations (`cache.get_or_set("recent_reports", lambda: ..., 300)`)
- [ ] Redis configured in prod (`REDIS_URL`) — or DatabaseCache documented as conscious trade-off for small instance
- [ ] `CONN_MAX_AGE = 60` set on PostgreSQL — avoids per-request connection cost
- [ ] CDN / reverse proxy in front of `STATIC_URL` (Cloudflare, BunnyCDN) for federated multi-region instances
- [ ] No conflicting `Cache-Control` between Django middleware and reverse proxy
- [ ] **Frontend rebuild + redeploy effectif** : `last-modified` du HTML prod < date du dernier `pnpm build` local — sinon les optims locales ne sont jamais servies

## 7. SSR templates & fragment rendering

- [ ] Django templates use `{% load cache %}` for expensive fragments (counts, lists)
- [ ] Template tags don't trigger DB hits per render (avoid `{% for x in qs %}{{ x.related_set.count }}{% endfor %}` — use annotated counts)
- [ ] `{% url %}` always namespaced (`{% url 'app:view_name' pk=... %}`) — `NoReverseMatch` otherwise
- [ ] No business logic in templates — push to context preprocessor or service layer

## 8. Render performance (INP / TBT)

- [ ] No layout thrashing patterns (read-then-write DOM in same frame) in inline scripts
- [ ] Loading indicators (spinner / skeleton) preloaded — no FOUC on first request
- [ ] Long-running pages avoid synchronous `<script>` blocks > 50 ms parse-time

## 9. Backend / DB perf (CRITICAL — TTFB)

- [ ] `django-debug-toolbar` shows **≤ 10 SQL queries** on every hot page — count, not just look
- [ ] Every paginated queryset uses `select_related` (FK) + `prefetch_related` (M2M, reverse FK) — N+1 disqualifies a feature ship
- [ ] Service-layer querysets centralized (`build_*_queryset` per app) — no inline ORM in views beyond simple PK lookup
- [ ] `Meta: indexes` on every column used in `.filter()`, `.order_by()`, `.exclude()` for tables > 1k rows
- [ ] Composite indexes for multi-column filters (e.g. `(status, created_at DESC)`)
- [ ] No `.count()` in templates — pass count via context, OR use `Count` annotation in queryset
- [ ] No `.exists()` in loops — fetch IDs once
- [ ] Heavy aggregations (totals, stats) cached via `cache.get_or_set` with sensible TTL
- [ ] `gunicorn` workers = `2 * cores + 1`; `--worker-class gevent` if I/O-bound (federation, mail)
- [ ] Celery/RQ for tasks > 200ms (mail, image processing, federation delivery) — never inline in request/response
- [ ] PostgreSQL `EXPLAIN ANALYZE` run on top-3 slowest queries (django-silk or `connection.queries[-1]['sql']`)
- [ ] FTS columns indexed via `GinIndex` (Django `django.contrib.postgres.indexes`) when used
- [ ] Federation (ActivityPub): outbound delivery always async via Celery — never blocks user response

## 10. Client-side storage (cookies — Django session, CSRF, allauth)

> Pure Django renders HTML server-side. Without a JS framework, browser storage is rare. The cookie items below ALWAYS apply; localStorage / sessionStorage / IndexedDB / Cache API items are typically `N/A` unless the project adds JS that uses them — in which case load the matching frontend section from `framework-mapping.md` (Alpine, HTMX, vanilla JS).

- [ ] `SESSION_COOKIE_SECURE = True` in production
- [ ] `CSRF_COOKIE_SECURE = True` in production
- [ ] `SESSION_COOKIE_HTTPONLY = True` (default Django, verify not overridden)
- [ ] `SESSION_COOKIE_SAMESITE = "Lax"` (default Django)
- [ ] `csrftoken` cookie `Secure` + `SameSite=Lax` mandatory in prod (HttpOnly status depends on JS framework — see frontend pivot)
- [ ] `SECURE_HSTS_SECONDS ≥ 31536000` + `SECURE_HSTS_INCLUDE_SUBDOMAINS` + `SECURE_HSTS_PRELOAD` in prod
- [ ] Cookies < 4 KB each, < 50 per domain
- [ ] No PII in non-HttpOnly cookies — bandwidth tax + XSS surface

## 11. Verification & non-regression

- [ ] **Primary success criterion** — deterministic delta confirmed (SQL queries removed, bytes saved, p95 TTFB delta). Load-bearing signal
- [ ] **Secondary PSI re-run** (3-5 runs, mobile, 5-min interval) — declare "real gain" only if **median post-fix > maximum pre-fix**, else: "fix shipped, PSI variance dominates, deterministic delta is the trustable signal"
- [ ] `django-debug-toolbar` re-run — query count ≤ baseline
- [ ] `wrk -d 30s http://localhost:8000/<route>` (or `ab`) — p95 latency improved or stable
- [ ] No regression on adjacent routes (run PSI on 2-3 sibling routes)
- [ ] Build artifacts checked: `view-source:/<route>` on prod — confirm preload/CSS list matches expectation
- [ ] Migration tested on a copy of production data if any DB schema change
- [ ] Rule updated when a new pattern emerges (`.claude/rules/03-frameworks-and-libraries/` for Django, `08-domain/` for app-specific)

## 12. Checklist self-audit (feedback loop)

> Après l'audit, 5 minutes pour faire converger la checklist vers la réalité du projet. **Output obligatoire** : section `## Checklist learnings` ajoutée au header de l'audit report.

- [ ] **Gaps découverts** — issues réelles trouvées HORS checklist : formuler le bullet manquant + section cible (`§N`)
- [ ] **Faux positifs** — items cochés "N/A" sur ce stack : décider suppression vs déplacement vers une section frontend de `framework-mapping.md`
- [ ] **Items ambigus** — bullets dont l'interprétation a hésité : reformuler en plus court / nommer le symbole
- [ ] **Anti-patterns émergents** — patterns rencontrés ≥ 2× : candidats pour la table `## Common anti-patterns`
- [ ] **Commandes utiles** — greps/scripts ad-hoc qui ont surfacé des problèmes : candidats pour `## Quick verification commands`
- [ ] **Pivots manquants** — variante non documentée dans `references/framework-mapping.md` : proposer un ajout
- [ ] **Sections rarement utilisées** — si ≥ 60% N/A pour ce stack : marquer la section comme conditionnelle

### Action après remplissage

Si ≥ 3 gaps réels OU ≥ 1 anti-pattern récurrent OU ≥ 1 pivot manquant → proposer à l'utilisateur :

1. Diff `aidd_docs/templates/dev/perf_checklist_django.md`
2. Diff `references/framework-mapping.md` si pivot stack-spécifique (Vite/Alpine/HTMX section dédiée)
3. Diff `## Common anti-patterns` ou `## Quick verification commands`

## Common anti-patterns (rejected)

| Anti-pattern | Why rejected | Reference |
|--------------|--------------|-----------|
| `<link rel="stylesheet">` from CDN in `<head>` | Render-blocking, 3rd-party DNS+TLS+TCP hop blocking FCP | — |
| `{% for x in qs %}{{ x.related_set.count }}` | One COUNT query per row → quadratic SQL on lists | — |
| `select_related` chained > 4 deep | Cartesian product explosion; prefer `prefetch_related` for 2nd level | — |
| `.exists()` inside a loop | One SELECT per iteration — fetch IDs once, use `.values_list('id', flat=True)` | — |
| ManyToManyField in `update_fields` of `.save()` | Django raises `ValueError`; M2M handled via `.set()` after `save()` | — |
| Inline `<script>` block > 5 lines in template | Untransformed, unminified, no tree-shake; extract to a built bundle | — |
| Single-run PSI as success metric | Lighthouse cloud variance ±29 points run-to-run on identical build | — |
| Auth tokens / PII in `localStorage` | XSS exfiltration vector — any third-party script can read it | OWASP A07 |
| `transition-all` for "smooth feel" | No-op when classes don't change; paints non-composited properties | — |
| `DatabaseCache` in production with > 100 cache writes/min | DB write contention; switch to Redis at that scale | — |
| Federation delivery in request/response | One slow remote = user sees 30s timeout; always Celery `delay()` | — |
| `CompressedStaticFilesStorage` instead of `CompressedManifestStaticFilesStorage` | No content-hash → can't long-cache aggressively → stale assets risk | — |

## Quick verification commands

```bash
# Static collection inspection
python manage.py collectstatic --dry-run --clear 2>&1 | head -40
ls -lh staticfiles/ 2>/dev/null | head

# Django SQL query count (dev)
DJANGO_SETTINGS_MODULE=config.settings.development python manage.py shell -c "
from django.test import Client
from django.db import connection, reset_queries
reset_queries()
c = Client()
c.get('/')
print(f'Home: {len(connection.queries)} queries')
reset_queries()
c.get('/explorer/')
print(f'Explorer: {len(connection.queries)} queries')
"

# Anti-pattern grep across stack
grep -rn "transition-all" --include="*.html" --include="*.css" --include="*.js"
grep -rn "\.related_set\.count\|\.objects\.count()}}" --include="*.html"
grep -rn "\.exists()" --include="*.py" -A1 | grep -B1 "for "
grep -rn "@require_POST\|@require_GET" --include="*.py" | wc -l
grep -rn "select_related\|prefetch_related" --include="*.py" | wc -l
grep -rn "@cache_page\|cache_control\|cache.get_or_set" --include="*.py" | wc -l

# HTTP headers audit
curl -sI https://<domain>/ | grep -iE "cache-control|content-length|content-encoding|server|vary"
curl -sI https://<domain>/static/<hashed-asset> | grep -iE "cache-control|etag"

# Concurrent load (TTFB p95)
wrk -d 30s -c 10 http://localhost:8000/                 # bash/WSL
ab -n 200 -c 10 http://localhost:8000/                  # fallback if no wrk
```
