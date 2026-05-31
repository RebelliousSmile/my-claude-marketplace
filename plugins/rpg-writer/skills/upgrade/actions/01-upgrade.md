# 01 - Upgrade

Analyze a written artifact, identify weaknesses, propose targeted improvements, and rewrite the improved version after user validation.

> Path variables: see `setup/references/vault-layout.md`.
> When the artifact is a project file, resolve its location via `<projet-root>` = `<jeu>/ecrits/<projet>/`.
> When loading universe context (docs, terminologie), read from `<univers-root>/canon/`.

## Inputs

- `artifact` (required) — file path OR reference to "last output" or "last response" — the artifact to improve
- `focus` (optional) — specific aspect to target (e.g. "tone", "structure", "clarity", "the opening")

## Outputs

The improved artifact, displayed in full. If the artifact is a file, also saves it in place (after user confirmation).

Analysis report:
```
Upgrade Report: [artifact]

## What Works
- [strength 1]
- [strength 2]

## Weaknesses Identified
1. [weakness with specific location/citation]
2. [weakness]

## Proposed Improvements
1. [specific change with rationale]
2. [specific change]

## Version
Before: [brief characterization]
After: [brief characterization of improvement]
```

## Process

1. Load the artifact. If it's a file path → read it. If it's "last output" or "last response" → use the most recently generated content.
2. **Analyze**: identify what works (preserve these), what is weak (structure, tone, clarity, precision, style consistency), and what is missing.
3. If `focus` is specified: prioritize the analysis on that aspect while noting other issues.
4. **Propose improvements**: list 3–5 specific, actionable changes with rationale. Avoid generic advice ("make it better") — name exact passages, line ranges, or structural issues.
5. Present the analysis to the user. Ask: "Should I apply these improvements? Any changes to my proposal?"
6. **Rewrite**: apply the approved improvements. Preserve the original's voice, intent, and overall structure unless explicitly directed otherwise.
7. Display the improved version in full.
8. If it's a file → ask: "Save to `<original-path>`?" Save on confirmation.
9. If the artifact has a `version:` frontmatter field → increment it (append to the `changelog:` block if present).

## Test

After `upgrade <path/to/chapter.md>`, verify that the displayed improved version differs from the original and the analysis report lists at least 2 specific weaknesses with text citations.
