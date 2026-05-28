---
name: audit
model: sonnet
description: >-
  Python code quality auditor. Detects the project stack via sniff (01-scan),
  loads the applicable Python knowledge pivots from the plugin, and delegates
  a structured code review to aidd-dev:reviewer using the pivots as
  acceptance criteria. Use when the user asks to: audit Python code, check Python
  best practices, review code quality, check my Python, audit Django/FastAPI
  conventions, check Pythonic compliance, or invokes /sc-python:audit.
  Does not install any files to .claude/rules/.
---

# sc-python Audit

Python code quality audit — detects applicable pivots via sniff and delegates to `aidd-dev:reviewer`.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `audit` | Detect stack → load pivots → spawn aidd-dev:reviewer | project path |

## Default flow

Single action: `audit`.

## Conceptual model

- audit is a read-only orchestrator: it detects, loads, and delegates — it never writes to `.claude/rules/`
- The Python knowledge lives in the plugin (`skills/sniff/references/capabilities/`) — loaded at runtime, not pre-installed
- `aidd-dev:reviewer` is the analysis engine — audit provides the acceptance criteria (pivots), reviewer provides the findings

## Transversal rules

- Never invoke `02-install-pivots` — audit is read-only.
- Never install any file to `.claude/rules/` or any project directory.
- Always invoke `01-scan` first to get the pivot manifeste before loading references.
