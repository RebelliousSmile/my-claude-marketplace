# API / data-layer mapping — perf pivots

> Référence rapide pour générer une checklist data-layer adaptée par stack. À lire UNIQUEMENT quand un stack non couvert par un template existant doit être audité.
>
> **Last-verified per section:** chaque section porte un commentaire `<!-- last-verified: YYYY-MM -->` au-dessus de son titre. Si la date est > 12 mois, traiter les pivots comme "à valider" (SDK API peuvent avoir bougé) et confirmer via doc officielle avant d'auditer.

<!-- last-verified: 2026-05 -->
## Schéma général

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

Les pivots ci-dessous remplacent les items section-par-section selon le stack cible.

---

<!-- last-verified: 2026-05 -->
## Firebase (Firestore + Cloud Functions + RTDB)

Pivots clés :

- §1 :
  - Toute `query()` MUST contain `limit()` — sinon read-amplification illimitée
  - Batch read via `documentId() in [...]` (max 30 par batch — chunker au-delà)
  - Jamais de `getDoc` dans une boucle (N+1 = lecture par doc + RTT)
  - Préférer `getAggregateFromServer` + `count()` à `getDocs().length` (1 read vs N reads)
- §2 :
  - Pagination par cursor (`startAfter` + `limit`), jamais par `offset` (Firestore facture les docs sautés)
  - Hard cap client `limit() ≤ 100`
- §3 :
  - `onSnapshot` MUST `unsubscribe()` dans `onUnmounted`/`useEffect cleanup` — sinon read leak permanent
  - 1 read par doc à l'init + 1 read par doc modifié — auditer le scope du listener (filtrer fort)
  - Auth listener `onAuthStateChanged` one-shot doit `unsubscribe()` dans le 1er callback (sauf watcher persistant explicite)
- §4 :
  - Cache static/reference data en Pinia/store avec TTL (5min) — éviter re-reads identiques
  - Hosting `firebase.json` cache headers : long max-age sur assets hashés
  - **Firestore Bundles** pour datasets quasi-statiques public-read (catalogues, listes de référence) : `.bundle` servi via Hosting + `loadBundle()` client → reads facturées à la génération, zéro au runtime
  - Offline persistence (`persistentLocalCache` / `enableIndexedDbPersistence`) si UX offline pertinente — cache reads + replay writes
- §5 :
  - Firestore facture par document (pas par champ) — denormalisation pour éviter `getDoc` cascadé
  - Pour de gros docs, splitter en sous-collections accessibles à la demande
- §6 :
  - **Spark plan** : 50K reads/jour, 20K writes/jour, 1GB storage
  - **Blaze plan** : $0.06/100K reads, $0.18/100K writes, $0.18/GB egress
  - Cloud Functions : facturation invocation + GB-s + egress — réduire payload
  - Cold starts : éviter import lourd en top-level (tree-shake, dynamic import)
- §7 :
  - Security rules : `request.auth.uid == document.ownerId`
  - Pas de `get()` Firestore dans hot paths de rules (chaque `get()` = 1 read facturé en plus)
  - Admin via custom claims (`request.auth.token.admin == true`), pas via lookup Firestore
- §8 :
  - `firestore.indexes.json` versionné ; composite indexes pour queries multi-where
  - Firestore exige index composite dès 2+ filtres `where` ou `where + orderBy`
- §9 :
  - Cloud Tasks pour jobs lents > 60s (timeout HTTP function)
  - Background functions idempotentes (réexécutées sur erreur)
- §10 :
  - Firebase Console → Usage tab : reads/writes/storage par jour
  - `firebase functions:log --since 1h` pour anomalies
  - GCP Cloud Monitoring pour métriques détaillées (Blaze)

---

<!-- last-verified: 2026-05 -->
## Supabase (Postgres + PostgREST + RLS)

Pivots :

