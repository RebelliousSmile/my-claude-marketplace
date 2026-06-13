# 02 - scenario

Writes a scenario / a playable situation for the campaign — the core of scenario writing.

## Inputs

- `campagne` (required) — campaign name.
- `pitch` — starting idea (free paste); otherwise, derive from the `synopsis.md` and the current fronts.

## Outputs

`R/_campagnes/<campagne>/scenarios/<slug>.md` (premise, linked locations, linked NPCs, fronts, hooks, outcomes, rewards) + updated `index.md`. List the setting NPCs/factions/locations to create (via `npc`/`faction`/`lore-extract`) and the `[To complete]`.

## Process

1. **Read the context**: `synopsis.md`, `config.yaml` (tone/pace/difficulty, setting), the setting data **canon AND MJ** (`R/_univers/<univers>/canon/` and `mj/`: `personnages.md`, `factions.md`, `geographie.md`), the active fronts `R/_campagnes/<campagne>/fronts.md`, and the PC's `intention.md` (themes, red line, visceral question). The canon takes precedence; the GM extends.
2. **Build as a situation, not a linear plot** (suited to solo):
   - **Premise & stake**: what is true at the start, what will go off the rails if the PC does not act.
   - **Locations**: 3–6 key locations; `[[link]]` the existing locations (`R/_univers/<univers>/canon/` or `mj/geographie.md`), create the new ones (GM invention) in `mj/geographie.md`; record here only their staging (atmosphere, what is found there now).
   - **NPCs involved**: `[[link]]` the setting sheets (`canon/` or `mj/personnages.md`); create new ones via `npc` (written in `mj/`).
   - **Fronts & clocks**: what advances in the background (link to the campaign's `fronts.md` and to the setting factions).
   - **Scene seeds**: 4–8 scene-seeds (trigger + tension), not a fixed script.
   - **Possible outcomes**: success / failure / cost, and consequences on the fronts.
   - **Rewards**: material, narrative, and any mechanical reward specific to the game system (consult the references — do not invent).
3. **Anchor on the PC**: at least one scene-seed touches the PC's red line or visceral question.
4. **Write** `R/_campagnes/<campagne>/scenarios/<slug>.md` (the scenario is campaign prep; durable locations/NPCs/factions stay in the setting, linked); update `index.md`.

## Test

The scenario contains at least premise + locations + scene seeds + possible outcomes, `[[links]]` the NPCs/factions/locations to the setting (without duplicating them) and the fronts to the campaign, and at least one seed touches the PC's red line or visceral question.
