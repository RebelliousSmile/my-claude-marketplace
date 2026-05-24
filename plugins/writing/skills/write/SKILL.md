---
name: write
description: Writes narrative chapters (novel or RPG) in Markdown, following TOC specifications, output-style, and universe documentation. Use when writing a new chapter, rewriting a chapter from persona feedback (--feedback mode), writing narrative fiction, or writing RPG game documents (scenarios, rulebooks, calling sheets). Do NOT use for correcting existing chapters — use `review` instead; do NOT use for planning the TOC — use `plan` instead.
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

## External data

- `bank.yml` — declares output-style paths, universe docs, TOC, personas.
- `.toc/toc-chapter<NN>.md` — chapter spec (synopsis, key points, tone, length).
- `<univers>/.output-styles/<univers>-<type>.md` — writing conventions.
- `<univers>/.docs/UNIVERS.md`, `terminologie.md` — universe documentation.
