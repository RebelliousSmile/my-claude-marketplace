---
name: persona
model: sonnet
description: Creates and refines reader persona YAML files used by the review pipeline. Use when creating a new reader persona for a project brief, or refining an existing persona based on accumulated review feedback. Do NOT use for running the review itself — use `review` instead; do NOT use to assemble the brief — use `obs:brief` instead.
---

# Persona

Manages reader personas consumed by the `review` skill. Two operations: **generate** creates a new YAML persona from a description and writes it to `<brief>/personas/`; **train** refines an existing persona by analyzing patterns across accumulated review feedback files under `<output>/review/` to sharpen scoring criteria, must-haves, and deal-breakers.

Reads the **brief model**: `${CLAUDE_PLUGIN_ROOT}/references/brief-model.md`.

## Available actions

| #   | Action     | Role                                                             | Input                                          |
| --- | ---------- | ---------------------------------------------------------------- | ---------------------------------------------- |
| 01  | `generate` | Create a new persona YAML from a description or profile          | `<brief>` + persona description                |
| 02  | `train`    | Refine an existing persona from accumulated review feedback files | `<brief>` `--out <output>` + persona-id        |

## Default flow

Trigger-to-action mapping:
- "create persona", "generate persona", "new reader persona", "build persona" → `generate`
- "train persona", "refine persona", "update persona from feedback" → `train`

## Transversal rules

- Persona IDs are kebab-case slugs: `gm-practitioner`, `casual-reader`, `fan-wot`.
- Personas are always written to `<brief>/personas/<id>.yaml`.
- Scoring criterion weights MUST sum to 1.0.
- `train` reads only `<output>/review/chapter-<NN>-<persona>.md` files; never invent patterns.
- **When `train` fires**: only when a persona proves **unreliable** — it caps (≤11/20) repeatedly (**≥3 chapters**) on chapters the *other* personas and the craft checklist judge sound (**uncorroborated** verdict = the persona drifted). A persona capping on a *corroborated* real defect is doing its job — fix the text/style, never retrain it (that would silence a valid critic). Trigger defined in `${CLAUDE_PLUGIN_ROOT}/references/review-loop.md`.
- After training, increment the persona version comment in the YAML header.
- The `<brief>/` is read-only for all other writing skills; `persona` is the only skill that writes into `<brief>/personas/`.

## External data

- `${CLAUDE_PLUGIN_ROOT}/references/brief-model.md` — the brief → output working-dir contract.
- `${CLAUDE_PLUGIN_ROOT}/references/review-loop.md` — convergence loop; defines when `train` is triggered.
- `<brief>/summary.md` — brief autosuffisant (for context if needed).
- `<output>/review/chapter-<NN>-<persona>.md` — feedback files consumed by `train`.
