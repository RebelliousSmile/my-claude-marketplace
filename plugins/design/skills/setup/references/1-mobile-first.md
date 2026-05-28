---
description: Mobile-first authoring — base styles target the smallest viewport, enrich upward with min-width only.
paths: ["**/*.vue", "**/*.tsx", "**/*.jsx", "**/*.svelte", "**/*.astro", "**/*.css", "**/*.scss", "**/*.html", "design/**"]
---

# Mobile-first authoring

## Base layer

- Base styles target the smallest viewport.
- No width media query in the base layer.
- One column by default.
- Content ordered by mobile priority.

## Breakpoints

- Enrich upward with `min-width` only.
- Never `max-width` as the primary axis.
- Use the named breakpoints from `design/tokens.json` (`breakpoint.sm/md/lg/xl`).
- Never invent ad-hoc pixel breakpoints.
- A breakpoint is justified by content, not by device.

## Fluid by default

- Prefer `clamp()` for type and spacing between breakpoints.
- Reach for a breakpoint only when layout must restructure.
- Use relative units (`rem`, `%`, `fr`, `ch`) over fixed `px`.
- Images and media are fluid (`max-width: 100%`).

## Why

Designing the constrained case first guarantees the core task works everywhere; widening a working mobile layout is safer than cramming a desktop one.
