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

## §1 — N+1 (lazy loading)

- Lazy loading par défaut sur relations (`relationship('Post')`) → 1 query par accès → N+1
- **Fix** : `select(User).options(selectinload(User.posts))` ou `joinedload(User.posts)`
  - `selectinload` : 2 queries (users + posts WHERE user_id IN [...]) — meilleur pour collections
  - `joinedload` : 1 query avec LEFT JOIN — meilleur pour many-to-one
- `lazy='raise'` sur relations en dev → exception au lieu de N+1 silencieux

## §2 — Select narrowing

- `select(User.id, User.email)` → tuple plat, pas d'objet ORM, plus rapide
- `defer(User.bio)` pour exclure champs lourds
- Pour read-only API : query `select(User.id, ...)` + `.mappings().all()` retourne dicts

## §3 — Pagination

- `select(...).limit(N).offset(M)` OK petit volume
- Cursor : `select(...).where(User.id > last_id).order_by(User.id).limit(N)`
- `session.scalars(stmt).all()` pour materialiser ; `yield_per(100)` pour streamer

## §4 — Indexes

- `Column(..., index=True)` ou `Index('ix_user_email_created', User.email, User.created_at)` composite
- Alembic autogenerate : `alembic revision --autogenerate -m "..."` puis **review du SQL** avant `upgrade`
- Concurrent index Postgres : Alembic ne le génère pas auto, à écrire manuellement (`op.execute("CREATE INDEX CONCURRENTLY ...")`)

## §5 — Sessions

- `Session` per-request pattern : `async def get_db()` yield + close (FastAPI)
- `expire_on_commit=False` pour async (sinon refresh inutile après commit, qui re-query)
- `session.flush()` envoie au DB sans commit ; `session.commit()` valide

## §6 — Async (SQLAlchemy 2.0)

- `AsyncEngine` + `AsyncSession` avec drivers async (`asyncpg`, `aiomysql`)
- `async with AsyncSession(engine) as session: result = await session.scalars(stmt)`
- Pas de lazy loading async — toujours `selectinload` / `joinedload` explicite (sinon `MissingGreenlet` erreur)

## §7 — Connection pool

- `create_engine(..., pool_size=20, max_overflow=10, pool_pre_ping=True)`
- `pool_pre_ping` détecte les connexions mortes (cloud DB qui ferme idle) — coût léger, gain stabilité
- Serverless : `NullPool` ou pool externe (PgBouncer)

## §8 — Bulk operations

- `session.execute(insert(User), [{...}, {...}])` (executemany) > `session.add_all([...])` (ORM mode)
- `bulk_save_objects` (legacy) ou `Session.execute(insert(...).values([...]))` pour gros volumes
- ORM events (`before_insert`, `after_update`) skipped en bulk → side-effects à gérer manuellement

## §9 — Migrations (Alembic)

- `alembic upgrade head` en CI/CD
- Migrations destructives (drop column, alter type) → 2 étapes (compat first, drop later)
- `op.execute()` pour SQL spécifique BDD (CTE, partial index)

## §10 — Identity map

- `Session` cache les objets par PK → `session.get(User, 1)` puis 2e call = cache hit
- Long-lived sessions accumulent les objets en mémoire → `session.expire_all()` ou nouvelle session

## §11 — Raw queries

- `text("SELECT ... WHERE col = :val")` avec bindings paramétriques toujours
- `session.execute(text(...))` retourne `Result` ; `.mappings().all()` pour dicts
