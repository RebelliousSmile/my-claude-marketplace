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

- TypeORM : `logging: ['query', 'error', 'warn']` en dev ; option `maxQueryExecutionTime: 200` pour log les requêtes lentes
- Sequelize : `logging: console.log` + `benchmark: true` pour durée par requête

## §1 — N+1 (CRITIQUE TypeORM)

- TypeORM **lazy loading** (`@OneToMany(() => Post, p => p.user, { lazy: true })`) génère 1 query par accès `.posts` → N+1 garanti
- **Fix** :
  - `repo.find({ relations: ['posts'] })` (eager via API)
  - QueryBuilder : `.leftJoinAndSelect('user.posts', 'post')` explicite
  - Bannir `{ lazy: true }` sauf usage très ciblé documenté
- Sequelize : `include: [{ model: Post }]` obligatoire ; `as: 'alias'` cohérent avec l'association

## §2 — Select narrowing

- TypeORM : `repo.find({ select: ['id', 'email'] })` ou QueryBuilder `.select(['user.id', 'user.email'])`
- Sequelize : `attributes: ['id', 'email']`
- `find()` full entity sans select = red flag pour tables avec colonnes lourdes

## §3 — Pagination

- TypeORM : `take` + `skip` correct sur petits volumes ; `getMany()` vs `getManyAndCount()` (count séparé = 2e query)
- Sequelize : `limit` + `offset` ; `findAndCountAll` exécute 2 queries — utiliser séparément si count est mis en cache

## §4 — Indexes

- TypeORM : `@Index(['field1', 'field2'])` au-dessus de la classe ; `@Index()` sur la colonne
- Sequelize : `indexes: [{ fields: ['email'] }]` dans `Model.init` options
- Auditer la migration SQL générée — synchronize en prod **interdit**

## §5 — Connection pool

- TypeORM DataSource : `extra: { max: 10, idleTimeoutMillis: 30000 }`
- Sequelize : `pool: { max: 10, min: 0, idle: 10000 }`
- Tuning selon `max_connections` Postgres / MySQL et nombre d'instances

## §6 — Repositories & transactions

- TypeORM : `dataSource.transaction(async (manager) => { ... })` — toutes les mutations dans une transaction explicite si > 1 write
- Sequelize : `sequelize.transaction(t => { ... })` + `{ transaction: t }` sur chaque appel
- Sans transaction explicite : rollback impossible en cas d'erreur partielle

## §7 — Query Builder vs Repository

- Repository (`repo.find`) lisible mais limité — passer en QueryBuilder dès qu'il y a des `OR`, des `EXISTS`, des sous-queries
- QueryBuilder permet `getRawAndEntities()` pour récupérer aggregations + entities en 1 query

## §8 — Migrations

- `npm run typeorm migration:run` / `sequelize db:migrate` en CI
- `synchronize: true` (TypeORM) / `sequelize.sync({ alter: true })` interdits en prod
