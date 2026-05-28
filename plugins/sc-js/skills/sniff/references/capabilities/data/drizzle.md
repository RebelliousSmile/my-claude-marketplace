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

- Logger dev : `drizzle(client, { logger: true })` — log chaque query SQL avec durée ; désactiver en prod
- Compteur déterministe : wrapper custom sur `db.execute` pour incrémenter un counter par request :
  ```ts
  let count = 0
  const db = drizzle(client, { logger: { logQuery: (q) => count++ } })
  ```
- Payload bytes : `Content-Length` agrégé DevTools HAR ; ou mesurer `JSON.stringify(result).length` sur les réponses des endpoints critiques
- `db.execute(sql`EXPLAIN ANALYZE ...`)` pour les requêtes critiques — capturer le plan avant tout déploiement
- Connection pool : `postgres.js` `postgres('...', { max: 10, prepare: false })` ou `pg.Pool` — Drizzle ne pool pas ; serverless : `max: 1, prepare: false` + PgBouncer transaction-mode
- Singleton pattern (même problème que Prisma en dev hot-reload) :
  ```ts
  const globalForDb = globalThis as unknown as { db: typeof db }
  export const db = globalForDb.db ?? drizzle(sql)
  if (process.env.NODE_ENV !== 'production') globalForDb.db = db
  ```

## §1 — Query patterns (N+1, eager-load, batch)

- **N+1 silencieux Drizzle** : les relational queries `db.query.users.findMany({ with: { posts: true } })` ne font **pas** de JOIN par défaut — génèrent 1 query users + 1 query posts par batch → N+1 si non vérifiés via logger
- **Fix** : join explicite `db.select(...).from(users).leftJoin(posts, eq(posts.userId, users.id))` puis regroupement côté code (Map par id)
- Alternative relational API : `with: { posts: true }` avec `logger: true` pour auditer le SQL généré
- **Grep N+1** :
  ```bash
  grep -rn "db\.query\.\w\+\.findMany\b" src/  # relational API : auditer le SQL généré
  grep -rn "\.forEach\|\.map" src/ | grep "await db\." # async dans boucle
  ```
- Batch multi-requêtes : `db.batch([query1, query2])` (Drizzle + D1/Turso) ou `Promise.all([q1, q2])` — 1 round-trip

## §2 — Pagination & limits

- `.limit(N).offset(N)` OK jusqu'à ~1000 rows ; au-delà cursor-based avec `where(gt(users.id, lastId))`
- `orderBy` stable obligatoire avec cursor (`asc(users.id)`)
- **Détecter illimité** : `grep -rn "db\.select\b\|db\.query\.\w\+\.findMany" src/ | grep -v "\.limit("` — absence de `.limit()` = red flag
- Cursor pattern :
  ```ts
  db.select().from(users)
    .where(gt(users.id, lastId))
    .orderBy(asc(users.id))
    .limit(20)
  ```

## §3 — Real-time subscriptions

- **N/A pour Drizzle standard** — Drizzle est un query builder SQL synchrone sans souscriptions temps réel
- Real-time via driver brut : `pg` LISTEN/NOTIFY avec `client.on('notification', ...)` ; scope : 1 channel par tenant, pas global ; nettoyage : `client.removeListener` dans le teardown
- Alternative : Supabase Realtime (si hébergé sur Supabase) — API Supabase `channel()`, pas Drizzle
- Pour Turso/Libsql : pas de LISTEN/NOTIFY — polling ou webhooks DB-side

## §4 — Caching layer

- Cache-aside Redis (Upstash / Redis Cloud) :
  ```ts
  const cached = await redis.get(`users:${page}`)
  if (cached) return JSON.parse(cached)
  const rows = await db.select().from(users).limit(20).offset(page * 20)
  await redis.setex(`users:${page}`, 60, JSON.stringify(rows))
  return rows
  ```
- **TTL et invalidation** : `redis.setex(key, ttlSeconds, value)` ; invalider sur mutation : `redis.del(key)` dans le handler de write
- TanStack Query / SWR côté client : `staleTime: 2 * 60 * 1000` sur queries de référence
- **Détecter cache miss systématique** : logger Drizzle log chaque requête → aucune donnée servie depuis cache → ajouter la couche Redis

## §5 — Projection (select narrowing)

- `db.select({ id: users.id, email: users.email })` — partial select obligatoire dès qu'on ne consomme pas tout
- `db.select()` (full row) interdit dès qu'on retourne au client et que la table a des colonnes lourdes
- **Grep overfetch** :
  ```bash
  grep -rn "db\.select()" src/  # sans projection = full row
  grep -rn "db\.query\.\w\+\.findMany" src/ | grep -v "columns:"  # relational API sans columns
  ```
- Compression : gzip/brotli configuré côté serveur (Nitro, Express, nginx) — vérifier `Content-Encoding` dans les réponses

## §6 — Quota & cost awareness

- **Métriques quota** :
  - PostgreSQL : `pg_stat_statements` — `SELECT query, calls, total_exec_time, rows FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 20`
  - Neon / Supabase / PlanetScale : dashboards natifs (compute time, rows read, bandwidth)
  - Turso : dashboard Turso (reads, writes, egress)
