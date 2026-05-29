# Changelog — sc-python

> Baseline établie le 2026-05-29 à partir de l'état courant ; transitions récentes reprises de l'historique git. Détail antérieur : `git log -- plugins/sc-python`.

## [0.4.9] — 2026-05-29

- Bump de synchronisation — marketplace aidd-overlay alignée sur 0.4.9 ; aucun changement fonctionnel.

## [0.4.8] — 2026-05-29

### Added
- `references/capabilities/perf/drf.md` — pivot perf DRF : N+1 dans les serializers, pagination cursor, `select_related` dans `get_queryset`, JWT vs SessionAuth, throttling, `cache_page` sur ViewSet
- `references/capabilities/perf/celery.md` — pivot perf Celery : `soft_time_limit`/`time_limit`, `acks_late`, retry backoff exponentiel, idempotence, queue routing par priorité, Flower

### Changed
- `01-scan.md` : détection `djangorestframework` → `perf-pivots-drf.md`, `celery` → `perf-pivots-celery.md`
- `01-scan.md` : companions DRF (`drf-spectacular`, `drf-extensions`, `djangorestframework-simplejwt`) et Celery (`django-celery-beat`, `kombu`, `celery[redis]`) ajoutés à la liste de filtrage
- `01-scan.md` : `Pillow` ajouté aux exemples de Bucket A
- `02-install-pivots.md` : entrées DRF et Celery ajoutées

## [0.4.7] — 2026-05-29

- Bump post-session (exécution de `sc-python:improve` sur un projet consommateur).

## [0.4.6] — 2026-05-29

### Added
- `references/capabilities/perf/httpx.md` — pivot perf httpx : AsyncClient singleton, `Limits`/`Timeout`, retry via `tenacity`, `asyncio.gather`, event hooks de logging
- `references/capabilities/data/datasets.md` — pivot data HuggingFace datasets : `streaming=True`, `.map(batched=True)`, `cache_dir`, `select_columns`, `trust_remote_code`
- `references/capabilities/python/spacy.md` — capability pivot spaCy : chargement singleton avec `disable=`, `nlp.pipe()` par batch de langue, `PhraseMatcher`, `EntityRuler`, extensions `Doc.set_extension`

### Changed
- `01-scan.md` : détection `httpx`, `datasets`, `spacy` ajoutée dans Step 4 ; companions mis à jour (`respx`, `huggingface_hub`, `tokenizers`, spaCy language models) ; Bucket A — `spacy`/`datasets` retirés (couverts), `transformers`/`playwright`/`Pillow` ajoutés
- `02-install-pivots.md` : entrées httpx et datasets ajoutées

## [0.4.5] — 2026-05-29

### Changed
- `01-scan.md` : Output template déplacé **avant** le Process (ancrage avant tout traitement)
- `01-scan.md` : `ALL TABLES ARE FORBIDDEN` — interdiction explicite des tables markdown (`| col |`) ET ASCII box-drawing (`┌───┐`)
- `01-scan.md` : noms de sections fixés — interdiction d'inventer des noms alternatifs ; deuxième exemple mis à jour (FastAPI + spaCy + datasets + httpx)

## [0.4.4] — 2026-05-29

### Changed
- `01-scan.md` : bloc DEPRECATED enrichi — nomme explicitement `Skills support:`, `Gaps (no plugin pivot):` et le format plat des pivots comme structures à ne pas reproduire

## [0.4.3] — 2026-05-29

### Changed
- `01-scan.md` Step 1 : ajout de `[project.optional-dependencies.*]` et `[tool.poetry.group.*.dependencies]` — détection via optional-deps spécifiée (plus d'improvisation modèle)
- `01-scan.md` : enforcement header output format (tables markdown interdites, sections obligatoires)
- `01-scan.md` : readiness lines par sous-section (`→ /skill : PRÊT`) remplacent la section `Skills support:` autonome
- `01-scan.md` : closing summary constraint ajouté
- `01-scan.md` : gap buckets A (capability candidates) et B (tooling/infra) avec filtrage des companion packages
- `01-scan.md` : exemple Flask gap ajouté dans le second template

## [0.4.2] — 2026-05-29 (baseline)

Knowledge provider Python (Django, FastAPI, Flask). Skills : `sniff`, `audit`, `improve`, `legacy`, `log-analysis`, `teach`.

### Added
- `improve` : Step 1.5 — chargement des capability pivots pour les anti-patterns spécifiques à la stack.

## [0.4.1]
- `legacy` : ajout de `references/` (patterns dépréciés / spécifiques à une version).

## [0.4.0]
- Alignement sur le modèle sc-php v0.4.0 : sniff à deux niveaux (pivot model), skill `audit` déléguant la revue, evals. Bump 0.3.0 → 0.4.0.

## Antérieur
- Voir `git log -- plugins/sc-python` pour l'historique complet.
