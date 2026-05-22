# 01 - Run

Parse a GitHub or GitLab issue, find the matching plan, generate a Playwright test file, run it, update the journey report row by row, post Summary and Conclusion to the issue.

## Inputs

- `issue_ref` (required) - string, GitHub/GitLab issue URL (`https://github.com/.../issues/N`) or short form (`#N`), provided as `$ARGUMENTS`

## Outputs

- Journey report file at `<plan_stem>.journey.md`, filled with all Steps rows, a Summary, and a Conclusion.
- A comment posted to the issue containing the Summary and Conclusion sections.
- `tests/e2e/_journey_temp.spec.ts` created during the run and deleted after.

## Process

1. **Parse `$ARGUMENTS`**: extract platform (GitHub or GitLab) and issue number. If `$ARGUMENTS` is empty or unparseable, abort with: "No issue reference provided. Usage: `/journey #N` or `/journey <issue-url>`".
2. **Fetch issue**: run `gh issue view <N> --json title,body,url` (GitHub) or `glab issue view <N> --output json` (GitLab). Extract title, body, and URL.
3. **Find plan file**: search `aidd_docs/tasks/` for a `.md` file whose content contains `**Branch name**` or references the issue number. If no plan is found, respond: "No plan found for this issue. Run `/plan` first to create one." and stop.
4. **Initialize report**: derive `report_path` as `<plan_stem>.journey.md` (same directory and base name as the plan file). Copy `@../assets/journey.md` to `report_path`. Fill in the header variables: `{title}`, `{issue_url}`, `{plan_file_path}`, `{yyyy-mm-dd}`, `{branch}` (from `git branch --show-current`).
5. **Parse steps**: read the issue body and extract ordered steps with their expected outcomes. Print the step list to the user before proceeding.
6. **Generate Playwright test**: for each step, generate one `test()` block that performs the action and asserts the expected outcome. Write all blocks to `tests/e2e/_journey_temp.spec.ts`. Follow conventions from `.claude/rules/custom/05-playwright-patterns.md`.
7. **Run tests**: execute `pnpm playwright test tests/e2e/_journey_temp.spec.ts --reporter=list`. After each test result, immediately update the corresponding row in the Steps table of `report_path` with `✅` or `❌` and a brief note.
8. **Cleanup and finalize**: delete `tests/e2e/_journey_temp.spec.ts`. Write the Summary section (totals, duration) and the Conclusion paragraph to `report_path`.
9. **Post issue comment**: run `gh issue comment <N> --body "<Summary section>\n\n<Conclusion section>"` (or `glab` equivalent for GitLab).
10. **Ask user**: "Journey complete. Would you like to close the issue?"

## Test

Invoke with a valid issue number that has a linked plan in `aidd_docs/tasks/`. Verify that `<plan_stem>.journey.md` is created with all Steps rows filled (✅ or ❌), a Summary, and a Conclusion. Verify the issue comment is posted and `tests/e2e/_journey_temp.spec.ts` no longer exists.
