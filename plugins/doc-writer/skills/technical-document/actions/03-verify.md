# 03 - verify

Fact-check a technical document against the codebase.

## Inputs

- A draft technical document (from `02-write` or supplied).
- Read access to the code/system it describes.

## Process

Check, and fix in place (or report if read-only):

1. **Examples** — every snippet/request/command is valid: signatures match the code, imports/paths exist, commands have correct flags. Run or trace where feasible.
2. **Signatures & params** — names, types, required/optional, return shapes, and error codes match the current source.
3. **Links & citations** — internal links, `file:line`/`file:symbol` references, and ADR links resolve to existing targets.
4. **Claims** — behavioral statements match what the code actually does; flag anything outdated.
5. **Structure** — sections still match the type's template in `references/doc-types.md`.
6. **Drift** — note anything the doc asserts that the code no longer supports.

## Outputs

The corrected document (or a findings list if review-only), with a summary of mismatches found and any claim that needs a human decision.

## Test

Every example and signature matches current source, all links/citations resolve, and any unverifiable or outdated claim is fixed or flagged.
