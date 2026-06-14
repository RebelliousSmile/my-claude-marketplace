# 05 - Show

Display the current character sheet (tags, statuses, relations).

## Inputs

- `pj` (optional) - the PJ to display; if omitted, resolved from the active session.
- `R` (resolved) - the game domain discovered locally.

## Outputs

A structured, read-only character sheet rendered to the user: progress statuses, themes, power/weakness tags, recent tag changes, active statuses, NPC relations, objectives.

## Process

Determines the active PJ:
- If argument supplied (`/obs:pc show @<pj>`): use it
- Otherwise read `.current-session` at the domain root (`R/.current-session`)
- If empty or missing: prompt the user

Loads character state from (priority order):
1. `R/_campagnes/<campagne>/.session-state.yaml` (if active session)
2. `R/_campagnes/<campagne>/config.yaml`
3. `R/_pjs/<pj>/fiche_technique.md` and `R/_pjs/<pj>/pj.md`
4. Last dated session file `R/<AAAA>/<MM>/<pj>/session-*.md` — the file of maximal `<N>` per the **canonical session ordering** (`../../references/jdr-layout.md › Ordre canonique des séances`), not merely "most recent year/month first match" — for recent scenes, tag changes and events

Displays a structured sheet with: progress statuses, themes, power/weakness tags, recent tag changes, active statuses, NPC relations, objectives.

For campaign-level mechanics and narrative context, refer the user to `/status` and `/previously`.

## Test

The rendered sheet reflects the highest-priority available source (active `.session-state.yaml` when present, otherwise `config.yaml`, then the PJ files) without modifying any file on disk.
