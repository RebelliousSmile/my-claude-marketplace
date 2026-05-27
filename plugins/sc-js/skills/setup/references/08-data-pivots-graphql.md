---
paths:
  - "**/*.graphql"
  - "**/*.gql"
  - "**/schema/**/*.ts"
  - "**/resolvers/**/*.ts"
  - "apollo.config.*"
---

# Data pivots — GraphQL (Apollo / Yoga / Mercurius)

Stack-specific overrides for data audits when a GraphQL server is detected. Loaded by `data-optimize`. Concatenate with the underlying ORM pivots (Prisma, TypeORM, Drizzle).

## §0 — Pre-flight

- Apollo Studio / GraphiQL → tracer chaque query, capturer resolver count + temps par champ
- `tracing: true` (Apollo plugin) en dev — permet de voir chaque resolver fire

## §1 — N+1 (LE problème GraphQL)

- Chaque champ relationnel résolu indépendamment → 1 query par parent par champ
- **DataLoader OBLIGATOIRE** pour TOUT champ relationnel :
  ```ts
  const userLoader = new DataLoader(ids => db.users.findMany({ where: { id: { in: ids } } }))
  ```
- Loader scope = **par requête** (pas global, sinon cache pollue entre users)
- Auditer chaque resolver `User.posts`, `Post.author`, etc. → loader présent ?

## §2 — Query complexity

- `graphql-cost-analysis` / `graphql-depth-limit` obligatoires en prod
- Bloquer profondeur > 7, complexité > 1000 → DoS facile sinon (`{ user { friends { friends { friends { ... }}}}}`)
- Persisted queries (Apollo APQ) pour client trusted → bypass parsing

## §3 — Pagination

- **Relay-style cursor connections** (`edges`, `pageInfo`, `cursor`) > offset pagination
- `first: N` borné côté serveur (max 100), jamais "all"
- Connection sur chaque liste — `posts: [Post!]!` sans pagination = red flag

## §4 — Field-level authorization

- Vérifier auth dans le resolver, pas dans le router → un seul query peut accéder à plein de champs
- `shield` / directives `@auth` pour déclarer la policy au schema
- Logging par champ sensible (email, phone) pour audit

## §5 — Subscriptions

- WebSocket persistent → coût connection × users ; backpressure si broadcast trop fréquent
- Filtrage côté serveur via `withFilter()` — jamais envoyer tous les events au client puis filter
- Considérer SSE pour one-way broadcasts (plus simple, HTTP/2 multiplexable)

## §6 — Caching

- Apollo Server cache hint (`@cacheControl(maxAge: 60)`) sur fields stables
- Persisted queries + CDN → cache HTTP par hash
- Response cache : Apollo `responseCachePlugin` (Redis backed) pour queries publiques

## §7 — Schema design

- Éviter les types `JSON` / `Object` scalaires — perd le typage et le tooling
- Nullable par défaut côté champ scalar — non-null seulement si garanti DB-side
- Mutations retournent l'objet muté complet pour permettre la mise à jour du cache client

## §8 — Federation / stitching

- Apollo Federation : auditer les `@key` directives, query plan via Apollo Studio
- N+1 cross-service possible — DataLoader par sous-graph
