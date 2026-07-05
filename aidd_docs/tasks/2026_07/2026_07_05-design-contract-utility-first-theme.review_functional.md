---
name: review-functional
description: Revue fonctionnelle du diff `git diff main` contre le master plan design-contract-utility-first-theme (7 sous-plans + clauses Final)
argument-hint: N/A
---

# Functional Review: design contract — utility-first + theme/mode + adapter + track factoring + freeze/critique/diffuse hardening

- **Plan**: `aidd_docs/tasks/2026_07/2026_07_05-design-contract-utility-first-theme-master.md` (+ parts 1 à 7)
- **Diff scope**: `main...HEAD (working tree inclus)` — commit `b26f5ae` (Part 1, 1.11.0) + working tree non committé (Parts 2-7 + quick-wins, plugin.json = 1.16.0)
- **Date**: 2026_07_05

## Verdict

PARTIAL — les 42 critères d'acceptation des 7 sous-plans tracent tous vers le diff et les gates exécutables (8 fixtures `lint-core.mjs` : `0/1/0/1/0/1/0/1`, toutes les `success_condition` `rg` positives), mais la clause **Final #1** (« `overcode:behave` / eval scenarios des skills touchés passent ») n'a **aucune trace versionnée exécutable** : aucune suite `*-scenarios.md` n'existe, et la vérification substituée repose sur un outil (`tools/eval/coverage.mjs`) **gitignored**. S'ajoutent plusieurs changements **hors périmètre des 7 parts**, dont un (`obs/filler/scenarios.json`) qui **contredit la note Final du master**. Aucun blocker 🔴.

Verdict: `PASS` = tous critères Met ; `PARTIAL` = certains Partial/Unmet non bloquants ; `FAIL` = au moins un 🔴 bloquant.

## Scoring Matrix

Une ligne par critère d'acceptation. Sévérité applicable aux lignes `Partial`/`Unmet` seulement.

### Part 1 — theme/mode token dimension (#3)

| Criterion | Files | Status | Severity | Notes |
| --- | --- | --- | --- | --- |
| P1.1a token-schema.md documente la syntaxe overlay + garantie rétrocompat (mono-valeur valide) | `references/token-schema.md` | Met | — | Section "Modes / themes" présente (197 l. ajoutées). |
| P1.1b l'exemple résout les alias par thème, aucun chemin indéfini | `references/token-schema.md` | Met | — | Exemple default+dark+grimoire. |
| P1.2a spec adaptateur : exemple `:root` + `.dark`/`[data-theme]` avec vars surchargées seulement | `references/token-schema.md` | Met | — | Sous-section "Theme-scoped emission". |
| P1.2b sc-pivot-contract.md : champs de spec incluent la liste de thèmes | `references/sc-pivot-contract.md` | Met | — | `rg 'Themes'` = 4 hits. |
| P1.3a themed-clean.html → exit 0 ; themed-dirty.html → exit 1 | `fixtures/themed-*`, `lint-core.mjs` | Met | — | Vérifié : exit 0 / exit 1. |
| P1.3b clean.html (exit 0) et dirty.html (exit 1) inchangés | `fixtures/clean.html`, `dirty.html` | Met | — | Vérifié : exit 0 / exit 1. |
| P1.4a 02-freeze.md audite les overlays ; manifest-schema per-theme contrast | `adjust/actions/02-freeze.md`, `adjust/references/manifest-schema.md` | Met | — | Étape 1d + Invariant 6. |
| P1.4b plugin.json + CHANGELOG à jour ; versions en phase | `plugin.json`, `CHANGELOG.md` | Met | — | Entrée 1.11.0 présente. |

### Part 2 — utility-first first-class (#2)

| Criterion | Files | Status | Severity | Notes |
| --- | --- | --- | --- | --- |
| P2.1a manifest-schema documente `usage` rules + `mode`, avec exemple | `adjust/references/manifest-schema.md` | Met | — | +101 l. |
| P2.1b rétrocompat : manifestes BEM inchangés, mode par défaut = bem/détecté | `adjust/references/manifest-schema.md` | Met | — | Amendment A6. |
| P2.2a utility-clean → exit 0 ; utility-dirty → exit 1 (raw hex + hors-namespace) | `fixtures/utility-*`, `lint-core.mjs` | Met | — | Vérifié : exit 0 / exit 1. |
| P2.2b class-vocab ne fire pas sur utility ; fixtures existantes inchangées | `lint-core.mjs` | Met | — | Rule 1 gated `mode !== utility-first`. |
| P2.3a SKILL/actions décrivent l'enforcement token-usage comme feature baseline | `enforce/SKILL.md`, `01-build-linter.md`, `03-lint-instances.md` | Met | — | Section "Deux modes d'enforcement". |
| P2.3b sc-pivot-contract.md liste les usage rules | `references/sc-pivot-contract.md` | Met | — | `rg 'Mode\|Token-usage\|usage'` = 7 hits. |
| P2.4 freeze audite usage ; versions en phase ; CHANGELOG | `adjust/actions/02-freeze.md`, `CHANGELOG.md` | Met | — | Étape 2bis usage + 1.12.0. |

