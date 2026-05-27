---
paths:
  - "**/trpc/**/*.ts"
  - "**/server/api/**/*.ts"
  - "**/server/routers/**/*.ts"
---

# Data pivots — tRPC

Stack-specific overrides for data audits when `@trpc/server` is detected. Loaded by `data-optimize`. Concatenate with underlying ORM pivots (Prisma, Drizzle, etc.).

## §0 — Pre-flight

- `loggerLink` en dev : log durée + taille payload par procedure :
  ```ts
  links: [
    loggerLink({ enabled: (o) => process.env.NODE_ENV === 'development' || o.direction === 'down' }),
    httpBatchLink({ url: '/api/trpc' })
  ]
  ```
- Compteur déterministe : middleware tRPC :
  ```ts
  const countMiddleware = t.middleware(async ({ path, next }) => {
    const result = await next()
    metrics.increment(`trpc.${path}.calls`)
    return result
  })
  ```
- Payload bytes : `loggerLink` log la taille de la réponse ; ou DevTools HAR sur les POST `/api/trpc`
- `httpBatchLink` activé côté client → multiple `useQuery` dans le même tick = 1 POST batché — vérifier dans DevTools (1 request au lieu de N)
- Warm-up : TanStack Query cache vide au cold-start → 1 requête DB par query au premier rendu

## §1 — Query patterns (batching, N+1)

- `httpBatchLink({ url, maxURLLength: 2083 })` — TOUS les `useQuery` dans le même tick sont batchés en 1 POST
- Sans batching (`httpLink`) : N appels = N HTTP requests → utiliser `httpBatchLink` partout
- **N+1 via procedures** : page qui appelle 4 procedures `useQuery` indépendantes sur des IDs différents → même problème qu'ORM ; considérer 1 procedure agrégée
- **Grep N+1 logique** :
  ```bash
  grep -rn "useQuery\|useSuspenseQuery" src/ | grep -c "trpc\."  # compter les calls par page
  # > 5 calls tRPC sur la même page = candidat à l'agrégation en 1 procedure
  ```
- Une procedure = 1 cas d'usage UI, pas CRUD générique — `getUserWithPostsAndComments` > 3 procedures séparées en cascade

## §2 — Pagination & limits

- Borne côté serveur sur chaque input paginé :
  ```ts
  .input(z.object({ limit: z.number().int().min(1).max(100).default(20), cursor: z.string().optional() }))
  ```
- `z.number()` libre sur `limit` = DoS potentiel — toujours borner avec `.min(1).max(100)`
- **Détecter illimité** :
  ```bash
  grep -rn "\.input(z\." src/server/routers/ | grep -v "\.max\|\.limit\|take:" # sans borne
  ```
- Cursor-based recommandé pour les listes longues : cursor = dernier ID ou timestamp retourné par la réponse précédente

## §3 — Real-time subscriptions

- **tRPC v11 subscriptions via async generators** :
  ```ts
  subscription: t.procedure
    .input(z.object({ roomId: z.string() }))
    .subscription(async function* ({ input, ctx, signal }) {
      for await (const message of pubSub.subscribe(`room:${input.roomId}`)) {
        if (signal?.aborted) break
        yield message
      }
    })
  ```
- **Nettoyage** : le `signal` AbortController est passé automatiquement — surveiller `signal.aborted` pour arrêter la subscription proprement
- **Scope** : 1 canal par `roomId` / `userId` — jamais `pubSub.subscribe('all')` sans filtre = amplification
- **Alternative SSE** : `httpSubscriptionLink` (tRPC v11) utilise SSE côté transport — plus simple et HTTP/1.1 compatible vs WebSocket
- **tRPC < v11** : subscriptions via `wsLink` + WebSocket ; même logique de nettoyage dans `onDestroy` côté client

## §4 — Caching layer

- **TanStack Query** (React) / **TanStack Query Vue** : `staleTime` par procedure :
  ```ts
  trpc.user.getProfile.useQuery(undefined, { staleTime: 5 * 60 * 1000 })
  ```
- **SSR prefetch (Nuxt / Next.js)** :
  ```ts
  const helpers = createServerSideHelpers({ router, ctx, transformer: superjson })
  await helpers.user.getProfile.prefetch()
  ```
  → hydration sans re-fetch côté client
- **Vercel KV / Upstash Redis** côté serveur : cache-aside dans la procedure pour les queries lentes
- **Invalider le cache** TanStack Query : `utils.user.getProfile.invalidate()` après mutation
- **Détecter cache miss** : `loggerLink` log chaque call → TanStack Query fait un refetch à chaque navigation → configurer `staleTime`

## §5 — Projection (output filtering)

- **Output schema obligatoire** pour stripper les champs sensibles (password hash, internal flags) :
  ```ts
  .output(z.object({ id: z.string(), email: z.string(), name: z.string() }))
  // ❌ Sans output schema : le client reçoit la shape interne de la DB
  ```
- Utiliser le `select:` ORM sous-jacent (Prisma, Drizzle) pour ne pas fetcher les colonnes inutiles côté serveur
- **Grep overfetch** :
  ```bash
  grep -rn "\.query\b\|\.mutation\b" src/server/routers/ | grep -v "\.output(" # sans output schema
  ```
- Compression : gzip/brotli configuré côté serveur (Nitro, Next.js) — vérifier `Content-Encoding` dans les réponses API tRPC

