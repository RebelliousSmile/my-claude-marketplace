# 01 - Write

Decide whether a requested test should exist, at which tier, and within budget - before any test code is written.

## Inputs

- `behavior` (required) - one-line description of the behavior or code path that needs coverage
- `project_path` (required) - absolute path to the target project root
- `phase` (optional) - overrides the resolved project phase for this run only

## Outputs

```
tier: contract | e2e | skip
phase: <resolved phase> (argument | declared <path> | answered | undetermined)
rationale: <one paragraph, citing the phase as context - never as the tier's cause>
budget_check: { current_count: <n>, limit: <n or null>, status: ok | warn | blocked }
delegated_to: aidd-dev:06-test#01-test | aidd-dev:06-test#02-test-journey | none
```

## Process

1. Resolve `project_path`. Look for a documented test strategy at `<project_path>/aidd_docs/memory/testing.md` (the AIDD memory convention). If present, use its tier table. Otherwise load `@../references/decision-framework.md` as the default.
1-bis. Resolve the project **phase** per `@../references/phase-framework.md`, at the same rank as the documented strategy and the pivot: it is loaded context, not a decision input. It is **never deduced** - it comes from the `phase` argument, from the project's own documentation, or from asking the user before the classification is stated. It never changes the tier - see step 3 - and never populates `limit`.
2. Detect the active language plugin for `project_path` and check whether it ships a `testing` capability pivot per `@../references/pivot-contract.md`. If present, load it for tooling-specific mechanics (test runner, test-count command, tier thresholds). If absent, proceed without it and note the gap in the output.
3. Classify `behavior` against the loaded tier table (project doc, else default) into `contract`, `e2e`, or `skip`, following the decision order in the loaded source. **The tier comes from the tier table alone.** The phase is cited in `rationale` - it says whether this behavior is what the project should be securing right now - but it never moves a `contract` to an `e2e`, and never turns a classifiable behavior into a `skip`. A behavior the phase deprioritises is still classified: what the phase informs is the user's decision to write it now, not the tier it would get.
4. Number constraint: get the current test count via the pivot's test-count command if available, else count matching test files manually. `limit` is populated exclusively from the project's own documented test strategy - never from an internal default invented by this skill. If the project's strategy doc states a budget, compare against it and set `limit` accordingly; otherwise `limit` stays `null` and the only check is a subjective warn once the count is unusually large for the project's size, asking the user to confirm before proceeding. Record `budget_check`, and state the phase alongside it: the phase does not set `limit` - nothing but the project's own document does - but it is what makes a `warn` readable, since the same count means something different in `scaffolding` and in `sustaining`.
5. If `tier = skip`: report the rationale and stop. Set `delegated_to: none`.
6. If `tier = contract`: delegate to `aidd-dev:06-test` action `01-test`, passing `behavior` and the tier's quality constraints as explicit input.
7. If `tier = e2e`: delegate to `aidd-dev:06-test` action `02-test-journey`, passing `behavior`.
8. Report the full outcome block to the user before the delegated action starts executing - the user can override the tier or cancel before delegation happens.

## Test

Run against a real target project with a `behavior` not yet covered by any existing test. Verify the action reports `tier`, a non-empty `rationale`, and `budget_check`; verify delegation to the matching `aidd-dev:06-test` action occurs only when `tier != skip`, and that no delegation happens for `tier = skip`.

**Never** a mocked test double for `aidd-dev:06-test` - the first real delegation is the test.
