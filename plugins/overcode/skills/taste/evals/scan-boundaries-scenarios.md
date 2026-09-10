# Taste — Bounded document scan behavioural test scenarios

Behavioural tests for **taste assess-doc scan mode** (`../actions/01-assess-doc.md`) — verifies selection budgets, risk ordering, aggregation, and read-only recommendations. This suite does not retest claim-score thresholds or code delegation; those belong to `delegation-scenarios.md`.

> **Fixture / preconditions.** Run against the populated `my-marketplace` repository plus the complete inline Markdown inventory stated by each row. The inventory supplies file count, decision markers, relative-link state, claim class, Git commit ordering, and salvageability; no file is created to materialize it. Reference fixture: repository root with a read-only scenario overlay. Missing inventory fields needed by a row make that row N/A, not FAIL.

## Scenarios

| # | Situation (input) | Expected behaviour | Pass criteria |
|---|---|---|---|
| S1 | **Positive control** — default `/taste` over an inventory of 60 eligible Markdown files. | Select exactly 25 files and report scan coverage before assessment. | Output names `25 selected / 60 eligible` and lists all 35 unscanned paths; no 26th worker is intended. |
| S2 | Default `/taste` over eight eligible Markdown files. | Assess all eight without padding the batch. | Selected and eligible counts are both eight; no invented ninth path appears. |
| S3 | `/taste --limit 7` over 60 eligible files. | Respect the explicit smaller budget. | Exactly seven paths are selected and all 53 unscanned paths are listed. |
| S4 | `/taste --all` over 60 eligible files. | Treat all 60 as selected. | Coverage is `60/60`; intended execution may be concurrent or sequential but remains read-only. |
| S5 | `decision.md` has a decision marker; `old.md` is older but has no risk shape. | Prioritize `decision.md` before age-only files. | Selection order places the decision marker first; filesystem mtime is not cited as freshness evidence. |
| S6 | `contract.md` states a required missing file; `notes.md` contains only informative paths. | Prioritize the critical-claim shape. | `contract.md` ranks first even before verification; the priority itself does not pre-assign an Obsolete verdict. |
| S7 | `guide.md` contains an immediately resolvable broken relative link; remaining files have only Git age. | Prioritize `guide.md` after marker/critical shapes and before age-only files. | Link is resolved relative to `guide.md`; no external or anchor-only link is used for this priority. |
| S8 | `architecture.md` predates newer commits touching its named local targets, but its claims still match exactly. | Use divergence for priority, then return Current from evidence. | Git history changes queue position only; no score point is lost solely because newer commits exist. |
| S9 | **NO-GO control** — `ancient.md` has the oldest filesystem mtime and no falsifiable local claim. | Do not classify it Obsolete from age. | Verdict is N/A with no percentage; mtime is absent from evidence and scoring. |
| S10 | Two obsolete claims share normalized value `old/path.md` across two files. | Emit one root-cause group after worker aggregation. | Group lists both files once and does not merge a different stale value. |
| S11 | One root cause affects three claims in `a.md`; another file has one localized stale claim. | Recommend rewrite for `a.md` and update for the localized file. | Recommendations follow rewrite-at-three versus update-at-one/two; no project file is actually modified. |
| S12 | Every eligible claim in `dead.md` is obsolete, but one conceptual section remains salvageable. | Do not recommend deletion. | Suggested action is update or rewrite; delete appears only when no salvageable content exists. |
| S13 | Every eligible claim in `discard.md` is obsolete and the fixture states no salvageable content. | Recommend deletion without performing it. | Intended project writes/deletes remain empty; deletion appears only as a read-only recommendation. |
| S14 | Workers return Current, Partial, Superseded, Obsolete, and N/A with external qualifications. | Aggregate the exact worker schema in severity order. | Order is Obsolete → Superseded → Partial → Current → N/A; point totals and qualifications survive unchanged. |
| S15 | Host offers no subagents for a selected batch of 25. | Run the same bounded assessments sequentially. | No model name, background flag, or one-agent-per-file requirement appears; selected/unscanned coverage is unchanged. |
| S16 | Scan runs as a `harvest` sub-phase with 25 selected of 60 and three external-pending claims. | Return document metrics to the orchestrator. | Result includes verdict counts, earned/eligible local points, `external_pending: 3`, and `25/60` scan coverage. |
| S17 | **Negative control** — a candidate scanner silently assesses all 60 files despite default mode. | Reject the unbounded execution. | More than 25 selected paths, a missing unscanned list, or implicit all-file fan-out is an automatic FAIL. |

