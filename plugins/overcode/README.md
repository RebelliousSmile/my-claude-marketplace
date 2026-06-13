# overcode

*Socle commun de la marketplace : workflows projet-agnostiques qui étendent le framework [AIDD](https://github.com/ai-driven-dev/aidd-framework).*

Plugin principal, installé globalement (`recommended`). Il ne cible pas une stack : il ajoute des workflows transversaux de maintenance, d'analyse, de documentation et de planification, plus des chaînes d'alias pour enchaîner des skills AIDD.

## Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `alias` | `/alias` | Enchaîne des skills AIDD en une commande (plan→challenge, implement→review…) ou réécrit un prompt |
| `harvest` | `/harvest` | Maintenance globale — réconcilie le tracker, extrait les décisions, purge l'éphémère |
| `reconcile-normative` | `/reconcile-normative` | Réconcilie le normatif entre archives, mémoire et règles actives (doublons, contradictions, obsolètes) |
| `taste` | `/taste [fichier]` | Détecte les contenus obsolètes — assess-doc (claims vs codebase) ou assess-code (imports, symboles) |
| `foresee` | `/foresee <cible> [--depth N]` | Analyse prospective docs/code/dépendances — problèmes à moyen terme |
| `dig` | `/dig` | Quiz interactif 5 questions sur le codebase ou la memory bank — noté /20 |
| `web-optimize` | `/web-optimize` | Audit perf web (LCP, CLS, INP, bundle, N+1) selon une checklist stack-aware, roadmap priorisée |
| `data-optimize` | `/data-optimize` | Audit perf de la couche données (N+1, index, pagination, cache), stack-aware |
| `readme` | `/readme` | Rédige ou met à jour un README.md (write depuis zéro, update par section) |
| `changelog` | `/changelog` | Génère/met à jour CHANGELOG.md depuis git (format Keep a Changelog) |
| `decompose` | `/decompose` | Décompose un objectif en graphe de dépendances (méthode Mikado) |
| `journey` | `/journey` | Exécute un parcours utilisateur depuis une issue GitHub/GitLab (résultats Playwright) |
| `status` | `/status` | Santé projet — synthèse/export de la mémoire, rapport de santé, snapshot |

Chaînes d'alias fournies (via `alias`) : `rechallenge`, `afterplan`, `endtask`, `endplan`, `bump-plugin`, `previously`.

## Licence

MIT — voir [LICENSE](../../LICENSE).