### Part 3 — v3 Tailwind adapter (#6)

| Criterion | Files | Status | Severity | Notes |
| --- | --- | --- | --- | --- |
| P3.1a token-schema nomme un artefact v3 ≠ `theme.css` | `references/token-schema.md` | Met | — | `tailwind-tokens.cjs` (5 hits). |
| P3.1b chemin v4 `@theme`/`theme.css` préservé | `references/token-schema.md` | Met | — | `rg 'theme.css'` = 3 hits. |
| P3.2a étape de fusion pour config existante documentée avec exemple | `references/token-schema.md` | Met | — | Exemple `tailwind.config.ts`. |
| P3.2b diffuse + sc-pivot référencent le même nom d'artefact (pas de drift) | `diffuse/*`, `sc-pivot-contract.md` | Met | — | Résolu par vérif d'absence de référence Tailwind → laissés intacts (justifié dans le log). |
| P3.3 versions en phase ; CHANGELOG ; clean.html exit 0 | `plugin.json`, `CHANGELOG.md` | Met | — | 1.13.0 + clean exit 0 vérifié. |

### Part 4 — track factoring (#8) + brief-path fidelity limit (F2-3)

| Criterion | Files | Status | Severity | Notes |
| --- | --- | --- | --- | --- |
| P4.1a chaque 03/05/copycat énonce son track ; chemin app-JS lisible sans idiomes WP | `03-lint-instances.md`, `05-fidelity-gate.md`, `agents/copycat.md` | Met | — | `rg '## Track'` = 4 hits sur 03. |
| P4.1b aucun comportement retiré — flux WP intact sous son track | idem | Met | — | Refactor doc pur (lint-core non touché). |
| P4.1c 05-fidelity-gate documente la limite brief-path (assumée, cross-ref 03-construct) ; 03-construct porte la note réciproque | `05-fidelity-gate.md`, `define/actions/03-construct.md` | Met | — | 7 hits `brief\|03-construct`. |
| P4.2a wordpress-pitfalls.md explicitement scopé WP-track | `references/wordpress-pitfalls.md` | Met | — | En-tête de scope (+5 l.). |
| P4.2b versions en phase ; CHANGELOG ; clean.html exit 0 | `plugin.json`, `CHANGELOG.md` | Met | — | 1.13.1 (patch, justifié). |

### Part 5 — retrofit reconciliation at freeze (F2-1)

| Criterion | Files | Status | Severity | Notes |
| --- | --- | --- | --- | --- |
| P5.1a 02-freeze documente Étape 2bis (réconciliation code, mode-aware, politique A10) | `adjust/actions/02-freeze.md` | Met | — | `rg 'code réel\|retrofit'` = 7 hits. |
| P5.1b freeze invalide tant qu'une divergence bloquante subsiste ; greenfield neutre | `adjust/actions/02-freeze.md` | Met | — | Documenté. |
| P5.2a retrofit-clean → exit 0 ; retrofit-dirty → exit 1 | `fixtures/retrofit-*`, `lint-core.mjs` | Met | — | Vérifié : exit 0 / exit 1. |
| P5.2b fixtures pré-existantes OK ; `--report-unused` off par défaut | `lint-core.mjs` | Met | — | 6 autres fixtures inchangées. |
| P5.3a manifest-schema : concordance couche 2 ↔ code comme précondition freeze (mode-aware) | `adjust/references/manifest-schema.md` | Met | — | Invariant 7. |
| P5.3b versions en phase ; CHANGELOG | `plugin.json`, `CHANGELOG.md` | Met | — | 1.14.0. |

### Part 6 — destructure critique persistence (F2-2)

