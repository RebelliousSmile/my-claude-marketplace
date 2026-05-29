# 02 - render

Render the layout plan as a standalone, viewable mobile-first HTML wireframe.

## Inputs

- The layout plan from `01-layout`.
- `${CLAUDE_PLUGIN_ROOT}/skills/wireframe/references/wireframe-template.html` — the scaffold to adapt.
- `design/adapters/tokens.css` — the tokens the wireframe links.

## Process

1. **Copy the scaffold** to `design/wireframes/<story-slug>.html` and set the `<title>`.
2. **Verify the token link** path (`../adapters/tokens.css`) resolves from the wireframe's location; adjust if the home is nested.
3. **Build the mobile core first** in the base CSS layer — no width media query. Greybox content is fine, but use real tokens for color, type, space, radius.
4. **Add enrichment** with `min-width` media queries only, at the breakpoint **px literals that mirror the breakpoint tokens** (annotate each with the token name, since `var()` can't be used in `@media` conditions). Reveal `data-enrich` regions there.
5. **Implement mobile-only UX** with the `data-mobile-only` markers and remove/replace them at the desktop breakpoint with the declared equivalent.
6. **Use only tokens** — no hardcoded hex or px outside the annotated breakpoint literals. Reference inventory components by name in greybox labels.
7. **Keep the annotation affordances** (`data-enrich` outlines, mobile-only labels) so the wireframe is self-documenting and auditable.

## Outputs

`design/wireframes/<story-slug>.html` — openable in a browser, responsive across the three tiers.

## Test

The file opens standalone, links `../adapters/tokens.css`, restructures at the breakpoint literals (each annotated with its token), reveals enriched regions only at `min-width`, shows the mobile-only pattern replaced on desktop, and the content surface uses tokens (no hardcoded color/size outside the annotated breakpoint literals, `var()` fallbacks, and the fenced greybox annotation layer). Running `/design:audit design/wireframes/<story-slug>.html` reports no blocking violations (the annotation layer is exempt per the audit checklist).
