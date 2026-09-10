# Foresee resilience behavioural test scenarios

Behavioural tests for **Foresee resilience** (`../SKILL.md` and `../actions/04-analyze-resilience.md`) — verifies target-aware AIDD evidence composition and a bounded prospective synthesis of impact, detection, containment, recovery, and reversibility. This is distinct from `delegation-scenarios.md`, which pins individual document/code/dependency routes, and `legacy-flags-scenarios.md`, which pins discuss/plan follow-ups.

> **Fixture / preconditions.** Run against the populated `my-marketplace` repository plus each row's complete inline target state and `tools/eval/fixtures-aidd-delegation/current-compatible.json`. The repository provides real plans, skills, dependency manifests and tests; inline states supply failures or lifecycle status that must not be guessed. A missing delegate report is explicit fixture state and reduces coverage rather than becoming invented evidence.

## Scenarios

| # | Situation (input) | Expected behaviour | Pass criteria |
|---|---|---|---|
| R1 | Assess resilience of an unfinished plan that names API change and rollback risks. | Route through `aidd-refine:03-shadow-areas`, then synthesize at most three highest-risk scenarios. | No code-only audit runs; Shadow Areas report stays unchanged and its path is disclosed; scenarios distinguish evidence from inference. |
| R2 | Assess resilience of completed work with its agreed plan. | Route through `aidd-refine:02-challenge`. | Both artifacts reach Challenge; its confidence is not rescored; Foresee adds only scenario impact, recovery and reversibility. |
| R3 | Assess resilience of a code module with tight boundaries and critical paths. | Run AIDD Audit `architecture` and `tests`. | Both reports remain authoritative, each has a receipt, and the synthesis uses evidence from both rather than calling either pillar a complete resilience verdict. |
| R4 | Assess resilience of a dependency manifest with a viable alternative and costly migration. | Reuse `analyze-dep`. | Dependency audit and local horizon remain authoritative; no duplicate continuity, isolation, exit-option, CVE or version score is created. |
| R5 | Architecture audit succeeds but the tests pillar is unscannable. | Return partial coverage. | Architecture evidence is kept, failed/skipped tests evidence is disclosed, unknown test resilience is not presented as safe. |
| R6 | Six plausible change scenarios are supported for a module and no expansion flag is given. | Select the three highest-risk scenarios. | Output contains at most three scenarios and names omitted coverage; no silent exhaustive fan-out occurs. |
| R7 | A scenario has no repository evidence for rollback or recovery. | Mark recovery as an untested hypothesis or unknown. | No recovery mechanism is invented; confidence and evidence gap are explicit. |
| R8 | The user asks only for architecture coupling, without resilience language. | Keep the existing `analyze-code` architecture route. | Exactly one architecture pillar runs; composite resilience does not capture the request. |
| R9 | The user asks only about dependency abandonment. | Keep `analyze-dep`. | Existing five-dependency horizon bound and scoring contract remain unchanged. |
| R10 | The user requests resilience analysis but not tests, fixes, or executable validation. | Remain analytical. | Neither `aidd-dev:03-assert` nor `aidd-dev:06-test` is invoked; source, tests, configuration and product data remain untouched. |
| R11 | **Positive control** — analyze `package.json` dependencies for future abandonment. | Route to current `analyze-dep`. | Audit `dependencies` precedes the bounded local horizon and no generic resilience action replaces it absent resilience intent. |
| R12 | **Negative control** — a candidate response uses only architecture findings and declares the module resilient. | Reject the candidate as incomplete. | Missing tests evidence yields partial coverage, not a global resilience claim. |
| R13 | **Negative control** — a candidate copies dependency-audit severities into a new Foresee resilience score. | Reject duplicated scoring. | Delegated findings remain authoritative and no competing quality score is emitted. |

## How to run

Agent-as-Foresee (dry-run, READ-ONLY on the fixture): load `../SKILL.md`, all files under `../actions/`, `../references/resilience-signals.md` when present, dependency references/assets, `../../../references/aidd-delegation.md`, this suite and the populated fixture. For each scenario, reason out routing, response, receipts and intended writes. Do not invoke delegates or mutate the fixture.

**Decisive observables:** explicit resilience intent precedes extension-only routing; the delegate set matches the target kind; at most three scenarios appear by default; absent evidence remains unknown; AIDD findings are never rescored; no source/test-changing capability runs implicitly; every allowed report path is disclosed.

## Results log

