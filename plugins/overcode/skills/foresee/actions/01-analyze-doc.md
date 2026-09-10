# Analyze-doc

Routes document foresight to the installed AIDD skill that owns the artifact's lifecycle state. Foresee does not rescore or reinterpret the delegate's findings.

## Inputs

- `$ARGUMENTS` (required): `<target> [--discuss | --plan]`
- `target`: a Markdown path, issue reference, brainstorm, specification, plan, or completed-work report.

## Process

1. Parse the target and legacy flag.
2. Read `@../../../references/aidd-delegation.md` and resolve capabilities through the current host's skill catalogue.
3. Determine lifecycle state from explicit status/frontmatter and the request:
   - prospective idea, specification, brainstorm, or unfinished plan → delegate to `aidd-refine:03-shadow-areas`;
   - completed work with an agreed plan/reference → delegate to `aidd-refine:02-challenge` with both artifacts;
   - indeterminate → ask once whether the artifact is prospective or completed.
4. Follow the resolved skill's complete contract and preserve its report unchanged.
5. Apply `--discuss` or `--plan` exactly as defined by the common contract.
6. Return the delegated report plus the common delegation receipt. Set `pillar: none` and `local_follow_up: none` unless a legacy flag adds a follow-up.

## Boundaries

- Do not load foresee scoring rubrics or improvement patterns.
- Do not create a second foresee report or compare historical foresee scores.
- If the required AIDD capability cannot be resolved, use the common failure contract and stop.

## Test

- An unfinished plan routes to `aidd-refine:03-shadow-areas`.
- A completed implementation with an agreed plan routes to `aidd-refine:02-challenge`.
- An ambiguous artifact causes one lifecycle question, not a guessed delegation.
