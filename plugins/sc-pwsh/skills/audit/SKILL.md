---
name: audit
description: >-
  Audit PowerShell scripts by delegating review with the idioms pivot, each verdict conditioned on the host the script declares.
author: François-Xavier Guillois
version: 0.1.0
vibe_version: ">=1.0.0"
permissions:
  - bash
  - files
tags:
  - scripting
  - audit
  - powershell
---

Read [host portability](../../references/host-portability.md) before resolving plugin files, invoking sibling skills, or persisting project guidance.

# sc-pwsh Audit

PowerShell code quality audit — detects applicable pivots via sniff and delegates to `aidd-dev:04-audit`.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `audit` | Scan → load pivots → invoke aidd-dev:04-audit (code-quality) | current directory |

## Default flow

Single action: `audit`.

## Conceptual model

- audit is a read-only orchestrator: it detects, loads, and delegates — it never writes to `.claude/rules/`.
- The PowerShell knowledge lives in the plugin (`skills/sniff/references/capabilities/`) — loaded at runtime, not pre-installed.
- `aidd-dev:04-audit` is the analysis engine — audit provides the acceptance criteria (pivots) and the severity discipline, AIDD audit provides the findings.
- A verdict depends on the **host** a file declares (Windows PowerShell 5.1, PowerShell 7, both, undetermined), never on the platform the audit happens to run on.

## Transversal rules

- Invoke `sniff` `scan` only. Audit is read-only: never write to `.claude/rules/` or any project path, never execute a scanned file.
- Always invoke `scan` first to get the pivot manifest before loading references.
- Abort explicitly when `scan` finds no PowerShell file.
- Severity follows the measured or declared host. An undetermined host yields `info`, never a verdict.
- Never assert dead code: static reading cannot prove a function has no caller.
