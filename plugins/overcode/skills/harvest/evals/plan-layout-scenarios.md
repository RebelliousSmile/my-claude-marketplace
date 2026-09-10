# AIDD feature-directory lifecycle scenarios

Behavioural checks shared by `harvest` and `alias/actions/02-endtask.md`. Run as a read-only reasoning pass against synthetic paths; do not mutate `aidd_docs/tasks/`, a tracker, branches or tags.

| # | Fixture | Endtask expectation | Harvest expectation |
|---|---|---|---|
| S1 | `<month>/<feature>/plan.md` has `status: implemented`; every declared sibling phase is `done`. | Select the feature directory, keep `plan.md` in place and pass the directory to learn. | Classify one completed feature directory; do not count its phases independently. |
| S2 | Same shape, but `plan.md` is `in-progress`. | Stop before merge without changing the status or filename. | Classify one active feature directory. |
| S3 | Implemented directory has no tracker identifier. | Resolve no issue without asking. | Assign group C and enumerate every file before proposing purge. |
| S4 | A loose legacy `*.processed.md` exists and no modern matching directory exists. | Accept it only as a legacy completed plan; create no modern or legacy lifecycle suffix. | Classify one legacy completed plan. |
| S5 | A feature `plan.md` has missing, malformed or unknown `status`. | Refuse it as the completed plan. | Report an invalid directory and exclude it from closure and purge. |
| S6 | `plan.md` declares a missing phase, or a declared phase is not `done`. | Stop before merge and name the phase discrepancy. | Keep directory ownership intact; never treat the phase as a loose plan. |
| S7 | An implemented feature directory contains `plan.md`, phases, `review.md` and an extra note. | Verify all durable plan files are tracked; perform no archive rename. | Include every file, including the extra note, in the confirmation list; never use recursive deletion. |
| S8 | An active feature directory contains `review.md`. | Completion still comes only from `plan.md` status. | Request clarification; never infer completion or auto-delete from the review file. |

Pass when all eight outcomes follow the modern directory/status contract and S4 is the only branch that treats `.processed.md` as a lifecycle marker.

## Results

### 2026-08-27 — contract dry-run — 8/8 PASS

| Scenario | Verdict | Evidence |
|---|---|---|
| S1 | PASS | `endtask` resolves `plan_directory`, requires implemented/done statuses and forbids a rename; harvest records the directory before file classification. |
| S2 | PASS | `endtask` stops on active status; harvest has an explicit active-directory class. |
| S3 | PASS | No issue is a silent outcome in `endtask`; harvest maps completed no-tracker directories to group C and enumerates files. |
| S4 | PASS | Both skills isolate `.processed.md` behind a legacy compatibility branch. |
| S5 | PASS | Missing, malformed and unknown statuses are excluded from completed/active harvest classes and cannot satisfy `endtask`. |
| S6 | PASS | `endtask` verifies every declared phase; harvest preserves parent-directory ownership. |
| S7 | PASS | `endtask` verifies tracked durable files; harvest forbids recursive or unenumerated deletion. |
| S8 | PASS | Neither skill derives completion from `review.md`. |

### 2026-09-10 — modular extraction regression — 8/8 PASS

| Scenario | Verdict | Evidence |
|---|---|---|
| S1 | PASS | `feature-lifecycle.md` builds one record per feature directory and `01-inventory.md` prevents owned files from being reclassified. |
| S2 | PASS | `feature-lifecycle.md` preserves `pending`, `in-progress`, and `blocked` as active states. |
| S3 | PASS | Tracker-less completed roots map to C and `04-cleanup.md` enumerates every file before confirmation. |
| S4 | PASS | `remaining-artifacts.md` isolates loose `*.processed.md` as legacy completed work. |
| S5 | PASS | Missing, malformed, and unknown direct statuses are invalid and excluded from closure and purge. |
| S6 | PASS | Feature-directory phases remain owned by their parent and never become loose plans. |
| S7 | PASS | Inventory includes every extra file and cleanup permits only explicitly enumerated paths. |
| S8 | PASS | Active directories containing `review.md` require clarification; completion is never inferred. |

**Frictions / gaps:** discrepancy naming and Git tracking terminology remain implicit in the shared Endtask contract; neither changes Harvest behaviour.

**Tally:** 8/8 PASS (0 N/A) — no extraction regression; no fixture writes.
