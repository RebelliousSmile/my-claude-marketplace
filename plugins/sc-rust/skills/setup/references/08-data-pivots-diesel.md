---
paths:
  - "Cargo.toml"
  - "src/schema.rs"
  - "src/models.rs"
  - "src/**/*.rs"
  - "migrations/**/*.sql"
---

# Data pivots — Diesel ORM (Rust)

Stack-specific overrides for data audits when `diesel` is detected. Loaded by `data-optimize`.

## §0 — Pre-flight

- `diesel print-schema > src/schema.rs` à chaque migration appliquée (committed)
- Diesel = **sync par défaut** ; pour async : `diesel-async` crate (Postgres only mature)
- `RUST_LOG=diesel=debug` pour log queries dev
- Capturer payload bytes : `Content-Length` header agrégé via DevTools ou `curl -o /dev/null -s -w "%{size_download}"`
- Compteurs déterministes : `RUST_LOG=diesel=debug` + compteur manuel en dev ; `pg_stat_statements.calls` avant/après en prod pour baseline reproductible

## §1 — N+1 (manuel)

- Diesel ne fait pas de lazy loading invisible → joins explicites obligatoires
- Belongs-to / has-many : utiliser `inner_join` / `left_join` :
  ```rust
  posts::table.inner_join(users::table)
    .select((Post::as_select(), User::as_select()))
    .load::<(Post, User)>(conn)?
  ```
- `grouped_by` helper pour regrouper 1-N côté code après bulk fetch :
  ```rust
  let posts = Post::belonging_to(&users).load::<Post>(conn)?;
  let grouped = posts.grouped_by(&users);
  ```
- Détecter appels en boucle : `grep -rn "\.first(conn)\|\.load(conn)" src/ | grep -v "join"` dans des boucles `for` ou `.iter().map()`
- Batch : `posts::table.filter(posts::id.eq_any(&ids)).load::<Post>(conn)?` → 1 query pour N objets

## §2 — Pagination (select narrowing + pagination)

- Requête bornée : `.limit(N).offset(M)` ; curseur : `.filter(id.gt(last_id)).limit(N)`
- Détecter requêtes sans limite : `grep -rn "\.load(conn)\b" src/ --include="*.rs"` — tout `.load()` sans `.limit()` sur une table > 1k lignes est suspect
- Pattern curseur : `.filter(posts::id.gt(last_id)).order(posts::id.asc()).limit(20)` — keyset pagination plus performant que OFFSET
- `r2d2` pool obligatoire pour réutiliser les connections

## §3 — Real-time

N/A — Diesel est un ORM request/response pur (sync et diesel-async).

Pour NOTIFY/LISTEN Postgres avec Rust : `tokio-postgres` directement ou `sqlx` avec `PgListener`.

## §4 — Caching layer

- Niveaux disponibles : cache applicatif (`moka` in-memory TTL, `redis-rs` Redis), HTTP cache headers
- TTL : `moka::Cache::builder().time_to_live(Duration::from_secs(300)).build()`
- Détecter cache miss systématique : `pg_stat_statements.calls` augmente à chaque request sur données invariantes → ajouter couche `moka`
- `r2d2` pool obligatoire pour réutiliser les connections DB

## §5 — Payload optimization

- `Selectable` derive → struct typée pour `select(MyStruct::as_select())`
- `.select((users::id, users::email))` tuple pour partial select
- Détecter overfetch : `grep -rn "::as_select()\b" src/ --include="*.rs"` — vérifier que les structs ne chargent pas des champs inutilisés
- Compile-time check des types et noms de colonnes (vs schema.rs)
- Compression : via `tower-http::compression::CompressionLayer` côté Axum ; Diesel lui-même ne compresse pas

## §6 — Quota & cost

- Auto-hébergé : `pg_stat_statements` pour query count et timing : `SELECT query, calls, total_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 20`
- `RUST_LOG=diesel=info` pour logs queries en prod (verbose mais utile pour hot paths)
- Pas de facturation par query ; monitorer connexions pool via métriques `r2d2` (pool exhaustion = `r2d2::Error::Timeout`)
- Alerts : Prometheus + Grafana pour alertes latence ; pas de billing natif (auto-hébergé)

## §7 — Security

