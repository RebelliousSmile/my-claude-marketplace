---
name: export-wordpress
model: sonnet
description: >-
  Exports the project's design system to WordPress so a design can be moved onto a block theme quickly.
  Maps design/tokens.json to a theme.json (v3) — color palette, typography, spacing presets, and the rest as
  custom properties — and turns wireframes/components into block patterns/templates with the token CSS enqueued.
  Use to port a design into a WordPress block theme. Do NOT use to create the system (from-reference/from-brief)
  or to build framework components (component).
---

# export-wordpress

Bridges the design system to WordPress. The token set in `design/tokens.json` becomes a `theme.json` (the native WordPress global-styles surface: editor palette, font sizes, spacing presets), and the wireframes/components become block patterns or templates with the token CSS enqueued — so a design switches onto a block theme with the look intact.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `theme-json` | Generate `theme.json` (v3) from `design/tokens.json` | tokens + target theme dir |
| 02 | `blocks` | Convert wireframes/components to block patterns/templates + enqueue token CSS | wireframes/components + theme dir |

## Default flow

Linear: `01 → 02`. `theme-json` alone is enough to seed a block theme's global styles; run `02` to also port layouts/components.

Trigger-to-action mapping:

- "export to WordPress", "make a theme.json from our tokens", "port this design to a block theme" → full flow from `theme-json`
- "just generate theme.json", "update the WP global styles" → `theme-json`
- "turn the wireframes into block patterns", "make WP templates from these" → `blocks`

## Transversal rules

- Requires `design/tokens.json`. If absent, route to `from-reference`/`from-brief`.
- `theme.json` is **generated from tokens** — never hand-tune values that exist as tokens; re-export when tokens change.
- Map by role: token slugs become WP preset slugs (kebab-case); resolve `{alias}` references to concrete values.
- Tokens without a native WP preset bucket (radius, shadow, motion, icon, breakpoints, z-index) go under `settings.custom` (emitted as `--wp--custom--*`).
- Iconography: WordPress has no emoji-as-icon excuse either — patterns use the chosen icon set (inline SVG from the library), never emoji.
- Detect Tailwind/WP version where it matters; target `theme.json` schema version 3 unless the project pins otherwise; note the choice.

## References

- `references/theme-json-mapping.md` — token-group → theme.json mapping and the generated CSS-var names
- `${CLAUDE_PLUGIN_ROOT}/references/token-schema.md` — source token groups

## Evals

- `evals/scenarios.json`
