# sc-python

*Knowledge provider pour les stacks Python (Django, FastAPI, Flask, Celery, DRF) : détection de stack, audit, modernisation et enseignement par pivots.*

Détecte la stack du projet depuis ses manifestes Python et charge à la demande les pivots applicables. Les pivots perf/data alimentent `web-optimize` / `data-optimize` (plugin `overcode`).

## Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `sniff` | `/sc-python:sniff` | Détecte la stack depuis `requirements.txt`, `pyproject.toml`, `setup.py`, installe/met à jour uniquement les règles pertinentes |
| `audit` | `/sc-python:audit` | Détecte la stack via sniff puis invoque `aidd-dev:04-audit` (`code-quality`) avec les pivots applicables ; le rapport AIDD reste autoritatif |
| `improve` | `/sc-python:improve` | Analyse le code — écarts d'idiomes pythoniques, opportunités de design patterns, plan d'amélioration |
| `legacy` | `/sc-python:legacy` | Scanne le code pour patterns dépréciés / spécifiques à une version, propose une migration |
| `log-analysis` | `/sc-python:log-analysis` | Analyse les logs d'application Python (local, Docker, prod SSH) — tail, parse-errors, search, summarize |
| `teach` | `/sc-python:teach` | Enseigne les fonctionnalités du langage, idiomes pythoniques, patterns async et idiomes de framework |
| `cd` | `/sc-python:cd local\|server\|automata` | Réconcilie local et production sans convertir le gestionnaire : uv, Poetry ou Pipenv sont conservés ; un projet requirements-only demande un arbitrage. SQL distingue migrations et transfert de données. |

## Pivots disponibles

### Perf pivots — installés par `sniff`, consommés par `/web-optimize`

| Signal de détection | Pivot installé |
|---|---|
| `django` | `perf-pivots-django.md` |
| `djangorestframework` | `perf-pivots-drf.md` |
| `celery` | `perf-pivots-celery.md` |
| `fastapi` | `perf-pivots-fastapi.md` |
| `httpx` | `perf-pivots-httpx.md` |
| `flask` | — gap (pas de pivot dans cette version) |

### Data pivots — installés par `sniff`, consommés par `/data-optimize`

| Signal de détection | Pivot installé |
|---|---|
| `django` (sans sqlalchemy) | `data-pivots-django-orm.md` |
| `sqlalchemy` | `data-pivots-sqlalchemy.md` |
| `datasets` (HuggingFace) | `data-pivots-datasets.md` |

### Capability pivots — chargés à l'audit, non installés sur disque

| Signal de détection | Pivot |
|---|---|
| Tout projet Python | `python/idioms.md` |
| `spacy` | `python/spacy.md` |

### Résumé

| Type | Où ça vit | Qui le charge | Quand |
|---|---|---|---|
| Capability pivot | Plugin uniquement | Claude Code (automatique, via `paths:`) | À chaque édition de fichier matchant |
| Perf / data pivot | `.claude/rules/07-quality/` | `web-optimize` / `data-optimize` (explicite) | Au lancement du skill |

## CD multi-cibles

`sc-python:cd` conserve uv, Poetry, Pipenv ou l'invocation Python déjà choisie et l'utilise pour des cibles nommées `server` ou `automata`. Les migrations restent séparées des lignes métier et des médias. Chaque production possède sa base et son stockage ; un staging peut être un miroir local seulement lorsque l'inventaire et la reprise sont prouvés.

## Licence

MIT — voir [LICENSE](../../LICENSE).
