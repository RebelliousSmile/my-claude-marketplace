# Endtask

Fires the pre-crafted prompt for the full **commit → resolve implemented plan directory → learn → merge/push → changelog → push tags → close issue → safe worktree cleanup** workflow.

## Context required

- All changes must be implemented; any review required by the caller or project must have passed.
- The work may be on a dedicated plan branch or directly on the target branch (e.g. `develop`).
- A dedicated branch may be checked out in a linked worktree while the target branch is checked out in another worktree. Cleanup applies only to the linked worktree that started this task.
- AIDD plans use a feature directory `aidd_docs/tasks/<yyyy_mm>/<yyyy_mm_dd>_<feature>/` containing `plan.md` and its `phase-<n>.md` files. Completion is the `status: implemented` frontmatter value in `plan.md`; the filename carries no lifecycle suffix.
- Issue number: resolved automatically after the plan directory is found. No match means no issue; do not ask.

## Prompt

Execute the following workflow verbatim:

### Step 1 — Commit

Commit all staged and unstaged changes with a conventional commit message that summarises the work done. Do not push yet.

### Step 2 — Detect branch mode

Run `git branch --show-current` and `git rev-parse --show-toplevel` before changing branches. Record `current_branch` and the absolute `task_worktree` path.

- If `current_branch` is `main`, `master`, `develop`, or `staging`: set `has_plan_branch = false` and `target_branch = current_branch`.
- Otherwise: set `has_plan_branch = true` and determine `target_branch`:
  - If a branch name was passed as argument, use it.
  - Otherwise, inspect `git log --oneline --decorate HEAD` to detect the parent branch.
  - If still ambiguous, ask: *"Which branch should I merge `<current_branch>` into?"*

Run `git worktree list --porcelain` and match the record for `task_worktree` and the record whose `branch` is `refs/heads/<target_branch>`. Record whether `task_worktree` is the primary worktree (the first record) or a linked worktree, and record `target_worktree` if the target branch is already checked out. Do not infer worktree ownership from directory names. If the task path or branch ownership is ambiguous, stop before switching, merging, or deleting anything and report the ambiguity.

### Step 2b — Resolve the completed plan directory

Search `aidd_docs/tasks/**/plan.md` for the feature directory matching the current branch, task and recent commits. Read frontmatter rather than inferring lifecycle from a filename.

- Require `status: implemented`. Also accept `status: reviewed` when a review layer has advanced the same completed plan.
- Require every sibling `phase-<n>.md` declared by `plan.md` to exist and carry `status: done`.
- Record the feature directory as `plan_directory` and its `plan.md` as `plan_file`.
- Do **not** rename or move `plan.md`, the phase files, or their directory. The directory is the durable task record.
- Ignore another feature directory merely because its `plan.md` is implemented. If no unique match can be established, ask: *"Which feature directory in `aidd_docs/tasks/` contains the plan for this work?"*
- Legacy compatibility only: an existing `*.processed.md` may be read as a completed legacy plan, but never require or create `.pending.md`/`.processed.md` for a modern directory plan.

If the matching plan is `pending`, `in-progress`, or `blocked`, stop before merge and report that `aidd-dev:02-implement` must complete it; `endtask` never writes the plan lifecycle status.

### Step 2c — Detect issue number

Attempt to resolve `issue_number` from the following sources in priority order. Stop at the first match.

1. **Argument** — a number passed directly by the user (e.g. `endtask 42`).
2. **Branch name** — extract from `current_branch`: patterns `issue-42`, `#42`, `-42-`, or a leading numeric segment (e.g. `42-my-feature`). Ignore date-like segments (`YYYY`, `MM`, `DD`).
3. **Plan file frontmatter** — read `plan_file`; look for `issue_number:` or `tracker_id:`.
4. **Plan file content** — scan for `Fixes #42`, `Closes #42`, `**Issue:** #42`, `Ref: #42`.
5. **Recent commits** — run `git log --oneline -10`; scan messages for `#42`, `fix #42`, `close #42`.
6. **No match** — set `issue_number = none`. Do not ask.

### Step 3 — Verify the durable plan record

Confirm that `plan_directory`, `plan_file`, every declared phase and an optional `review.md` are tracked by Git. No archive rename is performed: `status: implemented` in `plan.md` is the completion marker.

### Step 4 — Capture learnings (auto-validate)

Invoke `/aidd-context:10-learn` from `task_worktree` on `plan_directory`, using `plan.md` as the primary source and its phase/review files only as supporting evidence.

**Auto-validate all proposed learnings without asking for confirmation** — save every entry that the skill surfaces. Do not pause or prompt the user at this step.

Before merging, review and commit any task-worktree changes produced by learning with a conventional commit. Require `git -C <task_worktree> status --porcelain` to be empty afterward; if it is not, stop and report the remaining changes. Record the final `current_branch` tip as `task_tip` after this commit. The merge must include `task_tip`.

### Step 5 — Merge and push

