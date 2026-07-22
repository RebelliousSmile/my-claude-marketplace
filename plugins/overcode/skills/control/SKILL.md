---
name: control
description: Governs test creation, existing-test value, coverage gaps, suite-wide reporting, test-tooling configuration, and the alignment of a project's own test strategy document with what it actually does, so tests stay bounded in number and correctly tiered in kind. Use when asked to "add a test", "write a test for X", "should I write a test for X", "audit the test suite", "find low-value tests", "clean up tests", "what should I test next", "which coverage gaps matter most", "check the test config", "why isn't coverage failing the build", "how many tests do we have", "what test strategy is in place", "align the test documentation", "is the test strategy still up to date", "declare the project's phase", "the test document no longer matches the project", or "govern the test strategy". Do NOT use for behavioural/prompt-driven testing of skills or agents - use `behave` instead. Do NOT use to write the test code itself once a tier is decided - this skill delegates that to `aidd-dev:06-test`.
disable-model-invocation: true
---

# Control

Sits in front of `aidd-dev:06-test` as a gate: before a new test is written, decides whether it should exist at all and at which tier; separately, audits a project's existing tests for low-value candidates, ranks its uncovered code by risk to say what is worth testing next, checks its test tooling for silent misconfiguration, reports at a glance where the suite stands and which strategy governs it, and closes the loop by proposing that the project's own strategy document be brought back in line with what the project actually does. Every action is generic - a project's own documented test strategy, or a language plugin's `testing` pivot, refines the decision; neither is required for this skill to run.

## Available actions

| #  | Action      | Role                                                                                   | Input                                    |
|----|-------------|-----------------------------------------------------------------------------------------|-------------------------------------------|
| 01 | `write`     | Decide tier (contract / e2e / skip) and budget for a new test request, then delegate    | Behavior description, target project path |
| 02 | `audit`     | Find low-value existing tests (duplicates, trivial, getter/setter-only), propose removal | Target project path                       |
| 03 | `configure` | Detect test-tooling misconfiguration and propose fixes, without swapping tools           | Target project path                       |
| 04 | `strengthen`| Rank missing tests / uncovered code by risk, propose the few that matter, via `01-write` | Target project path                       |
| 05 | `stats`     | Read-only snapshot: test volume by tier, and which test strategy is actually in force    | Target project path                       |
| 06 | `align`     | Audit the gap between the project's test document and its reality, propose the update    | Target project path                       |

## Default flow

Non-sequential - the router dispatches on user intent. Trigger-to-action mapping:

- "add/write a test for X", "should I test X", "is this worth testing" → `01-write`
- "audit the tests", "find low-value tests", "clean up the test suite", "which tests can I delete" → `02-audit`
- "check the test config", "why isn't coverage failing", "fix the test tooling" → `03-configure`
- "what should I test next", "which tests are missing", "where is my coverage weakest", "what's the riskiest untested code" → `04-strengthen`
- "how many tests do we have", "what's our test strategy", "which strategy is in force", "test suite overview", "where do we stand on tests" → `05-stats`
- "align the test documentation", "is the test strategy still up to date", "declare the project's phase", "the test document no longer matches the project", "update our testing.md" → `06-align`

If the target project path is not given, ask for it before running any action - not one of them can produce a meaningful result without it.

## Transversal rules

