# Report

Generates a full project status report covering tests, task digest, audit findings, security findings, quick wins, and a prioritized 7-day action plan. Audit and security axes are opt-in (`--audit`); by default the report reuses the latest `aidd-dev:04-audit` run instead of auditing the codebase itself.

## Inputs

- None required
- `--audit` — optional. Runs the audit and security axes live (steps 4-6). Without it, findings are reused from the latest `aidd-dev:04-audit` run and the report stays fast.

## Outputs

A filled status report saved to `aidd_docs/tasks/status/<yyyy>_<mm>_<dd>_project_status.md`, rendered from `@../assets/project_status.md`.

Inline summary displayed to the user after saving:

```
## Status — Report
Saved: `aidd_docs/tasks/status/<date>_project_status.md`

| Metric | Value |
|--------|-------|
| Branch | `<branch>` |
| Tests | ✅/❌ N tests, Xs |
| Coverage | N% lines / N% branches / N% functions |
| Open issues | N |
| Pending tasks | N |
| Audit findings | N (axes: <axis1>, <axis2>) — live / reused from <yyyy-mm-dd> / none on record |
| Security findings | N (axes: <axis1>, <axis2>) — live / reused from <yyyy-mm-dd> / none on record |
| Quick wins | N |

7-Day plan: J1–J7 populated
```

## Process

1. Scan project state: run `npm test -- --coverage --silent 2>&1 | tail -20` to extract pass/fail, test count, duration, and coverage percentages. Run `git log --oneline -15` for recent activity context. Run `cat package.json | head -30` to identify project type and scripts.
2. Digest the task tree from metadata only — never read a task document in full. Read the `status:` frontmatter of each plan (`for f in $(find aidd_docs/tasks -name plan.md); do printf "%s\t%s\n" "$(sed -n "s/^status: *//p" "$f" | head -1)" "$f"; done`) and fall back to filenames and mtimes for the legacy flat layout (`find aidd_docs/tasks -maxdepth 2 -name "*.md" -printf '%TY-%Tm-%Td %p\n'`). Count each plan as pending, in-progress, implemented, reviewed, blocked, or stale (no completion status and untouched for >30 days). A directory without a direct `plan.md` is not a plan unit: report-only directories (`aidd_docs/tasks/status/`, `aidd_docs/tasks/memory/`, `aidd_docs/tasks/audits/`, `<yyyy_mm_dd>_audit/`, `<yyyy_mm_dd>_memory-check/`) are excluded from the digest. Flag naming inconsistencies (mixed date formats, missing date prefix).
3. Collect all known work: list open GitHub/GitLab issues (`gh issue list --state open` or `glab issue list`), identify in-progress features from task files, extract TODO/FIXME comments from source (`grep -r "TODO\|FIXME" src/`), and list pending tasks from task files.
4. Resolve the findings source. Without `--audit`, reuse the most recent audit on record — `ls -td aidd_docs/tasks/*/*_audit aidd_docs/tasks/audits 2>/dev/null | head -1`, then read its `report.md` — and carry its findings into the report with its date and the axes it covered. When no audit is on record, leave both finding sections empty, state `none on record`, and recommend `aidd-dev:04-audit`. Never grep the codebase for findings on the default path.
5. With `--audit` only — select the 2 most critical audit axes from: dead code, cyclomatic complexity, duplication, error handling gaps, excessive file length, missing test coverage; and the 2 most critical security axes from: input validation, auth/authorization, injection risks, dependency vulnerabilities, exposed secrets, output sanitization. Choose axes with the highest likelihood of actual findings in this codebase and relevant to its type.
6. With `--audit` only — execute 4 targeted verifications on the codebase (2 audit, 2 security): run grep, read, or static analysis commands to produce concrete findings with file references.
7. Extract quick wins: tasks that can be completed in under 15 minutes, sourced from TODO comments, trivial failing tests, missing docs entries, or easy dependency updates.
8. Distribute all collected work into a 7-day plan at 60 minutes per day, ordered by priority: J1-J2 address security findings, J3-J5 address audit/debt, J6-J7 address tests and coverage gaps. Reused findings feed the plan exactly like live ones, with their date carried through. Each day lists specific tasks with time estimates and slash commands where applicable.
9. Fill `@../assets/project_status.md` and save to `aidd_docs/tasks/status/<yyyy>_<mm>_<dd>_project_status.md`.
10. Display the inline summary to the user.

## Test

Invoke with `--audit` in a project that has tests and an `aidd_docs/tasks/` directory; verify `aidd_docs/tasks/status/<date>_project_status.md` is created and contains a Project Summary table, at least 2 Audit Findings sections, and a 7-Day Plan with entries for at least J1 and J2, and that the inline summary is displayed with all metrics filled. Invoke without `--audit` in the same project; verify no codebase grep or static analysis is run for findings, that the findings sections carry the reused audit date or `none on record`, and that the 7-Day Plan is still produced.
