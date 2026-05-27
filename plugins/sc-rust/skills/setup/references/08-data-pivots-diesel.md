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

## §2 — Select narrowing

- `Selectable` derive → struct typée pour `select(MyStruct::as_select())`
- `.select((users::id, users::email))` tuple pour partial select
- Compile-time check des types et noms de colonnes (vs schema.rs)

## §3 — Pagination

- `.limit(N).offset(M)` OK ; cursor via `.filter(id.gt(last_id)).limit(N)`
- `r2d2` pool obligatoire pour réutiliser les connections

## §4 — Indexes

- Migrations SQL pures dans `migrations/{ts}_name/{up,down}.sql`
- `diesel migration generate name` puis écrire SQL manuellement
- `CREATE INDEX CONCURRENTLY` pour Postgres prod

## §5 — Connection pool

- `diesel::r2d2::Pool` configuré : `max_size`, `min_idle`, `connection_timeout`
- Pool partagé via `Arc` dans state Axum/Actix
- Bloquer le current thread si pool exhausté → critique en async runtime (utiliser `spawn_blocking` pour wrap les calls Diesel sync dans Tokio)

## §6 — Transactions

- `conn.transaction::<_, diesel::result::Error, _>(|conn| { ... })?`
- Rollback si la closure retourne `Err`
- `conn.transaction(...)` est sync — wrap dans `spawn_blocking` en async context

## §7 — Migrations

- `diesel migration run` (CLI) ou `embed_migrations!()` au startup
- Schema.rs régénéré automatiquement après migration — committed pour reproductibilité
- Migrations destructives → 2 étapes (compat first, drop later)

## §8 — Bulk operations

- `insert_into(users::table).values(&vec_of_new_users).execute(conn)?` → 1 query INSERT multi-values
- `on_conflict(...).do_update().set(...)` pour upsert (Postgres / SQLite)

## §9 — Raw queries

- `diesel::sql_query("SELECT ... WHERE id = $1").bind::<Integer, _>(id).load::<MyStruct>(conn)?`
- `QueryableByName` derive pour mapping
- Préférer le query builder typé sauf SQL spécifique BDD

## §10 — Async (diesel-async)

- `diesel_async::AsyncPgConnection` + `bb8` pool async
- API similaire à diesel sync mais avec `.await` et `RunQueryDsl::load(&mut conn).await`
- Maturité : Postgres OK, MySQL partiel ; SQLite pas supporté nativement

## §11 — Error handling

- `diesel::result::Error` : `NotFound`, `DatabaseError(kind, info)` (UniqueViolation, etc.)
- Match `DatabaseErrorKind::UniqueViolation` pour gérer conflits métier
