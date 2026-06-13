# 02 - Check

Verify that `<projet>/_brief/` is **self-contained and ready** for the `writing` plugin. Report-only — zero writes.

> Local paths only. `<projet>` is the project (work-unit) dir: the argument if given, else the CWD. The check looks **only** inside `<projet>/_brief/`.

## Inputs

- `<projet>` (optional, positional) — the project (work-unit) directory. Default: current working directory.

## Outputs

```markdown
# Brief Check — <projet>/_brief

**Date:** <date>

## Structure
- _brief/summary.md      : [OK] / [MISSING] / [EMPTY]
- _brief/personas/       : [OK] / [MISSING] (N files)
- _brief/output-styles/  : [OK] / [MISSING] (N files)

## summary.md self-sufficiency
- Type declared          : [OK] / [MISSING]
- Language declared       : [OK] / [MISSING]
- Intention present       : [OK] / [MISSING]
- Contexte consolidé      : [OK] / [THIN] / [MISSING]
- External path leaks      : [NONE] / [FOUND: <list>]   ← any reference outside _brief/ (incl. back into R) is a defect

## Readiness for writing
- ≥ 1 output-style        : [OK] / [NONE — run writing:tone-finder]
- Personas (optional)     : N present
- Verdict                 : READY / NOT READY

## Diagnosis
<issues found>

## Recommended Actions
1. <action with exact command>
```

## Process

1. Resolve `<projet>` (argument or CWD). If `<projet>/_brief/` is absent → report `[MISSING] _brief/ — run \`obsidian:brief assemble\` first.` and stop.
2. Check the structure: `summary.md`, `personas/`, `output-styles/` presence and (for files) non-emptiness.
3. **Self-sufficiency of `summary.md`**: confirm Type, Language, Intention, and a substantive **Contexte consolidé** are present. Flag a thin or missing context.
4. **External-path leak check** (key invariant): scan `summary.md` for references that point outside `_brief/` (absolute paths, `../`, paths back into the domain `R`, vault-style paths, `~/…`). Any such reference is a defect — `writing` must run on `_brief/` alone. List every leak.
5. **Readiness**: at least one file in `output-styles/` (else recommend `writing:tone-finder`). Personas are optional.
6. Produce the report with a READY / NOT READY verdict and exact remediation commands. **Do not write any files.**

## Test

Run `check <projet>` on a `_brief/` whose `summary.md` references an external path (e.g. `../../_savoir/lore.md` back in `R`); confirm it is flagged under **External path leaks** and the verdict is NOT READY, and that no files were created.
