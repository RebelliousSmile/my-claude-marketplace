---
name: rules-keeper
model: sonnet
description: Restructures any game rules file into an LLM-optimized format (CHEATSHEET + LEXICON + PATTERNS + ENTITY TEMPLATES + FULL REFERENCE) ready for use by `write` and `review` skills — and by the obsidian solo-RPG suite (`solo-mc`, `pc`, `rpg`) as the shared system-rules reference, separating the official ruleset (canon/) from the GM's house rules (mj/, `--homemade`). Use when integrating a new game system, when rules files are verbose or poorly structured, or when merging a supplement into an existing rules file. Do NOT use for extracting lore or universe documentation — use `lore-extract` instead; do NOT use to write new rules from scratch — use `write` instead.
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
- **Canon vs maison (mj)** : distinguer le **ruleset officiel** des **règles maison du MJ**, dans deux sous-arbres :
  - `canon/` — règles officielles, restructurées depuis le livre de règles (défaut). Font foi.
  - `mj/` — règles maison / *house rules* (option `--homemade`). Un **overlay** qui ne reprend que les règles modifiées et **déclare explicitement** quelle règle canon il remplace/étend (jamais de divergence silencieuse). Au jeu, une house rule déclarée prime ; sinon le canon s'applique.
  Ne jamais mélanger canon et maison dans un même fichier. Les sections optimisées (CHEATSHEET / LEXICON / PATTERNS / ENTITY TEMPLATES / FULL REFERENCE) sont conservées dans chaque sous-arbre.
- **Sortie partagée** : ces sous-arbres sont l'artefact de référence des règles pour la suite JDR solo d'obsidian. Le coffre JDR est rangé **par jeu** (`<jeu>` = premier segment sous la racine). Deux cas de provenance distincts :
  - **Système de jeu** → `JDR/<jeu>/systeme/{canon,mj}/`. Référence mécanique **partagée par `solo-mc`, `pc` et `rpg`** (mécaniques, oracle de base, création de personnage).
  - **Sous-système générique** (module réutilisable greffé sur un système — ex. **Parallaxe**, **Cinério**, **Muses et Oracles**) → `JDR/<jeu>/subsystems/<nom>/{canon,mj}/`, avec repli sur les sous-systèmes **partagés** entre jeux dans `JDR/subsystems/<nom>/{canon,mj}/`. `rules-keeper` les **produit**, mais ils sont **consommés par `solo-mc` uniquement** (outils de jeu en direct) — ni `pc` ni `rpg` ne les référencent.

  Même logique de provenance que `lore-extract`.
- **Convention de versioning (`tnn-jdr`)** — Dans le dépôt `tnn-jdr`, l'**output** de `rules-keeper` pour le système de jeu (`JDR/<jeu>/systeme/canon/`) **et** son **input** (les sources de règles brutes, `JDR/<jeu>/systeme/sources/<source>/`) sont **gitignored** (`**/systeme/canon/`, `**/sources/`). Conséquence : après un clone sur une nouvelle machine, **ni** le canon régénéré **ni** les sources brutes n'existent — reconstruire le canon impose un **setup from scratch** complet depuis le PDF commercial (voir `@02-restructure-all.md › Setup from scratch`). Non couverts par le glob `**/systeme/canon/`, donc versionnés : les règles maison `systeme/mj/` et les sous-systèmes `subsystems/<nom>/canon/`.

## References

- `@setup/references/vault-layout.md` — convention des chemins par jeu, pipeline canon, frontière extract-pdf / lore-extract / rules-keeper.
- `references/output-format.md` — complete annotated output format with all 6 sections
- `references/entity-templates.md` — base templates for PC, NPC, obstacle, and asset

## Evals

- `evals/scenarios.json`