- Diesel = compile-time checked → injection SQL impossible via le query builder
- SQL littéral : utiliser `diesel::sql_query("... = $1").bind::<Integer, _>(id)` — jamais `format!()` ou interpolation string
- Filtrage obligatoire : `posts::table.filter(posts::user_id.eq(current_user_id))`
- Row-level security : à implémenter au niveau Postgres (`CREATE POLICY`) ; Diesel n'a pas de concept natif
- Tests : `cargo test` avec DB de test ; vérifier que `posts::table.filter(posts::user_id.eq(other_user_id)).first(&conn)` retourne `NotFound` pour l'utilisateur courant

## §8 — Schema & indexing

- Migrations SQL pures dans `migrations/{ts}_name/{up,down}.sql`
- `diesel migration generate name` puis écrire SQL manuellement
- `CREATE INDEX CONCURRENTLY` pour Postgres prod (sans lock table)
- Détecter requêtes sans index : `EXPLAIN ANALYZE` Postgres sur les queries lentes loggées via `RUST_LOG=diesel=debug`
- Dénormalisation : dupliquer les champs fréquemment lus (ex. `post.author_name VARCHAR`) pour éviter les JOINs répétés sur hot paths

## §9 — Background jobs

- Jobs Rust avec Diesel : `apalis` (job queue Rust) ou `tokio::spawn` pour fire-and-forget
- Diesel sync dans tokio : `tokio::task::spawn_blocking(move || { conn.transaction(|conn| { ... }) })`
- Idempotence : `INSERT ... ON CONFLICT DO NOTHING` ou `.on_conflict(...).do_update().set(...)`
- Retry : `apalis` gère le retry ; ou boucle manuelle avec `tokio::time::sleep(Duration::from_secs(2_u64.pow(attempt)))`

## §10 — Verification

- Critère déterministe : query count via `RUST_LOG=diesel=debug` (en dev) ; `pg_stat_statements.calls` en prod
- Baseline : noter queries/request sur hot paths via `pg_stat_statements` avant et après le fix
- Comparaison : médiane post-fix vs max pre-fix sur même user-flow avec charge identique
- Observability : `tracing` + `TraceLayer` pour Axum ; Sentry APM / OpenTelemetry pour prod

## §11 — Self-audit

- Faux positifs : `grouped_by` n'est pas un anti-pattern — c'est le pattern idiomatique Diesel pour relations 1-N
- Gaps candidats : manque de documentation sur `diesel-async` avec `bb8` pool et gestion des connexions idle ; pas de section sur `RETURNING` clause pour récupérer l'ID après INSERT
- N/A items : §3 Real-time (Diesel est request/response pur)

---

## Notes internes Diesel (hors contrat data-optimize)

### Select narrowing

- `Selectable` derive → struct typée pour `select(MyStruct::as_select())`
- `.select((users::id, users::email))` tuple pour partial select
- Compile-time check des types et noms de colonnes (vs schema.rs)

### Connection pool

- `diesel::r2d2::Pool` configuré : `max_size`, `min_idle`, `connection_timeout`
- Pool partagé via `Arc` dans state Axum/Actix
- Bloquer le current thread si pool exhausté → critique en async runtime (utiliser `spawn_blocking` pour wrap les calls Diesel sync dans Tokio)

### Transactions

- `conn.transaction::<_, diesel::result::Error, _>(|conn| { ... })?`
- Rollback si la closure retourne `Err`
- `conn.transaction(...)` est sync — wrap dans `spawn_blocking` en async context

### Migrations

- `diesel migration run` (CLI) ou `embed_migrations!()` au startup
- Schema.rs régénéré automatiquement après migration — committed pour reproductibilité
- Migrations destructives → 2 étapes (compat first, drop later)

### Bulk operations

- `insert_into(users::table).values(&vec_of_new_users).execute(conn)?` → 1 query INSERT multi-values
- `on_conflict(...).do_update().set(...)` pour upsert (Postgres / SQLite)

### Raw queries

- `diesel::sql_query("SELECT ... WHERE id = $1").bind::<Integer, _>(id).load::<MyStruct>(conn)?`
- `QueryableByName` derive pour mapping
- Préférer le query builder typé sauf SQL spécifique BDD

### Async (diesel-async)

- `diesel_async::AsyncPgConnection` + `bb8` pool async
- API similaire à diesel sync mais avec `.await` et `RunQueryDsl::load(&mut conn).await`
- Maturité : Postgres OK, MySQL partiel ; SQLite pas supporté nativement

### Error handling

- `diesel::result::Error` : `NotFound`, `DatabaseError(kind, info)` (UniqueViolation, etc.)
- Match `DatabaseErrorKind::UniqueViolation` pour gérer conflits métier