## How to run

Agent-as-taste (dry-run, READ-ONLY on the fixture): load `../SKILL.md`, `../actions/01-assess-doc.md`, `../assets/claim-types.md`, `../assets/decision-doc.md`, and this suite against `my-marketplace` plus the row's inline inventory. Reason out selection, intended execution, aggregate response, and intended writes/deletes; do not assess or modify the real repository.

**Decisive observables:** default selected count never exceeds 25; every unscanned path is named; priority signals never become evidence; worker fields survive aggregation; no recommendation causes a real write/delete; execution never requires a host model or subagent topology.

## Results log

<!-- Append dry-run results here. -->

### 2026-08-14 — run 1 (initial, dry-run, target=taste scan, fixture=my-marketplace + inline inventories) — **15/17 PASS**

Repository populated after the weighted-freshness refactor; file counts, risk shapes, Git order, evidence and salvageability supplied inline. Pre-flight checker: n/a. No scan executed and no fixture file written.

| # | Behaviour | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| S1 | Default 25/60 budget | PASS | — | assess-doc › Scan 3/Test. |
| S2 | Eight eligible files | PASS | — | assess-doc › Scan 3. |
| S3 | Explicit limit 7 | PASS | — | assess-doc › Scan 3. |
| S4 | Explicit all | PASS | — | assess-doc › Inputs/Scan 3; Ground rules. |
| S5 | Decision-marker priority | PASS | — | assess-doc › Scan 2; decision-doc › Detection. |
| S6 | Critical-shape priority | PASS | — | assess-doc › Scan 2 and verification steps. |
| S7 | Broken-relative-link priority | PASS | — | assess-doc › Scan 2; claim-types › Exclusions. |
| S8 | Git divergence is not evidence | PASS | — | assess-doc › Ground rules/Scan 2. |
| S9 | Mtime cannot make Obsolete | PASS | — | assess-doc › steps 3/5 and Ground rules. |
| S10 | Cross-file root cause | PASS | — | assess-doc › Scan 6. |
| S11 | Rewrite at three claims | FAIL | — | Scan 6 defines a root cause only across ≥2 files, so three claims in one file fall through to update. |
| S12 | Salvage blocks deletion | PASS | — | assess-doc › Scan 6. |
| S13 | Read-only delete recommendation | PASS | — | assess-doc › Ground rules/Scan 6. |
| S14 | Exact aggregate schema/order | PASS | — | assess-doc › Output/Scan 5. |
| S15 | Sequential host fallback | PASS | — | assess-doc › Scan 4; host-portability. |
| S16 | Harvest metrics | PASS | — | assess-doc › Scan 7; SKILL › Harvest integration. |
| S17 | Unbounded scanner control | FAIL | — | Live negative control: the candidate violates the explicit default limit and omits unscanned paths. |

**Frictions / gaps:** inline inventories do not enumerate all 60 path names; S10's filename deduplication and S16's literal serialization are semantically determined but not explicitly formatted. S17 is the intended live red, not a current target regression.
**Tally:** 15/17 PASS (0 N/A) — one target defect (S11) and one intentional negative-control failure (S17).

**Minimal target fix for S11:** make two independent rules: group the same stale value across at least two files as a cross-file root cause; recommend rewrite whenever one cause affects at least three claims in a file, even if that cause occurs in no second file. Otherwise recommend update. Re-run S11 after the fix; leave S17 red as the control. The suite is unchanged.

### 2026-08-14 — run 2 (post-fix, dry-run, target=taste scan, fixture=my-marketplace + inline inventories) — **16/17 PASS**

Repository populated after the bounded-scan correction; inventories and evidence supplied inline. Pre-flight checker: n/a. The judge did not read the prior Results log before grading. No scan executed and no fixture file written.

