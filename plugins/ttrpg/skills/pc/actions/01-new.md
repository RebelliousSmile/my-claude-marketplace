# 01 - New

Create a new PJ folder from the shared `_template/`.

## Inputs

- `name` (required) - string, PJ name. Ask for it if not supplied via `$ARGUMENTS`; list existing folders in `R/_pjs/`.
- `R` (resolved) - the game domain discovered locally (see SKILL.md domain resolution).

## Outputs

Folder `R/_pjs/<pj>/` containing the durable PJ files:

```
pj.md · fiche_technique.md · intention.md · etat-jeu.md · backlog.md
```

No `journal.md`: session reports are dated files created by `log-session` under `R/<AAAA>/<MM>/<pj>/` (same dated axis as `solo-mc`).

## Process

Runs:
```bash
python "<R>/_shared/pj-manager.py" new "<nom>" --into "<R>/_pjs"
```

The script copies the template, slugifies the name for the folder, and replaces `[Nom du PJ]` in all `.md` files.

Files created: `pj.md`, `fiche_technique.md`, `intention.md`, `etat-jeu.md`, `backlog.md` (durable PJ state in `R/_pjs/<pj>/`). **No `journal.md`**: session reports are **dated files** created by `log-session` under `R/<AAAA>/<MM>/<pj>/` (same dated axis as `solo-mc`).

After creation, remind the user to:
1. Fill `pj.md` (background) — use `background` for a genre-driven questionnaire (recommended for a fresh PJ), or `fill` if starting from an existing text
2. Choose the system in `fiche_technique.md`
3. Fill `intention.md` before the first session

## Test

`R/_pjs/<pj>/` exists with the five durable files (`pj.md`, `fiche_technique.md`, `intention.md`, `etat-jeu.md`, `backlog.md`) and no `journal.md`, with `[Nom du PJ]` replaced by the PJ name.
