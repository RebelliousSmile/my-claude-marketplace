# Write the full Harvest report

## Inputs

- Completed results from tracker, normative, cleanup, freshness, and review.
- `references/report-template.md`.
- Selected route must be `all`.

## Process

1. Refuse targeted or partial invocation. Verify the selected route is `all`, every pillar ran or carries an explicit skipped/blocked reason, and all required metrics are present.
2. Fill the report template without replacing missing values with zero.
3. Write `aidd_docs/harvests/YYYY_MM_DD-harvest.md`, creating the reports directory when needed.
4. Display the complete report. When no action was taken, state that the directory is clean.

## Outputs

- The written report path and full report.

## Test

- The report includes tracker closures/purges, normative metrics, freshness verdicts/findings, and remaining-file decisions.
- `aidd_docs/harvests/` is never treated as inventory input or purge material.
- Missing metrics block or disclose an incomplete action; they never become silent zeros.
- A targeted run cannot invoke this action or write a partial report.
