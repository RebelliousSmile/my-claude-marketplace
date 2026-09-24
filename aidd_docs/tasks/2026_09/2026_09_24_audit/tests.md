# Codebase Audit: plugins/design — tests

Les chemins de gel et de génération (`contrast.py`, `generate.py`, `migrate-contract.py`) n'ont aucun test. Les suites design ne tournent ni en CI ni sous `pnpm test`, bloqué en amont.

- **Date**: 2026_09_24
- **Scope**: `plugins/design/` + évals `tools/eval/design-*.mjs`, `sc-php-fse-behave.mjs`, `.github/workflows/test.yml`
- **Health**: fair
- **Findings**: 0 critical, 9 warning, 1 minor

Aucun 🔴 : une absence de test est une dette, pas une correction cassée constatée.

## Findings

| Sev | Category | Location | Issue | Suggested fix | Effort |
| --- | -------- | -------- | ----- | ------------- | ------ |
| 🟡 | tests | `.github/workflows/test.yml:13-20` | La CI lance seulement consistency, harness, coverage et selftest. Elle ne lance aucune éval design, aucun pytest ni aucun selftest bash : une régression design passe au vert sur push et PR | Ajouter un job design : setup-python, `requirements.txt` + pytest, puis `design-behave`, `design-harness`, `design-wireframes`, `sc-php-fse-behave` | M |
| 🟡 | tests | `package.json:7` | Les 4 évals design suivent `debrief-contract` (rouge) dans une chaîne `&&`, donc `pnpm test` ne les atteint jamais. Seul `sc-php-fse-behave.mjs:95` lance pytest, et uniquement sur `adapters/measure/tests` : `adapters/wireframes/tests` (`test_geometry.py`, `test_render_check.py`) n'a aucun lanceur | Script `test:design` indépendant de la chaîne (pytest sur `adapters/*/tests` + 4 évals), appelé par `test` et par la CI | S |
| 🟡 | tests | `plugins/design/adapters/a11y/contrast.py:1` | Aucun test, alors que c'est un gate de gel (`skills/adjust/actions/02-freeze.md:165`, exit 3). Rien ne vérifie le calcul WCAG par thème | pytest : paires fg×bg connues, multi-thème, exit 3 sans paire, `--allow-unpaired` | M |
| 🟡 | tests | `plugins/design/tools/generate.py:1` | Aucun test n'exécute ce script. `harness-selftest.sh:223` vérifie seulement que le message d'erreur cite son nom. Or sa sortie (adaptateur de stylesheet) est consommée par `harness.py:661-664` | Fixture contrat 2.x → snapshot de la sortie | M |
| 🟡 | tests | `plugins/design/tools/migrate-contract.py:1` | Même situation : seul le nom est vérifié (`harness-selftest.sh:225`), la migration 1.x → 2.x n'est jamais exécutée | Fixture 1.x → migration → `release.json` validé contre le schéma | M |
| 🟡 | tests | `plugins/design/adapters/measure/tests/test_cascade_ownership.py:7` | `playwright` est importé au niveau du module et Chromium est lancé sans garde (`:91`, `:111`). Sans navigateur, on obtient une erreur de collecte au lieu d'un skip. Même motif dans `test_per_target_props.py:15`, qui lance `measure.py` avec navigateur. `adapters/wireframes/tests/test_render_check.py:13`, lui, a une garde | `pytest.importorskip("playwright")` + marker `browser` avec skip si Chromium est absent | S |
| 🟡 | tests | `tools/eval/design-behave.mjs:97` | La garde `'renvoie à\n\`adjust\`'` dépend du retour à la ligne de `05-fidelity-gate.md` : un simple reflow la casse sans changement de sens. Toutes les gardes de prose (`:77-103`) font un `includes` brut | Normaliser les espaces (`.replace(/\s+/g,' ')`) des deux côtés avant `includes` | S |
| 🟡 | tests | `tools/eval/design-behave.mjs:29-51` | Le verdict « comportemental » relit le `## Results log` markdown (`**N/N PASS**` saisi à la main). Il contrôle la cohérence d'un journal, pas un comportement | Le nommer contrôle structurel. La preuve comportementale reste les spawns `run-gates` (`:116-278`) | S |
| 🟡 | tests | `plugins/design/adapters/measure/pixeldiff.py:1` | `pixeldiff.py` et `screenshot.py` : aucune référence dans les tests, les selftests ou `tools/eval` | pixeldiff : 2 PNG fixtures (identiques, diff connu). screenshot : derrière la garde navigateur | S |
| 🟢 | tests | `tools/eval/design-behave.mjs:116` | `spawnSync('python3', …)` est codé en dur (`:116`, `:137`, `:170`). Sous Windows, `python3` peut résoudre l'alias Store, d'où un faux rouge. `sc-php-fse-behave.mjs:93`, lui, choisit selon la plateforme | Variable `DESIGN_PYTHON` ou même choix par plateforme | S |

Chromium absent : `test_render_check.py` (5 tests) est toujours skippé, en local comme en CI, et `wireframes-browser-selftest.sh` n'a aucun appelant. `render-check.py` n'a donc aucune preuve navigateur. Ce point est couvert par le job CI de la ligne 1 (installer Chromium, exporter `WIREFRAMES_CHROMIUM`).

## Top actions

1. Créer `test:design` (pytest `adapters/*/tests` + 4 évals), indépendant de `debrief-contract`, et le brancher en CI (lignes 1-2) → `aidd-dev:02-implement` sur un plan court.
2. Écrire les tests de `contrast.py`, `generate.py`, `migrate-contract.py`, puis `pixeldiff.py` (lignes 3-5, 9) → skill test.
3. Gardes navigateur pytest et normalisation des espaces dans `design-behave.mjs` (lignes 6-7).

## Coverage

- **Scanned**: tests.
  - Correspondance module → test (non testés : `contrast.py`, `generate.py`, `migrate-contract.py`, `pixeldiff.py`, `screenshot.py`, `wireframes-browser-selftest.sh`).
  - pytest (Python système 3.13.14, pytest 9.0.2) sur `adapters/measure/tests` + `adapters/wireframes/tests` : **42 passed, 5 skipped** (skips motivés, `WIREFRAMES_CHROMIUM` absent). Aucun `xfail`.
  - pytest-cov lancé une fois hors dépôt (in-process seulement, sous-processus non comptés) : TOTAL 20 %, `config-gen.py` 32 %, `measure.py` 35 %, `render-check.py` 17 %. Chiffres sous-estimés, les tests appelant surtout les scripts en sous-processus.
- **Skipped**: aucune couverture des sous-processus (pas de `coverage` configuré en mode `subprocess`). pytest absent du `.venv` du plugin : voir `dependencies.md`.
