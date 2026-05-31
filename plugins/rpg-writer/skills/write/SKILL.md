---
name: write
model: opus
description: Writes narrative chapters (novel or RPG) in Markdown, following TOC specifications, output-style, and universe documentation. Use when writing a new chapter, rewriting a chapter from persona feedback (--feedback mode), writing narrative fiction, or writing RPG game documents (scenarios, rulebooks, calling sheets). Do NOT use for correcting existing chapters — use `review` instead; do NOT use for planning the TOC — use `toc` instead.
---

# Write

Generates chapter content in Markdown from TOC specifications, output-style conventions, and universe documentation. Operates in two modes: **novel** (narrative fiction) and **roleplaying** (RPG scenarios, rulebooks, calling sheets). Both modes support `--feedback` for full rewrites informed by persona analysis.

## Available actions

| #   | Action            | Role                                                           | Input                                             |
| --- | ----------------- | -------------------------------------------------------------- | ------------------------------------------------- |
| 01  | `write-novel`     | Write a narrative chapter following TOC + output-style         | chapter number [--feedback <comment-file>]        |
| 02  | `write-roleplaying` | Write an RPG chapter (scenario, rules, calling sheet)        | chapter number [--feedback <comment-file>]        |

## Default flow

Trigger-to-action mapping:
- "write chapter", "write novel chapter", "write the next chapter", "écrire le chapitre" → `write-novel`
- "write roleplaying chapter", "write scenario", "write the calling sheet", "write RPG content", "écrire le livret" → `write-roleplaying`

Both actions follow the same internal steps: Load → Analyze → Draft → Brainstorm & Refine → Write → Validate → Save.

## Transversal rules

- Load ALL required resources before writing: bank.yml, output-style, universe docs, TOC chapter spec.
- Follow output-style conventions STRICTLY (dialogue format, POV, tense, description density).
- Save output to `chapitres/chapitre<NN>.md`.
- Never invent content not present in the TOC or universe documentation.
- `--feedback` mode: FULL rewrite from TOC, not a patch. Never read the existing chapter. Persona feedback becomes writing constraints, not a diff to apply.
- Mark key point coverage with hidden HTML comments: `<!-- KEY_POINT: [desc] - COVERED -->`.
- French typography: guillemets « », tirets cadratins —, points de suspension …, espaces insécables.
- **Setup après clone (`tnn-jdr`)** — Les `rules-files` du système (`<systeme-root>/canon/`) et tous les `sources/` ne sont **pas versionnés** (gitignored). Après un clone sur une nouvelle machine, `<systeme-root>/canon/` est absent : relancer `extract-pdf` puis `rules-keeper` pour le régénérer avant d'écrire règles/scénarios qui en dépendent. Le lore `<univers-root>/.docs/canon/` et `.docs/mj/` sont versionnés et survivent au clone.

## Path variables

| Variable | Resolved value |
|----------|----------------|
| `<univers-root>` | `<jeu>/univers/<univers>/` |
| `<systeme-root>` | `<jeu>/systeme/` |
| `<projet-root>` | `<jeu>/ecrits/<projet>/` |

Full convention: `setup/references/vault-layout.md`.

## External data

- `bank.yml` — declares output-style paths, universe docs, TOC, personas, rules-files.
- `.toc/toc-chapter<NN>.md` — chapter spec (synopsis, key points, tone, length).
- `<univers-root>/.output-styles/<univers>-<type>.md` — writing conventions (path declared in `bank.yml > output-style`).
- `<univers-root>/.docs/canon/` — official lore (terminologie, factions, histoire, …).
- `<univers-root>/.docs/mj/` — MJ additions. Both `canon/` and `mj/` are loaded via the `bank.yml > docs` list.
- `<systeme-root>/` — rules-files (loaded via `bank.yml > rules-files`).
