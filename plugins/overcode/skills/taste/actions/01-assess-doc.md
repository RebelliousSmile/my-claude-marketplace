# Assess-doc

Checks explicit Markdown claims against the repository, weights their impact, and reports evidence coverage. External factual claims are delegated separately; they never change the local freshness score.

## Inputs

- `$ARGUMENTS` (optional): `[path.md] [--limit N | --all]`
- A path runs single-file mode. No path runs bounded scan mode.
- Scan default: `--limit 25`. `--all` is explicit opt-in to every eligible Markdown file.

## Single-file output

```md
Verdict: Current | Partial | Obsolete | Superseded | N/A
Qualification: local evidence only — external verification pending | none
Coverage: <verified local points>/<eligible local points> (<percentage or N/A>)

| Claim | Class | Weight | Evidence | Status | Points |
|---|---|---:|---|---|---:|
| <claim> | critical/structural/informative | 3/2/1 | <path:line or reason> | Current/Modified/Obsolete | <weight × 1/0.5/0> |

External verification:
| Claim | State | Fact-check artifact |
|---|---|---|
```

The same fields and verdict algorithm apply to a scan worker and to aggregation.

## Ground rules

- Verify repository claims against primary repository evidence, never another prose document.
- Never modify the assessed document or any project source. Fact-check receives only the extracted external claim text or an ephemeral copy outside the project.
- Git age is a prioritization signal, not proof that content is obsolete.
- Extract explicit claims only. Do not turn rationale, opinion, or future intent into repository claims.

## Single-file process

1. Read the target and detect decision markers using `@../assets/decision-doc.md`.
2. Extract claims with `@../assets/claim-types.md`, recording class, weight, local/external scope, and the exact passage.
3. If there is no locally eligible claim and no external claim, return `N/A — no verifiable claims` without a percentage.
4. Verify every local claim with its specified repository method. Relative Markdown links resolve from the assessed file. Classify evidence:
   - `Current`: exact evidence, multiplier `1`;
   - `Modified`: subject exists but differs materially, multiplier `0.5`;
   - `Obsolete`: contradicted or absent, multiplier `0`.
5. Compute `earned = Σ(weight × multiplier)` and `eligible = Σ(weight)` for local claims only. Coverage is `earned / eligible`:
   - no eligible points → `N/A` and no percentage;
   - `<20%` → `Obsolete`;
   - `20–79%` → `Partial`;
   - `≥80%` → `Current` unless a critical claim is `Obsolete`.
6. A critical obsolete claim vetoes `Current` and `Superseded`; use `Partial` when the weighted score is at least 20%, otherwise `Obsolete`.
7. For a decision document, apply `@../assets/decision-doc.md`. `Superseded` precedes `Current`, but requires score `≥80%`, no critical obsolete claim, and subject-matched replacement evidence.
8. For each external factual claim, resolve `aidd-refine:04-fact-check` through `@../../../references/aidd-delegation.md` and invoke it on the extracted text or ephemeral copy. Keep its rewritten/cited artifact separate. If unavailable, mark `external-unverified` and stop that branch without a local fallback.
9. External results never enter `earned` or `eligible`. If any external branch remains unverified, set qualification `local evidence only — external verification pending`; never present the local verdict as an unqualified global verdict.
10. Report stale passages (at most two quoted sentences each), suggested actions, local evidence, external state, and the delegation receipt when fact-check ran.

## Scan process

1. Enumerate Markdown files excluding `.git`, dependencies, vendor, generated output, and build output.
2. Build a read-only priority queue using, in order: decision marker; presence of critical claim shapes; immediately resolvable broken relative links; divergence between the document's last Git commit and newer commits touching named local targets; remaining files by oldest Git commit. Do not use filesystem mtime as evidence.
3. Select at most 25 files by default, `N` with `--limit N`, or all with `--all`. Report selected, eligible, and unscanned paths before assessment.
4. Run the single-file process for the selected set with native host concurrency when useful, or sequentially. Do not prescribe a model or one-agent-per-file fan-out.
5. Aggregate the exact worker schema. Sort `Obsolete → Superseded → Partial → Current → N/A`, preserving qualifications and point totals.
6. Normalize obsolete values, then apply two independent rules:
   - Group an identical obsolete value as a cross-file root cause only when it affects at least two distinct files.
   - Choose each file's ordered read-only recommendation from its own claims. Recommend `delete` only when every eligible claim is obsolete and no salvageable content exists. Otherwise, recommend `rewrite` when one normalized obsolete cause affects at least three claims in that file, even if it has no cross-file group; recommend `update` for one or two localized claims and all remaining cases.
7. When invoked by `harvest`, return document verdict counts, total earned/eligible local points, external-pending count, and scan coverage.

## Test

- Threshold fixtures at 19/20/79/80 percent produce Obsolete/Partial/Partial/Current.
- A critical obsolete claim vetoes Current and Superseded.
- No local eligible claim returns N/A without division by zero.
- A pending external claim qualifies the local verdict and never changes its score.
- Default scan assesses no more than 25 documents and lists every unscanned path.
