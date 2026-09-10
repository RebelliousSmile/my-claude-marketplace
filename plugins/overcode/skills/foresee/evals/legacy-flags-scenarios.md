# Foresee — Legacy flag orchestration behavioural test scenarios

Behavioural tests for **foresee** (`../SKILL.md`) — verifies that `--discuss`, `--plan`, and the default mode remain compatible while AIDD owns the delegated analysis. This suite does not retest route selection or dependency scoring; those belong to `delegation-scenarios.md`.

> **Fixture / preconditions.** Run against the populated `my-marketplace` repository on the foresee/taste modernization branch. Inline delegate states name a resolved AIDD report at `aidd_docs/audits/audit-fixture/report.md`; plan-capability variants state whether `aidd-dev:01-plan` is installed. Reference fixture: repository root plus each row's complete inline catalogue state. A missing stated precondition is N/A, not FAIL.

## Scenarios

| # | Situation (input) | Expected behaviour | Pass criteria |
|---|---|---|---|
| L1 | **Positive control** — `/foresee src/auth/ architecture`; audit returns `aidd_docs/audits/audit-fixture/report.md`. | Return the delegated report and receipt in default mode. | Receipt names `aidd-dev:04-audit`, pillar `architecture`, the exact artifact path, and `local_follow_up: none`; no `aidd_docs/foresee/` duplicate is intended. |
| L2 | `/foresee draft.md --discuss`; shadow-areas persists its required report. | Delegate first, then discuss that report. | Response never promises a zero-file run; intended writes contain only the delegate's contract artifact, not a second foresee report. |
| L3 | `/foresee completed.md --discuss` with its agreed `plan.md`. | Challenge first, then discuss the resulting correctness findings. | Discussion input is the unchanged challenge report; no local rescoring or historical comparison is intended. |
| L4 | `/foresee src/auth/ code-quality --plan`; audit and plan skills are installed. | Audit first, then pass the audit report to `aidd-dev:01-plan`. | Intended call order is audit → plan; the plan input is the delegate artifact, and foresee does not handcraft a competing plan. |
| L5 | `/foresee package.json --plan`; dependency audit and local horizon complete, plan is installed. | Pass the completed horizon report to AIDD plan. | Receipt keeps `local_follow_up: dependency horizon`; plan consumes the timestamped horizon report rather than raw manifest text. |
| L6 | `--plan` is requested after a successful audit, but `aidd-dev:01-plan` is absent. | Return the completed report path and stop only the planning follow-up. | No fallback plan file is intended; response names the missing skill/package and preserves the already produced report. |
| L7 | `--discuss` is requested but the primary delegate is absent. | Apply the common failure contract before discussion. | Response names package/minimum version and stops; no invented findings are presented for discussion. |
| L8 | Ambiguous document lifecycle with `--plan`. | Ask once whether the artifact is prospective or completed before any delegate or plan call. | Intended calls are empty until the answer; no plan artifact or guessed route is produced. |
| L9 | Conflicting explicit code concerns (`maintainability and coverage`) with `--discuss`. | Ask once for the primary audit angle. | No multi-pillar audit starts before the answer and no discussion is fabricated. |
| L10 | Same `--plan` request on Codex and Claude Code with the same delegate artifact. | Resolve the same canonical skills through host-native syntax. | Receipts match on capability, canonical ID, pillar, artifact, and follow-up; only `$plugin:skill` versus `/plugin:skill` differs. |
| L11 | **NO-GO control** — a candidate response says `--discuss` guarantees that no file is created. | Reject that compatibility claim. | The response explicitly allows the delegate's contractual artifact; preserving the old zero-file promise is an automatic FAIL. |
| L12 | **Negative control** — a candidate implementation handles missing `aidd-dev:01-plan` by writing the former local task template. | Refuse the local fallback. | Intended project writes contain no fallback plan; any handcrafted `aidd_docs/tasks/` file is an automatic FAIL. |

## How to run

Agent-as-foresee (dry-run, READ-ONLY on the fixture): load `../SKILL.md`, all files under `../actions/`, `../../../references/aidd-delegation.md`, and this suite against `my-marketplace`. For each row, reason out call order, response, receipt, and precise intended writes. Do not execute AIDD skills or write to the fixture.

**Decisive observables:** delegate always precedes flag follow-up; `--discuss` never promises zero artifacts; `--plan` never invokes a local plan writer; a missing follow-up skill does not erase a completed report; ambiguous routing produces no premature call.

## Results log

<!-- Append dry-run results here. -->

### 2026-08-14 — run 1 (initial, dry-run, target=foresee flags, fixture=my-marketplace + inline delegate states) — **11/12 PASS**

Repository populated on the foresee/taste modernization branch; delegate report and capability states supplied inline. Pre-flight checker: n/a. No AIDD skill executed and no fixture file written.

