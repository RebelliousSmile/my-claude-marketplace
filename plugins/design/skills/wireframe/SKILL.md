---
name: wireframe
model: sonnet
description: >-
  Turns a user story into a living, mobile-first HTML wireframe that uses the project's design tokens and shows
  real responsive behavior across breakpoints. Use when you need to lay out a page or flow from a need and see it
  render — with enriched-only content for tablet/desktop and mobile-only UX made explicit. Produces a standalone
  HTML file under design/wireframes/. Do NOT use to establish tokens — use from-reference/from-brief; for production
  components use component; to verify an existing page use audit.
---

# wireframe

Translates a user story into a responsive layout plan, then renders it as a **standalone, viewable HTML wireframe** that links the project's `design/adapters/tokens.css`. The output is mobile-first, shows the three breakpoint tiers in a real browser, and visibly marks which regions are enriched-only (≥ tablet/desktop) and which UX is mobile-only.

Wireframes are intentionally low-fidelity in content (greyboxes, placeholder copy) but **high-fidelity in tokens and responsive behavior** — so they can be audited against the system before any production code is written.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `layout` | Turn the user story into a per-breakpoint layout plan | user story + design-system.md |
| 02 | `render` | Render the plan as a standalone mobile-first HTML wireframe | the layout plan |

## Default flow

Linear: `01 → 02`. Run end-to-end by default; stop after `01` if the user wants to approve the plan first.

Trigger-to-action mapping:

- "wireframe <story>", "mock up the <page>", "lay out the <flow>", "draft a responsive page for <story>" → full flow from `layout`
- "just plan the layout", "what's the breakpoint behavior" → `layout`
- "render the wireframe from this plan" → `render`

## Transversal rules

- Read the design system first: `design/design-system.md` and `design/tokens.json`. If absent, tell the user to run `from-reference`/`from-brief`.
- Consume tokens only via `design/adapters/tokens.css`; never hardcode colors/sizes — obey `.claude/rules/08-design/`.
- Mobile-first: base layout is the mobile core; enrich with `min-width` only.
- Every enriched region is visibly tagged (`data-enrich`) and every mobile-only pattern declares its desktop equivalent.
- Reuse the scaffold and conventions in `references/wireframe-template.html`.
- Use components from the inventory by name; do not invent ad-hoc visual styles.

## References

- `references/wireframe-template.html` — the mobile-first scaffold (token link, breakpoint annotations, enrich/mobile-only markers)
- `references/layout-plan-template.md` — the per-breakpoint plan structure
- `${CLAUDE_PLUGIN_ROOT}/references/design-system-contract.md` — where artifacts live

## Evals

- `evals/scenarios.json`
