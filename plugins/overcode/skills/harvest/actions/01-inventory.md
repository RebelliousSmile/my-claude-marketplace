# Inventory Harvest artifacts

## Inputs

- The execution context from `references/pillar-contract.md`.
- Inventory scope: `all`, `tracker`, `cleanup`, `freshness`, or `review`.

## Process

1. Detect the OS once and retain the matching shell conventions.
2. Validate the requested inventory scope before reading project artifacts.
3. Apply only the selected scope:
   - `tracker`: read `feature-lifecycle.md`; inventory completed modern roots, legacy `*.processed.md` roots, and association candidates.
   - `cleanup`: read `feature-lifecycle.md`; inventory completed modern and legacy roots, active modern and legacy root identities, loose reviews/journeys, Learn traces, and association candidates.
   - `freshness`: inventory eligible project Markdown and detect source roots; read neither lifecycle reference.
   - `review`: read `remaining-artifacts.md` and the small ownership/status contract in `feature-lifecycle.md`; inventory remaining units and tracker associations without reading completed-plan bodies.
   - `all`: read both references, list Markdown below both owned AIDD roots, and build the complete classification.
4. Skip an absent owned root without failure and never scan `aidd_docs/harvests/` as task inventory.
5. For lifecycle scopes, build feature-directory records before loose-file classification and never count an owned file twice.
6. Detect source roots only for `freshness` or `all`, including `src/`, `app/`, `components/`, and `lib/` when present. Exclude dependencies, VCS metadata, vendor output, and build output.
7. Store only the records required by the scope in the execution context and identify the scope in the output.

## Outputs

- Detected OS and shell. Tracker detection belongs to `02-tracker.md` and is absent from `freshness` inventory.
- Feature and artifact records required by the scope, with paths, status/type, age basis, ownership, and association candidates.
- Detected source roots for `freshness` and `all`.
- Per-type counts only for types included by the scope.

Print the complete per-type count summary only for `all`; otherwise return the scoped counts to the selected pillar.

## Test

- Both owned AIDD roots are considered and an absent root is harmless.
- Every feature directory is one record, and none of its files is classified independently.
- Invalid direct `plan.md` status is reported and cannot reach closure or cleanup.
- No harvest report, product artifact, or fixture outside the selected project root enters cleanup classification.
- No action or reference foreign to the selected scope is required by inventory.
- Tracker and cleanup scopes retain legacy processed roots; cleanup also retains active-root identities before deciding that a review or journey is orphaned.
