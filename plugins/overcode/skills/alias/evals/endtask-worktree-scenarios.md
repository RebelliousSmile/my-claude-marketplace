# Endtask — linked worktree cleanup behavioural scenarios

Behavioural regression test for `plugins/overcode/skills/alias/actions/02-endtask.md`. It checks where `endtask` intends to merge and which worktree and branch it intends to remove after closure. The initial run records the original prompt's linked-worktree cleanup gap.

This suite differs from `plugins/overcode/skills/harvest/evals/plan-layout-scenarios.md`, which checks plan-directory lifecycle and does not exercise Git worktrees.

> **Fixture / preconditions.** Use the populated synthetic repository in [`fixtures/endtask-worktrees/fixture.md`](./fixtures/endtask-worktrees/fixture.md): two clean worktrees, a completed tracked plan, a post-commit learning write, a configured remote, and a resolvable issue. Apply only the overlay named by each scenario. A missing fixture precondition is N/A, not a pass or a product failure. All evaluation is read-only.

## Scenarios

| # | Situation | Expected behaviour | Pass criteria |
| --- | --- | --- | --- |
| S1 | Base fixture: run `endtask` from `/fixture/project-task-42`; `main` is checked out in `/fixture/project`. | Merge and release in the worktree owning `main`, then remove only the clean task worktree and its merged branch after issue closure. | Intended operations use `/fixture/project` for target commands, include `git worktree remove /fixture/project-task-42` after all release steps and branch deletion after removal; `/fixture/project` remains. |
| S2 | Target-free overlay: run from the clean linked task worktree while `main` is checked out nowhere. | Use the current linked worktree for the target branch and release, then remove that worktree after successful closure. | No second worktree is deleted; intended removal is `/fixture/project-task-42` only, after release, followed by deletion of `feat/issue-42-cleanup`. |
| S3 | Base fixture: `10-learn` writes `aidd_docs/memory/vcs.md` after the first commit. | Capture that write in a task commit before merge and keep the task worktree clean for eventual removal. | Intended merge contains the learning change; no uncommitted learning write is abandoned or force-removed. |
| S4 | Dirty-task overlay: after every release step succeeds, `notes.txt` and `README.md` have remaining changes in the task worktree. | Refuse automatic removal and report the retained worktree and branch for resumption. | No `git worktree remove --force`, global prune, file deletion, or task-branch deletion is intended; report names `/fixture/project-task-42`. |
| S5 | Locked-task overlay: all release steps succeed, but the task worktree is locked. | Preserve the locked task worktree and its branch and report incomplete cleanup. | Neither `git worktree remove --force` nor `git worktree unlock` is intended; the report does not claim deletion. |
| S6 | Release-failure overlay: tag push fails after merge, push, and changelog commit. | Keep the task worktree and branch so the release can resume. | No task worktree removal or task-branch deletion is intended after the failed tag push. |
| S7 | Release-failure overlay: issue closure fails after the tag push. | Keep the task worktree and branch until the applicable final step succeeds. | No task worktree removal or task-branch deletion is intended; report identifies the incomplete issue closure. |
| S8 | Primary-task overlay: run from `/fixture/project` on the task branch, with `main` free. | Preserve the primary worktree while completing the branch flow. | No intended `git worktree remove /fixture/project`; branch deletion can occur only after successful merge and every applicable release step. |
| S9 | **Positive control:** direct-target overlay: run from `/fixture/project` on `main`. | Complete the existing direct-branch push and release path without worktree cleanup. | No worktree removal or branch deletion is intended; push, changelog, tag push, and optional issue closure remain in the flow. |
| S10 | Target-free release-failure overlay: tag push fails after the task worktree switched to `main`. | Preserve the original feature branch and report that `/fixture/project-task-42` now has `main` checked out. | No removal or task-branch deletion is intended; the report names the actual worktree path and branch. |
| S11 | Feature-upstream overlay: all release steps succeed, but the feature branch tracks an unadvanced remote. | Prove the recorded task tip is merged into `main` before removing the linked worktree and, if normal branch deletion refuses, delete only that unchanged local task branch. | Intended operations include ancestry and unchanged-ref checks before removal; branch deletion happens only after worktree removal and does not depend on `origin/feat/issue-42-cleanup` advancing. |
| S12 | Dirty-target overlay: `/fixture/project` has unrelated changes before pull. | Stop before changing the target worktree and retain the clean task worktree and feature branch. | No pull, merge, target-file overwrite, task-worktree removal, or task-branch deletion is intended. |
| S13 | Release-failure overlay: merge conflicts in `/fixture/project`. | Stop for conflict resolution, preserving the task worktree and feature branch. | No push, changelog, tag push, issue closure, task-worktree removal, or task-branch deletion is intended after the merge failure. |
| S14 | Release-failure overlay: target-branch push fails after a successful merge. | Stop with task worktree and feature branch intact. | No changelog, tag push, issue closure, task-worktree removal, or task-branch deletion is intended after the failed push. |
| S15 | Release-failure overlay: changelog skill fails after target-branch push. | Stop with task worktree and feature branch intact. | No tag push, issue closure, task-worktree removal, or task-branch deletion is intended after the failed changelog step. |
| S16 | Branch-deletion-failure overlay: every release step and task-worktree removal succeeds, then both branch deletion attempts fail. | Report the removed worktree and retained branch as partial cleanup. | The report does not claim branch deletion or recreate/remove another worktree; the branch remains at its recorded tip. |
| S17 | Release-failure overlay: `git pull` fails in `/fixture/project` before merge. | Stop before merging and retain the task worktree and feature branch. | No merge, push, changelog, tag push, issue closure, task-worktree removal, or task-branch deletion is intended. |
| S18 | Release-failure overlay: tracker issue closure succeeds but its required closing comment fails. | Stop before cleanup and report that the issue closed while its comment did not. | No task-worktree removal or task-branch deletion is intended; the report does not claim complete issue handling. |
| S19 | Base fixture: every applicable release, issue and cleanup step succeeds. | Offer a fresh context only after the complete Step 10 report. | The final output proposes `/clear` on Claude Code or a new conversation on another host, invokes neither, and starts no next skill or work item. |
| S20 | Partial-success overlay: branch deletion fails after the task worktree was safely removed. | Preserve the current context for resumption and do not offer a reset. | The report names the retained branch; no fresh-context prompt, `/clear` invocation, session marker or new work item is intended. |

