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

- `mongoose.set('debug', true)` en dev → log chaque `find`/`update`/`aggregate` avec collection + payload
- Atlas Performance Advisor (cluster M10+) → suggestions d'index sur les slow queries

## §1 — N+1 / Populate

- `User.find().populate('posts')` exécute 2 queries (find users, find posts in [ids]) — OK pour 1 niveau
- `populate({ path: 'posts', populate: { path: 'comments' } })` → 3 queries ; profondeur > 2 = red flag
- **Alternative** : embed les sous-documents si toujours consultés ensemble (modèle Mongo, pas SQL)
- `$lookup` aggregation pour joins côté serveur Mongo (plus coûteux que 2 finds parallèles dans la plupart des cas)

## §2 — Select / projection

- `.select('email name')` obligatoire dès qu'on ne consomme pas tous les champs
- `.lean()` retourne des objets JS plain (pas de documents Mongoose) → 3-5× plus rapide pour read-only
- `.lean()` perd les virtuals, methods, getters — read-only API responses oui, mutations non

## §3 — Pagination

- `.skip().limit()` perfeur dégradée au-delà de quelques milliers — préférer range queries (`_id: { $gt: lastId }`)
- `countDocuments()` plein scan : pour pagination UI, préférer `estimatedDocumentCount()` ou compteur dénormalisé

## §4 — Indexes

- `Schema.index({ field1: 1, field2: -1 })` — ordre matters (ESR rule : Equality, Sort, Range)
- `autoIndex: false` en prod → créer les index manuellement via migration
- Vérifier `db.collection.getIndexes()` matchant le schema

## §5 — Connection

- `mongoose.connect(uri, { maxPoolSize: 10 })` ; sans tuning défaut = 100 (souvent trop)
- Serverless : `bufferCommands: false` + connexion cachée hors handler

## §6 — Schema design

- Embedded vs referenced : embedded si <16 MB doc total, accès atomique, jamais consulté seul
- Auditer chaque schema : tableaux unbounded (commentaires, logs, événements) = ticking time bomb
- Migration de array → collection séparée dès qu'on dépasse quelques centaines d'items

## §7 — Aggregation pipeline

- `$match` AVANT `$lookup` / `$unwind` (réduit la cardinalité tôt)
- Index utilisable seulement si `$match` est la première étape
- `allowDiskUse: true` pour aggregations > 100 MB en mémoire — symptôme d'un pipeline mal conçu, pas une solution

## §8 — Transactions

- Transactions Mongo nécessitent replica set (Atlas ok, standalone non)
- `session.withTransaction(async () => { ... })` ; coût latence non négligeable, n'utiliser que si invariants multi-doc
