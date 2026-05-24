# 01 - Setup

Session 1 of the PDF extraction pipeline: validate environment, read and chunk the PDF, write `progress.md`.

## Inputs

- `project_path` (required) — string, format `<univers>/<projet>`
- `source_document` (required) — path to the PDF or source file to extract

## Outputs

```
docs/extraction/<source-name>/
  progress.md       — tracking file with chunk list and status
  chunks/
    chunk-01.txt    — first chunk (raw extracted text)
    chunk-02.txt
    ...
```

`progress.md` format:
```markdown
# Extraction Progress: <source-name>

**Project:** <univers>/<projet>
**Source:** <source-document>
**Total chunks:** N
**Date started:** YYYY-MM-DD

## Chunks

| Chunk | Pages | Status | Session |
|-------|-------|--------|---------|
| 01    | 1-25  | TODO   | -       |
| 02    | 26-50 | TODO   | -       |
```

## Process

1. Validate `bank.yml` exists at `<project_path>/bank.yml`. If not → STOP: "Run `setup init <project_path>` first."
2. Extract from bank.yml: `univers`, `document.name`.
3. Verify the source file exists and is readable.
4. Store `<source-name>` = source filename without extension (e.g. `engrenages-regles.txt`).
5. **Validate available tools**: check if PDF text extraction is possible (note: Claude can read PDFs directly; for very large files, chunking is required).
6. Determine chunk size: for PDFs ≤50 pages → 1 chunk (process entirely in this session); for larger files → 25-page chunks.
7. Create directory `docs/extraction/<source-name>/chunks/`.
8. Read and chunk the source document. Save each chunk as `chunks/chunk-<NN>.txt`. For PDFs, extract text preserving structure (headings, tables, lists).
9. Write `docs/extraction/<source-name>/progress.md` with the chunk table (all chunks set to `TODO`).
10. Report: "Session 1 complete. N chunks created. Run `extract-pdf process-chunk <project_path> <chunk-id>` to process each chunk in subsequent sessions."

## Test

After `setup <project_path> <source-document>`, verify that `docs/extraction/<source-name>/progress.md` exists and lists at least 1 chunk with status `TODO`.
