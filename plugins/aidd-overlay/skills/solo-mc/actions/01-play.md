# 01 - Play

Start a new solo RPG session, loading the full campaign context.

## Inputs

- `campaign` (required) — string, campaign folder name under the JdR root directory
- `character` (optional, default: detected from config.yaml) — string, player character name

## Outputs

Session start confirmation including:
- Campaign context summary (world, system, active arcs)
- Character status snapshot
- First scene prompt from `mj-solo-agent`

## Process

1. Read `.current-session` to detect the active campaign if `campaign` not provided; if absent, ask the user.
2. Read `<campaign>/config.yaml` to load system, universe, tone, difficulty, and pacing.
3. Read `<campaign>/Histoire.md` for narrative backstory and active arcs.
4. Read `<campaign>/pj/<character>.md` for the character sheet.
5. Read `<campaign>/sessions/.session-state.yaml` if it exists (ongoing session state).
6. Write `.current-session` with the campaign name.
7. Create a new session file `<campaign>/sessions/session-<YYYY-MM-DD>.md` with a session header.
8. Invoke `mj-solo-agent` with the loaded context; ask it to generate the opening scene.
9. Display the session start summary: campaign, character, system, and first scene.

## Test

After action completes, `.current-session` contains the campaign name and a session file exists under `<campaign>/sessions/` with today's date.