- **Opérations facturées** : SQL hébergé = rows lus × compute ; PlanetScale = rows read/written ; Turso = rows read/written
- **Règle prioritaire** : déclarer les index explicitement dans le schema Drizzle (voir §8) → réduit les rows scanned
- Drizzle n'a pas de dashboard natif de metrics — instrumenter via OpenTelemetry ou logger custom

## §7 — Security & access control

- **Scope obligatoire** : toute query sur ressource utilisateur doit avoir `where(eq(table.userId, session.userId))` — jamais de `db.select().from(table)` sans filtre tenant
- **SQL injection safe** : le tagged template `sql`...`` de Drizzle est paramétré ; pour `db.execute(sql`...`${value}`)` les interpolations sont des bind params — jamais de concaténation string manuelle
  ```ts
  // ✅ Safe
  db.execute(sql`SELECT * FROM users WHERE id = ${userId}`)
  // ❌ Injection
  db.execute(sql.raw(`SELECT * FROM users WHERE id = ${userId}`))
  ```
- **Anti-patterns** :
  - `db.select().from(users)` sans `where` = fuite multi-tenant
  - `sql.raw(...)` avec données non sanitizées = injection SQL
- **Tests sécurité** : tests unitaires vérifiant que `userId` est injecté depuis `ctx`/`session`, jamais depuis le body

## §8 — Schema & indexing

- Index explicite dans le schema Drizzle (non automatiques) :
  ```ts
  export const users = pgTable('users', { ... }, (t) => ({
    emailIdx: index('users_email_idx').on(t.email),
    userCreatedIdx: index('users_user_created_idx').on(t.userId, t.createdAt),
  }))
  ```
- `drizzle-kit generate` lit les déclarations → vérifier les fichiers `.sql` générés avant merge
- **Détecter index manquant** : `EXPLAIN ANALYZE` sur PostgreSQL ; `db.execute(sql`EXPLAIN ...`)` via Drizzle
- **Dénormalisation** : dupliquer les champs fréquemment lus pour éviter les joins coûteux
- Migrations : `drizzle-kit push` interdit en prod — utiliser `drizzle-kit generate` + `drizzle-kit migrate` en CI

## §9 — Background jobs & async

- **Déléguer hors hot path** : mutations lourdes → BullMQ / Inngest / Trigger.dev
  ```ts
  // ❌ Bloquant
  await sendNotification(userId)
  // ✅ Queue
  await notifQueue.add('notify', { userId })
  ```
- **Idempotence Drizzle** : `db.insert(users).values({ ... }).onConflictDoUpdate({ target: users.email, set: { updatedAt: new Date() } })` — safe si le job est rejoué
- **Retry / backoff BullMQ** :
  ```ts
  new Queue('jobs', { defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } } })
  ```
- Drizzle dans les workers : appliquer le singleton pattern ; connection pool séparé si workers dédiés

## §10 — Verification & non-regression

- **Critère déterministe** : nombre de queries SQL par endpoint avant/après — mesurer via le logger Drizzle custom counter
- **Baseline JSON** : créer `baselines/drizzle-queries.json` avec `{ endpoint, queriesCount, avgDurationMs }` ; comparer médiane post-fix vs maximum pré-fix
- **Observability** :
  - `pg_stat_statements` : baseline `calls` et `total_exec_time` par query avant/après
  - OpenTelemetry : wrapper sur `db.execute` pour exporter des traces
  - Sentry Performance : `startSpan({ op: 'db.query', name: queryDescription })` autour des queries critiques

## §11 — Checklist self-audit

- **Faux positifs connus** :
  - `db.execute(sql`...`)` bare est bien capturé par le logger ; `db.execute(rawSql)` avec string statique aussi — mais les templates statiques non-paramétrisés ne sont pas tracés différemment
  - Prepared statements (`db.select(...).prepare('name')`) **incompatibles** avec PgBouncer transaction mode (Supabase pooler port 6543) → `prepare: false` côté driver ; ne pas auditer les prepared statements si PgBouncer est actif
  - Drizzle relational API (`db.query.*`) peut sembler faire 1 query dans le code mais en génère N — toujours vérifier avec `logger: true`
- **Gaps candidats** :
  - Pagination cursor sur schémas sans colonne `id` ordonnée (UUID v4 non-trié) — cursor based complexe, non couvert
  - Drizzle batch API (`db.batch`) disponible pour D1/Turso mais pas encore pour pg standard
  - RLS PostgreSQL via `SET LOCAL app.user_id` avant chaque transaction — pattern non couvert
- **Commandes grep utiles** :
  ```bash
  grep -rn "db\.select()" src/ | grep -v "select({" # full row sans projection
  grep -rn "db\.select\|db\.query" src/ | grep -v "\.limit(" # sans limit
  grep -rn "sql\.raw(" src/                           # SQL brut à auditer
  grep -rn "drizzle(" src/ | wc -l                   # > 1 = violation singleton potentielle
  ```
