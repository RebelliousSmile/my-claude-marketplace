# Assess documentation and source freshness

## Inputs

- Eligible project Markdown paths discovered for this route, excluding paths already deleted when running under `all`.
- Source roots detected by inventory.

## Process

1. Resolve `taste` through host portability.
2. Run its document assessment over remaining Markdown, oldest first, excluding files deleted by cleanup.
3. Run its code assessment over detected source roots, excluding dependency, VCS, vendor, and build directories.
4. Collect returned document verdicts, code findings, and delegation receipts without replacing unavailable evidence.
5. When targeted, render freshness only plus the inventory dependency receipt; do not load lifecycle references or global reporting.

## Outputs

- Document counts for Obsolete, Partial, and Current.
- Code findings grouped by the categories returned by Taste, including missing import, missing function, rule violation, and stale comment when available.
- Taste receipts and explicit limits.

## Test

- Deleted files are not assessed and source scanning stays within detected roots.
- Taste remains the owner of freshness evidence and every delegated artifact is disclosed.
- Missing metrics are reported as limits, never fabricated as zero.
