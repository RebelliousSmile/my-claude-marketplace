# 02 - prescribe

Turn the diagnosis into a prioritized, low-risk remediation roadmap.

## Inputs

- The health report from `01-diagnose`.

## Process

1. **Pick the crystallization source**: identify the cleanest screen(s) or the reverse-engineered de-facto tokens to feed `from-reference`, so the target system reflects what already mostly works (fast, low-surprise).
2. **Decide the target core trio**: recommend the canonical palette anchor, type, and one icon set — explicitly replacing any emoji-as-icons.
3. **Sequence the migration** by risk and payoff:
   - Phase 1 — establish `design/tokens.json` (via `from-reference`) and the `08-design` rules (via `setup`). No behavior change.
   - Phase 2 — mechanical, low-risk substitutions: hardcoded colors/spacing → tokens; emoji → icon set. High coverage, near-zero visual change.
   - Phase 3 — structural: `max-width`-first → mobile-first; dedupe forked components into options-driven ones.
   - Phase 4 — accessibility fixes (contrast, focus, targets).
4. **Scope each phase** to file batches small enough to review and ship independently.
5. **Define done**: each phase ends with `/design:audit <scope>` reaching its target verdict.

## Outputs

A phased roadmap: per phase — goal, file scope, the skill that does it (`setup`, `from-reference`, `refactor`, `audit`), risk level, and the audit gate that closes it.

## Test

The roadmap names the crystallization source, recommends the target core trio (with emoji removal), orders phases lowest-risk-first, scopes each into reviewable batches, and gates each on an `audit` verdict.
