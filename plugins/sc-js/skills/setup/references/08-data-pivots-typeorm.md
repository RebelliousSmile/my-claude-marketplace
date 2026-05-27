---
paths:
  - "ormconfig.js"
  - "ormconfig.ts"
  - "**/entities/**/*.ts"
  - "**/data-source.ts"
---

# Data pivots — TypeORM / Sequelize

Stack-specific overrides for data audits when `typeorm` or `sequelize` is detected. Loaded by `data-optimize`. Concatenate with backend pivots.

## §0 — Pre-flight

- TypeORM : `logging: ['query', 'error', 'warn']` dans `DataSource` options en dev + `maxQueryExecutionTime: 200` pour logguer les requêtes lentes
- Sequelize : `logging: console.log, benchmark: true` dans le constructeur — durée par requête visible
- Compteur déterministe : logger custom TypeORM via `logger: { logQuery: (q) => count++ }` — interface `Logger`
- Payload bytes : `Content-Length` DevTools HAR ou mesure `JSON.stringify(result).length` sur les endpoints critiques
- Connection pool : TypeORM `extra: { max: 10, idleTimeoutMillis: 30000 }` ; Sequelize `pool: { max: 10, min: 0, idle: 10000 }` — tuner selon `max_connections` PostgreSQL et nombre d'instances
- Warm-up : pool froid à la première requête → stabiliser avec 3 runs avant baseline

## §1 — Query patterns (N+1, eager-load, batch)

- **N+1 TypeORM lazy loading** : `@OneToMany(() => Post, p => p.user, { lazy: true })` génère 1 query par accès `.posts` → N+1 garanti ; **bannir `{ lazy: true }`** sauf usage très ciblé documenté
- **Fix TypeORM** :
  - `repo.find({ relations: ['posts'] })` (eager via API)
  - QueryBuilder : `.leftJoinAndSelect('user.posts', 'post')` explicite
- **Fix Sequelize** : `include: [{ model: Post, as: 'posts' }]` dans `findAll` ; `as` cohérent avec l'association déclarée
- **Grep N+1** :
  ```bash
  grep -rn "@OneToMany.*lazy.*true\|@ManyToOne.*lazy.*true" src/     # lazy relations TypeORM
  grep -rn "\.forEach\|\.map" src/ | grep "await.*repo\.\|await.*Model\." # async dans boucle
  ```
- Batch : `repo.findByIds(ids)` TypeORM ou `Model.findAll({ where: { id: ids } })` Sequelize — 1 query IN au lieu de N

## §2 — Pagination & limits

- TypeORM : `take` + `skip` correct sur petits volumes ; passer à cursor-based (keyset) au-delà de 1000 rows
- `getManyAndCount()` exécute 2 queries (data + count) — utiliser séparément si le count est mis en cache
- Sequelize : `limit` + `offset` ; `findAndCountAll` = 2 queries — séparer si count est stable
- **Détecter illimité** :
  ```bash
  grep -rn "repo\.find\b\|findAll\b" src/ | grep -v "take:\|limit:" # sans limite
  ```
- Cursor pattern TypeORM QueryBuilder :
  ```ts
  qb.where('user.id > :lastId', { lastId }).orderBy('user.id', 'ASC').take(20)
  ```

## §3 — Real-time subscriptions

- **N/A pour TypeORM / Sequelize** — ces ORMs sont exclusivement request/response ; pas de souscriptions natives
- Real-time via driver brut : `pg` LISTEN/NOTIFY avec `client.on('notification', ...)` ; scope : 1 channel par tenant ; nettoyage : `client.removeListener` dans le teardown du composant/module
- Alternative : Supabase Realtime, Ably, Socket.io — découplé de TypeORM / Sequelize
- Polling Sequelize : `setInterval(() => Model.findAll(...), 5000)` acceptable sur petits projets ; `clearInterval` dans le teardown

## §4 — Caching layer

- **TypeORM Query Result Cache** : `dataSource.options.cache` configuré avec Redis (`type: 'redis', options: { host, port }`) ou in-memory
  ```ts
  repo.find({ cache: { id: 'users-list', milliseconds: 60000 } })
  ```
- Cache-aside Redis manuel (plus de contrôle) :
  ```ts
  const cached = await redis.get('users')
  if (cached) return JSON.parse(cached)
  const users = await repo.find()
  await redis.setex('users', 60, JSON.stringify(users))
  return users
  ```
- **Invalidation** : `dataSource.queryResultCache?.remove(['users-list'])` (TypeORM) ou `redis.del(key)` sur mutation
- TanStack Query côté client : `staleTime` sur les queries de référence
- **Détecter cache miss** : logger log chaque query sans aucun hit cache → ajouter la couche Redis

## §5 — Projection (select narrowing)

- TypeORM : `repo.find({ select: ['id', 'email'] })` ou QueryBuilder `.select(['user.id', 'user.email'])`
- Sequelize : `attributes: ['id', 'email']` dans `findAll`
- `find()` / `findAll()` full entity sans select = red flag pour tables avec colonnes lourdes
- **Grep overfetch** :
  ```bash
  grep -rn "repo\.find\b\|findAll\b" src/ | grep -v "select:\|attributes:" # full row
  ```
- Compression : gzip/brotli côté serveur (Express `compression()`, Fastify `@fastify/compress`) — vérifier `Content-Encoding`

## §6 — Quota & cost awareness

