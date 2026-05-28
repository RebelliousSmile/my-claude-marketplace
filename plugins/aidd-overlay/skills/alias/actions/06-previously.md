# Action 06 — previously

Generates a full project snapshot (tests, git activity, working tree, lint). If a status report exists from the last 7 days, prefixes the snapshot with a compact status summary; otherwise runs `/aidd-overlay:status` first to generate one, then extracts the summary.

## Context required

None required.

## Prompt

Execute the following workflow verbatim:

### Step 1 — Status check

Run the following command to find the most recent status report modified within the last 7 days:

```bash
find aidd_docs/tasks/status -name "*.md" -mtime -7 2>/dev/null | sort -r | head -1
```

### Step 2a — Recent status exists

If Step 1 returned a file path: read that file. Extract the **Project Summary** table (branch, tests, coverage, open issues) and the **Quick Wins** list. Display the following block before proceeding:

```
## Project Status (from <yyyy-mm-dd>)
| Metric | Value |
|--------|-------|
| Branch | `<branch>` |
| Tests | ✅/❌ N tests |
| Coverage | N% lines |
| Open issues | N |
| Quick wins | N |
```

### Step 2b — No recent status

If Step 1 returned nothing: invoke `/aidd-overlay:status` (report action). Wait for it to complete. Find the newly saved report file with:

```bash
ls -t aidd_docs/tasks/status/*.md 2>/dev/null | head -1
```

Read that file, extract the same fields, and display the same status block as in Step 2a.

### Step 3 — Project snapshot

Spawn 3 haiku sub-agents in parallel (background: true). Pass resolved depth as context to Agent "git". Default depth: 15 commits.

**Agent "git"** — branch, activity, working tree:
- `git branch --show-current` → current branch name.
- `git log --oneline -<N>` → group commits by theme; write 1–2 sentence synthesis per group; for each `#N` reference attempt `gh issue view N --json title,state` and include title + state.
- `git status -s` → categorize each entry into staged, unstaged, or untracked.
- Return: `{ branch, activity[], issues[], working_tree{ staged[], unstaged[], untracked[] } }`

**Agent "tests"** — test & coverage:
- Infer the test command from `CLAUDE.md` or `package.json` scripts (common: `pnpm test`, `npm run test:unit`, `vitest run`).
- Run it and capture output. Extract: pass/fail, total test count, duration in seconds, line/branch/function coverage %, files below coverage threshold.
- If the command is unavailable or fails with "no script found": return `{ test_status: "N/A" }`.
- Return: `{ test_status, test_count, duration_s, lines_pct, branches_pct, functions_pct, below_threshold[] }`

**Agent "lint"** — lint health:
- Infer the lint command from `CLAUDE.md` or `package.json` scripts (common: `pnpm lint`, `npm run lint`).
- Run `<lint command> 2>&1 | tail -5` and extract pass/fail.
- If unavailable: return `{ lint_status: "N/A" }`.
- Return: `{ lint_status }`

### Step 4 — Fill and display snapshot

Wait for all 3 agents to complete. Merge all returned data and fill `@../assets/previously.md`. Display the completed snapshot to the user immediately after the status block from Step 2.
