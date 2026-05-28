# Layout plan — <story slug>

> Per-breakpoint plan produced by `wireframe/01-layout`, consumed by `02-render`.

## User story

As a <role>, I want <goal>, so that <reason>.

## Mobile core (base, < sm)

The complete task path on the smallest viewport. Everything here is required.

- Region order (top → bottom): …
- Primary action and where it sits (thumb reach): …
- Components used (from inventory): …

## Tablet (≥ md) — enrichment

What is **added** to the mobile core. Must be additive, not a different IA.

- Enriched regions (tag each `data-enrich="md"`): …
- Layout change (columns, side rail): …

## Desktop (≥ lg) — enrichment

- Enriched regions (`data-enrich="lg"`): …
- Density / multi-column / persistent nav changes: …

## Mobile-only UX

Patterns present only below a breakpoint, each with its desktop equivalent.

| Mobile pattern | Replaced on desktop by | Same outcome? |
|---|---|---|
| e.g. bottom sheet filter | side panel | yes |

## Tokens & components touched

- Tokens: spacing scale steps, type styles, semantic colors used.
- Components: list from `design/design-system.md` inventory; flag any missing component (candidate for `/design:component`).

## Open questions

- …
