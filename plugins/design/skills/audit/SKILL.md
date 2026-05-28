---
name: audit
model: sonnet
description: >-
  Verifies that a wireframe, page, or component respects the project's design system and mobile-first responsive rules.
  Use to check that delivered UI matches the tokens, breakpoint strategy, component options, and accessibility baseline
  before merge or handoff. Produces a severity-ranked report with concrete fixes. Read-only by default (proposes fixes,
  applies them only on request). Do NOT use to create tokens (from-reference/from-brief) or build UI (wireframe/component).
---

# audit

Checks any UI artifact — an HTML wireframe, a framework page/component, or a stylesheet — against the design system and the `08-design` rules. Reports violations ranked by severity with the precise fix, so wireframes and final pages provably respect the system.

This is the control gate: `wireframe` and `component` both point their tests at it.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `audit` | Run the compliance checklist against the target and report | file/glob/page to check |

## Default flow

Single action. Trigger-to-action mapping:

- "audit <target>", "check <page> against the system", "does this respect the design system", "verify the wireframe", "design review of <file>" → `audit`

## Transversal rules

- Read the system first: `design/tokens.json`, `design/design-system.md`, the component inventory, and the installed `.claude/rules/08-design/`. If tokens are absent, stop and tell the user to establish them first.
- Read-only by default: report findings and propose fixes. Apply fixes only when the user explicitly asks (e.g., "audit and fix").
- Severity scale: **blocking** (breaks the system: hardcoded values, max-width-first, task gated behind a breakpoint, AA contrast fail, no focus) · **warning** (drift: undocumented enrichment, missing state, ad-hoc breakpoint) · **note** (polish).
- Quote the offending line and give the token/rule-compliant replacement.
- Cite the rule each finding violates (e.g., `08-design/4-design-tokens`).

## References

- `references/checklist.md` — the full audit checklist by category and severity

## Evals

- `evals/scenarios.json`
