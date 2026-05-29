# 01 - layout

Turn a user story into a per-breakpoint layout plan grounded in the design system.

## Inputs

- `story` (required) — the user story or page/flow description.
- `design/design-system.md` + `design/tokens.json` (the system to honor).

## Process

1. **Read the system**: breakpoints, responsive strategy, and component inventory from `design-system.md`.
2. **Define the mobile core**: the minimal region set and ordering that lets the user complete the task on the smallest viewport, including where the primary action sits (thumb reach). This is non-negotiable content.
3. **Plan enrichment** for ≥ tablet and ≥ desktop: what is *added* (panels, columns, denser views, previews). Keep it additive — same information architecture, more density/affordance. Assign each enriched region a `data-enrich` tier (`md`/`lg`).
4. **Plan mobile-only UX**: any pattern that should exist only on small screens (bottom sheet, sticky CTA, swipe), each paired with its desktop equivalent and confirmed to yield the same outcome.
5. **Map to components**: name the inventory components each region uses. Flag any needed component that the inventory lacks — it's a candidate for `/design:component`.
6. **Fill** `${CLAUDE_PLUGIN_ROOT}/skills/wireframe/references/layout-plan-template.md` with the above.

## Outputs

A completed layout plan (in the conversation, or saved next to the wireframe). Surface Open questions and any missing components.

## Test

The plan states a complete mobile core, tags every enriched region with a tier, pairs every mobile-only pattern with a desktop equivalent, and references real components from the inventory.
