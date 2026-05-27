# Action 02 — implement-review

Fires the pre-crafted prompt for the **implement → double review** workflow.

## Context required

An approved plan file must exist in `aidd_docs/tasks/`.
If absent, ask before firing: *"Which plan file should I implement from?"*

## Prompt

Execute the following workflow verbatim:

1. Run `/aidd-dev:02-implement` from the current approved plan in `aidd_docs/tasks/`.

2. Once implementation is complete, run both reviews in parallel:
   - `/aidd-dev:05-review` — functional review
   - `/aidd-dev:05-review` — code review

3. Collect all findings from both reviews.

4. If findings exist:
   - Fix them all before proceeding.
   - Do not commit until both reviews return clean.

5. Report:
   - Files changed and implementation summary
   - Functional review result
   - Code review result
   - Fix summary (if issues were found and resolved)
