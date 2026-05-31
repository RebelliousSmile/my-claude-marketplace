# 01 - Reset

Destructively reset a writing project: extract narrative essence into `overview.md`, backup all generated files, then delete `.toc/`, `chapitres/`, and `.wip/` contents.

> Path variables: see `setup/references/vault-layout.md`.
> `<projet-root>` = `<jeu>/ecrits/<projet>/` — bank.yml and all project files live here.
> Universe docs (`<univers-root>/`), output-styles, and personas are NEVER deleted.

## Inputs

- `project_path` (required) — string, format `<jeu>/ecrits/<projet>`
- `--keep-wip` (optional flag) — preserve `.wip/` when set

## Depends on

- `setup` (project must have a valid `<projet-root>/bank.yml`)

## Outputs

- `<projet-root>/overview.md` — condensed narrative essence (≤ 500 lines)
- `<projet-root>/.backup/<projet>-<timestamp>/` or `git stash` — safety backup of deleted files
- `<projet-root>/.backup/reset-log.md` — append-only log of reset events

Directories `<projet-root>/.toc/`, `<projet-root>/chapitres/`, `<projet-root>/.wip/` are emptied (folders preserved, files deleted).

## Process

### Phase 1 — Scan

1. Read `<projet-root>/bank.yml`. If missing → STOP: "No `bank.yml` found. Run `setup init <jeu>/ecrits/<projet>` first."
2. List all files in:
   - `<projet-root>/.toc/*.md`
   - `<projet-root>/chapitres/*.tex` and `*.md`
   - `<projet-root>/.wip/**/*` (unless `--keep-wip`)
3. Display the inventory:
   ```
   Files found:
     .toc/INDEX.md (45 lines)
     .toc/toc-chapter01.md (30 lines)
     chapitres/chapitre01.tex (200 lines)
     ...
   Total: N files, X lines
   ```
4. If no files found → STOP: "Nothing to reset. ABORT."

### Phase 2 — Extract essence

5. Read all scanned files. Extract the narrative essence according to these rules:

   | KEEP | DROP |
   |------|------|
   | Pitch and core concept | Detailed prose descriptions |
   | Structure (acts, progression, arc) | Complete dialogues |
   | Characters (name, role, arc, relationships) | Stage directions and blocking |
   | Locations (name, function, atmosphere) | Game rules and statblocks |
   | Key events and turning points | Implementation details |
   | Themes and tone | Scene-by-scene breakdowns |

6. Generate `<projet-root>/overview.md` draft (≤ 500 lines). Omit sections if content is absent:
   ```markdown
   # [Project Name]
   
   ## Pitch
   
   ## Structure
   
   ## Characters
   
   ## Locations
   
   ## Themes and Tone
   
   ## Notes
   ```

### Phase 3 — Validate

7. Display the full `overview.md` preview.
8. List all files that will be **permanently deleted**.
9. Show backup plan: "Will run `git stash` (or copy to `<projet-root>/.backup/<projet>-<YYYY-MM-DD>/` if no git)."
10. Ask for explicit confirmation:
    ```
    ⚠️  TABULA RASA — This action cannot be undone without the backup.
    
    Files to delete: [N files listed above]
    Type YES to confirm, or NO to abort:
    ```
11. If answer is not exactly `YES` → write `overview.md` without deleting anything. Report: "overview.md saved. No files deleted." END.

### Phase 4 — Backup and reset

12. **Backup**: if git repo → `git stash push --include-untracked -m "tabula-rasa <timestamp>"`. Else → copy all files to `<projet-root>/.backup/<projet>-<YYYY-MM-DD>/`.
13. If `<projet-root>/overview.md` already exists → rename to `overview.bak.md` before writing.
14. Write `<projet-root>/overview.md`.
15. Delete contents of `<projet-root>/.toc/`, `<projet-root>/chapitres/`, and (unless `--keep-wip`) `<projet-root>/.wip/`. Preserve the empty directories.
16. Append to `<projet-root>/.backup/reset-log.md`:
    ```markdown
    ## Reset — YYYY-MM-DD HH:MM
    - Project: <jeu>/ecrits/<projet>
    - Files deleted: N
    - Backup: git stash / .backup/<projet>-YYYY-MM-DD/
    - overview.md: N lines
    ```

### Phase 5 — Report

17. Print:
    ```
    === TABULA RASA ===
    Created: overview.md (N lines)
    Deleted: [list of deleted files]
    Restore: git stash pop   (or copy from .backup/<projet>-<date>/)
    
    Next step: brainstorm <jeu>/ecrits/<projet>
    ```

## Test

After `tabula-rasa reset <jeu>/ecrits/<projet>` on a project with at least one chapter file: confirm that (1) `<projet-root>/overview.md` is non-empty and ≤ 500 lines, (2) `<projet-root>/chapitres/` and `<projet-root>/.toc/` directories exist but contain no files, (3) `<projet-root>/.backup/reset-log.md` has been updated with the reset timestamp, and (4) a backup exists (git stash or `.backup/` folder). Confirm that `<univers-root>/` was NOT touched.
