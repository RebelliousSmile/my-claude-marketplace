---
paths:
  - "app/Models/**/*.php"
  - "database/migrations/**/*.php"
  - "database/factories/**/*.php"
  - "app/Http/Controllers/**/*.php"
---

# Data pivots — Eloquent ORM (Laravel)

Stack-specific overrides for data audits when `illuminate/database` is detected. Loaded by `data-optimize`. Concatenate with backend pivots.

## §0 — Pre-flight

- Laravel Debugbar / Telescope en dev → query count par request, lazy loading violations
- `Model::preventLazyLoading()` dans `AppServiceProvider::boot()` (dev/staging) → exception sur N+1, prod : log
- `DB::listen(fn($q) => Log::debug($q->sql, ['time' => $q->time]))` pour audit ponctuel

## §1 — N+1 (LE problème Eloquent)

- `$users = User::all(); foreach ($users as $u) $u->posts;` → N+1 garanti
- **Fix** : `User::with('posts')->get()` ; nested `->with('posts.comments.author')` audité par profondeur
- `withCount('posts')` au lieu de `->posts->count()` (1 query d'agrégation)
- `Model::preventLazyLoading()` activé en dev — refuser tout merge introduisant du lazy

## §2 — Select narrowing

- `User::select('id', 'email')->get()` obligatoire dès qu'on ne consomme pas tous les champs
- `$fillable` ≠ `$hidden` : `$hidden` strip à la sérialisation mais charge depuis DB ; pour vraiment ne pas fetch, `select` explicite
- Casts coûteux (`array`, `encrypted`, `AsCollection`) → ne caster que ce qui est utilisé

## §3 — Pagination

- `paginate(15)` exécute 1 count query + 1 select → OK ; `simplePaginate()` skip le count (mieux sur grosses tables)
- `cursorPaginate()` (Laravel 9+) pour datasets très volumineux : range-based, pas d'offset
- `chunkById()` / `lazy()` pour itération batch (jobs, exports), JAMAIS `all()->each()` sur > 10k rows

## §4 — Indexes

- Migration : `$table->index(['user_id', 'created_at'])` — composite avec ordre du WHERE le plus sélectif d'abord
- `$table->fullText(...)` MySQL 5.7+ pour recherche, sinon migrer vers Meilisearch / Algolia / Typesense via Scout
- Foreign keys → toujours indexées (Laravel le fait via `foreignId()`) ; vérifier les colonnes de jointure custom

## §5 — Connection

- Read replica : `'mysql' => ['read' => [...], 'write' => [...]]` dans `config/database.php`
- `DB::transaction(fn() => ...)` pour mutations multi-tables (atomicité) ; pas pour un seul update

## §6 — Aggregations & sub-queries

- `selectSub`, `withSum`, `withAvg`, `withMax` → 1 query agrégée vs N queries dans la loop
- `whereHas` exécute un EXISTS subquery — préférable à `with(...).filter()` côté PHP

## §7 — Raw queries

- `DB::raw()` / `DB::statement()` pour les CTE, window functions, full-text non-supportés par le QB
- Bindings paramétriques toujours (`DB::select('... ?', [$value])`) — JAMAIS de concaténation string

## §8 — Migrations

- `php artisan migrate --pretend` pour preview du SQL avant deploy
- Migrations destructives (drop column, alter type) → 2 étapes : déploiement compat + migration finale après stabilisation
- `$table->dropColumn(...)` ne récupère pas l'espace InnoDB → `OPTIMIZE TABLE` planifié séparément

## §9 — Scopes & event listeners

- Global scopes (`addGlobalScope`) appliqués à TOUTES queries du model → coût caché ; documenter chaque scope
- Model events (`saving`, `saved`, `deleting`) → 1 event handler avec query interne = N queries en bulk insert
- `Model::withoutEvents(fn() => ...)` pour bulk imports

## §10 — Cache

- `remember($key, $ttl, fn() => User::with(...)->get())` — invalider via model events (`saved`, `deleted`)
- `Cache::flexible()` (Laravel 11+) : stale-while-revalidate, idéal pour hot path
- Tag-based invalidation (Redis only) : `Cache::tags(['users'])->flush()`
