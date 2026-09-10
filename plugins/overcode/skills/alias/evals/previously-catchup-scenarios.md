# Previously — documentary catch-up scenarios

Behavioural checks for the read-only catch-up path. Run as a reasoning pass over the three sources; never mutate `aidd_docs/`, the working tree, or the conversation store.

| # | Fixture | Expectation |
|---|---|---|
| P1 | A project with no status report on disk. | No `status report` invocation, no escalation; the briefing is produced from conversations, `aidd_docs/` and git alone. |
| P2 | A project whose test suite takes 4 minutes. | Neither the suite, the linter, nor a coverage pass is run. The output carries no test, coverage, or lint figure, and points at `status report` in one line. |
| P3 | `~/.claude/history.jsonl` holds prompts for three projects. | Only entries whose `project` equals the working directory are read, and only those inside the window. |
| P4 | The last transcript carries an `ai-title` and an `isCompactSummary` line. | The session title and the compaction summary feed the "Since last time" section; nothing else from the transcript reaches the briefing. |
| P5 | `~/.claude/projects/<slug>/` is missing or empty. | The conversation source degrades to `N/A`; the briefing is still produced from `aidd_docs/` and git. |
| P6 | One plan is `in-progress` with `phase-1.md` and `phase-2.md` done, `phase-3.md` pending. | The resume line names `phase-3` of that feature; phase files are read as frontmatter only. |
| P7 | A commit inside the window touches `aidd_docs/memory/vcs.md`. | The learnings row names the bank; no ADR or memory file is read in full. |
| P8 | A probe hangs (slow filesystem, absent `gh`). | It is killed by its `timeout`, yields `N/A`, and is never retried; the briefing still renders. |
| P9 | The conversation history and `aidd_docs/` disagree about what is in flight. | The most recent source wins and the divergence is stated in one clause; no codebase verification is attempted. |
| P10 | `previously --backlog docs/roadmap.md` on a project with open issues. | The backlog receipt is emitted once before the briefing; a `backlog` failure stops the action before any source is collected. |

Pass when no invocation runs a build command, when every source is bounded by a `timeout`, and when a missing source degrades instead of blocking.

## Results

### 2026-09-10 — contract dry-run — 10/10 PASS

| Scenario | Verdict | Evidence |
|---|---|---|
| P1 | PASS | The action header forbids invoking `status report`; no step references it. |
| P2 | PASS | Same header forbids suite, linter and coverage; Step 6 forbids fabricating those figures and redirects to `status report`. |
| P3 | PASS | The Step 3 extractor keeps only lines whose `project` equals the working directory and whose timestamp is inside the window. |
| P4 | PASS | The extractor emits the last `ai-title` and the last `isCompactSummary` per transcript, capped at 2000 characters, and nothing else. |
| P5 | PASS | An empty glob yields no session block, and the time-budget rule turns a source that finds nothing into `N/A`. |
| P6 | PASS | Step 4 reads phase frontmatter only and names the first phase that is not `done` as the resume point. |
| P7 | PASS | Step 4 derives learnings from `git log -- aidd_docs/memory/`, naming banks without opening them. |
| P8 | PASS | Every probe is wrapped in `timeout 5`; the budget rule forbids a retry or a heavier substitute. |
| P9 | PASS | Step 3 prefers the most recent material, Step 6 requires the divergence clause, and the header forbids codebase verification. |
| P10 | PASS | Step 2 emits the receipt once before the briefing and stops the action on failure, ahead of source collection. |
