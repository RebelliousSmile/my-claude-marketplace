# Reconcile tracker state

## Inputs

- Inventory records and tracker detection from `01-inventory.md`.
- The feature association and closure rules in `references/feature-lifecycle.md`.

## Process

1. Query all tracker items through the single detected CLI, using the count and pagination rules in the reference. For Local, read stories. For None, skip queries.
2. Associate each completed modern feature directory and legacy processed plan with an item, then assign group A, B, or C.
3. Propagate each group to matching loose lifecycle artifacts by normalized slug.
4. For every group-A item, assemble the project-specific or default closing comment, including branch, PR/MR, summary, changelog scope, plan path, and review notes when available.
5. Write only the temporary comment file, show the full comment, and wait for explicit confirmation.
6. After confirmation, post then close with the detected CLI; for Local, update story status to `done`. If posting fails, leave the item open.
7. Return group and closure metrics to the execution context.

## Outputs

- Association table for completed plan roots.
- Group A/B/C membership inherited by matching artifacts.
- Confirmed closures and failures.
- Metrics: items closed by group and total.

## Test

- Tracker detection, queries, and mutations use only one detected interface and never MCP.
- No tracker item closes before its exact comment is displayed and confirmed.
- No issue identifier is inferred from a date segment.
- Tracker None assigns completed roots to C and performs no closure phase.

