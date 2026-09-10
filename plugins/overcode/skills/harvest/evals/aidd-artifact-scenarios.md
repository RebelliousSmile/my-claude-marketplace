# AIDD v5 artifact classification scenarios

Behavioural checks for the non-plan artifacts the AIDD framework writes beside feature directories. Run as a read-only reasoning pass against synthetic paths; do not mutate `aidd_docs/`, a tracker, branches or tags.

| # | Fixture | Harvest expectation |
|---|---|---|
| A1 | `aidd_docs/backlog/stories/checkout-guest.md` with `status: done`, no story under `aidd_docs/tasks/`. | Inventory reaches `aidd_docs/backlog/`; the local tracker is detectable; 6a proposes deletion. |
| A2 | `aidd_docs/backlog/defects/flaky-login.md`, 200 days old. | Classified as a product artifact, counted, never proposed for deletion. |
| A3 | `aidd_docs/tasks/2026_03/2026_03_04_audit/` holding `security.md`, `performance.md`, `report.md`, 120 days old. | One audit run, handled as a unit under the 90-day table; no pillar file falls into the active-plan bands. |
| A4 | `aidd_docs/tasks/2026_03/2026_03_09_memory-check/report.md`, 150 days old. | One non-plan output directory (6g), 90-day clarification; never a legacy active plan. |
| A5 | `aidd_docs/tasks/harden-ci.md` with `success_condition`, `iteration: 7`, `status: in-progress`, 200 days old. | Autonomous tracking file (6h): kept and flagged with its iteration; age is never the criterion. |
| A6 | `aidd_docs/tasks/2026_03/2026_03_11-billing-prd.md`, 180 days old. | Product artifact, reported only; excluded from the 6d age table. |
| A7 | An implemented feature directory holding `plan.md`, `phase-1.md`, `review.md` and `spec.md`. | Every file, `spec.md` included, is enumerated in the purge confirmation; no recursive deletion. |
| A8 | `aidd_docs/tasks/status/` holding four `<yyyy>_<mm>_<dd>_project_status.md`, the newest 200 days old. | Report root (6g): aged file by file, the newest kept whatever its age; never a legacy active plan. |

Pass when no fixture without a direct `plan.md` is ever evaluated by the plan age bands, and when the two `aidd_docs/` roots (`tasks/`, `backlog/`) are both scanned.

## Results

### 2026-09-10 — contract dry-run — 8/8 PASS

| Scenario | Verdict | Evidence |
|---|---|---|
| A1 | PASS | Phase 1 lists both roots; the Local tracker row names `aidd_docs/backlog/stories/`; 6a covers it explicitly. |
| A2 | PASS | Type 9 marks `aidd_docs/backlog/` outside `stories/` as never purged; the Phase 5 table repeats it. |
| A3 | PASS | Type 3 recognises `<yyyy_mm_dd>_audit/` and the legacy `tasks/audits/`; 6f treats the run as one unit. |
| A4 | PASS | Type 4 catches any month-level directory without a direct `plan.md`; 6g applies the 90-day table. |
| A5 | PASS | Type 8 keys on `success_condition` / `iteration`; 6h decides on status only and 6d excludes the type. |
| A6 | PASS | Type 9 covers `*-prd.md`; 6d names it among the types that never enter the age table. |
| A7 | PASS | Phase 1 record building enumerates every artifact of the folder, and Phase 5 forbids unenumerated deletion. |
| A8 | PASS | Type 4 names `status/`, `memory/`, `audits/` at the `tasks/` root; 6g keeps the most recent report and ages the rest. |
