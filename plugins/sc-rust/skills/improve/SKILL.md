---
name: improve
description: >-
  Analyzes the Rust codebase for idiomatic Rust gaps, ownership pattern issues,
  and design opportunities, then produces a prioritized improvement plan. Covers
  proper error handling (anyhow/thiserror, ? operator), iterator chaining over
  manual loops, trait-based design, builder pattern, newtype pattern, excessive
  cloning, unwrap() in non-test code, and async correctness.
  Use when the user says "how can I improve this", "is this idiomatic Rust",
  "find anti-patterns", "code quality", "refactoring suggestions", "too many clones".
  Do NOT use for performance (web-optimize), data layer (data-optimize), edition
  migration (legacy), or line-by-line code review (aidd-dev:05-review).
---

# sc-rust Improve

Reads the Rust codebase, identifies idiomatic Rust gaps and design pattern opportunities, then produces a prioritized improvement plan with concrete before/after examples.

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
- Prioritize by severity: `unwrap()` on fallible operations > style preferences; excessive `Arc<Mutex<>>` > naming conventions.
- For each finding: show the problematic code, name the anti-pattern or missed idiom, show the improved version.
- Distinguish between "non-idiomatic but safe" (medium priority) and "likely to panic or deadlock" (high priority).
- Never flag `unwrap()` in test code — it is intentional and conventional.
- Respect the crate type: libraries need stricter API design than application binaries.
