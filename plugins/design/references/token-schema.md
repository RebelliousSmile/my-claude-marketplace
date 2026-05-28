# Token schema (W3C DTCG) + adapter generation

`design/tokens.json` follows the [W3C Design Tokens Community Group](https://www.w3.org/community/design-tokens/) format: every token is an object with `$type` and `$value`; groups nest freely. This file defines the **required groups** and how the two adapters are generated from them.

## Required groups

A complete design system MUST define these groups. Mark anything genuinely inapplicable as omitted in `design-system.md` § Open questions rather than inventing values.

| Group | `$type` | Notes |
|---|---|---|
| `color.brand.*` | `color` | primary, plus secondary/accent if the brand has them |
| `color.neutral.*` | `color` | a ramp (e.g. `50…900`) for text, surfaces, borders |
| `color.semantic.*` | `color` | `background`, `surface`, `text`, `text-muted`, `border`, `success`, `warning`, `danger`, `info` — reference the ramps via `{color.neutral.900}` aliases when possible |
| `font.family.*` | `fontFamily` | `sans`, plus `serif`/`mono` if used |
| `font.weight.*` | `fontWeight` | only the weights actually loaded |
| `font.size.*` | `dimension` | a modular scale; prefer fluid `clamp()` strings for body→display steps |
| `font.lineHeight.*` | `number` | unitless |
| `space.*` | `dimension` | one consistent scale (e.g. `0,1,2,3,4,6,8,12,16,24` → rem) |
| `radius.*` | `dimension` | `none…full` |
| `shadow.*` | `shadow` | elevation steps (composite tokens) |
| `border.width.*` | `dimension` | hairline / default / thick |
| `motion.duration.*` | `duration` | fast / base / slow |
| `motion.easing.*` | `cubicBezier` | standard / entrance / exit |
| `breakpoint.*` | `dimension` | `sm`, `md`, `lg`, `xl` — px min-widths (mobile-first, used as `min-width`) |
| `size.container.*` | `dimension` | max content widths per breakpoint |
| `zIndex.*` | `number` | named layers (dropdown, sticky, overlay, modal, toast) |

### Example

```json
{
  "color": {
    "brand": { "primary": { "$type": "color", "$value": "#1f6feb" } },
    "neutral": {
      "50":  { "$type": "color", "$value": "#f7f8fa" },
      "900": { "$type": "color", "$value": "#11151c" }
    },
    "semantic": {
      "background": { "$type": "color", "$value": "{color.neutral.50}" },
      "text":       { "$type": "color", "$value": "{color.neutral.900}" }
    }
  },
  "font": {
    "size": { "body": { "$type": "dimension", "$value": "clamp(1rem, 0.95rem + 0.25vw, 1.125rem)" } }
  },
  "breakpoint": {
    "sm": { "$type": "dimension", "$value": "640px" },
    "md": { "$type": "dimension", "$value": "768px" },
    "lg": { "$type": "dimension", "$value": "1024px" },
    "xl": { "$type": "dimension", "$value": "1280px" }
  }
}
```

## Adapter: `design/adapters/tokens.css`

Flatten every token path to a CSS custom property named `--<group>-<…>-<name>` (kebab-case, `.` → `-`). Resolve `{alias}` references to their target `var(--…)`. Emit under `:root`.

```css
/* GENERATED from design/tokens.json — do not edit by hand. Regenerate via /design:from-reference or /design:from-brief. */
:root {
  --color-brand-primary: #1f6feb;
  --color-neutral-50: #f7f8fa;
  --color-semantic-text: var(--color-neutral-900);
  --font-size-body: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --breakpoint-md: 768px;
}
```

- Shadow composite tokens → a single `box-shadow` string per step.
- Breakpoints stay as custom properties for reference, but media queries cannot use `var()` in their conditions — so the breakpoint **px values are also written as literals** in any generated CSS `@media` rule, with a comment naming the token.

## Adapter: `design/adapters/theme.css`

Tailwind v4 `@theme` block mapping tokens to Tailwind's expected namespaces (`--color-*`, `--font-*`, `--text-*`, `--spacing-*`, `--radius-*`, `--shadow-*`, `--breakpoint-*`). For projects on Tailwind v3, emit a `tailwind.config.js` `theme.extend` object instead and note the choice in `design-system.md`.

```css
/* GENERATED from design/tokens.json — do not edit by hand. */
@theme {
  --color-brand-primary: #1f6feb;
  --text-body: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --spacing-4: 1rem;
  --breakpoint-md: 768px;
}
```

## Invariants

- Both adapters are regenerated together, atomically, from `tokens.json`.
- Generated files always carry the "do not edit" banner.
- A value that differs between adapters and `tokens.json` is a bug — `audit` flags it.
