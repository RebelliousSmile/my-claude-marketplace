# Action 04 — endplan

Fires the pre-crafted prompt to **archive the plan file, capture learnings, and close the branch if applicable**.

## Context required

Can be run from a dedicated plan branch **or** directly from the target branch (e.g. `develop`) when the implementer worked without creating a branch. If the target branch is ambiguous, ask before firing: *"Which branch should I merge into?"*

## Prompt

Execute the following workflow verbatim:

1. **Get current branch** — run `git branch --show-current`. Record as `current_branch`.

2. **Detect branch mode**:
   - If `current_branch` is `main`, `master`, `develop`, or `staging`, set `has_plan_branch = false` and `target_branch = current_branch`.
   - Otherwise, set `has_plan_branch = true` and determine `target_branch`:
     - If a branch name was passed as argument, use it.
     - Otherwise, inspect `git log --oneline --decorate HEAD` to detect the branch the current branch was created from.
     - If still ambiguous, ask: *"Which branch should I merge `<current_branch>` into?"*

3. **Find plan file** — search `aidd_docs/tasks/` for a `.pending.md` file. If not found, ask: *"Which file in `aidd_docs/tasks/` is the plan for this work?"*

4. **Archive plan file** — rename `<name>.pending.md` to `<name>.processed.md` in the same directory.

5. **Capture learnings** — invoke `/aidd-context:05-learn` to capture any final learnings from the plan.

6. **If `has_plan_branch = true`** (dedicated branch):
   - Checkout target branch: `git checkout <target_branch>`
   - Pull: `git pull`
   - Merge: `git merge --no-ff <current_branch>`. If a merge conflict occurs, stop and ask the user to resolve it before continuing.
   - Push: `git push`
   - Delete local plan branch: `git branch -D <current_branch>`

7. **If `has_plan_branch = false`** (working directly on target branch):
   - Push: `git push`

8. Report:
   - Current branch: `<target_branch>`
   - Last commit: `<sha> <message>`
   - Plan file archived: `<name>.processed.md`
   - Branch mode: `plan branch merged` or `direct commit on <target_branch>`
   - Deleted branch: `<current_branch>` *(only if has_plan_branch)*
