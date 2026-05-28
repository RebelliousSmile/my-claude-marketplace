# 01 - plan

Build a batched, risk-ordered migration plan to bring a scope into compliance.

## Inputs

- `scope` (required) — files/globs to migrate.
- `design/tokens.json` + `design/design-system.md` (the target).
- Optional: the `doctor` health report (reuse its findings instead of re-scanning).

## Process

1. **Establish the target**: confirm `design/tokens.json` exists and the `08-design` rules are installed.
2. **Inventory changes in scope** (reuse the health report if present): hardcoded colors/spacing, emoji-as-icons, `max-width`-first media queries, base-layer media queries, forked/duplicated components, missing focus/contrast.
3. **Classify each change by risk**:
   - **Mechanical / low risk** — token substitution (hex→`var()`), emoji→icon, both behavior-preserving.
   - **Structural / medium risk** — `max-width`→mobile-first rewrite, merging forks into options-driven components.
   - **Behavioral / flagged** — fixes that intentionally change render (contrast, focus) — call these out.
4. **Map values to tokens**: pair each hardcoded value with an existing token; list any value needing a new token (to add via `from-reference`).
5. **Batch** the work into independently shippable, reviewable chunks, lowest risk first; note the audit gate that closes each batch.

## Outputs

A migration plan: ordered batches, each with goal, file list, risk level, value→token mapping, and the closing `audit` gate. List any new tokens needed before starting.

## Test

Every in-scope change is assigned a batch and a risk class, each hardcoded value maps to a token (existing or proposed-new), batches are ordered lowest-risk-first, and each batch names its `audit` gate.
