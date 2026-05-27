---
paths:
  - "**/models/**/*.ts"
  - "**/models/**/*.js"
  - "**/*.schema.ts"
  - "mongoose.config.*"
---

# Data pivots — Mongoose (MongoDB)

Stack-specific overrides for data audits when `mongoose` is detected. Loaded by `data-optimize`. Concatenate with backend pivots.

## §0 — Pre-flight

- `mongoose.set('debug', true)` en dev → log chaque `find`/`update`/`aggregate` avec collection + payload ; désactiver en prod
- Compteur déterministe : middleware Mongoose global :
  ```ts
  mongoose.plugin((schema) => {
    schema.pre(['find', 'findOne', 'updateMany', 'deleteMany'], function() { queryCount++ })
  })
  ```
- Payload bytes : `Content-Length` DevTools HAR ou `JSON.stringify(docs).length` sur les réponses critiques
- Atlas Performance Advisor (cluster M10+) : suggestions d'index sur les slow queries ; activer "Profiler" dans Atlas Dashboard (> 100ms)
- Warm-up : connection pool Mongoose = persistant ; la première requête cold-start est plus lente → stabiliser avec 3 runs
- Connection pool : `mongoose.connect(uri, { maxPoolSize: 10 })` ; serverless : `bufferCommands: false` + connexion cachée hors handler

## §1 — Query patterns (N+1, eager-load, batch)

- `User.find().populate('posts')` exécute 2 queries (find users → find posts WHERE \_id IN [...]) — OK pour 1 niveau
- `populate({ path: 'posts', populate: { path: 'comments' } })` → 3 queries ; profondeur > 2 = red flag
- **Alternative embed** : intégrer les sous-documents si toujours consultés ensemble (modèle Mongo natif)
- `$lookup` aggregation pour joins côté serveur — plus coûteux que 2 finds parallèles dans la plupart des cas
- **Grep N+1** :
  ```bash
  grep -rn "\.populate(" src/ | grep -c "populate"  # compter les populate imbriqués
  grep -rn "\.forEach\|\.map" src/ | grep "await.*Model\.\|await.*\."  # async dans boucle
  ```
- Batch : `Model.find({ _id: { $in: ids } })` — 1 query au lieu de N `findById`

## §2 — Pagination & limits

- `.skip().limit()` dégradée au-delà de quelques milliers — `skip(N)` déclenche un full-scan partiel
- Préférer range queries cursor-based : `{ _id: { $gt: lastId } }` avec `_id` (ObjectId trié temporellement)
- `countDocuments()` = plein scan : préférer `estimatedDocumentCount()` ou compteur dénormalisé pour UI pagination
- **Détecter illimité** :
  ```bash
  grep -rn "\.find(" src/ | grep -v "\.limit(" # sans limite
  ```
- Cursor pattern :
  ```ts
  Model.find({ _id: { $gt: lastObjectId } }).sort({ _id: 1 }).limit(20)
  ```

## §3 — Real-time subscriptions

- **Change Streams** (replica set ou Atlas requis) :
  ```ts
  const changeStream = Model.watch([{ $match: { 'fullDocument.userId': userId } }])
  changeStream.on('change', (change) => io.emit('update', change.fullDocument))
  ```
- **Nettoyage** : `changeStream.close()` dans `onUnmounted` / teardown module — sinon fuite curseur côté serveur
- **Scope** : pipeliner avec `$match` pour limiter aux documents du tenant : `[{ $match: { 'fullDocument.tenantId': tenantId } }]` — écouter une collection entière sans filtre = lecture amplifiée
- Atlas Triggers (serverless) : alternative managed, scope par filtre de collection
- **Déduplication** : `fullDocument` retourné seulement si `fullDocument: 'updateLookup'` ; throttler les emissions Socket.io si volume élevé

## §4 — Caching layer

- Cache-aside Redis :
  ```ts
  const cached = await redis.get(`doc:${id}`)
  if (cached) return JSON.parse(cached)
  const doc = await Model.findById(id).lean()
  await redis.setex(`doc:${id}`, 300, JSON.stringify(doc))
  return doc
  ```
- **`.lean()` + cache** : `.lean()` retourne des plain objects (3–5× plus rapide pour read-only) — idéal pour les entrées à cacher
- **Invalidation** : `redis.del(`doc:${id}`)` dans le hook `post('save')` ou `post('findOneAndUpdate')` du schema
- TanStack Query côté client : `staleTime: 2 * 60 * 1000` sur queries de référence
- **Détecter cache miss systématique** : debug mode log chaque query → aucun hit Redis → ajouter la couche cache

## §5 — Projection (select narrowing)

- `.select('email name')` ou `.select({ email: 1, name: 1 })` obligatoire dès qu'on ne consomme pas tous les champs
- `.lean()` retourne des objets JS plain (pas de documents Mongoose) → 3–5× plus rapide pour read-only API
- `.lean()` perd les virtuals, methods, getters — read-only uniquement, jamais avant mutations
- **Grep overfetch** :
  ```bash
  grep -rn "\.find(" src/ | grep -v "\.select(" # sans projection
  grep -rn "\.findOne\b" src/ | grep -v "\.select\|, {" # sans projection
  ```
- Compression : gzip/brotli côté serveur (Express `compression()`, Fastify `@fastify/compress`)

## §6 — Quota & cost awareness

