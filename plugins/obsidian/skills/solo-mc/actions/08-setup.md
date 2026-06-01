# 08 - Setup

Configure a new campaign interactively through a guided questionnaire.

## Inputs

- `name` (required) — string, campaign folder name (will be created under the JdR root directory)

## Outputs

`<campaign>/config.yaml` with:
- Universe and setting
- Party type (sandbox / scenario / one-shot / campaign)
- Player character name and concept
- Starting point, tone, difficulty, pacing
- Objectives, stakes, elements to favor / avoid
- Game system
- Resource management, chaos level, NPC and location depth

## Process

1. Ask the user for the campaign name if not provided.
2. Run the interactive questionnaire, one question at a time:
   - Universe and setting
   - Party type
   - Player character (name, concept, system)
   - Starting point
   - Tone and atmosphere
   - Difficulty level
   - Narrative pacing
   - Objectives and stakes
   - Elements to favor / avoid
   - Game system (if not already given)
   - Resource management style
   - Chaos level
   - NPC depth
   - Location depth
3. Create the campaign folder structure: `<campaign>/`, `<campaign>/sessions/`, `<campaign>/pj/`.
4. Write `<campaign>/config.yaml` with all gathered values.
5. Write `.current-session` with the new campaign name.
6. Confirm creation with a structured summary of all configured options.

## Test

`<campaign>/config.yaml` exists and contains a `system` field plus at least 5 other configured keys.
