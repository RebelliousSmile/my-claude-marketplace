# Reconcile normative knowledge

## Inputs

- The execution context and effective `rule_elevation_threshold`.
- Output mode: requested pillar or cleanup/full dependency.

## Process

1. Resolve the sibling skill through host portability and invoke `reconcile-normative`.
2. Pass the effective elevation threshold and wait through every confirmation owned by that skill.
3. Require the sibling's complete existing-rule inventory and consolidation pass, including unchanged rules. Collect its returned metrics without rescoring or inventing absent values. Do not accept an archive-only or freshness-only result as normative completion.
4. Mark normative reconciliation complete in the execution context only after the sibling skill finishes.
5. When requested, render these results in full. When a dependency, return them to cleanup and later summarize the outcome in one receipt row; never hide confirmations emitted during the run.

## Outputs

- Entries migrated and enriched.
- Covered entries skipped, duplicates merged, contradictions resolved, patterns elevated, and obsolete decisions flagged.
- Rules updated, touched, or removed by the freshness pass.
- Existing rules inspected, consolidated, retained, moved to memory, and pending approval.
- Applicable always-loaded instruction size before and after; conditional-rule size separately.

## Test

- The sibling skill is resolved portably and is not duplicated inside Harvest.
- Cleanup cannot observe normative completion before the delegated run returns.
- Every metric remains attributable to `reconcile-normative`.
- A run with no new ADR or changed memory still consolidates existing rules before cleanup may purge completed work.
