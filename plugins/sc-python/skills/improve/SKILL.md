---
name: improve
description: >-
  Analyzes the Python codebase for Pythonic idiom gaps, design pattern opportunities,
  and maintainability issues, then produces a prioritized improvement plan. Covers
  EAFP/LBYL patterns, proper type hints, async best practices, dependency injection,
  dataclasses vs NamedTuple, mutable default arguments, context managers, and
  framework idioms (Django, FastAPI).
  Use when the user says "how can I improve this", "is this Pythonic", "find anti-patterns",
  "code quality", "refactoring suggestions", "how to better structure this".
  Do NOT use for performance (web-optimize), data layer (data-optimize), version
  migrations (legacy), or line-by-line code review (aidd-dev:05-review).
---

# sc-python Improve

Reads the Python codebase, identifies Pythonic idiom gaps and design pattern opportunities, then produces a prioritized improvement plan with concrete before/after examples.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `analyze` | Read codebase, identify anti-patterns and improvement opportunities | path or file list |
| 02 | `plan` | Produce a prioritized improvement plan with before/after examples | analyze findings |

## Default flow

Always sequential: `analyze` → `plan`.

1. `analyze` reads the codebase structure, identifies patterns and anti-patterns per category, emits findings
2. `plan` prioritizes findings, groups by effort/impact, writes a concrete improvement plan

Never skip `plan` after `analyze`.

## Transversal rules

- Analyze patterns only — do not apply changes (that is `aidd-dev:02-implement`'s role).
- Prioritize by impact: mutable default argument bugs > style preferences.
- For each finding: show the problematic code, name the anti-pattern, show the improved version.
- Do not flag Django ORM patterns that are intentional framework conventions.
- Distinguish between "non-Pythonic but working" (low priority) and "likely to cause bugs" (high priority).
- Respect async context: don't suggest sync patterns in async codebases.
