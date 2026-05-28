# 02 - extract

Turn the raw evidence note into a structured, deduplicated set of tokens following the schema.

## Inputs

- The evidence note from `01-capture`.
- The token schema: `${CLAUDE_PLUGIN_ROOT}/references/token-schema.md`.

## Process

0. **Core trio first (fast)** — identify and present, in one quick pass, the three look-defining decisions before the full token set: the **palette anchor** (dominant brand + neutral temperature), the **type** (families/pairing), and the **icon set** (which library the reference appears to use — Lucide/Phosphor/Heroicons/Material/custom — plus style; record as `icon.library`/`icon.style`). If the reference uses emoji as icons, flag it: the system replaces them with a real icon set, never emoji.

1. **Rationalize colors** into ramps + semantic roles:
   - Group near-identical hexes; snap a noisy palette to a coherent neutral ramp.
   - Map roles: `background`, `surface`, `text`, `text-muted`, `border`, brand `primary` (+ secondary/accent if present), and state colors (`success`, `warning`, `danger`, `info`).
   - Check each text-on-background pair for WCAG AA; note any failure.
2. **Build the type scale**: pick families/weights, fit observed sizes to a modular scale, propose `clamp()` for steps that should fluidly grow between breakpoints, set line-heights.
3. **Derive the spacing scale** from the inferred base unit; express in `rem`.
4. **Capture** radius, shadow (as composite tokens), border widths, motion (duration + easing), and icon sizing/stroke (`icon.size.*`/`icon.stroke.*`) where observed; mark the rest assumed.
5. **Set breakpoints**: use values evidenced by the reference; otherwise the schema defaults (`sm 640 / md 768 / lg 1024 / xl 1280`), flagged as assumed.
6. **Determine the responsive strategy** from evidence:
   - Mobile core (what must always be present).
   - Enriched-only blocks (≥ tablet/desktop).
   - Mobile-only UX patterns and their desktop equivalents.
7. **Inventory components** seen in the reference (buttons, inputs, cards, nav, etc.) with their apparent variants.

## Outputs

A complete proposed token set (schema-shaped) + responsive strategy + component list, presented for quick review. List assumptions under "Open questions".

## Test

The proposal covers every required token group in the schema, each text/background pair has a contrast verdict, and every assumed value is flagged.
