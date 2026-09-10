# Assess-code

Routes code freshness questions to maintained AIDD audit or assertion capabilities. Taste contains no language regexes, import resolver, or local code scanner.

## Inputs

- `$ARGUMENTS` (required): `<target> [code-quality | dependencies | assert]`
- `target`: a source file, module, or directory.

## Process

1. Parse the target and explicit concern.
2. Read `@../../../references/aidd-delegation.md` and use its `taste assess-code` routing matrix.
3. Choose exactly one route:
   - freshness, stale constructs, rules, or maintainability → `aidd-dev:04-audit`, pillar `code-quality`;
   - dependency age, deprecation, version, or package concern → `aidd-dev:04-audit`, pillar `dependencies`;
   - imports, compilation, typing, build, or runtime resolution with an explicit repair request or consent → `aidd-dev:03-assert`;
   - the same runnable-resolution concern without repair consent → return the proposed assert route with `consent: required`, without invoking it;
   - only a source path, no intent → ask once which lens is wanted.
4. Resolve the selected skill through the host catalogue and follow its complete contract.
5. Preserve the delegated report and return the common delegation receipt, including every report path and every assessed-product path named by a consented delegate's result or diff under `writes`, plus the consent state.

## Boundaries

- Do not recreate removed-import, missing-symbol, relative-import, TODO-age, or rule regex detectors.
- Do not run several lenses to compensate for an ambiguous request.
- Audit may persist its contract-required report under `aidd_docs/`; announce it in the receipt. Never allow a delegated assertion to change source, tests, or configuration without explicit repair consent.
- If the selected capability is unavailable, use the common failure contract and stop.

## Test

- A dependency-deprecation request routes to audit `dependencies`.
- A broken-import or compile request proposes assert without invoking it; an explicit repair request routes to assert with `consent: granted`.
- A bare source path asks one routing question and performs no audit before the answer.
