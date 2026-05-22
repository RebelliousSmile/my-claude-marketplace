---
name: end-plan
description: Archives a plan file as processed, merges the current plan branch into the target branch, and deletes the local plan branch. Use when a user finishes a plan and wants to close it out: "end plan", "close this plan", "merge the plan branch", "archive the plan", "finish the plan branch". Do NOT use for pushing to remote automatically, force-deleting branches with uncommitted changes, creating new plans, or any task that is not about archiving a completed plan branch.
---

# End-Plan

End-Plan archives the current plan's task file by renaming it to `.processed.md`, runs `/learn` to capture any final learnings, merges the plan branch into the target branch without fast-forward, and deletes the local plan branch.

## Available actions

| #  | Action  | Role                                                                        | Input                                                    |
|----|---------|-----------------------------------------------------------------------------|----------------------------------------------------------|
| 01 | `close` | Archive plan → run /learn → merge into target → delete local branch        | Target branch name (`$ARGUMENTS`, optional)              |

## Default flow

Single action. Dispatch to `close` on any trigger.

## Transversal rules

- Never force-delete a branch that has uncommitted changes.
- Never push to remote automatically (push is intentionally excluded).
- Always run `git pull` after checking out the target branch before merging.
- Only delete the local plan branch — never delete the remote tracking branch.
