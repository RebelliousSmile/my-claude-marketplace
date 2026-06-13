# Action 02 — endtask

Fires the pre-crafted prompt for the full **commit → archive plan → learn → merge/push → changelog → push tags → close issue** workflow.

## Context required

- All changes must be implemented and reviewed.
- The work may be on a dedicated plan branch or directly on the target branch (e.g. `develop`).
- Issue number: resolved automatically in Step 2b — only ask if all detection sources fail.

## Prompt

Execute the following workflow verbatim:

### Step 1 — Commit

Commit all staged and unstaged changes with a conventional commit message that summarises the work done. Do not push yet.

### Step 2 — Detect branch mode

Run `git branch --show-current`. Record as `current_branch`.

- If `current_branch` is `main`, `master`, `develop`, or `staging`: set `has_plan_branch = false` and `target_branch = current_branch`.
- Otherwise: set `has_plan_branch = true` and determine `target_branch`:
  - If a branch name was passed as argument, use it.
  - Otherwise, inspect `git log --oneline --decorate HEAD` to detect the parent branch.
  - If still ambiguous, ask: *"Which branch should I merge `<current_branch>` into?"*

### Step 2b — Detect issue number

Attempt to resolve `issue_number` from the following sources in priority order. Stop at the first match.

1. **Argument** — a number passed directly by the user (e.g. `endtask 42`).
2. **Branch name** — extract from `current_branch`: patterns `issue-42`, `#42`, `-42-`, or a leading numeric segment (e.g. `42-my-feature`). Ignore date-like segments (`YYYY`, `MM`, `DD`).
3. **Plan file frontmatter** — read the `.pending.md` found in Step 3 (read it now in advance); look for `issue_number:` or `tracker_id:`.
4. **Plan file content** — scan for `Fixes #42`, `Closes #42`, `**Issue:** #42`, `Ref: #42`.
5. **Recent commits** — run `git log --oneline -10`; scan messages for `#42`, `fix #42`, `close #42`.
6. **No match** — set `issue_number = none`. Do not ask.

### Step 3 — Archive plan file

Search `aidd_docs/tasks/` for a `.pending.md` file matching the current work. If not found, ask: *"Which file in `aidd_docs/tasks/` is the plan for this work?"*

Rename `<name>.pending.md` → `<name>.processed.md` in the same directory.

### Step 4 — Capture learnings (auto-validate)

Invoke `/aidd-context:05-learn` on the archived plan file.

**Auto-validate all proposed learnings without asking for confirmation** — save every entry that the skill surfaces. Do not pause or prompt the user at this step.

### Step 5 — Merge and push

**If `has_plan_branch = true`** (dedicated branch):
- `git checkout <target_branch>`
- `git pull`
- `git merge --no-ff <current_branch>` — if conflict, stop and ask user to resolve before continuing.
- `git push`
- `git branch -D <current_branch>`

**If `has_plan_branch = false`** (working directly on target branch):
- `git push`

### Step 6 — Changelog

Invoke `/overcode:changelog`: updates `CHANGELOG.md` from git history, commits the file, and creates an annotated tag for the new version.

### Step 7 — Push tags

```bash
git push --follow-tags
```

### Step 8 — Close issue

If an issue number was provided: close the issue using the tracker (GitHub or GitLab) and add a closing comment referencing the tag or commit.

If no issue number: skip this step silently.

### Step 9 — Report

| Field | Value |
|---|---|
| Commit | `<sha> <message>` |
| Plan archived | `<name>.processed.md` |
| Branch mode | `plan branch merged into <target>` or `direct commit on <target>` |
| Branch deleted | `<current_branch>` *(only if has_plan_branch)* |
| Tag | `<tag>` pushed |
| Issue closed | `#<n> <url>` or `—` |
