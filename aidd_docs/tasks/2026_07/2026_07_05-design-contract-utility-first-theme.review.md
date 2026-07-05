---
name: review-code
description: Revue de code du diff design/contract-utility-first-theme (master plan 7 parties)
---

# Code Review: design contract — utility-first + theme/mode + adapter + track factoring + freeze/critique/diffuse hardening

Refonte additive du contrat public du plugin `design` (8 findings, 2 audits, 7 parties). Le corps documentaire est solide et cohérent ; deux défauts touchent le seul artefact exécutable (`lint-core.mjs`) et le périmètre du diff.

- **Verdict**: changes-requested
- **Diff scope**: `main...design/contract-utility-first-theme` (commit `b26f5ae` + working tree non commité)
- **Date**: 2026_07_05
- **Findings**: 1 critical, 3 warning, 2 minor

Verdict: `approve` = aucun critique, on livre ; `changes-requested` = warnings ou un critique corrigeable à traiter d'abord ; `blocked` = un critique qui ne doit pas merger.

## Expected changes

Ce que le master plan devait livrer (8 findings / 7 parties). Coché = le diff le réalise réellement.

- [x] **Part 1 (#3)** — dimension `themes` dans `token-schema.md` + émission theme-scoped (`:root` + `.dark`/`[data-theme]`) des adaptateurs `tokens.css`/`theme.css` ; audit d'overlay au figeage ; fixtures `themed-*` (exit 0/1).
- [x] **Part 2 (#2)** — mode `utility-first` first-class : champ `mode`, bloc `usage` (`rawHexForbidden`, `colorUtilityPrefixes`, `rules[]`), Rules 3/4 dans `lint-core.mjs`, gate de mode sur Rule 1, doc SKILL/actions/pivot. ⚠ Rule 4 défectueuse (F-1) ; fixtures `utility/` **non suivies** par git (F-2).
- [x] **Part 3 (#6)** — artefact v3 canonique `tailwind-tokens.cjs` (partiel `theme.extend`) + câblage greenfield/fusion Nuxt documenté dans `token-schema.md`.
- [x] **Part 4 (#8 + F2-3)** — factorisation deux tracks (marqueurs `Track:` in-place) + limite de fidélité brief-path nommée dans `05-fidelity-gate.md` et `03-construct.md`.
- [x] **Part 5 (F2-1)** — réconciliation retrofit `Étape 2bis` dans `02-freeze.md`, réutilisant `lint-core.mjs` + flag `--report-unused` ; invariant 7. ⚠ collision de nom d'étape (F-5) ; fixtures `retrofit/` **non suivies** (F-2).
- [x] **Part 6 (F2-2)** — persistance critique `destructure` sous `design/critique/`, opt-out `--no-write`, consommation optionnelle par `adjust`. ⚠ template `critique-report-template.md` **non suivi** (F-2).
- [x] **Part 7 (F2-4)** — statut preview non intégrée du rendu baseline `diffuse` (SKILL + 02-render Étape 5 + adapter) + hand-off obligatoire.
- [x] Bump version `plugin.json` 1.9.1 → 1.16.0 + entrées CHANGELOG 1.10.0→1.16.0 cohérentes ; README/plugin.json « 4 gates » propagés.

## Findings

Une ligne par problème, sur les lignes CHANGÉES. Lecture seule : le correctif est décrit, pas appliqué — remise à `aidd-dev:07-refactor`.

Sévérité : 🔴 critique (ne doit pas merger tel quel) · 🟡 warning (à corriger) · 🟢 minor (nit).

| Sev | Category | Location | Issue | Suggested fix |
| --- | --- | --- | --- | --- |
| 🔴 | code-health | `plugins/design/skills/enforce/adapters/lint-core.mjs:207-208` | **Rule 4 (allowed colour namespaces) produit des faux positifs sur les préfixes Tailwind à double usage.** Le code fait `m[1].split('-')[0]` puis exige que le segment ∈ `color.*`. Or `text`, `border`, `ring` (exactement la liste `colorUtilityPrefixes` de l'exemple documenté *et* de la fixture `utility/components.json`) portent aussi taille/alignement/épaisseur : `text-lg`, `text-center`, `text-sm`, `border-2`, `border-t`, `ring-2` → namespace `lg`/`center`/`2`/`t` ∉ `{brand,neutral,semantic}` → **ERROR** sur du code Tailwind valide. La fixture `utility-clean.html` masque le défaut en n'utilisant que des `text-*`/`border-*` porteurs de couleur. Défaut sur le cœur de valeur du finding #2 (« enforcement qui colle au code réel ») : en pratique le gate bloque presque tout vrai codebase utilitaire. | Ne flaguer que si le segment de tête ressemble à un namespace couleur : restreindre aux classes dont le segment ∈ l'union des `color.*`, **ou** exclure une allowlist de segments non-couleur connus (`lg/sm/xl/center/left/right/2/4/t/b/solid/dashed/offset-*`…), ou n'appliquer la règle qu'aux préfixes mono-usage (`bg`). Ajouter une fixture `utility-dirty` couvrant `text-lg`/`border-2`. |
| 🟡 | architecture | `plugins/design/skills/destructure/SKILL.md:56` · `plugins/design/skills/enforce/actions/01-build-linter.md:96` · master plan `## Source` | **Artefacts porteurs référencés par des fichiers suivis mais eux-mêmes non suivis par git → hors scope `git diff main`, non committables par un `git add -u`.** `git status` liste en `??` : `skills/destructure/references/critique-report-template.md` (référencé par le SKILL et `01-challenge.md`), `fixtures/utility/`, `fixtures/utility-{clean,dirty}.html`, `fixtures/retrofit/`, `fixtures/retrofit-{clean,dirty}.html` (référencés par les `success_condition` Parts 2/5 et par `01-build-linter.md`), et `plugins/design/audits/` (source du master plan). Un commit qui n'ajoute que les fichiers modifiés publierait un plugin aux références mortes, sans les fixtures de gate. | Avant commit, `git add` explicite de ces chemins non suivis (ou `git add -A`), ou vérifier qu'aucun `.gitignore` ne les exclut. Sinon les références vers `critique-report-template.md` et les fixtures cassent à l'installation. |
| 🟡 | standards | `plugins/obs/skills/filler/evals/scenarios.json:1-9` | **Scope creep hors plugin `design` + contradiction avec la note d'auto-validation du master plan.** Le diff réécrit ce fichier d'un objet `{scenarios:[…]}` riche vers un tableau plat `[{prompt,expect_action}]` — c'est précisément le correctif du bug `coverage.mjs` (`arr.map is not a function`). Or le master plan (ligne 111) affirme que ce bug est « hors scope de ce plan, signalé mais **non corrigé** » et qu'une vérification a été « substituée » pour le contourner. Le diff corrige donc un fichier d'un autre plugin tout en documentant l'inverse. La réécriture supprime aussi `description`/`expected_output_contains`/`expected_scope` (perte de richesse d'éval). | Trancher : soit exclure ce fichier du diff (le laisser au batch obs), soit l'assumer et réaligner la note ligne 111 du master plan. Vérifier qu'aucun consommateur ne dépend des champs supprimés. |
| 🟡 | code-health | `plugins/design/skills/enforce/adapters/lint-core.mjs:200-208` | **Rule 4 : préfixe sous-chaîne d'un autre → faux positif de même famille que F-1.** La regex `^(?:${escaped.join('|')})-(.+)$` est correctement ancrée sur `-`, mais un préfixe `ring` capture `ring-offset-2` → `namespace = 'offset'` ∉ `color.*` → ERROR, alors que `ring-offset-*` n'est pas une utilité couleur. À traiter conjointement avec F-1. | Couvert par le correctif F-1 (allowlist de segments non-couleur / restriction aux préfixes mono-usage). |
| 🟢 | code-health | `plugins/design/skills/adjust/actions/02-freeze.md:71` et `:104` | **Deux étapes distinctes partagent le libellé « Étape 2bis ».** L'une est sous-étape de l'Étape 2 (audit `usage`), l'autre est top-level (réconciliation retrofit). L'auteur a dû ajouter une note de désambiguïsation (`:106`) — signe que la numérotation est ambiguë et fragile. | Renuméroter la réconciliation retrofit (`Étape 2ter`, ou l'insérer comme `Étape 3` en décalant le figeage) pour supprimer la collision. |
| 🟢 | code-health | `plugins/sc-js/skills/design-bridge/actions/01-realize-lint.md:182` | **`$EXT_PATTERN` consommé dans le snippet pre-commit sans être défini dans le snippet** (seulement en commentaire, `:178-180`). Collé tel quel sans définition, `grep -E ""` matche **toutes** les lignes → tous les fichiers stagés lintés (faux positifs massifs). Template instructif, mais footgun. | Fournir un défaut sûr dans le snippet (`EXT_PATTERN="${EXT_PATTERN:-\\.(jsx\|tsx\|vue)$}"`) ou une garde `[ -z "$EXT_PATTERN" ] && exit`. |

## Coverage

Dimensions examinées sur le diff (une dimension sans finding est quand même listée comme scannée ; une non applicable est marquée n/a).

- **Scanned**: correctness/logique du linter (`lint-core.mjs` Rules 1-5, mode-gate, flatten `themes`), cohérence inter-fichiers (token-schema ↔ manifest-schema ↔ sc-pivot ↔ freeze ↔ SKILLs), rétrocompatibilité/additivité, versioning (plugin.json ↔ CHANGELOG ↔ README), fixtures (themed ; utility/retrofit lues hors scope pour éclairer F-1), naming/numérotation d'étapes, scope du diff vs. arbre de travail (fichiers non suivis), scope creep inter-plugins, hygiène doc-drift (verbes remplacés).
- **Not applicable**: sécurité (scanner regex read-only, aucune surface privilégiée), performance (volumes triviaux), i18n, migrations de données. Vérification runtime **non effectuée** (consigne read-only) — les conclusions sur Rule 4 sont établies par lecture statique du chemin regex→split→lookup, qui est concluante.

## Follow-up

- **Top fixes** (classés, remise à `aidd-dev:07-refactor`) :
  1. **F-1 (🔴)** — corriger la Rule 4 pour ne pas flaguer les utilitaires Tailwind non-couleur (`text-lg`, `border-2`, `ring-offset-2`) + fixture de non-régression. Bloquant fonctionnel pour tout projet utility-first réel.
  2. **F-2 (🟡)** — stager les fichiers non suivis référencés (`critique-report-template.md`, fixtures `utility/`+`retrofit/`, `audits/`) avant tout commit des Parts 2-7.
  3. **F-3 (🟡)** — trancher le sort de `plugins/obs/.../scenarios.json` (exclure ou assumer) et réaligner la note ligne 111 du master plan.
  4. **F-5 / F-6 (🟢)** — renumérotation `Étape 2bis` + garde `$EXT_PATTERN`.
- **Notes**:
  - Le critique F-1 est **corrigeable** → verdict `changes-requested`, pas `blocked` (défaut d'un linter de référence de plugin, non un runtime de production ; correctif local à un bloc).
  - Qualité documentaire globalement élevée : les invariants (base-tree = source de vérité des chemins ; overlay `$value`-only ; réconciliation asymétrique code→manifeste bloquante / manifeste→code warning ; lint-vert ≠ intégré) sont énoncés sans contradiction interne et propagés sur tous les fichiers référençants. Discipline de version respectée (`$version` en phase, table de bump minor/major).
  - Détail non bloquant (hors table) : la regex raw-hex `#[0-9a-fA-F]{3,8}\b` (`lint-core.mjs:172`) matche des hex invalides à 5/7 chiffres et rate une chaîne ≥ 9 caractères hex (le `\b` échoue) — cas de bord d'une règle non structurante, tolérable.
  - Écart pré-existant hors scope : `plugin.json` partait de `1.9.1` alors que le CHANGELOG n'avait pas d'entrée `1.9.1` (top = `1.9.0`) — antérieur à cette branche, non introduit ici.
