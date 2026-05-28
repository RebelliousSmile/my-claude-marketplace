# 01 - diagnose

Scan a production codebase and produce a measured design-health report.

## Inputs

- `target` (required) — project root or source globs (styles, components, templates).
- The token schema (target groups): `${CLAUDE_PLUGIN_ROOT}/references/token-schema.md`.

## Process

1. **Locate UI sources**: stylesheets, component files, templates, any existing tokens/theme/Tailwind config.
2. **Measure sprawl** — collect distinct values and counts:
   - Colors: every `#hex`, `rgb()`, `hsl()`, named color.
   - Font families, font sizes, line-heights.
   - Spacing values (margin/padding/gap), radii, shadows, border widths.
   - Breakpoints: every distinct `min-width`/`max-width` value.
3. **Compute hardcoded-value density**: share of declarations using literals vs. `var()`/token classes; list worst offenders by file.
4. **Scan by category** (mirror `08-design/1..7`):
   - `max-width`-first and base-layer media queries.
   - Content `display:none` on small screens that looks task-critical.
   - Gesture-only actions without a button fallback.
   - Duplicated/forked components (near-identical files).
   - **Emoji used as icons** — search for emoji codepoints in UI/templates; record each location (blocking smell).
   - Contrast failures (compute from used colors), missing `:focus`, sub-44px targets, heading/landmark problems.
5. **Reverse-engineer de-facto tokens**: the dominant value per dimension — the implicit system already in use and the cleanest crystallization candidate. Note the de-facto core trio (palette / type / icon set) and how scattered each is.
6. **Fill** `references/health-report-template.md`.

## Outputs

A completed health report (in the conversation, or saved to `design/health-report.md` if requested). No source edits.

## Test

The report includes sprawl counts per dimension, a hardcoded-value density figure with offenders, an emoji-as-icon scan result, the reverse-engineered de-facto trio, and a single most-important-fix verdict.
