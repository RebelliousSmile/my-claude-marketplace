---
description: Reusable components — prop/variant-driven, documented states, responsive divergence declared, no copy-paste forks.
paths: ["**/*.vue", "**/*.tsx", "**/*.jsx", "**/*.svelte", "**/*.astro", "**/*.css", "**/*.scss", "**/*.html", "design/**"]
---

# Reusable components with options

## Build for reuse

- Prefer extending a component via options over forking it.
- Expose variation as props/variants, not duplicated files.
- One component owns one responsibility.
- Never copy-paste a component to change one value.

## Options & variants

- Variant = a named visual mode (`primary`, `ghost`, `danger`).
- Size = a named scale step (`sm`, `md`, `lg`).
- Boolean options for additive features (`icon`, `loading`, `block`).
- Defaults make the bare component usable with no props.
- Invalid combinations are documented or prevented.

## Document every component

- Spec lives in `design/components/<name>.md`.
- List: anatomy, options, variants, states, responsive divergence, a11y.
- States: default, hover, focus, active, disabled, loading, empty, error.
- Declare the mobile↔desktop divergence explicitly.

## Composition

- Compose small primitives into patterns.
- Pass content via slots/children, not rigid props.
- Style only through tokens (see design-token discipline).

## Why

Options-driven components keep a system coherent as it grows; every fork is a future inconsistency and a value that won't update when the token does.
