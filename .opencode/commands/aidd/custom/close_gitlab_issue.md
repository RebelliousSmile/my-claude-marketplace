---
name: 'custom:08:close_gitlab_issue'
description: 'Review the plan, generate changelog entry, then close the linked GitLab issue'
argument-hint: '<issue_id> (required if not provided interactively)'
---

# Close GitLab Issue

## Goal

Wrap up a completed plan: read the plan review, generate the changelog, then close the linked GitLab issue with a summary comment.

## Rules

- Never close an issue without showing the closing comment to the user first
- Never push changelog without user confirmation
- If no issue number found or given, ask the user before proceeding

## Steps

1. Get current branch: `` `git branch --show-current` ``
2. Find the plan file in `aidd_docs/tasks/`: `.md` matching `**Branch name**: \`<current-branch>\`` (exclude `.processed.md`)
   - If not found: ask user to identify the plan file
3. Detect the GitLab repo from the git remote: `` `git remote get-url origin` ``
4. Determine the GitLab issue number:
   - If `$ARGUMENTS` is provided: use it directly
   - Otherwise: ask the user for the issue ID
5. Build the closing comment from the plan:
   - Summary line from `## Feature > Summary`
   - Validation flow results (did it pass?)
   - Link to the MR/commit if available: `` `git log --oneline -5` ``
6. Show the closing comment to user and **wait for confirmation**
7. Add closing comment first, then close:
   `` `glab issue note <issue_id> --repo <remote-url> --message "<closing-comment>"` ``
   `` `glab issue close <issue_id> --repo <remote-url>` ``
8. Ask user: also run `/custom:08:changelog`? (Recommended: Yes)
   - If yes: run `/custom:08:changelog`
9. Report: issue closed, link to issue
