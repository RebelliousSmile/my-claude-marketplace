# 03 - review

Run a usability and readability pass over a user guide.

## Inputs

- A draft user guide (from `02-write` or supplied).
- The product/UI for cross-checking labels and steps, when available.
- The approved outline (if available), including its assumptions/questions note — use it to cross-check claims in the draft against points already flagged there as unconfirmed.

## Process

Check, and fix in place (or report if read-only is requested):

1. **Task completeness** — can a new user finish each task using only the guide? Flag any step that assumes ungiven knowledge.
2. **Step quality** — numbered, one action each, expected result stated, imperative voice.
3. **Jargon & tone** — internal/technical terms removed or defined; no marketing words ("powerful", "easy", "seamless", "simply").
4. **Terminology consistency** — one term per concept; UI labels match the product exactly.
5. **Structure & scannability** — goal-titled sections, headings, short paragraphs, troubleshooting as symptom→cause→fix.
6. **Truthfulness** — no invented features/behavior; visuals are real or marked as `[screenshot: …]` placeholders; if the outline's assumptions note already flagged a behavior as unconfirmed, it must not stand in the draft as a plain fact.
7. **Style compliance** — matches the active output style (default `${CLAUDE_PLUGIN_ROOT}/skills/user-guide/references/output-style.md`, or the `--style <path>` override): voice, tense, callout format, headings.

Only raise a finding where one of the checks above is actually violated — do not pad the list with issues a passage doesn't have.

## Outputs

The revised guide (or a findings list if review-only), with a short summary of what changed and any remaining open question.

## Test

Every task is self-contained, no banned marketing terms remain, terminology is consistent with the UI, and any unverifiable claim is removed or flagged.
