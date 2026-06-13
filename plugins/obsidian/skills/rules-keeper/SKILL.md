---
name: rules-keeper
model: sonnet
description: Restructures any game rules file into an LLM-optimized format (CHEATSHEET + LEXICON + PATTERNS + ENTITY TEMPLATES + FULL REFERENCE) ready for use by `writing:write` and `writing:review` skills — and by the solo-RPG suite (`obsidian:solo-mc` for live play, `obsidian:pc` and `obsidian:rpg`) as the shared system-rules reference, separating the official ruleset (canon/) from the GM's house rules (mj/, `--homemade`). Use when integrating a new game system, when rules files are verbose or poorly structured, or when merging a supplement into an existing rules file. Do NOT use for extracting lore or universe documentation — use `lore-extract` instead; do NOT use to write new rules from scratch — use `writing:write` instead.
---

# Rules Keeper

Restructures existing rules files into a standardized LLM-optimized format for rapid recall and consistent application during writing sessions. System-agnostic: works for any tabletop RPG, wargame, or card game.

## Available actions

| #   | Action        | Role                                                               | Input                                                     |
| --- | ------------- | ------------------------------------------------------------------ | --------------------------------------------------------- |
| 01  | `restructure` | Analyze and restructure a single rules file into optimized format  | `<rules-file.md>`                                         |
| 02  | `restructure-all` | Restructure all rules sources of the game domain  | *(no argument — scans `R/_savoir/systeme/sources/` locally)*     |
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
- **Sortie partagée** : ces sous-arbres sont l'artefact de référence des règles pour la suite JDR solo d'obsidian. Tout est rangé sous le domaine de jeu autonome `R` (découvert localement en remontant jusqu'au marqueur `_savoir/`). Deux cas de provenance distincts :
  - **Système de jeu** → `R/_savoir/systeme/{canon,mj}/`. Référence mécanique **partagée par `obsidian:solo-mc`, `obsidian:pc` et `obsidian:rpg`** (mécaniques, oracle de base, création de personnage). Le fichier `mj/solo.md` y est écrit par `obsidian:solo-mc` en jeu (house rules de jeu solo) — voir `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md`.
  - **Sous-système générique** (module réutilisable greffé sur un système — ex. **Parallaxe**, **Cinério**, **Muses et Oracles**) → `R/_savoir/subsystems/<nom>/{canon,mj}/`. `rules-keeper` les **produit**, mais ils sont **consommés par `obsidian:solo-mc` uniquement** (outils de jeu en direct) — ni `pc` ni `rpg` ne les référencent. Décrire/publier un sous-système éventuellement = un projet d'écriture daté `R/<AAAA>/<MM>/<projet>/` (son canon de jeu reste dans `_savoir/subsystems/<nom>/`).

  Même logique de provenance que `lore-extract`.
- **Régénération du canon depuis le PDF** — Le canon de système est dérivé d'un PDF commercial via `extract-pdf` → `R/_savoir/systeme/sources/<source>/`, puis ventilé par `rules-keeper` vers `R/_savoir/systeme/canon/`. Si le `canon/` (ou les `sources/`) est absent, il se reconstruit toujours depuis le PDF (voir `@02-restructure-all.md › Régénérer le canon depuis le PDF`). `rules-keeper` n'écrit **jamais** dans `canon/` sans source.

## References

- `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md` — convention de chemins locale d'un domaine de jeu, résolution de `R`, pipeline canon, frontière extract-pdf / lore-extract / rules-keeper.
- `references/output-format.md` — complete annotated output format with all 6 sections
- `references/entity-templates.md` — base templates for PC, NPC, obstacle, and asset

## Evals

- `evals/scenarios.json`
