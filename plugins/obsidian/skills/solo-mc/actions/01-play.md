# 01 - Play

Start a new solo RPG session, loading the full campaign context.

## Inputs

- `campaign` (required) — string, campaign folder name under the JdR root directory
- `character` (optional, default: detected from config.yaml) — string, player character name

## Outputs

Session start confirmation including:
- Campaign context summary (world, system, active arcs)
- Character status snapshot
- First scene prompt from `narrateur-agent`

## Process

1. Read `.current-session` to detect the active campaign if `campaign` not provided; if absent, ask the user.
2. Read `<campaign>/config.yaml` to load system, universe, tone, difficulty, and pacing. If the `compagnons:` key is present, load the active companion roster — names, roles, and sheet paths (`<vault>/<jeu>/pjs/<pj>/compagnons/<slug>.md`) — into session context for potential companion substitution (T14).
3. Read `<campaign>/Histoire.md` for narrative backstory and active arcs.
4. Read `<campaign>/pj/<character>.md` for the character sheet.
5. Read `<campaign>/sessions/.session-state.yaml` if it exists (ongoing session state).
6. Write `.current-session` with the campaign's RELATIVE path (`<jeu>/campagnes/<campaign>`) — never a specific session-file path.
7. Verify today's system date, then determine the session number `<N>` from the existing files in `<campaign>/sessions/` (the filesystem is the source of truth — do not trust `config.yaml` fields like `session_courante`/`last_played`).
8. Create the session log file `<campaign>/sessions/session-<YYYY-MM-DD>-<N>.md` with a full header, including a "Précédemment…" recap of prior sessions and `active_character: <pj-slug>` so the field exists before any companion swap (T14 updates it to `<companion-slug>` and the return resets it to `<pj-slug>`). This file receives the continuous journaling (rule T10).
9. Invoke `narrateur-agent` with the loaded context; ask it to generate the opening scene.
10. Display the session start summary: campaign, character, system, and first scene.

## Test

After action completes, `.current-session` contains the campaign's relative path and a session log file `session-<YYYY-MM-DD>-<N>.md` exists under `<campaign>/sessions/` with today's date and the next session number.
