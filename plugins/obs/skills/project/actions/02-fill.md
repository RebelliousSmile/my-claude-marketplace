# 02 - Fill

Fill project files by exploiting external sources before asking questions.

## Inputs

- `name` (required) - string, project folder name

## Outputs

Updated `.md` files in `Projets/<name>/` with no empty placeholders in critical sections.

## Process

1. Ask for `name` if not provided via `$ARGUMENTS`.
2. Read all `.md` files in `C:/Users/fxgui/Public/Notes/Pro/Projets/<name>/`.
3. Before asking questions, exploit available external sources:
   - GitHub repo URL present → read repo structure, README, `pyproject.toml`/`package.json` to infer stack; list open issues to populate the backlog.
   - Website URL present → fetch it to retrieve project context and description.
4. Present a draft of what was deduced automatically.
5. Ask only for what remains empty or ambiguous, grouped by file.
6. Update each file with the information gathered. Preserve existing format (tables, lists, sections).

## Test

After execution, read `projet.md`: no critical section (Contexte, Stack) is empty and no placeholder such as `[à compléter]` remains.
