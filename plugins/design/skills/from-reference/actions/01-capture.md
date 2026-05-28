# 01 - capture

Ingest the handed-over reference and gather concrete visual evidence to extract tokens from.

## Inputs

- `reference` (required) — one of:
  - an image / screenshot path (read it with the Read tool — it renders visually)
  - a live URL (fetch it; capture both small and wide renderings if possible)
  - a Figma export (JSON, CSS, or images)
  - existing CSS / a stylesheet / a component file

## Process

1. **Identify the reference type** and load it:
   - Image → Read the file to view it.
   - URL → fetch the page; if responsive evidence matters, note layout at a narrow and a wide width.
   - CSS/Figma export → read the source directly (most reliable — values are explicit).
2. **Catalog observed values** into a working note (not yet tokens):
   - Colors actually used (backgrounds, text, accents, borders, states) with rough hex.
   - Type: families, weights, the distinct sizes seen, line-heights, heading vs body contrast.
   - Spacing rhythm: recurring gaps/padding; infer the base unit (often 4 or 8 px).
   - Radius, shadows/elevation, border widths.
   - Motion if observable (transitions, durations).
3. **Note responsive evidence**: any sign of breakpoints, column counts at different widths, what content appears only on wide layouts, any mobile-specific pattern.
4. **Flag gaps**: what the reference does not reveal (e.g., disabled states, dark mode, motion).

## Outputs

A structured evidence note (in the conversation, or `design/.capture-notes.md` if the user wants it persisted) listing observed colors, type, spacing, radius, elevation, motion, and responsive signals — each tied to where it was seen.

## Test

Every later token can point to a line in this evidence note, or is explicitly marked as assumed.