- §1 :
  - `.select('col1,col2')` explicite — `select('*')` over-fetche
  - PostgREST embedded resources (`select('*, posts(*)')`) = SQL JOIN, pas N+1
  - Auditer les calls `for of` avec `await` à l'intérieur (anti-pattern)
- §2 :
  - `.range(0, 49)` ou `.limit(50)` — Supabase enforce un max via `max-rows` config
- §3 :
  - Realtime subscriptions via `supabase.channel(...)` — `channel.unsubscribe()` au cleanup
  - Filter coté serveur (`channel.on('postgres_changes', { filter: ... })`) pour réduire fan-out
- §4 :
  - PostgREST réponses cachables côté CDN (Cloudflare devant Supabase REST endpoint)
  - `Cache-Control` via headers PostgREST (`prefer: count=exact` invalide cache)
- §6 :
  - Free tier : 500MB DB, 5GB egress, 50K MAU Auth
  - Pro : $25/mois + facturation usage
  - Connection pool (Supavisor) saturable — utiliser pool transaction mode pour serverless
- §7 :
  - **RLS obligatoire** sur toutes tables exposées via PostgREST
  - Policies `auth.uid()` — éviter sous-requêtes lourdes dans une policy (s'exécute par row)
  - `service_role` key bypass RLS — jamais côté client
- §8 :
  - Indexes Postgres standard (`CREATE INDEX ... ON table(col)`)
  - `EXPLAIN ANALYZE` pour queries lentes ; `pg_stat_statements` pour top calls
- §9 :
  - Edge Functions (Deno) pour async ; pg_cron pour scheduled jobs
- §10 :
  - Supabase Dashboard → Reports → Database / API
  - `pg_stat_statements` enable via SQL Editor

---

<!-- last-verified: 2026-05 -->
## Prisma (Postgres / MySQL / SQLite / MongoDB)

Pivots :

- §1 :
  - `include` vs `select` — `include` charge tous les champs de la relation, `select` est plus précis
  - N+1 résolu via `include: { relation: true }` ou `Promise.all` + `findMany({ where: { id: { in: ids } } })`
  - Activer log queries en dev : `new PrismaClient({ log: ['query'] })`
  - Middleware `$on('query')` pour compter requêtes par requête HTTP
- §2 :
  - `take` + `cursor` (cursor-based) ou `take` + `skip` (offset, plus lent sur grands datasets)
- §3 :
  - Prisma n'a pas de subscription native — utiliser DB-native (Postgres LISTEN/NOTIFY) ou pubsub externe
- §4 :
  - Pas de cache built-in — Prisma Accelerate (cloud, payant) OU cache applicatif (Redis, in-memory)
- §5 :
  - `select` pour limiter colonnes ramenées (réduit egress + parsing)
- §6 :
  - Connection pool : `connection_limit` dans DATABASE_URL (default 2× CPUs)
  - Serverless (Vercel/Lambda) : utiliser Prisma Data Proxy ou Prisma Accelerate pour pooling externe
- §7 :
  - Prisma n'a pas de RLS native — implémenter ABAC en code (middleware `$use`)
- §8 :
  - Migrations versionnées : `prisma/migrations/` ; ajouter `@@index([...])` dans schema
  - `prisma db pull` pour sync depuis schéma DB existant
- §9 :
  - Pas de queue intégrée — BullMQ (Redis), Inngest, Trigger.dev
- §10 :
  - `prisma studio` (dev) ; pg_stat_statements / slow query log côté DB

---

<!-- last-verified: 2026-05 -->
## Drizzle (Postgres / MySQL / SQLite)

Pivots :

- §1 :
  - SQL-like API : `db.select(...).from(...).where(...)` — pas de magic eager-loading
  - Joins explicites via `.leftJoin/.innerJoin` — évite N+1 par construction
- §2 :
  - `.limit(N).offset(M)` ou cursor manuel sur colonne ordonnée
- §4 :
  - Pas de cache — applicatif (Redis, unstorage côté Nuxt/Nitro)
- §6 :
  - Drizzle est lib légère (~7KB) — pas d'overhead runtime
  - Connection pool : pg/mysql2/better-sqlite3 standard
- §8 :
  - Schémas TypeScript dans `src/db/schema.ts` — `drizzle-kit push` ou migrations
  - Index via `index('name').on(...)` dans schema
- §10 :
  - Logger : `drizzle({ logger: true })` log toutes les queries

---

<!-- last-verified: 2026-05 -->
## TypeORM / Sequelize (Node ORMs traditionnels)

Pivots :

- §1 :
  - **Eager vs Lazy** : `relations: ['posts']` (TypeORM) / `include: [Post]` (Sequelize) — N+1 si oublié
  - QueryBuilder pour requêtes complexes : `createQueryBuilder('user').leftJoinAndSelect('user.posts', 'post')`
  - Activer logging : `logging: 'all'` (TypeORM) / `logging: console.log` (Sequelize)
- §2 :
  - `take`/`skip` (TypeORM), `limit`/`offset` (Sequelize) — préférer cursor sur grands datasets
- §6 :
  - Connection pool : `extra: { max: 20 }` (TypeORM) ; `pool: { max: 20 }` (Sequelize)
  - Serverless mal supporté (sockets persistantes) — préférer Prisma/Drizzle pour Lambda/Vercel
- §8 :
  - TypeORM migrations CLI ; Sequelize via `umzug`
- §10 :
  - Slow query log côté DB primaire signal

---

<!-- last-verified: 2026-05 -->
## Mongoose / MongoDB

Pivots :

- §1 :
  - `populate()` = N+1 par défaut (1 query par champ populated) — préférer aggregation pipeline `$lookup`
  - `lean()` pour queries read-only (skip Mongoose hydration, +30-40% rapide)
- §2 :
  - `.limit(N).skip(M)` ou cursor `.find().cursor()` pour stream
- §4 :
  - Pas de cache built-in ; Atlas Data Federation cache + Atlas Search caching
- §5 :
  - Projection : `.select('-password')` ou `.select('name email')`
- §6 :
  - Atlas tiers : M0 (free, 512MB), M10+ payants
  - Connection pool : `mongoose.connect(uri, { maxPoolSize: 100 })`
- §7 :
  - Atlas Custom Roles + DB users séparés par environnement
- §8 :
  - `Schema.index({ field: 1 })` ; `db.collection.getIndexes()` pour audit
  - Compound indexes pour queries multi-field
- §10 :
  - Atlas Performance Advisor recommande indexes manquants
  - `db.setProfilingLevel(1, { slowms: 100 })` pour slow query log

---

<!-- last-verified: 2026-05 -->
## DynamoDB (AWS SDK)

Pivots :

- §1 :
  - Single-table design recommandé (Rick Houlihan) — éviter scans
  - `Query` (use index) >>> `Scan` (full table) — Scan jamais en hot path
  - `BatchGetItem` (max 100 items) ou `BatchWriteItem` (max 25) — batcher impérativement
- §2 :
  - `Limit` + `LastEvaluatedKey` (cursor pagination native)
- §3 :
  - DynamoDB Streams + Lambda triggers — auditer la fan-out (1 stream → N functions)
- §4 :
  - DAX (DynamoDB Accelerator) cluster cache pour read-heavy ($$$)
  - Application-level cache (Redis/ElastiCache) pour patterns custom
- §5 :
  - `ProjectionExpression` pour ramener seulement les attributs nécessaires
- §6 :
  - **On-demand** : facturation par RCU/WCU consommée
  - **Provisioned** : capacité fixée + auto-scaling — moins cher si charge prévisible
  - Limite item : 400 KB ; partition : 1000 WCU / 3000 RCU avant split
- §7 :
  - IAM policies fine-grained sur attributes (`dynamodb:LeadingKeys`)
- §8 :
  - GSI / LSI dimensionnés (chaque GSI = WCU/RCU séparés, facturé)
  - Heat partition : composite PK avec haute cardinalité
- §9 :
  - SQS / SNS / EventBridge pour async ; Step Functions pour orchestration
- §10 :
  - CloudWatch Metrics : `ConsumedReadCapacityUnits`, `ThrottledRequests`
  - Contributor Insights pour partitions chaudes

---

<!-- last-verified: 2026-05 -->
## Django ORM

Pivots :

- §1 :
  - `select_related` (FK, OneToOne — JOIN) ; `prefetch_related` (M2M, reverse FK — 2 queries)
  - `only(...)` / `defer(...)` pour limiter colonnes
  - `django-debug-toolbar` en dev — count SQL/page
  - `silk` pour profiling continu en staging
- §2 :
  - `Paginator` standard ; cursor pagination via DRF `CursorPagination`
- §4 :
  - Cache framework Django : `@cache_page`, `cache.get_or_set` (Redis/Memcached backend)
  - Template fragment caching `{% cache %}`
- §6 :
  - Connection pool : `CONN_MAX_AGE` (ou pgbouncer en sidecar)
  - `gunicorn` workers = `2 * cores + 1`
- §7 :
  - Django Rest Framework permissions classes ; pas de RLS native
- §8 :
  - `Meta.indexes = [models.Index(fields=[...])]`
  - `manage.py sqlmigrate <app> <num>` pour vérifier SQL généré
- §9 :
  - Celery (Redis/RabbitMQ broker) pour async ; `django-q2` léger alternative
- §10 :
  - PostgreSQL `pg_stat_statements` ; `SELECT * FROM pg_stat_statements ORDER BY total_exec_time DESC`

---

<!-- last-verified: 2026-05 -->
## Laravel — Eloquent

Pivots :

- §1 :
  - **N+1** : `Model::with('relation')` (eager) ou `$model->load('relation')` (lazy-then-eager)
  - `Model::query()->toRawSql()` pour debug
  - `barryvdh/laravel-debugbar` (dev) ou `laravel/telescope` — count queries/page
- §2 :
  - `Model::paginate(50)` (offset) ou `Model::cursorPaginate(50)` (recommandé sur grands datasets)
- §4 :
  - `Cache::remember(key, ttl, fn)` (Redis backend recommandé)
  - HTTP cache : `cache.headers` middleware
- §6 :
  - OPcache obligatoire en prod (`opcache.enable=1`)
  - `php artisan optimize` (config + route + view caching)
- §7 :
  - Policies / Gates ; pas de RLS native — mettre où nécessaire au model layer
- §8 :
  - Migrations : `Schema::table(...)->index([...])`
  - Index DB sur clés étrangères + colonnes filtrées
- §9 :
  - Queues : `php artisan queue:work` (Redis/SQS) — jobs lents en async
  - Horizon dashboard pour Redis queues
- §10 :
  - Telescope queries panel ; slow query log MySQL/Postgres

---

<!-- last-verified: 2026-05 -->
## PHP — Doctrine (Symfony / standalone Slim / Mezzio / Laminas)

Pivots :

- §1 :
  - **EAGER vs LAZY** sur associations (`@ORM\ManyToOne(fetch="EAGER")`)
  - QueryBuilder + `select` partial pour limiter colonnes
  - `EntityManager::clear()` sur batch jobs (sinon explosion mémoire)
- §2 :
  - `Pagerfanta` ou pagination manuelle via QueryBuilder `setFirstResult` + `setMaxResults`
- §4 :
  - **Doctrine cache layers** : metadata, query, result — APCu ou Redis backend
  - Symfony HTTP cache : `@Cache` annotation
- §6 :
  - OPcache + APCu obligatoires
  - `bin/console cache:warmup --env=prod` au déploiement
- §7 :
  - Voters Symfony Security ; pas de RLS
- §8 :
  - Migrations Doctrine : `bin/console make:migration` ; index via `@ORM\Index`
- §9 :
  - Symfony Messenger (transports : AMQP, Redis, Doctrine)
- §10 :
  - Symfony Profiler `/_profiler` — onglet Doctrine pour count queries

---

<!-- last-verified: 2026-05 -->
## GraphQL — Apollo / urql / Relay

Pivots :

- §1 :
  - **N+1 dans resolvers** = problème majeur GraphQL — utiliser `DataLoader` (batch + cache par request)
  - Resolvers async sans DataLoader = N+1 garanti à chaque level
  - `graphql-query-complexity` pour bloquer queries trop chères
- §2 :
  - **Relay-style cursor pagination** : `first/after`, `last/before` — pattern standard
- §3 :
  - Subscriptions via WebSocket (`graphql-ws`) — auditer le fan-out serveur
- §4 :
  - **Apollo Client cache** : normalised store par typename+id — invalidation via `cache.evict`/`refetchQueries`
  - **urql exchange** : `cacheExchange` + `documentCacheExchange` pour patterns simples
  - **Persisted queries** (APQ) côté serveur : réduit payload envoyé + permet CDN cache GET
- §5 :
  - Limite la taille de fragment via field-level deprecation et schema design (pas de "kitchen sink" type)
- §6 :
  - Apollo Server : enable response cache plugin
  - Federation : auditer entité `__resolveReference` (souvent le hot path N+1)
- §7 :
  - Auth via context resolvers ; `@auth` directive ; field-level authorization
- §10 :
  - Apollo Studio (cloud) traces ; Hive (open-source) ; Sentry GraphQL plugin

---

<!-- last-verified: 2026-05 -->
## tRPC

Pivots :

- §1 :
  - `useQuery` per-procedure — batching automatique via `httpBatchLink` (un seul HTTP call pour multiple procédures)
  - Vérifier `httpBatchLink` est bien configuré sinon 1 procédure = 1 HTTP request
- §2 :
  - Pas de pagination native — implémenter via input zod (`{ cursor, limit }`)
- §4 :
  - React Query / TanStack Query côté client — cache + dedup automatique
- §5 :
  - Schémas zod — auditer le coût de validation runtime sur gros payloads
- §6 :
  - Si backend = Vercel Functions, mêmes contraintes serverless (cold starts, pool)

---

<!-- last-verified: 2026-05 -->
## Hasura

Pivots :

- §1 :
  - Hasura génère SQL optimisé avec JOIN — N+1 résolu côté engine
  - Vérifier `query_collections` whitelist en prod (limite surface attaque + permet caching)
- §4 :
  - **Hasura Caching** (Cloud / Enterprise) : `@cached(ttl: ...)` directive — cache côté Hasura
- §6 :
  - Free tier (Hasura Cloud) : limites quotidiennes — Pro pour SLA
- §7 :
  - **Permissions row-level** définies par rôle dans Hasura Console — équivalent RLS
  - Limites filter / aggregation par rôle (anti-DoS)
- §10 :
  - Hasura logs ; Postgres `pg_stat_statements` côté DB

---

<!-- last-verified: 2026-05 -->
## REST vanilla (raw fetch / axios sans ORM)

Pivots :

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

---

<!-- last-verified: 2026-05 -->
## Fallback : stack non listé

Si la stack ne matche aucun template existant ET aucune entrée ci-dessus :

1. Demander à l'utilisateur 3 infos : (a) DB primaire, (b) data-access pattern (ORM / SDK / raw / GraphQL), (c) cache layer
2. Construire la checklist en repartant des **12 sections génériques** (haut de ce document)
3. Lister explicitement les pivots non couverts comme "à valider" plutôt que d'inventer
4. **Si `aidd_docs/internal/decisions/` existe :** proposer un DEC documentant les conventions découvertes. **Sinon :** inline les conventions retenues dans le header du nouveau template (rendre la skill réutilisable sans dépendance ADR)
