# Correspondence table — template (copycat P2 deliverable)

> The reconciliation deliverable. The copycat agent fills one table PER PAGE; `define`
> aggregates them. This table is the **human checkpoint (P2)**: nothing is frozen by
> `adjust` and no token/markup is edited until a human signs off the AGGREGATED table.
>
> Generic — speaks the 3-layer contract (`tokens.json` · `components.json` ·
> `design-system.md`). Target-specific bindings (e.g. WP `theme.json` ↔ `tokens.json`)
> live in `target-adapters.md`, never here.

## Header

- **Page / mockup key**: `<setPage key or URL>`
- **Breakpoints measured**: `<mobile 375 / tablet 834 / desktop 1440>` (note any DERIVED band)
- **Oracle report**: `<path to measure.py JSON>`
- **Date / agent run**: `<…>`

## Rows

One row per (element × property) that diverges, OR per element when proposing a new component.

| # | Element | Mockup selector | Contract target (token / component) | Prop | Mockup value | Current value | Breakpoint | Source | Action | Routed layer |
|---|---------|-----------------|--------------------------------------|------|--------------|---------------|------------|--------|--------|--------------|
| 1 | Hero · title | `.page-hero__title` | `font.size.hero` (token) | fontSize | 54px | 52px | desktop | measured | align token | tokens |
| 2 | Hero · title | `.page-hero__title` | `font.size.hero` | fontSize | 32px | 34px | mobile | measured | align (mobile clamp) | tokens |
| 3 | Hero · eyebrow | `.section-eyebrow` | `c.eyebrow` (component) | — | present | MISSING | all | measured | add component+content | components / content |
| 4 | Card · radius | `.service-card` | `radius.card` | borderRadius | 12px | 8px | desktop | derived (no tablet src) | extend token? | tokens |

Columns:
- **Source**: `measured` (a mockup render exists for that breakpoint) or `derived` (no source → inferred from the mobile-first profile; an INFERENCE, must be flagged).
- **Action**: `align` (bend to existing contract value), `extend` (new/changed token or component — requires justification), `add component`, `add content`.
- **Routed layer**: `tokens` · `components` · `charter` · `markup` · `content` (P1: content never hard-coded into markup).

## Conflicts (cross-page — surfaced, NOT auto-resolved)

`define` lists here any element where pages disagree (page A radius 8px vs page B 10px).
These go to `adjust` (dominant motif wins) — the agent does not pick.

| Element / token | Page A value | Page B value | … | Proposed resolution (for adjust) |
|-----------------|--------------|--------------|---|----------------------------------|

## Proposed DS extensions (require sign-off)

Anything with Action = `extend` or `add component` is listed here; each must justify why
the contract grows rather than the mockup aligning to it (DS-prime default).

## Sign-off (P2 checkpoint)

- [ ] Human reviewed the aggregated table.
- [ ] Extensions approved (or sent back to `align`).
- [ ] Derived (inferred) rows reviewed — kept / corrected / sent to the deviation ledger.
- Approver: `<name>` — Date: `<…>`

> Until this block is checked, `adjust` does not freeze and no DS/markup edit proceeds.
