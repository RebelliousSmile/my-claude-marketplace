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
- `ApolloServerPluginInlineTrace()` (Apollo 4) ou `tracing: true` (Apollo 2) en dev — visualise chaque resolver fire et sa durée
- Compteur déterministe : plugin custom Apollo :
  ```ts
  const resolverCountPlugin: ApolloServerPlugin = {
    requestDidStart: () => ({ executionDidStart: () => ({ willResolveField: () => { count++ } }) })
  }
  ```
- Payload bytes : `Content-Length` DevTools ; ou middleware qui log `JSON.stringify(response).length`
- Warm-up : connexion DataLoader = per-request (aucun cache cross-request) — le premier call à froid initialise le batcher

## §1 — Query patterns (N+1 — LE problème GraphQL)

- Chaque champ relationnel résolu indépendamment = 1 query par objet parent → N+1 structurel
- **DataLoader OBLIGATOIRE** pour TOUT champ relationnel :
  ```ts
  const userLoader = new DataLoader<string, User>(async (ids) =>
    db.user.findMany({ where: { id: { in: ids as string[] } } }).then(users =>
      ids.map(id => users.find(u => u.id === id))
    )
  )
  ```
- Loader scope = **par requête GraphQL** (pas global — sinon cache pollue entre users) ; instancier dans le contexte request
- **Grep N+1** :
  ```bash
  grep -rn "context\.\|ctx\." src/resolvers/ | grep "prisma\.\|db\." | grep -v "loader\|batch"
  # resolver accédant directement à la DB sans loader = N+1 potentiel
  ```
- Auditer chaque resolver de champ relationnel (`User.posts`, `Post.author`, etc.) → DataLoader présent ?

## §2 — Pagination & limits

- **Relay-style cursor connections** (`edges`, `pageInfo`, `cursor`) > offset pagination — standard client caching Apollo
- `first: N` borné côté serveur (`Math.min(args.first ?? 20, 100)`) — jamais de "all"
- `connection: [Post!]!` (liste sans pagination) = red flag ; toujours encapsuler dans une connection
- **Complexité / profondeur** :
  ```ts
  import depthLimit from 'graphql-depth-limit'
  import costAnalysis from 'graphql-cost-analysis'
  // profondeur > 7 = DoS potentiel
  validationRules: [depthLimit(7), costAnalysis({ maximumCost: 1000 })]
  ```
- Persisted queries (Apollo APQ) pour clients trusted → bypass parsing overhead

## §3 — Real-time subscriptions

- WebSocket via `graphql-ws` ou `subscriptions-transport-ws` — chaque souscription = 1 connexion persistante
- **Nettoyage** : la déconnexion WebSocket déclenche le `return` du générateur async :
  ```ts
  subscribe: async function* (_, __, context) {
    const sub = pubSub.asyncIterator('MESSAGE')
    try { for await (const msg of sub) yield msg }
    finally { sub.return?.() }  // cleanup si client déconnecte
  }
  ```
- **Scope avec `withFilter`** :
  ```ts
  subscribe: withFilter(
    () => pubSub.asyncIterator('NEW_MESSAGE'),
    (payload, variables) => payload.newMessage.roomId === variables.roomId
  )
  ```
  Jamais broadcaster tous les events au client puis filtrer côté client — amplification réseau
- **SSE alternative** : pour les broadcasts one-way (feeds, notifications), SSE (`text/event-stream`) est plus simple et HTTP/2 multiplexable — pas de WS à gérer
- **Backpressure** : si le générateur produit plus vite que le client consomme → throttler avec `setInterval` ou `debounce` dans la subscription

## §4 — Caching layer

- `@cacheControl(maxAge: 60)` sur les champs stables dans le schema → `responseCachePlugin` Apollo (Redis-backed) sert les queries publiques depuis le cache
- **Apollo responseCachePlugin** (Redis) :
  ```ts
  import responseCachePlugin from '@apollo/server-plugin-response-cache'
  plugins: [responseCachePlugin({ cache: redisCache })]
  ```
- **Persisted queries + CDN** : GET requests avec APQ → cacheable par CDN Cloudflare/Fastly sur les queries publiques
- **TanStack Query / Apollo Client cache** : `fetchPolicy: 'cache-first'` ou `'cache-and-network'` selon la fraîcheur requise ; `staleTime` configurable sur les fragments
- **Détecter cache miss systématique** : chaque query GraphQL frappe la DB à chaque requête → aucun cache hint `@cacheControl` configuré → ajouter les directives

## §5 — Projection (field selection)

- GraphQL est nativement de la projection : le client ne reçoit que les champs demandés
- Mais les **resolvers sous-jacents fetchen souvent trop** : mapper les champs GraphQL sélectionnés vers un `select:` ORM
  ```ts
  // Extraire les champs depuis info.fieldNodes pour construire le select Prisma
  const requestedFields = getFieldNames(info)
  const user = await prisma.user.findUnique({ where: { id }, select: mapToPrismaSelect(requestedFields) })
  ```
- **Éviter les scalars `JSON` / `Object`** — perdent le typage et forcent à fetcher tout le champ opaque
- Nullable par défaut sur les champs scalars ; non-null (`!`) seulement si garanti DB-side
- Mutations retournent l'objet muté complet pour permettre la mise à jour du cache client

