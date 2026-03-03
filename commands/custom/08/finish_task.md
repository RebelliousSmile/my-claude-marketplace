---
name: 'aidd:08:finish_task'
description: 'Switch back to parent branch after PR creation, pull latest, and clean up task branch'
---

# Finish Task Prompt

After a PR/MR has been created on a task branch, cleanly return to the parent branch.

## Rules

- Never force-delete a branch with uncommitted changes
- Never push anything
- Always pull after checkout
- Confirm branch deletion with user before executing

## Steps

1. Get current task branch name: `` `git branch --show-current` ``
2. Detect parent branch:
   - Check open plan file frontmatter for `base` or `parent` field
   - Fallback: `` `git log --oneline --decorate HEAD` `` to find branch point
   - Fallback: ask user to confirm parent branch name
3. Confirm: display task branch → parent branch, ask user to validate
4. Checkout parent: `` `git checkout <parent>` ``
5. Pull latest: `` `git pull` ``
6. Find the task plan file in `aidd_docs/tasks/` matching the current branch name (any `.md` not already `.processed.md`)
   - If found: rename it from `<name>.md` to `<name>.processed.md`
7. Ask user: delete task branch? (local only / local + remote / keep)
   - Local: `` `git branch -d <task-branch>` ``
   - Remote: `` `git push origin --delete <task-branch>` ``
   - If branch not fully merged, warn and require explicit confirmation before `-D`
8. Report final state: current branch, last commit, renamed plan file, deleted branches
