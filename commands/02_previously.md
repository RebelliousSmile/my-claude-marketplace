---
name: 'custom:02:previously'
description: 'Synthetic project snapshot — tests, coverage, analyzed recent activity, project health'
argument-hint: '[depth: number of commits (default 15) or duration like 7d]'
---

# Previously — Project Snapshot

## Goal

Produce a concise, analyzed snapshot of the project state so the user can resume work with full context.

## Output template

```markdown
@aidd_docs/templates/custom/previously.md
```

## Steps

1. Identify current branch
   `! git branch --show-current`

2. Run tests with coverage
   `! npm run test:unit 2>&1`
   Extract: pass/fail, test count, duration, coverage percentages, files below threshold.

3. Analyze recent git activity
   - Determine depth from `$ARGUMENTS` (default: 15 commits). If a duration like `7d` is given, use `--since`.
   - `! git log --oneline -<N>` or `! git log --oneline --since="<duration>"`
   - Group commits by theme/intent (not 1:1 commit list)
   - For each group: synthesize what changed and why in 1-2 sentences
   - If commit messages reference issues (#N), try to fetch issue info:
     - `! gh issue view <N> --json title,state -q '"\(.title) [\(.state)]"' 2>/dev/null`
     - If gh fails: `! glab issue view <N> 2>/dev/null`
     - If both fail: just mention the issue number without metadata
   - List open referenced issues with title and status

4. Inspect working tree
   `! git status -s`
   Categorize files as staged, unstaged, untracked.

5. Run lint check
   `! npm run lint 2>&1 | tail -5`

6. Fill the output template and present to user
   - All sections populated with real data
   - One-liner summary: overall health + suggested focus area
