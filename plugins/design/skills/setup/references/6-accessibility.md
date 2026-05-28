---
description: Accessibility baseline — contrast from tokens, visible focus, touch targets, reduced motion, semantic structure.
paths: ["**/*.vue", "**/*.tsx", "**/*.jsx", "**/*.svelte", "**/*.astro", "**/*.css", "**/*.scss", "**/*.html", "design/**"]
---

# Accessibility baseline

## Color & contrast

- Body text meets WCAG AA (4.5:1).
- Large text and UI elements meet 3:1.
- Semantic color tokens are AA-checked at definition time.
- Never convey state by color alone.

## Focus & keyboard

- Every interactive element is keyboard reachable.
- Visible focus ring on all focusable elements.
- Never remove `:focus` without a replacement.
- Logical tab order matches visual order.

## Touch & pointer

- Touch targets ≥ 44×44 px on mobile.
- Adequate spacing between adjacent targets.
- Primary mobile actions within thumb reach.

## Motion & media

- Honor `prefers-reduced-motion`.
- No essential information in motion alone.
- Images have meaningful `alt` (or empty `alt` if decorative).

## Semantics

- One `<h1>` per page; headings nested in order.
- Landmarks: `header`, `nav`, `main`, `footer`.
- Buttons for actions, links for navigation.
- Form controls have associated labels.

## Why

Accessibility is a property of the system, not a late pass; encoding it in tokens and components means every page inherits it instead of re-earning it.
