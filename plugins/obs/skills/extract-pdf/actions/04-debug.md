# 04 - Debug

Diagnose the extraction pipeline anomalies: missing chunks, garbled text, classification errors, `progress.md` inconsistencies.

## Inputs

- `project_dir` (required) — the work-unit / writing project directory (`R/<AAAA>/<MM>/<projet>/`), or any directory under the `R` domain. `R` discovered locally (generic: walk up to a `Perso`/`Pro` segment, subcategory = `R`; JDR profile shortcut: walk up to one of the markers `_campagnes/`, `_univers/` or `_pjs/`).
- `source_name` (required) — name of the source PDF without extension (e.g. `engrenages-regles`). If several extractions exist in `docs/extraction/`, list the available folders and ask the user.
- `chunk_id` (optional) — specific chunk to debug (e.g. `03`); if omitted, full audit

## Outputs

```markdown
# Extraction Debug Report: <source-name>

**Date:** YYYY-MM-DD
**Scope:** [Full audit / Chunk 03]

## Environment
- pdftotext: [available/missing]
- tesseract: [available/missing]
- pdfplumber: [available/missing]
- pypdf: [available/missing]

## Progress Status
- Chunks: X done, Y pending, Z failed
- Last activity: [date]

## Issues Found

### [CHUNK-03] Texte garbled
- >30% caractères non-printable détectés
- Recommandation : utiliser tesseract OCR

### [CLASSIFIED] Doublons
- "saidin" dans terminology.md lignes 12 ET 47 avec définitions différentes
- Recommandation : fusionner en gardant la définition la plus longue

### [PROGRESS] Incohérence
- le chunk id 03 marqué `done` mais raw/chunk_03.txt est vide
- Recommandation : réinitialiser à `pending` et retraiter

## Recommended Actions
1. [action avec commande exacte]
2. [action]
```

## Process

1. Check the available tools (pdftotext, tesseract, pdfplumber, pypdf).
2. Discover `R` (generic: walk up from the reference directory to a `Perso`/`Pro` segment, subcategory = `R`; JDR profile shortcut: walk up to one of the markers `_campagnes/`, `_univers/` or `_pjs/`) and detect the profile (JDR if `R/bank.yml` has `profile: jdr` or `R` contains `_univers/`/`_systeme/`); read `<target>` in `progress.md#Univers`. Generic core: `<target-root>` = `R/_<target>/` (or the work-unit dir), sources under `<target-root>/sources/`. JDR profile: `<univers-root>` = `R/_univers/<target>/`, `<systeme-root>` = `R/_systeme/`. Everything lives under the same `R` repository (a single `git -C "<R>"`).
3. Read `docs/extraction/<source-name>/progress.md`. Parse the table: `pending/done/failed` statuses, dates.
4. Check for suspect git stashes (single repository = `R`):
   ```bash
   git -C "<R>" stash list
   ```
5. **If `chunk_id` is specified** → focus on that chunk. Otherwise → full audit.
6. **File integrity**:
   - For each `done` chunk: verify that the PDF `docs/extraction/<source-name>/chunks/*_part<XX>_*.pdf` AND `docs/extraction/<source-name>/raw/chunk_XX.txt` exist and are non-empty.
   - For each `pending` chunk: verify that the PDF `docs/extraction/<source-name>/chunks/*_part<XX>_*.pdf` exists.
   - For each `failed` chunk: note the known error.
7. **Raw text quality**:
   ```python
   from pathlib import Path
   txt = Path('docs/extraction/<source-name>/raw/chunk_XX.txt').read_text(encoding='utf-8')
   non_print = sum(1 for c in txt if not c.isprintable() and c not in '\n\r\t')
   ratio = non_print / len(txt) if txt else 0
   print(f'Non-printable ratio: {ratio:.1%}')
   ```
8. **Classified files**:
   - List the files, their size and the number of YAML markers (`chunk:` count).
   - Detect section duplicates.
9. **progress.md consistency**: compare the statuses with the actual state of the files. Report any discrepancy.
10. **Repair actions** proposed:
    - Reset a `failed` chunk → `pending`: edit `progress.md` manually.
    - Re-extract a chunk: delete `docs/extraction/<source-name>/raw/chunk_XX.txt`, set back to `pending`, re-run.
    - Clean an obsolete stash: `git -C "<R>" stash drop`.
    - Start over from scratch: `python -c "import shutil; shutil.rmtree('docs/extraction/<source-name>')"`.
11. Produce the debug report with all the anomalies and recommended actions.

## Test

After `debug <project_dir> <source_name>` on an extraction with a known inconsistency (chunk `done` with empty `raw/`), verify that the report flags the inconsistency and recommends the correction command.
