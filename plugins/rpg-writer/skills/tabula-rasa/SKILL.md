---
name: tabula-rasa
description: Destructively resets a writing project — removes generated content (chapters, TOC, WIP files) while preserving universe documentation and configuration. Use ONLY when intentionally starting over on a project. Do NOT use for routine cleanup; do NOT use for integrity checking — use `setup --integrity-check` instead.
disable-model-invocation: true
---

# Tabula Rasa

Destructive project reset. Removes generated files (chapters, TOC entries, WIP artifacts) while preserving universe documentation (`<univers>/.docs/`), output-styles, personas, and `bank.yml`. Requires explicit user confirmation before any deletion. Optionally creates a backup archive before resetting.

## Available actions

| #   | Action  | Role                                                 | Input                             |
| --- | ------- | ---------------------------------------------------- | --------------------------------- |
| 01  | `reset` | Archive + delete generated project content           | project path `<jeu>/ecrits/<projet>` |

## Default flow

Single action: `01`. No auto-trigger.

## Transversal rules

- ALWAYS offer a backup before deletion (archive to `<projet-root>/.backup/<projet>-<timestamp>/` or git stash).
- ALWAYS show the exact file list that will be deleted and ask explicit confirmation (`yes / no`).
- NEVER delete `bank.yml`, `<univers-root>/.docs/`, `<univers-root>/.output-styles/`, `<univers-root>/.templates/`.
- If user confirms: delete `<projet-root>/chapitres/`, `<projet-root>/.toc/`, `<projet-root>/.wip/`. Preserve `<projet-root>/research/` unless explicitly requested.
- Log the reset with timestamp to `<projet-root>/.backup/reset-log.md`.

> Path variables: see `setup/references/vault-layout.md`.
