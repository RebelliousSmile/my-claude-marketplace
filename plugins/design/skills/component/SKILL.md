---
name: component
model: sonnet
description: >-
  Designs and implements a reusable UI component driven by options/variants, consistent with the project's
  design system. Use when adding a component to the system or turning a spec into framework code (Vue, React,
  Svelte, Astro, web component, or plain HTML/CSS). Produces design/components/<name>.md and, on request, the
  implementation. Do NOT use to lay out a whole page — use wireframe; to verify an existing component — use audit.
---

# component

Builds reusable components the system way: one component, many options — never a copy-paste fork. First writes a spec (anatomy, options, variants, states, responsive divergence, accessibility) into `design/components/<name>.md` and registers it in the inventory; then, on request, implements it in the project's framework using only design tokens.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `spec` | Write the component spec + register it in the inventory | component name + intent |
| 02 | `implement` | Generate the component in the project's framework from the spec | the spec + detected stack |

## Default flow

Router. Trigger-to-action mapping:

- "spec a <component>", "design a <component>", "add a <component> to the system" → `spec`
- "implement the <component>", "build the <component> in Vue/React/…", "code the <component>" → `implement` (run `spec` first if no spec exists)

## Transversal rules

- Read `design/design-system.md` + `design/tokens.json` first. If absent, tell the user to run `from-reference`/`from-brief`.
- Obey `.claude/rules/08-design/` — especially tokens-only and reusable-components-with-options.
- Expose variation as options/variants/props, never duplicated files; defaults make the bare component usable.
- Document every state: default, hover, focus, active, disabled, loading, empty, error (those that apply).
- Declare the mobile↔desktop divergence explicitly when behavior changes by breakpoint.
- `implement` detects the stack from the project (package.json / file extensions); never assume a framework — ask if ambiguous.
- Update the component inventory table in `design/design-system.md` after `spec`.

## References

- `references/component-spec-template.md` — the spec structure to fill
- `${CLAUDE_PLUGIN_ROOT}/references/design-system-contract.md` — where specs live and how the inventory is kept

## Evals

- `evals/scenarios.json`
