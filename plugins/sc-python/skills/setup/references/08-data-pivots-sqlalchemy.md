---
paths:
  - "**/models/**/*.py"
  - "**/database.py"
  - "**/db.py"
  - "alembic/**/*.py"
---

# Data pivots — SQLAlchemy

Stack-specific overrides for data audits when `sqlalchemy` is detected. Loaded by `data-optimize`. Concatenate with backend pivots (FastAPI / Flask / async server).

## §0 — Pre-flight

- `create_engine(..., echo=True)` en dev → log de chaque query ; jamais en prod
- `pip install sqlalchemy-utils` + `from sqlalchemy import event` pour mesurer `before_cursor_execute` / `after_cursor_execute`
- Capturer payload bytes : `Content-Length` agrégé via DevTools HAR ou `curl -o /dev/null -s -w "%{size_download}"` par endpoint
- Compteurs déterministes : query counter via events `before_cursor_execute` / `after_cursor_execute` — incrémenter un compteur thread-local pour baseline reproductible

## §1 — N+1 (lazy loading)

- Lazy loading par défaut sur relations (`relationship('Post')`) → 1 query par accès → N+1
- **Fix** : `select(User).options(selectinload(User.posts))` ou `joinedload(User.posts)`
  - `selectinload` : 2 queries (users + posts WHERE user_id IN [...]) — meilleur pour collections
  - `joinedload` : 1 query avec LEFT JOIN — meilleur pour many-to-one
- `lazy='raise'` sur relations en dev → exception au lieu de N+1 silencieux
- Détecter les appels en boucle : `grep -rn "session\.get\|session\.execute" app/ --include="*.py"` dans des boucles `for`
- Batch : `select(Post).where(Post.id.in_(ids))` → 1 query pour N objets

## §2 — Pagination (select narrowing + pagination)

- Requête bornée : `select(...).limit(N).offset(M)` ou curseur `where(User.id > last_id).order_by(User.id).limit(N)`
- Détecter requêtes sans limite : `grep -rn "\.scalars()\|\.all()\b" app/ --include="*.py"` — toute query sans `.limit()` retournée à un endpoint est suspect
- Pattern curseur recommandé : `select(...).where(User.id > last_id).order_by(User.id).limit(N)` — keyset pagination plus performant que OFFSET sur grandes tables
- `session.scalars(stmt).all()` pour matérialiser ; `yield_per(100)` pour streamer sans tout charger en mémoire

## §3 — Real-time

N/A — SQLAlchemy est un ORM request/response pur.

Pour real-time côté serveur : SQLAlchemy `listen(event, ...)` pour ORM events ; clients temps réel via SSE/WebSocket séparé (ex. `asyncio.Queue` + FastAPI `StreamingResponse`).

## §4 — Caching layer

- Niveaux disponibles : cache applicatif (Redis via `redis-py`), HTTP cache (`Cache-Control` headers), in-memory LRU (`cachetools`)
- TTL : `redis.setex(key, seconds, value)` ; `cachetools.TTLCache(maxsize=128, ttl=300)`
- Détecter cache miss systématique : même query exécutée à chaque request sur données invariantes → logger via `after_cursor_execute` event et compter
- `Session` cache les objets par PK → `session.get(User, 1)` puis 2e call = cache hit identity map
- Long-lived sessions accumulent les objets en mémoire → `session.expire_all()` ou nouvelle session par request

## §5 — Payload optimization

- Projection : `select(User.id, User.email)` → tuple plat, pas d'objet ORM, plus rapide
- `defer(User.bio)` pour exclure champs lourds ; `undefer(User.bio)` pour forcer si nécessaire
- Détecter overfetch : `grep -rn "select(User)\b" app/ --include="*.py" | grep -v "\.options\(\|select_columns"` — select sans projection = overfetch
- Compression : FastAPI active GZip via `GZipMiddleware` ; Flask via `flask-compress` ; vérifier `Content-Encoding: gzip`
- Pour read-only API : `select(User.id, ...) + .mappings().all()` retourne dicts sans overhead ORM

## §6 — Quota & cost

- `pg_stat_statements` pour query count et timing en Postgres : `SELECT query, calls, total_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 20`
- `create_engine(..., echo_pool=True)` pour monitorer les connexions pool en dev
- Datadog/Sentry APM pour alertes de latence en production
- Auto-hébergé : pas de facturation par query ; coût = compute + storage DB ; monitorer connexions pool via métriques `pool.size()` / `pool.checkedin()`

## §7 — Security

