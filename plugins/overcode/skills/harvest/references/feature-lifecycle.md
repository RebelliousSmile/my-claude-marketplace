# Harvest feature lifecycle and tracker contract

## Feature directories

Build one record for every `aidd_docs/tasks/YYYY_MM/YYYY_MM_DD_slug/plan.md`. Read its direct frontmatter `status`, enumerate sibling `phase-N.md`, optional `review.md`, and every other file. Files owned by this directory are never counted again.

The status owner is `aidd-dev:01-plan` `references/plan-status.md`:

- completed: `implemented`, `reviewed`;
- active: `pending`, `in-progress`, `blocked`;
- missing, malformed, or any other value: invalid, reported and excluded from closure and purge.

A directory with no direct `plan.md` is never a plan unit.

## Tracker detection

Detect once, in this priority order:

1. GitHub when `gh repo view` succeeds.
2. GitLab when `glab repo view` succeeds.
3. Local when stories exist under `aidd_docs/backlog/stories/`, or legacy type-10 stories exist under tasks.
4. None otherwise.

GitHub: count all items first. At 200 or fewer, query `gh issue list --state all --limit 200 --json number,state,title,url`; above 200, query open and closed separately with limit 500. GitLab uses `glab issue list --all --output json`, paginated by 100 when needed. Local reads story frontmatter and treats `done` or `closed` as closed. None assigns completed plans to group C and skips closure.

## Association and groups

For each completed feature root, then each legacy `.processed.md`, extract the tracker identifier in order:

1. frontmatter `issue_number` or `tracker_id`;
2. filename `issue-42`, `#42`, or story slug;
3. content `Fixes #42`, `Closes #42`, `Issue: #42`, or `Story:`;
4. an isolated numeric segment not belonging to the leading date.

Loose review, journey, story, checklist, and legacy sub-plan artifacts inherit the group of a modern or legacy plan with the same normalized slug. Strip date and lifecycle suffixes before comparing; use orphan only when no active or completed root matches.

- A: tracker item open plus completed plan — close before cleanup.
- B: tracker item already closed — cleanup directly.
- C: no tracker item — cleanup directly.

## Closure

For every group-A item, build a closing comment containing branch, associated PR or MR or `none`, summary from `Summary` or `Objectif`, inferred changelog scope/type, plan path, and review notes when present. Follow a project VCS-memory template when one exists; absence is not an error.

Write the comment to an OS-native temporary file, display it, and wait for confirmation. Post the comment before closing through the detected CLI. For Local, update story frontmatter to `status: done` only after the same preview and confirmation. If comment posting fails, do not close.

## Cleanup eligibility

Before any cleanup, normative reconciliation must have completed. For completed work without a Learn trace referencing its slug, disclose that absence and offer `aidd-context:10-learn` before confirmation.

- Completed feature directories in A/B/C are eligible after required closure; enumerate every file, including extras.
- Legacy `.processed.md` uses the same group rules.
- Loose reviews and journeys are eligible with a completed matching root, or when orphaned from both completed and active roots.
- Audit runs, non-plan outputs, autonomous tracking, and other remaining artifacts belong to review.
- Product artifacts never become cleanup candidates.

Display every candidate relative path and modification date, then ask once: `Delete these N files? (irreversible)`. Delete only enumerated paths with the OS-native command; never recursively remove a directory.

If at least five purged group-C roots share a thematic slug fragment, report workflow drift and offer a retrospective tracking issue.

