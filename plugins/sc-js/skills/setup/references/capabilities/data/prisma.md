---
paths:
  - "prisma/schema.prisma"
  - "**/prisma/**/*.ts"
  - "**/*.prisma"
  - "server/**/*.ts"
  - "src/lib/prisma.ts"
---

# Data pivots — Prisma ORM

Stack-specific overrides for data audits when `@prisma/client` is detected. Loaded by `data-optimize`. Concatenate with backend pivots (Nuxt server, Next.js API routes, Express, etc.).

## §0 — Pre-flight

- Logger dev : `log: ['query', 'info', 'warn', 'error']` dans `new PrismaClient({ log: [...] })` — jamais en prod (fuite I/O)
- Compteur déterministe : `prisma.$on('query', (e) => count++)` — compte les queries par action utilisateur ; mesurer `params.action` + durée
- Payload bytes : `Content-Length` agrégé DevTools HAR, ou `prisma.$use((params, next) => { const r = await next(params); console.log(JSON.stringify(r).length); return r })`
- Singleton obligatoire (hot reload Next.js/Nuxt multiplie les `new PrismaClient()` → exhaustion pool) :
  ```ts
  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
  export const prisma = globalForPrisma.prisma ?? new PrismaClient()
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
  ```
- Connection pool serverless : `DATABASE_URL?connection_limit=1` + Prisma Accelerate ou PgBouncer transaction-mode ; `prisma.$disconnect()` jamais dans le handler
- Warm-up : la première requête cold-start inclut la connexion TCP → stabiliser avec au moins 3 runs avant de prendre une baseline

## §1 — Query patterns (N+1, eager-load, batch)

- **Symptôme N+1** : boucle `for (...) await prisma.x.findUnique(...)` → 1 query par itération = N+1
- **Fix** : `include` / `select` avec relations, OU `findMany({ where: { id: { in: ids } } })` puis Map côté code
- `include: { relation: { include: { sub: true } } }` — chaque niveau = 1 join supplémentaire ; profondeur > 2 = red flag
- `prisma.$transaction([...])` pour batcher N requêtes indépendantes en 1 round-trip
- **Grep N+1** :
  ```bash
  grep -rn "prisma\.\w\+\.\(findUnique\|findFirst\)" src/  # dans un forEach/map = N+1
  grep -rn "\.forEach\|\.map" src/ | grep "await prisma"  # async dans boucle
  ```
- Profiler natif : `prisma.$on('query', (e) => console.log(e.query, e.duration))` — activer sur les endpoints suspects

## §2 — Pagination & limits

- `take` + `cursor` (cursor-based) > `take` + `skip` (offset) au-delà de 1000 rows — `skip` déclenche un `OFFSET` SQL coûteux
- Toujours combiner `cursor` avec `orderBy` stable (id + tiebreaker) sinon résultats dupliqués/manqués
- **Détecter illimité** : `grep -rn "\.findMany({" src/ | grep -v "take:"` — tout `findMany` sans `take:` sur tables > 10k rows = red flag
- Cursor pattern :
  ```ts
  prisma.post.findMany({ take: 20, cursor: { id: lastId }, skip: 1, orderBy: { id: 'asc' } })
  ```

## §3 — Real-time subscriptions

- **N/A pour `@prisma/client` standard** — Prisma est un ORM request/response sans souscriptions natives
- Prisma Pulse (addon payant) : `prisma.user.$subscribe()` via CDC (PostgreSQL replication slot) ; nettoyage : appeler `.stop()` sur la souscription dans `onUnmounted` / `onDestroy`
- Alternative gratuite : `pg` LISTEN/NOTIFY via `prisma.$queryRaw\`LISTEN channel\`` + events côté driver ; scope : écouter uniquement le channel du tenant, pas global
- Si real-time nécessaire sans Pulse : déléguer à Supabase Realtime ou Ably ; ne pas implémenter en Prisma pur

## §4 — Caching layer

- Cache-aside Redis (Upstash / Redis Cloud) :
  ```ts
  const cached = await redis.get(`user:${id}`)
  if (cached) return JSON.parse(cached)
  const user = await prisma.user.findUnique({ where: { id } })
  await redis.setex(`user:${id}`, 300, JSON.stringify(user))
  return user
  ```
- **Prisma Accelerate** (si utilisé) : TTL query-level via `cacheStrategy: { ttl: 60, swr: 30 }` — invalider via `prisma.$accelerate.invalidate({ tags: [...] })`
- TanStack Query / SWR côté client : `staleTime: 5 * 60 * 1000` sur queries stables
- **Détecter cache miss systématique** : chaque requête dans les logs dev (`$on('query')`) frappe la DB sans aucun hit Redis en amont → ajouter la couche cache

## §5 — Projection (select narrowing)

- `select` explicite obligatoire dès qu'on retourne au client → éviter les colonnes lourdes (`description`, `content`, `metadata`)
- **Grep overfetch** :
  ```bash
  grep -rn "prisma\.\w\+\.findMany\b" src/ | grep -v "select:"   # pas de select = tout fetcher
  grep -rn "prisma\.\w\+\.findUnique\b" src/ | grep -v "select:" # idem
  ```
- `findMany` sans `select` ni `take` sur tables > 10k rows = double red flag (volume + projection)
- Compression : Nuxt/Next.js compriment les réponses JSON en gzip/brotli nativement si configuré côté reverse proxy — vérifier `Content-Encoding: br` ou `gzip` dans les headers de réponse

## §6 — Quota & cost awareness