- Tier and configuration decisions are sourced in this order of precedence: (1) the target project's own documented test strategy (conventionally `aidd_docs/memory/testing.md`, per the AIDD memory layout) if present, (2) `references/decision-framework.md` (this skill's generic default) otherwise. A language plugin's `testing` pivot (`references/pivot-contract.md`) layers stack-specific mechanics on top of whichever source applies, and MAY refine a tier classification through its own "Tier thresholds" section - but only when the refinement is justified by a boundary that stays local/emulated and crosses no UI, no browser, and no external network/DB. A pivot must never reclassify a case that crosses a real external boundary.
- Every action resolves the target project's **phase** (`scaffolding` / `hardening` / `production` / `sustaining` / `undetermined`) per `references/phase-framework.md`, and reports it with its provenance. **The phase is never deduced from the repository**: it comes from an explicit `phase` argument, from a declaration in the project's own documentation, or from a question put to the user *before* anything is ranked or proposed. A repository shows what was built; it does not show whether anyone is using it, which is the one thing the phase turns on. `undetermined` means the question went unanswered, never that a guess fell short. The phase **prioritises; it never classifies a tier** - same boundary as a pivot's *Risk signals*. It may move a gap to the top of a table or a low-value test to the top of a removal list, never change the tier proposed for either: tier authority stays with the loaded tier table. A test is refused on a tier criterion, never "because we are in production".
- Never delete a test file, apply a config fix, or write a proposed missing test, without a separate, explicit per-item confirmation from the user. **One exception, and it is bounded twice over: `06-align` only, and only on a phase switch.** There, a removal may be consented to as a **characterised batch** - one consent covering a set defined by its *selection criterion*, not by its enumeration. The reason is worth keeping with the rule: a generated test is rewritten at low cost, so deletion is no longer the irreversible act that per-item confirmation was protecting; what still has to be protected is **knowing what is being deleted**, and at the scale where a batch becomes useful that is what the criterion says and what a several-hundred-line list does not. Past the volume at which the analysis stops being meaningful, demand a narrower `scope` rather than unrolling the list - the same saturation bound `04-strengthen` already applies. Every other removal in this skill, `02-audit` included, keeps per-item confirmation unchanged.
- Every new test enters through `01-write`, whichever action surfaced the need - `04-strengthen` proposes and ranks, but hands each confirmed gap back to `01-write` so the tier decision and the number constraint are applied in exactly one place.
- This skill **never decides** the strategic content of the target project's test strategy document on its own. `aidd_docs/memory/testing.md` is owned by `aidd-context`'s project-memory skill, which generates and syncs it (the skill and action names have changed across `aidd-context` majors - refer to the document, never to a pinned action number). Every action but one only reads it. The exception is `06-align`, and only under its own terms: it writes what it has **measured** under its own authority, and it *proposes* a strategy in full prose that the user validates line by line before a word of it reaches the file. What a project decides to test stays the project's decision; what the skill observed is the skill's to state. When that document is still the untouched generic template - test *types* or empty placeholders rather than decision criteria - treat it as absent for tier decisions, map unit and integration to `contract` and end-to-end to `e2e`, and say so in the output rather than pretending the project has a strategy.
- A coverage percentage declared in that document is never read as a budget. `limit` comes only from an explicit test-count limit.
- Coverage percentage is a symptom, never a target. No action of this skill proposes work whose only justification is moving a coverage number.
- `02-audit` and `04-strengthen` are two directions of one judgement, and they answer to a **net balance**: the suite's worth is what it proves per unit of maintenance, not its size in either direction. Neither action is a quota - an audit that finds nothing to remove and a strengthen that finds nothing worth adding are both valid outcomes. `04-strengthen` never proposes a test on a path the user has just had `02-audit` remove, unless the risk picture has demonstrably changed since; when both run in one session, report the net effect on the test count rather than each side in isolation.
- Never propose replacing a project's already-established E2E tool. Only propose fixes to its configuration.
- This skill orchestrates and decides; it never writes test code itself. Once a tier is decided in `write`, the actual test is written by delegating to `aidd-dev:06-test`.

## References

- `references/decision-framework.md` - generic contract / e2e / skip tier criteria, used when the target project has no documented test strategy
- `references/phase-framework.md` - the four project phases, how each is resolved, which risk criteria each raises or lowers, and the expected ordering of the three buckets; carries the **external contract dependency** criterion and its cost cap
- `references/pivot-contract.md` - expected shape of a language plugin's `testing` capability pivot (`sc-js` ships one today; other language plugins could add one following the same shape), and what happens when none is available
