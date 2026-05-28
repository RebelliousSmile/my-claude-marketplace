---
name: from-reference
model: sonnet
description: >-
  Establishes a project's design system by extracting tokens from an existing visual reference —
  a screenshot, an image, a live URL, a Figma export, or existing CSS handed over by colleagues.
  Use when someone gives you a design to match or integrate and you need tokens, a responsive strategy,
  and a component inventory fast. Produces design/tokens.json + design/design-system.md + generated adapters.
  Do NOT use to design from a written need with no visual — use from-brief; do NOT use to verify a page — use audit.
---

# from-reference

Turns a handed-over visual reference into the project's design system. Reads the reference, extracts the underlying tokens (color, type, spacing, radius, elevation, motion, breakpoints), infers the responsive strategy, inventories the components it sees, and writes the canonical artifacts defined by the design-system contract.

The goal is **fast convergence to a complete system** that the rest of the plugin (`wireframe`, `component`, `audit`) can consume.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `capture` | Ingest the reference and gather visual evidence | reference (URL / image path / Figma export / CSS) |
| 02 | `extract` | Derive tokens + responsive behavior from the evidence | captured evidence |
| 03 | `write-system` | Write tokens.json, design-system.md, and regenerate adapters | extracted tokens |

## Default flow

Linear: `01 → 02 → 03`. Run end-to-end by default; stop after `02` only if the user wants to review tokens before writing.

Trigger-to-action mapping:

- "extract the design system from <reference>", "match this screenshot", "integrate this reference", "tokens from this site/Figma/CSS" → full flow from `capture`
- "just capture the reference", "what colors/fonts does this use" → `capture` (+ `extract`)
- "write the system from these tokens" → `write-system`

## Transversal rules

- Read the design-system contract before writing: `${CLAUDE_PLUGIN_ROOT}/references/design-system-contract.md`.
- Follow the token schema exactly: `${CLAUDE_PLUGIN_ROOT}/references/token-schema.md`.
- Reference, don't invent: every token must trace to an observation in the reference. List anything assumed under § Open questions.
- If `08-design` rules are absent (`.claude/rules/08-design/`), tell the user to run `/design:setup` first.
- Prefer fluid `clamp()` steps when two reference breakpoints reveal a type/space progression.
- Detect breakpoints from the reference if responsive evidence exists; otherwise propose the schema defaults and flag them as assumed.

## References

- `${CLAUDE_PLUGIN_ROOT}/references/design-system-contract.md` — artifact layout and required sections
- `${CLAUDE_PLUGIN_ROOT}/references/token-schema.md` — token groups and adapter generation

## Evals

- `evals/scenarios.json`
