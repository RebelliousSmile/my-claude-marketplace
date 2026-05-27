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

- Activer `log: ['query', 'info', 'warn', 'error']` en dev pour compter les requêtes ; jamais en prod (fuite I/O)
- `prisma.$on('query', ...)` ou middleware `$use` pour mesurer `params.action` + `Date.now() - before`

## §1 — N+1 (CRITIQUE)

- **Symptôme** : boucle `for (...) await prisma.x.findUnique(...)` → exploser le query count
- **Fix** : `include` / `select` avec relations, OU `findMany({ where: { id: { in: ids } } })` puis Map côté code
- `include: { relation: { include: { sub: true } } }` — auditer la profondeur, chaque niveau = 1 join
- `prisma.$transaction([...])` pour batcher N requêtes indépendantes en 1 round-trip

## §2 — Select narrowing

- `select` explicite obligatoire dès qu'on retourne au client → évite de fetch les colonnes lourdes (`description`, `content`, `metadata`)
- `findMany` sans `select` ni `take` sur tables > 10k rows = red flag

## §3 — Pagination

- `take` + `cursor` (cursor-based) > `take` + `skip` (offset) au-delà de 1000 rows
- Toujours combiner avec `orderBy` stable (id + tiebreaker) sinon résultats dupliqués/manqués

## §4 — Indexes

- Auditer `prisma migrate dev --create-only` puis lire le SQL généré : champs filtrés/triés sans index ?
- Ajouter `@@index([field1, field2])` dans schema.prisma — ordre des colonnes = ordre du `WHERE` le plus sélectif
- Composite index pour `where + orderBy` combinés

## §5 — Connection pool

- `DATABASE_URL?connection_limit=N` — défaut Prisma trop bas en serverless (Vercel/Lambda) → exhaustion
- Pour serverless : utiliser **Prisma Data Proxy** OU **Accelerate** OU PgBouncer transaction-mode
- `prisma.$disconnect()` JAMAIS à chaud dans handler — laisser le pool persister

## §6 — Singleton client

- Hot reload Next.js / Nuxt → multiplie les `new PrismaClient()` → exhaustion connections
- Pattern obligatoire :
  ```ts
  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
  export const prisma = globalForPrisma.prisma ?? new PrismaClient()
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
  ```

## §7 — Raw queries

- `$queryRaw` / `$executeRaw` pour les requêtes complexes (CTE, window functions, full-text) que Prisma ne sait pas exprimer
- **Toujours** `Prisma.sql` template tag → SQL injection-safe ; jamais de concaténation string

## §8 — Migrations

- `prisma migrate deploy` en CI ; `prisma db push` interdit en prod
- Migrations destructives (DROP COLUMN, ALTER TYPE) : déployer en 2 étapes (compat first, drop later)
