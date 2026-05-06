---
name: 'custom:08:end_plan'
description: 'Archive the plan as processed, run /learn, return to parent branch and clean up'
---

# End Plan Prompt

After a PR/MR has been created on a plan branch, archive the plan and cleanly return to the parent branch.

## Rules

- Never force-delete a branch with uncommitted changes
- Never push anything
- Always pull after checkout
- Only delete the local branch — never touch the remote

## Arguments

- `$TARGET_BRANCH` (optional): branch to merge into. Defaults to detected parent branch.

## Steps

1. Get current task branch name: `` `git branch --show-current` ``
2. Determine target branch:
   - If `$TARGET_BRANCH` was provided as argument: use it directly
   - Otherwise: detect parent branch via `` `git log --oneline --decorate HEAD` ``
   - Fallback: ask user to confirm parent branch name
3. Find the plan file: search `aidd_docs/tasks/` for a `.md` file (not `.processed.md`, not `.review.md`) whose content contains `` **Branch name**: `<current-branch>` ``
   - If not found: ask user to identify the plan file
4. Rename plan file from `<name>.md` to `<name>.processed.md`
5. Run `/learn` automatically (no confirmation needed)
6. Checkout target branch: `` `git checkout <target>` ``
7. Merge plan branch: `` `git merge --no-ff <plan-branch>` ``
8. Push: `` `git push` ``
9. Delete local plan branch: `` `git branch -D <plan-branch>` ``
10. Report final state: current branch, last commit, renamed plan file, deleted branch
