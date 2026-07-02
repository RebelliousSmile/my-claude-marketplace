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

1. Apply T13 decisional grid (see SKILL.md) to every element that will be introduced or resolved in this scene. Note: any new NPC or place introduced in the scene triggers the "new named element" branch of T13 — name it, write a one-line description, and promote to `R/_campagnes/<campagne>/mj/` (or `R/_univers/<univers>/mj/` if world-level).
1b. If MC narrative logic dictates the party separates, enter companion mode (T14): load the companion roster from `config.yaml › compagnons:`, select the companion relevant to the split, load their sheet from `R/_pjs/<pj>/compagnons/<slug>.md`, note the PC's exact narrative position in `R/_campagnes/<campagne>/.session-state.yaml` (`active_character: <companion-slug>`, `pc_frozen_at: <narrative-beat>`), play the companion scene, resync timelines so both characters reach the same temporal moment, then reset `active_character` to the PC. Note: the companion scene is still subject to T13 — the decisional grid applies normally throughout.
2. Read `.current-session` to identify the active campaign.
3. Read `R/_campagnes/<campagne>/.session-state.yaml` for current game state (location, active NPCs, ongoing statuses, countdowns).
4. Read `<campaign>/config.yaml` for tone, pacing, and difficulty settings.
5. Invoke `narrateur-agent` with current state, optional `type`, and `context`. The narrateur applies **mechanic triggering** (see `agents/narrateur.md` › *Mechanic triggering*) before narrating any outcome: **an uncertain, staked PC action is resolved by the active system's rules** (`R/_systeme/canon/`) — name what's resolved → request the roll the system prescribes (`2d6+stat` PbtA, `d100 ≤ skill%+stat%` percentile, `d20 vs DC`…) from the player → apply the canon outcome model → on failure, the bookkeeping that system prescribes — **never** free-narrated. A staked beat the **system** resolves does **not** go to the oracle — only beats the system doesn't resolve (pure chance / world decision) follow T13's oracle branch.
6. Display the scene output and append it to the current session file.

## Test

The generated scene references at least one active NPC or location from session-state.yaml.
