# 04 - npc

Creates or develops an NPC **created by the GM** (distinct from the player-character managed by `pc`, and from the canon lore).

## Inputs

- `campagne` (required) — campaign name.
- `pnj` — name or role; otherwise, propose from the scenario/the fronts.

## Outputs

NPC entry in `R/_univers/<univers>/mj/personnages.md` (GM creation) + possible role notes on the campaign side. `canon/` unchanged. Mark the `[To complete]`.

## Process

1. **Read the context**: `config.yaml` (target setting, expected NPC depth), the **canon** characters/factions (`R/_univers/<univers>/canon/`) AND MJ (`mj/`), the `synopsis.md` and the scenario that invokes it. If the targeted NPC is canon, do not rewrite it: create an MJ sheet that **extends** it and `[[links]]` it.
2. **Define the NPC (durable, GM creation)**:
   - Identity: name, role, first impression / façade.
   - **Motivation & agenda**: what they want, what they will do to get it (tied to a faction if relevant).
   - **Secret / leverage**: what they hide, what makes them manipulable.
   - **Voice**: 2–3 speech or behavior tics to play them quickly.
   - **Mechanical tags**: strengths/weaknesses, possible statuses (per the game system — consult the references, do not invent).
3. **Write into `mj/`**: add/complete the NPC in `R/_univers/<univers>/mj/personnages.md` (one piece of info in a single file, do not overwrite, synthesize if > ~250 lines). `[[link]]` the faction (`mj/` or `canon/factions.md`). **Never write into `canon/`**. If the NPC contradicts the canon, report it.
4. **Campaign-specific**: if the NPC has a role/stance specific to *this* game (link to the PC's red line, involvement in an active front), record it on the campaign side — in the relevant scenario (`scenarios/`) or `fronts.md` — referencing the `mj/` sheet, without duplicating it. **If no campaign exists yet** (no `config.yaml`), the write on the setting side `mj/` (step 3) **suffices**: defer the campaign-side notes until a campaign is bootstrapped via `campaign` — never fabricate a campaign folder here.
5. Update the campaign's `index.md` (NPC in play → link to `mj/`) — **if a campaign exists**; otherwise defer.

## Test

The NPC entry lives in `R/_univers/<univers>/mj/personnages.md` (never in `canon/`, not duplicated), contains at least motivation/agenda + a secret/leverage, the mechanical tags (if any) come from the rules references, and any extension of a canon NPC `[[links]]` it without rewriting it.
