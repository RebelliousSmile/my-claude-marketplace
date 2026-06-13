---
name: write
model: opus
description: Writes narrative chapters (novel or RPG) in Markdown from the brief and TOC, following the output-style. Use when writing a new chapter, rewriting a chapter from persona feedback (--feedback mode), writing narrative fiction, or writing RPG game documents (scenarios, rulebooks, calling sheets). Do NOT use for correcting existing chapters — use `review` instead; do NOT use for planning the TOC — use `toc` instead.
---

# Write

Generates chapter content in Markdown from the brief's `summary.md`, the TOC (if any), and an output-style. Operates in two modes: **novel** (narrative fiction) and **roleplaying** (RPG scenarios, rulebooks, calling sheets), selected from the **type** declared in `summary.md`. Both modes support `--feedback` for full rewrites informed by persona analysis.

Reads the **brief model**: `${CLAUDE_PLUGIN_ROOT}/references/brief-model.md`. All context comes from `<brief>/summary.md` (lore/mechanics consolidated) — `write` never reads outside `<brief>/` and `<output>/`. **Short-form**: with no TOC, write a single `chapter-01.md` straight from `summary.md`.

## Available actions

| #   | Action            | Role                                                           | Input                                                          |
| --- | ----------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| 01  | `write-novel`     | Write a narrative chapter following TOC + output-style         | `<brief>` `--out <output>` `--chapter <NN>` [`--feedback <f>`] |
| 02  | `write-roleplaying` | Write an RPG chapter (scenario, rules, calling sheet)        | `<brief>` `--out <output>` `--chapter <NN>` [`--feedback <f>`] |

## Default flow

Mode is chosen from `summary.md > type` (roman → `write-novel`, JDR/roleplaying → `write-roleplaying`). Trigger-to-action mapping:
- "write chapter", "write novel chapter", "écrire le chapitre" → `write-novel`
- "write roleplaying chapter", "write scenario", "écrire le livret" → `write-roleplaying`

Both actions follow the same internal steps: Load → Analyze → Draft → Brainstorm & Refine → Write → Validate → Save.

## Transversal rules

- Load required inputs before writing: `<brief>/summary.md`, an output-style from `<brief>/output-styles/`, and the TOC spec from `<output>/toc/` if present. Nothing else.
- Follow output-style conventions STRICTLY (dialogue format, POV, tense, description density).
- Save output to `<output>/chapters/chapter-<NN>.md`.
- Never invent content not present in `summary.md` or the TOC. If something needed is absent, the brief is incomplete — report it.
- `--feedback` mode: FULL rewrite from the TOC/summary, not a patch. Never read the existing chapter. The feedback file (under `<output>/review/`) becomes writing constraints, not a diff to apply.
- Mark key point coverage with hidden HTML comments: `<!-- KEY_POINT: [desc] - COVERED -->`.
- French typography: guillemets « », tirets cadratins —, points de suspension …, espaces insécables.

## External data

- `${CLAUDE_PLUGIN_ROOT}/references/brief-model.md` — the brief → output working-dir contract.
- `<brief>/summary.md` — autonomous brief (synopsis, type, language, lore, mechanics).
- `<brief>/output-styles/<name>.md` — writing conventions.
- `<output>/toc/chapter-<NN>.md` (or `toc/INDEX.md`) — chapter spec, if the project has a TOC.
- `<output>/review/chapter-<NN>-<persona>.md` — persona feedback, in `--feedback` mode.