**If `has_plan_branch = true`** (dedicated branch):
- If `target_worktree` was found, use it for every target-branch Git command. Do not check out `target_branch` in `task_worktree` or another worktree.
- If no worktree owns `target_branch`, require the current worktree to be clean, then `git -C <task_worktree> switch <target_branch>` and set `target_worktree = task_worktree`. Keep `current_branch`, `task_tip`, and the original `task_worktree` path recorded. If a later step fails, retain the original task branch and report the path and branch actually checked out in that worktree.
- Require `git -C <target_worktree> status --porcelain` to be empty before pull or merge. Stop if the target worktree contains changes; do not alter another worktree's uncommitted files.
- Run `git -C <target_worktree> pull`, `git -C <target_worktree> merge --no-ff <current_branch>`, then `git -C <target_worktree> push`. Stop immediately if any command fails; if the merge conflicts, ask the user to resolve it before continuing. Keep the task branch and linked worktree for resumption.
- Do not delete the task branch here.

**If `has_plan_branch = false`** (working directly on target branch):
- `git push`

### Step 6 — Changelog

Invoke `/overcode:changelog` with `target_worktree` as its working directory: updates `CHANGELOG.md` from that branch's history, commits the file, and creates an annotated tag for the new version. If the host cannot run the skill in that worktree or the skill fails, stop and report the unfinished release; do not run it from a different worktree.

### Step 7 — Push tags

```bash
git -C <target_worktree> push --follow-tags
```

If this push fails, stop before issue closure or cleanup and report the failed tag push.

### Step 8 — Close issue

If `issue_number != none`: close the issue using the tracker (GitHub or GitLab) and add a closing comment referencing the tag or commit. If closure or the comment fails, stop before cleanup and report what succeeded and what did not.

If no issue number: skip this step silently.

### Step 9 — Clean up the completed task

Run this step only after every applicable operation in Steps 5–8 succeeds. A failed merge, push, changelog, tag push, or issue closure leaves the task branch and its linked worktree in place, even if earlier remote operations succeeded.

If `has_plan_branch = false`, there is no task branch or worktree to remove. Otherwise, require the recorded `task_tip` to be an ancestor of `target_branch` with `git -C <target_worktree> merge-base --is-ancestor <task_tip> <target_branch>` and require `current_branch` still to point to `task_tip`. If either check fails, keep the worktree and branch.

If `task_worktree` is the primary worktree, never remove it. Set `surviving_worktree = task_worktree`. If it still has `current_branch` checked out, switch to `target_branch` only if that branch is free; if the target is checked out elsewhere, retain `current_branch` and report the remaining cleanup. Once the primary worktree is off `current_branch`, delete only that ancestry-verified branch as described below.

For a linked `task_worktree`:

1. Re-read `git worktree list --porcelain` and require that the exact recorded `task_worktree` is still linked and not locked. Require `git -C <task_worktree> status --porcelain` to be empty, including untracked files. Do not use `--force`, unlock it, prune globally, or remove any other worktree. If a check fails, keep the worktree and branch and report the reason.
2. Set `surviving_worktree = target_worktree` when it differs from `task_worktree`; otherwise use the primary worktree path from `git worktree list --porcelain`. Run `git -C <surviving_worktree> worktree remove <task_worktree>`. Never execute removal from inside `task_worktree` or rely on it as the working directory afterward.

After the primary worktree has switched off the task branch, or after the linked task worktree has been removed, delete `current_branch` from `surviving_worktree`. Try `git -C <surviving_worktree> branch -d <current_branch>` first. If its merge check rejects deletion because the surviving worktree's `HEAD` or the branch's upstream is not the merged target, use `git -C <surviving_worktree> branch -D <current_branch>` only after the ancestry proof above and a fresh check that the branch still points to `task_tip`. Do not force deletion for any other error. If deletion fails, report the retained branch without claiming cleanup is complete.

### Step 10 — Report

| Field | Value |
|---|---|
| Commit | `<sha> <message>` |
| Plan completed | `<plan_directory>/plan.md` (`status: implemented|reviewed`) |
| Branch mode | `plan branch merged into <target>` or `direct commit on <target>` |
| Task worktree | `<task_worktree>` removed, retained with reason, or `—` for direct branch/primary worktree |
| Branch deleted | `<current_branch>` deleted, retained with reason, or `—` for direct branch |
| Tag | `<tag>` pushed |
| Issue closed | `#<n> <url>` or `—` |

### Step 11 — Offer a fresh context

Run this step only when every applicable operation in Steps 1–9 succeeded and the Step 10 report names
no incomplete release, issue handling, worktree cleanup, or branch cleanup. After the report table,
append one optional, localized prompt:

> Task complete. Would you like to start the next task with a fresh context?
> Claude Code: run `/clear`. Other hosts: open a new conversation or thread.

Never invoke `/clear`, a reset command, or a new-session action on the user's behalf. Never show this
option on a failure or partial-success path, because the current context is then needed for resumption.
This offer is the final output of `endtask`: do not invoke another skill or begin another work item after
it. If the user declines or ignores it, the current session remains usable without any guard, marker, or
restriction.
