# Analyze-code

Routes prospective code analysis to the relevant pillar of the installed AIDD audit skill. Foresee does not retain a parallel code-audit engine.

## Inputs

- `$ARGUMENTS` (required): `<target> [architecture | code-quality | tests] [--discuss | --plan]`
- `target`: a code file, module, directory, or bounded module description.

## Process

1. Parse the target, requested concern, and legacy flag.
2. Read `@../../../references/aidd-delegation.md` and resolve `aidd-dev:04-audit` through the host catalogue.
3. Select one pillar using the common routing matrix:
   - general future coupling, boundaries, or no explicit concern → `architecture`;
   - maintainability or code-quality language → `code-quality`;
   - correctness, edge cases, or coverage language → `tests`;
   - conflicting explicit concerns → ask once for the primary angle.
4. Delegate the target and pillar to the installed audit skill and preserve its report unchanged.
5. Apply `--discuss` or `--plan` from the common legacy-flags contract.
6. Return the report and receipt with the selected pillar.

## Boundaries

- Explicit resilience, change-tolerance, blast-radius, failure-recovery, rollback, or reversibility intent belongs to `analyze-resilience`; do not reduce it to one pillar here.
- Do not select files, spawn per-file agents, score code, or apply a local improvement catalogue.
- Do not write `aidd_docs/foresee/` history for delegated code audits.
- If audit cannot be resolved, use the common failure contract and stop.

## Test

- A general module routes to audit `architecture`.
- An explicit maintainability request routes to `code-quality`; a coverage request routes to `tests`.
- Conflicting explicit concerns cause one question.
