# 04 - Log Session

Update a project's notes after a work session.

## Inputs

- `name` (required) - string, project folder name
- `session_notes` (optional) - free-form description of what was done

## Outputs

- `projet.md`: new dated Journal entry + updated "En cours" section
- `backlog.md`: completed tasks moved to "Livré", new tasks added to "En attente"

## Process

1. Ask for `name` if not provided via `$ARGUMENTS`.
2. Read `projet.md` and `backlog.md` from `Projets/<name>/`.
3. Ask for:
   - What was accomplished during the session
   - What is now done (to check off in `backlog.md`)
   - What is in progress (to update "En cours" in `projet.md`)
   - New tasks or bugs discovered (to add to `backlog.md`)
   - Technical decisions made (to add to `projet.md`)
4. Update `projet.md`: add a dated entry in the Journal section; update "En cours".
5. Update `backlog.md`: check off completed tasks, move them to "Livré", add new tasks to "En attente".

## Test

Read `projet.md` Journal section: a new entry with today's date (`YYYY-MM-DD`) is present.