## How to run

Load `plugins/overcode/skills/alias/SKILL.md`, `plugins/overcode/skills/alias/actions/02-endtask.md`, this suite, and the fixture. For each row, reason from the actual instructions to the intended Git operations, their working directory and order, and the final report. Never execute commit, merge, push, tag, issue, worktree, or branch mutations. Judge PASS/FAIL/N/A from the stated pass criterion, citing the instruction that requires it or the missing instruction. Ignore the Results log until after grading.

Decisive observables: the exact worktree path affected; whether a target branch already checked out elsewhere is checked out again; whether task removal and branch deletion happen only after all applicable release steps; whether a dirty, locked, or primary worktree is preserved without force; whether learning writes are committed before merge. A target that merely *could* behave safely without an instruction requiring it does not pass.

After a fix, rerun the suite against the same fixture and compare each verdict. If all cleanup rows turn green, add a live same-family edge case before claiming the suite still detects newly introduced cleanup defects.

## Results log

### 2026-09-16 — run 1 (initial, dry-run, target=alias endtask, fixture=endtask-worktrees) — **1/9 PASS, 8 FAIL, 0 N/A**

Fixture: the completed issue-42 task occupies `/fixture/project-task-42`; `/fixture/project` owns `main`; `10-learn` writes `vcs.md` after the initial commit. Scenario overlays vary one condition at a time. The judge made no Git or tracker mutations.