- **Métriques quota** :
  - PostgreSQL : `CREATE EXTENSION pg_stat_statements` → view `pg_stat_statements` (top queries par rows scanned / temps)
  - Prisma Accelerate dashboard : cache hit/miss, latence par query, connexions actives
  - Neon / Supabase / PlanetScale : dashboards respectifs (CPU time, rows read, bandwidth)
- **Opérations facturées** : SQL hébergé = rows lus × compute (Neon : compute time, PlanetScale : rows read/written) ; Prisma Accelerate = requêtes + cache hits
- **Règle prioritaire** : `@@index` dans `schema.prisma` pour toute colonne filtrée fréquemment → réduit les rows scanned (cost SQL le plus impactant)
- Alertes : configurer des alertes budgétaires sur Neon / PlanetScale / Supabase ; `pg_stat_statements.track_planning = on` pour détecter les plans coûteux

## §7 — Security & access control

- **Scope obligatoire** : toute `findMany` sur ressource utilisateur doit avoir `where: { userId: session.userId }` — jamais `findMany({})` sans filtre tenant
- **SQL injection safe** : toujours `Prisma.sql` template tag pour `$queryRaw` / `$executeRaw` ; **jamais** de concaténation string
  ```ts
  // ✅ Safe
  prisma.$queryRaw`SELECT * FROM users WHERE id = ${id}`
  // ❌ Injection
  prisma.$queryRaw(Prisma.raw(`SELECT * FROM users WHERE id = ${id}`))
  ```
- **Anti-patterns** :
  - `prisma.user.findMany({})` sans `where` = fuite multi-tenant
  - `include: { sensitiveRelation: true }` sans vérifier le rôle = oversharing
- **Tests sécurité** : tests unitaires sur les handlers vérifiant que `userId` est injecté depuis `session`, jamais depuis le body client
- Règles déclarées dans les guards middleware (Nuxt server middleware, Next.js middleware) — pas dans les fichiers Prisma eux-mêmes

## §8 — Schema & indexing

- `@@index([field1, field2])` dans `schema.prisma` — ordre des colonnes = ordre du `WHERE` le plus sélectif (ESR rule : Equality, Sort, Range)
- Composite index pour `where + orderBy` : `@@index([userId, createdAt])` pour `WHERE userId = ? ORDER BY createdAt`
- **Détecter index manquant** : `prisma migrate dev --create-only` puis lire le SQL généré ; `EXPLAIN ANALYZE` en PostgreSQL sur les queries lentes
- **Dénormalisation** : dupliquer les champs fréquemment lus plutôt que de joindre une table secondaire
- Migrations : `prisma migrate deploy` en CI ; `prisma db push` interdit en prod ; migrations destructives (DROP COLUMN, ALTER TYPE) en 2 étapes (compat-first, drop-later)

## §9 — Background jobs & async

- **Déléguer hors hot path** : mutations lourdes (envoi email, calcul score, indexation search) → queue BullMQ / Inngest / Trigger.dev
  ```ts
  // ❌ Hot path bloquant
  await sendEmail(user.email)
  // ✅ Queue async
  await emailQueue.add('send-welcome', { userId: user.id })
  ```
- **Idempotence Prisma** : `prisma.user.upsert({ where: { email }, update: {}, create: { ... } })` — safe si le job est rejoué
- **Retry / backoff BullMQ** :
  ```ts
  new Queue('emails', { defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 1000 } } })
  ```
- Inngest : `step.run()` + `step.sleep()` natifs ; idempotence via `eventId` par défaut
- Singleton Prisma dans les workers : appliquer le même globalThis pattern ; `prisma.$disconnect()` dans le signal de shutdown du worker

## §10 — Verification & non-regression

- **Critère déterministe** : nombre de queries Prisma par endpoint avant/après — mesurer via `$on('query', ...)` counter
- **Baseline JSON** : créer `baselines/prisma-queries.json` avec `{ endpoint, queriesCount, avgDurationMs }` avant optimisation ; comparer médiane post-fix vs maximum pré-fix
- **Observability** :
  - Prisma metrics : `previewFeatures = ["metrics"]` dans `schema.prisma` → `prisma.$metrics.json()` ou `prisma.$metrics.prometheus()`
  - `@prisma/instrumentation` (OpenTelemetry) : traces par query exportées vers Datadog / Jaeger
  - Sentry Performance : breadcrumb automatique si `@sentry/node` + Prisma integration configurée

## §11 — Checklist self-audit

- **Faux positifs connus** :
  - `$queryRaw` / `$executeRaw` ne sont **pas** capturés par `$on('query', ...)` — compter séparément via `pg_stat_statements`
  - `prisma.$transaction()` compte N queries dans le log mais = 1 round-trip réseau — ne pas interpréter comme N requêtes séparées côté serveur
  - Prisma Pulse / CDC : s'applique seulement si l'addon est activé sur le projet
- **Gaps candidats** :
  - Middleware `$use` pour audit log et rate-limiting non documenté dans cette pivot
  - Multi-tenancy RLS PostgreSQL via `SET app.tenant_id` avant chaque query
  - Prisma Pulse CDC patterns (listen `insert`/`update` events spécifiques)
- **Commandes grep utiles** :
  ```bash
  grep -rn "prisma\.\w\+\.findMany\b" src/ | grep -v "take:"    # sans limit
  grep -rn "prisma\.\w\+\.findMany\b" src/ | grep -v "select:"  # overfetch
  grep -rn "\$queryRaw\|\$executeRaw" src/                       # SQL brut à auditer
  grep -rn "new PrismaClient" src/ | wc -l                       # > 1 = violation singleton
  ```
