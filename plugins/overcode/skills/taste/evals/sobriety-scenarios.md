# Taste sobriety behavioural test scenarios

Behavioural tests for **Taste sobriety** (`../SKILL.md` and `../actions/03-assess-sobriety.md`) — verifies that repository lightness is judged against essential product purpose, with bounded AIDD evidence and no hidden product mutation. This is distinct from `delegation-scenarios.md`, which pins freshness and low-level capability routing, and `scan-boundaries-scenarios.md`, which pins Markdown scan scope.

> **Fixture / preconditions.** Run against the populated `my-marketplace` repository plus the complete inline candidate facts in each row. The repository contains active plugin manifests, code, documentation, tests and AIDD plans; inline facts supply product-value or usage states that the repository cannot truthfully imply. Reference fixture: repository root at the current branch plus `tools/eval/fixtures-aidd-delegation/current-compatible.json`. Missing inline evidence is a deliberate boundary, not permission to fabricate it.

## Scenarios

| # | Situation (input) | Expected behaviour | Pass criteria |
|---|---|---|---|
| S1 | Assess a working legacy export whose retired plan is explicit, with no active entry point and 14 source/test/doc/config files maintained only for it. | Classify `Remove` and explain why essential product purpose survives. | Names the full 14-file footprint, functional loss, evidence, confidence and net removable surface; no file is changed. |
| S2 | Two active commands implement the same user outcome through separate parsers and duplicated tests. | Classify `Merge`. | Names both variants, the retained behavior, duplicated footprint and net reduction; delegates code-quality evidence without treating Audit as the product verdict. |
| S3 | A large implementation is the only path to an explicitly required export format used by the current release contract. | Classify `Retain`. | Unique demonstrated value overrides raw line count; no removal is recommended merely because the implementation is large. |
| S4 | One feature contains a speculative abstraction used once, while its behavior remains required. | Classify `Simplify`. | Separates required behavior from removable abstraction and states the behavior-preserving footprint reduction. |
| S5 | A compatibility adapter targets an explicitly unsupported version and has no remaining caller. | Classify `Remove`. | Cites support policy and caller evidence; includes adapter tests, docs and configuration in the removal footprint. |
| S6 | Three features duplicate validation because one small shared primitive is absent; adding it removes more code than it adds. | Classify `Add minimally` and `Merge` where applicable. | Reports gross addition, gross removal and net reduction; does not propose a general framework beyond the three proven consumers. |
| S7 | The current product purpose explicitly requires data export, but the bounded target has no export path; the smallest conforming implementation adds code. | Classify `Add minimally`. | States why essential purpose currently fails, the smallest addition, positive net code growth and why that growth is justified. |
| S8 | The user asks only to "make Taste assess sobriety" without naming a repository, module, diff or completed feature. | Ask once for a bounded target. | No audit, review, challenge, source write or report artifact starts before the answer. |
| S9 | A feature has no usage telemetry and product-purpose sources conflict. | Surface uncertainty rather than infer uselessness. | No `Remove` verdict is asserted as fact; the conflict and missing evidence are named. |
| S10 | A diff and its active need are supplied for assessment. | Delegate `aidd-dev:05-review` axis `relevancy`, then keep the final volume/value verdict in Taste. | Review report stays authoritative, its path is disclosed in `writes`, and Taste independently classifies candidates without rescoring Review. |
| S11 | **Positive control** — assess whether `README.md` is current. | Route to existing `assess-doc`. | Freshness behavior remains available and no sobriety action captures the request. |
| S12 | **Negative control** — a candidate implementation ranks the largest files for deletion without reading product purpose, loss or full feature footprint. | Reject the candidate as an invalid sobriety assessment. | A line-count-only recommendation cannot receive a valid `Remove` verdict and causes no product write. |

## How to run

Agent-as-Taste (dry-run, READ-ONLY on the fixture): load `../SKILL.md`, all files under `../actions/`, `../references/sobriety-signals.md` when present, `../../../references/aidd-delegation.md`, this suite and the populated repository fixture. For each scenario, reason out the response, selected delegate(s), receipt(s), and precise intended writes. Do not execute a delegate or mutate the fixture.

**Decisive observables:** source/tests/configuration remain untouched; report artifacts are disclosed under `writes`; every reduction is grounded in product purpose and full footprint rather than line count; missing evidence stays uncertainty; AIDD findings remain attributable to AIDD while Taste owns the sobriety verdict.