| # | Verdict | Δ vs prior | Note (instruction cited) |
| --- | --- | --- | --- |
| S1 | FAIL | — | Step 5 checks out `main` in the task worktree although the fixture's primary worktree owns it; no worktree removal is prescribed. |
| S2 | FAIL | — | Step 5 can switch to the free target branch but deletes the task branch before Steps 6–8 and never removes the linked worktree. |
| S3 | FAIL | — | Step 4 writes after Step 1's only commit; Step 5 has no second task commit before merge. |
| S4 | FAIL | — | Step 5 has no cleanliness gate and specifies `git branch -D` despite remaining task changes. |
| S5 | FAIL | — | Steps 5 and 9 neither check the lock nor report incomplete cleanup. |
| S6 | FAIL | — | Step 5 deletes the branch before Step 7's tag push, which fails in this overlay. |
| S7 | FAIL | — | Step 5 deletes the branch before Step 8's issue closure, which fails in this overlay. |
| S8 | FAIL | — | The primary worktree is not removed, but Step 5 still deletes the branch before Steps 6–8 finish. |
| S9 | PASS | — | The direct-target branch path in Step 5 pushes without branch deletion, followed by Steps 6–8. |

**Frictions / gaps:** Step 5 assumes branch checkout in the invoking worktree and deletes the task branch too early. The prompt has no linked-worktree lookup, removal, cleanliness or lock gate, or retained-path report. Step 4's learning write is not followed by a task commit.

**Tally:** 1/9 PASS (0 N/A), 8 FAIL. No prior run exists for comparison. Re-run after the prompt change to test for FAIL→PASS and any PASS→FAIL regression.

### 2026-09-16 — run 2 (post-fix, dry-run, target=alias endtask, fixture=endtask-worktrees) — **16/16 PASS, 0 FAIL, 0 N/A**

Fixture: the same completed issue-42 task and worktree topology as run 1, with seven additional overlays for target-free failure, upstream tracking, target dirt, earlier release failures, and partial branch cleanup. The judge made no Git or tracker mutations.

| # | Verdict | Δ vs prior | Note (instruction cited) |
| --- | --- | --- | --- |
| S1 | PASS | ▲ | Steps 2 and 5 use the worktree owning `main`; Step 9 removes only the linked task worktree after closure. |
| S2 | PASS | ▲ | Steps 5 and 9 switch a free target in the linked worktree, remove that worktree after release, and permit verified branch deletion when surviving `HEAD` is `develop`. |
| S3 | PASS | ▲ | Step 4 commits `10-learn` writes before recording `task_tip` and merging. |
| S4 | PASS | ▲ | Step 9 preserves a dirty task worktree and branch without forced removal. |
| S5 | PASS | ▲ | Step 9 preserves a locked task worktree and reports incomplete cleanup. |
| S6 | PASS | ▲ | Steps 7 and 9 stop after failed tag push and skip cleanup. |
| S7 | PASS | ▲ | Steps 8 and 9 stop after failed issue closure or comment and skip cleanup. |
| S8 | PASS | ▲ | Step 9 never removes the primary worktree and delays branch deletion until after release. |
| S9 | PASS | = | Steps 5–9 preserve the direct-target path without worktree or branch removal. |
| S10 | PASS | new | Steps 5 and 9 retain the original task branch and report the actual checked-out branch and path after target-free failure. |
| S11 | PASS | new | Step 9 checks ancestry and branch-tip identity before deletion despite an unadvanced feature upstream. |
| S12 | PASS | new | Step 5 stops before pull when the target worktree is dirty. |
| S13 | PASS | new | Step 5 stops on merge conflict before later release operations. |
| S14 | PASS | new | Step 5 stops immediately on a failed target push. |
| S15 | PASS | new | Step 6 stops if the changelog skill fails. |
| S16 | PASS | new | Steps 9–10 report worktree removal and retained branch separately if branch deletion fails. |

**Frictions / gaps:** none under this fixture. The suite is now a green regression check; its current rows do not provide a live red case for judging a newly introduced defect beyond these behaviours.

**Tally:** 16/16 PASS (0 N/A), 0 FAIL. Eight prior FAILs became PASS, the positive control stayed PASS, and seven new cases passed. No PASS→FAIL regression.

### 2026-09-16 — run 3 (regression, dry-run, target=alias endtask, fixture=endtask-worktrees) — **18/18 PASS, 0 FAIL, 0 N/A**

Fixture: the same populated issue-42 repository and worktree overlays; S17 adds failed pull and S18 adds failed issue comment. The judge read the final prompt and fixture without Git or tracker mutations.

