# 02 - Process Chunk

Sessions 2-N: extract the text of a PDF chunk, classify the content into `classified/*.md`.

## Inputs

- `project_dir` (required) — the work-unit / writing project directory (`R/<AAAA>/<MM>/<projet>/`), or any directory under the `R` domain. `R` discovered locally (generic: walk up to a `Perso`/`Pro` segment, subcategory = `R`; JDR profile shortcut: walk up to one of the markers `_campagnes/`, `_univers/` or `_pjs/`).
- `source_name` (required) — name of the source PDF without extension (e.g. `engrenages-regles`). Visible in `docs/extraction/` or in `progress.md#Source`.
- `chunk_id` (required) — chunk number (e.g. `01`, `02`)

## Depends on

- `setup`

## Outputs

One or more classified files in `docs/extraction/<source-name>/classified/`:
```
classified/
  lore.md             — narrative content, history, world
  terminology.md      — terms, definitions, glossary
  style.md            — tone, writing guidelines, examples
  rules.md            — rules, mechanics, stats, modifiers
  structure.md        — chapters, parts, summary, TOC
  templates.md        — LaTeX macros, patterns, commands
```

Each classified file uses YAML markers:
```markdown
---
chunk: XX
pages: N-M
extracted: YYYY-MM-DD
---

[extracted content]

---
```

`progress.md` updated: status `pending` → `done`, date in the Session column.
`raw/chunk_XX.txt`: raw text extracted from the PDF before classification. **Preserved**: it will be assembled into `<…>/sources/<source>/fulltext.md` during `distribute` (the "content of the extraction"). Never discard it before `fulltext.md` exists.

## Process

1. Read `docs/extraction/<source-name>/progress.md`. Locate the chunk whose id is `<chunk_id>`: it is the PDF `chunks/*_part<chunk_id>_*.pdf` (actual name `<source-name>_part<chunk_id>_p<début>-<fin>.pdf`). Resolve the exact path:
   ```bash
   CHUNK_PDF=$(python -c "import glob; print(glob.glob('docs/extraction/<source-name>/chunks/*_part<chunk_id>_*.pdf')[0])")
   ```
   If the chunk is already `done` in `progress.md` → warn and ask for confirmation before reprocessing.
2. **Extract the raw text** of the chunk PDF (`$CHUNK_PDF`) into `raw/chunk_<chunk_id>.txt` — try in order:

   **a) pdftotext** (preferred):
   ```bash
   pdftotext -layout "$CHUNK_PDF" - > "docs/extraction/<source-name>/raw/chunk_<chunk_id>.txt"
   ```

   **b) Python fallback** if pdftotext is absent:
   ```python
   import pdfplumber, pathlib, glob
   chunk_pdf = glob.glob("docs/extraction/<source-name>/chunks/*_part<chunk_id>_*.pdf")[0]
   with pdfplumber.open(chunk_pdf) as pdf:
       text = "\n".join(p.extract_text() or "" for p in pdf.pages)
   pathlib.Path("docs/extraction/<source-name>/raw/chunk_<chunk_id>.txt").write_text(text, encoding="utf-8")
   ```

   **c) OCR** only if the text is garbled (>30% non-printable after extraction — to measure, use `extract-pdf debug` or the Python snippet from action 04). Tesseract does not accept PDFs, convert to images first. Use `>` (overwrite) to replace any garbled raw file from steps a) or b):
   ```bash
   TMPDIR=$(python -c "import tempfile; print(tempfile.gettempdir())")
   pdftoppm -r 300 "$CHUNK_PDF" "$TMPDIR/chunk_<chunk_id>_page"
   for f in "$TMPDIR"/chunk_<chunk_id>_page*.ppm; do tesseract "$f" stdout -l fra; done \
     > "docs/extraction/<source-name>/raw/chunk_<chunk_id>.txt"
   ```

3. Verify that `docs/extraction/<source-name>/raw/chunk_<chunk_id>.txt` exists and is non-empty. If empty → re-run the extraction with the next method in the hierarchy.
4. Run `python scripts/normalize-text.py "docs/extraction/<source-name>/raw/chunk_<chunk_id>.txt" --in-place` to fix encoding artifacts.
5. Show the first 500 characters. Ask: "Continuer la classification ? [Y/n]"
6. **Pass 1 — Reading**: read the entire chunk without writing. Identify the categories present.
7. **Pass 2 — Classification**:
   - Lore: narratives, history, dates, events, places
   - Terminology: terms = definitions, glossary
   - Style: tone, writing instructions, examples to follow/avoid
   - Rules: mechanics, dice rolls, stats, modifiers (exact values — never invent)
   - Structure: chapters, summary, outline, TOC
   - Templates: LaTeX macros, `\newcommand`, reusable patterns
8. **Verify** each extracted item against the source text. Never invent or extrapolate.
9. After confirmation: write into `docs/extraction/<source-name>/classified/*.md` with the YAML markers. Create the files if they do not exist. If a file exceeds 30,000 chars → split into `lore-1.md`, `lore-2.md`, etc.
10. Update `docs/extraction/<source-name>/progress.md`: `pending` → `done`, today's date in the Session column.
11. Indicate the remaining chunks and suggest: `extract-pdf process-chunk <project_dir> <source_name> <next_chunk_id>`.

## Test

After `process-chunk <project_dir> <source_name> 01`, verify that:
- `docs/extraction/<source-name>/progress.md` shows chunk 01 in `done` status
- `docs/extraction/<source-name>/raw/chunk_01.txt` exists and is non-empty
- At least one `docs/extraction/<source-name>/classified/*.md` has been created with YAML markers
