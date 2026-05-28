# Design system contract

The single source of truth for **where** the design system lives in a project and **what files** compose it. Every `design` skill reads and writes against this contract so that `from-reference`, `from-brief`, `wireframe`, `component`, and `audit` stay interoperable.

## Project layout

The design system home is `design/` at the project root (create it if absent).

```
design/
  design-system.md          # human-readable spec — foundations, responsive strategy, component inventory, provenance
  tokens.json               # W3C DTCG tokens — the machine source of truth (see token-schema.md)
  adapters/
    tokens.css              # generated — CSS custom properties (:root)
    theme.css               # generated — Tailwind v4 @theme block
  components/
    <name>.md               # one spec per reusable component (options, variants, states, responsive divergence, a11y)
  wireframes/
    <story-slug>.html       # living HTML preview, mobile-first, links ../adapters/tokens.css
```

- If a project already nests UI under a sub-package (monorepo), prefer that package root; record the chosen home at the top of `design-system.md`.
- Never scatter tokens across multiple sources. `tokens.json` is canonical; `adapters/*` are **generated** and must never be hand-edited (a header banner says so).

## `design-system.md` required sections

1. **Provenance** — origin (reference URL/file, or brief summary), date, version, who/what generated it.
2. **Foundations** — narrative summary of color, typography, **iconography** (the single chosen icon library + style, `icon.library`/`icon.style`), spacing, radius, elevation, motion. Points to `tokens.json` for exact values; does not duplicate every number. The **core trio** (palette anchor · type · icon set) is settled and approved first, fast, before the rest. Never emoji as UI iconography.
3. **Responsive strategy** — the named breakpoints, the mobile-first stance, and the three-tier intent: what the **mobile core** must always deliver, what is **enriched** only at ≥ tablet/desktop, and which **mobile-only** UX patterns exist. (See the installed `.claude/rules/08-design/` rules for the binding conventions.)
4. **Component inventory** — table: component · purpose · key options/variants · responsive divergence (one line) · spec file.
5. **Open questions** — anything assumed or unresolved, so a human can close it.

## Consumption rules

- `wireframe` and `component` MUST consume tokens from `design/tokens.json` (via `adapters/tokens.css`), never invent values.
- `audit` checks any target (wireframe, page, component) against `tokens.json` + the `08-design` rules + the component inventory.
- When tokens change, regenerate **both** adapters in the same step; never let `tokens.css` and `theme.css` drift from `tokens.json`.

## Versioning

- `design-system.md` carries a `version:` line (semver). Bump **minor** on additive token/component changes, **major** on a token rename/removal that breaks existing pages. Record the bump reason under Provenance.
