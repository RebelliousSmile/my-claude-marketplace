# 05 - Run

Autonomous extraction loop: find the next TODO chunk in `progress.md`, extract it, save classified output, update tracking. Resume where the previous session left off without any user input on chunk numbering.

## Inputs

- No required arguments.
- Optional: `<source-name>` — if multiple extractions are in progress, specify which one to continue.

## Depends on

- `setup` (progress.md must exist)

## Outputs

One chunk processed per invocation, appended to the in-progress extraction under `.docs/extraction/<source-name>/`:
- `.docs/extraction/<source-name>/classified/*.md` — classified content appended for the processed chunk, each session's contribution prefixed with `<!-- chunk-XX : pages A–B -->`. Files are created if they do not exist.
- `.docs/extraction/<source-name>/progress.md` — updated state: the processed chunk's status changes from `TODO` to `DONE (YYYY-MM-DD)` (or `SKIP (illustrations)` for illustration/blank pages), and the "Fichiers classifiés produits" section lists any new or updated files.

## Process

1. **Locate progress.md**: search `.docs/extraction/*/progress.md` from the project root.
   - 0 found → STOP: "No extraction in progress. Run `extract-pdf setup` first."
   - 1 found → use it.
   - 2+ found → list available source names and ask the user which to continue (unless `<source-name>` was passed as argument).

2. **Read progress.md**: find the first chunk with status `TODO`.
   - None found → "All chunks are done. Run `extract-pdf distribute` to merge into universe docs." STOP.

3. **Read the PDF**: read the page range for the identified chunk from the source declared in `progress.md`. Maximum 20 pages per Read call; split into multiple calls if the chunk spans more than 20 pages.

4. **Pass 1 — Read and understand**: read the full chunk without writing anything. Identify content categories present (rules, terminology, lore, locations, characters, timeline).

5. **Pass 2 — Extract and classify**: for each category detected, extract structured content. Rules: exact numerical values only — never invent. Lore: quote the source text where relevant.

6. **Verify**: confirm each extracted item is present in the pages read. Discard anything not directly supported by the source.

7. **Save**: append extracted content to `.docs/extraction/<source-name>/classified/*.md`. Create files if they don't exist. Prefix each session's contribution with:
   ```markdown
   ---
   <!-- chunk-XX : pages A–B -->
   ```

8. **Update progress.md**: change the chunk's status from `TODO` to `DONE (YYYY-MM-DD)`. Update the "Fichiers classifiés produits" section with any new files created or updated.

9. **Report**:
   ```
   ✓ Chunk XX (pages A–B) — done.
   Saved: [list of classified files written]
   Chunks remaining: K / N
   → Run /obs:extract-pdf run to continue.
   ```

## Rules

- **One chunk per session.** Stop after processing one chunk, regardless of how many remain.
- NEVER invent content not present in the source PDF.
- If a chunk's pages contain only illustrations or blank pages → mark `SKIP (illustrations)` in progress.md and report; do not create empty classified files.
- Do not ask for user validation before saving — the `run` action is designed for autonomous operation. Surface anomalies in the report instead.

## Test

After `run`, verify that `progress.md` shows exactly one additional chunk marked `DONE` compared to the previous session, and that at least one `classified/*.md` file has been updated.
