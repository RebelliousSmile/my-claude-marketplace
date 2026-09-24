# Review: gate de fidélité figé par adjust

- **Verdict**: changes-requested
- **Diff**: `c142b44^...885a59f`
- **Axes run**: code, functional, relevancy
- **Date**: 2026_09_24
- **Findings**: 0 critical, 3 warning, 2 minor

## Phases

### Phase 1 — measure.py lit les props par cible

- [x] Cible avec `props` → une ligne par prop déclarée et par breakpoint, aucune pour la liste globale — `plugins/design/adapters/measure/measure.py:450`, `tests/test_per_target_props.py:31`
- [x] Cible sans `props` → lignes de la liste globale, comme avant — `measure.py:423` (`_target_props` repli)
- [x] Config sans `props` global, cible sans `props` → exit 2 nommant la cible — `measure.py:1058-1063`, `tests/test_per_target_props.py:55`
- [x] `pytest adapters/measure/tests` passe, anciens tests compris — 38 passed
- [x] `pnpm test` exécute tout `adapters/measure/tests` et échoue si un test échoue — `tools/eval/sc-php-fse-behave.mjs:96`, `:100` (voir finding `fit` : jamais atteint tant que `debrief-contract` est rouge)

### Phase 2 — Schéma oracle `pages` + config-gen par page

- [x] `contract-schema.md` décrit `pages`, `root`, `skip`, props racine ; bloc identique dans `02-freeze.md` — `references/contract-schema.md:130-155`, `skills/adjust/actions/02-freeze.md:283-313`
- [x] `--page a` ne produit aucune cible d'un composant absent de `a` — `tests/test_config_gen_pages.py:32`
- [x] `mockup` ≠ `implementation` quand le sélecteur figé diffère de la classe BEM — `tests/test_config_gen_pages.py:38`
- [x] Oracle sans `pages` → même config qu'avant — `tests/test_config_gen_pages.py:58`, `fixtures/contract-pages/expected-legacy.config.json`
- [x] `--page a` → ownership targets limités aux composants de `a` — `config-gen.py` `_derive_ownership_targets(only=…)`, `tests/test_config_gen_pages.py:69`
- [x] Collection sans sélecteur maquette = défaut nommé — `config-gen.py:277-278`
- [x] `--page a` sans `--implementation-url` exécutable par `measure.py --mode A --side mockup` — `tests/test_config_gen_pages.py:80`
- [x] `--check` sans `--reference-url` ni `--out` — `config-gen.py` `main` (`--check` avant la vérification des flags)
- [x] Fixture incomplète → exit 1, chaque manque nommé `page / composant / label` — `tests/test_config_gen_pages.py:105`
- [x] Fixture complète avec `skip` → exit 0, exclusion et raison rapportées — `tests/test_config_gen_pages.py:96`

### Phase 3 — Carte des éléments dans la table de define

- [x] `copycat.md § Outputs` impose une entrée `element_map` par cible mesurée — `agents/copycat.md:315-335`
- [x] Template : section « Carte des éléments » et case de sign-off — `references/correspondence-table-template.md:36-49`, `:69`
- [x] Deux sélecteurs pour un même élément d'une page → Conflicts — `correspondence-table-template.md:53-54`, `skills/define/actions/05-copycat-fanout.md:48-51`
- [ ] `pnpm test` passe et échoue si `element_map` est retiré — garde présente (`tools/eval/design-behave.mjs:490-491`, vérifiée), mais `pnpm test` rouge sur `debrief-contract` (hors diff)

### Phase 4 — adjust fige et vérifie le gate

- [x] Étape 3 interdite tant que `--check` ≠ 0, clé de page absente du harness ou cible maquette `missing` — `02-freeze.md` § Prouver le gate de fidélité, « Interdiction de figer »
- [x] `oracle.json` écrit avant `release.json` et déclaré — sous-étape « Écrire `oracle.json § pages` » précède « Écrire la racine `design/release.json` », pas 3
- [x] Brief seul / maquette-image : ni `--check` ni mesure, et dit — `02-freeze.md` § Portée « sans objet »
- [x] Sélecteur hors carte : preuve Mode A + confirmation utilisateur — `02-freeze.md` § Couvrir, `design-behave.mjs:498`
- [x] Sortie nomme les composants présents sur aucune page — `02-freeze.md` sortie `UNPLACED`, `config-gen.py` `run_check`
- [ ] `pnpm test` passe avec les nouveaux scénarios `adjust` — scénarios et gardes passent isolément ; chaîne rouge sur `debrief-contract` (hors diff)

### Phase 5 — enforce applique le gate figé

- [x] `05-fidelity-gate.md` ne dit plus de compléter cibles, sélecteurs ou props — `skills/enforce/actions/05-fidelity-gate.md:36-39`, garde `design-behave.mjs:507`
- [x] Référence présente, `oracle.json` sans `pages` → refus nommant `adjust` — `05-fidelity-gate.md:49-51`, `skills/enforce/evals/scenarios.json:13`
- [x] `gate-natures.md` et `05-fidelity-gate.md` décrivent la même règle — `references/gate-natures.md:12`
- [x] `copycat.md` n'autorise plus la surcharge `mockup`/`implementation` ni le retrait d'une cible générée — `agents/copycat.md:152-158`, garde `design-behave.mjs:502-505`
- [ ] `pnpm test` passe, et `design-behave.mjs` échoue si la surcharge réapparaît — mutation vérifiée ; chaîne rouge sur `debrief-contract` (hors diff)

