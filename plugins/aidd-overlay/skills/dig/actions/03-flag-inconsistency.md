# 03 - Flag inconsistency

When two files contradict each other or information is missing where it should be: notify the user, create a task file, and log the inconsistency in the session report.

## Inputs

- `file_1` (required) - string, path to the first file
- `file_2` (required) - string, path to the second file
- `description` (required) - string, one-sentence description of the contradiction
- `report_path` (required) - string, path to the current session report

## Outputs

Task file created at `aidd_docs/tasks/<YYYY_MM>/task-<YYYY-MM-DD>-<subject>.md`:

```markdown
# Task [<inconsistency subject>]

Inconsistency detected during a Dig session on <date>.

## Files involved

- [ ] `<file_1>` — <what it says>
- [ ] `<file_2>` — <what it says that contradicts>

## To fix

- [ ] Determine which source is correct
- [ ] Update the incorrect file
- [ ] Check if other files are impacted
```

## Depends on

- `02-run-quiz`

## Process

1. Briefly notify the user inline (do not interrupt the quiz flow):
   > "⚠️ Inconsistency detected between `<file_1>` and `<file_2>` — creating a task."
2. Derive `<subject>` from the contradiction description (3–5 word kebab-case slug, e.g. `auth-token-expiry-mismatch`).
3. Create the task file at `aidd_docs/tasks/<YYYY_MM>/task-<YYYY-MM-DD>-<subject>.md` with the structure shown in **Outputs**.
4. Append an entry to the session report under `## Inconsistencies detected`:
   ```
   - task-<YYYY-MM-DD>-<subject>.md — <one-line description>
   ```
5. Resume the quiz loop without blocking.

## Test

Simulate a contradiction between two `.md` files in the project (e.g. one defines a config key that another overrides with a different value); verify a task file is created at the correct path with both "Files involved" checkboxes filled and all three "To fix" items present.
