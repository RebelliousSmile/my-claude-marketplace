# 10 - Play End

Save the current session state and cleanly end the play session.

## Inputs

- `campaign` (optional, default: from `.current-session`) — string, campaign folder name

## Outputs

`<campaign>/sessions/.session-state.yaml` updated with:
- Progress statuses, active statuses, tags
- NPC relations
- Countdowns
- Narrative threads
- In-world time and session metrics

`<campaign>/config.yaml` updated with session count and last-played date.
Session close summary with metrics (scenes played, oracle queries, rolls, threads opened/closed).

## Process

1. Detect campaign from `.current-session`; error if absent.
2. Read the current session file for all events logged this session.
3. Read `<campaign>/sessions/.session-state.yaml` for the existing state baseline.
4. Compute the updated state: merge session events, update statuses, burn/acquire tags, advance countdowns, update NPC relations.
5. Write the updated `.session-state.yaml`.
6. Update `<campaign>/config.yaml` with session count and `last_played` date.
7. Display a session close summary with key metrics.

## Test

`.session-state.yaml` last-modified timestamp is current and contains an updated `last_played` or `session_count` field.
