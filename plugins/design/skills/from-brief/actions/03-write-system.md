# 03 - write-system

Write the canonical design-system artifacts from the tokens derived in `02-derive`.

## Inputs

- The derived token set + responsive strategy + component list from `02-derive`.
- Provenance: a one-line brief summary, today's date, version `0.1.0` for a first system.

## Process

Follow the shared procedure verbatim: `${CLAUDE_PLUGIN_ROOT}/references/write-system-procedure.md`.

Brief-specific notes:

- **Provenance** summarizes the brief and names the attribute profile that drove the system (e.g., "Derived from client brief — personality: premium/technical, audience: B2B operators, mobile-first").
- Carry every defaulted attribute and assumption into `design-system.md` § Open questions so the client/colleagues can confirm.
- Because there is no reference, the system is a proposal: make the responsive strategy concrete (don't leave enriched/mobile-only as TODO) but flag it as the recommended starting point.

## Test

Per the shared procedure's test, plus: every defaulted attribute from `01-clarify` and assumption from `02-derive` appears in `design-system.md` § Open questions.