| Criterion | Files | Status | Severity | Notes |
| --- | --- | --- | --- | --- |
| P6.1a 01-challenge écrit le rapport par défaut vers un chemin canonique, opt-out documenté | `destructure/actions/01-challenge.md` | Met | — | 9 hits critique / 4 hits `par défaut`. |
| P6.1b SKILL.md réconcilie « lecture seule » + carve-out (contrat/source jamais édités) | `destructure/SKILL.md` | Met | — | `rg 'lecture seule'` = 1 hit reformulé. |
| P6.2a 01-arbitrate lit la critique persistée comme entrée optionnelle non-bloquante | `adjust/actions/01-arbitrate.md` | Met | — | 2 hits critique. |
| P6.2b chemin critique enregistré non-contractuel ; versions ; CHANGELOG | `references/design-system-contract.md`, `CHANGELOG.md` | Met | — | 1.15.0 + template créé. |

### Part 7 — orphan-wireframe hand-off (F2-4)

| Criterion | Files | Status | Severity | Notes |
| --- | --- | --- | --- | --- |
| P7.1a 02-render/html-css/SKILL énoncent tous le statut preview non intégré + hand-off | `diffuse/actions/02-render.md`, `adapters/html-css.md`, `SKILL.md` | Met | — | 6/1/11 hits respectifs. |
| P7.1b recommandation d'install pivot conditionnelle à une stack JS/WP ; cibles statiques épargnées | `diffuse/actions/02-render.md` | Met | — | Étape 1 + Étape 5. |
| P7.2a pas de drift diffuse ↔ sc-pivot sur la frontière fallback | `references/sc-pivot-contract.md` | Met | — | Clause d'alignement § Dégradation gracieuse. |
| P7.2b versions en phase ; CHANGELOG ; clean.html exit 0 | `plugin.json`, `CHANGELOG.md` | Met | — | 1.16.0 + clean exit 0. |

### Master — Validation Protocol « Final » (ligne 105)

| Criterion | Files | Status | Severity | Notes |
| --- | --- | --- | --- | --- |
| Final.1 `overcode:behave` / eval scenarios des skills touchés passent | `skills/*/evals/scenarios.json`, `tools/eval/coverage.mjs` | Partial | 🟡 major | **Aucune** suite `*-scenarios.md` (behave) n'existe pour les 5 skills touchés (vérifié). Les `evals/scenarios.json` existent mais aucun runner versionné ne les consomme : `coverage.mjs` est **gitignored** (`git check-ignore` confirmé). La substitution documentée n'a donc pas de trace exécutable reproductible dans le dépôt. Non bloquant (changement de contrat doc-only ; le vrai gate exécutable = `lint-core.mjs`, vert). |
| Final.2 CHANGELOG + bump version plugin.json | `plugin.json`, `CHANGELOG.md` | Met | — | `1.16.0` ; entrées 1.11.0→1.16.0 présentes (217 l. ajoutées). |
| Final.3 suite `lint-core.mjs` complète verte (incl. themed-*/utility-*/retrofit-*) | `lint-core.mjs`, `fixtures/*` | Met | — | 8 fixtures re-exécutées : `0/1/0/1/0/1/0/1`, 0 régression. |

## Missing behaviors

Critères sans aucune trace dans le diff (handoff `aidd-dev:02-implement` ; si implémenté mais cassé, `aidd-dev:08-debug`).

- aucun — les 42 critères des 7 parts tracent tous vers le diff, et les 8 fixtures + toutes les `success_condition` `rg` sont vérifiées vertes. (Final.1 est *Partial*, pas absent — voir Flow/edge-case gaps.)

## Unplanned behaviors

Changements présents dans le diff mais ne traçant vers aucun critère d'acceptation des 7 parts (à confirmer avec l'auteur). Le commit `b26f5ae` annonce explicitement « + corrections quick-win » — ces changements sont intentionnels mais **hors validator**.

