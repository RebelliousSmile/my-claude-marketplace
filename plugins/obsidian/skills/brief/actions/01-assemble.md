# 01 - Assemble

Create the `<projet>/_brief/` working directory and consolidate the gathered inputs — project sources **and** the domain's global/durable resources — into a **self-contained `summary.md`**, plus the `personas/` and `output-styles/` sub-directories.

> Local paths only. `<projet>` is the project (work-unit) dir: the argument if given, else the CWD. `R` is the **domain** holding global resources (via `--resources`, e.g. `R/_savoir/`). Everything is created **inside `<projet>/_brief/`** — never outside. The result is portable (movable without breaking `writing`, and without reaching back into `R`).

## Inputs

- `<projet>` (optional, positional) — the writing project (work-unit) directory, where `_brief/` is created. Default: current working directory. Typically `R/<Year>/<Month>/mon-projet`.
- `--resources <R>` (optional) — the domain dir holding global/durable resources. `brief` reads its `R/bank.yml` manifest (see `${CLAUDE_PLUGIN_ROOT}/references/bank-yml.md`) to discover what is available; falls back to scanning `R/_savoir/` if no manifest.
- source files (optional) — local paths to project-specific concept/lore/rules/notes (e.g. a `forge` overview, `lore-extract` canon files, a `rules-keeper` cheatsheet, raw notes).

## Outputs

```
<projet>/_brief/
  summary.md
  personas/
  output-styles/
```

`summary.md` skeleton:
```markdown
# Brief : <titre>

**Type :** <technical-doc | cheat-sheet | rpg-scenario | novel | guide | …>
**Langue :** <français par défaut>

## Intention
<ce qu'on produit, pour qui, dans quel but — en 3-5 lignes>

## Synopsis / Plan
<résumé du contenu attendu ; structure pressentie>

## Contexte consolidé
<lore, règles, données, contraintes — TOUT le savoir nécessaire, INLINE,
 y compris la part pertinente des ressources globales de R.
 Aucune référence à un chemin externe (ni vers R) : ce qui n'est pas ici n'existe pas pour writing.>

## À surveiller
<contraintes de forme, terminologie imposée, écueils>
```

## Process

1. Resolve `<projet>` (argument or CWD). If `<projet>/_brief/` already exists → switch to update mode: never overwrite silently, propose changes for existing files.
2. Collect inputs:
   - project-specific source files passed as arguments (local paths);
   - **global/durable resources** from `R` if `--resources` is given: read `R/bank.yml` (the manifest), use each entry's `summary` to **select the relevant subset** for this project (do not dump everything), then read those files. If no `R/bank.yml`, fall back to scanning `R/_savoir/`.
   Identify the **type** of work unit and the **language** (ask if not deducible).
3. **Consolidate into `summary.md`** — distill all sources into the skeleton above. The **Contexte consolidé** section must inline every fact `writing` will need (lore, rules, data), **including the relevant slice of R's globals**; do not link out, not even to `R`. If a needed input is absent, list it under a `## Manques` heading rather than pointing at an external path.
4. Present the assembled `summary.md` to the user for validation. Iterate until accepted.
5. Create `<projet>/_brief/`, write `summary.md`, and create `<projet>/_brief/personas/` and `<projet>/_brief/output-styles/` (empty). Optionally seed one default output-style stub if the user asks.
6. Report created files. Suggest next steps: `writing:tone-finder <projet>/_brief` (define a style), `writing:persona <projet>/_brief` (reader personas), then `writing:toc <projet>/_brief --out <projet>/_output` (long form) or `writing:write <projet>/_brief --out <projet>/_output --chapter 01` (short form).

## Test

After `assemble <projet> --resources <R>`, verify that `<projet>/_brief/summary.md` exists with non-empty **Type**, **Langue**, and **Contexte consolidé** (the latter inlining the relevant R globals, with no path pointing back to `R`), and that `<projet>/_brief/personas/` and `<projet>/_brief/output-styles/` directories exist. Confirm nothing was written outside `<projet>/`.
