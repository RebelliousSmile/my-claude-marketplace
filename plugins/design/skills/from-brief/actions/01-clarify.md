# 01 - clarify

Pin down the few attributes that actually drive token decisions, so the system reflects the brief instead of a generic default.

## Inputs

- `brief` (required) — the client brief, product positioning, or user story (free text or a doc path).

## Process

1. **Read the brief** and extract what is already decided: product, audience, tone words, platform, any color/brand mention, constraints.
2. **Identify genuine ambiguities** against the driver list in `${CLAUDE_PLUGIN_ROOT}/skills/from-brief/references/attribute-questions.md`.
3. **Ask at most 3–4 questions in one numbered list** — only drivers that are both unknown and token-relevant. Then wait for answers.
4. **Default the rest** using the table's defaults; record each default so the user can override.
5. **Assemble an attribute profile**: personality, audience/context, primary platform & usage, color/theme constraints, accessibility bar.

## Outputs

A concise attribute profile + an explicit list of defaulted assumptions.

## Test

The profile covers personality, audience, platform, theme, and a11y bar; no more than 3–4 questions were asked at once; every unanswered driver has a recorded default.
