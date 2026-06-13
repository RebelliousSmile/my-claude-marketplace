# 03 - prep-session

Prepares the next session: the light roadmap that `solo-mc` will consume during play.

## Inputs

- `campagne` (required) — campaign name.
- `session` — session number (default: last + 1, deduced from the session logs).

## Outputs

`R/_campagnes/<campagne>/prep/session-<n>.md` (objective, likely scenes, pre-armed oracle questions, fronts to advance, tables, PC hooks). Does not modify `.session-state.yaml` (it is `solo-mc` that writes it during play).

## Process

1. **Read the state**: `R/_campagnes/<campagne>/.session-state.yaml` (current location, active NPCs, statuses, countdowns), `config.yaml` (pace/tone), the active scenario (`scenarios/`), the active fronts (`R/_campagnes/<campagne>/fronts.md`), the linked setting data (`R/_univers/<univers>/canon/` and `mj/`), and the PC's `journal.md`/backlog via `pc` if relevant.
2. **Define a session objective**: the likely dramatic question of the session (1 sentence).
3. **List 3–5 likely scenes**: trigger + stake + NPCs/location involved (seeds, not script).
4. **Pre-arm the oracle**: 3–6 yes/no or fate questions likely to be asked, with their probability — to smooth play with `solo-mc`.
5. **Advance the fronts**: which clocks progress if the PC does not intervene.
6. **Targeted random tables** (optional): encounters, complications, loot — adapted to the chaos level of the `config.yaml`.
7. **PC hooks**: 1–2 hooks tied to the red line / visceral question.
8. **Write** `R/_campagnes/<campagne>/prep/session-<n>.md`.

## Test

The prep file lists a session objective, ≥ 3 likely scenes and ≥ 3 pre-armed oracle questions, references the active scenario/fronts, and does not write into `R/_campagnes/<campagne>/.session-state.yaml`.
