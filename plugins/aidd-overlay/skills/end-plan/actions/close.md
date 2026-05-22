# 01 - Close

Archive the plan file, run /learn, merge the plan branch into the target branch with --no-ff, and delete the local plan branch.

## Inputs

- `target_branch` (optional, default: auto-detected from git log or user prompt) - string, the branch to merge the plan branch into

## Outputs

- Plan file renamed from `<name>.md` to `<name>.processed.md` in `aidd_docs/tasks/`.
- Plan branch merged into target branch with a merge commit.
- Local plan branch deleted.
- A summary report: current branch, last commit SHA, renamed plan file path, target branch, deleted branch name.

## Process

1. **Get current branch**: run `git branch --show-current`. Record as `plan_branch`.
2. **Determine target branch**:
   - If `$ARGUMENTS` is non-empty, use it as `target_branch`.
   - Otherwise, inspect `git log --oneline --decorate HEAD` to detect the branch the current branch was created from.
   - If still ambiguous, ask the user: "Which branch should I merge `<plan_branch>` into?"
3. **Find plan file**: search `aidd_docs/tasks/` for a `.md` file whose content contains `**Branch name**: \`<plan_branch>\``. If not found, ask the user: "Which file in `aidd_docs/tasks/` is the plan for `<plan_branch>`?"
4. **Rename plan file**: rename `<name>.md` to `<name>.processed.md` in the same directory.
5. **Run `/learn`**: invoke the `aidd-context:05-learn` skill automatically to capture any learnings from the plan before closing the branch.
6. **Checkout target branch**: run `git checkout <target_branch>`.
7. **Pull**: run `git pull` to ensure the local target is up to date.
8. **Merge**: run `git merge --no-ff <plan_branch>`. If a merge conflict occurs, stop and ask the user to resolve it before continuing.
9. **Push**: run `git push`.
10. **Delete local plan branch**: run `git branch -D <plan_branch>`.
11. **Report**: print a summary table:
    - Current branch: `<target_branch>`
    - Last commit: `<sha> <message>`
    - Plan file archived: `<name>.processed.md`
    - Deleted branch: `<plan_branch>`

## Test

Run on a plan branch that has a matching plan file in `aidd_docs/tasks/` containing `**Branch name**: \`<plan_branch>\``. Verify that the plan file is renamed to `.processed.md`, the branch is merged into the target with a merge commit, the local plan branch no longer exists, and the summary report is printed.
