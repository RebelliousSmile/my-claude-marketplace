---
description: Progressive enrichment — extra content and richer layouts appear only at tablet/desktop and stay additive, never load-bearing.
paths: ["**/*.vue", "**/*.tsx", "**/*.jsx", "**/*.svelte", "**/*.astro", "**/*.css", "**/*.scss", "**/*.html", "design/**"]
---

# Progressive enrichment for large screens

## The additive rule

- The mobile core completes the task alone.
- Enriched content is additive, never load-bearing.
- Never gate a required action behind a breakpoint.
- Never hide task-critical content from mobile.

## What "enriched" may add (≥ tablet/desktop)

- Secondary panels, side rails, persistent navigation.
- Denser tables, multi-column galleries, comparison views.
- Inline previews, hover affordances, expanded metadata.
- Charts or visuals that need width to be legible.

## How to enrich

- Reveal enriched blocks with `min-width` only.
- Mark each enriched region explicitly (comment or `data-enrich="md"`).
- Enriched ≠ a different information architecture.
- Same content model across breakpoints; only density and affordance change.

## SEO & accessibility floor

- Required content is present in the DOM on mobile too.
- Never `display:none` content that a mobile user or crawler needs.
- Decorative-only enrichment may be CSS-revealed.

## Why

"Dare richer content for big screens" only pays off if mobile is never the degraded experience — enrichment is a bonus on capable viewports, not a tax on small ones.
