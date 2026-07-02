# 03 - Distribute

Final session: pour the classified content into the **reference sources** of the universe and the system, with git stash/rollback.

> **Boundary**: `extract-pdf` writes only into `sources/` — never into `canon/` or `mj/` directly.
> The ventilation into `canon/` is handled by `ttrpg:lore-extract` (lore) and `ttrpg:rules-keeper` (rules).
> See `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md` for the full convention.

## Inputs

- `project_dir` (required) — the writing project directory (`R/<AAAA>/<MM>/<projet>/`), or any directory under the `R` domain. `R` discovered by walking up to one of the markers `_campagnes/`, `_univers/` or `_pjs/`.
- `source_name` (required) — name of the source PDF without extension (e.g. `engrenages-regles`). If there are several folders in `docs/extraction/`, list the available folders and ask the user.

## Depends on

- `setup`, `process-chunk` (all chunks in `done` status)

## Outputs

Reference sources created or enriched:
- `<univers-root>/sources/<source>/fulltext.md` — **full raw text** normalized (the "content of the extraction"; assembled from the chunks, preserved)
- `<univers-root>/sources/<source>/lore.md` — narrative reference content (input bundle for `ttrpg:lore-extract`)
- `<univers-root>/sources/<source>/terminology.md` — extracted terminology (input bundle for `ttrpg:lore-extract`)
- `<systeme-root>/sources/<source>/fulltext.md` — full raw text (if rules were extracted)
- `<systeme-root>/sources/<source>/rules.md` — extracted rules (input bundle for `ttrpg:rules-keeper`)
- `<univers-root>/.output-styles/<univers>-<source>.md` — style guidelines (convenience artifact)
- `.toc/INDEX.md` — extracted structure (convenience artifact, in the project)

## Process

1. Read `docs/extraction/<source-name>/progress.md`. Verify that **all** chunks are `done`.
   - If any chunks are `pending` or `failed` → STOP: "Chunks [liste] non traités."
2. **Resolve the paths locally**:
   - `<univers>` = slug read from `progress.md#Univers` (e.g. `spire`).
   - **Discover `R`**: start from the reference directory (`<project_dir>` or CWD), walk up the parents to the first folder containing one of the markers `_campagnes/`, `_univers/` or `_pjs/`. That folder is `R`.
   - `<univers-root>` = `R/_univers/<univers>/`
   - `<systeme-root>` = `R/_systeme/`
   - Verify that `<univers-root>` and `<systeme-root>` exist. Otherwise → STOP with the missing path.
   - `R` is a self-contained directory: universe, system and project all live under `R`, hence in the **same repository** — a single stash suffices. If `R` is not versioned, skip the git steps.
3. Compute the total size of `docs/extraction/<source-name>/classified/*.md`. If > 80,000 chars → warn, suggest batch processing.
4. **Git stash** before any modification (single repository = `R`):
   ```bash
   git -C "<R>" stash push -m "pre-extraction-<source-name>"
   ```
   > If the repository has no uncommitted changes, `git stash push` prints "No local changes to save" (exit 0) — do not call `stash drop` at end of session in that case. Check with `git -C "<R>" stash list | grep -q "pre-extraction-<source-name>"` before each `stash drop`.
5. Load and merge the classified files (remove the YAML markers, deduplicate the sections).
6. For each category, display a preview (500 chars) and **wait for user approval** before writing.

   | Classified | Destination | Action |
   |------------|-------------|--------|
   | `raw/chunk_*.txt` (assembled) | `<univers-root>/sources/<source-name>/fulltext.md` (+ `<systeme-root>/…` if rules) | create — **full raw, never discard** |
   | `lore*.md` | `<univers-root>/sources/<source-name>/lore.md` | create/append |
   | `terminology*.md` | `<univers-root>/sources/<source-name>/terminology.md` | create/merge |
   | `rules*.md` | `<systeme-root>/sources/<source-name>/rules.md` | create/append |
   | `style*.md` | `<univers-root>/.output-styles/<univers>-<source-name>.md` | create |
   | `structure*.md` | `.toc/INDEX.md` | create/update |
   | `templates*.md` | `<univers-root>/.templates/latex-patterns.md` | append |

   > Lore and terminology → `<univers-root>/sources/<source-name>/` (universe reference).
   > Rules → `<systeme-root>/sources/<source-name>/` (system reference).
   > Never write into `canon/` or `mj/` — that is the role of `ttrpg:lore-extract` and `ttrpg:rules-keeper`.

7. After user validation (`Y`): create the `sources/<source-name>/` folders if absent, write the files, commit (single repository = `R`):
   ```bash
   # Create the destination folders if necessary
   python -c "
   from pathlib import Path
   for d in ['<univers-root>/sources/<source-name>', '<systeme-root>/sources/<source-name>']:
       Path(d).mkdir(parents=True, exist_ok=True)
   "
   # Single repository R — paths relative to R: _univers/<univers>/, _systeme/, and the project's .toc
   git -C "<R>" add \
     "_univers/<univers>/sources/<source-name>/" \
     "_univers/<univers>/.output-styles/" \
     "_univers/<univers>/.templates/" \
     "_systeme/sources/<source-name>/" \
     "<project_dir>/.toc/"
   git -C "<R>" commit -m "Extract sources: <source-name>"
   git -C "<R>" stash list | grep -q "pre-extraction-<source-name>" && \
     git -C "<R>" stash drop
   ```
8. If the user chooses `n` (rollback):
   ```bash
   git -C "<R>" checkout . && git -C "<R>" stash pop
   ```
9. Generate the distribution report (see prompt `extract-distribute.prompt.md`).
10. Cleanup — **preserve the raw first**:
    1. Assemble the normalized raw text of the chunks (`docs/extraction/<source-name>/raw/chunk_*.txt`, in order) into a single `fulltext.md` (with a provenance header) and write it into each populated `sources/<source-name>/` — `<univers-root>/sources/<source-name>/fulltext.md`, and `<systeme-root>/sources/<source-name>/fulltext.md` if rules were extracted.
    2. **Only after** `fulltext.md` is written: delete the working folder `docs/extraction/<source-name>/chunks/`, `…/raw/`, `…/classified/` (the classified bundles have been merged into `sources/`).
    3. Rename `docs/extraction/<source-name>/progress.md` → `docs/extraction/<source-name>/DONE-YYYY-MM-DD.md`.

    > Never delete `raw/` without having first written `fulltext.md`: it is the only verbatim copy of the document.

## Next steps (suggest to the user)

Once the sources are created, run the ventilation into canon:
- **Lore**: `ttrpg:lore-extract <univers-root>/sources/<source-name>/lore.md` → feeds `<univers-root>/canon/`
- **Rules**: `ttrpg:rules-keeper restructure <systeme-root>/sources/<source-name>/rules.md` → feeds `<systeme-root>/canon/`

## Test

After `distribute <project_dir> <source_name>` on a complete extraction, verify that:
- `docs/extraction/<source-name>/DONE-YYYY-MM-DD.md` exists (progress.md archived)
- `<univers-root>/sources/<source-name>/fulltext.md` exists and is non-empty (raw text preserved)
- `<univers-root>/sources/<source-name>/lore.md` and/or `terminology.md` have been created
- `<systeme-root>/sources/<source-name>/rules.md` has been created (if rules were present)
- No file has been written into `canon/` or `mj/`
- The folders `docs/extraction/<source-name>/chunks/`, `raw/`, `classified/` have been deleted