## Results log

### 2026-09-10 — run 1 (initial, dry-run, target=taste sobriety, fixture=my-marketplace + inline candidate facts) — **1/12 PASS**

The populated Marketplace repository and compatible AIDD catalogue were loaded; every product-value state absent from the repository was supplied completely by its scenario. The judge made no fixture write.

| # | Behavior | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| S1 | Working legacy feature removal | FAIL | — | `SKILL.md` exposes no sobriety action or `Remove` contract. |
| S2 | Duplicate feature merge | FAIL | — | `02-assess-code.md` can obtain Audit evidence but cannot author a `Merge` verdict. |
| S3 | Large useful feature retained | FAIL | — | No rule lets demonstrated value override raw volume. |
| S4 | Required behavior simplified | FAIL | — | No `Simplify` verdict or behavior/abstraction separation exists. |
| S5 | Unsupported adapter removed | FAIL | — | No feature-level footprint or removal judgment exists. |
| S6 | Minimal unifier with net reduction | FAIL | — | No gross-addition/removal accounting or compound classification exists. |
| S7 | Essential missing capability | FAIL | — | Taste does not assess whether product purpose is met. |
| S8 | Sobriety request without target | FAIL | — | `SKILL.md` defaults no-path input to Markdown scan instead of asking for scope. |
| S9 | Conflicting purpose evidence | FAIL | — | No sobriety uncertainty contract exists. |
| S10 | Diff relevancy delegation | FAIL | — | Review is compatible but unreachable from Taste routing. |
| S11 | Freshness positive control | PASS | — | `SKILL.md` routes Markdown to `assess-doc`. |
| S12 | Line-count-only negative control | FAIL | — | Read-only safety exists, but no semantic validity gate rejects this verdict. |

**Frictions / gaps:** the native sobriety contract, target gate, product-purpose hierarchy, complete footprint, value/loss/confidence fields, net-volume accounting, uncertainty handling and five verdicts are absent. S11 proves the judge can credit current behavior.
**Tally:** 1/12 PASS (0 N/A) — missing behavior reproduced; no fixture writes.

### 2026-09-10 — run 2 (post-fix, dry-run, target=taste sobriety, fixture=my-marketplace + inline candidate facts) — **12/12 PASS**

The same populated repository, complete inline candidate states, and compatible AIDD catalogue were reused. The judge made no fixture write.

| # | Behavior | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| S1 | Working legacy feature removal | PASS | ▲ FAIL → PASS | `03-assess-sobriety.md` and `sobriety-signals.md` require full footprint, loss, evidence, confidence and net change. |
| S2 | Duplicate feature merge | PASS | ▲ FAIL → PASS | The shared matrix delegates Audit evidence; Taste retains the `Merge` verdict. |
| S3 | Large useful feature retained | PASS | ▲ FAIL → PASS | `Retain` follows unique demonstrated value; line count is footprint only. |
| S4 | Required behavior simplified | PASS | ▲ FAIL → PASS | `Simplify` removes the abstraction while preserving required behavior. |
| S5 | Unsupported adapter removed | PASS | ▲ FAIL → PASS | Purpose authority and complete footprint cover policy, callers, tests, docs and configuration. |
| S6 | Minimal unifier with net reduction | PASS | ▲ FAIL → PASS | Compound `Add minimally` plus `Merge` and gross/net accounting are explicit. |
| S7 | Essential missing capability | PASS | ▲ FAIL → PASS | The smallest conforming addition may justify positive net growth. |
| S8 | Sobriety request without target | PASS | ▲ FAIL → PASS | Explicit sobriety intent asks once for scope before work. |
| S9 | Conflicting purpose evidence | PASS | ▲ FAIL → PASS | Conflict caps confidence and forbids unconditional removal. |
| S10 | Diff relevancy delegation | PASS | ▲ FAIL → PASS | Review report stays authoritative and disclosed; Taste owns value and volume. |
| S11 | Freshness positive control | PASS | = PASS → PASS | Non-sobriety Markdown still routes to `assess-doc`. |
| S12 | Line-count-only negative control | PASS | ▲ FAIL → PASS | Purpose, loss and footprint gates reject size-only removal. |

**Frictions / gaps:** none material. Inline states omit literal candidate filenames by design; the action must trace concrete paths in an actual run.
**Tally:** 12/12 PASS (0 N/A) — +11 PASS, no PASS → FAIL regression, no fixture writes.
