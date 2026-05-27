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

## §1 — Async vs sync routes

- `async def endpoint()` : exécuté dans l'event loop, ne PAS faire de I/O bloquant (requests sync, time.sleep, DB driver sync)
- `def endpoint()` (sync) : exécuté dans threadpool — OK pour libs sync, MAIS coût threadpool
- **Mixage incorrect** = pire des 2 mondes : sync I/O dans async = bloque l'event loop entier
- Audit obligatoire : chaque `async def` ne contient QUE des `await` ou code CPU-bound léger

## §2 — Pydantic v2

- Pydantic v2 = 5-50× plus rapide que v1 (rust core)
- `model_config = ConfigDict(from_attributes=True)` pour ORM mode
- `Response model` strict pour éviter de fuiter des champs (passwords, internal flags)

## §3 — Response serialization

- `response_model=...` impose la shape de sortie ; sans ça, FastAPI retourne le dict complet
- `response_model_exclude_unset=True` pour PATCH (ne renvoie pas les défauts non-touchés)
- `orjson` (`pip install orjson`) → JSON encoder 3-5× plus rapide ; activer via `ORJSONResponse`

## §4 — Dependency injection

- `Depends(...)` execute par request → caching avec `use_cache=True` (défaut) pour singletons request-scoped
- Lourd dependencies (DB session, settings) : `lru_cache` sur settings, `async def get_db` qui yield la session

## §5 — Background tasks

- `BackgroundTasks` : exécuté APRÈS la response, dans le même process → OK pour tâches courtes (< 1s)
- Tâches longues : Celery / arq / dramatiq via Redis → externalisé

## §6 — Caching

- Pas de cache framework natif → utiliser `fastapi-cache2` + Redis
- `@cache(expire=60)` decorator sur les endpoints read-heavy
- ETag / Last-Modified : implémenter manuellement via response headers

## §7 — Middleware

- Chaque middleware execute par request → auditer la liste (`app.add_middleware(...)`)
- `CORSMiddleware`, `GZipMiddleware`, `TrustedHostMiddleware` standard
- Custom middleware async : utiliser `BaseHTTPMiddleware` ou ASGI pur (le 2nd plus rapide)

## §8 — Streaming

- `StreamingResponse(generator)` pour gros fichiers / SSE → ne charge pas tout en mémoire
- `iter_content()` côté générateur async pour lecture chunked

## §9 — Database

- **AsyncIO drivers** obligatoires si endpoints async : `asyncpg` (Postgres), `aiomysql`, `motor` (Mongo)
- SQLAlchemy 2.0 async : voir `data-pivots-sqlalchemy.md`
- Connection pool tuning : `pool_size`, `max_overflow` selon worker count × concurrency

## §10 — Validation cost

- Pydantic models validés à l'entrée ET à la sortie (`response_model`) → 2× la validation
- Pour endpoints très chauds, considérer dict natif + serialization manuelle (perdre la safety)

## §11 — Verification

- `pyinstrument` pour profiling endpoint par endpoint
- Prometheus middleware (`prometheus-fastapi-instrumentator`) pour metrics
- OpenTelemetry / Sentry pour APM
