# 01 - Setup

Session 1 of the PDF extraction pipeline: validate the environment, split the PDF into chunks via `split-pdf.py`, write `progress.md`.

## Inputs

- `project_dir` (required) — the work-unit / writing project directory (`R/<AAAA>/<MM>/<projet>/`), or any directory under an `R` domain. This is the reference directory; `R` is discovered from it (generic: walk up to a `Perso`/`Pro` segment, the subcategory level is `R`; JDR profile shortcut: walk up to one of the markers `_campagnes/`, `_univers/` or `_pjs/`).
- `source_document` (required) — path to the source PDF
- `target` (required) — slug (`kebab-case`) of the destination where the sources will land. **JDR profile**: the target universe → `<univers-root> = R/_univers/<univers>/`. **Generic core**: the target bucket/scope → `<target>/sources/`. Recorded as the `Univers` field of `progress.md`. Ask the user if not provided.

## Outputs

```
docs/extraction/<source-name>/
  progress.md         — tracking file with the list of chunks and statuses
  chunks/
    <source>_part01_p1-25.pdf   — first chunk (split PDF, 25 pages max)
    <source>_part02_p26-50.pdf
    ...
  raw/                — folder created empty, filled during process-chunk (raw/chunk_<NN>.txt)
  classified/         — folder created empty, filled during process-chunk
```

`progress.md` format:
```markdown
# Extraction Progress: <source-name>

**Source:** <source_document>
**Project:** <project_dir>
**Univers:** <target>
**Total chunks:** N
**Date started:** YYYY-MM-DD

## Chunks

| Chunk | Pages | Chars | Status | Session |
|-------|-------|-------|--------|---------|
| <source>_part01_p1-25.pdf | 1-25 | ~12500 | pending | - |
| <source>_part02_p26-50.pdf | 26-50 | ~12500 | pending | - |
```

> Valid statuses: **`pending`** / **`done`** / **`failed`**. Never `TODO` or `DONE`.
> `Chunk` column = the ACTUAL file name produced by `split-pdf.py`: `<source>_part<NN>_p<début>-<fin>.pdf`. The `<chunk_id>` (argument of `process-chunk`) is the zero-padded `<NN>`.
> `Univers` field = the destination slug (`<target>`): the universe slug under the JDR profile, the target bucket/scope slug in the generic core.

## Process

1. **Discover `R`** and **detect the profile**: start from the reference directory (`<project_dir>` or CWD).
   - **Generic core**: walk up to a `Perso`/`Pro` segment; the **subcategory** level is `R` (the `obs:tree` anchor). No marker required.
   - **JDR profile shortcut**: walk up the parents to the first folder containing one of the markers `_campagnes/`, `_univers/` or `_pjs/`; that folder is `R`.
   - **Profile**: JDR if `R/bank.yml` declares `profile: jdr` or `R` contains `_univers/`/`_systeme/`; otherwise generic core.
   - If no `R` can be resolved at all (no `Perso`/`Pro` anchor and no JDR marker) → STOP: "Cible hors d'un domaine initialisé (ni ancre `Perso`/`Pro`, ni marqueur JDR en remontant). Initialiser `R` d'abord." See `references/domain-layout.md` (§ JDR profile for the JDR marker rules).
2. Determine the target `<target>` (`kebab-case` slug); if absent, ask the user.
   - **JDR profile**: `<target>` = universe slug → verify or plan `<univers-root> = R/_univers/<target>/`.
   - **Generic core**: `<target>` = destination bucket/scope → verify or plan `<target>/sources/`.
3. Verify that `<source_document>` exists and is readable (`%PDF-` header).
4. `<source-name>` = the file name without extension.
5. Check the available tools: `pdftotext`, `tesseract`, `pdfplumber`, `pypdf`. Verify that the scripts exist:
   - `scripts/split-pdf.py` — **required** for this session. If absent → STOP: "Script manquant : scripts/split-pdf.py. Copiez-le depuis le dossier `scripts/` du skill `extract-pdf` dans l'overlay."
   - `scripts/normalize-text.py` — used during `process-chunk`. If absent → WARN: "scripts/normalize-text.py manquant — l'étape de normalisation sera ignorée lors des extractions." Do not block setup.
6. Create the `chunks/`, `raw/`, `classified/` folders under `docs/extraction/<source-name>/`.
7. Estimate the split: `python scripts/split-pdf.py <source_document> --estimate`
8. Split the PDF: `python scripts/split-pdf.py <source_document> --pages-per-chunk 25 --output-dir docs/extraction/<source-name>/chunks/`
9. For each chunk created, note the pages and estimated characters (~2500/page).
10. Write `docs/extraction/<source-name>/progress.md` with the exact format above.
11. Verify that `docs/prompts/workshop/` contains `extract.prompt.md`, `extract-chunk.prompt.md`, `extract-distribute.prompt.md`, `extract-debug.prompt.md`. If files are missing → report: "Les prompts suivants sont manquants : [liste]. Copiez-les depuis le dossier `prompts/` du skill `extract-pdf` dans l'overlay." Do not attempt to copy them automatically.
12. Report: "Phase A terminée. N chunks créés. Lancer `extract-pdf process-chunk <project_dir> <source_name> 01`."

## Test

After `setup <project_dir> <source_document>`, verify that:
- `docs/extraction/<source-name>/progress.md` exists with at least 1 chunk in `pending` status
- the first chunk exists in `docs/extraction/<source-name>/chunks/` (e.g. `<source>_part01_p1-25.pdf`)
