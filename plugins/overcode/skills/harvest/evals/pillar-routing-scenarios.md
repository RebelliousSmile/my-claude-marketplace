# Harvest pillar routing behavioural test scenarios

Behavioural tests for **Harvest selective execution** (`../SKILL.md` and the future files under `../actions/`) — verifies that unscoped maintenance remains exhaustive while one named pillar loads and runs only its indispensable dependencies. This is the regression specification for Harvest's monolithic token usage.

This suite is distinct from:

- `plan-layout-scenarios.md` — feature-directory lifecycle ownership and purge safety.
- `aidd-artifact-scenarios.md` — AIDD artifact classification and age handling.
- **this file** — pillar routing, dependency closure, output depth, and bounded instruction loading.

> **Fixture / preconditions.** Run against the populated `fixtures/tiered-project/` state. `environment.md` pins unavailable forge CLIs, Local tracker detection, Windows, and read-only intended-write reasoning so no command can discover or affect the parent Marketplace tracker.

## Scenarios

| # | Situation (input) | Expected behaviour | Pass criteria |
|---|---|---|---|
| S1 | Invoke Harvest with no argument. | Route to future action `all` and run every pillar in safe order. | One full inventory is reused; tracker, normative, cleanup, freshness, review, then full report run; existing confirmations remain. |
| S2 | Invoke Harvest with explicit `all`. | Route to future action `all`, identically to no argument. | All five pillars run once and `aidd_docs/harvests/YYYY_MM_DD-harvest.md` is the only Harvest report. |
| S3 | Invoke Harvest with `tracker`. | Route to future action `tracker`. | Only tracker-scoped inventory and tracker reconciliation load; no normative, cleanup, freshness, review, or global report work is intended. |
| S4 | Invoke Harvest with `normative`. | Route to future action `normative`. | Only `reconcile-normative` loads and runs; its result is detailed and no Harvest inventory or global report is intended. |
| S5 | Invoke Harvest with `cleanup`. | Route to future action `cleanup` with required dependencies. | Cleanup-scoped inventory, tracker reconciliation, and normative reconciliation precede cleanup; dependency outcomes are brief; purge still requires confirmation. |
| S6 | Invoke Harvest with `freshness`. | Route to future action `freshness`. | Only document/source discovery and `taste` load; no tracker, normative, cleanup, review, or global report work is intended. |
| S7 | Invoke Harvest with `review`. | Route to future action `review` with status-only tracker support. | Review-scoped inventory and read-only tracker status load; no closure, normative, cleanup, freshness, or global report work is intended. |
| S8 | Invoke Harvest with `cleanup plan_stale_days=30`. | Preserve configuration while resolving cleanup dependencies. | Cleanup uses 30 days where relevant; prerequisites remain minimal; only cleanup is developed in the final response. |
| S9 | Invoke Harvest with only `audit_stale_days=30`. | Default to future action `all`. | Configuration-only input does not ask for scope and all pillars run with the override. |
| S10 | Invoke Harvest with `review` while the completed checkout story is open. | Query tracker status without reconciling or closing it. | No closing comment, story status write, normative call, or completed-plan purge is intended. |
| S11 | Invoke Harvest with `cleanup review`, or with `unknown`. | Refuse ambiguous or unknown selection before work. | Valid choices are listed; no inventory, CLI, delegate, report, tracker write, or deletion is intended. |
| S12 | Complete any single-pillar run. | Return one detailed pillar plus a compact dependency receipt. | Unrelated sections are omitted rather than zero-filled, and no partial global Harvest report is written. |
| S13 | **Positive control** — run the current exhaustive path with an open tracker item and eligible files. | Preserve preview and confirmation gates. | Closing comment is shown before closure; every purge file is enumerated before one explicit deletion confirmation; no recursive delete is intended. |
| S14 | **Negative control** — a candidate cleanup path proposes purging the completed checkout plan before normative reconciliation. | Reject the candidate ordering. | The order constraint prevents every purge until normative reconciliation completes; no destructive write is intended. |

## How to run

Agent-as-Harvest (dry-run, READ-ONLY on the fixture): load `../SKILL.md`, only the action and reference files the scenario route would require when they exist, this suite, and `fixtures/tiered-project/environment.md`. Reason out the selected action, loaded instructions, response sections, dependency receipt, and precise intended writes. Never execute a tracker CLI, sibling skill, file write, or deletion.

**Decisive observables:** unrelated action and pillar-reference files stay unloaded in a targeted run; dependencies use the minimum declared mode; only the requested pillar is developed; no targeted global report is written; tracker closure and deletion retain their previews and confirmations; the fixture and parent repository remain unchanged.

## Results log

### 2026-09-10 — run 1 (initial, dry-run, target=Harvest monolith, fixture=tiered-project) — **4/14 PASS**

The populated fixture pinned Windows and Local tracker detection. The judge reasoned from intended responses and writes only; the fixture and parent repository remained unchanged.

| # | Behaviour | Verdict | Delta vs prior | Note (instruction cited) |
|---|---|---|---|---|
| S1 | No-argument exhaustive default | PASS | — | Phase 1 runs once, followed by tracker, normative, cleanup, freshness, review, and the Phase 7 report. |
| S2 | Explicit `all` route | FAIL | — | No router or explicit `all` action exists; arguments define configuration overrides only. |
| S3 | Tracker-only route | FAIL | — | `tracker` is not a scope and cannot prevent the remaining phases. |
| S4 | Normative-only route | FAIL | — | `reconcile-normative` is reachable only as Phase 4 of the exhaustive workflow. |
| S5 | Cleanup-only dependency closure | FAIL | — | Correct prerequisites run, but freshness, review, and reporting also run and no compact receipt exists. |
| S6 | Freshness-only route | FAIL | — | `taste` is fixed after tracker, normative, and cleanup phases. |
| S7 | Review-only status lookup | FAIL | — | There is no status-only tracker mode; exhaustive work may close items first. |
| S8 | Cleanup plus configuration | FAIL | — | The override is supported but `cleanup` is not recognized as a selector. |
| S9 | Configuration-only exhaustive default | PASS | — | A documented override leaves the exhaustive Phase 1–7 flow intact. |
| S10 | Review avoids tracker closure | FAIL | — | The open Local story is closed and its completed plan can be purged before Phase 6. |
| S11 | Invalid selection refusal | FAIL | — | No grammar rejects multiple pillars or unknown values before work. |
| S12 | Targeted output boundary | FAIL | — | Single-pillar output, compact dependency receipts, and targeted report suppression do not exist. |
| S13 | Destructive confirmation control | PASS | — | Global rules preview closure; Phase 5 enumerates files and requires explicit deletion confirmation. |
| S14 | Normative-before-cleanup control | PASS | — | Phase 5 explicitly forbids purge before Phase 4 completes. |

**Frictions / gaps:** scope and configuration share an undefined argument surface; tracker has no status-only mode; dependencies cannot return compact receipts; sibling skills have no direct pillar route; targeted report and instruction-load boundaries are absent. Existing closure, purge, and ordering safety controls are strong.

**Tally:** 4/14 PASS (0 N/A) — missing selective behaviour reproduced; no fixture writes.
