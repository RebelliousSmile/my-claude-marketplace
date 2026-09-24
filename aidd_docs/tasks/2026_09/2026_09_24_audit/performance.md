# Codebase Audit: plugins/design — performance

Le coût est dominé par Playwright : navigations, contextes et `evaluate` répétés par cible et par breakpoint, avec des attentes fixes. Constats statiques, aucun temps mesuré.

- **Date**: 2026_09_24
- **Scope**: `plugins/design/` (code suivi, hors `.venv/` et `fixtures/`)
- **Health**: good
- **Findings**: 0 critical, 4 warning, 3 minor

## Findings

| Sev | Category | Location | Issue | Suggested fix | Effort |
| --- | -------- | -------- | ----- | ------------- | ------ |
| 🟡 | performance | `plugins/design/adapters/measure/measure.py:676` | Ownership : un `scope.evaluate(_OWNERSHIP, target)` par cible (`:672-676`). Chaque appel reparcourt tout le CSSOM (`document.styleSheets`, `:276`) avec `matches()`. Le coût est en O(cibles × règles), plus N allers-retours IPC, le tout multiplié par surfaces × breakpoints. | Un seul `evaluate` pour toutes les cibles : un seul parcours du CSSOM, puis un index par cible. | M |
| 🟡 | performance | `plugins/design/adapters/measure/measure.py:636-660` | Pour chaque breakpoint × surface : un nouveau contexte, un `goto`, le hook d'auth rejoué (login + `wait_for_url`), et des attentes fixes de 750 ms et 300 ms. | Se connecter une fois par surface puis réutiliser `ctx.storage_state()`, ou garder une seule page et appeler `set_viewport_size`. | M |
| 🟡 | performance | `plugins/design/adapters/measure/measure.py:698-716` | Par breakpoint : un nouveau contexte, deux `goto` en `networkidle`, et des `wait_for_timeout` fixes (400 ms et 300 ms). Côté maquette, le rechargement est justifié (`_ISOLATE_FRAME` supprime les frames, `:310`). Côté implémentation, il ne l'est pas. | Côté implémentation : réutiliser la page et appeler `set_viewport_size` (sauf si un layout JS ne lit le viewport qu'au chargement). Remplacer les timeouts fixes par `wait_for_function`. | M |
| 🟡 | performance | `plugins/design/tools/run-gates.py:202` | Un processus `node lint-core.mjs` par cible markup (`:198-202`). Chacun relit et reparse les artefacts du contrat (`lint-core.mjs:240-243`), car le CLI n'accepte qu'un fichier (`lint-core.mjs:78`). | Rendre `lint-core` multi-fichiers, avec un JSON par fichier en sortie : un seul spawn par run. | M |
| 🟢 | performance | `plugins/design/adapters/measure/screenshot.py:49-78` | Passe séparée qui relance Chromium et renavigue sur les mêmes URL et breakpoints que `measure.py`, avec des attentes fixes (`:66`, `:75`). | Option `--shots <dir>` dans la boucle de `measure.py`, qui capture pendant que la page est déjà chargée. | M |
| 🟢 | performance | `plugins/design/adapters/measure/config-gen.py:348-354` | Boucle sélecteurs × classes, avec un `re.search` sur un motif f-string recompilé à chaque classe. Au-delà d'environ 512 motifs, le cache `re` sature, ce qui arrive sur un gros CSS de thème. | Un `re.findall(r"\.([\w-]+)")` par sélecteur, puis une intersection d'ensembles. | S |
| 🟢 | performance | `plugins/design/adapters/wireframes/render-check.py:21-23` | Le lint statique est lancé dans un nouvel interpréteur Python au lieu d'un import. | Importer le module `wireframes-lint` via `importlib`. Gain marginal. | S |

## Top actions

1. Regrouper `_OWNERSHIP` en un seul `evaluate`, avec un seul parcours du CSSOM (ligne 1).
2. Réutiliser le contexte ou le `storage_state` par surface, et remplacer les `wait_for_timeout` fixes par des attentes conditionnelles (lignes 2 et 3). Les attentes fixes sont aussi une source de flakiness.
3. Rendre `lint-core.mjs` multi-fichiers pour n'avoir qu'un seul `node` par run de gates (ligne 4).

## Coverage

- **Scanned**: performance, par heuristiques statiques sur les boucles navigateur, les sous-processus, les `evaluate` et les regex.
- **Skipped**: pas de profiler, donc heuristiques statiques seulement : aucun temps d'exécution n'est mesuré ni affirmé. Pas de bundle à analyser (pas d'app front).
