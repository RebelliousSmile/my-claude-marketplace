---
paths:
  - "**/models.py"
  - "**/managers.py"
  - "**/views.py"
  - "**/migrations/*.py"
---

# Data pivots — Django ORM

Stack-specific overrides for data audits when Django ORM is detected. Loaded by `data-optimize`. Concatenate with Django web pivots.

## §0 — Pre-flight

- Django Debug Toolbar (dev) → query count + duplicates par view
- `django-silk` profiler en staging — slow query report
- `connection.queries` (avec `DEBUG=True`) pour inspection ponctuelle ; jamais en prod

## §1 — N+1 (LE problème Django)

- `for post in Post.objects.all(): post.author.name` → 1 query + N queries (1 par author) = N+1
- **Fix select_related** (FK / OneToOne) : `Post.objects.select_related('author')` → 1 query avec JOIN
- **Fix prefetch_related** (ManyToMany / reverse FK) : `Post.objects.prefetch_related('tags')` → 2 queries (posts + tags in [ids])
- Nested : `Post.objects.select_related('author').prefetch_related('comments__author')` — chaque niveau audité
- `Prefetch('comments', queryset=Comment.objects.select_related('author'))` pour customiser le sous-queryset

## §2 — Select narrowing

- `Post.objects.only('id', 'title')` → SELECT explicite (1 query par champ manquant accédé après → defer trap)
- `Post.objects.defer('content', 'metadata')` → exclude des champs lourds
- `.values()` / `.values_list()` retournent des dicts/tuples plats → pas de model overhead, 2-3× plus rapide pour read-only

## §3 — Pagination

- Django `Paginator` exécute 1 count + 1 slice → 2 queries
- Pour grosses tables : `Paginator` lent (count plein), préférer cursor-based via `id__gt=last_id` + `limit`
- `.iterator(chunk_size=2000)` pour traverser sans charger tout en mémoire (jobs, exports)

## §4 — Indexes

- `class Meta: indexes = [models.Index(fields=['user', '-created_at'])]` — composite, ordre = sélectivité
- `db_index=True` sur les champs filtrés/triés fréquemment
- Migrations : `python manage.py makemigrations` puis review du SQL via `sqlmigrate app NNNN`

## §5 — Connection / transactions

- `ATOMIC_REQUESTS=True` (settings) → wrap chaque view en transaction (atomicité, mais coût lock plus long)
- `@transaction.atomic` decorator par view ou bloc — préférable au global
- `transaction.on_commit(callback)` pour différer side-effects (email, webhook) jusqu'au commit réussi

## §6 — Aggregations

- `Post.objects.aggregate(total=Count('id'), avg_likes=Avg('likes'))` → 1 query d'agrégation
- `Post.objects.annotate(comment_count=Count('comments'))` → ajout d'un champ calculé par row (sub-query SQL)
- Bannir `len(qs)` (force evaluation) si seul le count importe → utiliser `qs.count()` (1 query SQL count)

## §7 — Raw queries

- `Model.objects.raw('SELECT ... FROM ...')` pour SQL complexe ; bindings paramétriques toujours
- `with connection.cursor() as cur: cur.execute(...)` pour SQL ne retournant pas un model
- `Prefetch` + `Subquery` / `OuterRef` permettent souvent d'éviter le raw

## §8 — Migrations

- `RunPython` pour data migrations : auditer le coût (peut bloquer prod si > 1M rows)
- `python manage.py migrate --plan` pour preview
- `AddIndex` non-concurrent lock la table → `AddIndexConcurrently` (Django 4.0+) pour Postgres prod

## §9 — Signals

- `post_save`, `post_delete` signals → coût caché à chaque save ; tester en isolation
- `bulk_create([...], ignore_conflicts=True)` skip signals → 1000× plus rapide pour imports
- `update()` (queryset) skip aussi signals + save() → utiliser quand pas de side-effect attendu

## §10 — Caching

- `cache.get_or_set(key, callable, timeout)` pour mémoriser queries hot path
- Per-site cache via middleware (`UpdateCacheMiddleware` + `FetchFromCacheMiddleware`)
- Invalidation : signals `post_save` qui clear les keys liées (dépendance manuelle, fragile à grande échelle)

## §11 — Async ORM (Django 4.1+)

- `await Post.objects.aget(id=1)`, `await Post.objects.acreate(...)` pour endpoints async
- `async for post in Post.objects.all():` pour itération
- Mixage sync/async dans async view = thread-unsafe → utiliser les variantes `a*`
