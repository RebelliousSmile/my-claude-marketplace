# 06 - Status

Show the current mechanical game state: progress, challenges, countdowns, and NPC relations.

## Inputs

- `campaign` (optional, default: from `.current-session`) — string, campaign folder name

## Outputs

Mechanical state dashboard with labeled sections:
- Progress statuses
- Active statuses
- Burnt / acquired tags
- Active challenges
- Countdowns
- NPC relations
- Campaign objectives

## Process

1. Detect campaign from `.current-session` if not provided; error if absent.
2. Read `<vault>/<jeu>/_campagnes/<campagne>/.session-state.yaml` for the full mechanical state.
3. Read `<campaign>/config.yaml` for campaign objectives and difficulty settings.
4. Read `<campaign>/pj/<character>.md` for character-level mechanical data.
5. Render a structured dashboard with each category labeled and sorted by urgency.

## Test

Output contains at least three labeled mechanical sections (e.g., Statuses, Challenges, Relations) populated with data from session-state.yaml.
