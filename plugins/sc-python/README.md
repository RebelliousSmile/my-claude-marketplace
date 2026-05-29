# sc-python

*Knowledge provider pour les stacks Python (Django, FastAPI, Flask) : détection de stack, audit, modernisation et enseignement par pivots.*

Détecte la stack du projet (manifests Python) et charge à la demande les pivots de capacité applicables. Les pivots perf/data alimentent `web-optimize` / `data-optimize` (plugin `aidd-overlay`).

## Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `sniff` | `/sc-python:sniff` | Détecte la stack depuis `requirements.txt`, `pyproject.toml`, `setup.py`, installe/met à jour uniquement les règles pertinentes |
| `audit` | `/sc-python:audit` | Auditeur qualité Python — détecte la stack via sniff puis délègue la revue avec les pivots applicables |
| `improve` | `/sc-python:improve` | Analyse le code — écarts d'idiomes pythoniques, opportunités de design patterns, plan d'amélioration |
| `legacy` | `/sc-python:legacy` | Scanne le code pour patterns dépréciés / spécifiques à une version, propose une migration |
| `log-analysis` | `/sc-python:log-analysis` | Analyse les logs d'application Python (local, Docker, prod SSH) — tail, parse-errors, search, summarize |
| `teach` | `/sc-python:teach` | Enseigne les fonctionnalités du langage, idiomes pythoniques, patterns async et idiomes de framework |

## Licence

MIT — voir [LICENSE](../../LICENSE).
