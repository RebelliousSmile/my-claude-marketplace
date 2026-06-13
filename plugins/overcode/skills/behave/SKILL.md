---
name: behave
description: Behavioural-test harness for skills, agents, and prompt-driven workflows — scaffolds scenario suites (Situation → Expected behaviour → Pass criteria), runs a dry-run judge harness that scores each scenario against a populated fixture without mutating real data, and re-runs suites for non-regression. Triggers on "behave", "scaffold behavioural tests", "run the behavioural suite", "regression-test this skill/agent", "write a scenario suite for", or "/behave <action>". Do NOT use for unit/integration tests of code (use the project's test runner), for code review against a style guide (use review/foresee), or for one-off manual checks.
model: opus
---

# Behave

Manages **behavioural tests** for non-deterministic, prompt-driven targets — skills, agents, and play/loop workflows whose correctness is a *behaviour* (what it does, refuses, routes, writes) rather than a return value. Codifies the harness pattern: a **scenario suite** pins the expected behaviour; a **dry-run judge** scores each scenario against a real, populated fixture without touching the user's data; runs accumulate in a **Results log** so a fix is proven by reproducing the defect first, then confirming the repair.

## Available actions

| #  | Action     | Role                                                                                      | Input                                              |
|----|------------|-------------------------------------------------------------------------------------------|----------------------------------------------------|
| 01 | `scaffold` | Author a new scenario suite for a target (skill / agent / loop), GO/NO-GO or matrix form  | `<target>` (path to SKILL.md/agent.md) `[--name <slug>] [--checker]` |
| 02 | `run`      | Execute the dry-run judge harness for a suite against a fixture; append a dated run to its Results log | `<suite.md> <fixture>` `[--only <ids>]`            |
| 03 | `regress`  | Re-run one or more existing suites; compare to the last recorded run; flag any PASS→FAIL  | `<suite.md…>|<dir>` `<fixture>`                     |

## Default flow

Dispatch on intent:
- "scaffold / write a suite / new behavioural test for `<target>`" → `scaffold`
- "run the suite / score `<suite>` against `<fixture>`" → `run`
- "regress / re-run / confirm no regression after a change" → `regress`

If no suite exists yet for a target, `scaffold` first, then `run`.

## Transversal rules — the harness contract

Read in full before any action: `@references/harness-conventions.md`. The load-bearing invariants:

- **Dry-run, never mutate real data.** Judge subagents are READ-ONLY on the fixture. The decisive observable is the target's **intended writes / response content**, captured by reasoning — not by actually mutating the user's domain. A run that writes to the real fixture is a harness failure.
- **Reproduce-then-confirm.** A suite that targets a known defect must **FAIL on current behaviour first** (it is a regression spec), then **PASS after the fix**. Record both runs.
- **Write-scoped observables beat prose.** Prefer pass criteria verifiable by diffing *intended writes* (forbidden path untouched, no key written, file lands in scope X) over subjective prose judgement.
- **N/A vs FAIL discipline.** An unmet **precondition of the fixture** (missing campaign, absent subsystem, canon present so a gate can't fire) is **N/A**, not a defect. Only a genuine behavioural miss is **FAIL**. Never inflate a tally by crediting N/A as PASS.
- **Populated fixture, not a stub.** Run against **filled** directories/state — the decisive behaviours only manifest on real content. Name the fixture and its relevant state in every run.
- **Judge faithfully.** Credit only behaviour the target's instructions *actually specify*, not behaviour an idealized agent would produce. Cite the instruction (file + section) that maps or is missing.
- **Every run appends to the Results log.** Dated entry: verdict table, frictions, tally, and Δ vs the prior run. Suites are durable regression specs.
- **Logic vs data limits stay separate.** If the behaviour is correct but a concrete value is unavailable (missing sheet, absent data), report it as a **data limit**, not a logic FAIL — flag `[HRP]`/note, do not fabricate.

## Conventions & assets

- Scenario suite skeleton: `@assets/scenario-template.md`
- Optional Python data-integrity checker pattern (for data-backed targets): `@references/checker-pattern.md`
- Suites live next to the target under test, conventionally in its `evals/` dir, named `<target>-scenarios.md` (or `<aspect>-scenarios.md`).

## Evals

- `evals/scenarios.json`
