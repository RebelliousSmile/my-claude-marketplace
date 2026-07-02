# 04 - Log session

Update PJ files after a game session (game system).

## Inputs

- `pj` (required) - the target PJ folder under `R/_pjs/<pj>/`.
- `session info` (required) - session number and date, played scenes, mechanical events, notable outcomes, final mechanical state.
- `R` (resolved) - the game domain discovered locally.

## Outputs

- A new dated session file `R/<AAAA>/<MM>/<pj>/session-<AAAA-MM-JJ>-<N>.md` (the session journal — one file per session).
- Updated durable PJ sheets under `R/_pjs/<pj>/`: `etat-jeu.md` (always), with proposed updates to `intention.md` and `backlog.md`.

## Process

Asks the user for:
1. Session number and date (default: today)
2. Played scenes (short summary per scene)
3. Mechanical events of the session (resources gained/spent, statuses, counters) per the active rules (game system)
4. Notable outcomes / turning points of the session
5. Final mechanical state of the sheet per the active rules (game system) (gauges, resources, statuses, counters, pending elements)

Then updates:
1. **Dated session file** — determine `<N>` by scanning the PJ's dated session home **across all year/month folders** (`R/<AAAA>/<MM>/<pj>/` for every `<AAAA>/<MM>`, files `session-*.md`) using the **canonical session ordering** (`${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md › Ordre canonique des séances`): exclude `-prep-` files, extract each `<N>` by suffix form (bare counter / dated+suffix / dated-no-suffix legacy = no `<N>`; never read a date day `03`/`31` as `<N>`), then `<N> = max(extracted) + 1` (global, not per-month). Then create `R/<AAAA>/<MM>/<pj>/session-<AAAA-MM-JJ>-<N>.md` (today's folders, create if absent) with scenes, mechanical events, outcomes, free notes. This is the session journal — one file per session, mirroring `solo-mc`.
2. **`etat-jeu.md`** (durable, `R/_pjs/<pj>/`) — snapshot of the current mechanical state per the active rules (game system) (gauges, resources, statuses, counters, pending elements)
3. **`intention.md`** (durable) — proposes an update if a new story thread emerged, the visceral question evolved, or a theme shifted
4. **`backlog.md`** (durable) — proposes adding new scene ideas and open questions that emerged

Reports modified files at the end (dated session file + the durable PJ sheets touched).

## Test

A new file `R/<AAAA>/<MM>/<pj>/session-<AAAA-MM-JJ>-<N>.md` exists with `<N>` computed globally across all year/month folders, and `R/_pjs/<pj>/etat-jeu.md` reflects the session's final mechanical state.
