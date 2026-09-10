# Assess-sobriety

Assesses whether a bounded repository target contains the right functionality and code in the right amount. AIDD supplies specialist evidence; Taste alone owns the product-value and volume verdict.

## Inputs

- `$ARGUMENTS` (required): `<repository | module | diff | completed-feature> [--plan]`
- Explicit sobriety intent without a bounded target asks once for one and performs no delegation or write.

## Output

Return inline:

```md
# Sobriety — <target>

Purpose: <resolved purpose and authority>
Scope: <bounded target>

| Candidate | Verdict | Product value | Known footprint | Gross add | Gross remove | Net | Retained / lost | Confidence | Evidence |
|---|---|---|---|---:|---:|---:|---|---|---|

## Totals

<aggregate known additions, removals, net change, and unknown footprint>

## Evidence gaps

## Delegation receipts
```

Do not persist a second local report. A delegated AIDD skill may write its required artifact; disclose every path in its receipt.

## Process

1. **Bound.** Require a repository, module, diff, or completed feature. If missing, ask once and stop before inspection or delegation.
2. **Purpose.** Load `@../references/sobriety-signals.md` and resolve product purpose by its authority order. Record contradictions and missing evidence.
3. **Delegate.** Read `@../../../references/aidd-delegation.md`, resolve through the host catalogue, and choose exactly one evidence route from its `taste assess-sobriety` matrix:
   - repository or module → `aidd-dev:04-audit`, pillar `code-quality`;
   - diff with its need → `aidd-dev:05-review`, axis `relevancy`;
   - completed feature or work with an agreed reference → `aidd-refine:02-challenge`.
   Ask once when target kind is genuinely ambiguous. Preserve the report unchanged and record its report paths under `writes`.
4. **Candidates.** Start from delegated findings and explicitly named product capabilities. Trace each named candidate's complete footprint using direct repository references; do not recreate a general audit or language scanner.
5. **Judge.** Apply `Add minimally`, `Retain`, `Simplify`, `Merge`, or `Remove` from the reference. Missing essential behavior may justify positive growth. Missing telemetry never proves uselessness; conflicting purpose or decisive evidence caps confidence at `low` and forbids unconditional removal.
6. **Quantify.** Report gross additions, gross removals, and net surface change across source, tests, configuration, and documentation. Keep unknown footprint explicit. Never rank product value by raw line count.
7. **Return.** Render the inline table, totals, evidence gaps, unchanged delegated report links, and one receipt per invocation. Make the final classification visibly Taste's verdict, not an AIDD rescore.
8. **Follow up.** Without `--plan`, stop with product source untouched. With `--plan`, pass the completed Taste output to `aidd-dev:01-plan`; do not call refactor or implementation directly.

## Boundaries

- Assessment never changes source, tests, configuration, product data, or documentation.
- Contract-required AIDD report artifacts are allowed only when disclosed under `writes`.
- Never infer feature value from code size, Git age, absent telemetry, or lack of a direct caller alone.
- Never recommend removing behavior without naming the functional loss and proving essential purpose survives.
- Never add a local code-quality checklist, regex detector, or per-language catalogue.

## Test

- A large uniquely required capability is `Retain`, never removed for size alone.
- A whole-feature `Remove` verdict covers source, tests, configuration, documentation, loss, evidence, net change, and confidence.
- A missing essential capability can be `Add minimally` with justified positive net growth.
- A diff delegates to Review `relevancy`; a repository/module to Audit `code-quality`; completed work to Challenge.
- A missing target causes one question and no delegation or write.
