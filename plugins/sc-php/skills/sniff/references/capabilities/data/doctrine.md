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

## §3 — Real-time (contrat data-optimize)

- **N/A** — Doctrine est un ORM request/response synchrone, sans support natif des subscriptions ou streams
- Pour du real-time avec Symfony : utiliser **Symfony Mercure** (Server-Sent Events) ou **API Platform** avec Mercure intégré ; Doctrine reste l'ORM pour les lectures/écritures DB classiques
- Les Doctrine events (`postPersist`, `postUpdate`) peuvent déclencher un broadcast Mercure mais ce n'est pas du real-time ORM natif

## §6 — Quota & cost (contrat data-optimize)

- PostgreSQL/MySQL auto-hébergé : pas de facturation par query ; le coût est CPU/IO serveur
- **Blackfire.io** pour profiling APM complet : timeline, query breakdown, comparaison entre versions
- **`pg_stat_statements`** (PostgreSQL) : `SELECT query, calls, total_exec_time FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 20` pour identifier les requêtes les plus coûteuses
- **Symfony Profiler → panel Doctrine** : query count, temps d'hydratation, duplicates — accessible via `/_profiler` en dev
- `doctrine.dbal.logging: false` en prod OBLIGATOIRE (logging = overhead + mémoire pour chaque requête)

## §7 — Security (contrat data-optimize)

- QueryBuilder fluide pour conditions dynamiques (filters search)
- DQL string pour requêtes complexes mais stables (rapport, dashboard)
- `NativeQuery` + `ResultSetMapping` quand SQL spécifique BDD (CTE Postgres, MATCH AGAINST MySQL)
- **DQL paramétrique toujours** : `->setParameter('userId', $userId)` — JAMAIS de concaténation string en DQL ou SQL natif
- **Doctrine Filters** pour row-level security (soft delete, multi-tenant) :
  ```php
  class TenantFilter extends SQLFilter {
      public function addFilterConstraint(ClassMetadata $meta, $alias): string {
          return "$alias.tenant_id = " . $this->getParameter('tenant_id');
      }
  }
  ```
- Scope obligatoire par userId/tenantId : `->where('e.userId = :userId')->setParameter('userId', $this->security->getUser()->getId())`

## §9 — Background jobs (contrat data-optimize)

- Doctrine dans les jobs Symfony Messenger : toujours `EntityManager::clear()` après chaque batch pour éviter la saturation mémoire de l'UnitOfWork
- **Symfony Messenger** : `$this->bus->dispatch(new ProcessImportMessage($data))` — le handler implémente `MessageHandlerInterface`
- Idempotence : utiliser `INSERT ... ON CONFLICT DO NOTHING` via NativeQuery ou `updateOrCreate` équivalent DQL
- Retry policy dans `messenger.yaml` :
  ```yaml
  framework:
    messenger:
      transports:
        async:
          retry_strategy:
            max_retries: 3
            delay: 1000
            multiplier: 2
  ```
- `flush()` par batch (tous les 100 items) en import, jamais flush par insert

## §10 — Verification (contrat data-optimize)

- Critère déterministe : query count via **Symfony Profiler** (`/_profiler` → Doctrine panel) — documenter la baseline avant fix
- **`pg_stat_statements`** pour baseline en production : compter les `calls` d'une requête problématique avant/après fix
- Médiane post-fix via Profiler Symfony : comparer query count et temps d'hydratation avec la baseline
- Test de non-régression : `$this->assertCount(N, $this->getQueryLog())` en test fonctionnel Symfony (via `DoctrineExtension`)

## §11 — Self-audit (contrat data-optimize)

- `#[HasLifecycleCallbacks]` + `#[PrePersist]` → coût caché à chaque save
- Préférer des event subscribers découplés (`Doctrine\Bundle\DoctrineBundle\EventSubscriber\*`) pour visibilité
- **Faux positifs** : `NativeQuery` est valide pour les cas SQL spécifiques BDD — ne pas signaler comme dette technique sans contexte
- **Gaps candidats** : patterns d'invalidation du Doctrine Cache (`query cache`, `result cache`) non documentés → stale data silencieux après flush/update
