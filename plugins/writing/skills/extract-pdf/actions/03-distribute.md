# 03 - Distribute

Final session: merge classified extraction content into project universe documentation files.

## Inputs

- `project_path` (required) — string, format `<univers>/<projet>`

## Depends on

- `setup`, `process-chunk` (all chunks marked DONE)

## Outputs

Updated universe documentation files:
- `<univers>/.docs/UNIVERS.md` — enriched with lore and historical content
- `<univers>/.docs/terminologie.md` — enriched with extracted terminology
- `<univers>/.docs/personnages.md` — enriched with character profiles
- `<univers>/.docs/lieux.md` — enriched with location descriptions
- `<univers>/.rules-files/<name>.md` — enriched with rules content (if applicable)

## Process

1. Read `docs/extraction/<source-name>/progress.md`. Verify all chunks are `DONE`. If any chunk is still `TODO` → STOP: "Chunks [list] not yet processed. Run `process-chunk` for each before distributing."
2. Load all `classified/*.md` files.
3. Load existing universe docs from `bank.yml`.
4. **Merge strategy for each category**:
   - **Terminology** (`classified/terminology.md` → `<univers>/.docs/terminologie.md`): append new terms, skip duplicates, update descriptions if richer information found.
   - **Characters** (`classified/characters.md` → `<univers>/.docs/personnages.md`): add new profiles, enrich existing profiles with new information.
   - **Locations** (`classified/locations.md` → `<univers>/.docs/lieux.md`): same merge strategy.
   - **Lore** (`classified/lore.md` → `<univers>/.docs/UNIVERS.md`): append to relevant sections, flag contradictions with existing content.
   - **Rules** (`classified/rules.md` → appropriate `<univers>/.rules-files/` file): add new mechanics, preserve existing entries.
5. Flag contradictions: any extracted content that contradicts existing docs → present to user for resolution.
6. Present merge plan: "Will update N files, add M entries, flag P contradictions. Confirm?"
7. Apply merges after confirmation. Write all updated files.
8. Mark `progress.md` status as `COMPLETE — distributed on YYYY-MM-DD`.
9. Report: files updated, entries added, contradictions flagged, suggested next steps.

## Test

After `distribute <project_path>` on a fully processed extraction, verify that `progress.md` shows `COMPLETE`, and at least one universe doc has been updated with content from the classified files.
