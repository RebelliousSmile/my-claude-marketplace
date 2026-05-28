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
- Capturer payload bytes : `Content-Length` agrégé via DevTools ou `curl -o /dev/null -s -w "%{size_download}"`
- Compteurs déterministes : `pg_stat_statements.calls` avant/après une action en prod ; `RUST_LOG=sqlx::query=debug` + compteur manuel en dev

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
- Détecter appels en boucle : `grep -rn "query!\|query_as!\|fetch_one\|fetch_all" src/ --include="*.rs"` dans des boucles `.iter().map()` ou `for`
- Batch : `WHERE id = ANY($1::bigint[])` avec `&ids as &[i64]` → 1 query pour N objets
- Préférer `json_agg` (Postgres) / `JSON_ARRAYAGG` (MySQL) pour agréger relations 1-N en 1 query

## §2 — Pagination (select narrowing + pagination)

- Requête bornée : `LIMIT $1 OFFSET $2` ; curseur : `WHERE id > $1 ORDER BY id LIMIT $2`
- Détecter requêtes sans limite : `grep -rn "fetch_all\b" src/ --include="*.rs"` — tout `fetch_all` sans `LIMIT` est suspect
- Pattern curseur recommandé : `WHERE id > $last_id ORDER BY id LIMIT 20` — keyset pagination plus performant que OFFSET sur grandes tables
- `SELECT u.id, u.email` natif obligatoire — JAMAIS `SELECT *` en production
- Toujours `ORDER BY` stable pour pagination reproductible

## §3 — Real-time

SQLx supporte `PgListener` pour PostgreSQL `NOTIFY`/`LISTEN` :

```rust
let mut listener = PgListener::connect_with(&pool).await?;
listener.listen("my_channel").await?;
loop {
    let notif = listener.recv().await?;
    /* handle notification */
}
```

- Cleanup : boucle dans une task Tokio dédiée via `tokio::spawn(...)` ; drop du listener à l'arrêt (`graceful_shutdown`)
- Scope : écouter un channel spécifique (ex. `user_123_notifications`) pas tous les events — éviter les souscriptions à `*` qui amplifient les lectures
- Détecter fuites : si `PgListener` n'est pas droppé à l'arrêt, la connexion DB reste ouverte — vérifier avec `SELECT count(*) FROM pg_stat_activity`

## §4 — Caching layer

- Niveaux disponibles : cache applicatif (`moka` in-memory TTL, `redis-rs` Redis), HTTP cache headers
- TTL : `moka::Cache::builder().time_to_live(Duration::from_secs(300)).build()`
- Détecter cache miss systématique : `pg_stat_statements.calls` augmente à chaque request sur données invariantes
- Invalidation : clé par ressource (`cache.invalidate(&user_id)`) ou TTL passif
- Pool partagé via `axum::extract::State<PgPool>` ou `Arc<PgPool>`

## §5 — Payload optimization

- `SELECT u.id, u.email` natif obligatoire — JAMAIS `SELECT *` en code de production
- Mapping struct → champs explicites, le compile-time check valide la shape
- Détecter overfetch : `grep -rn "SELECT \*" src/ --include="*.rs"` — tout `SELECT *` est overfetch
- Compression : via `tower-http::compression::CompressionLayer` côté Axum ; SQLx lui-même ne compresse pas les résultats
- Format binaire : protocole wire Postgres natif via `asyncpg`-compatible — pas de surcoût JSON côté DB

## §6 — Quota & cost

- `pg_stat_statements` pour query count et timing : `SELECT query, calls, total_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 20`
- `sqlx::pool::PoolOptions` : `metrics()` non exposé nativement — implémenter via `tracing` spans ou Prometheus custom counter
- Pas de facturation par query ; coût = compute + storage DB
- Alerts : Prometheus + Grafana pour latence p95 ; pas de billing natif (auto-hébergé)

## §7 — Security

- `query!()` et `query_as!()` : paramètres bindés au compile-time → injection SQL impossible
- `query("...")` runtime : toujours avec `.bind(value)` — jamais d'interpolation string ou format!()
- Filtrage : `WHERE user_id = $1` avec `user_id` depuis le token JWT/session auth — toujours scopé à l'utilisateur courant
- Tests : `cargo test` avec DB de test ; vérifier que `SELECT ... WHERE user_id = $1` avec `other_user_id` retourne 0 rows pour le current_user

