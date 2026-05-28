---
name: from-brief
model: sonnet
description: >-
  Establishes a project's design system from a written need — a client brief, a product positioning,
  or a user story — when there is no visual reference to copy. Clarifies brand attributes and audience,
  derives a coherent token set (color, type, spacing, motion, breakpoints) and a responsive strategy,
  then writes design/tokens.json + design/design-system.md + generated adapters.
  Do NOT use when a visual reference exists — use from-reference; do NOT use to verify a page — use audit.
---

# from-brief

Designs a system from intent rather than from an image. Clarifies the few attributes that actually drive visual decisions (brand personality, audience, platform, constraints), derives a coherent and distinctive token set, defines the responsive strategy, and writes the canonical artifacts.

Distinctive by default: avoid the generic framework-default look. The brief's personality should be legible in the resulting tokens.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `clarify` | Pin down brand attributes, audience, platform, constraints | the brief / user story |
| 02 | `derive` | Generate a coherent, distinctive token set + responsive strategy | clarified attributes |
| 03 | `write-system` | Write tokens.json, design-system.md, and regenerate adapters | derived tokens |

## Default flow

Linear: `01 → 02 → 03`. Run end-to-end, but `01` may pause for the user's answers before continuing.

Trigger-to-action mapping:

- "design a system for <product/need>", "we have a client brief", "create a design system from this user story", "no reference, design from scratch" → full flow from `clarify`
- "derive tokens from these attributes" → `derive`
- "write the system from these tokens" → `write-system`

## Transversal rules

- Read the design-system contract and token schema before writing: `${CLAUDE_PLUGIN_ROOT}/references/design-system-contract.md`, `${CLAUDE_PLUGIN_ROOT}/references/token-schema.md`.
- `clarify` asks **at most 3–4 questions at once**, only the ones that change token decisions; assume sensible defaults for the rest and list them as Open questions.
- Derive a deliberate, distinctive palette and type pairing — never default to the framework's stock look.
- Verify color choices for WCAG AA at definition time.
- Mobile-first responsive strategy is mandatory: define mobile core, enriched-only, and mobile-only UX up front.
- If `08-design` rules are absent, tell the user to run `/design:setup` first.

## References

- `${CLAUDE_PLUGIN_ROOT}/references/design-system-contract.md` — artifact layout and required sections
- `${CLAUDE_PLUGIN_ROOT}/references/token-schema.md` — token groups and adapter generation
- `references/attribute-questions.md` — the clarification checklist used by `clarify`

## Evals

- `evals/scenarios.json`
