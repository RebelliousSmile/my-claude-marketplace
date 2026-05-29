# 02 - Improve

Update an existing output-style file based on patterns extracted from accumulated persona feedback and doctor reports.

## Inputs

- `univers` (required) — string, universe name (e.g. `wot`)
- `--improve-from-feedback` (required flag) — activates improve mode
- feedback sources (auto-discovered): `.wip/comments/*.md`, doctor reports in `.wip/changelog/`

## Outputs

Updated `<univers>/.output-styles/<univers>-<type>.md` (version incremented) plus a changelog entry:

```markdown
# Changelog Output-Style : [Univers]

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

Saved to: `.docs/output-style-changelog.md`

## Process

1. Load all feedback sources: `.wip/comments/*.md` (persona analyses), doctor changelogs in `.wip/changelog/`. Also load any explicit `--remarks` argument.
2. **Extract patterns** across all feedback files: build a table of (pattern, occurrences, affected chapters, category). Classify severity: 🔴 Critical (≥50% chapters affected, deal-breaker for ≥1 persona) → 🟡 Important (25–50%) → 🟢 Optional (<25%).
3. Load the current output-style file(s) for the universe.
4. **Propose changes**: for each 🔴 and 🟡 pattern, generate a specific improvement:
   - Show: current rule text (or "not currently defined")
   - Show: improved rule text with concrete examples
   - Estimate impact: affected chapters count, score improvement per persona
5. **Validate pattern-by-pattern**: present each proposed change with options `[Apply] [Modify] [Skip]`. Wait for user decision on each.
6. For each approved change:
   - Update the relevant section of `<univers>/.output-styles/<univers>-<type>.md`.
   - Increment version: minor fix → X.Y+1, structural change → X+1.0.
7. Write updated output-style file(s).
8. Create/append changelog entry to `.docs/output-style-changelog.md`.
9. Generate remediation plan: which chapters need re-processing with `doctor`, which should be re-evaluated with `comment`.

## Test

After `improve <univers> --improve-from-feedback`, verify that the output-style file's version has incremented, `.docs/output-style-changelog.md` contains an entry for today's date, and the remediation plan lists at least one chapter to re-process.
