# 01 - theme-json

Generate a WordPress `theme.json` (v3) from `design/tokens.json`.

## Inputs

- `design/tokens.json` (required).
- `theme_dir` — the target block theme directory (ask if unknown; default the project root or `wp-content/themes/<slug>/`).
- The mapping: `${CLAUDE_PLUGIN_ROOT}/skills/export-wordpress/references/theme-json-mapping.md`.

## Process

1. **Read tokens** and resolve all `{alias}` references to concrete values.
2. **Build `settings.color.palette`** from `color.brand/semantic/neutral` — `{ slug, color, name }`, kebab-case slugs.
3. **Build `settings.typography`**: `fontFamilies` from `font.family.*`; `fontSizes` from `font.size.*` (map `clamp()` directly or via `fluid`).
4. **Build `settings.spacing.spacingSizes`** from `space.*` (numeric slugs).
5. **Build `settings.layout`** `contentSize`/`wideSize` from `size.container.*`; set `appearanceTools: true`.
6. **Put the rest under `settings.custom`**: radius, shadow, border width, motion, `icon.*`, breakpoints, z-index (emitted as `--wp--custom--*`).
7. **Seed `styles`** from semantic tokens: body background/text/font, link + button elements (per the mapping example). Never introduce a literal that exists as a token — reference `var(--wp--preset--…)`.
8. **Write `theme.json`** at the theme root with `"version": 3` and `$schema` set to the official URL. If one exists, merge: preserve non-design keys, overwrite the design-derived sections, and report the diff.

## Outputs

`<theme_dir>/theme.json` derived entirely from tokens, plus a short report of palette/size/spacing counts and any token group routed to `custom`.

## Test

`theme.json` is valid v3, every palette/font-size/spacing entry traces to a token (aliases resolved), non-preset groups appear under `settings.custom`, `styles` references presets (no stray literals), and an existing file's non-design keys are preserved.
