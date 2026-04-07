---
name: 'custom:08:close_issue'
description: 'Review the plan, generate changelog entry, then close the linked VCS issue (GitHub or GitLab)'
argument-hint: '<issue_id> (required if not provided interactively)'
---

# Close Issue

## Goal

Wrap up a completed plan: read the plan review, then close the linked issue with a summary comment.

## Rules

- Never close an issue without showing the closing comment to the user first
- If no issue number found or given, ask the user before proceeding

## Steps

1. Get current branch: `` `git branch --show-current` ``
2. Find the plan file in `aidd_docs/tasks/`: `.md` matching `**Branch name**: \`<current-branch>\`` (exclude `.processed.md`)
   - If not found: ask user to identify the plan file
3. Detect VCS from `vcs_cli` in `CLAUDE.md` Project Config:
   - `gh` → GitHub, use `gh` CLI
   - `glab` → GitLab, use `glab` CLI
   - If absent: detect from `` `git remote get-url origin` `` (github.com → `gh`, gitlab → `glab`), then write to `CLAUDE.md`
4. Determine the issue number:
   - If `$ARGUMENTS` is provided: use it directly
   - Otherwise: ask the user
5. Invoke `aidd:08:commit` with argument `auto` — runs silently without user confirmation, must complete before step 6
6. Build the closing comment from the plan:
   - Summary line from `## Feature > Summary`
   - Review file summary if present (`aidd_docs/tasks/**/*<issue_number>*.review.md`)
   - Commit hash: `` `git log --oneline -1` ``
7. Show the closing comment to user and **wait for confirmation**
8. Post comment then close:
   - GitHub: `` `gh issue comment <issue_id> --body "<closing-comment>"` `` then `` `gh issue close <issue_id>` ``
   - GitLab: `` `glab issue note <issue_id> --message "<closing-comment>"` `` then `` `glab issue close <issue_id>` ``
9. Rename plan file from `<name>.md` to `<name>.processed.md`
10. Chain with `custom:08:end_plan` (defaults: parent branch `main`, `/learn` oui, delete branch local only)
11. Chain with `custom:08:changelog` with argument `push=auto` (semver auto-detected, push tag + branch without confirmation)
