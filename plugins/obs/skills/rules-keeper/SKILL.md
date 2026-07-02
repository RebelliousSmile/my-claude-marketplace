---
name: rules-keeper
model: sonnet
description: Restructures any game rules file into an LLM-optimized format (CHEATSHEET + LEXICON + PATTERNS + ENTITY TEMPLATES + FULL REFERENCE) ready for use by `writing:write` and `writing:review` skills — and by the solo-RPG suite (`ttrpg:solo-mc` for live play, `ttrpg:pc` and `ttrpg:campaign`) as the shared system-rules reference, separating the official ruleset (canon/) from the GM's house rules (mj/, `--homemade`). Use when integrating a new game system, when rules files are verbose or poorly structured, or when merging a supplement into an existing rules file. Do NOT use for extracting lore or universe documentation — use `lore-extract` instead; do NOT use to write new rules from scratch — use `writing:write` instead.
---

# Rules Keeper

Restructures existing rules files into a standardized LLM-optimized format for rapid recall and consistent application during writing sessions. System-agnostic: works for any tabletop RPG, wargame, or card game.

## Available actions

| #   | Action        | Role                                                               | Input                                                     |
| --- | ------------- | ------------------------------------------------------------------ | --------------------------------------------------------- |
| 01  | `restructure` | Analyze and restructure a single rules file into optimized format  | `<rules-file.md>`                                         |
| 02  | `restructure-all` | Restructure all rules sources of the game domain  | *(no argument — scans `R/_systeme/sources/` locally)*     |
| 03  | `update`      | Merge a supplement or errata into an existing optimized rules file | `<base-rules.md> <supplement.md>`                         |
| 04  | `local`       | Generate a document-specific `document-rules.md` for local rules  | `<project-path> [<source.md>]`                            |

## Default flow

Trigger-to-action mapping:
- "rules-keeper", "restructure rules", "restructurer les règles", "optimiser rules-files", "préparer les règles pour l'écriture" → `restructure`
- "restructure all rules", "tous les rules-files" → `restructure-all`
- "rules-keeper --update", "merge supplement", "intégrer supplément" → `update`
- "rules-keeper --local", "règles locales du document", "document-rules" → `local`

## Transversal rules

- **Never add mechanics not present in the source** — restructure only, do not invent.
- **Preserve ALL game mechanics** — only the structure changes, not the content.
- Backup the original file as `<file>.original.md` before overwriting (skip if backup already exists).
- CHEATSHEET section must stay under 500 tokens (~2000 characters).
- **LEXICON is always required** — even if the source is already in French. It maps game jargon to the exact French terms used in writing output. A source in French still contains system-specific jargon that must be normalized.
- Template files (PC, NPC, obstacle, asset) are created as side artifacts in `.templates/`.
- On conflict between base file and supplement: always ask — never silently resolve.
- **Canon vs house rules (mj)**: distinguish the **official ruleset** from the **GM's house rules**, in two sub-trees:
  - `canon/` — official rules, restructured from the rulebook (default). Authoritative.
  - `mj/` — house rules (option `--homemade`). An **overlay** that only carries the modified rules and **explicitly declares** which canon rule it replaces/extends (never a silent divergence). In play, a declared house rule takes precedence; otherwise canon applies.
  Never mix canon and house rules in the same file. The optimized sections (CHEATSHEET / LEXICON / PATTERNS / ENTITY TEMPLATES / FULL REFERENCE) are kept in each sub-tree.
- **Shared output**: these sub-trees are the reference rules artifact for the obsidian solo-RPG suite. Everything is filed under the standalone game domain `R` (discovered locally by walking up to the first folder containing `_campagnes/`, `_univers/` or `_pjs/`). Two distinct provenance cases:
  - **Game system** → `R/_systeme/{canon,mj}/`. Mechanical reference **shared by `ttrpg:solo-mc`, `ttrpg:pc` and `ttrpg:campaign`** (mechanics, base oracle, character creation). The file `mj/solo.md` is written there by `ttrpg:solo-mc` during play (solo-play house rules) — see `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md`.
  - **Generic subsystem** (reusable module grafted onto a system — e.g. **Parallaxe**, **Cinério**, **Muses et Oracles**) → `R/_subsystems/<nom>/{canon,mj}/`. `rules-keeper` **produces** them, but they are **consumed by `ttrpg:solo-mc` only** (live-play tools) — neither `ttrpg:pc` nor `ttrpg:campaign` reference them. Optionally describing/publishing a subsystem = a dated writing project `R/<AAAA>/<MM>/<projet>/` (its game canon stays in `_subsystems/<nom>/`).

  Same provenance logic as `lore-extract`.
- **Regenerating canon from the PDF** — The system canon is derived from a commercial PDF via `extract-pdf` → `R/_systeme/sources/<source>/`, then dispatched by `rules-keeper` into `R/_systeme/canon/`. If `canon/` (or `sources/`) is absent, it is always rebuilt from the PDF (see `@02-restructure-all.md › Régénérer le canon depuis le PDF`). `rules-keeper` **never** writes into `canon/` without a source.

## References

- `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md` — local path convention for a game domain, resolution of `R`, canon pipeline, extract-pdf / lore-extract / rules-keeper boundary.
- `references/output-format.md` — complete annotated output format with all 6 sections
- `references/entity-templates.md` — base templates for PC, NPC, obstacle, and asset

## Evals

- `evals/scenarios.json`
