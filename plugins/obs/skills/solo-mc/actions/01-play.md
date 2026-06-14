# 01 - Play

Start a new solo RPG session, loading the full campaign context.

## Inputs

- `campaign` (required) — string, campaign folder name under `R/_campagnes/`
- `character` (optional, default: detected from config.yaml) — string, player character name

## Outputs

Session start confirmation including:
- Campaign context summary (world, system, active arcs)
- Character status snapshot
- First scene prompt from `narrateur-agent`

## Process

1. Read `.current-session` to detect the active campaign if `campaign` not provided; if absent, ask the user.
2. Read `<campaign>/config.yaml` to load system, universe, tone, difficulty, and pacing. If the `compagnons:` key is present, load the active companion roster — names, roles, and sheet paths (`R/_pjs/<pj>/compagnons/<slug>.md`) — into session context for potential companion substitution (T14).
3. Read `<campaign>/Histoire.md` for narrative backstory and active arcs.
4. Read `<campaign>/pj/<character>.md` for the character sheet.
5. Read `R/_campagnes/<campagne>/.session-state.yaml` if it exists (ongoing session state).
6. Write `.current-session` with the campaign's RELATIVE path (`_campagnes/<campaign>`, relative to `R`) — never a specific session-file path.
7. Verify today's system date, then determine the session number `<N>` by scanning the campaign's dated session home **across all year/month folders** — `R/<YYYY>/<MM>/<campagne>/` for every `<YYYY>/<MM>` — for files matching `session-*.md` (the filesystem is the source of truth — do not trust `config.yaml` fields like `session_courante`/`last_played`). Apply the **canonical session ordering** (`${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md › Ordre canonique des séances`): exclude `-prep-` files, extract each `<N>` by suffix form (bare counter / dated+suffix / dated-no-suffix legacy = no `<N>`), then `<N> = max(extracted) + 1` (global next, not per-month). Never read a date component (day `03`/`31`) as `<N>`.
8. Create the session log file `R/<YYYY>/<MM>/<campagne>/session-<YYYY-MM-DD>-<N>.md` (today's year/month folders; create them if absent) with a full header, including a "Précédemment…" recap and `active_character: <pj-slug>` so the field exists before any companion swap (T14 updates it to `<companion-slug>` and the return resets it to `<pj-slug>`). **Source the recap from the *last* session** — the file of maximal `<N>` per the canonical ordering above — never from an earlier session merely because it already carries a "Précédemment…" block. This file receives the continuous journaling (rule T10). *(Durable campaign state stays in `R/_campagnes/<campagne>/` — only the dated journal lives under the `R/<YYYY>/<MM>/` axis.)*
9. Invoke `narrateur-agent` with the loaded context; ask it to generate the opening scene.
10. Display the session start summary: campaign, character, system, and first scene.

## Test

After action completes, `.current-session` contains the campaign's relative path (`_campagnes/<campaign>`, relative to `R`) and a session log file `session-<YYYY-MM-DD>-<N>.md` exists under `R/<YYYY>/<MM>/<campagne>/` with today's date and the next session number.
