# 01 - Upgrade

Analyze a written artifact, identify weaknesses, propose targeted improvements, and rewrite the improved version after user validation.

## Inputs

- `<file>` (required, positional) — path to the artifact to improve. Typically `<output>/chapters/chapter-<NN>.md` (2-digit chapter number) or a workshop prompt file. Also accepts "last output" or "last response" to target the most recently generated content.
- `--brief <brief>` (optional) — path to the brief directory. When provided, loads `<brief>/summary.md` and `<brief>/output-styles/` for style consistency checks. Never reads outside `<brief>/`.
- `--focus <aspect>` (optional) — specific aspect to target (e.g. "tone", "structure", "clarity", "the opening").

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

1. Load the artifact. If it's a file path → read it. If the path does not exist, report this to the user and stop — never fabricate content for a file that isn't there. If it's "last output" or "last response" → use the most recently generated content.
2. If `--brief` is provided → load `<brief>/summary.md` and `<brief>/output-styles/` for style reference. Never read outside `<brief>/`.
3. **Analyze**: identify what works (preserve these), what is weak (structure, tone, clarity, precision, style consistency), and what is missing.
4. If `--focus` is specified: prioritize the analysis on that aspect while noting other issues.
5. **Propose improvements**: list 3–5 specific, actionable changes with rationale. Avoid generic advice ("make it better") — name exact passages, line ranges, or structural issues. If the artifact genuinely has fewer than 3 real weaknesses, propose only those — never pad the list with invented or trivial nitpicks to reach the quota.
6. Present the analysis to the user. Ask: "Should I apply these improvements? Any changes to my proposal?"
7. **Rewrite**: apply the approved improvements. Preserve the original's voice, intent, and overall structure unless explicitly directed otherwise.
8. Display the improved version in full.
9. If it's a file → ask: "Save to `<original-path>`?" Save on confirmation.
10. If the artifact has a `version:` frontmatter field → increment it (append to the `changelog:` block if present).

## Test

After `upgrade <output>/chapters/chapter-01.md`, verify that the displayed improved version differs from the original and the analysis report lists at least 2 specific weaknesses with text citations.
