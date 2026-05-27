---
paths:
  - "Cargo.toml"
  - "src/**/*.rs"
  - "migrations/**/*.sql"
  - "sqlx-data.json"
---

# Data pivots — SQLx (Rust)

Stack-specific overrides for data audits when `sqlx` is detected in `Cargo.toml`. Loaded by `data-optimize`.

## §0 — Pre-flight

- `sqlx::query!()` / `sqlx::query_as!()` macros → **compile-time checked queries** (requires `DATABASE_URL` ou `sqlx-data.json` offline)
- Offline mode : `cargo sqlx prepare` génère `sqlx-data.json` pour CI sans DB
- `RUST_LOG=sqlx=debug` pour log queries en dev

## §1 — Manual joins

- Pas d'ORM lazy loading → pas de N+1 caché, mais charge mentale sur le dev
- Joins explicites en SQL :
  ```rust
  sqlx::query_as!(UserWithPosts,
    "SELECT u.id, u.email, json_agg(p.*) as posts \
     FROM users u LEFT JOIN posts p ON p.user_id = u.id \
     GROUP BY u.id"
  )
  ```
- Préférer `json_agg` (Postgres) / `JSON_ARRAYAGG` (MySQL) pour agréger relations 1-N en 1 query

## §2 — Select narrowing

- `SELECT u.id, u.email` natif obligatoire — JAMAIS `SELECT *` dans production code
- Mapping struct → champs explicites, le compile-time check valide la shape

## §3 — Pagination

- `LIMIT $1 OFFSET $2` ; au-delà de quelques milliers passer cursor (`WHERE id > $1 ORDER BY id LIMIT $2`)
- Toujours `ORDER BY` stable

## §4 — Indexes

- Migrations SQL versionnées (`migrations/*.sql`) gérées par `sqlx::migrate!` ou `sqlx-cli`
- `CREATE INDEX CONCURRENTLY` (Postgres) pour migration prod sans lock
- Audit via `EXPLAIN ANALYZE` côté DB

## §5 — Connection pool

- `PgPoolOptions::new().max_connections(20).connect(&database_url).await?`
- `min_connections` + `idle_timeout` + `max_lifetime` à tuner selon trafic
- Pool partagé via `axum::extract::State<PgPool>` ou `Arc<PgPool>`

## §6 — Transactions

- `let mut tx = pool.begin().await?; ...; tx.commit().await?;`
- `?` propage : si erreur avant commit → drop = rollback automatique
- Pas de transaction implicite, tout explicite

## §7 — Compile-time vs runtime queries

- `query!` / `query_as!` : compile-time checked, recommandé partout où possible
- `query("...")` (sans macro) : runtime, pour queries dynamiques (filtres optionnels, search builder)
- `QueryBuilder` (sqlx::QueryBuilder) pour construire dynamiquement avec bindings safe

## §8 — Bulk operations

- `INSERT INTO ... VALUES ($1, $2), ($3, $4), ...` via QueryBuilder
- `UNNEST` (Postgres) pour bulk insert depuis arrays Rust :
  ```rust
  sqlx::query!("INSERT INTO users (email) SELECT * FROM UNNEST($1::text[])", &emails)
  ```
- COPY protocol via `PgCopyIn` pour très gros imports (10k+ rows)

## §9 — Migrations

- `sqlx migrate run` (CLI) ou `sqlx::migrate!("./migrations").run(&pool).await?` au startup
- Migrations idempotent autant que possible
- Destructive migrations → 2 étapes (compat + cleanup)

## §10 — Async vs sync

- SQLx full async → toutes les queries dans `async fn`
- Bannir `block_on(...)` dans async context (deadlock potentiel)
- Pour CPU-heavy post-processing : `tokio::task::spawn_blocking`

## §11 — Error handling

- `sqlx::Error` : variants `RowNotFound`, `Database(...)` (avec SQLSTATE), `ColumnDecode`
- Match `code()` sur les UniqueViolation (23505 Postgres) pour gérer conflict UX
