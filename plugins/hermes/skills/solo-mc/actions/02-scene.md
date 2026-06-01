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

1. Apply T13 decisional grid (see SKILL.md) to every element that will be introduced or resolved in this scene. Note: any new NPC or place introduced in the scene triggers the "new named element" branch of T13 — name it, write a one-line description, and promote to `campagnes/<campagne>/mj/` (or `univers/<univers>/mj/` if world-level).
2. Read `.current-session` to identify the active campaign.
3. Read `<campaign>/sessions/.session-state.yaml` for current game state (location, active NPCs, ongoing statuses, countdowns).
4. Read `<campaign>/config.yaml` for tone, pacing, and difficulty settings.
5. Invoke `mj-solo-agent` with current state, optional `type`, and `context`.
6. Display the scene output and append it to the current session file.

## Test

The generated scene references at least one active NPC or location from session-state.yaml.
