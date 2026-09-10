---
objective: "Taste evaluates repository and product sobriety, Foresee evaluates resilience, and both delegate bounded specialist work to the installed AIDD capabilities without hidden source mutation."
status: in-progress
---

# Plan: Taste sobriety and Foresee resilience

## Overview

| Field      | Value |
| ---------- | ----- |
| **Goal**   | Extend `taste` from freshness to justified code and feature reduction, and make `foresee` compose a concrete resilience assessment. |
| **Source** | Conversation of 2026-09-10: user-approved product intent and request for AIDD delegation plus behavioural tests. |

## Phases

| #   | Phase | File |
| --- | ----- | ---- |
| 1 | Repair the AIDD delegation boundary | [`phase-1.md`](./phase-1.md) |
| 2 | Add Taste sobriety assessment | [`phase-2.md`](./phase-2.md) |
| 3 | Add Foresee resilience assessment | [`phase-3.md`](./phase-3.md) |
| 4 | Prove behaviour and publish the contract | [`phase-4.md`](./phase-4.md) |

## Decisions

| Decision | Why |
| -------- | --- |
| Keep product-value and volume verdicts inside `taste`; delegate only bounded evidence gathering and approved follow-ups. | No installed AIDD skill decides whether a working feature still deserves to exist. |
| Keep resilience synthesis inside `foresee`; use AIDD audit reports as authoritative evidence rather than rescoring their findings. | Architecture and test audits supply separate evidence, while change scenarios, recovery and reversibility form Foresee's distinct purpose. |
| Preserve project source and tests by default, while allowing disclosed AIDD report artifacts required by analytical delegates; require explicit consent before any capability that can edit implementation or tests. | Audit and review persist evidence under `aidd_docs/`, whereas `aidd-dev:03-assert`, `06-test`, `07-refactor`, and implementation flows may change the assessed product. |
| Resolve AIDD capabilities from the live host catalogue and pin current canonical identifiers only in the compatibility contract and its tests. | The installed `aidd-refine` identifiers have changed, and hidden cache paths or silent fallbacks would make routing brittle. |
