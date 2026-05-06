---
name: 'custom:07:project_status'
description: 'Export a full project status report with targeted audit, security findings and 7-day action plan'
---

# Project Status Export

## Resources

### Audit reference

```markdown
@.claude/commands/aidd/09/audit.md
```

### Security reference

```markdown
@.claude/commands/aidd/09/security_refactor.md
```

### Output template

```markdown
@aidd_docs/templates/custom/project_status.md
```

## Goal

Produce a markdown project status report anchored on real project state, with targeted audit and security findings, quick wins, and a concrete 7-day action plan.

## Rules

- Every finding must come from actual code analysis, not assumptions
- Audit and security axes are selected by relevance to scan results, not randomly
- Quick wins are tasks under 15 minutes extracted from findings
- The backlog includes ALL known work: open issues, in-progress features, bugs, tech debt, AND audit/security findings
- The 7-day plan derives from the full backlog — no generic filler tasks
- Prioritize: J1-J2 security, J3-J5 audit/debt, J6-J7 tests and hardening

## Process steps

1. Scan project state:
   - `! npm test -- --coverage --silent 2>&1 | tail -20`
   - `! git log --oneline -15`
   - `! cat package.json | head -30`
   - Read project structure and dependencies
2. Digest `aidd_docs/tasks/`: list all files, classify each as done/todo/stale, flag naming or organization inconsistencies (wrong folder, missing date prefix, mixed conventions)
3. Collect all known work: open issues (git issue tracker), in-progress features, known bugs, planned work from recent commits, TODOs, and pending tasks from the digest
4. From scan results, select the 2 most critical audit axes among: dead code, complexity, duplication, error handling, file length, missing tests
5. From scan results, select the 2 most critical security axes among: input validation, auth/authorization, injection risks, dependency vulnerabilities, secrets exposure, output sanitization
6. Execute the 4 targeted verifications on the codebase
7. Extract quick wins (< 15min tasks) from all sources
8. Distribute all work into 7-day plan (60min/day), ordered by priority. Each task includes a `/aidd:02:brainstorm` or `/aidd:03:plan` command ready to copy-paste
9. Render report using template, save to `aidd_docs/tasks/status/<yyyy>_<mm>_<dd>_project_status.md`
