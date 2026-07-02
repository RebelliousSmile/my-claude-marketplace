# 05 - faction

Creates or develops a faction (durable setting lore) **and** its **fronts** (active clocks, campaign state).

Key distinction: the **faction** is durable setting data → `mj/` sub-tree (GM creation) or existing in `canon/`; its **fronts/clocks** are the **state of a game** → campaign side.

## Inputs

- `campagne` (required) — campaign name (for the fronts); its `config.yaml › univers` designates the setting.
- `faction` — name; otherwise, propose from the `synopsis.md` or the `factions.md` (`canon/` and `mj/`).

## Outputs

- Faction (GM creation) in `R/_univers/<univers>/mj/factions.md` (nature, agenda, key NPCs); `canon/` unchanged.
- Active fronts/clocks in `R/_campagnes/<campagne>/fronts.md`, linked to the faction + to the pressure on the PC.

## Process

1. **Read the context**: `R/_univers/<univers>/canon/{factions,personnages}.md` AND `mj/{factions,personnages}.md`, `synopsis.md`, `config.yaml` (chaos, difficulty).
2. **Define the faction (GM creation)**: nature, resources, territory / sphere of influence, **agenda** (long-term goal), key NPCs (`[[link]]`).
   → Write/complete in `R/_univers/<univers>/mj/factions.md` (one piece of info in a single file, do not overwrite). **Never write into `canon/`**; if the faction is canon, create an `mj/` sheet that extends it and `[[links]]` it, without silently contradicting the canon.
3. **Define the fronts (campaign)**: 1–3 concrete clocks (`◷ 0/4 → event`), what advances them, what happens at the deadline, and the **pressure on the PC** (threat to the red line / the stakes). These are the clocks that `solo-mc` will progress during play.
   → Write into `R/_campagnes/<campagne>/fronts.md` (game state), `[[linking]]` the faction.
   → **If no campaign exists yet**: the faction on the setting side `mj/` (step 2) is written, but the fronts/clocks are a **game state** with no campaign to land in — first bootstrap the campaign via `campaign`, or defer the fronts. Never create a campaign folder implicitly.
4. Update the campaign's `index.md` (current fronts section).

## Test

The MJ faction is in `R/_univers/<univers>/mj/factions.md` (never in `canon/`, not duplicated), with an agenda; at least one numbered clock (state + trigger + deadline) exists in `R/_campagnes/<campagne>/fronts.md` and references the faction.
