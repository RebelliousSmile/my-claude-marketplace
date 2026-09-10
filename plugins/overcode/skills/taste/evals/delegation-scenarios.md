# Taste freshness and delegation scenarios

Each scenario is scored as Situation → Expected behavior → Pass criteria. Fixtures are read-only and do not target a real project.

## Target and fixture

- Target: `../SKILL.md`, all files under `../actions/`, `../assets/`, and `../references/`, plus `../../../references/aidd-delegation.md`.
- Populated fixture: this repository after the weighted-freshness refactor, plus the exact weighted claim set, decision evidence, catalogue state, and file count stated in each row. Numeric boundary cases are complete inline data fixtures; no project file is mutated.
- How to run: use `overcode:behave run`, read the target and repository read-only, and judge verdict math, qualification, intended delegation, and forbidden local code analysis. T2 is the positive threshold control; T12 is the negative removed-engine control.

| ID | Situation | Expected behavior | Pass criteria |
|---|---|---|---|
| T1 | Weighted fixture produces 19% local evidence. | Verdict Obsolete. | Exact point totals shown. |
| T2 | Boundary fixtures produce 20%, 79%, and 80%. | Verdicts Partial, Partial, Current. | Same result in single-file worker and aggregation. |
| T3 | Overall local score is 85%, but one critical claim is obsolete. | Veto Current and Superseded. | Verdict Partial; critical evidence named. |
| T4 | Document has no eligible local claim. | Return N/A with no percentage. | No division by zero or invented evidence. |
| T5 | Decision is 90% current and its subject-matched replacement is implemented. | Superseded precedes Current. | Replacement location and relationship are cited. |
| T6 | Decision references one unrelated closed issue. | Do not apply Superseded. | Signal appears under unmatched evidence. |
| T7 | Document mixes local paths and an external market-share claim. | Score local paths; delegate extracted external text to fact-check. | Source file unchanged; fact-check artifact separate. |
| T8 | Fact-check is absent. | Mark external-unverified and qualify the local verdict. | No local fallback and no unqualified global Current. |
| T9 | Scan finds 60 Markdown files. | Prioritize and assess 25 by default. | All 35 unscanned paths and `25/60` coverage are reported. |
| T10 | Codex and Claude Code receive the same dependency-deprecation code request. | Delegate audit pillar `dependencies` through native syntax. | Same canonical receipt and no language detector. |
| T11 | Broken import or compilation concern is explicit, but no repair is requested. | Propose `aidd-dev:03-assert` and require consent without invoking it. | Receipt says `consent: required`; no source, test, configuration, or local regex resolver is touched. |
| T13 | The populated fixture exposes a compiler failure at `src/broken.ts`, and the user explicitly asks Taste to repair it. | Delegate `aidd-dev:03-assert` with granted consent. | Receipt says `consent: granted`, lists every report and assessed-product path named by assert's result or diff under `writes`, and no local regex resolver executes. |
| T14 | The user requests sobriety of a repository or module. | Delegate evidence to `aidd-dev:04-audit`, pillar `code-quality`, then let Taste author the verdict. | Audit report is unchanged and disclosed; no AIDD severity is rescored as product value. |
| T15 | A diff and its need are supplied for sobriety. | Delegate evidence to `aidd-dev:05-review`, axis `relevancy`. | Review requires AIDD Dev 2.5.0, its report is preserved, and Taste owns the later footprint verdict. |
| T16 | Completed work and its agreed reference are supplied for sobriety. | Delegate evidence to `aidd-refine:02-challenge`. | Challenge report remains authoritative and Taste does not duplicate its correctness score. |
| T12 | A removed language reference or detector is restored. | Reject the fixture. | Any active reference to the removed engine fails. |

## Results log

### 2026-08-14 — run 1 (initial, dry-run, target=taste freshness, fixture=my-marketplace + inline claim sets) — **12/12 PASS**

Repository populated after the weighted-freshness refactor; threshold, decision, external-claim, catalogue and 60-file states supplied inline. Pre-flight checker: n/a.

| # | Behavior | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| T1 | 19% boundary | PASS | — | `01-assess-doc.md` › Single-file process/output. |
| T2 | 20/79/80 boundaries | PASS | — | `01-assess-doc.md` › Single-file/Scan process. |
| T3 | Critical veto | PASS | — | `01-assess-doc.md` › Single-file process step 6. |
| T4 | Zero eligible claims | PASS | — | `01-assess-doc.md` › Single-file process steps 3/5. |
| T5 | Subject-matched supersession | PASS | — | `decision-doc.md` › Subject-matched evidence. |
| T6 | Unrelated closed issue | PASS | — | `decision-doc.md` › Subject-matched evidence/Output. |
| T7 | Mixed local/external claims | PASS | — | `01-assess-doc.md` › Ground rules/steps 8–9. |
| T8 | Missing fact-check | PASS | — | `01-assess-doc.md` › steps 8–9. |
| T9 | Bounded scan | PASS | — | `01-assess-doc.md` › Scan process; `SKILL.md` › Transversal rules. |
| T10 | Cross-host dependency route | PASS | — | `02-assess-code.md` › Process; contract › Resolution. |
| T11 | Runnable import route | PASS | — | `02-assess-code.md` › Process/Boundaries. |
| T12 | Removed-engine control | PASS | — | `02-assess-code.md` › Boundaries; contract › Failure contract. |

