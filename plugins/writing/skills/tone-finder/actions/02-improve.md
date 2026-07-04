# 02 - Improve

Update an existing output-style file based on patterns extracted from accumulated persona feedback stored in `<output>/review/`.

## Inputs

- `<brief>` (required) — path to the brief directory; existing output-styles are read from `<brief>/output-styles/`
- `--out <output>` (required) — path to the output directory; review feedback is read from `<output>/review/`
- `--only` (optional) — `novel` | `rules` | `scenario` — restrict to one style type

## Outputs

Updated `<brief>/output-styles/<name>-<type>.md` (version incremented) plus a changelog entry:

```markdown
# Changelog Output-Style : [Project]

## v1.1 (YYYY-MM-DD) — [Improvement label]

**Source:** Persona feedback (chapters XX, YY)

### Added
- [new rule with example]

### Changed
- [before] → [after]

### Impact
- Chapters to re-process: XX, YY
- Personas improved: [persona] (+N pts)
```

Saved to: `<output>/review/output-style-changelog.md`

## Process

1. Load all feedback files from `<output>/review/` (files matching `chapter-<NN>-<persona>.md`). Also load any explicit `--remarks` argument.
2. **Check the systemic floor before anything else** (`SYSTEMIC_CHAPTERS = 3`, cf. `${CLAUDE_PLUGIN_ROOT}/references/review-loop.md` § Constantes): count the distinct chapters represented in the loaded feedback. If fewer than 3 chapters have feedback, **stop here** — report `insufficient data: pattern needs ≥3 chapters to qualify as systemic (currently N)` and do not propose, apply, or version-bump anything. This floor is **absolute, not a percentage**: a pattern found in 1 of 1 or 2 of 2 available chapters is 100% of what's been reviewed so far, but it is not yet systemic — it may just be that chapter's slip. Only proceed past this step once ≥3 chapters have contributed feedback.
3. **Extract patterns** across all feedback files: build a table of (pattern, occurrences, affected chapters, category). Classify severity: 🔴 Critical (≥50% chapters affected, deal-breaker for ≥1 persona) → 🟡 Important (25–50%) → 🟢 Optional (<25%). Percentages are computed over the ≥3-chapter set validated in step 2.
4. Load the current output-style file(s) from `<brief>/output-styles/`.
5. **Propose changes**: for each 🔴 and 🟡 pattern, generate a specific improvement:
   - Show: current rule text (or "not currently defined")
   - Show: improved rule text with concrete examples
   - Estimate impact: affected chapters count, score improvement per persona
6. **Validate pattern-by-pattern**: present each proposed change with options `[Apply] [Modify] [Skip]`. Wait for user decision on each.
7. For each approved change:
   - Update the relevant section of `<brief>/output-styles/<name>-<type>.md`.
   - Increment version: minor fix → X.Y+1, structural change → X+1.0.
8. Write updated output-style file(s) to `<brief>/output-styles/`.
9. Create/append changelog entry to `<output>/review/output-style-changelog.md`.
10. Generate remediation plan: which chapters need re-processing with `review`, which should be rewritten with `write --feedback`.

## Test

After `improve <brief> --out <output>` on a project with feedback covering **≥3 chapters**, verify that the output-style file's version has incremented, `<output>/review/output-style-changelog.md` contains an entry for today's date, and the remediation plan lists at least one chapter to re-process.

Negative test: after `improve <brief> --out <output>` on a project with feedback covering **fewer than 3 chapters**, verify that the output-style file's version is unchanged, no changelog entry is created, and the reported output states insufficient data (step 2).
