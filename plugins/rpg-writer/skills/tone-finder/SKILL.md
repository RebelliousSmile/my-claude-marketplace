---
name: tone-finder
model: sonnet
description: Generates or updates an output-style file for a writing universe — from source texts (source mode), structured questionnaire (questionnaire mode), or by analyzing patterns in review feedback (improve mode). Use when defining the writing style for a new universe, updating a style based on persona feedback, or enriching an existing style with source material. Do NOT use for correcting chapter content — use `review` instead; do NOT use for generating chapters — use `write` instead.
---

# Tone Finder

Creates or improves output-style files that govern all subsequent writing and correction in a universe. Three production modes: **source** (extract style from provided documents), **questionnaire** (build style through structured Q&A), **hybrid** (partial sources + targeted questions), plus an **improve** mode to update existing styles from accumulated feedback patterns.

## Available actions

| #   | Action    | Role                                                              | Input                                                    |
| --- | --------- | ----------------------------------------------------------------- | -------------------------------------------------------- |
| 01  | `analyze` | Create output-style from source documents or questionnaire        | `<univers>` [source-files…] [--only novel\|rules\|scenario] [--extend] |
| 02  | `improve` | Update an existing output-style from review feedback patterns     | `<univers>` [--improve-from-feedback]                    |

## Default flow

Trigger-to-action mapping:
- "create output style", "define writing style", "tone finder", "find the tone", "style for my universe", "questionnaire style" → `analyze`
- "improve output style", "update style from feedback", "style from persona feedback", "--improve-from-feedback" → `improve`

## Transversal rules

- Analyze writing philosophy first, formatting conventions second.
- In questionnaire mode: co-construct examples with the user; maximum 15 questions total.
- In improve mode: extract patterns from `.wip/comments/*.md` and doctor reports before proposing changes.
- Output file path: `<univers-root>/.output-styles/<univers>-<type>.md` (`<univers-root>` = `<jeu>/_univers/<univers>/`).
- After writing, update `bank.yml` `output-style.<type>` field to point to the new file.
- All generated examples must reflect the universe's real style — never generic placeholder prose.

## References

- `references/output-style.md` — output-style file schema and field descriptions
- `references/typographie.md` — French typography rules referenced from output-style examples
- `setup/references/vault-layout.md` — path-variable convention (`<univers-root>`, …)
