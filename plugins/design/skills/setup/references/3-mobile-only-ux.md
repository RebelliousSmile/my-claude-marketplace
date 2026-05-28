---
description: Mobile-only UX — patterns available only on small viewports, each with a declared desktop equivalent.
paths: ["**/*.vue", "**/*.tsx", "**/*.jsx", "**/*.svelte", "**/*.astro", "**/*.css", "**/*.scss", "**/*.html", "design/**"]
---

# Mobile-only UX patterns

## Principle

- Some UX exists only on mobile by design.
- Every mobile-only pattern declares a desktop equivalent.
- Replace, never duplicate, across breakpoints.
- The task outcome is identical on both.

## Sanctioned mobile-only patterns

- Bottom sheet instead of a side modal.
- Sticky thumb-reachable primary CTA / bottom tab bar.
- Swipe / pull-to-refresh / horizontal snap carousels.
- Collapsed accordions where desktop shows expanded columns.
- Floating action button.

## Desktop equivalents (declare the pairing)

- Bottom sheet → side panel or centered modal.
- Bottom tab bar → top nav or persistent sidebar.
- Swipe carousel → grid or arrow-controlled rail.
- FAB → inline toolbar button.

## Rules

- Document each pairing in the component spec (`design/components/<name>.md`).
- Touch-only gestures need a visible non-gesture fallback.
- Never trap an action behind a gesture with no button.
- Switch implementations at a breakpoint, not by user-agent sniffing.

## Why

Mobile and desktop reward different ergonomics; honoring each (thumb reach vs. pointer precision) beats shipping one layout stretched to both — as long as every path leads to the same result.
