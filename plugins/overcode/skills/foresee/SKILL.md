---
name: foresee
description: >-
  Route prospective document and code analysis to installed AIDD skills, analyze dependency horizons, or synthesize bounded resilience scenarios across change impact, detection, containment, recovery, and reversibility. Use for foresee, resilience, future-problem analysis, discussion, or follow-up planning. Do NOT use to run tests, implement features, or duplicate a general audit.
author: François-Xavier Guillois
version: 5.5.0
vibe_version: ">=1.0.0"
permissions:
  - bash
tags:
  - productivity
  - workflow
  - automation
---

Read [host portability](../../references/host-portability.md) before resolving plugin files, invoking sibling skills, or persisting project guidance.

# Foresee

Keeps the stable `foresee` entry point. Documents and code delegate to the current AIDD authority; dependency analysis adds only prospective maintenance and migration-horizon signals after the AIDD dependency audit. Explicit resilience requests compose target-appropriate evidence and add a bounded scenario synthesis without rescoring it.

## Available actions

| #  | Action          | Role                                                           | Input                                        |
|----|-----------------|----------------------------------------------------------------|----------------------------------------------|
| 01 | `analyze-doc`   | Route prospective or completed documents to the matching AIDD refine skill | Path to document, or issue number |
| 02 | `analyze-code`  | Route a code target to one explicit AIDD audit pillar | File path or directory path |
| 03 | `analyze-dep`   | Audit dependencies with AIDD, then add abandonment and lock-in horizon signals | Package name or dependency manifest |
| 04 | `analyze-resilience` | Compose target-aware AIDD evidence into bounded change and failure scenarios | Document, completed work, code, dependency, or manifest |

## Default flow

Dispatch on explicit intent first, then target type:
- Explicit resilience, change-tolerance, blast-radius, failure-recovery, rollback, or reversibility intent → `analyze-resilience`
- `.md` / `.markdown` path, issue number (`#N`), or document-related trigger → `analyze-doc`
- Code file extension (`.ts`, `.js`, `.vue`, `.php`, `.rs`, `.py`, etc.) or directory path → `analyze-code`
- Package name or dependency manifest trigger → `analyze-dep`

## Delegation and flags

Read [the AIDD delegation contract](../../references/aidd-delegation.md). `--discuss`, `--plan`, default output, dependency failures, host invocation, and delegation receipts follow that shared contract.

## Transversal rules

- Delegated reports remain authoritative and are not rescored locally.
- Never fall back to the removed local document/code analysis when AIDD is absent or incompatible.
- Only `analyze-dep` may add a local horizon report, under its bounded contract.
- Resilience analysis returns at most three supported scenarios by default, preserves every delegated report and score, and never treats missing evidence as safety.
