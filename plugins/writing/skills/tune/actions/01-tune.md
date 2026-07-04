# 01 - Tune

Walk a document chunk by chunk with the user: present each chunk, apply their remarks on style/form/substance, resubmit the corrected chunk, and repeat until they're satisfied — then move to the next chunk.

## Inputs

- `file` (required) - positional, path to the `.md` document to walk through
- `--brief <brief>` (optional) - project brief directory; `<brief>/summary.md` and `<brief>/output-styles/` are loaded once as background context (voice, lore, terminology) — never as a trigger for a change
- `--by paragraph|section` (optional, default `section`) - chunking granularity
- `--from <chunk-id>` (optional) - resume the pass from a given chunk instead of the start. If omitted and `<file>` already carries a `<!-- TUNE: last-chunk=<id> -->` marker, ask the user whether to resume from it or restart at `chunk-01` — never assume either.

## Outputs

- `<file>`, edited in place, chunk by chunk, reflecting only the corrections the user actually requested.
- An end-of-pass summary: for each chunk, how many correction rounds it took (0 = accepted as-is).
- While paused mid-document: a `<!-- TUNE: last-chunk=<id> -->` marker at the point reached, removed once the pass completes.

## Process

1. If `--brief <brief>` is given, read `<brief>/summary.md` and `<brief>/output-styles/` once, silently. Keep this only as background context to apply the user's remarks consistently with the project's voice/lore — never announce it as a "reference" and never use it on its own to propose a change.

2. **Chunk the document**: split on `##`/`###` headings (`section` mode) or group paragraphs (`paragraph` mode, roughly 2-4 paragraphs per chunk unless natural breaks suggest otherwise). Number chunks in reading order (`chunk-01`, `chunk-02`, …).
   - If `--from <chunk-id>` is given, skip straight to that chunk.
   - Otherwise, check `<file>` for a `<!-- TUNE: last-chunk=<id> -->` marker. If found, do **not** silently resume and do **not** silently restart: tell the user a paused pass was found at `<id>` and ask whether to resume from there or start over from `chunk-01`. WAIT for their answer before proceeding.
   - If no marker and no `--from`, start at `chunk-01`.

3. **Sequential loop**, for each chunk in order:
   a. Present the chunk's full text, clearly labeled (e.g. `## chunk-04`).
   b. Ask: "Des remarques sur ce passage (style, forme, fond) ?" / "Any remarks on this passage?"
   c. **If no remarks**: accept the chunk as-is, record 0 rounds for it, advance to the next chunk.
   d. **If remarks**: apply exactly what was flagged, preserving everything else untouched. Resubmit the corrected chunk in full.
   e. Return to (b) for the same chunk. Repeat as many rounds as needed until the user has no further remarks on it.
   f. Once accepted, write the final version of the chunk into `<file>` in place (replacing that chunk's original text only — every other chunk stays byte-identical to what was already on disk), record its round count, advance to the next chunk.
   g. If the user asks to pause, write `<!-- TUNE: last-chunk=<id> -->` right after the current chunk in `<file>` and stop.
   h. If the user asks to change chunking granularity (`--by`) or re-split the document mid-pass: refuse the re-chunk and say so plainly — e.g. "Le découpage est figé pour cette passe ; termine-la ou relance `tune` avec `--by` pour repartir avec un nouveau découpage." / "Chunking is locked for this pass; finish it, or restart `tune` with a different `--by` to re-split from scratch." Then continue the loop on the current chunk as if the request hadn't been made.

4. **End of pass**: once the last chunk is reached, remove any leftover `TUNE` marker, and print a summary table — chunk id, round count, one-line description of what changed (or "accepted as-is" for 0 rounds).

## Test

Invoke on a `.md` file of at least 3 sections. On one section, give two successive rounds of remarks before accepting it; on another, give no remarks at all. Verify: `<file>` reflects only the final accepted version of the corrected section (no intermediate draft left behind), the untouched section is byte-identical to the original, and the end-of-pass summary reports 2 rounds for the corrected section and 0 for the untouched one.
