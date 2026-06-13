# 01 - init

Scan the project codebase and write or update `bank.yml` with all canonical resources.

## Inputs

- `project_root` (required) - absolute path to the project root

## Outputs

```yaml
# aidd_docs/memory/internal/bank.yml (created or updated)
projet:
  nom: 8-MINE
  version: "<semver>"
  date_generation: "<ISO date>"
lore:
  bible: aidd_docs/memory/external/bible-jeu.md
  history: aidd_docs/memory/external/history.md
  ...
code:
  architecture: aidd_docs/memory/internal/architecture.md
  ...
```

## Process

> **Note**: paths in steps 2–8 are 8-MINE project conventions. If the project structure changes (file renamed, directory moved), update the corresponding step here.

1. **Read existing `bank.yml`** if present — preserve the `projet.version` field and any manually added comments.
2. **Scan lore resources**: check existence of `bible-jeu.md`, `history.md`, `pnjs-secondaires.md`, `nodes/*.md`, `scenes/*.md`, `sessions/*.md` under `aidd_docs/memory/external/`.
3. **Scan PNJ behaviors**: list all `.md` files under `aidd_docs/memory/external/pnjs-behavior/`.
4. **Scan code resources**: check existence of `architecture.md`, `api-cheatsheet.md`, `variables-register.md`, `code-state.md`, `scripts/tools/dtl_linter.gd`, `scripts/managers/DialogicBridge.gd` under `aidd_docs/memory/internal/` and `scripts/`.
5. **Scan tracking**: check `aidd_docs/memory/internal/etat-prod.md`.
6. **Scan design rules**: list all `.md` files under `aidd_docs/memory/internal/design-rules/`.
7. **Scan output styles**: list all `.md` files under `aidd_docs/memory/internal/templates/output-styles/`.
8. **Scan templates**: check existence of `scene-spec.md`, `pnj-behavior.md`, `node-spec.md`, `review-report.md` under `aidd_docs/memory/internal/templates/`.
9. **Scan personas**: list all `.yml` files under `aidd_docs/memory/internal/personas/` (active). List archived personas under `aidd_docs/memory/internal/personas/_archive/` (do not add to `bank.yml § personas` — archived personas are non-invocable). For each active persona, read its `reference_documents:` block to fill the `personas.<name>.loads` mirror field.
10. **Write `bank.yml`** to `aidd_docs/memory/internal/bank.yml`. Set `date_generation` to today's date.
11. Print a summary: resources found vs. missing, sections updated.

## Test

`bank.yml` exists at `aidd_docs/memory/internal/bank.yml`, `projet.date_generation` matches today's date, and every path listed under `lore`, `code`, `tracking`, and `design_rules` resolves to an existing file.
