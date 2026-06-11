---
name: master_plan
description: Refactor the design plugin into a 5-verb funnel (define / destructure / adjust / enforce / diffuse)
objective: "Replace the 9 current design skills with a 5-verb constraining funnel whose contract crystallizes at adjust and is enforced by a portable linter."
success_condition: "All 5 design skill dirs (define, destructure, adjust, enforce, diffuse) exist with a valid SKILL.md, the design-bridge receptacle exists in sc-php AND sc-js, the 9 old design skill dirs are removed, and `node -e \"['plugins/design/.claude-plugin/plugin.json','plugins/sc-php/.claude-plugin/plugin.json','plugins/sc-js/.claude-plugin/plugin.json','.claude-plugin/marketplace.json'].forEach(p=>JSON.parse(require('fs').readFileSync(p,'utf8')))\"` exits 0"
iteration: 0
created_at: "2026-06-10T18:29:29Z"
---

# Master Plan: Refonte du plugin design en entonnoir 5 verbes

## Overview

- **Goal**: Remplacer les 9 skills design par un entonnoir de 5 verbes (define -> destructure -> adjust -> enforce -> diffuse) ; le contrat cristallise a `adjust`, le gate de lint est la reference appliquee partout.
- **Risk Score**: 8/10
- **Branch**: `refactor/design-funnel` (UNE seule branche pour tout le master ; les 6 parts sont des phases sequentielles, pas des branches separees -> endtask merge une branche unique)

## Funnel model (frozen)

- **define** (malleable): extraire des maquettes OU construire depuis un brief -> tokens de travail + inventaire candidat + charte brouillon. Unifie ex-from-brief + ex-from-reference + extraction.
- **destructure** (malleable, rejouable standalone): challenge design. Entree = sortie de define OU un element existant isole. Sortie = critique + pistes d'evolution. Pendant design de aidd-refine:02-challenge.
- **adjust** (figeage): arbitrer (motif dominant gagne) ET figer. Introduit le manifeste (3e couche, vocabulaire ferme), rend les tokens canoniques. Etend le contrat a 3 couches.
- **enforce** (verrou): baseline lint-core.mjs portable derive du contrat fige (2 severites, 3 gates, lint-instances/DB) + PIVOT technique vers sc-<techno> quand present, pour une realisation native idiomatique du linter.
- **diffuse** (production): elements repetables en forme neutre, rendus baseline (HTML/CSS) + PIVOT technique vers sc-<techno> pour le rendu/wiring idiomatique par stack. Sous gate.

## Decisions actees

- Remplacement total des 9 skills (setup, from-reference, from-brief, wireframe, component, audit, diagnose, refactor, export-wordpress).
- Generique multi-stack: WordPress FSE = un adaptateur parmi d'autres (Vue/React/Tailwind/CSS/WP).
- Enforcement HYBRIDE: baseline lint-core.mjs portable (universel, derive du contrat) + PIVOT technique vers sc-<techno> quand present (realisation native idiomatique). Le design garde le QUOI (contrat, vocabulaire ferme); les sc-* font le COMMENT (linter reel, wiring).
- Le pivot s'applique a `enforce` (linter) ET `diffuse` (rendu technique). Receptacle ajoute a sc-php + sc-js d'abord (WP + web); python/rust ensuite.
- Le pivot reutilise l'idiome de relais existant du depot (cf sc-tiers:setup help, et sc-*:sniff -> .claude/rules/07-quality consommes par web-optimize). Interface = un contrat de pivot partage (design/references/sc-pivot-contract.md).
- Philo mobile-first/a11y/no-emoji = profil activable (rapatrie depuis ex-setup), plus impose d'office.
- Migration legacy absorbee dans l'entonnoir (destructure critique l'existant, enforce porte la propagation).
- Le contrat 3-couches est rattache a `adjust`, pas a `define`.

## Child Plans

| #   | Plan         | File                                          | Status      | Validated |
| --- | ------------ | --------------------------------------------- | ----------- | --------- |
| 1   | define       | `./*-design-funnel-refactor-part-1.md`        | done        | [x]       |
| 2   | destructure  | `./*-design-funnel-refactor-part-2.md`        | done        | [x]       |
| 3   | adjust       | `./*-design-funnel-refactor-part-3.md`        | done        | [x]       |
| 4   | enforce      | `./*-design-funnel-refactor-part-4.md`        | done        | [x]       |
| 5   | diffuse      | `./*-design-funnel-refactor-part-5.md`        | done        | [x]       |
| 6   | sc-* pivot   | `./*-design-funnel-refactor-part-7.md`        | done        | [x]       |
| 7   | bascule+doc  | `./*-design-funnel-refactor-part-6.md`        | done        | [x]       |

<!-- Status values: pending, in-progress, done, blocked -->
<!-- RULE: Plan N+1 blocked until Plan N checkbox checked -->
<!-- Note: parts 1-5 each ship one independent design skill against the shared contract; part-7 adds the receiving design-bridge to sc-php + sc-js (the pivot receptacle); part-6 (cutover) removes legacy + docs LAST. Execution order: 1,2,3,4,5,7,6. -->

## Validation Protocol

1. Complete each part, run its acceptance criteria (the per-part lint/JSON check).
2. [ ] Checkpoint per part: User confirms before unblocking the next.
3. Part 6 (deletion + doc) runs only after parts 1-5 are done.
4. [x] Final: both manifests validate, 5 new skill dirs present, 9 old dirs gone.

## Estimations

- **Confidence**: 9/10
- **Duration**: ~7 sessions ciblees (1 par part ; ordre d'execution 1,2,3,4,5,7,6)
