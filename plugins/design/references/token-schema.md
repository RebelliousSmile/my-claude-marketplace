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
| `icon.size.*` | `dimension` | `sm`/`md`/`lg`, aligned to the type scale |
| `icon.stroke.*` | `dimension` | stroke width(s) for outline icon sets |
| `zIndex.*` | `number` | named layers (dropdown, sticky, overlay, modal, toast) |

### The core trio (decide first, fast)

Before fleshing out every group, settle the three decisions that define the look — and get them approved in one quick pass:

1. **Palette anchor** — the brand primary + neutral temperature (the ramps follow).
2. **Type** — the family or pairing (the scale follows).
3. **Icon set** — a single chosen library, recorded as a foundation in `design-system.md`:

   ```
   icon.library: lucide        # one set only — e.g. lucide, phosphor, heroicons, material-symbols
   icon.style: outline         # outline | solid | duotone — pick one default
   ```

   The library/style are **foundation fields**, not tokens; only `icon.size.*` and `icon.stroke.*` are tokens.

### Never emoji

- UI iconography comes exclusively from the chosen icon set.
- Never use emoji or emoticons as interface icons, bullets, or status indicators — in tokens, components, wireframes, or generated code.
- Emoji are content (a user may type them); they are never part of the design system's visual language.

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

## Liaison tokens canoniques ↔ manifeste composants

Après `adjust`, `tokens.json` (couche 1) et `components.json` (couche 2) forment un système cohérent. Les points de liaison :

### Backgrounds autorisés

Le champ `.backgrounds` d'un composant dans `components.json` référence des **chemins de tokens** de `tokens.json` :

```json
"hero": {
  "backgrounds": ["color.semantic.background", "color.brand.primary"]
}
```

Le chemin `color.semantic.background` doit exister dans `tokens.json` sous `color.semantic.background.$value`. `enforce` valide ce lien ; un chemin mort est une violation `error`.

### Tokens sémantiques = le pont

Les tokens sémantiques (`color.semantic.*`) sont le pont entre couche 1 et couche 2. Ils doivent être résolus (alias vers un token de ramp) dans `tokens.json` pour que le lint de fond soit vérifiable statiquement :

```json
"color": {
  "semantic": {
    "background": { "$type": "color", "$value": "{color.neutral.50}" },
    "surface":    { "$type": "color", "$value": "{color.neutral.100}" }
  }
}
```

### Tokens de fond autorisés pour les composants sombres

Pour les variantes sombres (ex. `hero--dark`) dont `.backgrounds` liste un token foncé (ex. `color.neutral.900`), `enforce` vérifie que le contraste texte/fond satisfait WCAG AA. Le token de couleur de texte candidat est `color.semantic.text` (ou sa valeur calculée).

### Ce que `adjust` fait lors du figeage

1. Audite les groupes requis de `tokens.json` (tous les groupes de la table ci-dessus doivent exister).
2. Déduplique les tokens redondants (valeurs identiques sur des chemins différents → alias l'un vers l'autre).
3. Pour chaque composant de `components.json`, vérifie que tous les chemins de `.backgrounds` existent dans `tokens.json`.
4. Bumpe `$version` dans les deux fichiers en cohérence.

## Invariants

- Both adapters are regenerated together, atomically, from `tokens.json`.
- Generated files always carry the "do not edit" banner.
- A value that differs between adapters and `tokens.json` is a bug — `audit` flags it.
- Toute référence `{token.path}` dans `tokens.json` doit pointer vers un chemin existant dans le même fichier. Les alias circulaires sont interdits.
- Les chemins de `.backgrounds` dans `components.json` pointent obligatoirement vers `color.*` tokens (les tokens de type `color` uniquement).
