---
objective: "Harvest preserves its exhaustive default while allowing one requested pillar to run with only its indispensable, briefly reported dependencies, proven by behavioural regression tests."
status: implemented
---

# Plan: Tiered Harvest pillars

## Overview

| Field      | Value |
| ---------- | ----- |
| **Goal**   | Make Harvest selectively runnable by pillar without weakening dependency, confirmation, or full-run guarantees. |
| **Source** | Conversation of 2026-09-10: approved brainstorm plus the explicit requirement for behavioural tests. |

## Phases

| #   | Phase | File |
| --- | ----- | ---- |
| 1 | Pin the routing and dependency behaviour | [`phase-1.md`](./phase-1.md) |
| 2 | Extract the monolith into scoped actions | [`phase-2.md`](./phase-2.md) |
| 3 | Enable targeted pillars and dependency receipts | [`phase-3.md`](./phase-3.md) |
| 4 | Prove compatibility and publish the contract | [`phase-4.md`](./phase-4.md) |

## Decisions

| Decision | Why |
| -------- | --- |
| Expose five pillars: `tracker`, `normative`, `cleanup`, `freshness`, and `review`; keep `all`, inventory, and reporting as supporting actions. | These five correspond to useful user outcomes and to the existing final-report sections, while exhaustive orchestration, inventory, and report assembly are orchestration concerns with exact action identities. |
| Run all five pillars when no pillar is named; accept one named pillar or explicit `all`. | This preserves Harvest's current one-command behaviour and adds an opt-in token-saving path, as requested. |
| Resolve dependencies to the minimum capability needed, such as tracker status lookup for `review` versus tracker reconciliation for `cleanup`. | A dependency that silently performs the whole workflow would erase the token savings and could introduce unrelated side effects. |
| In a targeted run, develop only the requested pillar, show a compact dependency receipt, and do not write a partial global Harvest report. | This keeps the response focused and prevents absent metrics from being represented as zero; delegated skills may still write their own disclosed artifacts. |
| Preserve every confirmation boundary even when an operation is reached as a dependency. | Tracker closure and file deletion remain externally consequential regardless of how the action was selected. |
