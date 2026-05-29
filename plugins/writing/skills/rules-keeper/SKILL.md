---
name: rules-keeper
model: sonnet
description: Restructures any game rules file into an LLM-optimized format (CHEATSHEET + LEXICON + PATTERNS + ENTITY TEMPLATES + FULL REFERENCE) ready for use by `write` and `review` skills — and by the obsidian solo-RPG suite (`solo-mc`, `pc`, `rpg`) as the shared system-rules reference. Use when integrating a new game system, when rules files are verbose or poorly structured, or when merging a supplement into an existing rules file. Do NOT use for extracting lore or universe documentation — use `lore-extract` instead; do NOT use to write new rules from scratch — use `write` instead.
---

# Rules Keeper

Restructures existing rules files into a standardized LLM-optimized format for rapid recall and consistent application during writing sessions. System-agnostic: works for any tabletop RPG, wargame, or card game.

## Available actions

| #   | Action        | Role                                                               | Input                                                     |
| --- | ------------- | ------------------------------------------------------------------ | --------------------------------------------------------- |
| 01  | `restructure` | Analyze and restructure a single rules file into optimized format  | `<rules-file.md>`                                         |
| 02  | `restructure-all` | Restructure all files in the project's rules-files/ directory  | *(no argument — uses bank.yml to locate rules-files)*     |
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
- **Sortie partagée** : le fichier de règles optimisé est aussi l'artefact de référence du système pour la suite JDR solo d'obsidian (`solo-mc`, `pc`, `rpg`) — mécaniques, oracle, création de personnage. Pour le système Parallaxe, le maintenir dans `JDR/parallaxe/`. Conserver les sections (CHEATSHEET / LEXICON / PATTERNS / ENTITY TEMPLATES / FULL REFERENCE) pour l'interopérabilité entre les deux usages.

## References

- `references/output-format.md` — complete annotated output format with all 6 sections
- `references/entity-templates.md` — base templates for PC, NPC, obstacle, and asset

## Evals

- `evals/scenarios.json`
