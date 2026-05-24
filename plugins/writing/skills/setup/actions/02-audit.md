# 02 - Audit

Audit an existing writing project's integrity against its `bank.yml` declarations. Report-only mode — zero writes.

## Inputs

- `project_path` (required) — string, format `<univers>/<projet>`
- `--integrity-check` (required flag) — activates audit mode

## Outputs

```markdown
# Integrity Report — <univers>/<projet>

**Date:** <date>

## bank.yml
- Present: [YES] / [MISSING]
- version: [OK] / [INVALID]

## Declared Files
| Field               | Status              |
|---------------------|---------------------|
| overview            | [OK] / [MISSING] / [EMPTY] |
| toc.fichier         | [OK] / [MISSING] |
| output-style.<type> | [OK] / [MISSING] |
| docs.univers        | [OK] / [MISSING] |
| docs.terminologie   | [OK] / [MISSING] |
| docs.projet[*]      | [OK] / [MISSING] |
| rules-files.*       | [OK] / [MISSING] |
| personas.*          | [OK] / [MISSING] |

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

1. Parse `$ARGUMENTS`. Extract project path. Confirm `--integrity-check` flag is present.
2. Look for `bank.yml` at the project root. If absent → ABORT with `[ERROR] bank.yml not found — cannot check integrity. Run \`setup init <univers>/<projet>\` first.`
3. Load and parse `bank.yml`. Extract all declared file references.
4. For each declared file path in bank.yml, check: does it exist on disk? Is it non-empty? Build the status table.
5. Scan `chapitres/` directory: count `.md` files; check each for a first-line `# ` (H1 header); flag empty or header-less files.
6. Scan `.wip/comments/`, `.wip/changelog/`, `.wip/coherence/` subdirectories: count files, note last-modified dates.
7. Produce the integrity report. Diagnose: list all `[MISSING]` and `[EMPTY]` items.
8. In "Recommended Actions": suggest exact commands to fix each issue (e.g., `setup init`, `tone-finder analyze`, `persona generate`).
9. Output the report. **Do not write any files.**

## Test

Run `audit <univers>/<projet> --integrity-check` on a project with a known missing file (e.g., delete `terminologie.md`); confirm the report flags it as `[MISSING]` and no new files appear in the project directory.