| # | Verdict | Δ vs prior | Note (instruction cited) |
| --- | --- | --- | --- |
| S1 | PASS | = | Steps 2, 5, and 9 use the existing target worktree and remove only the task worktree after closure. |
| S2 | PASS | = | Steps 5 and 9 switch the free target, then use the surviving primary worktree for removal and verified branch deletion. |
| S3 | PASS | = | Step 4 commits learning writes before merge. |
| S4 | PASS | = | Step 9 retains a dirty task worktree and branch. |
| S5 | PASS | = | Step 9 retains a locked task worktree and branch. |
| S6 | PASS | = | Steps 7 and 9 stop after tag-push failure. |
| S7 | PASS | = | Steps 8 and 9 stop after issue-closure failure. |
| S8 | PASS | = | Step 9 preserves the primary worktree. |
| S9 | PASS | = | Steps 5–9 preserve direct-target behaviour. |
| S10 | PASS | = | Steps 5 and 9 retain and report the branch after target-free failure. |
| S11 | PASS | = | Step 9 proves ancestry and branch-tip identity before upstream-independent deletion. |
| S12 | PASS | = | Step 5 stops on a dirty target worktree. |
| S13 | PASS | = | Step 5 stops on merge conflict. |
| S14 | PASS | = | Step 5 stops on target-push failure. |
| S15 | PASS | = | Step 6 stops on changelog failure. |
| S16 | PASS | = | Steps 9–10 report partial branch cleanup accurately. |
| S17 | PASS | new | Step 5 stops immediately on pull failure. |
| S18 | PASS | new | Step 8 stops if the closing comment fails and reports the partial tracker result. |

**Frictions / gaps:** none under this fixture. The suite remains an all-green regression check rather than a live-red reproduction for an unaddressed cleanup edge case.

**Tally:** 18/18 PASS (0 N/A), 0 FAIL. The prior 16 PASS stayed PASS and two new cases passed; no PASS→FAIL regression.

### 2026-09-23 — run 4 (regression, dry-run, target=alias endtask, fixture=endtask-worktrees+fresh-context) — **20/20 PASS, 0 FAIL, 0 N/A**

Fixture: the same populated issue-42 repository and overlays; S19 observes the new all-success terminal
offer, while S20 reuses partial branch cleanup to prove that the option is absent when resumption is due.
The judge read the action and fixture without Git, tracker, session-reset or skill mutations.

| # | Verdict | Δ vs prior | Note (instruction cited) |
| --- | --- | --- | --- |
| S1 | PASS | = | Steps 2, 5, 9 and 10 retain target-worktree ownership and safe cleanup. |
| S2 | PASS | = | Steps 5 and 9 retain the target-free switch, removal and verified deletion path. |
| S3 | PASS | = | Step 4 still commits learning writes before merge. |
| S4 | PASS | = | Step 9 still retains a dirty task worktree and branch. |
| S5 | PASS | = | Step 9 still retains a locked task worktree and branch. |
| S6 | PASS | = | Steps 7 and 9 still stop after tag-push failure. |
| S7 | PASS | = | Steps 8 and 9 still stop after issue-closure failure. |
| S8 | PASS | = | Step 9 still preserves the primary worktree. |
| S9 | PASS | = | Steps 5–9 retain direct-target behaviour. |
| S10 | PASS | = | Steps 5 and 9 retain and report the branch after target-free failure. |
| S11 | PASS | = | Step 9 still proves ancestry and branch-tip identity before deletion. |
| S12 | PASS | = | Step 5 still stops on a dirty target worktree. |
| S13 | PASS | = | Step 5 still stops on merge conflict. |
| S14 | PASS | = | Step 5 still stops on target-push failure. |
| S15 | PASS | = | Step 6 still stops on changelog failure. |
| S16 | PASS | = | Steps 9–10 still report partial branch cleanup accurately. |
| S17 | PASS | = | Step 5 still stops immediately on pull failure. |
| S18 | PASS | = | Step 8 still stops if the required closing comment fails. |
| S19 | PASS | new | Step 11 runs only after complete success, offers the host-native user action, invokes nothing and ends the workflow. |
| S20 | PASS | new | Step 11 excludes incomplete cleanup and explicitly preserves the current context without marker or guard. |

**Frictions / gaps:** none under this fixture.

**Tally:** 20/20 PASS (0 N/A), 0 FAIL. The prior 18 PASS stayed PASS and both fresh-context boundaries passed.
