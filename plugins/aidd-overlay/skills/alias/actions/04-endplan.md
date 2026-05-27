# Action 04 — endplan

Fires the pre-crafted prompt to **archive the plan file, merge the plan branch, and delete the local branch**.

## Context required

Must be run from a plan branch. If the target branch is ambiguous, ask before firing: *"Which branch should I merge into?"*

## Prompt

Execute the following workflow verbatim:

1. **Get current branch** — run `git branch --show-current`. Record as `plan_branch`.

2. **Determine target branch**:
   - If a branch name was passed as argument, use it.
   - Otherwise, inspect `git log --oneline --decorate HEAD` to detect the branch the current branch was created from.
   - If still ambiguous, ask: *"Which branch should I merge `<plan_branch>` into?"*

3. **Find plan file** — search `aidd_docs/tasks/` for a `.md` file whose content contains `**Branch name**: \`<plan_branch>\``. If not found, ask: *"Which file in `aidd_docs/tasks/` is the plan for `<plan_branch>`?"*

4. **Archive plan file** — rename `<name>.md` to `<name>.processed.md` in the same directory.

5. **Capture learnings** — invoke `/aidd-context:05-learn` to capture any final learnings from the plan before closing the branch.

6. **Checkout target branch** — run `git checkout <target_branch>`.

7. **Pull** — run `git pull` to ensure the local target is up to date.

8. **Merge** — run `git merge --no-ff <plan_branch>`. If a merge conflict occurs, stop and ask the user to resolve it before continuing.

9. **Push** — run `git push`.

10. **Delete local plan branch** — run `git branch -D <plan_branch>`.

11. Report:
    - Current branch: `<target_branch>`
    - Last commit: `<sha> <message>`
    - Plan file archived: `<name>.processed.md`
    - Deleted branch: `<plan_branch>`
