# Inventory Harvest artifacts

## Inputs

- The execution context from `references/pillar-contract.md`.
- Inventory scope. In the current exhaustive flow it is `all`.

## Process

1. Detect the OS once and retain the matching shell conventions.
2. Detect tracker kind once in the priority defined by `references/feature-lifecycle.md`; retain one CLI or Local/None.
3. List every Markdown file below `aidd_docs/tasks/` and `aidd_docs/backlog/`, skipping an absent root without failure. Never scan `aidd_docs/harvests/`.
4. Read `references/feature-lifecycle.md` and build feature-directory records before loose-file classification.
5. Read `references/remaining-artifacts.md` and classify every remaining directory and file in its declared priority order. Do not count an owned file twice.
6. Detect source roots from repository layout, including `src/`, `app/`, `components/`, and `lib/` when present. Exclude dependencies, VCS metadata, vendor output, and build output.
7. Store records and source roots in the execution context.

## Outputs

- Detected OS, shell, tracker kind, and CLI.
- Feature and artifact records with paths, status/type, age basis, ownership, and association candidates.
- Detected source roots.
- Counts for completed and active feature directories, audit runs, non-plan outputs, legacy completed plans, loose reviews, journeys, autonomous files, product artifacts, stories, checklists, sub-plans, and legacy active plans.

Print the per-type count summary.

## Test

- Both owned AIDD roots are considered and an absent root is harmless.
- Every feature directory is one record, and none of its files is classified independently.
- Invalid direct `plan.md` status is reported and cannot reach closure or cleanup.
- No harvest report, product artifact, or fixture outside the selected project root enters cleanup classification.

