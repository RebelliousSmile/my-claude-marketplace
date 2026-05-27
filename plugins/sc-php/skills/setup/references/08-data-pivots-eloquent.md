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

## §3 — Real-time (contrat data-optimize)

- **N/A** — Eloquent est un ORM request/response synchrone, sans support natif des streams ou subscriptions
- Pour du real-time avec Laravel : utiliser **Laravel Reverb** (WebSocket) ou **Laravel Echo** + **Pusher** côté client ; Eloquent reste l'ORM pour les requêtes DB classiques
- Broadcasting Eloquent : `User::updated()` event → `broadcast(new UserUpdated($user))` mais c'est du broadcasting, pas du real-time ORM

## §6 — Quota & cost (contrat data-optimize)

- MySQL/PostgreSQL auto-hébergé : pas de facturation par query (contrairement aux BaaS comme PlanetScale ou Neon serverless)
- **Laravel Telescope** QueryWatcher en dev : count queries, slow queries, bindings — voir `/telescope/queries`
- **Laravel Debugbar** : query count par request dans la barre dev
- `DB::listen(function ($q) { if ($q->time > 100) Log::warning('Slow query', ['sql' => $q->sql]); })` pour alerter sur les queries lentes > 100ms
- `EXPLAIN SELECT ...` sur les hot paths identifiés ; index manquant = full table scan = coût exponentiel sur croissance des données

## §7 — Security (contrat data-optimize)

- `DB::raw()` / `DB::statement()` pour les CTE, window functions, full-text non-supportés par le QB
- Bindings paramétriques toujours (`DB::select('... ?', [$value])`) — JAMAIS de concaténation string
- **Scope obligatoire par utilisateur** : `Model::where('user_id', Auth::id())` sur toutes les queries d'accès aux données privées
- `$guarded = ['*']` ou `$fillable = []` explicite par défaut ; documenter chaque champ fillable
- **Policies** pour logique d'autorisation complexe ; **GlobalScope** pour multi-tenant (filtre tenant_id automatique)
- `preventLazyLoading()` contribue aussi à la sécurité : évite les accès accidentels aux relations non chargées

## §9 — Background jobs (contrat data-optimize)

- Eloquent dans les jobs : même règles (eager loading, select narrowing) — un job sans eager loading peut générer des milliers de queries
- **Laravel Queues** : `dispatch(new ProcessImport($data))` ; implémenter `ShouldQueue` sur le job
- **Laravel Horizon** en prod pour monitoring : throughput, failed jobs, temps de traitement par queue
- Idempotence : `User::firstOrCreate(['email' => $email])` / `User::updateOrCreate(['id' => $id], $data)` pour jobs rejouables sans duplication
- `retry_after`, `tries`, `backoff` configurés sur chaque job bulk pour résistance aux timeouts DB
- `chunkById(500, fn($users) => ...)` dans les jobs d'import — jamais `User::all()` en mémoire

## §10 — Verification (contrat data-optimize)

- Critère déterministe : `DB::getQueryLog()` (après `DB::enableQueryLog()`) pour compter précisément les queries par request
- Baseline via Laravel Debugbar : query count avant fix documenté
- Médiane post-fix via Debugbar ou Telescope — comparer avec le max pré-fix pour valider le gain
- Test de non-régression N+1 : `Model::preventLazyLoading()` en test env → `LazyLoadingViolationException` si N+1 réintroduit

## §11 — Self-audit

- **Faux positifs** : `withoutEvents()` est valide pour les bulk imports — ne pas l'ajouter aux issues de review sans contexte
- **Gaps candidats** : GlobalScopes = coût caché non documenté dans le codebase (filtre SQL invisible dans le code appelant)
- GlobalScopes non documentés → requêtes silencieusement filtrées → bugs difficiles à diagnostiquer
- `$appends` (accessors) calculés à chaque sérialisation — overhead si collections volumineuses ; utiliser `makeHidden()` ou `setVisible()` en contexte API
