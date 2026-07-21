---
name: control
description: Governs test creation, existing-test value, and test-tooling configuration for a target project's test suite, so tests stay bounded in number and correctly tiered in kind. Use when asked to "add a test", "write a test for X", "should I write a test for X", "audit the test suite", "find low-value tests", "clean up tests", "check the test config", "why isn't coverage failing the build", or "govern the test strategy". Do NOT use for behavioural/prompt-driven testing of skills or agents - use `behave` instead. Do NOT use to write the test code itself once a tier is decided - this skill delegates that to `aidd-dev:06-test`.
disable-model-invocation: true
---

# Control

Sits in front of `aidd-dev:06-test` as a gate: before a new test is written, decides whether it should exist at all and at which tier; separately, audits a project's existing tests for low-value candidates and its test tooling for silent misconfiguration. All three actions are generic - a project's own documented test strategy, or a language plugin's `testing` pivot, refines the decision; neither is required for this skill to run.

## Available actions

| #  | Action      | Role                                                                                   | Input                                    |
|----|-------------|-----------------------------------------------------------------------------------------|-------------------------------------------|
| 01 | `write`     | Decide tier (contract / e2e / skip) and budget for a new test request, then delegate    | Behavior description, target project path |
| 02 | `audit`     | Find low-value existing tests (duplicates, trivial, getter/setter-only), propose removal | Target project path                       |
| 03 | `configure` | Detect test-tooling misconfiguration and propose fixes, without swapping tools           | Target project path                       |

## Default flow

Non-sequential - the router dispatches on user intent. Trigger-to-action mapping:

- "add/write a test for X", "should I test X", "is this worth testing" → `01-write`
- "audit the tests", "find low-value tests", "clean up the test suite", "which tests can I delete" → `02-audit`
- "check the test config", "why isn't coverage failing", "fix the test tooling" → `03-configure`

If the target project path is not given, ask for it before running any action - none of the three can produce a meaningful result without it.

## Transversal rules

- Tier and configuration decisions are sourced in this order of precedence: (1) the target project's own documented test strategy (conventionally `aidd_docs/memory/testing.md`, per the AIDD memory layout) if present, (2) `references/decision-framework.md` (this skill's generic default) otherwise. A language plugin's `testing` pivot (`references/pivot-contract.md`) layers stack-specific mechanics on top of whichever source applies, and MAY refine a tier classification through its own "Tier thresholds" section - but only when the refinement is justified by a boundary that stays local/emulated and crosses no UI, no browser, and no external network/DB. A pivot must never reclassify a case that crosses a real external boundary.
- Never delete a test file, or apply a config fix, without a separate, explicit per-item confirmation from the user. No batch auto-apply.
- Never propose replacing a project's already-established E2E tool. Only propose fixes to its configuration.
- This skill orchestrates and decides; it never writes test code itself. Once a tier is decided in `write`, the actual test is written by delegating to `aidd-dev:06-test`.

## References

- `references/decision-framework.md` - generic contract / e2e / skip tier criteria, used when the target project has no documented test strategy
- `references/pivot-contract.md` - expected shape of a language plugin's `testing` capability pivot (`sc-js` ships one today; other language plugins could add one following the same shape), and what happens when none is available
