# Codebase Audit: plugins/design — security

Outillage CLI local, sans serveur. Les failles relevées sont des frontières d'isolation poreuses face à du contenu écrit par un agent LLM. Aucune n'est exploitable à distance.

- **Date**: 2026_09_24
- **Scope**: `plugins/design/` (code suivi, hors `.venv/` et `fixtures/`)
- **Health**: good
- **Findings**: 0 critical, 4 warning, 4 minor

Modèle de menace : les entrées (configs JSON, CSS, HTML, manifestes) sont des fichiers locaux. Elles viennent d'un développeur ou d'un agent LLM qui a déjà un shell. Aucun finding n'est classé 🔴, faute de frontière de confiance franchie à distance.

## Findings

| Sev | Category | Location | Issue | Suggested fix | Effort |
| --- | -------- | -------- | ----- | ------------- | ------ |
| 🟡 | security | `plugins/design/tools/harness-runtime-check.mjs:131` | Le sandbox `vm` reçoit les intrinsèques de l'hôte (`String, Object, Array, JSON, Error, RegExp…`). `Object.constructor('return process')()` s'échappe vers le `process` de l'hôte. Les scripts exécutés sont du JS écrit par le LLM et injecté par `harness-apply.py:92,116`. | Ne plus passer de constructeurs hôtes, le contexte `vm` a les siens. Ajouter `codeGeneration:{strings:false,wasm:false}`. Pour une isolation réelle : un processus enfant lancé avec `--permission`, ou Chromium. | S |
| 🟡 | security | `plugins/design/tools/generate.py:412` | `target = out_dir / artifact` : `artifact` vient de `policies.json` (`:343`) et n'est pas confiné. Un chemin absolu ou un `../` permet d'écrire n'importe où. `harness.py:646-651` confine pourtant ce même champ en lecture. | `resolve()` puis `relative_to(out_dir.resolve())` avant d'écrire. Même garde dans `check_all` (`:443`). | S |
| 🟡 | security | `plugins/design/adapters/wireframes/render-check.py:33` | Chromium est lancé avec `--no-sandbox` et `--allow-file-access-from-files` sur un HTML qui contient une zone de JS auteur (`wireframes.py:182`). Le JS de la page peut lire des fichiers locaux, et le réseau n'est pas bloqué. | Retirer les deux flags. À défaut, `page.route("**/*")` pour rejeter toute requête autre que le fichier cible et ses assets. | S |
| 🟡 | security | `plugins/design/adapters/wireframes/wireframes.py:180` | `manifest_json` (`:134`, `json.dumps` brut) est inséré dans `<script type="application/json">` sans échapper `<`. Un `title` libre contenant `</script><script>…` sort du bloc et casse le `JSON.parse` de `render-check.py:46`. | Remplacer `<`, `>` et `&` par leurs échappements JSON `<`, `>` et `&`, comme le fait `js_literal` (`harness.py:161`). | S |
| 🟢 | security | `plugins/design/tools/harness-apply.py:105` | `payload.styles` est injecté dans la zone `<style>` sans refuser `</style`. C'est incohérent avec `raw_script` (`:35`) et avec `harness.py:667`. | Même garde regex `</\s*style` avant `replace_zone`. | S |
| 🟢 | security | `plugins/design/tools/generate.py:217` | Les `$value` des tokens (`:217`) et les noms de thème (`:228`) entrent dans le CSS sans validation. `}` et `;` permettent d'injecter des règles, `"` casse `[data-theme="…"]`. | Imposer un slug pour les noms de thème. Refuser `{`, `}`, `;` et `<` dans les valeurs scalaires. | S |
| 🟢 | security | `plugins/design/tools/run-gates.py:256` | `report_path = base / entry["path"]` (`:248`) n'est pas confiné, et le fichier est supprimé avant la commande `pivotReports[].command`. La config peut donc viser n'importe quel fichier. | Confiner le chemin sous `base`. Documenter que la config des gates se traite comme du code. | S |
| 🟢 | security | `plugins/design/adapters/measure/measure.py:653` | `page.evaluate(hook)` exécute le JS d'une variable d'environnement dont le nom est choisi par la config (`auth_hook_env`, `:632`). | Imposer un préfixe au nom de variable (`DESIGN_AUTH_*`). | S |

## Top actions

1. Retirer les intrinsèques hôtes du sandbox `vm` et couper `codeGeneration` (ligne 1). C'est la seule évasion triviale vers l'hôte.
2. Confiner les chemins écrits ou supprimés depuis une config (`generate.py:412`, `run-gates.py:256`) sur le modèle de `harness.py:646` (lignes 2 et 7).
3. Échapper le manifeste JSON et retirer `--allow-file-access-from-files` et `--no-sandbox` (lignes 3 et 4). Un seul patch design, sans skill de handoff.

## Coverage

- **Scanned**: security, en analyse statique. Vérifié sans constat :
  - aucun `shell=True`, `os.system`, `pickle`, `yaml.load`, ni `eval`/`exec` Python ;
  - aucun `new Function` (les `exec` de `lint-core.mjs:450` sont des `RegExp.exec`) ;
  - les sélecteurs passés à `page.evaluate` sont des arguments, sans concaténation (`measure.py:340-349`, `screenshot.py:62-64`) ;
  - l'échappement de `harness.py` est en place (`js_literal`, `html.escape`, garde `</style`) ;
  - les ids du manifeste sont validés en slug (`wireframes.py:64`) ;
  - `rm -rf "$OUT"` est entre guillemets, sur un `mktemp -d` ;
  - aucun secret ; les commandes passent l'argv sous forme de liste partout.
- **Skipped**: aucun outil SAST (bandit, semgrep), revue statique seulement. Les constats de sandbox et d'échappement ont été relus sur pièce : `harness-runtime-check.mjs:124-141`, `wireframes.py:134,180`, `generate.py:410-414`, `render-check.py:33`.
