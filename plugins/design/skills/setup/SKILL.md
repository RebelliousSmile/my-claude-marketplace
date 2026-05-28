---
name: setup
model: sonnet
description: >-
  Installs the design plugin's mobile-first responsive rules to the current project's .claude/rules/08-design/.
  Use once per project before producing wireframes, components or pages, or when the design rules are missing or outdated.
  Covers: mobile-first authoring, progressive enrichment for tablet/desktop, mobile-only UX patterns,
  design-token discipline (no magic numbers), reusable components with options/variants, and an accessibility baseline.
  Do NOT use to establish the tokens themselves — use from-reference or from-brief; do NOT use to audit pages — use audit.
---

# design Setup

Installs the full set of mobile-first responsive design rules to `.claude/rules/08-design/` in the current project. Each rule file is written verbatim from this skill's references and carries a `paths:` glob so it auto-loads whenever a UI file is touched.

These rules are the **binding conventions** the rest of the plugin enforces: `wireframe`, `component`, and `audit` all assume they are installed.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `install` | Write all design rule files to `.claude/rules/08-design/` | current project path |

## Default flow

Single action. Trigger-to-action mapping:

- "setup design", "install design rules", "add design system rules", default invocation → `install`

## References

These are installed verbatim into `.claude/rules/08-design/`:

- `references/1-mobile-first.md` — base = smallest viewport, `min-width` only, fluid type/space
- `references/2-responsive-enrichment.md` — enriched content only at ≥ tablet/desktop, must stay additive
- `references/3-mobile-only-ux.md` — UX patterns that exist only on mobile and their desktop equivalents
- `references/4-design-tokens.md` — consume `design/tokens.json` via adapters, never hardcode values
- `references/5-components-variants.md` — reusable components driven by options/variants, documented states
- `references/6-accessibility.md` — contrast from tokens, focus, touch targets, reduced motion, semantics
- `references/7-iconography.md` — one chosen icon set, sized from tokens, never emoji/emoticons

## Transversal rules

- Write files atomically — do not skip any rule.
- Preserve frontmatter (`paths:` globs) verbatim from each reference file.
- If a target file already exists, overwrite it without confirmation (rules are plugin-owned, not project-owned).
- Report each written file path at the end, and remind the user to establish tokens via `from-reference` or `from-brief` if `design/tokens.json` is absent.

## Evals

- `evals/scenarios.json`
