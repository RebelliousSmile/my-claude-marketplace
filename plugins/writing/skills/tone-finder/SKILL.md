---
name: tone-finder
model: sonnet
description: Generates or updates an output-style file for a writing project — from source texts (source mode), structured questionnaire (questionnaire mode), or by analyzing patterns in review feedback (improve mode). Use when defining the writing style for a new project, updating a style based on persona feedback, or enriching an existing style with source material. Do NOT use for correcting chapter content — use `review` instead; do NOT use for generating chapters — use `write` instead.
---

# Tone Finder

Creates or improves output-style files that govern all subsequent writing and correction in a project. Three production modes: **source** (extract style from provided documents), **questionnaire** (build style through structured Q&A), **hybrid** (partial sources + targeted questions), plus an **improve** mode to update existing styles from accumulated feedback patterns.

Reads the **brief model**: `${CLAUDE_PLUGIN_ROOT}/references/brief-model.md`. All context comes from `<brief>/summary.md`. **Output-style files are written into `<brief>/output-styles/`** — they become available to `write` and `review` immediately after generation.

## Available actions

| #   | Action    | Role                                                              | Input                                                                        |
| --- | --------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 01  | `analyze` | Create output-style from source documents or questionnaire        | `<brief>` [source-files…] [--only novel\|rules\|scenario] [--extend]        |
| 02  | `improve` | Update an existing output-style from review feedback patterns     | `<brief>` `--out <output>` [--only novel\|rules\|scenario]                  |

## Default flow

Trigger-to-action mapping:
- "create output style", "define writing style", "tone finder", "find the tone", "style for my project", "questionnaire style" → `analyze`
- "improve output style", "update style from feedback", "style from persona feedback", "--improve-from-feedback" → `improve`

## Transversal rules

- Analyze writing philosophy first, formatting conventions second.
- In questionnaire mode: co-construct examples with the user; maximum 15 questions total.
- In improve mode: extract patterns from `<output>/review/` feedback files before proposing changes.
- **When `improve` fires**: `improve` updates the output-style (bump `version:`, `v+1`) once `comment` flags a systemic pattern recurring over **≥3 chapters** — a style-convention gap, not a one-chapter slip. Trigger defined in `${CLAUDE_PLUGIN_ROOT}/references/review-loop.md`.
- Output file path: `<brief>/output-styles/<name>.md`.
- All generated examples must reflect the project's real style — never generic placeholder prose.

## External data

- `${CLAUDE_PLUGIN_ROOT}/references/brief-model.md` — the brief → output working-dir contract.
- `${CLAUDE_PLUGIN_ROOT}/references/review-loop.md` — convergence loop; defines when `improve` is triggered.
- `references/output-style.md` — output-style file schema and field descriptions.
- `references/typographie.md` — French typography rules referenced from output-style examples.
