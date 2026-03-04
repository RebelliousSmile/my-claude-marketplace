---
name: audit-score
description: Structured output template for the agentic readiness audit score. Fill one table per axis, then summarize prioritized actions.
---

# Agentic Readiness Audit

## Scores by axis

### Tests

| Criterion | Score | Justification |
|-----------|-------|---------------|
| Test framework configured | ✅ / ❌ | |
| Coverage enforced at 100% in CI | ✅ / ❌ | |
| Suite fast enough to run after every change | ✅ / ❌ | |
| External calls mocked | ✅ / ❌ | |

### Typing

| Criterion | Score | Justification |
|-----------|-------|---------------|
| `strict: true` + `noUncheckedIndexedAccess` | ✅ / ❌ | |
| Template-level type checking in CI | ✅ / ❌ | |
| No bare primitive IDs | ✅ / ❌ | |
| DB/API types inferred (if applicable) | ✅ / ❌ / N/A | |

### Tooling

| Criterion | Score | Justification |
|-----------|-------|---------------|
| Unified `check` command (typecheck + lint + tests) | ✅ / ❌ | |
| Lint/format tool configured (Biome / Ruff) | ✅ / ❌ | |
| Pre-commit hook enforces lint | ✅ / ❌ | |
| CI blocks merge on failure | ✅ / ❌ | |

### Agent context

| Criterion | Score | Justification |
|-----------|-------|---------------|
| `CLAUDE.md` documents check command and constraints | ✅ / ❌ | |
| Architectural boundaries explicit | ✅ / ❌ | |
| Rules files scoped to relevant paths | ✅ / ❌ | |

## Prioritized actions

| Priority | Action | Axis | Cost |
|----------|--------|------|------|
| 1 | | | low / medium / high |
| 2 | | | |
| 3 | | | |
