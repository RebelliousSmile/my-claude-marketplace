---
paths:
  - "drizzle.config.ts"
  - "drizzle.config.js"
  - "**/schema.ts"
  - "**/db/schema/**/*.ts"
  - "drizzle/**/*.sql"
---

# Data pivots — Drizzle ORM

Stack-specific overrides for data audits when `drizzle-orm` is detected. Loaded by `data-optimize`. Concatenate with backend pivots.

## §0 — Pre-flight

- Logger Drizzle : `drizzle(client, { logger: true })` en dev — capturer query count par endpoint
- `db.execute(sql\`EXPLAIN ANALYZE ...\`)` pour les requêtes critiques avant deploy

## §1 — N+1

- Drizzle relational queries (`db.query.users.findMany({ with: { posts: true } })`) **ne fait PAS de join** par défaut : 1 query + 1 query par relation → N+1 silencieux
- **Fix** : `db.select(...).from(users).leftJoin(posts, ...)` explicite, puis regroupement côté code (Map par id)
- Ou activer `with: { posts: true }` mais auditer le SQL généré (`logger: true`)

## §2 — Select narrowing

- `db.select({ id: users.id, email: users.email })` — partial select obligatoire
- `db.select()` (full row) interdit dès qu'on ne consomme pas tout

## §3 — Pagination

- `.limit(N).offset(N)` OK jusqu'à ~1000 ; au-delà cursor-based avec `where(gt(users.id, lastId))`
- `orderBy` stable obligatoire

## §4 — Indexes

- Drizzle ne crée pas les indexes par convention — déclarer explicitement :
  ```ts
  export const users = pgTable('users', { ... }, (t) => ({
    emailIdx: index('users_email_idx').on(t.email),
  }))
  ```
- `drizzle-kit generate` lit les déclarations → vérifier le SQL généré

## §5 — Connection pool

- `pg.Pool` / `postgres.js` configuré explicitement (Drizzle ne le pool pas)
- Serverless : `postgres('...', { max: 1, prepare: false })` + PgBouncer transaction mode

## §6 — Singleton

- Même piège qu'avec Prisma en dev hot-reload → globalThis pattern

## §7 — Prepared statements

- `db.select(...).prepare('name').execute({ ... })` réutilisable → gain réel sur queries hot path
- Prepared statements **incompatibles** avec PgBouncer transaction mode (Supabase pooler 6543) → `prepare: false` côté driver

## §8 — Migrations

- `drizzle-kit push` interdit en prod — utiliser `drizzle-kit generate` + `drizzle-kit migrate`
- Auditer les `*.sql` générés avant merge