### Phase 6 — Release design 2.17.0

- [x] Trois fichiers de version à 2.17.0 ; CHANGELOG décrit la migration — `.claude-plugin/marketplace.json:19`, `plugins/design/.claude-plugin/plugin.json:4`, `plugins/design/.codex-plugin/plugin.json:3`, `plugins/design/CHANGELOG.md:27`
- [ ] `pnpm test` et `pytest plugins/design/adapters/measure/tests` passent — pytest 38/38 ; `pnpm test` rouge sur `debrief-contract` (hors diff)
- [x] Mémoire nomme 2.17.0 et le nouvel invariant — `aidd_docs/memory/design-plugin.md:5`, `:207`

## Findings

| Sev | Kind | Phase | Location | Issue | Fix |
| --- | ---- | ----- | -------- | ----- | --- |
| 🟡 warning | code | 2 | `plugins/design/adapters/measure/config-gen.py:278` | `check_gate` valide une collection par simple vérité (`frozen_colls.get(name)`) alors que `generate` exige une chaîne non vide : `collections.cards = {"skip": "x"}` → `--check` exit 0 `COMPLETE`, puis `--page a` exit 2 « aucun sélecteur maquette (lancer --check) ». Deux validateurs divergents, message qui renvoie vers l'outil qui a dit vert | Même test que `root` dans `check_gate` (`isinstance(v, str) and v.strip()`), ou supporter `skip` sur les collections des deux côtés et le documenter dans `contract-schema.md` |
| 🟡 warning | rot | 5 | `plugins/design/agents/copycat.md:157` | copycat autorise en dérive l'**ajout** de cibles propres à la page ; `05-fidelity-gate.md:36` déclare une « liste fermée » d'ajouts (URLs, `ownership`, `ledger`, `coverage_ack`) sans ces cibles. Un exécutant d'`enforce` refuse ce que copycat produit | Choisir une règle : ajouter « cibles propres à la page, en ajout, signalées candidates à `oracle.json § pages` » à la liste fermée de `05-fidelity-gate.md`, ou retirer la permission de `copycat.md` ; garde `design-behave` sur la formulation retenue |
| 🟡 warning | fit | 1 | `package.json:7` | `pnpm test` est une chaîne `&&` ; `debrief-contract` (rouge, hors diff) précède `design-behave` et `sc-php-fse-behave` : ni les gardes du plan ni le pytest ajouté ne tournent sous `pnpm test`. Le critère « `pnpm test` échoue si un test échoue » est vrai par accident | Réparer `debrief-contract` (hors plan) ; à défaut, ne pas compter `pnpm test` comme preuve du plan et lancer les suites design isolément |
| 🟢 minor | code | 2 | `plugins/design/adapters/measure/config-gen.py:158` | `_page_components` ne tolère pas `pages.<clé>: null` : `AttributeError` avec traceback, exit 1 au lieu du exit 2 « entrée invalide » documenté (`check_gate` gère ce cas via `page_def or {}`) | `(pages[page] or {}).get("components", {})` |
| 🟢 minor | rot | 1 | `tools/eval/sc-php-fse-behave.mjs:96` | Toute la suite pytest de `adapters/measure` (props par cible, pages) tourne depuis l'eval nommé PHP FSE ; le libellé ne dit plus ce qu'il couvre | Déplacer l'appel pytest dans `design-behave.mjs` ou un eval `design-measure` dédié |

## Verification

| Metric        | Value                                             |
| ------------- | ------------------------------------------------- |
| Verified      | 88% (29/33)                                       |
| Files checked | `config-gen.py`, `measure.py`, `configs/example.json`, `tests/test_config_gen_pages.py`, `tests/test_per_target_props.py`, `fixtures/contract-pages/*`, `fixtures/per-target-props/*`, `agents/copycat.md`, `docs/concepts.md`, `references/contract-schema.md`, `references/correspondence-table-template.md`, `references/gate-natures.md`, `adjust/SKILL.md`, `adjust/actions/02-freeze.md`, `adjust/evals/scenarios.json`, `define/SKILL.md`, `define/actions/05-copycat-fanout.md`, `enforce/SKILL.md`, `enforce/actions/05-fidelity-gate.md`, `enforce/evals/scenarios.json`, `lint-core.mjs` (+ copie dual-host, identique), `tools/eval/design-behave.mjs`, `tools/eval/sc-php-fse-behave.mjs`, fichiers de version, `plugins/design/CHANGELOG.md`, `aidd_docs/memory/design-plugin.md` |
| Unchecked     | P3 `pnpm test` — not-applicable ; P4 `pnpm test` — not-applicable ; P5 `pnpm test` — not-applicable ; P6 `pnpm test` — not-applicable (tous : `debrief-contract` rouge avant le plan, hors diff ; chaque suite concernée passe isolément) |
| Unplanned     | `lint-core.mjs:224-226` (+ copie dual-host) : commentaire réaligné sur `oracle.json` conditionnel ; `docs/concepts.md:38` : ligne `oracle.json` requise « si référence mesurable » — cohérence documentaire du plan |
