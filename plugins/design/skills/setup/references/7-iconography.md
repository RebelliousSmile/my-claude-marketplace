---
description: Iconography — one chosen icon set, sized/stroked from tokens, never emoji or emoticons in the UI.
paths: ["**/*.vue", "**/*.tsx", "**/*.jsx", "**/*.svelte", "**/*.astro", "**/*.css", "**/*.scss", "**/*.html", "design/**"]
---

# Iconography

## One set

- All UI icons come from the single chosen icon library.
- Library + style recorded in `design-system.md` (`icon.library`, `icon.style`).
- Never mix icon sets in one product.
- Pick one default style (outline / solid) and stay consistent.

## Sizing & stroke from tokens

- Icon size from `icon.size.*`, aligned to the type scale.
- Stroke width from `icon.stroke.*` for outline sets.
- Color via `currentColor` or a semantic color token.
- Never hardcode icon dimensions.

## Never emoji

- Never use emoji or emoticons as UI icons.
- Never as bullets, status dots, or button glyphs.
- Emoji are user content, never the system's visual language.
- A status needs an icon + text/aria, not a colored emoji.

## Accessibility

- Decorative icon → `aria-hidden="true"`.
- Meaningful icon → accessible label (`aria-label` / visible text).
- Icon-only buttons always carry a label.

## Why

A single, token-sized icon set is what makes a UI read as one system; emoji render differently per OS/font, can't be recolored or sized reliably, and instantly cheapen an otherwise deliberate interface.
