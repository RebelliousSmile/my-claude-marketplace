---
objective: "All currently open GitHub issues are either implemented and verified against the current repository or closed as demonstrably obsolete."
status: implemented
---

# Plan: Close every open issue against current state

## Overview

| Field      | Value |
| ---------- | ----- |
| **Goal**   | Revalidate, implement, verify, and close issues #8, #9, #12, #13, and #24 without applying obsolete requirements. |
| **Source** | GitHub issues `RebelliousSmile/my-claude-marketplace#8`, `#9`, `#12`, `#13`, `#24` plus the current `main` worktree. |

## Phases

| #   | Phase | File |
| --- | ----- | ---- |
| 1 | Adjudicate obsolete claims and establish a current baseline | [`phase-1.md`](./phase-1.md) |
| 2 | Add narrow-scope analysis to reconcile-normative (#24) | [`phase-2.md`](./phase-2.md) |
| 3 | Repair current control target defects (#12) | [`phase-3.md`](./phase-3.md) |
| 4 | Repair and rerun the control authority suite (#12) | [`phase-4.md`](./phase-4.md) |
| 5 | Eliminate current routing-coverage debt (#9) | [`phase-5.md`](./phase-5.md) |
| 6 | Make design enforcement brownfield-capable (#8) | [`phase-6.md`](./phase-6.md) |
| 7 | Release, verify, and close the issue set | [`phase-7.md`](./phase-7.md) |

## Decisions

| Decision | Why |
| -------- | --- |
| Current repository evidence outranks historical ticket counts and line references. | #9 and #13 explicitly contain later runs and migrated paths; applying the original counts would recreate closed defects. |
| Preserve DEC-002's WHAT/HOW boundary while adding brownfield support. | Existing project lint wiring and WordPress `theme.json` are stack-specific realization concerns; the design contract remains stack-agnostic. |
| Finish the live routing debt rather than hardening a warning threshold around it. | The current gate has only nine missing suites and two undeclared single-action routes; complete coverage makes the policy moot and proves the issue is closed. |
| Treat external fixture-dependent verdicts as valid only when the fixture is actually readable. | A fresh run must not claim evidence from historical logs or unavailable paths. |