- **Métriques quota** :
  - PostgreSQL : `pg_stat_statements` — top queries par `total_exec_time` et `rows`
  - MySQL : `slow_query_log = ON, long_query_time = 0.2` → `mysqldumpslow -s t slow.log`
  - Laravel Telescope (TypeScript backend rare, mais applicable) / Debugbar équivalent non disponible nativement
  - Sentry Performance Monitoring : query spans automatiques si `@sentry/node` configuré
- **Opérations facturées** : SQL hébergé = compute time (Neon, PlanetScale, RDS) ; rows lus impactent le coût
- **Règle prioritaire** : ajouter des index (`@Index`, `indexes:`) sur les colonnes filtrées → réduit les rows scanned
- `EXPLAIN ANALYZE` sur toutes les queries critiques avant déploiement

## §7 — Security & access control

- **Scope obligatoire TypeORM** : toute `find` sur ressource utilisateur doit avoir `where: { userId: session.userId }`
- **Scope obligatoire Sequelize** : `where: { userId: session.userId }` ou utiliser un `defaultScope` sur le modèle
- **QueryBuilder paramétrisé** (TypeORM) :
  ```ts
  // ✅ Safe
  qb.where('user.email = :email', { email })
  // ❌ Injection
  qb.where(`user.email = '${email}'`)
  ```
- **Sequelize paramétrisé** : `Op.eq` et bindings — jamais de `literal()` avec données non sanitizées
- **Anti-patterns** :
  - `repo.find({})` sans `where` = fuite multi-tenant
  - `synchronize: true` en prod = drop columns involontaire = sécurité opérationnelle
- **Tests sécurité** : tests vérifiant que les handlers injectent `userId` depuis `session`, jamais depuis le body client

## §8 — Schema & indexing

- TypeORM : `@Index(['field1', 'field2'])` au-dessus de la classe Entity ; `@Index()` sur la propriété
- Sequelize : `indexes: [{ fields: ['email'], unique: true }]` dans `Model.init` options
- **Détecter index manquant** : `EXPLAIN ANALYZE` PostgreSQL ; MySQL `EXPLAIN` ; TypeORM log `maxQueryExecutionTime` pour les requêtes lentes
- **Dénormalisation** : dupliquer les champs agrégés (count, sum) dans la table parente pour éviter les `COUNT(*)` répétés
- Migrations : `npm run typeorm migration:run` en CI ; `sequelize db:migrate` en CI ; `synchronize: true` (TypeORM) et `sequelize.sync({ alter: true })` **interdits en prod** — drop/alter non prévisibles
- Migrations destructives : déployer en 2 étapes (ajouter la nouvelle colonne, migrer les données, supprimer l'ancienne)

## §9 — Background jobs & async

- **Déléguer hors hot path** : mutations lourdes → BullMQ / Inngest / Trigger.dev
- **Idempotence TypeORM** : `repo.upsert({ email: user.email, ... }, ['email'])` — safe si rejoué
- **Idempotence Sequelize** : `Model.findOrCreate({ where: { email }, defaults: { ... } })` ou `Model.upsert({ ... })`
- **Retry / backoff** :
  ```ts
  // BullMQ
  new Queue('jobs', { defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } } })
  ```
- TypeORM dans les workers : `DataSource` singleton réutilisé ; `dataSource.destroy()` dans le signal de shutdown
- Transactions pour les opérations multi-entités :
  ```ts
  await dataSource.transaction(async (manager) => {
    await manager.save(User, user)
    await manager.save(Profile, profile)
  })
  ```

## §10 — Verification & non-regression

- **Critère déterministe** : nombre de queries SQL par endpoint avant/après — mesurer via logger TypeORM counter ou `pg_stat_statements`
- **Baseline JSON** : `baselines/typeorm-queries.json` avec `{ endpoint, queriesCount, avgDurationMs }` — comparer médiane post-fix vs maximum pré-fix
- **Observability** :
  - TypeORM custom logger : implémenter l'interface `Logger` pour exporter des métriques
  - Sentry Performance : query spans automatiques si `@sentry/node` + TypeORM integration
  - OpenTelemetry : `TypeORMInstrumentation` disponible dans `@opentelemetry/instrumentation-typeorm`

## §11 — Checklist self-audit

- **Faux positifs connus** :
  - `synchronize: true` en dev peut masquer des migrations manquantes en prod — toujours vérifier avec `migration:generate`
  - TypeORM `getManyAndCount()` loggue 2 queries (data + count) — ne pas compter comme N+1, c'est 1 opération logique
  - Sequelize `findAndCountAll` idem — 2 queries attendues
  - Lazy loading désactivé (`{ lazy: true }` absent) ne signifie pas que toutes les relations sont eager — `relations:[]` absent = relations non chargées
- **Gaps candidats** :
  - TypeORM "subscribers" (entity hooks) peuvent déclencher des queries supplémentaires silencieuses — non couvert
  - Sequelize `beforeCreate` / `afterCreate` hooks idem
  - Multi-tenancy TypeORM avec `@EventSubscriber` pour injecter un filtre tenant global
  - Sequelize `defaultScope` security pattern non documenté en détail
- **Commandes grep utiles** :
  ```bash
  grep -rn "@OneToMany\|@ManyToOne\|@ManyToMany" src/ | grep "lazy.*true"  # lazy relations
  grep -rn "repo\.find\b\|findAll\b" src/ | grep -v "where:"               # sans filtre tenant
  grep -rn "synchronize.*true" src/                                         # interdit en prod
  grep -rn "\.createQueryBuilder\b" src/ | grep -v "where\|setParameter"   # QB sans paramètre
  ```
