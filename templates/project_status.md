---
name: project_status
description: Template for project status report with audit, security findings and action plan.
---

# Project Status — <date>

## Project Summary

| Metric | Value |
|--------|-------|
| Branch | `<branch>` |
| Tests | ✅/❌ (N tests, Xs) |
| Coverage | Lines X% / Branches X% / Functions X% |
| Open issues | N |
| Last activity | <summary> |

## Tasks Digest (`aidd_docs/tasks/`)

### Completed

- `<path>` — <summary>

### Pending / TODO

- `<path>` — <summary>

### Housekeeping

> Naming or organization issues found.

- `<path>` — <issue: wrong folder / missing date prefix / stale / etc.>

## Audit Findings

### Why these axes

<1-2 lines explaining selection rationale based on scan results>

### <Audit axis 1>

<findings>

### <Audit axis 2>

<findings>

## Security Findings

### Why these axes

<1-2 lines explaining selection rationale based on scan results>

### <Security axis 1>

<findings>

### <Security axis 2>

<findings>

## Quick Wins

> Tasks under 15 minutes extracted from all sources. Start here.

- [ ] <quick win 1> — <source>
- [ ] <quick win 2> — <source>
- [ ] <quick win 3> — <source>

## 7-Day Plan (60min/day)

> Each task includes the command to run. Use `aidd:02:brainstorm` when the scope is unclear, `aidd:03:plan` when it's clear enough to plan directly.

### J1 — <theme> (60min)

- **<task>** (~Xmin)
  `/<command> <arguments>`
- **<task>** (~Xmin)
  `/<command> <arguments>`

### J2 — <theme> (60min)

...

### J7 — <theme> (60min)

...

> **Overflow (semaine 2+)** : <remaining tasks summary>