- [ ] `plugins/obs/skills/filler/evals/scenarios.json` — reformaté objet `{scenarios:[…]}` → tableau `[…]` (schéma `{prompt, expect_action}`). **Plugin différent (`obs`), hors périmètre**, et surtout **contredit directement la note Final du master** (ligne 105) qui affirme ce fichier « malformé … signalé **mais non corrigé** ». Le diff montre qu'il **a** été corrigé. Incohérence à trancher : soit la note Final est périmée, soit la correction a été faite hors-registre.
- [ ] `plugins/sc-js/skills/design-bridge/actions/01-realize-lint.md` (+83 l.) — ajout des archétypes A (table React/Astro/Vue/Svelte/HTML), B (vanilla DOM) et C (scanner fallback). **Part 2 Phase 3 tâche 3 dit explicitement « No sc-js edit required by this plan … flag as a follow-up ticket »**, et le master §Source classe audit-1 #4 (ce fichier) **hors scope / « already covered »**. Édition non planifiée / scope creep contredisant deux affirmations du plan.
- [ ] Gate 0 « import `tokens.css` » — nouveau 4ᵉ gate : `enforce/actions/02-wire-gates.md` (renumérotation Étapes 2→6, ajout Étape « Gate 0 »), `enforce/references/gate-wiring.md` (section Gate 0 + hook pre-commit étendu à `.astro/.vue/.jsx/.tsx/.svelte`), `README.md` (« 3 gates » → « 4 gates »). N'apparaît dans **aucune** des 7 parts. Batch quick-win, mais la surface de contrat annonce désormais une capacité (« 4 gates ») non couverte par ce validator.
- [ ] `plugins/design/references/write-system-procedure.md` — correction de doc-drift (`from-reference`/`from-brief` → `define/04-write-material` ; `wireframe`/`component` → `destructure`/`adjust`). Quick-win hygiène, non planifié.
- [ ] `plugins/design/skills/define/SKILL.md` — reformulation « core trio » (présentation non bloquante). Quick-win, non planifié.
- [ ] `aidd_docs/tasks/2026_07/…review.md` (67 l.) — artefact d'une revue de code antérieure ; hors contrat plugin, non un critère.

## Flow / edge-case gaps

Trous surfacés en parcourant chaque critère contre le diff.

- [ ] **Final.1 — trace non reproductible** : la seule preuve d'exécution des scénarios repose sur `tools/eval/coverage.mjs`, gitignored (donc absent d'un checkout propre) ; le master note lui-même que ce runner « plante repo-wide » à cause de `obs/filler/scenarios.json`. Or ce même fichier a été reformaté dans ce diff (cf. Unplanned) — possiblement pour débloquer le runner — sans que la note Final l'acte. La substitution documentée et l'état réel du dépôt divergent.
- [ ] **Discipline de commit / version-en-phase** : seul le commit `b26f5ae` (Part 1, tagué 1.11.0) est committé ; Parts 2-7 + quick-wins (jusqu'à 1.16.0) sont **en working tree non committé**. L'invariant transverse « bump version par part + entrée CHANGELOG » est satisfait dans le contenu, mais la traçabilité par commit est absente pour 6 parts sur 7 — à acter par le caller avant tout `for-sure`/merge.
- [ ] **Part 6 — collision de nom de critique même jour** : le chemin `design/critique/<yyyy_mm_dd>-<cible>.md` a une granularité au **jour**. Deux exécutions `destructure` le même jour sur la même cible écraseraient le fichier — ce qui contredit la garantie « historique, jamais d'écrasement » (A11.1). Edge-case non couvert (pas de suffixe horaire/incrément).
- [ ] **Part 5 — `--report-unused` heuristique** : la direction manifeste→code (entrée jamais utilisée) est un scan de chaînes littérales ; les classes construites dynamiquement produisent des faux positifs. Documenté comme warning non bloquant (mitigation présente), mais aucune fixture ne couvre `--report-unused` — le flag additif n'a pas de gate de non-régression propre.

## Summary

- **Criteria covered**: 42/42 tracés ; 41 Met, 1 Partial (Final.1).
- **Blockers**: 0 (aucun 🔴).
- **Follow-up actions**:
  1. Trancher l'incohérence `obs/filler/scenarios.json` : la correction faite dans le diff contredit la note Final « non corrigé » — mettre à jour la note ou retirer le changement hors-scope.
  2. Statuer sur l'édition non planifiée de `sc-js/…/01-realize-lint.md` (contredit Part 2 Phase 3 + master §Source « hors scope »).
  3. Établir une trace versionnée reproductible pour Final.1 (suite behave réelle, ou dégiter `coverage.mjs`, ou reformuler la clause Final comme « non applicable — pas de suite behave »).
  4. Committer les Parts 2-7 + quick-wins (actuellement en working tree) pour rétablir la traçabilité par commit avant merge.
- **Additional notes**: Le cœur exécutable (8 fixtures `lint-core.mjs` + toutes les `success_condition`) est intégralement vert et vérifié de première main. Les réserves portent sur (a) la clause de vérification Final.1 sans trace reproductible et (b) 6 changements hors-périmètre des 7 parts, dont 2 (`obs/filler`, `sc-js/realize-lint`) contredisent des affirmations explicites du plan. Revue en lecture seule — aucun fichier modifié.
