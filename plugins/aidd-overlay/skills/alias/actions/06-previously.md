# Action 06 — previously

Project snapshot (tests, git activity, working tree, lint) prefixed with a status summary. If a status report from the last 7 days exists, use it; otherwise run `/aidd-overlay:status` first.

## Context required

None required.

## Prompt

### Step 1 — Status check

```bash
find aidd_docs/tasks/status -name "*.md" -mtime -7 2>/dev/null | sort -r | head -1
```

### Step 2a — Recent status exists

Read the returned file. Extract the **Project Summary** table and **Quick Wins** list. Display:

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

Invoke `/aidd-overlay:status` (report action). Once complete:

```bash
ls -t aidd_docs/tasks/status/*.md 2>/dev/null | head -1
```

Read that file and display the same status block as Step 2a.

### Step 3 — Project snapshot

Spawn 3 haiku sub-agents in parallel (background: true). Default depth: 15 commits.

**Agent "git"** — branch, activity, working tree:
- `git branch --show-current`
- `git log --oneline -<N>` → group by theme; for each `#N` attempt `gh issue view N --json title,state`
- `git status -s` → categorize: staged / unstaged / untracked
- Return: `{ branch, activity[], issues[], working_tree{ staged[], unstaged[], untracked[] } }`

**Agent "tests"** — test & coverage:
- Infer test command from `CLAUDE.md` or `package.json` (common: `pnpm test`, `vitest run`).
- Extract: pass/fail, test count, duration, line/branch/function coverage %, below-threshold files.
- If unavailable: return `{ test_status: "N/A" }`.
- Return: `{ test_status, test_count, duration_s, lines_pct, branches_pct, functions_pct, below_threshold[] }`

**Agent "lint"** — lint health:
- Infer lint command from `CLAUDE.md` or `package.json` (common: `pnpm lint`).
- Run `<lint command> 2>&1 | tail -5`, extract pass/fail. If unavailable: `{ lint_status: "N/A" }`.
- Return: `{ lint_status }`

### Step 4 — Fill and display snapshot

Merge all agent data, fill `@../assets/previously.md`, display immediately after the status block.
