# 01 - Init

Initialize a new writing project: audit the current tree, create missing directories, prompt for configuration, and write `bank.yml` after user validation.

## Inputs

- `project_path` (required) — string, format `<univers>/<projet>` (e.g. `archipels/mon-roman`)

## Outputs

```
Project initialized at <univers>/<projet>/
Created:
  bank.yml
  overview.md (template)
  <univers>/.output-styles/ (directory)
  <univers>/.docs/UNIVERS.md (template if missing)
  <univers>/.templates/personas/ (directory)
  .toc/
  chapitres/
  .wip/comments/
  .wip/changelog/
  .wip/coherence/
```

## Process

1. Parse `$ARGUMENTS`. If `--integrity-check` flag detected → STOP, dispatch to `audit` instead.
2. Validate the path format: must contain two `/`-separated segments (`<univers>` and `<projet>`). If invalid or ambiguous → ABORT with error.
3. Scan the existing tree. Build a presence checklist: `bank.yml`, declared overview file, `<univers>/.output-styles/`, `<univers>/.templates/personas/`, `.toc/INDEX.md`, `chapitres/`, `.wip/` subdirectories.
4. Present the checklist to the user: "Found X files, missing: Y. Continue?" Wait for explicit confirmation.
5. Create missing directories in order: `chapitres/`, `.toc/`, `.wip/comments/`, `.wip/changelog/`, `.wip/coherence/`, `<univers>/.output-styles/`, `<univers>/.docs/`, `<univers>/.templates/personas/`.
6. If `<univers>/.docs/UNIVERS.md` is missing: prompt for universe name and create a minimal template.
7. If the overview file is missing: ask for `document.type` (novel / scenario / roleplaying / guide), then create a typed template at the path the user specifies (or `overview.md` by default).
8. Determine output-style strategy:
   - Universe docs exist in `<univers>/.docs/` → suggest running `tone-finder analyze <univers>` for automatic extraction.
   - No source docs → suggest running `tone-finder analyze <univers>` (questionnaire mode) after init.
9. Prompt for initial personas: auto-generate 2 generic defaults (generic reader + genre specialist) OR let the user specify custom ones via `persona generate`.
10. Assemble `bank.yml` from all collected data. Display the YAML to the user for validation before writing.
11. Write `bank.yml`. Report all created files. Suggest: `brainstorm <univers>/<projet>` as next step.

## Test

After `init <univers>/<projet>`, verify that `bank.yml` exists at the project root, `chapitres/` and `.toc/` directories exist, and no pre-existing files were overwritten.
