# 03 - Oracle

Query the oracle to determine a fate or yes/no answer based on the active game system.

## Inputs

- `question` (required) — string, the fate question to answer
- `probability` (optional, default: `50/50`) — string, likelihood level (certain, likely, 50/50, unlikely, no-way)

## Outputs

Oracle result:
- Dice rolled (system-appropriate formula)
- Answer (yes / no / yes-but / no-but / and…)
- Narrative interpretation of the result

## Depends on

`play` or `play-resume`

## Process

0. The oracle is called by the LLM when T13 (see SKILL.md) identifies a staked decision or a chance element — it is not a player-facing command; the player may never see the oracle call itself, only its narrative consequence. Routing: hasard (dice, random concept) → muses-et-oracles subsystem; decision (what does the world choose?) → parallaxe subsystem.
1. Read `.current-session` to identify the active campaign.
2. Read `<campaign>/config.yaml` to detect the game system and its oracle rules.
3. Resolve by applying the oracle module (`references/oracle.md`) to the question, probability level, and game system.
4. Display the dice result, answer category, and a short narrative interpretation.
5. Append the oracle result to the current session file as a log entry.

## Test

The oracle response includes the dice values rolled and a narrative interpretation consistent with the game system rules.
