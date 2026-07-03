# 03 - Reorganize

Redistribute existing project content to the standard structure.

## Inputs

- `name` (required) - string, project folder name
- `type` (required) - enum: `commercial` | `open-source` | `personnel`

## Outputs

Restructured files in `Pro/Projets/<name>/` matching the standard layout for the given type.

## Process

1. Ask for `name` and `type` if not provided via `$ARGUMENTS`.
2. Read all existing files in `Pro/Projets/<name>/` (or a single `.md` file if not yet a folder). Anchor resolved as `obs:tree` does.
3. Apply the classification contract from `references/redistribution-rules.md` (which content goes into which file/section).
4. For verbose or noisy content, delegate reduction to `obs:filler` (`condense`/`synthesize`) before redistributing.
5. Present a redistribution plan: which content moves to which file. **Wait for user validation before writing.**
6. After validation, create missing files from templates at `references/projet-template/`.
7. Write the redistributed content. Flag any content that could not be classified automatically.

## Test

After user validation and execution, each target file (`projet.md`, `backlog.md`, and the type-specific file) contains its expected section; no content is orphaned or duplicated across files.
