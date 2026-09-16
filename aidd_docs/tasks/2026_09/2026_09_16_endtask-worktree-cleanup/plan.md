---
objective: "Endtask closes a task from a Codex linked worktree and removes that clean worktree and its merged branch only after every applicable closure step succeeds, while preserving resumable state on failure."
status: in-progress
---

# Plan: Clean up Codex worktrees after endtask

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Make `endtask` complete its existing release flow from either a dedicated branch or a linked worktree, then safely remove the finished task worktree and branch. |
| **Source** | Approved brainstorm in the 2026-09-16 conversation: automatic cleanup after successful closure; preserve the worktree on failure or remaining changes. |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Make closure aware of linked worktrees and verify its safety boundaries | [`phase-1.md`](./phase-1.md) |

## Resources

| Source | Verified |
| --- | --- |
| https://git-scm.com/docs/git-worktree | `list --porcelain` identifies linked worktrees and their branches; `remove` rejects unclean or locked worktrees without force and cannot remove the main worktree. |
| https://git-scm.com/docs/git-branch | A branch checked out in another worktree cannot be treated like a free branch; deletion must follow worktree removal. |

## Decisions

| Decision | Why |
| --- | --- |
| Perform cleanup only after merge/push, changelog commit and tag push, and issue closure when applicable; then remove the task worktree before deleting its branch. | This matches the approved meaning of successful closure and preserves a place to resume after a partial release. |
| Use Git worktree metadata to identify the exact task and target worktrees; never force-remove a dirty or locked worktree, prune worktrees globally, or delete the primary worktree. | Cleanup must affect only the task's own disposable worktree and preserve other user work. |
| When no worktree owns the target branch, the clean invoking worktree may temporarily check it out; any later failure must leave the original task branch intact and identify the worktree's actual branch and path for resumption. | This allows the existing single-worktree path without implying that a failed release leaves the task branch checked out. |
| Verify that the task branch tip is reachable from the merged target before branch deletion, independently of the task branch's upstream setting. | A branch tracking an unadvanced remote can make `git branch -d` refuse even after a successful target merge; a verified merged branch can be removed safely. |
