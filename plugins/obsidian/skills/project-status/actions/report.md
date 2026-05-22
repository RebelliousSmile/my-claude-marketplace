# Report

Generates a full project status report covering tests, task digest, audit findings, security findings, quick wins, and a prioritized 7-day action plan.

## Inputs

- None required

## Outputs

A filled status report saved to `aidd_docs/tasks/status/<yyyy>_<mm>_<dd>_project_status.md`, rendered from `@../assets/project_status.md`.

## Process

1. Scan project state: run `npm test -- --coverage --silent 2>&1 | tail -20` to extract pass/fail, test count, duration, and coverage percentages. Run `git log --oneline -15` for recent activity context. Run `cat package.json | head -30` to identify project type and scripts.
2. Digest `aidd_docs/tasks/`: list all files with `find aidd_docs/tasks -type f -name "*.md"`. Classify each as done (filename contains `done`, `completed`, or content shows completion), todo/pending (open tasks), or stale (last modified >30 days with no completion signal). Flag naming inconsistencies (mixed date formats, missing date prefix).
3. Collect all known work: list open GitHub/GitLab issues (`gh issue list --state open` or `glab issue list`), identify in-progress features from task files, extract TODO/FIXME comments from source (`grep -r "TODO\|FIXME" src/`), and list pending tasks from task files.
4. Select the 2 most critical audit axes from: dead code, cyclomatic complexity, duplication, error handling gaps, excessive file length, missing test coverage. Choose axes with highest likelihood of actual findings in this codebase.
5. Select the 2 most critical security axes from: input validation, auth/authorization, injection risks, dependency vulnerabilities, exposed secrets, output sanitization. Choose axes relevant to this project type.
6. Execute 4 targeted verifications on the codebase (2 audit, 2 security): run grep, read, or static analysis commands to produce concrete findings with file references.
7. Extract quick wins: tasks that can be completed in under 15 minutes, sourced from TODO comments, trivial failing tests, missing docs entries, or easy dependency updates.
8. Distribute all collected work into a 7-day plan at 60 minutes per day, ordered by priority: J1-J2 address security findings, J3-J5 address audit/debt, J6-J7 address tests and coverage gaps. Each day lists specific tasks with time estimates and slash commands where applicable.
9. Fill `@../assets/project_status.md` and save to `aidd_docs/tasks/status/<yyyy>_<mm>_<dd>_project_status.md`.

## Test

Invoke in a project that has tests and an `aidd_docs/tasks/` directory; verify `aidd_docs/tasks/status/<date>_project_status.md` is created and contains a Project Summary table, at least 2 Audit Findings sections, and a 7-Day Plan with entries for at least J1 and J2.
