### Main Workflow

Each step waits for user "oui" before continuing. Use `/aidd:00:auto_accept` to skip confirmations.

1. `brainstorm` or `create_user_story` → push to issue tracker — if issue already provided: read it first with `glab issue view N`, block if glab unavailable
2. `aidd:03:plan` with issue number → `aidd:03:challenge` until 100% confidence — always write plan to `aidd_docs/tasks`
3. `aidd:04:implement` with @kent
4. `custom:06:test_bruno` — iterate until all tests pass, fix any failures before proceeding
5. `aidd:05:review_functional` — fix all issues before proceeding
6. `aidd:05:review_code` — fix all issues before proceeding
7. If applicable: apply `@.claude/rules/custom/08-issue-closing.md`, then close the issue
8. `aidd:08:commit`
9. `custom:08:end_plan` — 3 confirmations: parent branch (default: main), run `/learn` (always yes), delete branch (user chooses)
10. `custom:08:changelog`