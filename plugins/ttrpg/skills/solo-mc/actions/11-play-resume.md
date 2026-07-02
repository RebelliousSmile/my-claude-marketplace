# 11 - Play Resume

Resume a previously saved session, restoring the full game state.

## Inputs

- `campaign` (required) — string, campaign folder name
- `session` (optional, default: latest) — string, session date (YYYY-MM-DD) or filename
- `checkpoint` (optional) — string, named checkpoint within the session file

## Outputs

Restored session with:
- Campaign context reloaded (universe, system, tone)
- Mechanical state restored from `.session-state.yaml`
- Session file loaded at the right position
- Agents activated
- Combined narrative (`previously`) and mechanical (`status`) context summary

## Process

1. Verify `R/_campagnes/<campaign>/` folder exists; error if not.
2. Write `.current-session` with the campaign relative path (`_campagnes/<campaign>`, relative to `R`).
3. Locate the session file: use `session` if provided, otherwise find the **last** session by scanning `R/<YYYY>/<MM>/<campagne>/` across all year/month folders and applying the **canonical session ordering** (`${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md › Ordre canonique des séances`) — the latest is the file of maximal `<N>` (not "most recent month, first match", which leaves intra-month ties unresolved). This is the **same** key `play` uses to source its recap, so resume and play agree on which session is "the last one". Exclude `-prep-` files.
4. Read `<campaign>/config.yaml` for system, universe, and tone.
5. Read `<campaign>/Histoire.md` for narrative backstory.
6. Read `<campaign>/pj/<character>.md` for the character sheet.
7. Read `R/_campagnes/<campaign>/.session-state.yaml` for the mechanical state.
8. Load the session file content; apply `checkpoint` offset if provided.
9. Invoke `narrateur-agent` with the fully restored context.
10. Display a combined recap: narrative context (like `previously`) followed by mechanical state (like `status`).

## Test

After action, `.current-session` contains the campaign name and `narrateur-agent` is active with the loaded context.
