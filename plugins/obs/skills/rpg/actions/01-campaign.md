# 01 - campaign

Creates a campaign if it does not exist yet (bootstrap of the `config.yaml` + structure) **and** bootstraps its GM preparation layer (the GM material).

## Inputs

- `campagne` (required) — campaign name. Ask if absent; list the folders in `R/_campagnes/` containing a `config.yaml`.
- `univers` (optional) — setting slug; failing that: if there is **only one** setting under `R/_univers/`, deduce it; if there are **several**, **always list `R/_univers/` and ask** — never deduce silently.
- `pj` (optional) — canonical PC to attach (list `R/_pjs/`).

## Outputs

If the campaign did not exist: `R/_campagnes/<campagne>/config.yaml` + structure (`pj/`, `scenarios/`, `prep/`). In all cases: `synopsis.md` + prep structure (`fronts.md`, `index.md`) + the setting tree `R/_univers/<univers>/{canon,mj}/` (created or identified). List the proposed fronts and the `[To complete]`.

## Process

1. **Check / bootstrap the `config.yaml`** in `R/_campagnes/<campagne>/`.
   - **If it exists**: read it and go to step 2.
   - **If it is missing: bootstrap the campaign** (minimal bootstrap — do NOT run a long questionnaire; ask only the indispensable missing items: the setting, and the PC to attach). *(Previously delegated to `/obs:solo-mc setup`; `rpg` now handles it. If `obs:solo-mc` is installed, it can refine/manage the `config.yaml` later — but it is not required to start.)*
     1. Create the folder `R/_campagnes/<slug-campagne>/` with the structure `pj/`, `scenarios/`, `prep/`.
     2. Write a **minimal playable** `config.yaml`:
        ```yaml
        jeu: <jeu>
        univers: <univers-slug>
        type: campaign
        lore:
          canon: _univers/<univers>/canon/
          mj: _univers/<univers>/mj/
        systeme:
          canon: _systeme/canon/
          mj: _systeme/mj/
        pjs:
          - <pj-slug>
        pj_canonique: _pjs/<pj-slug>/
        pj_campagne: _campagnes/<slug-campagne>/pj/<pj-slug>.md
        compagnons:
          roster: _pjs/<pj-slug>/compagnons/_roster.yaml   # if the PC has a team (skill pc) ; otherwise omit
        # ── game tuning (tone, approach, difficulty, pace, chaos, gauges) : DELIBERATELY ABSENT ──
        # solo-mc's domain (its setup). rpg writes ONLY the identity/wiring above.
        ```
     3. **Do not write the game tuning** (`ton`, `approche`, `difficulte`, `rythme`, chaos, sub-system profiles): it belongs to **`solo-mc`** and will be filled in by its setup at play time. `rpg` limits itself to the **identity/wiring** — just enough to anchor the GM prep. Invent nothing.
     4. If a PC is attached but `pj/<pj-slug>.md` (campaign instance) does not exist, create it as a stub that `[[links]]` the canonical PC (`_pjs/<pj-slug>/`) — the detailed instance is filled at play launch.
2. **Read the context**: `config.yaml` (setting, tone, pace, difficulty, chaos, NPC/location depth) and, if a PC is attached, its `R/_pjs/<pj>/intention.md` (themes, red line, visceral question).
3. **Attach the setting**: from `config.yaml › univers`, target `R/_univers/<univers>/`. If the tree does not exist, create **two thematic sub-trees** `canon/` (official lore) and `mj/` (GM creation), each with `terminologie.md`, `factions.md`, `personnages.md`, `histoire.md`, `geographie.md`. If there are raw canonical sources, propose `/obs:lore-extract` to record them **into `canon/`**; the content created by the GM will go into `mj/` (via `npc`, `faction`, `scenario`).
4. **Write `R/_campagnes/<campagne>/synopsis.md`**: premise, themes (aligned with the PC's intent), tone, central stakes, hidden truths, campaign dramatic question. **If no PC is attached** (no `_pjs/<pj>/intention.md`), write the themes and the dramatic question as `[To complete]` and signal that they will anchor on the `intention.md` via `pc` — never invent the visceral question nor the red line.
5. **Create the campaign prep structure** if absent: `scenarios/`, `prep/`, `fronts.md` (active clocks), plus an `index.md` that lists scenarios and current fronts and links the setting. *(NPCs, factions and durable locations live in the setting, not here.)*
6. **Propose 2–3 starting fronts** (clocks) to detail later via `faction`.

## Test

`config.yaml` exists (created or pre-existing) with at minimum `jeu`, `univers`, `type`, `pjs`; `synopsis.md` exists and its themes refer to the PC's `intention.md` (if a PC exists); the campaign prep structure is created; the setting is attached with its two sub-trees `canon/` and `mj/`; the `index.md` links the setting and lists the present elements.
