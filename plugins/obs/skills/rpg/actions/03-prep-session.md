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
9. **Arbitrate the preparatory information** — before closing, give **each piece** produced an explicit status (visible and reproducible): **canon → promote** the durable truths invented while prepping (a named NPC/place/faction, a world fact, an established secret) into a fiction `mj/` — `R/_campagnes/<campagne>/mj/` (campaign scope) or `R/_univers/<univers>/mj/` (world scope); `rpg` writes **only into `mj/`**, never `canon/`; **temporary → keep** the session scaffolding (likely scenes, pre-armed oracle questions, tables, hooks) inside this `prep/session-<n>.md`, named as prep; **disposable → delete** anything obsolete. The prep file never substitutes for canon, and **no durable truth is left stuck** in it. Full table: `../../references/jdr-layout.md › Arbitrage des informations préparatoires (rpg)`.

## Test

The prep file lists a session objective, ≥ 3 likely scenes and ≥ 3 pre-armed oracle questions, references the active scenario/fronts, and does not write into `R/_campagnes/<campagne>/.session-state.yaml`. Every piece of preparatory information has an explicit status — durable truths promoted to a fiction `mj/` (never `canon/`), session scaffolding kept as named prep, obsolete content deleted — with nothing important left stuck in the working file.
