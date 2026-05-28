---
name: improve
model: sonnet
description: >-
  Analyzes a JavaScript/TypeScript codebase for idiomatic JS gaps, Vue/Nuxt
  anti-patterns, and maintainability issues, then produces a prioritized improvement
  plan. Covers proper async/await usage, TypeScript type coverage, Vue Composition
  API adoption, Pinia state patterns, component decomposition, and framework idioms
  (Nuxt, Vue SPA, Alpine, Vite).
  Use when the user says "how can I improve this", "find anti-patterns", "code quality",
  "refactoring suggestions", "how to better structure this", "is this good JS/TS".
  Do NOT use for performance (web-optimize), data layer (data-optimize), version
  migrations (legacy), or line-by-line code review (aidd-dev:05-review).
---

# sc-js Improve

Reads the JS/TS codebase, identifies idiomatic gaps and framework anti-patterns, then produces a prioritized improvement plan with concrete before/after examples.

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
- Prioritize by impact: missing null checks and type safety bugs trump style preferences.
- For each finding: show the problematic code, name the anti-pattern, show the improved version.
- Respect the detected framework: Nuxt idioms ≠ Vue SPA idioms ≠ Alpine idioms.
- Do not flag patterns that are intentional framework conventions (e.g. `definePageMeta` in Nuxt is intentional).
- Distinguish between "non-idiomatic but working" (low priority) and "likely to cause bugs" (high priority).
