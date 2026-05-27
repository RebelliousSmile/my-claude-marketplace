# Contrat de pivot — data-pivots-<stack>.md

> Toute `data-pivots-<stack>.md` installée par un plugin `sc-*` doit répondre aux questions ci-dessous pour chaque section qu'elle couvre.
> Une section sans réponse à sa question obligatoire (\*) est incomplète — l'audit `data-optimize` produira des recommandations génériques non vérifiables sur ce stack.

## Comment utiliser ce contrat

1. Quand tu crées ou révises un `data-pivots-<stack>.md`, parcours chaque §N couvert par ta pivot et vérifie que les questions marquées **\*** ont une réponse concrète (commande, nom de fichier, pattern de code).
2. Les questions sans astérisque sont optionnelles mais améliorent la qualité de l'audit.
3. Si une question ne s'applique pas à ton stack (ex. §3 real-time sur un stack purement request/response), indique explicitement `N/A — raison`.

---

## §0 — Pre-flight

| \* | Question |
|---|---|
| \* | Quelle commande ou quel outil **compte les requêtes émises** par action utilisateur (ex. Prisma `$on('query', ...)`, Django Debug Toolbar, Laravel Debugbar, Firebase emulator logs) ? |
| \* | Comment **capturer le payload bytes** par action : Content-Length agrégé, DevTools HAR, ou instrumentation client-side ? |
| \* | Quels **compteurs déterministes** sont disponibles nativement sur ce stack pour constituer une baseline reproductible (queries/request, reads/write, quota delta) ? |
|   | Y a-t-il un **warm-up / cold-start** spécifique à ce stack (serverless, connection pool, cache ORM) qui biaise la première mesure ? Comment le stabiliser ? |

## §1 — Query patterns (N+1, eager-load, batch)

| \* | Question |
|---|---|
| \* | Comment ce stack déclenche-t-il un **N+1** ? Quel est le pattern à détecter (ex. Eloquent sans `with()`, Prisma sans `include:`, `getDocs` dans un `forEach`, GraphQL resolver sans DataLoader) ? |
| \* | Quelle **commande grep** permet de détecter les appels en boucle ou non-batchés dans ce stack ? |
| \* | Comment **batcher** les lectures sur ce stack (ex. Prisma `findMany({ where: { id: { in: ids } } })`, Firestore `getAll()`, DynamoDB `batchGet`, `Promise.all`) ? |
|   | Y a-t-il un **query log / profiler** natif sur ce stack (pg_stat_statements, EXPLAIN ANALYZE, Firebase emulator, Mongoose debug mode) ? Comment l'activer ? |

## §2 — Pagination & limits

| \* | Question |
|---|---|
| \* | Comment déclare-t-on une **requête bornée** sur ce stack (ex. `limit()` Firestore, `take:` Prisma, `LIMIT/OFFSET` SQL, `Paginator` Django) ? |
| \* | Comment détecter les **requêtes sans limite** (`getDocs(query(...))` sans `limit()`, `Model.objects.all()`, `Model::all()`, `prisma.x.findMany({})` sans `take:`) ? |
| \* | Quel est le **pattern de curseur** recommandé pour ce stack (ex. `startAfter` Firestore, cursor Prisma, keyset pagination SQL) vs offset pagination ? |
|   | Y a-t-il une **limite hard-codée** recommandée par le provider pour ce stack (ex. Firestore 1 req/s par document, DynamoDB 1 MB par batchGet) ? |

## §3 — Real-time subscriptions / change streams

