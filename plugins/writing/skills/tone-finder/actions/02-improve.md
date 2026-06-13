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
2. **Extract patterns** across all feedback files: build a table of (pattern, occurrences, affected chapters, category). Classify severity: 🔴 Critical (≥50% chapters affected, deal-breaker for ≥1 persona) → 🟡 Important (25–50%) → 🟢 Optional (<25%).
3. Load the current output-style file(s) from `<brief>/output-styles/`.
4. **Propose changes**: for each 🔴 and 🟡 pattern, generate a specific improvement:
   - Show: current rule text (or "not currently defined")
   - Show: improved rule text with concrete examples
   - Estimate impact: affected chapters count, score improvement per persona
5. **Validate pattern-by-pattern**: present each proposed change with options `[Apply] [Modify] [Skip]`. Wait for user decision on each.
6. For each approved change:
   - Update the relevant section of `<brief>/output-styles/<name>-<type>.md`.
   - Increment version: minor fix → X.Y+1, structural change → X+1.0.
7. Write updated output-style file(s) to `<brief>/output-styles/`.
8. Create/append changelog entry to `<output>/review/output-style-changelog.md`.
9. Generate remediation plan: which chapters need re-processing with `review`, which should be rewritten with `write --feedback`.

## Test

After `improve <brief> --out <output>`, verify that the output-style file's version has incremented, `<output>/review/output-style-changelog.md` contains an entry for today's date, and the remediation plan lists at least one chapter to re-process.
