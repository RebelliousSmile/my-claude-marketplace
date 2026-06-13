# 02 - write

Write the guide sections from the approved outline.

## Inputs

- The approved outline from `01-outline`.
- Access to the product/UI or accurate source material for each task.

## Process

0. **Load the output style**: `${CLAUDE_PLUGIN_ROOT}/skills/user-guide/references/output-style.md` by default, or the file passed via `--style <path>`. Apply its voice, tense, callouts and formatting throughout.
1. **Write section by section** following the outline and `${CLAUDE_PLUGIN_ROOT}/skills/user-guide/references/user-guide-structure.md`.
2. **Getting started**: the shortest end-to-end path to a first success; numbered, one action per step, each stating the visible result.
3. **Task sections**: a one-line purpose, then numbered imperative steps, the expected result, and common variations. Keep UI labels exact.
4. **Troubleshooting**: symptom → cause → fix, for errors real users hit.
5. **Visuals**: insert `[screenshot: <what it shows>]` placeholders where they help; never fabricate UI you haven't seen.
6. **Plain language**: short sentences, define any unavoidable term, no internal jargon, no marketing words.
7. **Assumptions**: where source was missing, write the most likely steps and list them in an assumptions note rather than presenting guesses as fact.
8. **Export (if requested)**: if `--format icml` was passed, export the finished Markdown to ICML per `${CLAUDE_PLUGIN_ROOT}/references/export-icml.md`. The Markdown stays the source.

## Outputs

The drafted user guide (Markdown by default; plus a `.icml` export when `--format icml`), plus an assumptions note listing anything written without confirmed source.

## Test

Each documented task is completable by following only the guide, steps state their expected results, terminology matches the UI, and no feature/behavior is asserted without source (unknowns are in the assumptions note).