## §8 — Schema & indexing

- Migrations SQL versionnées (`migrations/*.sql`) gérées par `sqlx::migrate!` ou `sqlx-cli`
- `CREATE INDEX CONCURRENTLY` (Postgres) pour migration prod sans lock table
- Détecter requêtes sans index : `EXPLAIN ANALYZE` côté DB sur les queries lentes loggées via `RUST_LOG=sqlx::query=debug`
- Dénormalisation : dupliquer les champs fréquemment lus (ex. `post.author_name TEXT`) pour éviter les JOINs répétés
- Audit via `EXPLAIN ANALYZE` + `pg_stat_statements` pour identifier les seq scans

## §9 — Background jobs

- `tokio::spawn(async move { /* SQLx query */ })` pour fire-and-forget
- Pour reliable jobs : `apalis` avec SQLx backend (PostgreSQL comme queue) — idempotence native via `UNIQUE` constraint sur job_id
- Retry : `apalis` retry config ; ou exponential backoff manuel avec `tokio::time::sleep(Duration::from_millis(2_u64.pow(attempt) * 100))`
- Idempotence SQL : `INSERT ... ON CONFLICT (id) DO NOTHING`

## §10 — Verification

- Critère déterministe : query count via `EXPLAIN ANALYZE` (Postgres) ; `pg_stat_statements.calls` pour baseline avant/après
- `RUST_LOG=sqlx::query=debug` pour logs queries en dev avec temps d'exécution par query
- Comparaison : médiane post-fix vs max pre-fix sur le même user-flow avec charge identique (`wrk` ou `vegeta`)
- Observability : `tracing` spans autour des queries critiques ; Sentry APM / OpenTelemetry pour prod

## §11 — Self-audit

- Faux positifs : `query("...")` (sans macro) n'est pas un anti-pattern — valide pour queries dynamiques avec filtres optionnels
- Gaps candidats : manque de documentation sur `QueryBuilder` pour search avec filtres optionnels ; pas de section sur `COPY` protocol via `PgCopyIn` pour bulk imports > 10k lignes
- N/A items : §3 Real-time partiellement applicable (SQLx supporte `PgListener` mais c'est un usage avancé)

---

## Notes internes SQLx (hors contrat data-optimize)

### Select narrowing

- `SELECT u.id, u.email` natif obligatoire — JAMAIS `SELECT *` dans production code
- Mapping struct → champs explicites, le compile-time check valide la shape

### Transactions

- `let mut tx = pool.begin().await?; ...; tx.commit().await?;`
- `?` propage : si erreur avant commit → drop = rollback automatique
- Pas de transaction implicite, tout explicite

### Compile-time vs runtime queries

- `query!` / `query_as!` : compile-time checked, recommandé partout où possible
- `query("...")` (sans macro) : runtime, pour queries dynamiques (filtres optionnels, search builder)
- `QueryBuilder` (sqlx::QueryBuilder) pour construire dynamiquement avec bindings safe

### Bulk operations

- `INSERT INTO ... VALUES ($1, $2), ($3, $4), ...` via QueryBuilder
- `UNNEST` (Postgres) pour bulk insert depuis arrays Rust :
  ```rust
  sqlx::query!("INSERT INTO users (email) SELECT * FROM UNNEST($1::text[])", &emails)
  ```
- COPY protocol via `PgCopyIn` pour très gros imports (10k+ rows)

### Migrations

- `sqlx migrate run` (CLI) ou `sqlx::migrate!("./migrations").run(&pool).await?` au startup
- Migrations idempotent autant que possible
- Destructive migrations → 2 étapes (compat + cleanup)

### Connection pool

- `PgPoolOptions::new().max_connections(20).connect(&database_url).await?`
- `min_connections` + `idle_timeout` + `max_lifetime` à tuner selon trafic
- Pool partagé via `axum::extract::State<PgPool>` ou `Arc<PgPool>`

### Async vs sync

- SQLx full async → toutes les queries dans `async fn`
- Bannir `block_on(...)` dans async context (deadlock potentiel)
- Pour CPU-heavy post-processing : `tokio::task::spawn_blocking`

### Error handling

- `sqlx::Error` : variants `RowNotFound`, `Database(...)` (avec SQLSTATE), `ColumnDecode`
- Match `code()` sur les UniqueViolation (23505 Postgres) pour gérer conflict UX