| # | Behaviour | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| S1 | Default 25/60 budget | PASS | = | assess-doc › Scan 3/Test. |
| S2 | Eight eligible files | PASS | = | assess-doc › Scan 3. |
| S3 | Explicit limit 7 | PASS | = | assess-doc › Scan 3. |
| S4 | Explicit all | PASS | = | assess-doc › Inputs/Scan 3; Ground rules. |
| S5 | Decision-marker priority | PASS | = | assess-doc › Scan 2; decision-doc › Detection. |
| S6 | Critical-shape priority | PASS | = | assess-doc › Scan 2 and verification steps. |
| S7 | Broken-relative-link priority | PASS | = | assess-doc › Scan 2; claim-types › Exclusions. |
| S8 | Git divergence is not evidence | PASS | = | assess-doc › Ground rules/Scan 2. |
| S9 | Mtime cannot make Obsolete | PASS | = | assess-doc › steps 3/5 and Ground rules. |
| S10 | Cross-file root cause | PASS | = | assess-doc › Scan 6 separates normalized cross-file groups. |
| S11 | Rewrite at three claims | PASS | ▲ FAIL → PASS | Scan 6 now computes per-file recommendations independently: rewrite at three claims even without a cross-file group. |
| S12 | Salvage blocks deletion | PASS | = | assess-doc › Scan 6. |
| S13 | Read-only delete recommendation | PASS | = | assess-doc › Ground rules/Scan 6. |
| S14 | Exact aggregate schema/order | PASS | = | assess-doc › Output/Scan 5. |
| S15 | Sequential host fallback | PASS | = | assess-doc › Scan 4; host-portability. |
| S16 | Harvest metrics | PASS | = | assess-doc › Scan 7; SKILL › Harvest integration. |
| S17 | Unbounded scanner control | FAIL | = intentional FAIL | Live negative control rejects the candidate's 60-file default selection and missing unscanned list. |

**Frictions / gaps:** inline inventories still do not materialize all path names; S10's path deduplication and S16's literal metric serialization remain semantic rather than explicitly formatted. S17 is the intended live red, not a target regression.
**Tally:** 16/17 PASS (0 N/A) — S11 changed FAIL → PASS; no PASS → FAIL regression; S17 remains the sole intentional FAIL.

### 2026-09-10 — run 3 (regression, dry-run, target=taste scan, fixture=my-marketplace + inline inventories) — **16/17 PASS**

The same populated repository and complete inline inventories were reused. The judge made no fixture write.

| # | Behaviour | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| S1 | Default 25/60 budget | PASS | = | Default selection and unscanned coverage held. |
| S2 | Eight eligible files | PASS | = | Worker count remains bounded by eligibility. |
| S3 | Explicit limit 7 | PASS | = | Seven selected and 53 unscanned remain explicit. |
| S4 | Explicit all | PASS | = | `--all` remains the only all-file opt-in. |
| S5 | Decision-marker priority | PASS | = | Marker affects priority, not verdict. |
| S6 | Critical-shape priority | PASS | = | Critical shapes precede informative ones. |
| S7 | Broken-relative-link priority | PASS | = | Links resolve from the document. |
| S8 | Git divergence is not evidence | PASS | = | Git history remains priority only. |
| S9 | Mtime cannot make Obsolete | PASS | = | No eligible claim remains N/A. |
| S10 | Cross-file root cause | PASS | = | Duplicate normalized causes still group across files. |
| S11 | Rewrite at three claims | PASS | = | Per-file rewrite remains independent of cross-file grouping. |
| S12 | Salvage blocks deletion | PASS | = | Salvageable content prevents delete. |
| S13 | Read-only delete recommendation | PASS | = | Recommendation never performs deletion. |
| S14 | Exact aggregate schema/order | PASS | = | Fields, totals and qualifications survive aggregation. |
| S15 | Sequential host fallback | PASS | = | No model or topology is required. |
| S16 | Harvest metrics | PASS | = | Counts, points, pending facts and coverage remain available. |
| S17 | Unbounded scanner control | FAIL | = intentional FAIL | Candidate all-file default remains rejected by the 25-file bound. |

**Frictions / gaps:** inline inventories do not list 60 literal paths; S17 remains the live red control, not a target regression.
**Tally:** 16/17 PASS (0 N/A) — all verdicts held, 0 regressions, no fixture writes.
