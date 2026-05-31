---
name: refactor
model: sonnet
description: >-
  Migrates existing production UI into compliance with the project's design system, incrementally and safely.
  Use after diagnose (the health report) and from-reference (target tokens) to replace hardcoded values with tokens, convert
  max-width-first CSS to mobile-first, dedupe forked components into options-driven ones, and swap emoji for the
  chosen icon set — in reviewable batches, each verified by audit. Edits source. Do NOT use to create the system
  (from-reference/from-brief) or to build new UI from scratch (wireframe/component).
---

# refactor

Brings UI **already in production** into line with an established design system. It applies the migration `diagnose` prescribed: token substitution, mobile-first conversion, component de-duplication, and emoji→icon replacement — in small, reviewable batches, each gated by `audit`.

Safety first: production code changes are scoped, behavior-preserving by default, and verified before moving on.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `plan` | Build a batched, risk-ordered migration plan for a scope | target scope + system + (optional) health report |
| 02 | `apply` | Apply one batch of changes, then verify with audit | a batch from the plan |

## Default flow

Linear, iterative: `01 → (02 per batch) → repeat`. Plan once; apply batch by batch.

Trigger-to-action mapping:

- "refactor this to use the design system", "migrate the styles to tokens", "make this mobile-first", "plan the refactor" → `plan`
- "apply the next batch", "do the token substitution", "convert these to mobile-first", "replace the emoji with icons" → `apply`

## Transversal rules

- A target system must exist (`design/tokens.json`). If not, stop and route to `from-reference`/`from-brief`; if undiagnosed, suggest `diagnose` first.
- **Behavior-preserving by default**: substitutions must not change the rendered result unless the change is the explicit goal (e.g., fixing a contrast failure) — and then say so.
- Work in **reviewable batches**, lowest risk first: mechanical token/emoji substitutions before structural mobile-first/component changes.
- Never edit generated adapter files; fix the source that consumes them.
- After each batch, run `/design:audit <scope>` and report the before/after verdict.
- Map a hardcoded value to an existing token; if none fits, propose a new token (update `from-reference` output) rather than inventing an inline literal.
- Replace emoji-as-icons with the chosen icon set; never leave emoji in the UI.

## References

- `${CLAUDE_PLUGIN_ROOT}/references/token-schema.md` — the token set to migrate toward
- `${CLAUDE_PLUGIN_ROOT}/references/design-system-contract.md` — where the system lives

## Evals

- `evals/scenarios.json`
