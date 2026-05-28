# 03 - Reorganize

Redistribute existing project content to the standard structure defined in CLAUDE.md.

## Inputs

- `name` (required) - string, project folder name
- `type` (required) - enum: `commercial` | `open-source` | `personnel`

## Outputs

Restructured files in `Projets/<name>/` matching the standard layout for the given type.

## Process

1. Ask for `name` and `type` if not provided via `$ARGUMENTS`.
2. Read all existing files in `Projets/<name>/` (or a single `.md` file if not yet a folder).
3. Apply redistribution rules from `C:/Users/fxgui/Public/Notes/CLAUDE.md` (section "Règles de redistribution").
4. Present a redistribution plan: which content moves to which file. Wait for user validation before writing.
5. After validation, create missing files from templates at `C:/Users/fxgui/Public/Notes/Patterns/projet-template/`.
6. Write the redistributed content. Flag any content that could not be classified automatically.

## Test

After user validation and execution, each target file (`projet.md`, `backlog.md`, and the type-specific file) contains its expected section; no content is orphaned or duplicated across files.
