# 02 - implement

Generate the component in the project's framework from its spec, using only design tokens.

## Inputs

- `design/components/<name>.md` (run `01-spec` first if missing).
- The project stack (detect it; do not assume).

## Process

1. **Detect the stack**: inspect `package.json` and existing source extensions to choose the target — Vue SFC, React/JSX, Svelte, Astro, a web component, or plain HTML/CSS. If genuinely ambiguous, ask once.
2. **Map options → the framework's idiom**: props (Vue/React/Svelte), with enums for variants/sizes and booleans for additive features. Defaults match the spec.
3. **Style via tokens**: Tailwind classes from `theme.css` if the project uses Tailwind, otherwise `var(--…)` from `tokens.css`. No hardcoded colors/sizes.
4. **Implement every documented state**, including a visible focus ring and disabled/loading handling.
5. **Implement responsive divergence**: mobile-first base, `min-width` enrichment, and any mobile-only↔desktop swap from the spec.
6. **Accessibility**: prefer native elements; add `aria-*` only where needed; ensure keyboard operation and ≥44px touch targets.
7. **Place the file** following the project's existing component conventions (locate where components live; match naming).
8. **Show minimal usage** matching the spec's examples.

## Outputs

The component file in the project, plus a short note of where it was placed and which option values it supports.

## Test

The component exposes the spec's options with correct defaults, styles exclusively through tokens, implements the documented states and responsive divergence, is keyboard-accessible, and `/design:audit <component file>` reports no blocking violations.