## §6 — Quota & cost awareness

- **OpenTelemetry middleware** :
  ```ts
  const otelMiddleware = t.middleware(({ path, type, next }) => {
    return tracer.startActiveSpan(`trpc.${type}.${path}`, async (span) => {
      const result = await next()
      span.setAttribute('trpc.path', path)
      span.end()
      return result
    })
  })
  ```
- **Métriques quota** : via l'ORM sous-jacent (Prisma metrics, pg_stat_statements, Firestore usage)
- **Opérations facturées** : tRPC = couche API uniquement ; le coût est porté par l'ORM/DB sous-jacent
- **Règle prioritaire** : réduire le nombre de procedures appelées par page (agrégation) → moins de DB reads par request

## §7 — Security & access control

- **`protectedProcedure`** exposant `ctx.user` (session validée) :
  ```ts
  const protectedProcedure = t.procedure.use(({ ctx, next }) => {
    if (!ctx.session?.user) throw new TRPCError({ code: 'UNAUTHORIZED' })
    return next({ ctx: { ...ctx, user: ctx.session.user } })
  })
  ```
- **Scope par `ctx.user.id`** : toutes les queries ORM dans les procedures protégées filtrées par `ctx.user.id` — jamais par `input.userId` (contrôlable par le client)
- **Rate limiting** :
  ```ts
  import { Ratelimit } from '@upstash/ratelimit'
  const ratelimitMiddleware = t.middleware(async ({ ctx, next }) => {
    const { success } = await ratelimit.limit(ctx.user.id)
    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })
    return next()
  })
  ```
- **`errorFormatter`** : stripper les stack traces en prod — sinon fuite d'info serveur
  ```ts
  errorFormatter({ shape }) { return { ...shape, data: { ...shape.data, stack: undefined } } }
  ```
- **Tests sécurité** : tester qu'un user A ne peut pas appeler une procedure avec l'ID d'un user B

## §8 — Schema & indexing

- **N/A direct** — tRPC est une couche API ; les index sont définis dans l'ORM sous-jacent (Prisma, Drizzle, TypeORM)
- Concatener avec les pivots ORM correspondantes pour §8
- Les `z.object({ ... })` tRPC définissent la validation d'input, pas le schema DB — les deux sont distincts

## §9 — Background jobs & async

- **Mutations → queue** : une mutation tRPC peut deléguer hors du hot path :
  ```ts
  sendWelcomeEmail: protectedProcedure.mutation(async ({ ctx }) => {
    await emailQueue.add('welcome', { userId: ctx.user.id })  // ✅ async
    return { success: true }
  })
  ```
- **Idempotence** : les mutations tRPC peuvent être rejouées (TanStack Query retry, network retry) → toujours utiliser l'`upsert` de l'ORM sous-jacent avec une clé de déduplication
- **Retry mutation côté client** : désactiver les retries automatiques TanStack Query sur les mutations (`retry: 0`) sauf si l'idempotence est garantie
  ```ts
  trpc.user.update.useMutation({ retry: 0 })
  ```
- Background workers : utiliser BullMQ + handler séparé ; tRPC ne gère pas les workers

## §10 — Verification & non-regression

- **Critère déterministe** : nombre de calls DB par procedure avant/après — mesurer via le middleware compteur ou l'ORM sous-jacent (Prisma `$on('query')`, Drizzle logger)
- **Baseline JSON** : `baselines/trpc-procedures.json` avec `{ procedure, dbCalls, avgDurationMs, payloadBytes }` — comparer médiane post-fix vs maximum pré-fix
- **Observability** :
  - OpenTelemetry middleware (voir §6) → traces par procedure dans Datadog / Jaeger
  - Sentry Performance : `withSentryRouterHandler` ou middleware Sentry pour les routes tRPC
  - `loggerLink` en staging pour capter les durées sans overhead prod

## §11 — Checklist self-audit

- **Faux positifs connus** :
  - `httpBatchLink` batch les calls du même tick → 1 POST pour N queries dans DevTools — ne pas interpréter le 1 POST comme "pas de requête multiple" ; le serveur exécute bien N procedures
  - TanStack Query `staleTime` par défaut = 0 → refetch à chaque montage de composant ; paraît comme N+1 mais c'est du cache miss côté client, pas DB
  - `createServerSideHelpers` en SSR prefetch exécute les queries côté serveur au moment du `getServerSideProps` / `useAsyncData` — les logguer séparément
- **Gaps candidats** :
  - Subscriptions tRPC < v11 (wsLink) vs v11 (httpSubscriptionLink / async generators) : patterns différents non unifiés dans cette pivot
  - tRPC + Prisma multi-tenant : filter injection pattern via middleware non documenté en détail
  - Infinite queries TanStack Query (`useInfiniteQuery`) avec cursor tRPC — pattern de pagination non couvert
  - tRPC open-api : génération de spec OpenAPI pour audit externe des surfaces non couverte
- **Commandes grep utiles** :
  ```bash
  grep -rn "httpLink\b" src/ | grep -v "httpBatch"         # link sans batching
  grep -rn "\.mutation\b\|\.query\b" src/server/ | grep -v "output(" # sans output schema
  grep -rn "input\.userId\|args\.userId" src/server/       # scope par input vs ctx
  grep -rn "retry.*[^0]" src/ | grep "useMutation"        # retries sur mutations
  ```
