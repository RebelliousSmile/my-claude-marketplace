# Generate

Produces a full project snapshot covering tests, coverage, recent git activity, working tree, and lint status — using 3 parallel haiku sub-agents to minimize latency.

## Inputs

- `$ARGUMENTS` (optional) - string: depth as commit count (e.g., `20`) or duration (e.g., `7d`); defaults to 15 commits

## Outputs

A filled snapshot rendered from `@../assets/previously.md`, displayed inline to the user.

## Process

1. **Resolve depth** from `$ARGUMENTS`: if empty → 15 commits; if numeric → use as `-<N>`; if contains `d`, `w`, or `h` → use as `--since=<duration>`.

2. **Spawn 3 haiku sub-agents in parallel** (background: true). Pass resolved depth as context to Agent "git".

   **Agent "git"** — branch, activity, working tree:
   - `git branch --show-current` → current branch name.
   - `git log --oneline -<N>` (or `--since=<duration>`) → group commits by theme; write 1–2 sentence synthesis per group; for each `#N` reference attempt `gh issue view N --json title,state` and include title + state.
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

3. Wait for all 3 agents to complete.

4. Merge all returned data and fill `@../assets/previously.md`. Present the completed snapshot to the user.

## Test

Invoke with no arguments in a project that has a test script and at least one commit; verify the output contains all five sections (Tests & Coverage, Recent Activity, Working Tree, Project Health, One-liner) with no placeholder values remaining, and that the three sub-agents were spawned concurrently.
