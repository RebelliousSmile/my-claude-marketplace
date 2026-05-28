---
description: Design-token discipline — all visual values come from design/tokens.json via generated adapters, never hardcoded.
paths: ["**/*.vue", "**/*.tsx", "**/*.jsx", "**/*.svelte", "**/*.astro", "**/*.css", "**/*.scss", "**/*.html", "design/**"]
---

# Design-token discipline

## Single source of truth

- `design/tokens.json` is canonical (W3C DTCG).
- Consume tokens via `design/adapters/tokens.css` (CSS vars) or `theme.css` (Tailwind).
- Never hand-edit generated adapter files.
- Regenerate both adapters together when tokens change.

## No magic numbers

- Color, type, space, radius, shadow, motion come from tokens.
- Never hardcode a hex color in a component.
- Never hardcode a px font-size or spacing value.
- One-off values need a new token, not an inline literal.

## Usage

- CSS: `var(--color-semantic-text)`, `var(--space-4)`.
- Tailwind: classes mapped from `@theme` (`text-body`, `p-4`, `bg-brand-primary`).
- Semantic tokens over raw ramps in components (`--color-semantic-surface`, not `--color-neutral-50`).
- Spacing only from the `space.*` scale.

## Adding tokens

- New recurring value → add to `tokens.json`, regenerate adapters.
- Name by role, not appearance (`danger`, not `red`).
- Reference ramps via aliases (`{color.neutral.900}`) for theming.

## Why

A page respects the system only if every value traces to a token; hardcoded literals are exactly what `audit` flags and what makes a redesign a find-and-replace nightmare.
