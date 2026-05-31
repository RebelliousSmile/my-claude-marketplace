# 01 - Init

Initialize a new writing project: audit the current tree, create missing directories, prompt for configuration, and write `bank.yml` after user validation.

> Path variables: see `setup/references/vault-layout.md`.
> `<projet-root>` = `<jeu>/ecrits/<projet>/` — `bank.yml` lives at `<projet-root>/bank.yml`.

## Inputs

- `project_path` (required) — string, format `<jeu>/ecrits/<projet>` (e.g. `zombiology/ecrits/mon-scenario`)
  - `<jeu>` = game folder under `<vault>` (e.g. `zombiology`, `pbta-hacks`)
  - `<projet>` = project slug (e.g. `mon-scenario`, `rouedutemps-adrenaline`)

## Outputs

```
Project initialized at <jeu>/ecrits/<projet>/
Created:
  bank.yml
  overview.md (template)
  univers/<univers>/canon/         (directory)
  univers/<univers>/mj/            (directory)
  univers/<univers>/.output-styles/      (directory)
  univers/<univers>/canon/UNIVERS.md  (template if missing)
  univers/<univers>/.templates/personas/ (directory)
  .toc/
  chapitres/
  .wip/comments/
  .wip/changelog/
  .wip/coherence/
  .templates/personas/
```

## Process

1. Parse `$ARGUMENTS`. If `--integrity-check` flag detected → STOP, dispatch to `audit` instead.
2. Validate the path format: must contain `ecrits/` as separator (format `<jeu>/ecrits/<projet>`). Extract `<jeu>` and `<projet>`. If format is invalid or ambiguous → ABORT with error and show expected format: `<jeu>/ecrits/<projet>`.
3. Resolve `<univers-root>` = `<jeu>/univers/<univers>/`. Prompt the user for `<univers>` if not inferrable from existing files.
4. Scan the existing tree. Build a presence checklist:
   - `<projet-root>/bank.yml`
   - `<projet-root>/overview.md`
   - `<univers-root>/canon/` (directory)
   - `<univers-root>/mj/` (directory)
   - `<univers-root>/.output-styles/` (directory)
   - `<univers-root>/.templates/personas/` (directory)
   - `<projet-root>/.toc/INDEX.md`
   - `<projet-root>/chapitres/`
   - `<projet-root>/.wip/` subdirectories
   - `<projet-root>/.templates/personas/`
5. Present the checklist to the user: "Found X items, missing: Y. Continue?" Wait for explicit confirmation.
6. Create missing directories in order:
   - `<univers-root>/canon/`
   - `<univers-root>/mj/`
   - `<univers-root>/.output-styles/`
   - `<univers-root>/.templates/personas/`
   - `<projet-root>/chapitres/`
   - `<projet-root>/.toc/`
   - `<projet-root>/.wip/comments/`
   - `<projet-root>/.wip/changelog/`
   - `<projet-root>/.wip/coherence/`
   - `<projet-root>/.templates/personas/`
7. If `<univers-root>/canon/UNIVERS.md` is missing: prompt for universe name and create a minimal template.
8. If the overview file is missing: ask for `document.type` (novel / scenario / roleplaying / guide), then create a typed template at `<projet-root>/overview.md`.
9. Determine output-style strategy:
   - Canon docs exist in `<univers-root>/canon/` → suggest running `tone-finder analyze <univers>` for automatic extraction.
   - No canon docs → suggest running `tone-finder analyze <univers>` (questionnaire mode) after init.
10. Prompt for initial personas: auto-generate 2 generic defaults (generic reader + genre specialist) OR let the user specify custom ones via `persona generate`.
11. Assemble `bank.yml` from all collected data. The generated `bank.yml` MUST include `docs` entries pointing at BOTH `canon/` and `mj/` tiers so the writer ingests MJ content out of the box:
    ```yaml
    document:
      name: "<project title>"
      univers: "<univers>"
      type: "<type>"

    output-style:
      <type>: "univers/<univers>/.output-styles/<univers>-<type>.md"

    docs:
      univers:      "univers/<univers>/canon/UNIVERS.md"
      terminologie: "univers/<univers>/canon/terminologie.md"
      # Uncomment additional canon files as they are created by lore-extract/research:
      # factions:   "univers/<univers>/canon/factions.md"
      # projet docs — add MJ files here as needed:
      projet:
        - ".docs/introduction.md"
        # - ".docs/mj/<notes>.md"  # MJ content (house / homemade)

    personas:
      projet:
        - ".templates/personas/<id>.yml"
      univers:
        - "univers/<univers>/.templates/personas/<id>.yml"

    overview: "overview.md"

    toc:
      fichier: ".toc/INDEX.md"

    metadata:
      auteur: ""
      date-creation: "<today>"
      version: "0.1"
      statut: "draft"
    ```
12. Display the YAML to the user for validation before writing.
13. Write `bank.yml` to `<projet-root>/bank.yml`. Report all created files. Suggest: `brainstorm <jeu>/ecrits/<projet>` as next step.

## Test

After `init <jeu>/ecrits/<projet>`, verify that:
- `<projet-root>/bank.yml` exists and references `univers/<univers>/canon/UNIVERS.md`
- `<univers-root>/canon/` and `<univers-root>/mj/` directories exist
- `<projet-root>/chapitres/` and `<projet-root>/.toc/` directories exist
- No pre-existing files were overwritten
