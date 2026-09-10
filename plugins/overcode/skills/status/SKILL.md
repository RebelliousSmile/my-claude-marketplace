---
name: status
description: "Project health and durable project state: synthesize memory, report status, audit memory quality, or synchronize a Markdown backlog from open GitHub/GitLab issues."
author: François-Xavier Guillois
version: 4.7.0
vibe_version: ">=1.0.0"
permissions:
  - bash
tags:
  - productivity
  - workflow
  - automation
---

Read [host portability](../../references/host-portability.md) before resolving plugin files, invoking sibling skills, or persisting project guidance.

# Status

Four independent actions covering project memory synthesis, full status reporting, memory quality auditing, and durable backlog synchronization. Actions are non-sequential and dispatched by intent.

## Available actions

| #  | Action   | Role                                              | Input                        |
|----|----------|---------------------------------------------------|------------------------------|
| 01 | `memory` | Synthesize project memory and export decisions    | None required (optional scope) |
| 02 | `report` | Full project status with audit, security, 7-day plan | None required, optional `--audit` |
| 03 | `audit`  | Audit memory files for quality, freshness, contradictions | Optional scope path   |
| 04 | `backlog` | Synchronize `## Backlog` from the open issues of the repository declared in a Markdown file | Markdown file path + optional `--milestone`/`--ml` title filter |

## Default flow

Dispatch based on user intent:

- "project memory / memory export / synthesize memory" → `memory`
- "project status / status report / project health" → `report`
- "catch me up / where were we / what happened since last time" → the `alias` skill's `previously` action, never `report`
- "audit memory / memory quality / check memory files" → `audit`
- "status backlog <file> / synchronize the documentary backlog / update a Markdown backlog from GitHub or GitLab issues" → `backlog`

## Transversal rules

- Every finding must come from actual file or command output — never assume.
- Never modify files during `report` or `audit` P2/P3 — only `memory` writes its export and `audit` applies P1 auto-fixes.
- Cite `file:line` for every finding in `audit`.
- Quick wins in `report` are strictly tasks under 15 minutes.
- `report` audits the codebase only under `--audit`; by default it reuses the latest `aidd-dev:04-audit` run and never greps for findings.
- `backlog` never mutates the remote repository and writes its target only after every remote response and the final document have been validated.

## Assets

- `assets/project_memory.md` — Output template for the memory action
- `assets/project_status.md` — Output template for the report action
- `assets/audit_memory.md` — Output template for the audit action
