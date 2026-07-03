# 01 - Create

Create a new project folder with the appropriate template files.

## Inputs

- `name` (required) - string, project folder name (case-preserved)
- `type` (required) - enum: `commercial` | `open-source` | `personnel`

## Outputs

Folder `Pro/Projets/<name>/` containing:

```
commercial  → projet.md + memory.md + backlog.md + commercial.md
open-source → projet.md + memory.md + backlog.md + communication.md
personnel   → projet.md + memory.md + backlog.md + objectifs.md
```

## Process

1. Ask for `name` and `type` if not provided via `$ARGUMENTS`.
2. Read template files from `references/projet-template/` for the chosen type.
   - **If a template file reads empty or unreadable, flag the missing body and do not write that file — never invent content.**
3. Resolve the `Pro/` anchor (as `obs:tree` does) and create folder `Pro/Projets/<name>/`.
4. Write each file, replacing `[Projet]` with `name` and example dates with today's date (`YYYY-MM-DD`).
5. Confirm the files created and remind the user that `projet.md` expects a 3-line context summary.

## Test

`Pro/Projets/<name>/projet.md` exists on disk and does not contain the literal string `[Projet]`. No file is written from an empty/corrupt template (the missing body is flagged instead).
