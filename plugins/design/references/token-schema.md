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

Before fleshing out every group, settle the three decisions that define the look — and present them in one quick pass (continue unless the user objects) before expanding the full scale:

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

## Modes / themes

`tokens.json` can encode more than one value per token across named modes/themes — a light/dark mode, a second thematic territory ("Grimoire"), or any combination a project needs — without turning every token into a multi-value structure. This section defines the **`themes` overlay**: a project convention layered on top of the DTCG format above, not a DTCG primitive itself (DTCG has no native mode/theme primitive as of this writing).

### Overlay syntax

A top-level `themes` object sits alongside the base token tree (`color`, `font`, `space`, …). Each key under `themes` is a **theme name**; its value is a **sparse tree** that mirrors the shape of the base tree but only re-declares the paths it overrides:

```json
{
  "color": { "…": "base tree — mono-value, DTCG-valid on its own" },
  "themes": {
    "<theme-name>": {
      "…": { "$value": "<override, same path shape as the base tree>" }
    }
  }
}
```

- **Themes are a flat, named list on a single axis** — e.g. `default`, `dark`, `grimoire`, `grimoire-dark` — not a 2-D matrix of `mode × theme`. If a project genuinely needs the cross-product (every theme in both light and dark), model each combination as its own flat name (`grimoire-dark`) and document the pairing as prose in `design-system.md`; do not introduce a second axis into the overlay shape.
- `default` is never written as a `themes` entry — it **is** the base tree. `themes` only ever lists deviations from it.
- An overlay token object carries only `$value` — never `$type`. The type is always inherited from the base token at the same path; an overlay changes a token's value, never its type. This is a deliberate departure from strict per-token DTCG shape (which allows `$type` at any level) — it keeps overlays sparse and unambiguous: one type per path, many values.
- Unspecified tokens (any path not re-declared in a theme's block) inherit the base value unchanged.

### Invariant

**A theme overlay MAY override any path that exists in the base tree; it MUST NOT introduce a path absent from the base tree.** Concretely: for every `themes.<name>.<path>`, `<path>` must resolve inside the non-`themes` part of `tokens.json`. `adjust/02-freeze.md` audits this at freeze time; a dangling overlay path is a blocking error, not a warning. This keeps the base tree the single source of truth for *which* tokens exist — themes only ever narrow *which value* applies.

### Backward compatibility

A `tokens.json` with no `themes` key is a perfectly valid, mono-value, DTCG-standard file — nothing above changes for a project with a single visual theme. `themes` is additive: existing single-theme contracts need no migration.

### Worked example — default + dark + grimoire

```json
{
  "color": {
    "brand":   { "primary": { "$type": "color", "$value": "#1f6feb" } },
    "neutral": {
      "50":  { "$type": "color", "$value": "#f7f8fa" },
      "900": { "$type": "color", "$value": "#11151c" }
    },
    "semantic": {
      "background": { "$type": "color", "$value": "{color.neutral.50}" },
      "text":       { "$type": "color", "$value": "{color.neutral.900}" }
    }
  },
  "themes": {
    "dark": {
      "color": {
        "semantic": {
          "background": { "$value": "{color.neutral.900}" },
          "text":       { "$value": "{color.neutral.50}" }
        }
      }
    },
    "grimoire": {
      "color": {
        "brand": { "primary": { "$value": "#7c3aed" } }
      }
    }
  }
}
```

Resolution per theme (aliases resolved **in the theme they belong to**):

| Path | `default` | `dark` | `grimoire` |
|---|---|---|---|
| `color.brand.primary` | `#1f6feb` | `#1f6feb` (inherited) | `#7c3aed` (overridden) |
| `color.semantic.background` | `{color.neutral.50}` → `#f7f8fa` | `{color.neutral.900}` → `#11151c` (overridden alias, resolved in `dark`) | `#f7f8fa` (inherited from `default`) |
| `color.semantic.text` | `{color.neutral.900}` → `#11151c` | `{color.neutral.50}` → `#f7f8fa` (overridden alias, resolved in `dark`) | `#11151c` (inherited) |

Every path named above (`color.brand.primary`, `color.semantic.background`, `color.semantic.text`) exists in the base tree — the invariant holds. `grimoire-dark`, if a project needs it, would be its own flat theme name combining both deltas explicitly (never a computed intersection of `grimoire` and `dark`).

## Adapter: `design/adapters/tokens.css`

Flatten every token path to a CSS custom property named `--<group>-<…>-<name>`: prefix `--`, replace every `.` with `-`, **do not re-case any segment** (e.g. `font.lineHeight.base` → `--font-lineHeight-base`, `zIndex.modal` → `--zIndex-modal` — the segment keeps its literal spelling; some groups are deliberately camelCase to mirror the `getComputedStyle` DOM property name they measure against, per `adapters/measure/config-gen.py`). Resolve `{alias}` references to their target `var(--…)`. Emit under `:root`.

This is a mechanical, lossless transform — the only rule is `.` → `-`. `lint-core.mjs` derives its valid-var set the same way (path → var, never var → path); any generator or hand-written adapter must match it exactly, or the gate rejects valid tokens.

```css
/* GENERATED from design/tokens.json — do not edit by hand. Regenerate via /design:define. */
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

### Theme-scoped emission

When `tokens.json` has a `themes` overlay (§ Modes / themes), the adapter emits `:root` for the base tree as above, then **one additional selector block per theme**, each re-declaring only the vars that theme overrides — same var names as the base emission (no suffix, per the linter-neutral convention documented in `lint-core.mjs`), scoped by CSS selector instead:

- The `dark` theme emits under a `.dark` class selector (toggled on `<html>`/`<body>` by the consuming app).
- Any other named theme emits under a `[data-theme="<name>"]` attribute selector — including combined names like `grimoire-dark` → `[data-theme="grimoire-dark"]`.
- `default` needs no block of its own — it *is* `:root`.

```css
/* GENERATED from design/tokens.json — do not edit by hand. Regenerate via /design:define. */
:root {
  --color-brand-primary: #1f6feb;
  --color-neutral-50: #f7f8fa;
  --color-neutral-900: #11151c;
  --color-semantic-background: var(--color-neutral-50);
  --color-semantic-text: var(--color-neutral-900);
}

.dark {
  --color-semantic-background: var(--color-neutral-900);
  --color-semantic-text: var(--color-neutral-50);
}

[data-theme="grimoire"] {
  --color-brand-primary: #7c3aed;
}
```

- Aliases in an overlay resolve **within the theme they belong to** at generation time — `{color.neutral.900}` inside the `dark` overlay still emits as `var(--color-neutral-900)`, the ramp token declared once under `:root` (themes never re-declare ramp/neutral tokens unless the ramp itself changes per theme).
- Only overridden vars appear in a theme's block — the cascade (`:root` → `.dark`/`[data-theme]`) supplies everything else, mirroring the overlay's sparseness in `tokens.json`.
- Because every block re-declares the **same** `--var` name, no downstream consumer (including `lint-core.mjs`) needs to know which theme is active to validate a `var(--…)` reference.

## Adapter: Tailwind (`theme.css` v4 / `tailwind-tokens.cjs` v3)

Tailwind consumes the token contract through one of two artifacts, chosen by the project's Tailwind major version — the emission mechanism differs (a CSS `@theme` at-rule vs a JS/CommonJS partial), but both carry the same token groups and the same theme overlays from § Modes / themes. Record the choice in `design-system.md`.

### Tailwind v4 — `design/adapters/theme.css`

`@theme` block mapping tokens to Tailwind's expected namespaces (`--color-*`, `--font-*`, `--text-*`, `--spacing-*`, `--radius-*`, `--shadow-*`, `--breakpoint-*`). Auto-consumed by Tailwind v4 once imported — no manual wiring step.

```css
/* GENERATED from design/tokens.json — do not edit by hand. */
@theme {
  --color-brand-primary: #1f6feb;
  --text-body: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --spacing-4: 1rem;
  --breakpoint-md: 768px;
}
```

Theme overlays (§ Modes / themes) follow the same `.dark`/`[data-theme="…"]`-scoped block convention documented for `adapters/tokens.css` (§ Theme-scoped emission) — one additional block per named theme, re-declaring only the overridden vars.

### Tailwind v3 — `design/adapters/tailwind-tokens.cjs`

Tailwind v3 has no `@theme` at-rule, so the contract defines a **named, canonical artifact** for it: `design/adapters/tailwind-tokens.cjs`. This is a **partial** — a CommonJS module exporting only a `theme.extend`-shaped object — never a complete `tailwind.config.cjs` (a full drop-in config would collide with the consuming project's own `content` globs and `plugins` array). It is never named `theme.css` (that name is reserved for the v4 artifact above), and it is **never auto-consumed by Tailwind** — every v3 project must wire it in explicitly, per the two cases below.

```js
// GENERATED from design/tokens.json — do not edit by hand.
module.exports = {
  colors: {
    brand: { primary: '#1f6feb' },
    neutral: { 50: '#f7f8fa', 900: '#11151c' },
  },
  fontSize: {
    body: 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',
  },
  spacing: {
    4: '1rem',
  },
  screens: {
    md: '768px',
  },
  // Theme overlays (§ Modes / themes) re-exported under a dedicated key —
  // same theme names as the v4 adapter, sourced from the same `themes.*`
  // overlay in tokens.json. Emission mechanism differs; the theme set does not.
  themes: {
    dark: {
      colors: {
        semantic: { background: '#11151c', text: '#f7f8fa' },
      },
    },
    grimoire: {
      colors: {
        brand: { primary: '#7c3aed' },
      },
    },
  },
};
```

#### Wiring

- **Greenfield** (no pre-existing Tailwind config) — assign the partial directly as `theme.extend`:

  ```js
  // tailwind.config.cjs
  module.exports = {
    theme: { extend: require('./design/adapters/tailwind-tokens.cjs') },
  };
  ```

- **Existing config** (e.g. Nuxt's `tailwind.config.ts`) — a **manual merge step is required**. The adapter is not auto-consumed, so it must be spread into the project's own `theme.extend` alongside whatever the project already declares:

  ```ts
  // tailwind.config.ts
  export default {
    theme: {
      extend: {
        ...require('./design/adapters/tailwind-tokens.cjs'),
        // …the project's own pre-existing extend entries, if any
      },
    },
  };
  ```

  Treat this merge as a mandatory step of any v3 diffuse/pivot flow, not an optional nicety — a partial left un-wired produces utility classes that resolve to nothing.

#### Theme overlays in v3

Part 1's theme overlays (§ Modes / themes) are carried by this same `.cjs` partial, under the dedicated `themes` key shown above — the v3 artifact re-exports the same theme names as the v4 adapter (`dark`, `grimoire`, …), sourced from the identical `themes.*` overlay in `tokens.json`. Only the **emission mechanism** differs between the two Tailwind targets:

- Wire `darkMode: 'class'` (or `'selector'`) in the project's Tailwind config, then consume `themes.dark` (and any other named theme) via the same `.dark`/`[data-theme="…"]` CSS block convention used by `adapters/tokens.css` (§ Theme-scoped emission) — either a small static CSS partial matching the theme keys, or a Tailwind plugin that reads `themes.<name>` off this `.cjs` export and emits the scoped block at build time.
- Non-`dark` themes (e.g. `grimoire`) keep the `[data-theme="<name>"]` selector convention, identical to v4/`tokens.css` — no v3-specific naming scheme.

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
