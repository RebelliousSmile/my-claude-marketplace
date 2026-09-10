# Reconcile tracker state

## Inputs

- Inventory records from `01-inventory.md`.
- Feature records built from `references/feature-lifecycle.md`.
- Mode: `status-only` or `reconcile`.

## Process

1. Detect tracker kind once in priority order: GitHub when `gh repo view` succeeds, GitLab when `glab repo view` succeeds, Local when backlog or legacy stories exist, then None. Store it in the execution context, use one interface for the entire invocation, and never use MCP.
2. Query all tracker items through that interface. For GitHub, count first: at 200 or fewer query all with limit 200; above 200 query open and closed separately with limit 500. For GitLab, query all and paginate by 100 when needed. For Local, read story frontmatter and treat `done` or `closed` as closed. For None, skip queries.
3. Extract a tracker identifier from each supplied root in order: frontmatter `issue_number` or `tracker_id`; filename issue marker or story slug; content closing marker or Story field; isolated numeric segment outside the date.
4. In `status-only`, associate only records supplied by review, return their current states, and stop. Do not create groups for cleanup or prepare any mutation.
5. In `reconcile`, associate each completed modern feature directory and legacy processed plan, then assign A for open item, B for closed item, or C for no item.
6. Propagate each group to matching loose lifecycle artifacts by the normalized identity already recorded by inventory.
7. For every group-A item, assemble the project-specific or default closing comment, including branch, PR/MR, summary, changelog scope, plan path, and review notes when available.
8. Write only the OS-native temporary comment file, show the full comment, and wait for explicit confirmation.
9. After confirmation, post then close with the detected CLI; for Local, update story status to `done`. If posting fails, leave the item open.
10. Return mode, states, group data when applicable, and closure metrics to the execution context.

## Outputs

- Association table for completed plan roots.
- Group A/B/C membership inherited by matching artifacts.
- Confirmed closures and failures.
- Metrics: items closed by group and total.

In `status-only`, output only requested associations and states; closure and group metrics are not applicable and are omitted.

## Test

- Tracker detection, queries, and mutations use only one detected interface and never MCP.
- No tracker item closes before its exact comment is displayed and confirmed.
- No issue identifier is inferred from a date segment.
- Tracker None assigns completed roots to C and performs no closure phase.
- `status-only` produces no comment, temporary file, post, close, Local story update, or cleanup grouping.
