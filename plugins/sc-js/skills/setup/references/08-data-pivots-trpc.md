---
paths:
  - "**/trpc/**/*.ts"
  - "**/server/api/**/*.ts"
  - "**/server/routers/**/*.ts"
---

# Data pivots — tRPC

Stack-specific overrides for data audits when `@trpc/server` is detected. Loaded by `data-optimize`. Concatenate with underlying ORM pivots.

## §0 — Pre-flight

- `httpBatchLink` activé côté client → multiples queries dans 1 HTTP request
- `loggerLink` en dev pour mesurer durée + taille payload par procedure

## §1 — Batching

- `httpBatchLink({ url, maxURLLength: 2083 })` — TOUS les calls `useQuery` dans le même tick sont batchés en 1 POST
- Sans batching : N appels = N HTTP requests, perd l'intérêt de tRPC
- Vérifier que `httpBatchLink` est utilisé, pas `httpLink`

## §2 — Input validation

- `z.object({ ... })` obligatoire sur chaque `input(...)` — sans validation = SQL injection / type confusion
- Préférer `z.number().int().min(1).max(100)` (borné) à `z.number()` libre — DoS prevention

## §3 — Procedure granularity

- Une procedure = un cas d'usage UI, PAS un CRUD générique
- `getUserWithPostsAndComments` > 3 procedures séparées appelées en cascade côté client (1 round-trip)
- Si une page UI fait 4 `useQuery` indépendants → considérer 1 procedure agrégée

## §4 — Output filtering

- Toujours déclarer `output: z.object({ ... })` pour stripper les champs sensibles (password hash, internal flags)
- Sans output schema, le client reçoit la shape interne de la DB

## §5 — Caching & SSR

- Server-side prefetch (`createServerSideHelpers`) pour SSR Next.js / Nuxt → hydration sans re-fetch
- `staleTime` configuré par procedure côté client (sinon refetch agressif par défaut React Query)

## §6 — Subscriptions

- WebSocket via `wsLink` — backpressure si broadcast trop fréquent
- Préférer SSE / polling court pour notifications non-critiques

## §7 — Middleware

- `t.procedure.use(authMiddleware)` chain composable — `protectedProcedure` exposant `ctx.user`
- Auth check par procedure, pas global → permet quelques procedures publiques explicites
- Rate limiting middleware (`upstash-ratelimit`) sur procedures coûteuses

## §8 — Error handling

- `TRPCError({ code: 'BAD_REQUEST', message: '...' })` → propagé typé côté client
- `errorFormatter` pour stripper les stack traces en prod (fuite info sinon)
