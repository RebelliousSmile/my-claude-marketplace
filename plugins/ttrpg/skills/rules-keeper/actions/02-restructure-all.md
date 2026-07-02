# 02 - Restructure All

Restructure all rules sources of the game domain `R`.

> **Position in the pipeline**: restructures the reference rules sources (`<systeme-root>/sources/<source>/rules.md`, and the subsystems `<subsys-root>/sources/<source>/rules.md`). The outputs land in `<systeme-root>/canon/` (or `<subsys-root>/canon/`).
> See `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md` for the full convention.

## Régénérer le canon depuis le PDF

The system canon is derived from a commercial PDF. If `<systeme-root>/canon/` is absent/empty (never generated, or deliberately unversioned), it is rebuilt from the PDF:

1. **Detect the absence** — if `<systeme-root>/canon/` is absent/empty **and** no bundle exists under `<systeme-root>/sources/`, there is nothing to restructure: the sources must be (re-)extracted first.
2. **Re-extract the sources** — provide the commercial rules PDF and run `extract-pdf` to rebuild `<systeme-root>/sources/<source>/rules.md` (+ terminology, etc.). `rules-keeper` **never** writes into `canon/` without a source.
3. **Restructure** — re-run this action (`restructure-all`): Step 1 detects the new bundles under `<systeme-root>/sources/` and dispatches them to `<systeme-root>/canon/`.
4. **Check the consumers** — `solo-mc`, `pc`, `campaign` and `writing:write` become operational again once `<systeme-root>/canon/` is regenerated. The house rules `<systeme-root>/mj/` and the lore `<univers-root>/canon/` are unaffected: nothing to regenerate on that side.

> Without the source PDF, the canon **cannot** be regenerated: this content derives from commercial material.

## Inputs

*(no argument — scans `<systeme-root>/sources/` and subsystems locally, relative to `R`)*

## Outputs

- Restructured rules in the optimized 6-section format (CHEATSHEET / LEXICON / PATTERNS / ENTITY TEMPLATES / FULL REFERENCE / CHANGELOG), written for every source found into the matching **provenance sub-tree** — `R/_systeme/canon/` for the game system, and `<subsys-root>/canon/` for each subsystem under `R/_subsystems/<nom>/`.
- A `<rules-file>.original.md` backup for each processed source (created before overwriting; skipped if already present).
- The 4 entity template files in each `.templates/` (PC, NPC, obstacle, asset), as produced by `@01-restructure.md`.
- Files that already had a `.original.md` backup are skipped (left untouched), not reprocessed.

## Process

### Step 1 — Locate rules sources

Discover `R` locally: start from the CWD (or the argument), walk up the parents to the first folder containing one of the markers `_campagnes/`, `_univers/` or `_pjs/`; that folder is `R`. If no marker is found, the target is not inside an initialized RPG domain — report it and stop.

Scan locally the raw rules sources (produced by `extract-pdf`), relative to `R`:
- `<systeme-root>/sources/<source>/rules.md` — game system sources
- `<subsys-root>/sources/<source>/rules.md` — sources of each subsystem under `R/_subsystems/<nom>/`

> The `R/bank.yml` manifest (tree cache maintained by `obs:tree`) is **not** used to locate files: resolution is a filesystem scan relative to `R`.

List files found. If none: stop and report (see « Régénérer le canon depuis le PDF » if `canon/` and `sources/` are empty).

### Step 2 — Filter

Skip files that already have a `.original.md` backup (already optimized in a previous run).
Show the list:

```
Fichiers à restructurer :
  [ ] <file1>.md
  [ ] <file2>.md
Déjà optimisés (ignorés) :
  [✓] <file3>.md (backup existe)

Continuer ? [Y/n]
```

### Step 3 — Restructure each file

For each file in the list: run the full process from `@01-restructure.md`.
After each file: report status.

### Step 4 — Summary

```
Restructuration terminée.

| Fichier | Statut | Sections | Templates créés |
|---------|--------|----------|-----------------|
| file1   | ✓      | 6/6      | 4               |
| file2   | ✓      | 6/6      | 4               |

Total : [N] fichiers traités, [M] ignorés.
```

## Test

After `rules-keeper --all`, verify that every rules source found under `<systeme-root>/sources/` (and the subsystems' `sources/`) either has a corresponding `.original.md` backup (already done) or was processed in this run and now contains all 6 sections.