**Frictions / gaps:** T12's automatic enforcement belongs to the repository structural guard; T9 determines `25/60` through selected/eligible fields rather than a mandated literal rendering.
**Tally:** 12/12 PASS (0 N/A) — initial green run, no fixture writes.

### 2026-09-10 — run 2 (post-fix, dry-run, target=taste consent routing, fixture=my-marketplace + compatible catalogue) — **1/2 PASS**

The populated repository exposes `aidd-dev:03-assert` through `tools/eval/fixtures-aidd-delegation/current-compatible.json`; T13 supplies the compiler-failure state inline. The judge made no fixture write.

| # | Behavior | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| T11 | Compile concern without repair consent | PASS | = | `02-assess-code.md` › Process/Boundaries and the shared routing matrix require `consent: required` without invocation. |
| T13 | Explicitly consented compilation repair | FAIL | new | The route grants consent, but the receipt contract lists report paths only and does not require copying source/test/config paths from assert's result. |

**Frictions / gaps:** T13 exposed a receipt-contract gap: consented mutations were allowed but not exhaustively disclosed.
**Tally:** 1/2 PASS (0 N/A) — target fix required; no fixture writes.

### 2026-09-10 — run 3 (post-fix, dry-run, target=taste consent routing, fixture=my-marketplace + compatible catalogue) — **2/2 PASS**

The same populated repository and compatible catalogue were reused; T13 supplies `src/broken.ts` as inline compiler-failure state. The judge made no fixture write.

| # | Behavior | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| T11 | Compile concern without repair consent | PASS | = PASS → PASS | `02-assess-code.md` › Process/Boundaries returns `consent: required` without invocation or product writes. |
| T13 | Explicitly consented compilation repair | PASS | ▲ FAIL → PASS | `02-assess-code.md` › Process step 5 and the shared receipt contract copy every path named by assert's result or diff into `writes`. |

**Frictions / gaps:** none material; the compiler failure is explicit inline fixture state and all actual mutation paths remain derived from assert's result.
**Tally:** 2/2 PASS (0 N/A) — consent routing green; no fixture writes.

### 2026-09-10 — run 4 (post-fix, dry-run, target=taste sobriety delegation, fixture=my-marketplace + compatible catalogue) — **3/3 PASS**

The populated repository and `current-compatible.json` expose Audit, Review, and Challenge at their required versions. The judge made no fixture write.

| # | Behavior | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| T14 | Repository/module evidence | PASS | new | `03-assess-sobriety.md` and the shared matrix route Audit `code-quality`; Taste owns the verdict. |
| T15 | Diff relevancy evidence | PASS | new | AIDD Dev 2.5.0 satisfies Review `relevancy`; its report is preserved and disclosed. |
| T16 | Completed-work challenge evidence | PASS | new | Challenge remains authoritative; Taste separately judges purpose and footprint. |

**Frictions / gaps:** none; suite metadata now loads all Taste actions and sobriety references.
**Tally:** 3/3 PASS (0 N/A) — all sobriety delegation routes green; no fixture writes.

### 2026-09-10 — run 5 (regression, dry-run, target=taste delegation, fixture=my-marketplace + compatible catalogue) — **16/16 PASS**

The populated repository, inline states, and bundled compatible catalogue were reused. The judge made no fixture write.

| # | Behavior | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| T1 | 19% boundary | PASS | = | Weighted threshold unchanged. |
| T2 | 20/79/80 boundaries | PASS | = | Shared single/aggregate thresholds unchanged. |
| T3 | Critical veto | PASS | = | Critical obsolete claims still veto Current and Superseded. |
| T4 | Zero eligible claims | PASS | = | N/A remains percentage-free. |
| T5 | Subject-matched supersession | PASS | = | Replacement evidence requirements unchanged. |
| T6 | Unrelated closed issue | PASS | = | Unmatched evidence cannot supersede a decision. |
| T7 | Mixed local/external claims | PASS | = | Fact Check remains separate from local score. |
| T8 | Missing Fact Check | PASS | = | Qualified local verdict and no fallback remain required. |
| T9 | Bounded document scan | PASS | = | Default remains 25 with unscanned coverage. |
| T10 | Dependency route | PASS | = | Audit `dependencies` remains canonical. |
| T11 | Compile concern without repair | PASS | = | Assert is proposed with `consent: required`, not invoked. |
| T12 | Removed-engine control | PASS | = | Local detectors remain forbidden. |
| T13 | Consented compilation repair | PASS | = | Assert receives consent and every returned write is disclosed. |
| T14 | Repository/module sobriety | PASS | = | Audit supplies evidence; Taste owns the verdict. |
| T15 | Diff sobriety | PASS | = | Review `relevancy` supplies evidence at AIDD Dev 2.5.0. |
| T16 | Completed-work sobriety | PASS | = | Challenge stays authoritative without rescoring. |

**Frictions / gaps:** none; every scenario has a prior applicable verdict and the target list includes all actions and references.
**Tally:** 16/16 PASS (0 N/A) — all verdicts held, 0 regressions, no fixture writes.
