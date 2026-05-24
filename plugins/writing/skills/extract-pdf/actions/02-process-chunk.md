# 02 - Process Chunk

Sessions 2-N: extract and classify content from one chunk into `classified/*.md` files.

## Inputs

- `project_path` (required) — string, format `<univers>/<projet>`
- `chunk_id` (required) — chunk identifier (e.g. `01`, `02`)

## Depends on

- `setup`

## Outputs

One or more classified files in `docs/extraction/<source-name>/classified/`:
```
classified/
  characters.md       — extracted character descriptions
  locations.md        — places and geography
  terminology.md      — concepts, powers, mechanics, vocabulary
  rules.md            — game rules, mechanics, statblocks
  lore.md             — historical, cultural, world-building content
  timeline.md         — chronological events
```

Updated `progress.md` with chunk status changed from `TODO` to `DONE (session N)`.

## Process

1. Read `docs/extraction/<source-name>/progress.md`. Find chunk `<chunk_id>`. If already `DONE` → warn user and confirm re-processing.
2. Load `docs/extraction/<source-name>/chunks/chunk-<chunk_id>.txt`.
3. Load `bank.yml` for universe context.
4. **Pass 1 — Read and understand**: read the full chunk without writing anything. Identify content categories present (characters, locations, terminology, rules, lore, timeline).
5. **Pass 2 — Classify and extract**: for each content category detected:
   - Characters: name, description, role, affiliations, distinguishing features.
   - Locations: name, description, climate, cultural significance.
   - Terminology: term, definition, usage notes, source context.
   - Rules: mechanic name, description, numerical values (exact — never invent), example of use.
   - Lore: event, context, significance, timeline position if known.
6. **Verify against source**: for each extracted item, confirm its presence in the chunk text. Never invent or extrapolate.
7. Present the extracted content summary to the user: "Found N characters, M locations, P terms, Q rules. Proceed to save?"
8. Append extracted content to the appropriate `classified/*.md` files. Create files if they don't exist. Use consistent headers.
9. Update `progress.md`: mark chunk `<chunk_id>` as `DONE (session <current>)`.
10. Report remaining chunks and suggest: `extract-pdf process-chunk <project_path> <next_chunk_id>`.

## Test

After `process-chunk <project_path> 01`, verify that `progress.md` shows chunk 01 as `DONE` and at least one `classified/*.md` file has been created with non-empty content.
