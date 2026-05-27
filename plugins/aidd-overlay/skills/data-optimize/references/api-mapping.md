# API / data-layer mapping — perf pivots

> **Generic file**: this file contains ONLY the 12-section schema, the universal REST vanilla pivots, and the fallback procedure.
> Stack-specific pivots are NOT embedded here — they are installed as project-level rules by `sc-*` plugins (sc-js, sc-php, sc-python, sc-tiers, sc-rust, …) via their `setup` skills.
>
> **Dispatch order** when running an audit on a detected data stack:
>
> 1. Look for `.claude/rules/07-quality/data-pivots-<stack>.md` — installed by the matching `sc-*` plugin
> 2. If found → use it as the primary checklist source for §1–§10
> 3. If not found → fall back to the generic schema below + REST vanilla pivots + fallback procedure
>
> Always check `.claude/rules/07-quality/` for ALL `data-pivots-*.md` files (hybrid stacks aggregate pivots from multiple plugins, e.g. Firestore + Prisma).

## Generic 12-section schema

Une checklist data-layer perf tient en 12 sections, identiques quel que soit le stack :

0. Pre-flight (deterministic baseline + 3-5 runs to characterize variance)
1. Query patterns — N+1, eager-load, batch reads, joins
2. Pagination & limits — cursors, hard caps, no unbounded queries
3. Real-time subscriptions / change streams — cleanup, scope, dedup
4. Caching layer — client cache, server cache, CDN, TTL, invalidation
5. Payload optimization — projection, compression, field selection
6. Quota & cost awareness — rate limits, free tier, egress, cold starts
7. Security & access control — rules, RLS, ABAC, no role lookup in hot paths
8. Schema & indexing — composite indexes, denormalization, sharding
9. Background jobs & async — queues, idempotency, retry/backoff
10. Verification & non-regression — slow query logs, dashboards, alerts
11. Checklist self-audit (feedback loop) — gaps, false positives, missing pivots, anti-pattern candidates

Les pivots installés par `sc-*` plugins remplacent les items section-par-section selon le stack cible.

## Plugin → stack mapping (informative)

| Plugin | Data stacks covered |
|---|---|
| `sc-js` | Prisma, Drizzle, TypeORM, Sequelize, Mongoose, GraphQL (Apollo/urql/Relay), tRPC |
| `sc-php` | Eloquent (Laravel), Doctrine (Symfony) |
| `sc-python` | Django ORM, SQLAlchemy |
| `sc-rust` | SQLx, Diesel, Sea-ORM |
| `sc-tiers` | Firebase (Firestore + RTDB), Supabase, DynamoDB, Hasura |

If a stack you detect has no matching plugin/pivot file, follow the fallback procedure below.

## Universal: REST vanilla (no ORM / no SDK)

Applique partout où le client parle au serveur via `fetch` / `axios` sans ORM ni SDK propriétaire :

- §1 :
  - Pas de N+1 ORM — N+1 réseau côté client : auditer chaque page pour `Promise.all` qui devraient être 1 endpoint batched
  - Côté serveur : si SQL brut, mêmes pivots que Postgres + index
- §2 :
  - Pagination négociée endpoint par endpoint — documenter via OpenAPI
- §4 :
  - HTTP cache standard : `Cache-Control`, `ETag`, `If-None-Match` — souvent oublié
  - Service Worker côté client pour cache offline-first
- §5 :
  - JSON responses : limiter avec query params (`?fields=id,name`) ou GraphQL
  - gzip/brotli côté serveur (nginx, Caddy) — vérifier headers
- §6 :
  - Rate-limiting (express-rate-limit, nginx limit_req)
- §7 :
  - JWT validation côté chaque route ; éviter DB lookup user à chaque request
- §10 :
  - Logs structurés + APM (Sentry, Datadog, OpenTelemetry)

## Fallback: stack not covered by any installed pivot

Si la stack ne matche aucun pivot installé :

1. Demander à l'utilisateur 3 infos : (a) DB primaire, (b) data-access pattern (ORM / SDK / raw / GraphQL), (c) cache layer
2. Construire la checklist en repartant des **12 sections génériques** ci-dessus
3. Lister explicitement les pivots non couverts comme "à valider" plutôt que d'inventer
4. **Si `aidd_docs/internal/decisions/` existe :** proposer un DEC documentant les conventions découvertes. **Sinon :** inline les conventions retenues dans le header du nouveau template
5. **Suggérer la création d'un plugin `sc-<stack>`** si la stack est susceptible d'être réutilisée dans d'autres projets
