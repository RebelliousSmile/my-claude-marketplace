# Token → theme.json mapping

How `design/tokens.json` (W3C DTCG) maps onto a WordPress `theme.json` (schema **version 3**). Validate against the official schema: `https://schemas.wp.org/trunk/theme.json`.

WordPress turns presets into CSS custom properties automatically: a palette slug `brand-primary` becomes `--wp--preset--color--brand-primary`, a font size `body` becomes `--wp--preset--font-size--body`, spacing `40` becomes `--wp--preset--spacing--40`, and anything under `settings.custom` becomes `--wp--custom--*`.

## Mapping table

| Token group | theme.json location | Notes |
|---|---|---|
| `color.brand.*`, `color.semantic.*`, `color.neutral.*` | `settings.color.palette[]` → `{ slug, color, name }` | resolve `{alias}` to a concrete value; kebab-case slugs |
| `font.family.*` | `settings.typography.fontFamilies[]` → `{ slug, name, fontFamily }` | add `fontFace` if self-hosting |
| `font.size.*` | `settings.typography.fontSizes[]` → `{ slug, size, name, fluid? }` | `clamp()` values map directly; or use `fluid` |
| `space.*` | `settings.spacing.spacingSizes[]` → `{ slug, size, name }` | keep numeric slugs to match WP conventions |
| `radius.*` | `settings.custom.radius.*` | → `--wp--custom--radius--*` |
| `shadow.*` | `settings.custom.shadow.*` (or `settings.shadow.presets[]` if used) | composite → box-shadow string |
| `border.width.*` | `settings.custom.border-width.*` | |
| `motion.*` | `settings.custom.motion.*` | duration/easing |
| `icon.size.*`, `icon.stroke.*` | `settings.custom.icon.*` | library/style noted in theme readme |
| `breakpoint.*`, `size.container.*` | `settings.custom.breakpoint.*` + `settings.layout.contentSize/wideSize` | layout sizes drive block alignment |
| `zIndex.*` | `settings.custom.z-index.*` | |

## Global styles

Seed `styles` from semantic tokens so the front matches without extra CSS:

```json
{
  "version": 3,
  "settings": { "...": "presets above", "appearanceTools": true },
  "styles": {
    "color": {
      "background": "var(--wp--preset--color--background)",
      "text": "var(--wp--preset--color--text)"
    },
    "typography": {
      "fontFamily": "var(--wp--preset--font-family--sans)",
      "fontSize": "var(--wp--preset--font-size--body)",
      "lineHeight": "1.5"
    },
    "elements": {
      "link": { "color": { "text": "var(--wp--preset--color--brand-primary)" } },
      "button": {
        "color": {
          "background": "var(--wp--preset--color--brand-primary)",
          "text": "var(--wp--preset--color--background)"
        }
      }
    }
  }
}
```

## Bridging existing components (optional)

Components/wireframes authored against `design/adapters/tokens.css` use names like `--color-brand-primary`. Two ways to keep them working in the theme:

1. **Enqueue `tokens.css`** as a theme stylesheet (simplest) — the original `var(--…)` keep resolving.
2. **Emit a bridge** mapping each `--color-…`/`--space-…` to its `--wp--preset--…` equivalent, so markup can migrate to WP preset classes incrementally.

Prefer (1) for a fast switch; offer (2) when the goal is a fully WP-native theme.
