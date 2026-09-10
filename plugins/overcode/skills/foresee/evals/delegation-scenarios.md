# Foresee delegation scenarios

Each scenario is scored as Situation → Expected behavior → Pass criteria. These fixtures do not mutate a real project.

## Target and fixture

- Target: `../SKILL.md`, all files under `../actions/` and `../references/`, `../../../references/aidd-delegation.md`, and the repository guard `tools/eval/aidd-delegation.mjs`.
- Populated fixture: this repository after the AIDD-routing refactor, plus the concrete catalogue/manifest state stated in each row. Synthetic absence, version, and 80-dependency variants are reasoned as read-only deltas; they are never written into the repository.
- How to run: use `overcode:behave run`, read the target and repository read-only, and judge the exact intended route, receipt, report scope, and forbidden local work. F1 is the positive routing control; F10 is the negative no-local-engine control.

| ID | Situation | Expected behavior | Pass criteria |
|---|---|---|---|
| F1 | Codex receives an unfinished plan path. | Resolve `aidd-refine:03-shadow-areas` and use Codex-native skill invocation. | Receipt names shadow-areas, its report write, and `consent: not-required`; no local scoring rubric or foresee history is used. |
| F2 | Claude Code receives completed work plus its agreed plan. | Resolve `aidd-refine:02-challenge` and use Claude-native invocation. | Both artifacts reach challenge; receipt is otherwise host-equivalent to F1. |
| F3 | A general code directory is supplied. | Delegate audit pillar `architecture`. | Exactly one audit route; no per-file local agents or improvement catalogue. |
| F4 | `aidd-dev` is absent. | Apply the common package-absent failure. | Package and minimum version are named; no local audit runs. |
| F5 | `aidd-dev` is below `2.4.1`. | Stop the affected branch as incompatible. | Installed and required versions are reported. |
| F6 | A manifest contains 80 dependencies. | Run AIDD audit, then horizon-analyze its top five only. | Scope is `5 of 80`; no sixth horizon profile exists. |
| F7 | The user supplies the same manifest with `--all`. | Announce count/cost and analyze the audit result set using native bounded execution. | Explicit flag is honored without model-specific instructions. |
| F8 | Maintainer metadata cannot be sourced. | Record continuity as `unknown` and reduce coverage. | Unknown is absent from the mean denominator and cannot improve horizon. |
| F9 | A prior local horizon report exists. | Compare only horizon signals. | AIDD CVE/version findings are linked, never copied into persistence. |
| F10 | A candidate patch presented to the structural guard reintroduces a legacy detector/checklist into doc or code routes. | Reject the candidate patch. | The guard returns non-zero and names the forbidden local engine; accepting the candidate is a failure. |
| F11 | Explicit code resilience is requested. | Run Audit `architecture`, then Audit `tests`, and synthesize at most three supported scenarios. | Two unchanged reports and receipts are returned; one pillar never masquerades as complete resilience. |
| F12 | Explicit resilience is requested for an unfinished plan. | Route evidence to `aidd-refine:03-shadow-areas` before synthesis. | No code audit runs and missing recovery evidence stays unknown. |
| F13 | Explicit resilience is requested for a dependency manifest. | Reuse `analyze-dep`. | Dependency audit and horizon scores are linked once and never copied into a new score. |

## Results log

### 2026-08-14 — run 1 (initial, dry-run, target=foresee routing, fixture=my-marketplace + inline deltas) — **9/10 PASS**

Repository populated after the AIDD refactor; catalogue, manifest, absence/version, 80-dependency and legacy-engine states supplied inline. Pre-flight checker: n/a.

| # | Behavior | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| F1 | Prospective doc routing | PASS | — | `01-analyze-doc.md` › Process/Boundaries; contract › Resolution. |
| F2 | Completed-work routing | PASS | — | `01-analyze-doc.md` › Process; contract › Resolution. |
| F3 | General code routing | PASS | — | `02-analyze-code.md` › Process/Boundaries. |
| F4 | Missing package | PASS | — | contract › Failure contract. |
| F5 | Incompatible version | PASS | — | contract › Compatibility baseline/Failure contract. |
| F6 | Five-dependency budget | PASS | — | `03-analyze-dep.md` › Process; `context-map.md`. |
| F7 | Explicit all opt-in | PASS | — | `03-analyze-dep.md` › Inputs/Process. |
| F8 | Unknown evidence | PASS | — | `03-analyze-dep.md` › Process; `scoring-rubrics.md`. |
| F9 | Horizon-only persistence | PASS | — | `03-analyze-dep.md` › Output/Process. |
| F10 | Reintroduced local engine | FAIL | — | The inline delta made the target itself regress; the suite did not name the structural guard that rejects candidate changes. |

**Frictions / gaps:** F10 proves the negative control but scopes the target too narrowly; add the already implemented structural guard to the target and judge the proposed patch at that gate.
**Tally:** 9/10 PASS (0 N/A) — one live negative-control failure; no current repository file was mutated by the judge.

### 2026-08-14 — run 2 (post-fix, dry-run, target=foresee routing + structural guard, fixture=my-marketplace + F10 candidate patch) — **1/1 PASS**

Target now includes the repository guard; only F10 is replayed against the same read-only repository and inline candidate patch. Pre-flight checker: n/a.

| # | Behavior | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| F10 | Reintroduced local engine | PASS | ▲ FAIL → PASS | `tools/eval/aidd-delegation.mjs` › `forbiddenFindings` and `validateStatic` name the forbidden engine, collect the problem and exit non-zero. |

**Frictions / gaps:** the gate recognizes the historical paths and algorithm signatures pinned by its negative fixtures; an equivalent engine under wholly new vocabulary would require a new fixture.
**Tally:** 1/1 PASS (0 N/A) — F10 confirmed green after target-scope repair; no fixture writes.

### 2026-09-10 — run 3 (post-fix, dry-run, target=foresee resilience delegation, fixture=my-marketplace + compatible catalogue) — **3/3 PASS**

The populated repository and compatible catalogue expose Shadow Areas, Challenge and Audit. The judge made no fixture write.

| # | Behavior | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| F11 | Code resilience evidence | PASS | new | `04-analyze-resilience.md` runs architecture then tests, preserves both reports and returns at most three scenarios. |
| F12 | Prospective-document resilience | PASS | new | Shadow Areas is the only delegate before synthesis; missing recovery remains unknown. |
| F13 | Dependency resilience | PASS | new | `analyze-dep` remains the single horizon authority and no duplicate score is emitted. |

**Frictions / gaps:** none; suite metadata now loads every Foresee action and reference.
**Tally:** 3/3 PASS (0 N/A) — all target-specific resilience routes green; no fixture writes.
