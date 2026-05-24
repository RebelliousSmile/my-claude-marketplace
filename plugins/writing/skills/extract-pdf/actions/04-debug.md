# 04 - Debug

Diagnose anomalies in the PDF extraction pipeline: missing chunks, garbled text, classification errors, progress inconsistencies.

## Inputs

- `project_path` (required) — string, format `<univers>/<projet>`
- `chunk_id` (optional) — specific chunk to debug (e.g. `03`); if omitted, audits the full extraction

## Outputs

```markdown
# Extraction Debug Report: <source-name>

**Date:** YYYY-MM-DD
**Scope:** [Full audit / Chunk 03]

## Progress State
- Total chunks: N
- Done: M
- TODO: P
- Missing chunk files: [list]

## Anomalies Found

### [CHUNK-03] Garbled text
- Lines 15-42: encoding issue detected (likely scanned image page)
- Recommendation: manually extract or skip

### [CLASSIFIED] Duplicate entries
- "saidin" appears in terminology.md lines 12 AND 47 with conflicting definitions
- Recommendation: merge, keeping longer definition

### [PROGRESS] Inconsistency
- chunk-03 marked DONE in progress.md but chunks/chunk-03.txt is empty
- Recommendation: re-process chunk 03

## Recommended Actions
1. [action with exact command]
2. [action]
```

## Process

1. Read `docs/extraction/<source-name>/progress.md`. Parse chunk table: list all chunks, their status, and session notes.
2. If `chunk_id` specified → focus debug on that chunk. Else → full audit.
3. **Check file integrity**:
   - For each chunk marked `DONE`, verify the chunk file (`chunks/chunk-<NN>.txt`) exists and is non-empty.
   - For each chunk marked `TODO`, verify the chunk file exists (may be empty for text TBD).
4. **Check classified files**:
   - For each `classified/*.md` file, scan for duplicate entries (same term/name appearing twice with different descriptions).
   - Check for obviously garbled text (encoding artifacts, repeated characters, missing words).
5. **Check progress consistency**: compare progress.md statuses against actual file states. Flag any mismatch.
6. **Check merge readiness**: if all chunks are DONE, verify classified files are non-empty for at least the major categories (terminology, lore).
7. Produce the debug report with all anomalies found and recommended actions.
8. If specific fix actions are possible (e.g., re-processing a chunk, merging duplicates) → offer to execute them.

## Test

After `debug <project_path>` on an extraction with a known inconsistency (e.g., a chunk marked DONE but with empty file), verify that the report flags the inconsistency and recommends the correct fix command.
