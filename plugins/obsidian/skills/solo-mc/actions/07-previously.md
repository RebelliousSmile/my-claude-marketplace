# 07 - Previously

Show the narrative context — where we are, what happened, what's at stake — with no mechanical data.

## Inputs

- `campaign` (optional, default: from `.current-session`) — string, campaign folder name

## Outputs

Narrative recap in cinematic prose:
- Current scene location and atmosphere
- Dramatic stakes
- Recent journey (last 2–4 scenes)

No mechanical labels (no tags, statuses, countdowns, challenge names).

## Process

1. Detect campaign from `.current-session` if not provided; error if absent.
2. Read `R/_campagnes/<campagne>/.session-state.yaml` for the narrative position (current location, active story threads).
3. Read the current session file (in `R/<YYYY>/<MM>/<campagne>/`) for recent scene entries.
4. Read `<campaign>/Histoire.md` for larger narrative arcs if recent scenes don't provide enough context.
5. Render a prose narrative summary, cinematically framed, with no mechanical labels.

## Test

Output reads as flowing prose narrative; no mechanical labels (e.g., "Status:", "Tag:", "Challenge:", "Countdown:") appear anywhere.
