---
paths:
  - "hasura/**/*.yaml"
  - "**/*.graphql"
  - "**/metadata/**/*.yaml"
  - "**/migrations/**/*.sql"
---

# Data pivots — Hasura GraphQL Engine

Stack-specific overrides for data audits when Hasura is detected (`hasura.yaml`, `metadata/`). Loaded by `data-optimize`. Concatenate with framework pivots (front-end consumer).

## §0 — Pre-flight

- Hasura Console → API Explorer + `EXPLAIN` panel → voir le SQL généré
- Logs : `HASURA_GRAPHQL_ENABLED_LOG_TYPES=startup,http-log,webhook-log,websocket-log,query-log` en dev
- En prod : limiter logs ; query-log peut être verbeux

## §1 — N+1 inexistant

- Hasura génère une seule query SQL avec JOIN ou JSON aggregation par GraphQL query → pas de N+1 par défaut
- **Mais** : query trop large ou trop profonde = 1 query SQL géante mais lente → auditer EXPLAIN

## §2 — Query depth & complexity

- `HASURA_GRAPHQL_QUERY_LIMIT` (entreprise) ou `query_depth_limit` (custom middleware) — bloquer profondeur > 5
- Persisted queries / Allow-list (`HASURA_GRAPHQL_ENABLE_ALLOWLIST=true`) en prod pour bloquer requêtes arbitraires
- Sans allow-list, n'importe quel client peut introspecter le schema → DoS facile

## §3 — Permissions

- Row-level permissions per role (`select_permissions`) — vérifier `filter`, `check`, `columns`, `limit`
- `limit` côté permission obligatoire sur tables publiques (e.g. 100) — sinon `query { users { ... } }` retourne tout
- Permission par colonne : éviter de fuiter `email`, `phone`, `password_hash` à rôles non-autorisés

## §4 — Indexes

- Hasura ne crée pas d'index automatique — c'est Postgres natif
- Auditer chaque relation (FK indexée), chaque colonne filtrée/triée
- `EXPLAIN ANALYZE` via SQL Editor sur les queries hot path

## §5 — Subscriptions

- WebSocket persistent → coût connection × users
- Subscriptions Hasura utilisent **diff polling** côté serveur (interval ~1s par défaut) → coût SQL par interval × clients
- `HASURA_GRAPHQL_LIVE_QUERIES_MULTIPLEXED_REFETCH_INTERVAL` (défaut 1000ms) — augmenter si load problématique
- Préférer `streaming subscriptions` pour append-only feeds

## §6 — Remote schemas & Actions

- Remote schema (autre GraphQL) : ajout latence ; auditer chaque resolver remote (peut N+1 cross-service)
- Actions (REST → GraphQL) : timeout à 30s par défaut ; auditer `forward_client_headers`, retry policy

## §7 — Event Triggers

- Webhook async sur INSERT/UPDATE/DELETE → at-least-once delivery, retry policy configurable
- Idempotency côté handler obligatoire (tag event_id pour dedup)
- Volume burst : Hasura queue les events, mais le handler peut être saturé → auditer p95 latency

## §8 — Caching

- Hasura Cloud : `@cached(ttl: 60)` directive (Pro/Cloud only)
- En self-hosted : CDN devant si queries publiques + persisted ID-based
- Réponse cache Redis layer si workload mostly-read

## §9 — Migrations & metadata

- `hasura migrate apply` (SQL) + `hasura metadata apply` (relations, permissions, actions) — versionnés Git
- Migrations destructives (drop column) → 2 étapes (compat + cleanup)
- `metadata.yaml` review obligatoire en PR (modifs invisibles depuis le code app)

## §10 — Connection pooling

- `HASURA_GRAPHQL_PG_CONNECTIONS` (défaut 50) — tuner selon Postgres max_connections
- Connexion via PgBouncer transaction-mode : Hasura compatible mais sans prepared statements

## §11 — Cost (Hasura Cloud)

- Active connections + requests + data transfer = facturation
- Auditer subscriptions ouvertes la nuit (probable leak côté front-end sans cleanup)