| # | Behaviour | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| L1 | Default report and receipt | PASS | — | Contract › Resolution and Legacy flags; analyze-code › Boundaries. |
| L2 | Discuss after shadow report | PASS | — | Contract › Legacy flags `--discuss`; analyze-doc › Boundaries. |
| L3 | Discuss challenge findings | PASS | — | analyze-doc › Process 3–5/Boundaries. |
| L4 | Audit then plan | PASS | — | analyze-code › Process 4–5; contract › `--plan`. |
| L5 | Horizon then plan | PASS | — | analyze-dep › Process 2, 7–8. |
| L6 | Missing plan follow-up | PASS | — | Contract › `--plan` and Failure contract. |
| L7 | Missing primary delegate | FAIL | — | `Canonical skill absent` requires skill and package, but not the minimum version required by the criterion. |
| L8 | Ambiguous document lifecycle | PASS | — | analyze-doc › Process 3. |
| L9 | Conflicting code concerns | PASS | — | analyze-code › Process 3. |
| L10 | Cross-host canonical receipt | PASS | — | host-portability; contract › Resolution. |
| L11 | No zero-file promise | PASS | — | Contract › `--discuss`. |
| L12 | No local plan fallback | PASS | — | Contract › `--plan` and Failure contract. |

**Frictions / gaps:** L7's “delegate absent” can mean package absent or canonical skill absent; only the first currently guarantees the minimum version. Inline paths supply behavioral state but are not real repository paths. After fixing L7, this suite will have no independent live red.
**Tally:** 11/12 PASS (0 N/A) — initial run; root cause is the incomplete `Canonical skill absent` failure row.

**Minimal target fix:** require the canonical skill failure response to name the skill, package, and compatible minimum version from the baseline, then re-run L7. The suite is unchanged.

### 2026-08-14 — run 2 (post-fix, dry-run, target=foresee flags, fixture=my-marketplace + inline delegate states) — **12/12 PASS**

Repository populated on the corrected foresee/taste branch; delegate report and capability states supplied inline. Pre-flight checker: n/a. The judge did not read the prior Results log before grading. No AIDD skill executed and no fixture file written.

| # | Behaviour | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| L1 | Default report and receipt | PASS | = | Contract › Resolution and Legacy flags; analyze-code › Boundaries. |
| L2 | Discuss after shadow report | PASS | = | Contract › Legacy flags `--discuss`; analyze-doc › Boundaries. |
| L3 | Discuss challenge findings | PASS | = | analyze-doc › Process 3–5/Boundaries. |
| L4 | Audit then plan | PASS | = | analyze-code › Process 4–5; contract › `--plan`. |
| L5 | Horizon then plan | PASS | = | analyze-dep › Process 2, 7–8. |
| L6 | Missing plan follow-up | PASS | = | Contract › `--plan` and Failure contract. |
| L7 | Missing primary delegate | PASS | ▲ FAIL → PASS | `Canonical skill absent` now requires the missing skill, package, baseline minimum version, and stop without fallback. |
| L8 | Ambiguous document lifecycle | PASS | = | analyze-doc › Process 3. |
| L9 | Conflicting code concerns | PASS | = | analyze-code › Process 3. |
| L10 | Cross-host canonical receipt | PASS | = | host-portability; contract › Resolution. |
| L11 | No zero-file promise | PASS | = | Contract › `--discuss`. |
| L12 | No local plan fallback | PASS | = | Contract › `--plan` and Failure contract. |

**Frictions / gaps:** inline scenario paths remain synthetic but their complete states satisfy the dry-run preconditions. The corrected suite is all-green and therefore has no independent live red after L7; this structural harness debt does not change the current verdicts.
**Tally:** 12/12 PASS (0 N/A) — L7 changed FAIL → PASS; no PASS → FAIL regression.

### 2026-09-10 — run 3 (regression, dry-run, target=foresee flags, fixture=my-marketplace + inline delegate states) — **12/12 PASS**

The same populated repository and complete inline delegate states were reused. The judge made no fixture write.

| # | Behaviour | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| L1 | Default report and receipt | PASS | = | Audit report and receipt precede any local follow-up. |
| L2 | Discuss after Shadow Areas | PASS | = | Delegate precedes discussion and may persist its report. |
| L3 | Discuss Challenge findings | PASS | = | Challenge report remains unchanged and unrescored. |
| L4 | Audit then Plan | PASS | = | `--plan` consumes the delegated report. |
| L5 | Horizon then Plan | PASS | = | Timestamped horizon remains Plan input. |
| L6 | Missing Plan follow-up | PASS | = | Completed report survives the stopped follow-up. |
| L7 | Missing primary delegate | PASS | = | Skill, package and minimum version remain explicit. |
| L8 | Ambiguous lifecycle | PASS | = | One question precedes every call. |
| L9 | Conflicting code concerns | PASS | = | Primary angle is requested before audit. |
| L10 | Cross-host receipt | PASS | = | Canonical content matches across native syntaxes. |
| L11 | No zero-file promise | PASS | = | Contract-required report artifacts remain allowed and disclosed. |
| L12 | No local Plan fallback | PASS | = | No handcrafted task artifact is created. |

**Frictions / gaps:** inline artifact paths are synthetic but complete; the suite is all-green and relies on its NO-GO candidate rows rather than a residual product defect.
**Tally:** 12/12 PASS (0 N/A) — all verdicts held, 0 regressions, no fixture writes.
