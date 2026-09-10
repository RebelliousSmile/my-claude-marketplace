# Reconcile normative knowledge

## Inputs

- The execution context and effective `rule_elevation_threshold`.

## Process

1. Resolve the sibling skill through host portability and invoke `reconcile-normative`.
2. Pass the effective elevation threshold and wait through every confirmation owned by that skill.
3. Collect its returned metrics without rescoring or inventing absent values.
4. Mark normative reconciliation complete in the execution context only after the sibling skill finishes.

## Outputs

- Entries migrated and enriched.
- Covered entries skipped, duplicates merged, contradictions resolved, patterns elevated, and obsolete decisions flagged.
- Rules updated, touched, or removed by the freshness pass.

## Test

- The sibling skill is resolved portably and is not duplicated inside Harvest.
- Cleanup cannot observe normative completion before the delegated run returns.
- Every metric remains attributable to `reconcile-normative`.

