# 02 - apply

Apply one batch from the plan, then verify it with audit.

## Inputs

- A single batch from `01-plan` (goal, file list, value→token mapping, risk class).
- `design/tokens.json` + adapters.

## Process

1. **Confirm prerequisites**: any new tokens the batch needs already exist in `tokens.json` (and adapters regenerated). If not, stop and route to `from-reference` to add them.
2. **Apply the batch's changes** to the listed files only:
   - **Token substitution**: replace each literal with the mapped `var(--…)` or token class. Behavior-preserving.
   - **Emoji→icon**: replace emoji glyphs with the chosen icon set's component/markup, sized via `icon.*`; add accessible labels.
   - **Mobile-first conversion**: move base styles to the mobile case, rewrite `max-width` queries as `min-width` enrichment, keep the rendered result equivalent unless the batch is explicitly a behavioral fix.
   - **Component de-dup**: replace forked copies with the options-driven component; map old usages to the right props.
3. **Keep the diff tight and reviewable** — only the batch's files, only its intended changes. Never touch generated adapters.
4. **Verify**: run `/design:audit <batch scope>` and capture the before/after verdict.
5. **Report**: files changed, value→token replacements made, audit verdict delta, and any follow-up that slipped to a later batch.

## Outputs

The edited source files for this batch + an audit verdict confirming improvement. Stop after the batch unless told to continue.

## Test

Only the batch's files changed; behavior-preserving batches render identically; emoji are gone from the touched files; generated adapters are untouched; and the post-batch `/design:audit` verdict is no worse and resolves the batch's targeted findings.
