# 03 - Distribute

Final session: pour the classified content into the **raw reference sources** (`<target>/sources/<source>/`), with git stash/rollback.

> **Boundary**: `extract-pdf` writes only into `sources/` — never into the synthesized layer (`reference/` generically, `canon/`/`mj/` under the JDR profile).
> The ventilation into the synthesized layer is a downstream role — under the JDR profile: `ttrpg:lore-extract` (lore) and `ttrpg:rules-keeper` (rules) produce `canon/`.
> See `${CLAUDE_PLUGIN_ROOT}/references/domain-layout.md` for the generic convention (§ JDR profile for the JDR routing; full JDR game layout: the `ttrpg` plugin's `references/jdr-layout.md`).

## Inputs

- `project_dir` (required) — the work-unit / writing project directory (`R/<AAAA>/<MM>/<projet>/`), or any directory under the `R` domain. `R` discovered locally (generic: walk up to a `Perso`/`Pro` segment, subcategory = `R`; JDR profile shortcut: walk up to one of the markers `_campagnes/`, `_univers/` or `_pjs/`).
- `source_name` (required) — name of the source PDF without extension (e.g. `engrenages-regles`). If there are several folders in `docs/extraction/`, list the available folders and ask the user.

## Depends on

- `setup`, `process-chunk` (all chunks in `done` status)

## Outputs

Raw reference sources created or enriched. Destinations resolve by profile:
- **Generic core** — a single target `<target>/sources/<source>/`:
  - `<target>/sources/<source>/fulltext.md` — **full raw text** normalized (the "content of the extraction"; assembled from the chunks, preserved)
  - `<target>/sources/<source>/lore.md`, `terminology.md`, `rules.md`, … — extracted reference bundles (input for downstream ventilation into `reference/`)
- **JDR profile** — split by provenance across universe and system:
  - `<univers-root>/sources/<source>/fulltext.md` — full raw text
  - `<univers-root>/sources/<source>/lore.md` — narrative reference content (input bundle for `ttrpg:lore-extract`)
  - `<univers-root>/sources/<source>/terminology.md` — extracted terminology (input bundle for `ttrpg:lore-extract`)
  - `<systeme-root>/sources/<source>/fulltext.md` — full raw text (if rules were extracted)
  - `<systeme-root>/sources/<source>/rules.md` — extracted rules (input bundle for `ttrpg:rules-keeper`)
- Convenience artifacts (both profiles): `<target-root>/.output-styles/<target>-<source>.md` — style guidelines; `.toc/INDEX.md` — extracted structure (in the project).

## Process

1. Read `docs/extraction/<source-name>/progress.md`. Verify that **all** chunks are `done`.
   - If any chunks are `pending` or `failed` → STOP: "Chunks [liste] non traités."
2. **Resolve the paths locally and detect the profile**:
   - `<target>` = slug read from `progress.md#Univers` (e.g. `rouages`).
   - **Discover `R`**: start from the reference directory (`<project_dir>` or CWD). Generic: walk up to a `Perso`/`Pro` segment; the subcategory level is `R`. JDR profile shortcut: walk up to the first folder containing one of the markers `_campagnes/`, `_univers/` or `_pjs/`; that folder is `R`.
   - **Profile**: JDR if `R/bank.yml` declares `profile: jdr` or `R` contains `_univers/`/`_systeme/`; otherwise generic core.
   - **Generic core**: `<target-root>` = `<target>` resolved to a working-dir bucket (`R/_<target>/`) or the work-unit directory; sources → `<target-root>/sources/<source>/`. Verify `<target-root>` exists. Otherwise → STOP with the missing path.
   - **JDR profile**: `<univers-root>` = `R/_univers/<target>/`, `<systeme-root>` = `R/_systeme/`. Verify that `<univers-root>` and `<systeme-root>` exist. Otherwise → STOP with the missing path.
   - `R` is a self-contained directory: all destinations live under `R`, hence in the **same repository** — a single stash suffices. If `R` is not versioned, skip the git steps.
3. Compute the total size of `docs/extraction/<source-name>/classified/*.md`. If > 80,000 chars → warn, suggest batch processing.
4. **Git stash** before any modification (single repository = `R`):
   ```bash
   git -C "<R>" stash push -m "pre-extraction-<source-name>"
   ```
   > If the repository has no uncommitted changes, `git stash push` prints "No local changes to save" (exit 0) — do not call `stash drop` at end of session in that case. Check with `git -C "<R>" stash list | grep -q "pre-extraction-<source-name>"` before each `stash drop`.
5. Load and merge the classified files (remove the YAML markers, deduplicate the sections).
6. For each category, display a preview (500 chars) and **wait for user approval** before writing.

   **Generic core** — everything lands under the single resolved `<target-root>/sources/<source-name>/`:

   | Classified | Destination | Action |
   |------------|-------------|--------|
   | `raw/chunk_*.txt` (assembled) | `<target-root>/sources/<source-name>/fulltext.md` | create — **full raw, never discard** |
   | `lore*.md` | `<target-root>/sources/<source-name>/lore.md` | create/append |
   | `terminology*.md` | `<target-root>/sources/<source-name>/terminology.md` | create/merge |
   | `rules*.md` | `<target-root>/sources/<source-name>/rules.md` | create/append |
   | `style*.md` | `<target-root>/.output-styles/<target>-<source-name>.md` | create |
   | `structure*.md` | `.toc/INDEX.md` | create/update |
   | `templates*.md` | `<target-root>/.templates/latex-patterns.md` | append |

   **JDR profile** — split by provenance across universe (lore) and system (rules):

   | Classified | Destination | Action |
   |------------|-------------|--------|
   | `raw/chunk_*.txt` (assembled) | `<univers-root>/sources/<source-name>/fulltext.md` (+ `<systeme-root>/…` if rules) | create — **full raw, never discard** |
   | `lore*.md` | `<univers-root>/sources/<source-name>/lore.md` | create/append |
   | `terminology*.md` | `<univers-root>/sources/<source-name>/terminology.md` | create/merge |
   | `rules*.md` | `<systeme-root>/sources/<source-name>/rules.md` | create/append |
   | `style*.md` | `<univers-root>/.output-styles/<univers>-<source-name>.md` | create |
   | `structure*.md` | `.toc/INDEX.md` | create/update |
   | `templates*.md` | `<univers-root>/.templates/latex-patterns.md` | append |

   > **Generic core**: all bundles → `<target-root>/sources/<source-name>/`.
   > **JDR profile**: lore and terminology → `<univers-root>/sources/<source-name>/` (universe reference); rules → `<systeme-root>/sources/<source-name>/` (system reference).
   > Never write into the synthesized layer — `reference/` generically, `canon/` or `mj/` under the JDR profile (the latter is the role of `ttrpg:lore-extract` and `ttrpg:rules-keeper`).

7. After user validation (`Y`): create the `sources/<source-name>/` folders if absent, write the files, commit (single repository = `R`). Stage the destinations resolved for the active profile — **generic core** stages `<target-root>/sources/<source-name>/` and its convenience dirs; **JDR profile** stages the universe + system split shown below:
   ```bash
   # Create the destination folders if necessary (JDR profile example — generic: a single <target-root>/sources/<source-name>)
   python -c "
   from pathlib import Path
   for d in ['<univers-root>/sources/<source-name>', '<systeme-root>/sources/<source-name>']:
       Path(d).mkdir(parents=True, exist_ok=True)
   "
   # Single repository R — paths relative to R (JDR profile example)
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
    1. Assemble the normalized raw text of the chunks (`docs/extraction/<source-name>/raw/chunk_*.txt`, in order) into a single `fulltext.md` (with a provenance header) and write it into **each populated `sources/<source-name>/`** — generic core: `<target-root>/sources/<source-name>/fulltext.md`; JDR profile: `<univers-root>/sources/<source-name>/fulltext.md`, and `<systeme-root>/sources/<source-name>/fulltext.md` if rules were extracted.
    2. **Only after** `fulltext.md` is written: delete the working folder `docs/extraction/<source-name>/chunks/`, `…/raw/`, `…/classified/` (the classified bundles have been merged into `sources/`).
    3. Rename `docs/extraction/<source-name>/progress.md` → `docs/extraction/<source-name>/DONE-YYYY-MM-DD.md`.

    > Never delete `raw/` without having first written `fulltext.md`: it is the only verbatim copy of the document.

## Next steps (suggest to the user)

Once the sources are created, the ventilation into the synthesized layer is a **downstream** step (`extract-pdf` never does it). Under the **JDR profile**:
- **Lore**: `ttrpg:lore-extract <univers-root>/sources/<source-name>/lore.md` → feeds `<univers-root>/canon/`
- **Rules**: `ttrpg:rules-keeper restructure <systeme-root>/sources/<source-name>/rules.md` → feeds `<systeme-root>/canon/`

In the **generic core**, the reference bundles under `<target-root>/sources/<source-name>/` await ventilation into `<target-root>/reference/` by the appropriate downstream skill.

## Test

After `distribute <project_dir> <source_name>` on a complete extraction, verify that (paths shown for the JDR profile; generic core = the single `<target-root>/sources/<source-name>/`):
- `docs/extraction/<source-name>/DONE-YYYY-MM-DD.md` exists (progress.md archived)
- `<univers-root>/sources/<source-name>/fulltext.md` exists and is non-empty (raw text preserved)
- `<univers-root>/sources/<source-name>/lore.md` and/or `terminology.md` have been created
- `<systeme-root>/sources/<source-name>/rules.md` has been created (if rules were present)
- No file has been written into the synthesized layer (`reference/` generically; `canon/` or `mj/` under the JDR profile)
- The folders `docs/extraction/<source-name>/chunks/`, `raw/`, `classified/` have been deleted
