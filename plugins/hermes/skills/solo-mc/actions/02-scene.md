# 02 - Scene

Generate the next scene in the active campaign session.

## Inputs

- `type` (optional) — string, scene type (action, investigation, social, transition, rest)
- `context` (optional) — string, additional player intent or situation context for the scene

## Outputs

A fully rendered scene including:
- Atmosphere and sensory details
- Active NPCs and their current motivations
- Stakes, obstacles, and opportunities
- An opening line of fiction

## Depends on

`play` or `play-resume`

## Process

1. Read `.current-session` to identify the active campaign.
2. Read `<campaign>/sessions/.session-state.yaml` for current game state (location, active NPCs, ongoing statuses, countdowns).
3. Read `<campaign>/config.yaml` for tone, pacing, and difficulty settings.
4. Invoke `mj-solo-agent` with current state, optional `type`, and `context`.
5. Display the scene output and append it to the current session file.

## Test

The generated scene references at least one active NPC or location from session-state.yaml.
