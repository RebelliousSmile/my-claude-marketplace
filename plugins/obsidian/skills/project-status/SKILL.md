---
name: project-status
description: Provides three independent project health actions: synthesize and export project memory (memory), generate a full project status report with audit, security findings, and a 7-day plan (report), and audit memory files for quality, freshness, and contradictions (audit). Triggers vary per action — "project memory / memory export / synthesize memory" maps to memory; "project status / status report / project health" maps to report; "audit memory / memory quality / check memory files" maps to audit. Do NOT use for implementing features, writing application code, running tests, or modifying non-memory project files.
---

# Project Status

Three independent actions covering project memory synthesis, full status reporting, and memory quality auditing. Actions are non-sequential and dispatched by intent.

## Available actions

| #  | Action   | Role                                              | Input                        |
|----|----------|---------------------------------------------------|------------------------------|
| 01 | `memory` | Synthesize project memory and export decisions    | None required (optional scope) |
| 02 | `report` | Full project status with audit, security, 7-day plan | None required             |
| 03 | `audit`  | Audit memory files for quality, freshness, contradictions | Optional scope path   |

## Default flow

Dispatch based on user intent:

- "project memory / memory export / synthesize memory" → `memory`
- "project status / status report / project health" → `report`
- "audit memory / memory quality / check memory files" → `audit`

## Transversal rules

- Every finding must come from actual file or command output — never assume.
- Never modify files during `report` or `audit` P2/P3 — only `memory` writes its export and `audit` applies P1 auto-fixes.
- Cite `file:line` for every finding in `audit`.
- Quick wins in `report` are strictly tasks under 15 minutes.

## Assets

- `assets/project_memory.md` — Output template for the memory action
- `assets/project_status.md` — Output template for the report action
- `assets/audit_memory.md` — Output template for the audit action
