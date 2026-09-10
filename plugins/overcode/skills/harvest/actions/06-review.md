# Review remaining artifacts

## Inputs

- Remaining inventory records after cleanup.
- Tracker associations and effective age thresholds.
- `references/remaining-artifacts.md`.

## Process

1. Evaluate stories, loose checklists/phases, legacy sub-plans, active plans, audit runs, non-plan outputs, and autonomous tracking files by their specific rules.
2. Never apply plan age bands to a directory without direct `plan.md`, an audit pillar file, product artifact, or autonomous tracking file.
3. Collect delete, keep, and needs-clarification outcomes without acting.
4. Present one consolidated table with path, type, proposed action, and reason.
5. Resolve needs-clarification rows through grouped questions.
6. Present the resolved deletion set and ask once for explicit irreversible confirmation.
7. After confirmation, delete only the listed paths and return metrics by type.

## Outputs

- Consolidated decisions and explanations.
- Confirmed deletions.
- Deleted, kept, and clarification counts for every reviewed type.

## Test

- Each record uses only its own status/age contract and remains owned by its parent unit.
- The newest direct-root status or memory report is retained regardless of age.
- Active autonomous files are never deleted because of age.
- No collected deletion is applied before clarification and final confirmation.

