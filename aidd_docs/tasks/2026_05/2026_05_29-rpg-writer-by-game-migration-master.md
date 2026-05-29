---
name: master_plan
description: Master plan to migrate the rpg-writer action layer to the by-game + canon/mj convention and restore the cooperation chain with obsidian
---

# Master Plan: rpg-writer by-game + canon/mj migration

## Overview

- **Goal**: Align the rpg-writer action layer (and extract-pdf) with the by-game vault layout, the canon/mj provenance model, and named path variables, so the full cooperation chain works: official PDFs are transcribed by extract-pdf into reference `sources/`, lore-extract / rules-keeper / research ventilate sources (and cross-verified research) into canon, the MJ enriches mj/, the player firms up rules, and the writer builds the final narrative from all of it.
- **Risk Score**: 11 (breaking changes to the bank.yml contract +3, schema-like migration +3, 5+ skills +3, major refactor +2) -> master plan.
- **Branch**: `refactor/rpg-writer-by-game/`

## Child Plans

| #   | Plan                       | File            | Status  | Validated |
| --- | -------------------------- | --------------- | ------- | --------- |
| 1   | Canon producers            | `./2026_05_29-rpg-writer-by-game-migration-part-1.md` | done    | [x]       |
| 2   | Consumption chain (writer) | `./2026_05_29-rpg-writer-by-game-migration-part-2.md` | done    | [x]       |
| 3   | bank.yml contract + scaffolding | `./2026_05_29-rpg-writer-by-game-migration-part-3.md` | done    | [x]       |

<!-- RULE: Plan N+1 blocked until Plan N checkbox checked -->

Parts are independent (each leaves the plugins functional). The listed order (producers -> consumers -> contract) is the default; if preferred, Part 3 (bank.yml schema) may run before Part 2, since the writer is made purely bank.yml-driven in Part 2.

## Shared path-variable convention (applies to all parts)

- `<vault>` = `C:/Users/fxgui/Public/Notes/Perso/JDR/`
- `<jeu>` = first segment under `<vault>` (resolved from CWD)
- `<univers-root>` = `<jeu>/univers/<univers>/`
- `<systeme-root>` = `<jeu>/systeme/` (`canon/` + `mj/`)
- `<subsys-root>` = `<jeu>/subsystems/<nom>/` -> fallback `<vault>/subsystems/<nom>/`
- `<projet-root>` = `<jeu>/ecrits/<projet>/`
- `<campagne-root>` = `<jeu>/campagnes/<campagne>/`
- `<pj-root>` = `<jeu>/pjs/<pj>/`
- `<sources>` = `<univers-root>/sources/<source>/` (universe ref) and `<systeme-root>/sources/<source>/` (rules ref)
- Lore -> `<univers-root>/.docs/{canon,mj}/` ; Rules -> `<systeme-root>/{canon,mj}/` + `<subsys-root>/{canon,mj}/`

Canon pipeline (decided boundary): `extract-pdf` transcribes official PDFs into **reference documents under `sources/`** (faithful, raw); `lore-extract` ventilates `sources/` lore into `<univers-root>/.docs/canon/`; `rules-keeper` ventilates `sources/` rules into `<systeme-root>/canon/` (+ `<subsys-root>/canon/`). extract-pdf never writes final canon directly. `research` also feeds canon: canon = official extract-pdf material **+** cross-verified web research (`research`/`extract-terminology` write `<univers-root>/.docs/canon/`). MJ-created content goes to `mj/`, never `canon/`. Asymmetry rationale: extract-pdf output is large and raw, so it lands in `sources/` and needs ventilation; research output is already synthesized and cross-verified, so it lands in `canon/` directly.

Single source of truth created in Part 1: `plugins/rpg-writer/skills/setup/references/vault-layout.md`, referenced by every migrated skill (each part adds the pointer for the skills it migrates).

## Validation Protocol

1. Complete Part 1 (canon producers), run its `success_condition`. — DONE, PASS.
2. [x] Checkpoint 1: canon producers write into `sources/`; lore-extract/rules-keeper ventilate to `canon/`/`systeme/`.
3. Unblock Part 2 (consumption), run its `success_condition`. — DONE, PASS.
4. [x] Checkpoint 2: the writer reads canon/ + mj/ + systeme/ via bank.yml.
5. Unblock Part 3 (contract + scaffolding), run its `success_condition`. — DONE, PASS.
6. [x] Final: `setup init` scaffolds the by-game tree with canon/+mj/; master sweep confirms NO stale-convention pattern (`docs/templates/personas`, `<univers>/<projet>`, `docs/rules-files/`, `parent du CWD`) remains across `plugins/rpg-writer/skills`.

## Estimations

- **Confidence**: 9/10
- **Duration**: 3 focused sessions (one per part).
