# Clean completed artifacts

## Inputs

- Completed-root inventory and group associations.
- A completed normative result.
- The cleanup rules in `references/feature-lifecycle.md`.

## Process

1. Refuse to proceed until normative reconciliation is recorded complete and tracker reconciliation has resolved group A.
2. Build the eligible set for completed feature directories, legacy processed plans, loose reviews, and journeys.
3. For each completed root without a memory, ADR, or rule trace for its slug, disclose the missing Learn trace and offer `aidd-context:10-learn` before purge confirmation.
4. Enumerate every eligible file explicitly with relative path and modification date. Never select a directory recursively or include an unenumerated file.
5. Ask once whether to delete the displayed files, marking the operation irreversible.
6. After confirmation, delete only those paths with the native OS command. Retain audit runs, non-plan outputs, autonomous files, product artifacts, and all ineligible types.
7. Report a thematic group-C cluster of five or more roots and offer retrospective tracking.
8. Return purge metrics by group.

## Outputs

- Eligible and retained file lists with reasons.
- Confirmed deleted paths.
- Group A/B/C purge counts and cluster signals.

## Test

- No cleanup occurs before normative and required tracker work.
- Every deleted path was individually displayed and covered by explicit confirmation.
- Missing Learn evidence is disclosed before confirmation.
- Product artifacts and remaining-artifact types are never deleted here.