- Toujours passer `user_id` en paramètre de query : `select(Post).where(Post.user_id == current_user.id)`
- `text("...")` : TOUJOURS avec `:param` bindings (`text("WHERE id = :id").bindparams(id=user_id)`) — jamais f-string ou `.format()`
- Row-level security Postgres : définir des policies SQL (`CREATE POLICY`) + `SET app.current_user_id = :id` en début de session
- Règles de sécurité : dans les repositories/services Python ; pas de mécanisme natif SQLAlchemy équivalent aux Firestore Rules
- Tests : `pytest` avec session de test scoped par utilisateur ; vérifier que `select(Post).where(Post.user_id == other_user.id)` retourne 0 résultat pour `current_user`

## §8 — Schema & indexing

- `Column(..., index=True)` ou `Index('ix_user_email_created', User.email, User.created_at)` composite
- Détecter requêtes sans index : `EXPLAIN ANALYZE` Postgres ; copier le SQL loggué via `echo=True` et analyser
- Dénormalisation : dupliquer les champs fréquemment lus (ex. `Post.author_name`) pour éviter les JOINs répétés
- Alembic autogenerate : `alembic revision --autogenerate -m "..."` puis **review du SQL** avant `upgrade`
- Concurrent index Postgres : Alembic ne le génère pas auto → `op.execute("CREATE INDEX CONCURRENTLY ...")`

## §9 — Background jobs

- SQLAlchemy utilisé dans les workers Celery/arq : créer une session par job (`async with AsyncSession(engine) as session:`)
- Ne jamais partager une session entre workers (thread-unsafe pour sync, task-unsafe pour async)
- `session.expire_on_commit=False` pour async jobs qui re-accèdent aux objets après commit
- Idempotence : `insert(...).on_conflict_do_nothing()` (Postgres) ou `merge()` SQLAlchemy pour upsert
- Retry : Celery `max_retries` + `self.retry(countdown=2**attempt)` ; arq `retry_jobs=True`

## §10 — Verification

- Critère déterministe : query count via `before_cursor_execute`/`after_cursor_execute` events ; `pg_stat_statements` pour baseline en production
- Comparaison : médiane post-fix vs max pre-fix sur même user-flow avec charge identique
- Observability : `create_engine(echo=True)` dev ; Sentry APM / OpenTelemetry / Datadog pour prod

## §11 — Self-audit

- Faux positifs : `lazy='raise'` en dev provoque des exceptions légitimes pour code de test — à restreindre aux classes de prod uniquement
- Gaps candidats : manque de documentation sur les `hybrid_property` SQLAlchemy comme point de N+1 caché ; pas de section sur `with_expression()` pour annotations dynamiques

---

## Notes internes SQLAlchemy (hors contrat data-optimize)

### Sessions

- `Session` per-request pattern : `async def get_db()` yield + close (FastAPI)
- `expire_on_commit=False` pour async (sinon refresh inutile après commit, qui re-query)
- `session.flush()` envoie au DB sans commit ; `session.commit()` valide

### Async (SQLAlchemy 2.0)

- `AsyncEngine` + `AsyncSession` avec drivers async (`asyncpg`, `aiomysql`)
- `async with AsyncSession(engine) as session: result = await session.scalars(stmt)`
- Pas de lazy loading async — toujours `selectinload` / `joinedload` explicite (sinon `MissingGreenlet` erreur)

### Connection pool

- `create_engine(..., pool_size=20, max_overflow=10, pool_pre_ping=True)`
- `pool_pre_ping` détecte les connexions mortes (cloud DB qui ferme idle) — coût léger, gain stabilité
- Serverless : `NullPool` ou pool externe (PgBouncer)

### Bulk operations

- `session.execute(insert(User), [{...}, {...}])` (executemany) > `session.add_all([...])` (ORM mode)
- `bulk_save_objects` (legacy) ou `Session.execute(insert(...).values([...]))` pour gros volumes
- ORM events (`before_insert`, `after_update`) skipped en bulk → side-effects à gérer manuellement

### Migrations (Alembic)

- `alembic upgrade head` en CI/CD
- Migrations destructives (drop column, alter type) → 2 étapes (compat first, drop later)
- `op.execute()` pour SQL spécifique BDD (CTE, partial index)

### Identity map

- `Session` cache les objets par PK → `session.get(User, 1)` puis 2e call = cache hit
- Long-lived sessions accumulent les objets en mémoire → `session.expire_all()` ou nouvelle session

### Raw queries

- `text("SELECT ... WHERE col = :val")` avec bindings paramétriques toujours
- `session.execute(text(...))` retourne `Result` ; `.mappings().all()` pour dicts