### 2026-09-10 — run 1 (initial, dry-run, target=foresee resilience, fixture=my-marketplace + inline target states) — **6/13 PASS**

The populated repository exposes pending and implemented plans, code, manifests and tests; the compatible catalogue supplies every current delegate. Root `package.json` has no declared dependencies, which limits R11 data but not its routing verdict. The judge made no fixture write.

| # | Behavior | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| R1 | Prospective-plan resilience | FAIL | — | `01-analyze-doc.md` routes Shadow Areas but adds no bounded resilience synthesis. |
| R2 | Completed-work resilience | FAIL | — | Challenge routing exists, but impact, recovery and reversibility do not. |
| R3 | Code resilience | FAIL | — | `02-analyze-code.md` selects exactly one pillar instead of architecture plus tests. |
| R4 | Dependency resilience | PASS | — | `03-analyze-dep.md` already owns the audit plus unique horizon. |
| R5 | Partial audit evidence | FAIL | — | No composite coverage contract exposes the missing tests pillar. |
| R6 | Three-scenario bound | FAIL | — | No scenario selection or risk bound exists. |
| R7 | Unknown recovery | FAIL | — | No recovery evidence or hypothesis vocabulary exists. |
| R8 | Narrow architecture route | PASS | — | `02-analyze-code.md` routes one architecture audit. |
| R9 | Narrow abandonment route | PASS | — | Existing five-dependency horizon remains bounded. |
| R10 | Analytical non-mutation | PASS | — | Current boundaries invoke neither Assert nor Test. |
| R11 | Dependency positive control | PASS | — | Manifest routes correctly; absent declared dependencies are a data limit. |
| R12 | Architecture-only false resilience | FAIL | — | No rule converts missing tests evidence to partial coverage. |
| R13 | Duplicate score negative control | PASS | — | Current rules already forbid rescoring AIDD and dependency audit findings. |

**Frictions / gaps:** the explicit resilience route, target-aware composition, scenario schema, three-scenario budget, recovery evidence and partial-coverage contract are absent. Existing dependency, narrow audit, non-mutation and no-rescore behavior remains valid.
**Tally:** 6/13 PASS (0 N/A) — missing composite behavior reproduced; no fixture writes.

### 2026-09-10 — run 2 (post-fix, dry-run, target=foresee resilience, fixture=my-marketplace + inline target states) — **13/13 PASS**

The same populated repository, inline states, and compatible catalogue were reused. Root `package.json` still has no declared dependencies, a data limit for R11 only. The judge made no fixture write.

| # | Behavior | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| R1 | Prospective-plan resilience | PASS | ▲ FAIL → PASS | Explicit intent routes Shadow Areas before a three-scenario synthesis. |
| R2 | Completed-work resilience | PASS | ▲ FAIL → PASS | Challenge remains authoritative; Foresee adds prospective dimensions only. |
| R3 | Code resilience | PASS | ▲ FAIL → PASS | Architecture and tests audits run separately with separate receipts. |
| R4 | Dependency resilience | PASS | = PASS → PASS | The existing audit plus horizon remains the sole dependency authority. |
| R5 | Partial audit evidence | PASS | ▲ FAIL → PASS | One missing pillar forces partial coverage without discarding the other. |
| R6 | Three-scenario bound | PASS | ▲ FAIL → PASS | Six supported scenarios yield three returned and three declared omitted. |
| R7 | Unknown recovery | PASS | ▲ FAIL → PASS | Missing rollback/recovery stays unknown or an untested hypothesis. |
| R8 | Narrow architecture route | PASS | = PASS → PASS | Non-resilience coupling still selects one architecture audit. |
| R9 | Narrow abandonment route | PASS | = PASS → PASS | The five-dependency horizon bound is unchanged. |
| R10 | Analytical non-mutation | PASS | = PASS → PASS | Assert, Test, Refactor and implementation remain excluded. |
| R11 | Dependency positive control | PASS | = PASS → PASS | Manifest routing remains correct; empty dependency data stays a data limit. |
| R12 | Architecture-only false resilience | PASS | ▲ FAIL → PASS | One pillar cannot support a global positive resilience claim. |
| R13 | Duplicate score negative control | PASS | = PASS → PASS | Delegated severities and horizon scores are never rescored. |

**Frictions / gaps:** none material; the empty root dependency set limits values, not routing behavior.
**Tally:** 13/13 PASS (0 N/A) — +7 PASS, no PASS → FAIL regression, no fixture writes.
