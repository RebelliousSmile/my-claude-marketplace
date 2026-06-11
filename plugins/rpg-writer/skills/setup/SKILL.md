---
name: setup
description: Initializes or audits a narrative writing project (bank.yml, output-styles, personas, directory structure). Use when creating a new writing project from scratch, running an integrity check on an existing one, or migrating content to the workshop structure. Do NOT use for writing chapters — use `write` instead; do NOT use for brainstorming concepts — use `brainstorm` instead.
disable-model-invocation: true
---

# Setup

Bootstraps a new writing project or audits an existing one against its `bank.yml` declarations. Runs in two modes: **init** (create what is missing) and **audit** (report only, zero writes). Both modes resolve `<jeu>/_ecrits/<projet>` path format and validate the by-game directory tree required by the workshop pipeline.

## Available actions

| #   | Action  | Role                                                          | Input                                      |
| --- | ------- | ------------------------------------------------------------- | ------------------------------------------ |
| 01  | `init`  | Create project structure and write bank.yml after validation  | project path `<jeu>/_ecrits/<projet>`       |
| 02  | `audit` | Check integrity of an existing project — no modifications     | project path + `--integrity-check` flag    |

## Default flow

Trigger-to-action mapping:
- "init project", "new writing project", "create project", "initialise project" → `init`
- "audit project", "integrity check", "--integrity-check" → `audit`

## Transversal rules

- Never overwrite existing files — create only what is missing.
- `bank.yml` is written once, at the end of the `init` flow, after explicit user validation.
- All project-facing output in the project's declared language (default: French for narrative content).
- In `audit` mode: report only, no files created or modified.
- Path parsing: `<univers>` = first path segment, `<projet>` = second path segment.
- If path is missing or ambiguous → ABORT with a clear error message before any action.

## References

- `references/bank-yml.md` — bank.yml schema and field descriptions
- `references/vault-layout.md` — single source of truth for all path variables (`<jeu>`, `<univers-root>`, `<projet-root>`, etc.)
