# 02 - Audit

Audit an existing writing project's integrity against its `bank.yml` declarations. Report-only mode — zero writes.

> Path variables: see `setup/references/vault-layout.md`.
> `<projet-root>` = `<jeu>/ecrits/<projet>/` — `bank.yml` lives at `<projet-root>/bank.yml`.

## Inputs

- `project_path` (required) — string, format `<jeu>/ecrits/<projet>`
- `--integrity-check` (required flag) — activates audit mode

## Outputs

```markdown
# Integrity Report — <jeu>/ecrits/<projet>

**Date:** <date>

## bank.yml
- Present: [YES] / [MISSING]
- version: [OK] / [INVALID]

## Declared Files
| Field               | Path                                          | Status              |
|---------------------|-----------------------------------------------|---------------------|
| overview            | <projet-root>/overview.md                     | [OK] / [MISSING] / [EMPTY] |
| toc.fichier         | <projet-root>/.toc/INDEX.md                   | [OK] / [MISSING] |
| output-style.<type> | univers/<univers>/.output-styles/...          | [OK] / [MISSING] |
| docs.univers        | univers/<univers>/.docs/canon/UNIVERS.md      | [OK] / [MISSING] |
| docs.terminologie   | univers/<univers>/.docs/canon/terminologie.md | [OK] / [MISSING] |
| docs.projet[*]      | <projet-root>/.docs/<file>.md                 | [OK] / [MISSING] |
| rules-files.*       | systeme/canon/<file>.md                       | [OK] / [MISSING] |
| personas.*          | .templates/personas/<id>.yml                  | [OK] / [MISSING] |

## Canon Path Check
- docs.univers → inside `.docs/canon/`: [OK] / [WARN: expected canon/ path]
- docs.terminologie → inside `.docs/canon/`: [OK] / [WARN: expected canon/ path]

## Chapters
- Total: N
- Valid (H1 header present): M
- Empty: P

## WIP State
- .wip/comments/: N files
- .wip/changelog/: M files
- .wip/coherence/: P files

## Diagnosis
<summary of issues found>

## Recommended Actions
1. <action 1 with exact command>
2. <action 2>
```

## Process

1. Parse `$ARGUMENTS`. Extract project path (format `<jeu>/ecrits/<projet>`). Confirm `--integrity-check` flag is present.
2. Look for `bank.yml` at `<projet-root>/bank.yml`. If absent → ABORT with `[ERROR] bank.yml not found — cannot check integrity. Run \`setup init <jeu>/ecrits/<projet>\` first.`
3. Load and parse `bank.yml`. Extract all declared file references.
4. For each declared file path in `bank.yml`, check: does it exist on disk? Is it non-empty? Build the status table.
5. **Canon path check**: verify that `docs.univers` and `docs.terminologie` point inside `univers/<univers>/.docs/canon/`. If either points to a non-canon path (e.g. `.docs/UNIVERS.md` without `canon/`), flag as `[WARN: expected canon/ path]` and recommend updating to `univers/<univers>/.docs/canon/<file>.md`.
6. Scan `<projet-root>/chapitres/` directory: count `.md` files; check each for a first-line `# ` (H1 header); flag empty or header-less files.
7. Scan `<projet-root>/.wip/comments/`, `.wip/changelog/`, `.wip/coherence/` subdirectories: count files, note last-modified dates.
8. Produce the integrity report. Diagnose: list all `[MISSING]`, `[EMPTY]`, and `[WARN]` items.
9. In "Recommended Actions": suggest exact commands to fix each issue (e.g., `setup init`, `tone-finder analyze`, `persona generate`, `lore-extract` to populate canon/).
10. Output the report. **Do not write any files.**

## Test

Run `audit <jeu>/ecrits/<projet> --integrity-check` on a project with a known missing file (e.g., delete `terminologie.md`); confirm the report flags it as `[MISSING]` and no new files appear in the project directory. Also confirm that a bank.yml with `docs.univers` pointing to `.docs/UNIVERS.md` (non-canon path) is flagged as `[WARN]`.
