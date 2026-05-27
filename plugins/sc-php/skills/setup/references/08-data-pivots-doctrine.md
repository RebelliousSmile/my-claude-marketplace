---
paths:
  - "src/Entity/**/*.php"
  - "src/Repository/**/*.php"
  - "config/packages/doctrine.yaml"
  - "**/Doctrine/**/*.php"
---

# Data pivots — Doctrine ORM (Symfony / Laravel)

Stack-specific overrides for data audits when `doctrine/orm` is detected. Loaded by `data-optimize`. Concatenate with backend pivots.

## §0 — Pre-flight

- Symfony Profiler → Doctrine panel : query count, duplicates, hydration time
- `doctrine.dbal.logging: true` (dev) → log des requêtes ; **désactiver** en prod
- `bin/console doctrine:cache:clear-metadata --env=prod` après deploy

## §1 — N+1 (LE problème Doctrine)

- `$users = $repo->findAll(); foreach ($users as $u) $u->getPosts();` → N+1 (proxies lazy)
- **Fix** : DQL avec `JOIN FETCH` explicite :
  ```php
  $qb->select('u', 'p')->from(User::class, 'u')->leftJoin('u.posts', 'p')->getQuery()
  ```
- Sans `JOIN FETCH`, les relations sont des Doctrine proxies → 1 query par accès `.getPosts()`
- `fetchEagerly: true` (PHP 8 attribute) pour relations toujours nécessaires — à utiliser avec parcimonie (charge tout, partout)

## §2 — Select narrowing & hydration mode

- DQL `SELECT u.id, u.email FROM User u` → array hydration (`Query::HYDRATE_ARRAY`) → 2-5× plus rapide
- Pour read-only API responses : array ou scalar hydration ; objets Doctrine seulement si on doit muter
- `Paginator::HYDRATION_MODE_ARRAY` pour pagination read-only

## §3 — Pagination

- `Doctrine\ORM\Tools\Pagination\Paginator` exécute 3 queries (count, ids, full) — auditer le besoin
- Pour grosses tables : `setMaxResults(N)` + cursor (`WHERE id > :lastId`) plutôt qu'offset

## §4 — Indexes

- `#[ORM\Index(columns: ['user_id', 'created_at'])]` sur l'entité — ordre = sélectivité du WHERE
- `bin/console doctrine:schema:update --dump-sql` avant migration → vérifier qu'aucun index ne manque
- Foreign keys auto-indexées par Doctrine (sauf override)

## §5 — Connection

- `doctrine.dbal.connections.default.options.persistent: true` peut aider mais incompatible avec PgBouncer
- Read/write split via `connections` distinctes — gérer côté repository/service

## §6 — Identity Map & UnitOfWork

- `EntityManager::clear()` après bulk imports (sinon mémoire explose : UoW garde tous les objets)
- `iterate()` sur grosses queries : `$query->toIterable()` (Doctrine 2.8+) avec `clear()` périodique
- `flush()` par batch (e.g. tous les 100 inserts) en bulk import, pas un flush par insert

## §7 — DQL vs QueryBuilder vs native SQL

- QueryBuilder fluide pour conditions dynamiques (filters search)
- DQL string pour requêtes complexes mais stables (rapport, dashboard)
- `NativeQuery` + `ResultSetMapping` quand SQL spécifique BDD (CTE Postgres, MATCH AGAINST MySQL)

## §8 — Migrations

- `doctrine-migrations` : `bin/console doctrine:migrations:diff` puis review du SQL avant `migrate`
- Migrations destructives → 2 étapes (compat first, drop later)
- `bin/console doctrine:migrations:execute --up VERSION` pour deploy ciblé

## §9 — Event listeners & filters

- Doctrine event listeners (`postLoad`, `prePersist`) : éviter les queries internes → re-trigger N+1
- SQLFilters globaux (soft delete, multi-tenancy) → ajoutés à TOUTES queries ; auditer leur coût

## §10 — Cache

- **Metadata cache** : `cache_pool: doctrine.system_cache_pool` (Redis prod) — quasi-obligatoire
- **Query cache** : `setQueryCacheProfile()` pour les DQL répétés
- **Result cache** : `->enableResultCache(3600, 'cache_key')` pour mémoriser le résultat exécuté
- Invalidation : `EntityManager::flush()` n'invalide PAS le result cache automatiquement → clear explicite par tag

## §11 — Lifecycle callbacks

- `#[HasLifecycleCallbacks]` + `#[PrePersist]` → coût caché à chaque save
- Préférer des event subscribers découplés (`Doctrine\Bundle\DoctrineBundle\EventSubscriber\*`) pour visibilité