## §6 — Quota & cost awareness

- **Apollo Studio** : métriques de requêtes par operation (p50/p95 latence, error rate, field usage)
- **`graphql-cost-analysis`** : définir un budget de complexité par query (`maximumCost: 1000`) — bloquer les queries trop chères avant exécution
  ```ts
  import costAnalysis from 'graphql-cost-analysis'
  validationRules: [costAnalysis({ maximumCost: 1000, onCost: (cost) => metrics.record(cost) })]
  ```
- **Opérations facturées** : resolvers = CPU + DB reads ; subscriptions = connexions persistantes WebSocket (coût serveur)
- **Règle prioritaire** : DataLoader batch → réduit drastiquement les DB reads ; sans DataLoader, N+1 × profondeur = explosion du coût
- Apollo Federation : query plan via Apollo Studio — auditer les join latences cross-service

## §7 — Security & access control

- **Auth dans le resolver, pas dans le router** : une seule query GraphQL peut accéder à de nombreux champs → vérifier les droits field-by-field
  ```ts
  // ❌ Vérification centralisée seulement (bypass via nested fields)
  // ✅ Shield / directive par field
  ```
- **GraphQL Shield** : `rule(async (parent, args, ctx) => !!ctx.user)` composable par type/field
- **`@auth` directive** : déclarer la policy au schema (Apollo / NestJS GraphQL)
- **Introspection désactivée en prod** :
  ```ts
  introspection: process.env.NODE_ENV !== 'production'
  ```
- **`graphql-depth-limit`** : bloquer profondeur > 7 → DoS par query récursive
- **Logging par champ sensible** : `email`, `phone`, `ssn` → breadcrumb dans chaque resolver pour audit
- **Tests sécurité** : tester qu'un user A ne peut pas accéder aux champs d'un user B via nested resolver

## §8 — Schema & indexing

- **N/A direct** — GraphQL est une couche API ; les index sont définis dans l'ORM sous-jacent (Prisma, TypeORM, Drizzle)
- Concatener avec les pivots ORM correspondantes pour §8
- Apollo Federation : `@key` directives → chaque sous-graph responsable de ses propres indexes sur les champs `@key`
- Éviter les types `Union` / `Interface` sur des champs fréquemment filtrés — génèrent des requêtes polymorphes coûteuses côté ORM

## §9 — Background jobs & async

- **Déléguer via mutations** : une mutation GraphQL peut publier vers une queue sans bloquer :
  ```ts
  Mutation: {
    sendMessage: async (_, args, ctx) => {
      await messageQueue.add('process', args)  // queue BullMQ
      return { success: true }                 // retour immédiat
    }
  }
  ```
- Subscriptions pubSub : `pubSub.publish('MESSAGE', { ... })` depuis le worker/job handler après traitement
- **Idempotence** : les mutations GraphQL peuvent être rejouées (network retry) → toujours vérifier l'unicité via l'ORM sous-jacent (`upsert`)
- **Retry** : les subscriptions WebSocket se reconnectent automatiquement côté client (`graphql-ws` retry config) — gérer la reprise d'état côté serveur

## §10 — Verification & non-regression

- **Critère déterministe** : nombre de resolvers DB calls par operation GraphQL avant/après (via plugin counter ou Apollo tracing)
- **Baseline JSON** : `baselines/graphql-operations.json` avec `{ operationName, resolverCalls, avgDurationMs, cost }` — comparer médiane post-fix vs maximum pré-fix
- **Observability** :
  - Apollo Studio : tracing end-to-end, field usage analytics, error rate par operation
  - OpenTelemetry : `@opentelemetry/instrumentation-graphql` — spans par resolver
  - Sentry Performance : transactions GraphQL automatiques si `@sentry/node` configuré

## §11 — Checklist self-audit

- **Faux positifs connus** :
  - DataLoader cache par requête : si le même ID est demandé 2 fois dans la même query, 1 seul appel DB — ne pas compter 2 queries dans le baseline
  - Apollo Federation : les query plans incluent des network calls cross-service — pas de N+1 au sens local, mais des call chains inter-services
  - `@cacheControl(maxAge: 0)` désactive le cache response sur ce champ — vérifier que les champs d'auth/sécurité ont bien `maxAge: 0`
- **Gaps candidats** :
  - DataLoader cache invalidation cross-requests (si cache global partagé intentionnel) — non couvert
  - `graphql-upload` file upload : scalaire `Upload` hors du scope de cette pivot
  - Real-time avec SSE via `graphql-sse` : alternative à WS, moins documentée
  - Apollo Federation N+1 cross-service : DataLoader par sous-graph requis mais non détaillé
- **Commandes grep utiles** :
  ```bash
  grep -rn "context\.\|ctx\." src/resolvers/ | grep "prisma\.\|db\." | grep -v "loader\|Loader"
  # resolvers accédant DB sans DataLoader
  grep -rn "introspection.*true" src/  # introspection activée — à vérifier prod
  grep -rn "\$where\|allowDiskUse" src/ # patterns dangereux Mongo sous GraphQL
  grep -rn "allow.*read.*if true\|allow.*write.*if true" "**/*.rules"  # règles ouvertes
  ```