- **Atlas Performance Advisor** : disponible sur M10+ → recommendations d'index sur les slow queries (> 100ms)
- **Atlas Data Explorer → Profiler** : capturer les requêtes lentes ; `db.setProfilingLevel(1, { slowms: 100 })` en local
- **Atlas Metrics** : Operations/sec, Connections, Query Targeting (reads per query — cible < 1000:1)
- **Opérations facturées Atlas** : processing units (RPUs) + storage + transfer ; Change Streams = +1 connexion persistante
- **Règle prioritaire** : Query Targeting ratio > 1000:1 = index manquant → créer l'index composite (voir §8)
- Alertes Atlas : configurer des alertes sur Query Targeting ratio et Connections count

## §7 — Security & access control

- **Scope obligatoire** : toute query sur ressource utilisateur doit avoir `{ userId: session.userId }` — jamais `Model.find({})` sans filtre tenant
- **`$where` interdit** : exécute du JavaScript côté serveur Mongo (injection JS) — `$where` et `mapReduce` avec fonctions JS sont des vecteurs d'injection
- **`strict: true`** (défaut Mongoose) : empêche les champs non déclarés dans le schema d'être persistés — ne jamais passer `{ strict: false }` sur une entrée client non sanitizée
- **Anti-patterns** :
  - `Model.find({})` sans `where` = fuite multi-tenant
  - `Model.findOneAndUpdate({ _id: req.body._id })` sans vérifier `userId` = IDOR
  - Exposer `__v` et les champs internes dans les réponses API
- **Tests sécurité** : vérifier que les handlers rejettent les requêtes avec un `_id` d'un autre `userId`

## §8 — Schema & indexing

- `Schema.index({ field1: 1, field2: -1 })` — ESR rule : Equality d'abord, Sort ensuite, Range en dernier
- `{ autoIndex: false }` en prod → créer les index via migration ou Atlas UI ; `autoIndex: true` acceptable en dev uniquement
- **Détecter index manquant** : Mongoose `explain()` : `Model.find({}).explain('executionStats')` → `executionStats.totalDocsExamined >> nReturned` = index manquant ; Atlas Performance Advisor
- **Dénormalisation** : embed les champs fréquemment lus (`user.name`, `category.title`) dans le document plutôt que `populate` à chaque fois
- **Arrays unbounded** : tableaux sans limite (`comments: []`, `events: []`) = ticking time bomb (doc Mongo max 16 MB) → migrer vers collection séparée dès > quelques centaines d'items
- Transactions : nécessitent replica set (Atlas ok, standalone non) ; `session.withTransaction(async () => { ... })` — coût latence réel, utiliser seulement si invariants multi-document

## §9 — Background jobs & async

- **Déléguer hors hot path** : mutations lourdes (envoi email, traitement images, re-indexation) → BullMQ / Agenda / Inngest
  ```ts
  // ❌ Bloquant
  await sendPushNotification(userId)
  // ✅ Queue
  await notifQueue.add('push', { userId })
  ```
- **Idempotence Mongoose** :
  ```ts
  await Model.findOneAndUpdate(
    { externalId: event.id },      // clé de déduplication
    { $set: { ...data } },
    { upsert: true, new: true }
  )
  ```
- **Retry / backoff** :
  - BullMQ : `{ attempts: 3, backoff: { type: 'exponential', delay: 2000 } }`
  - Agenda : `job.attrs.failReason` + `job.attrs.failedAt` natifs
- Mongoose dans les workers : connexion singleton (`mongoose.connect()` une seule fois) ; écouter `SIGTERM` pour `mongoose.disconnect()`

## §10 — Verification & non-regression

- **Critère déterministe** : nombre de queries Mongoose par action (endpoint) avant/après — mesurer via le middleware global counter ou le mode debug
- **Baseline JSON** : `baselines/mongoose-queries.json` avec `{ endpoint, queriesCount, avgDurationMs }` — comparer médiane post-fix vs maximum pré-fix
- **Observability** :
  - `mongoose.set('debug', (collectionName, method, query, doc) => logger.debug(...))`  pour structurer les logs
  - Atlas Performance Monitoring : latence p50/p95 par opération
  - Sentry Performance : breadcrumbs automatiques si `@sentry/node` configuré
  - OpenTelemetry : `@opentelemetry/instrumentation-mongoose` — traces par query

## §11 — Checklist self-audit

- **Faux positifs connus** :
  - `$where` est interdit de sécurité — ne pas le proposer même pour des cas complexes ; utiliser `$expr` à la place
  - Change Streams nécessitent un replica set MongoDB — non applicable en standalone local ; Atlas requis en production
  - `.lean()` perd Mongoose virtuals (`fullName = firstName + lastName`) — les tests cassent si les virtuals sont attendus
  - `findAndModify` deprecated — remplacer par `findOneAndUpdate` dans le code existant
- **Gaps candidats** :
  - Discriminators Mongoose (inheritance) : impact performance sur les queries polymorphes non couvert
  - Schema versioning (`__v`) et migration de documents existants non couvert
  - Atlas Search (Lucene) pour full-text : coût différent des queries standard
  - Capped collections pour logs/events : pattern non documenté
- **Commandes grep utiles** :
  ```bash
  grep -rn "\.find(\|\.findOne(" src/ | grep -v "\.select\|\.lean" # overfetch sans lean
  grep -rn "\$where\b" src/                                          # injection JS
  grep -rn "strict.*false" src/                                      # strict désactivé
  grep -rn "\.populate(" src/ | grep "populate:"                     # populate imbriqués
  grep -rn "autoIndex.*true" src/ | grep -v "dev\|test"             # autoIndex prod
  ```
