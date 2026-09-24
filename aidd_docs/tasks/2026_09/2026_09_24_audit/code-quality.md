# Codebase Audit: plugins/design — code-quality

Trois faux verts de gate, reproduits en exécution : alpha ignoré au contraste, contrat illisible lu comme vide, `var()` avec fallback non vérifié. Le contrat « exit 2 = entrée invalide » n'est pas tenu partout, et des helpers sont recopiés entre les scripts.

- **Date**: 2026_09_24
- **Scope**: `plugins/design/` (code suivi, hors `.venv/` et `fixtures/`)
- **Health**: fair
- **Findings**: 3 critical, 10 warning, 2 minor

## Findings

| Sev | Category | Location | Issue | Suggested fix | Effort |
| --- | -------- | -------- | ----- | ------------- | ------ |
| 🔴 | code-quality | `plugins/design/adapters/a11y/contrast.py:120` | `to_rgb` ignore l'alpha des hex à 8 chiffres (« alpha, if any, ignored »). Résultat : `#00000020` (noir à 12 %) sur blanc donne 21:1 et passe AA, alors que le rendu échoue. C'est un faux vert au gate de gel | Alpha-blend sur le fond avant de calculer la luminance, ou exit 2 si alpha < 1 ; ajouter le cas au test | S |
| 🔴 | code-quality | `plugins/design/tools/status.py:52-58` | `_read_json` renvoie `None` sur `OSError` ou `ValueError`. Un `components.json` corrompu devient `{}` (`:95`) et `check_states` renvoie `allPass: true`, verdict ensuite recopié dans `release.json` au gel. Reproduit avec `{broken` | Distinguer absent et illisible : un fichier présent mais illisible → exit 2 | S |
| 🔴 | code-quality | `plugins/design/skills/enforce/adapters/lint-core.mjs:408` | La règle `token-reference` `/var\((--[\w-]+)\)/g` exige `)` juste après le nom. `var(--typo, #000)` et `var( --x )` échappent donc à la vérification. Même bug dans la copie dual-host `fixtures/dual-host/design/lint/lint-core.mjs:408` | `/var\(\s*(--[\w-]+)\s*[,)]/g` dans les deux copies, avec un cas au selftest | S |
| 🟡 | code-quality | `plugins/design/tools/migrate-contract.py:332-340` | `backup.mkdir(exist_ok=True)` + `copy2` écrasent une sauvegarde `.contract-1x` existante. Les écritures ne sont pas atomiques et `release.json` passe en dernier. Si une écriture échoue avant `release.json`, la relance (garde `:245` non déclenchée) sauvegarde les fichiers déjà migrés par-dessus les originaux 1.x, qui sont perdus | Refuser si la sauvegarde existe (exit 2) ; écriture atomique (tmp + `os.replace`) | S |
| 🟡 | code-quality | `plugins/design/adapters/measure/measure.py:1058` | Chargement de la config non protégé, ici et dans `screenshot.py:92`. Un fichier absent, du JSON invalide ou une clé manquante donnent une traceback et exit 1, le code d'une violation. Cela contredit `measure.py:807` (« must not exit 1 ») | `try/except (OSError, ValueError, KeyError)` → message + exit 2 ; valider `targets`/`breakpoints` en amont | S |
| 🟡 | code-quality | `plugins/design/adapters/measure/config-gen.py:462-464` | La forme des JSON n'est pas validée (et `:503-517`). Avec `components.json = []`, on obtient une `AttributeError` et exit 1, code que `--check` réserve aux défauts (`:488`) | Garde `isinstance(dict)` qui lève `GateError` | S |
| 🟡 | code-quality | `plugins/design/tools/run-gates.py:77-94` | Trois mécanismes d'erreur coexistent (`abort()`+`GateError`, `fail()` qui renvoie un int, `raise SystemExit(fail())`). `read_json` n'attrape que `FileNotFoundError` et `JSONDecodeError` : un fichier non-UTF-8 ou un refus d'accès donne une traceback et exit 1 | Un seul chemin `raise abort(...)`, en attrapant `(OSError, ValueError)` | S |
| 🟡 | code-quality | `plugins/design/adapters/measure/screenshot.py:57-75` | `goto(cfg["reference_url"])` est appelé sans `_resolve_url`, alors que `measure.py:313-323` et `:406` acceptent des chemins relatifs dans la même config. Le pilotage `setViewport`/`setPage` est aussi recopié | Extraire `_resolve_url` et `_prepare_mockup` dans un module commun à `measure/` | S |
| 🟡 | code-quality | `plugins/design/adapters/a11y/contrast.py:98-120` | Deux parseurs de couleur divergent : `to_rgb` ne lit que l'hex, alors que `measure.py:474-566` lit aussi `rgb()`, `color(srgb)` et les couleurs nommées. Un token `rgb(...)` fait donc sortir `contrast.py` en exit 2. La résolution d'alias `{a.b}` est codée deux fois, avec des sémantiques différentes (`generate.py:120-137`) | Module partagé pour couleur et alias, importé par contrast, measure et generate | M |
| 🟡 | code-quality | `plugins/design/tools/generate.py:54-93` | `fail`, `shape_of`, `fail_shape` et `sha256` sont recopiés mot pour mot dans `migrate-contract.py:101-147`. Il existe aussi trois `read_json` aux contrats différents (renvoie `None`, renvoie un tuple, lève `SystemExit`) : `run-gates.py:83-94`, `harness.py:44`, `harness-apply.py:20` | `tools/_common.py` (fail, shape, sha256, read_json typé) | M |
| 🟡 | code-quality | `plugins/design/tools/wireframes-handoff.py:29-35` | Le prédicat de gate `green()` et `targets_artifact()` sont copiés à l'identique dans `wireframes-review.py:32-38`, qui risquent donc de diverger. De plus, `atomic_write` existe en 4 copies et le même hash porte 3 noms | `tools/wireframes_common.py` | S |
| 🟡 | code-quality | `plugins/design/tools/harness-runtime-check.mjs:29` | `argv.find(a => !a.startsWith('--'))` : avec `--expect-pages home f.html`, `home` est pris pour le fichier. `harness-analyze.mjs:16-20` gère déjà ce cas, et `valueAfter` est dupliqué | `node:util parseArgs` | S |
| 🟡 | code-quality | `plugins/design/tools/migrate-contract.py:241` | `migrate` fait 105 lignes (validation, construction, rendu, sauvegarde, écriture). Même problème pour `harness.py:592` `resolve_tokens_style` (87 l.) et `measure.py:686` `measure` (86 l., 6 niveaux d'imbrication). `lint-core.mjs:382-477` est un script de 512 lignes au niveau racine, sans fonction, dont les règles ne sont pas testables séparément | Découper (`validate`/`build_release`/`render_report`/`write`), extraire `_diff_rows()`, une fonction par règle de lint | M |
| 🟢 | code-quality | `plugins/design/adapters/measure/measure.py:650` | Nombres magiques : `timeout=20000` apparaît 9 fois, et les `wait_for_timeout(300/400/500/750)` ne sont pas nommés (y compris dans `screenshot.py:60-75` et `render-check.py:42`) | Constantes `NAV_TIMEOUT_MS` et `SETTLE_MS` | S |
| 🟢 | code-quality | `plugins/design/adapters/measure/measure.py:916-918` | `cov["ok"] = True` est assigné deux fois. `scale = 255.0` est identique dans les deux branches (`:526-528`). `COLOR_PROPS` (`:417-420`) contient `borderTopColor` mais ni Right/Bottom/Left, ni `fill`/`stroke`. `if not row.get("prop")` ne peut pas être vrai (`config-gen.py:370`) | Supprimer le code redondant ; compléter `COLOR_PROPS` et ajouter son test | S |

## Top actions

1. Corriger les trois faux verts (lignes 1-3), chacun avec un cas de test. Ce sont des verdicts de gate faux, à traiter en premier (patch design).
2. Tenir partout le contrat « exit 2 = entrée invalide » (lignes 5-7) et protéger la sauvegarde de `migrate-contract` (ligne 4).
3. Factoriser les helpers dupliqués dans deux modules communs (lignes 8-11), puis découper les fonctions longues (ligne 13) → skill refactor.

## Coverage

- **Scanned**: code-quality. Les deux copies de `lint-core.mjs` sont identiques (`diff` vide). Aucune fonction de production morte (grep sur tout le dépôt, `tools/eval` et tests compris). Aucun TODO/FIXME. Aucun `except: pass` sur de la logique. Les lignes 1-3 et 5-6 ont été reproduites en exécution ; les lignes 1-4 ont été relues sur pièce.
- **Skipped**: aucun outil d'analyse de complexité (radon, eslint complexity) : longueurs et imbrications relevées à la main.
