# 02 - derive

Turn the attribute profile into a coherent, distinctive token set + responsive strategy.

## Inputs

- The attribute profile from `01-clarify`.
- The token schema: `${CLAUDE_PLUGIN_ROOT}/references/token-schema.md`.

## Process

1. **Color system**:
   - Choose a brand primary that expresses the personality (not the framework default blue unless the brief calls for it).
   - Build a neutral ramp with the right temperature (warm/cool) for the brand.
   - Add secondary/accent only if the personality needs it.
   - Define semantic roles + state colors; verify every text/background pair for WCAG AA (or the stated bar).
2. **Typography**: pick a family (or pairing) fitting the personality; set a modular scale with `clamp()` for fluid heading/body growth; set weights and line-heights; set a comfortable body floor for the audience.
3. **Spacing**: choose a base unit (4 or 8 px) and a consistent scale in `rem`.
4. **Radius / shadow / borders / motion**: tune to personality — sharp+flat for technical, rounded+soft for friendly, restrained motion for premium. Define duration + easing tokens.
5. **Breakpoints**: schema defaults unless the platform implies otherwise; container max-widths per breakpoint.
6. **Responsive strategy** (mandatory): define the **mobile core** (must-have task path), **enriched-only** additions for ≥ tablet/desktop, and **mobile-only** UX patterns with their desktop equivalents — consistent with the `08-design` rules.
7. **Component inventory**: list the components the brief's flows imply, with intended variants.

## Outputs

A complete, schema-shaped token proposal + responsive strategy + component list, presented for quick review, with any assumption flagged.

## Test

Every required token group is present, the palette is deliberately tied to the personality (not stock defaults), all contrast pairs pass the stated bar, and the responsive strategy names mobile-core / enriched / mobile-only explicitly.
