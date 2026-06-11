# 10 - Play End

Save the current session state and cleanly end the play session.

## Inputs

- `campaign` (optional, default: from `.current-session`) — string, campaign folder name

## Outputs

`<vault>/<jeu>/_campagnes/<campaign>/.session-state.yaml` updated with:
- Progress statuses, active statuses, tags
- NPC relations
- Countdowns
- Narrative threads
- In-world time and session metrics

`<campaign>/config.yaml` updated with session count and last-played date.
Session close summary with metrics (scenes played, oracle queries, rolls, threads opened/closed).

## Process

1. Detect campaign from `.current-session`; error if absent.
2. Read the current session file (in `<vault>/<jeu>/<YYYY>/<MM>/`) for all events logged this session.
3. Read `<vault>/<jeu>/_campagnes/<campaign>/.session-state.yaml` for the existing state baseline.
4. Compute the updated state: merge session events, update statuses, burn/acquire tags, advance countdowns, update NPC relations.
5. Write the updated `_campagnes/<campaign>/.session-state.yaml`.
6. Append the session close summary (scenes played, oracle queries, rolls, threads opened/closed) to the session log file, then add a `--- FIN DE SESSION ---` marker.
7. Update `<campaign>/config.yaml`: session count, `last_played` = session date, and `session_courante` = the session log *filename* (not a full path).
8. Display a session close summary with key metrics.

## Test

`_campagnes/<campaign>/.session-state.yaml` last-modified timestamp is current and contains an updated `last_played` or `session_count` field.
