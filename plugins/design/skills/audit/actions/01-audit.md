# 01 - audit

Run the compliance checklist against a target and report violations with fixes.

## Inputs

- `target` (required) — a file, glob, or page (e.g., `design/wireframes/checkout.html`, `src/components/Button.vue`, `src/pages/**/*.vue`).
- The system: `design/tokens.json`, `design/design-system.md`, `design/components/*`, and `.claude/rules/08-design/`.
- Optional flag: `--fix` (apply fixes after reporting) — otherwise read-only.

## Process

1. **Load the system**. If `design/tokens.json` is absent, stop: tell the user to run `from-reference`/`from-brief` — there is nothing to audit against.
2. **Resolve the target** file set.
3. **Run `references/checklist.md`** category by category against each file:
   - Scan for hardcoded colors/sizes; cross-check used `var(--…)`/Tailwind classes exist in the adapters.
   - Detect `max-width`-first patterns and base-layer media queries.
   - Check enriched regions are min-width-revealed and tagged; check no required content is mobile-hidden.
   - Check mobile-only patterns have a declared desktop equivalent.
   - Compare components to their specs and the inventory.
   - Evaluate contrast (compute ratios from token values), focus visibility, target size, semantics.
4. **Rank findings** blocking / warning / note; quote `file:line`, the violated rule, and the compliant replacement.
5. **Emit the report** in the checklist's report format. Verdict is FAIL if any blocking finding exists.
6. **If `--fix`**: apply the compliant replacements (token substitutions, min-width conversions, focus rings, etc.), then re-run to confirm the verdict improved. Never edit generated adapter files — fix the source.

## Outputs

A severity-ranked report (and, with `--fix`, the applied edits + a re-audit verdict).

## Test

Every finding cites a file:line, the violated `08-design` rule, and a concrete token/rule-compliant fix; the verdict is FAIL iff at least one blocking finding is present.
