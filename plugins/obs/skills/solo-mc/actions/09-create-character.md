# 09 - Create Character

Create an interactive character sheet for a supported game system.

## Inputs

- `system` (optional, default: detected from config.yaml) — string, game system (otherscape, vampire-v5, ironsworn, …)
- `campaign` (optional, default: from `.current-session`) — string, campaign folder name

## Outputs

`<campaign>/pj/<character-name>.md` — fully filled character sheet in the game system's format.

## Process

1. Detect campaign and system from `.current-session` and `<campaign>/config.yaml` if not provided.
2. If system is unrecognized, ask the user to specify it.
3. Invoke the `character-creator` skill with the detected or provided system.
4. Run the interactive interview (system-specific: attributes, skills, background, motivations, special abilities).
5. Write the completed sheet to `<campaign>/pj/<character-name>.md`.
6. Confirm with a brief summary of the created character (name, archetype, key traits).

## Test

`<campaign>/pj/<name>.md` exists after the action and contains system-specific fields (at least an attributes or skills section).
