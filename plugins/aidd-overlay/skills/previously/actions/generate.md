# Generate

Produces a full project snapshot covering tests, coverage, recent git activity, working tree, and lint status.

## Inputs

- `$ARGUMENTS` (optional) - string: depth as commit count (e.g., `20`) or duration (e.g., `7d`); defaults to 15 commits

## Outputs

A filled snapshot rendered from `@../assets/previously.md`, displayed inline to the user.

## Process

1. Run `git branch --show-current` to identify the current branch.
2. Run `npm run test:unit 2>&1` (or the project's configured test command if different). Extract: pass/fail status, total test count, duration in seconds, line/branch/function coverage percentages, and any files below the coverage threshold.
3. Determine depth from `$ARGUMENTS`: if empty use 15 commits; if a number use it as `-<N>`; if a duration (contains `d`, `w`, `h`) use `--since=<duration>`. Run `git log --oneline -<N>` or `git log --oneline --since=<duration>`. Group resulting commits by intent/theme. For each group write a 1-2 sentence synthesis of what changed and why. For each issue reference (e.g., `#42`) attempt `gh issue view 42 --json title,state` and include title and state if available.
4. Run `git status -s` and categorize each file into staged, unstaged, or untracked.
5. Run `npm run lint 2>&1 | tail -5` to extract lint status (pass/fail).
6. Fill all sections of `@../assets/previously.md` and present the completed snapshot to the user.

## Test

Invoke with no arguments in a project that has a test script and at least one commit; verify the output contains all five sections (Tests & Coverage, Recent Activity, Working Tree, Project Health, One-liner) with no placeholder values remaining.
