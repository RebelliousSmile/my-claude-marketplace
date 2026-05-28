# 03 - write-system

Write the canonical design-system artifacts from the tokens extracted in `02-extract`.

## Inputs

- The finalized token set + responsive strategy + component list from `02-extract`.
- Provenance: the reference origin (URL, file name, "Figma export from …"), today's date, version `0.1.0` for a first system.

## Process

Follow the shared procedure verbatim: `${CLAUDE_PLUGIN_ROOT}/references/write-system-procedure.md`.

Reference-specific notes:

- **Provenance** must name the concrete source (e.g., "Extracted from landing-page screenshot provided 2026-05-28" or "Derived from `marketing-site/styles.css`").
- Carry every assumption flagged in `02-extract` into `design-system.md` § Open questions — do not quietly resolve them.
- If the reference showed only one viewport, the responsive strategy is partly inferred: say so explicitly in § Open questions and propose sensible enriched/mobile-only behavior rather than leaving it blank.

## Test

Per the shared procedure's test, plus: every Open question from extraction appears in `design-system.md`.
