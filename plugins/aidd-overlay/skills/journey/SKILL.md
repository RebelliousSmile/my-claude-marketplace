---
name: journey
description: Executes a user journey from a GitHub or GitLab issue, logs step-by-step Playwright results to a <plan>.journey.md report, and posts Summary and Conclusion to the issue. Use when a user wants to validate a feature end-to-end against an issue: "run the journey for issue #N", "test issue #N", "execute journey", "validate this issue with Playwright". Do NOT use for unit tests, API tests, non-Playwright testing, creating issues, or any task not linked to an existing GitHub/GitLab issue with a matching plan file.
---

# Journey

Journey drives end-to-end validation of a GitHub or GitLab issue: it finds the matching plan in `aidd_docs/tasks/`, generates a Playwright test file from the issue steps, runs it, logs every result into a structured report, and posts the Summary and Conclusion back to the issue.

## Available actions

| #  | Action | Role                                                                 | Input                                   |
|----|--------|----------------------------------------------------------------------|-----------------------------------------|
| 01 | `run`  | Parse issue → find plan → generate Playwright test → run → report → post comment | GitHub/GitLab issue URL or `#N` (`$ARGUMENTS`) |

## Default flow

Single action. Dispatch to `run` on any trigger.

## Transversal rules

- Issue reference is mandatory: abort with a clear message if `$ARGUMENTS` is empty or does not resolve to a valid issue.
- If no linked plan is found in `aidd_docs/tasks/`, propose `/plan` to the user and stop.
- Delete `tests/e2e/_journey_temp.spec.ts` after the test run completes, whether it passed or failed.
- Log results step by step into the report — never batch-write at the end.
- Post only the Summary and Conclusion sections to the issue comment, not the full report.

## Assets

- `assets/journey.md` — journey report template (copy to `<plan_stem>.journey.md` at step 3)

## External data

- `.claude/rules/custom/05-playwright-patterns.md` — Playwright conventions for this project
