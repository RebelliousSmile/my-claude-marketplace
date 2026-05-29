---
name: persona
model: sonnet
description: Creates and refines reader persona YAML files used by the review pipeline. Use when creating a new reader persona for a specific project or universe, or refining an existing persona based on accumulated comment feedback. Do NOT use for running the review itself — use `review` instead; do NOT use for generating project configuration — use `setup` instead.
---

# Persona

Manages reader personas consumed by the `review:comment` action. Two operations: **generate** creates a new YAML persona from a description; **train** refines an existing persona by analyzing patterns across accumulated comment feedback files to sharpen scoring criteria, must-haves, and deal-breakers.

> Path variables: see `setup/references/vault-layout.md`.

## Available actions

| #   | Action     | Role                                                             | Input                                          |
| --- | ---------- | ---------------------------------------------------------------- | ---------------------------------------------- |
| 01  | `generate` | Create a new persona YAML from a description or profile          | persona description (e.g. "WoT fan reader")    |
| 02  | `train`    | Refine an existing persona from accumulated feedback files       | persona-id + `--feedback-files "<glob>"`       |

## Default flow

Trigger-to-action mapping:
- "create persona", "generate persona", "new reader persona", "build persona" → `generate`
- "train persona", "refine persona", "update persona from feedback", "--feedback-files" → `train`

## Transversal rules

- Persona resolution waterfall (first match wins):
  1. **projet** → `<projet-root>/.templates/personas/<id>.yml`
  2. **univers** → `<univers-root>/.templates/personas/<id>.yml`
  3. **shared** → `<vault>/_shared/personas/<id>.yml`
- Persona IDs are kebab-case slugs: `gm-practitioner`, `casual-reader`, `fan-wot`.
- Scoring criterion weights MUST sum to 1.0.
- `train` reads only `.wip/comments/*.md` files declared by the `--feedback-files` glob; never invent patterns.
- After training, increment the persona version comment in the YAML header.

## External data

- `bank.yml` → `personas.<tier>` — maps persona tiers (projet / univers / shared) to file path lists.
- `.wip/comments/<id>-*.md` — feedback files consumed by `train`.
