# 06 - review

Checks the consistency and playability state of the prep before playing with `solo-mc`.

## Inputs

- `campagne` (required) — campaign name.

## Outputs

A report by severity (blocking / warning / note) with, for each finding, the file concerned and the fix. Verdict: READY TO PLAY / TO COMPLETE / INCONSISTENT (INCONSISTENT or TO COMPLETE if ≥ 1 blocking).

## Process

Read the campaign prep (`synopsis.md`, `scenarios/`, `prep/`, `fronts.md`, `config.yaml`), the linked setting data (`R/_univers/<univers>/canon/` and `mj/`: `personnages.md`, `factions.md`, `geographie.md`) and the PC's `intention.md`, then check — report by severity, fix on request:

1. **Serving the PC** (blocking) — at least one scenario/hook touches the PC's red line or visceral question; otherwise the prep does not serve the player.
2. **Playable fronts** (blocking) — each active faction has at least one numbered clock (state + trigger + deadline) in `fronts.md`, which `solo-mc` can advance.
3. **Canon/MJ provenance** (blocking) — no `campaign` write into `canon/`; no entity duplicated between `canon/` and `mj/` (one entity in a single sub-tree, the MJ extension `[[links]]` the canon); no MJ content contradicting the canon without reporting it.
4. **Actionable scenarios** (warning) — each scenario has scene seeds AND possible outcomes (not a fixed script, not a mere idea).
5. **Playable NPCs** (warning) — each NPC in play has motivation + secret/leverage + a voice.
6. **Links & setting tree** (warning) — the `[[links]]` scenario→setting (canon/ and mj/) resolve; no setting data duplicated on the campaign side; `index.md` up to date.
7. **Config conformity** (note) — the prep's tone/pace/chaos consistent with `config.yaml`.
8. **Game system** (blocking) — no mechanic invented outside the game system references.
9. **Preparatory information arbitrated** (warning) — every piece of prep has an explicit status: durable truths **promoted** to a fiction `mj/` (campaign or universe), session scaffolding **kept** as named prep, obsolete content **deleted**. Flag any **durable truth left stuck in a working file** (an NPC/place/fact that the campaign needs but lives only in `prep/`) and any prep file being treated as canon. Ref: `../../references/jdr-layout.md › Arbitrage des informations préparatoires (campaign)`.

## Test

Each finding cites a file and a fix; the verdict is "ready to play" only if no blocking remains (serving the PC, numbered fronts, canon/MJ provenance respected, game system mechanics conformant). The review also reports any preparatory information without a clear status — in particular a durable truth stuck in a working file instead of promoted to `mj/`.
