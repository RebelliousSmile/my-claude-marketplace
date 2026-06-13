# 04 - Roll

Roll dice for a system action, applying the active game's mechanics.

## Inputs

- `formula` (required) — string, dice formula (e.g., 2d6, d100, 4dF, 2d6+3)
- `system` (optional, default: detected from config.yaml) — string, game system name
- `dc` (optional) — integer or string, target number or difficulty class

## Outputs

Dice roll result:
- Individual dice values
- Total result
- Success / failure assessment (when DC is provided)
- Brief mechanical interpretation per the game system

## Depends on

`play` or `play-resume`

## Invoked by

Two entry paths:
- **Explicit player request** — `/roll`, « lance les dés / 2d6+3 », etc.
- **Fiction-driven, from the narrateur** — when a PC action is uncertain + staked (see `agents/narrateur.md` › *Mechanic triggering*), the active system supplies the `formula` (e.g. `2d6 + stat`, `d100 ≤ skill%+stat%`, `d20+mod vs DC`) and the outcome model. This action then **applies and logs the system's outcome** (PbtA tiers 10+/7-9/6-; or roll-under success/failure with X0 criticals; or margin vs DC) and any failure bookkeeping that system prescribes (e.g. +1 PX, a stress level, a complication) — exactly as canon defines it, never another system's. The MC never rolls the PC's dice — the player rolls; this action resolves and records.

## Process

1. If `system` not provided, read `<campaign>/config.yaml` to detect it from `.current-session`.
2. Invoke the `dice-roller` skill with `formula`, `system`, and `dc`.
3. Display individual dice values, total, and success/failure status.
4. Append the roll result to the current session file as a log entry.

## Test

The roll output shows individual dice values and a total; a success/failure label appears when DC is provided.
