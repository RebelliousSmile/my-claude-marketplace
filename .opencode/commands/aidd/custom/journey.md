---
name: journey
description: Run a user journey from a GitHub/GitLab issue, log step-by-step results to {plan}.journey.md, and post Summary+Conclusion to the issue.
argument-hint: '<GitHub/GitLab issue URL or #N>'
---

# Journey Prompt

## Goal

Execute a user journey end-to-end from a linked GitHub/GitLab issue,
record each step result in a journey report file derived from the plan,
then post the Summary and Conclusion sections as an issue comment.

Input: `$ARGUMENTS`

## Context

### Project-specific Playwright patterns

```markdown
@.claude/rules/custom/05-playwright-patterns.md
```

## Rules

- Issue reference is mandatory — abort with "Issue reference required" if missing
- No plan linked to the issue → propose `/plan $ARGUMENTS` and stop
- Playwright script `tests/e2e/_journey_temp.spec.ts` is always deleted after the run
- Log results step by step — do not batch-write at the end
- Report actual behavior even when it differs from expected
- Only post Summary + Conclusion to the issue, never the full file

## Steps

1. Parse `$ARGUMENTS` → extract platform and issue number
   - `github.com/.../issues/N` | `#N` | plain integer → GitHub: `gh issue view N --json title,body,url`
   - `gitlab.com/.../issues/N` → GitLab: `glab issue view N`
   - No valid ref → abort

2. Search `aidd_docs/tasks/` for a `.md` file (not `.processed.md`, not `.review.md`, not `.journey.md`)
   whose content references the issue number
   - Found → use it as linked plan, set `{plan_file}` = that path
   - Not found → print "No plan found for issue #{N}. Run `/plan $ARGUMENTS` first." and stop

3. Derive journey report path from plan filename:
   `{plan_file_stem}.journey.md` in the same `aidd_docs/tasks/{yyyy_mm}/` folder
   Initialize report using `@aidd_docs/templates/custom/journey.md`
   Fill header: issue URL, plan path, date, current branch

4. Parse issue body → extract ordered journey steps with expected outcomes
   Print resolved step list before proceeding

5. Check server readiness via Playwright webServer config (relies on `playwright.config.ts`
   `reuseExistingServer` + `webServer.url`):
   - Playwright will start or reuse the dev server automatically within the 120s timeout
   - No manual server check needed

6. Generate one Playwright `test()` block per step:
   - `baseURL` from `playwright.config.ts` — never hardcode URLs
   - Each step must have at least one `expect` assertion
   - Check `playwright/.auth/` for saved auth state and add `test.use({ storageState })` if found
   Write to `tests/e2e/_journey_temp.spec.ts`

7. Run:
   ```bash
   pnpm playwright test tests/e2e/_journey_temp.spec.ts --reporter=list
   ```
   Parse output → update report Steps table row by row (✅/❌ + notes)
   Append Failures section for each failed step with full error output

8. Delete `tests/e2e/_journey_temp.spec.ts`
   Write Summary and Conclusion sections to report file

9. Post Summary + Conclusion to the issue:
   ```bash
   gh issue comment N --body "$(sed -n '/^## Summary/,/^## /p' {journey_file} | head -n -1)"
   ```
   For GitLab: `glab issue note N --message "..."`
   Print the issue comment URL on completion

10. Ask user: close the issue?
    - If yes: `gh issue close N` (or `glab issue close N`)
    - If no: skip silently
