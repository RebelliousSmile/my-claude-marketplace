# Endtask worktree fixture

Synthetic, populated Git state for a read-only reasoning pass. Paths are examples, not real cleanup targets. Do not run Git mutations against them.

## Base repository

- Main worktree: `/fixture/project`, on `main`, clean, with `origin/main` configured.
- Task worktree: `/fixture/project-task-42`, on `feat/issue-42-cleanup`, clean after its initial conventional commit.
- `aidd_docs/tasks/2026_09/2026_09_16_cleanup/plan.md` is tracked, has `status: implemented`, `issue_number: 42`, and declares one tracked `phase-1.md` with `status: done`.
- The task branch has one commit absent from `main`; merging it causes no conflict. Pull, merge, push, changelog commit, tag push, and tracker closure succeed unless a scenario overrides one result.
- `10-learn` writes tracked `aidd_docs/memory/vcs.md` after the initial commit. A later task commit can capture that write before merge.
- The target branch is already checked out in the main worktree unless a scenario says it is free.

```txt
worktree /fixture/project
HEAD 1111111111111111111111111111111111111111
branch refs/heads/main

worktree /fixture/project-task-42
HEAD 2222222222222222222222222222222222222222
branch refs/heads/feat/issue-42-cleanup
```

## Scenario overlays

- **Target free:** `/fixture/project` is on `develop`; `main` remains a local branch but is checked out nowhere. Both worktrees are clean.
- **Dirty task:** after the release steps, `/fixture/project-task-42` has an untracked `notes.txt` and an unstaged modification to `README.md`.
- **Locked task:** the task worktree has `locked for investigation` in `git worktree list --porcelain`.
- **Primary task:** only `/fixture/project` exists; it is on `feat/issue-42-cleanup`, and `main` is free.
- **Direct target:** only `/fixture/project` exists; it is on `main` and the task is committed there.
- **Release failure:** the named operation returns nonzero; earlier operations have succeeded, later operations have not run.
- **Target-free release failure:** combine the target-free overlay with a failed tag push. The linked task worktree has already switched from `feat/issue-42-cleanup` to `main`; the original feature branch still points to its recorded tip.
- **Feature upstream:** `feat/issue-42-cleanup` tracks `origin/feat/issue-42-cleanup`. The local task tip is merged into `main`, but the remote feature branch has not advanced, so an upstream-aware `git branch -d` refuses the local deletion.
- **Dirty target:** `/fixture/project` has an unrelated uncommitted `local-notes.md` before pull; the task worktree remains clean.
- **Branch deletion failure:** after successful release and worktree removal, Git rejects both the normal and verified fallback branch deletion. The feature branch still exists and points to the recorded task tip.

The fixture is documentary: the judge must evaluate intended Git operations and report content, never run them.
