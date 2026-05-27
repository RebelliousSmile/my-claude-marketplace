---
paths:
  - "**/main.py"
  - "**/app.py"
  - "**/api/**/*.py"
  - "**/routers/**/*.py"
---

# Perf pivots — FastAPI

Stack-specific overrides applied when `fastapi` is in dependencies. Loaded by `web-optimize`.

## §0 — Pre-flight

- `uvicorn app:app --workers N` (workers = CPU count pour CPU-bound, 2× pour I/O-bound)
- Pour prod : `gunicorn -w N -k uvicorn.workers.UvicornWorker` (gunicorn comme process manager)
- `--reload` JAMAIS en prod
- Build warnings : `python -m py_compile main.py app.py` → erreurs de syntaxe ; lancer `pyright` ou `mypy` pour type errors load-bearing
- Warnings load-bearing : erreurs Pydantic de validation schema (`UserWarning: fields may not start with an underscore`), warnings asyncio de blocking call dans event loop
- Variance PSI N/A — FastAPI est une API JSON, pas un générateur de pages ; mesurer la latence p50/p95 via `pyinstrument` ou Prometheus
- Tripwire CI : `mypy --strict main.py` ou `ruff check .` dans le pipeline CI

## §1 — Critical path

N/A — FastAPI est une API JSON, pas un générateur de pages HTML avec CSS ; pas de render-blocking resources côté serveur.

## §2 — LCP

N/A — FastAPI ne sert pas de pages HTML avec images hero ; LCP géré par le frontend séparé (React, Vue, etc.).

## §3 — CLS

N/A — FastAPI ne génère pas de HTML avec layout ; CLS géré par le frontend séparé.

## §4 — Bundle

N/A — pas de bundle JS/CSS côté FastAPI ; si FastAPI sert du HTML statique via `StaticFiles`, les assets sont gérés par le bundler frontend.

## §5 — CSS

N/A — FastAPI ne génère pas de CSS ; purge et optimisation CSS relèvent du frontend séparé.

## §6 — Caching

- Routes API authentifiées : `Cache-Control: no-store` — ne jamais cacher les réponses contenant des données utilisateur
- Données publiques stables : `Cache-Control: public, max-age=300, stale-while-revalidate=60` via header explicite dans la response
- Fichiers statiques via `StaticFiles` : `Cache-Control: public, max-age=31536000, immutable` si fichiers hashés (à configurer via `StaticFiles(headers={"Cache-Control": "..."})`)
- Pas de cache framework natif → utiliser `fastapi-cache2` + Redis ; `@cache(expire=60)` decorator sur les endpoints read-heavy
- ETag / Last-Modified : implémenter manuellement via response headers

## §7 — SSR

N/A — FastAPI ne fait pas de SSR ; templates Jinja2 éventuel mais rare et hors scope web-optimize.

## §8 — INP/TBT

N/A — FastAPI est un backend sans DOM ; pas d'interactions utilisateur côté serveur.

## §9 — Backend / TTFB

- Chemin critique : endpoint async → `await db.execute(select(User))` → réponse JSON sérialisée via Pydantic
- Queries séquentielles max : 3 ; au-delà, `asyncio.gather(task1, task2, task3)` pour paralléliser les appels I/O indépendants
- Connexion data layer : voir `data-pivots-sqlalchemy.md` pour SQLAlchemy async
- Cold start : Uvicorn redémarre proprement → pas de cold start problématique (non serverless par défaut) ; si Lambda/Cloud Run : `PROVISIONED_CONCURRENCY` ou keep-warm ping
- Async vs sync routes : `async def endpoint()` exécuté dans l'event loop — ne PAS faire de I/O bloquant ; `def endpoint()` exécuté dans threadpool — OK pour libs sync
- Mixage sync I/O dans `async def` = bloque l'event loop entier → audit obligatoire

## §10 — Client-side storage

N/A — FastAPI ne peut accéder ni à localStorage ni à sessionStorage (côté serveur Python) ; ces ressources sont navigateur uniquement.

## §11 — Verification

- `pyinstrument` pour profiling endpoint par endpoint
- Prometheus middleware (`prometheus-fastapi-instrumentator`) pour metrics
- OpenTelemetry / Sentry pour APM
- Critère déterministe : latence p50/p95 par endpoint (Prometheus ou `pyinstrument`), query count via SQLAlchemy events
- Comparaison : médiane post-fix vs maximum pré-fix sur le même endpoint avec charge identique (`wrk` ou `vegeta`)

---

## Notes internes FastAPI (hors contrat web-optimize)

### Pydantic v2

- Pydantic v2 = 5-50× plus rapide que v1 (rust core)
- `model_config = ConfigDict(from_attributes=True)` pour ORM mode
- `Response model` strict pour éviter de fuiter des champs (passwords, internal flags)

### Response serialization

- `response_model=...` impose la shape de sortie ; sans ça, FastAPI retourne le dict complet
- `response_model_exclude_unset=True` pour PATCH (ne renvoie pas les défauts non-touchés)
- `orjson` (`pip install orjson`) → JSON encoder 3-5× plus rapide ; activer via `ORJSONResponse`

### Dependency injection

- `Depends(...)` execute par request → caching avec `use_cache=True` (défaut) pour singletons request-scoped
- Lourd dependencies (DB session, settings) : `lru_cache` sur settings, `async def get_db` qui yield la session

### Background tasks

- `BackgroundTasks` : exécuté APRÈS la response, dans le même process → OK pour tâches courtes (< 1s)
- Tâches longues : Celery / arq / dramatiq via Redis → externalisé

### Middleware

- Chaque middleware execute par request → auditer la liste (`app.add_middleware(...)`)
- `CORSMiddleware`, `GZipMiddleware`, `TrustedHostMiddleware` standard
- Custom middleware async : utiliser `BaseHTTPMiddleware` ou ASGI pur (le 2nd plus rapide)

### Streaming

- `StreamingResponse(generator)` pour gros fichiers / SSE → ne charge pas tout en mémoire
- `iter_content()` côté générateur async pour lecture chunked

### Database

- **AsyncIO drivers** obligatoires si endpoints async : `asyncpg` (Postgres), `aiomysql`, `motor` (Mongo)
- SQLAlchemy 2.0 async : voir `data-pivots-sqlalchemy.md`
- Connection pool tuning : `pool_size`, `max_overflow` selon worker count × concurrency

### Validation cost

- Pydantic models validés à l'entrée ET à la sortie (`response_model`) → 2× la validation
- Pour endpoints très chauds, considérer dict natif + serialization manuelle (perdre la safety)