| \* | Question |
|---|---|
| \* | Comment ce stack expose-t-il les **souscriptions temps réel** (ex. `onSnapshot` Firestore, Supabase `realtime().on(...)`, socket.io events, GraphQL subscriptions, polling) ? |
| \* | Comment **désabonner proprement** (ex. retourner l'unsubscribe de `onSnapshot` dans `onUnmounted`, appeler `.channel.unsubscribe()`, clore la connexion WebSocket) ? Comment détecter les fuites ? |
| \* | Comment **limiter le scope** d'une souscription (écouter un seul document vs une collection entière) ? Quand une souscription devient-elle une lecture amplifiée ? |
|   | Y a-t-il un **déduplication** ou **throttling** natif pour les mises à jour (ex. `includeMetadataChanges`, debounce, snapshot equality) ? |
|   | Si `N/A` (stack purement request/response sans real-time) : l'indiquer explicitement. |

## §4 — Caching layer

| \* | Question |
|---|---|
| \* | Quels sont les **niveaux de cache** disponibles sur ce stack (ex. cache client SDK Firestore, React Query / TanStack Query, Redis server-side, HTTP cache CDN, in-memory LRU) ? |
| \* | Comment déclarer une **TTL** ou une **invalidation** sur chaque couche (ex. `staleTime` TanStack Query, `cacheTime`, `revalidate` Next.js ISR, `Cache-Control` header, `redis.setex`) ? |
| \* | Comment **détecter un cache miss systématique** sur ce stack (chaque requête frappe la DB sans cache, CDN bypass permanent) ? |
|   | Y a-t-il un **cache distribué** préconisé pour ce stack en production (Upstash Redis, Vercel KV, Firebase Memorystore) ? |

## §5 — Payload optimization

| \* | Question |
|---|---|
| \* | Comment déclarer une **projection / sélection de champs** sur ce stack (ex. `select:` Prisma, `.select('field1 field2')` Mongoose, `SELECT a, b` SQL, Firestore `withConverter`, GraphQL field selection) ? |
| \* | Comment détecter les **overfetch courants** : `prisma.x.findMany({})` sans `select:`, `getDocs` retournant des champs non utilisés, `Model.objects.all()` sans `.values()`, `.only()` ? |
| \* | Le stack compresse-t-il les réponses **nativement** (brotli/gzip) ou faut-il configurer le serveur/proxy ? Comment vérifier le header `Content-Encoding` ? |
|   | Y a-t-il un **format binaire** ou un protocole optimisé disponible sur ce stack (ex. Protocol Buffers via gRPC, Firestore REST vs SDK, Msgpack) ? Quand en profiter ? |

## §6 — Quota & cost awareness

| \* | Question |
|---|---|
| \* | Où consulter les **métriques de quota** pour ce stack (ex. Firebase Console → Usage, Supabase Reports, AWS CloudWatch, Atlas Metrics, Vercel Analytics, pg_stat_statements) ? |
| \* | Quelles **opérations sont facturées** sur ce stack (reads, writes, deletes, egress, connection time, CPU) et quel est le modèle de coût (par document, par GB, par requête) ? |
| \* | Quelle est la **règle d'optimisation coût/quota prioritaire** sur ce stack (ex. Firestore : éviter les lectures de collection entière → composite index ; DynamoDB : éviter scan → GSI) ? |
|   | Y a-t-il des **alertes de quota** configurables nativement (Firebase budget alerts, AWS Budgets, Supabase billing) ? Quels seuils recommander ? |

## §7 — Security & access control

| \* | Question |
|---|---|
| \* | Où sont définies les **règles de sécurité** pour ce stack (ex. `firestore.rules`, `supabase/migrations/` RLS policies, Laravel Gates, Django permissions, `schema.prisma` @auth Nexus) ? |
| \* | Comment détecter un **role lookup dans un hot path** (ex. `auth().currentUser` appelé à chaque read, query DB user dans chaque resolver, N+1 permission checks) ? |
| \* | Comment **tester les règles de sécurité** sur ce stack (Firebase Emulator Suite → Rules Playground, Supabase SQL editor pour tester RLS, tests Laravel Gate, tests Django permissions) ? |
|   | Y a-t-il des **anti-patterns de sécurité connus** spécifiques à ce stack (ex. Firestore `allow read: if true`, Eloquent sans `->where('user_id', Auth::id())`, Mongoose `find({})` non-scopé) ? |

## §8 — Schema & indexing

| \* | Question |
|---|---|
| \* | Comment **déclarer un index** sur ce stack (ex. `firestore.indexes.json`, Prisma `@@index`, Mongoose `index: true`, Django `db_index`, Laravel `->index()` migration, SQL `CREATE INDEX`) ? |
| \* | Comment **détecter une requête sans index** (ex. Firebase "The query requires an index" en console, EXPLAIN ANALYZE sur PostgreSQL, Mongoose `explain()`, MySQL slow query log, Laravel Telescope) ? |
| \* | Comment **dénormaliser** sur ce stack pour réduire les lectures (ex. Firestore : dupliquer les champs de jointure pour éviter `getDocs` multiples ; Mongoose : `populate` vs embed ; Prisma : vue matérialisée) ? |
|   | Y a-t-il des **limites de schéma** spécifiques au provider (ex. Firestore max 200 indexes composites, DynamoDB single-table design, Supabase partitionnement, sharding MongoDB) ? |

## §9 — Background jobs & async

| \* | Question |
|---|---|
| \* | Comment ce stack délègue-t-il les **opérations coûteuses** hors du hot path de la requête (ex. Cloud Tasks / Cloud Functions, Laravel Queues, Django Celery, Bull/BullMQ, Supabase Edge Functions, AWS SQS) ? |
| \* | Comment garantir l'**idempotence** des jobs sur ce stack (ex. Firebase transaction `runTransaction`, Prisma `upsert`, Django `update_or_create`, Kafka `exactly-once`, dedup key Bull) ? |
| \* | Comment **retry / backoff** les jobs en échec sur ce stack (ex. Cloud Tasks retry config, Bull `attempts + backoff`, Celery `max_retries`, SQS dead-letter queue) ? |
|   | Si `N/A` (pas de background jobs sur ce stack) : l'indiquer explicitement. |

## §10 — Verification & non-regression

| \* | Question |
|---|---|
| \* | Quel est le **critère de succès déterministe** pour ce stack (ex. "−N lectures Firestore par action", "−M queries SQL par page", "payload réduit de X KB", "quota journalier divisé par Y") ? |
| \* | Comment comparer **médiane post-fix vs maximum pré-fix** pour déclarer un vrai gain sur ce stack ? Quel outil de baseline utiliser (baseline JSON `baselines/<scope>.json`, pg_stat_statements, Firebase Console, Prisma metrics) ? |
| \* | Y a-t-il un **observability layer** natif sur ce stack (ex. Prisma metrics, Django Silk, Firebase Performance Monitoring, Sentry performance, Datadog APM, OpenTelemetry) ? Comment le configurer ? |
|   | Y a-t-il un **tripwire automatique** (ex. test qui échoue si queries/request > N, alert CloudWatch si reads/min > seuil, budget alert si quota > $X) ? |

## §11 — Checklist self-audit

| \* | Question |
|---|---|
| \* | Quels **items de cette pivot** ne s'appliquent pas sur ce stack (faux positifs connus) ? Les indiquer explicitement pour éviter le bruit d'audit. |
| \* | Quels **patterns récurrents** de ce stack ne sont pas encore couverts par la pivot mais devraient l'être (gaps candidats) ? |
|   | Y a-t-il des **commandes grep / analyse** utiles découvertes en pratique qui mériteraient d'être ajoutées à la section "Quick verification commands" de la pivot ? |
