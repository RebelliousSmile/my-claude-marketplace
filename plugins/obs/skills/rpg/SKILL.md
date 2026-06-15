---
name: rpg
description: >-
  Prepares the GM side of a solo TTRPG campaign — scenario writing and campaign
  preparation: synopsis, fronts/clocks, NPCs, factions, locations, session prep, hooks. Complements `pc`
  (player-character sheets) and `solo-mc` (live play): here we prepare, with solo-mc we play.
  Use when the user invokes /obs:rpg with a scenario or campaign-prep intent.
  Do NOT use for live play (scene/oracle/roll → solo-mc), for managing the PC sheet (→ pc),
  nor for non-TTRPG narrative fiction (→ writing plugin).
disable-model-invocation: true
---

# RPG — scenarios & campaign preparation

Preparation companion for solo TTRPG. Produces the **game material** a GM prepares before the table: situation, plots, NPCs, factions, locations, session prep. This material draws on the PC's intent (skill `pc`) and is consumed during play by `solo-mc`.

Split between the three skills: `pc` = the player-character sheet · `rpg` = the GM prep (here) · `solo-mc` = live play.

**Interactive creation mode — not a filing tool.** Filing/distributing information into the right files is the role of `lore-extract` (sources → `canon/`). `rpg` is different: it is a **GM creation workshop** where you **start from the canon** (established official lore) and where you **imagine, in dialogue with the user, what will be played with the players** — which situations, which fronts, which hooks for *this* PC and their team. The produced files (`mj/`, synopsis, scenarios, fronts) are the **residue** of this creation, never the goal. So: **proceed by back-and-forth** — read the canon, propose 2-4 directions, let the user choose and inflect, *then* record. Never produce a complete campaign or scenario in a single block without having drawn out the choices with the user.

## Available actions

| #   | Action         | Role                                                                  | Input                        |
| --- | -------------- | --------------------------------------------------------------------- | ---------------------------- |
| 01  | `campaign`     | Creates the campaign (config.yaml + structure) if absent, then bootstraps its prep (synopsis, fronts, index) | campaign name                |
| 02  | `scenario`     | Writes a playable scenario / situation                                | campaign, pitch/idea         |
| 03  | `prep-session` | Prepares the next session (likely scenes, hooks, tables)              | campaign, session number     |
| 04  | `npc`          | Creates / develops a setting NPC (durable, shared)                    | setting/campaign, NPC name   |
| 05  | `faction`      | Faction (setting) + its active fronts/clocks (campaign)              | campaign, faction name       |
| 06  | `review`       | Checks the consistency and playability state of the prep             | campaign                     |

## Default flow

Router — dispatch by intent:

- "new campaign", "prepare my campaign", "bootstrap the campaign <name>" → `campaign`
- "write a scenario", "scenario", "playable situation", "adventure" → `scenario`
- "prepare the session", "session prep", "next session" → `prep-session`
- "create an NPC", "new NPC", "develop <NPC>" → `npc`
- "create a faction", "front", "clock", "a faction's agenda" → `faction`
- "check my prep", "review", "is it playable", "consistency" → `review`

## Resolving the `R` domain (local, discovery)

`rpg` operates relative to a **reference directory** (passed argument, otherwise CWD) and **discovers** the game domain `R`: climb the parents up to the first folder containing one of the markers `_campagnes/`, `_univers/` or `_pjs/` — that folder is `R` (typically `Perso/RPG/<game>/`, but movable anywhere). No marker found → the target is not within an initialized TTRPG domain: report it. Always check the existence of a resolved path before reading/writing. **No absolute path, no per-machine config**: everything is relative to `R`. Full reference: `../../references/jdr-layout.md`.

## Transversal rules

- **Everything is relative to `R`**: a campaign lives in `R/_campagnes/<campaign>/` (same convention as `solo-mc`), with `config.yaml`, `pj/`.
- **`<univers-root>` (resolving the setting)** : a **setting is a game universe**, stored under `R/_univers/<univers>/` — even when it is vast (extended product line, several editions, e.g. 7th Sea / Théah for the game Noblesse Oblige). A domain `R` can have **several settings**; each setting is shared by the **group of campaigns** that take place within it. The campaign declares its own (`config.yaml › univers: <slug>`). In the rules below, `<univers-root>` = `R/_univers/<univers>/`.
- **Two levels to distinguish**:
  - **Setting data (durable, transverse to campaigns)** — terminology, factions, characters, locations/geography, history. They live in the **tree shared with `lore-extract`**: `<univers-root>/` (= `R/_univers/<univers>/`), **split by provenance into two identical thematic sub-trees**:
    - `canon/` — **official/established** lore, extracted from sources via `lore-extract`. Authoritative.
    - `mj/` — content **created by the game master** (invented for the game), written by `rpg`.

    Each sub-tree contains the same files (`terminologie.md`, `factions.md`, `personnages.md`, `histoire.md`, `geographie.md`, + optional `magie.md`, `technologie.md`, `creatures.md`, `religions.md`, `economie.md`).
  - **Campaign prep (specific to one game)** — scenarios, session prep, active fronts/clocks, PC hooks. It lives **in the campaign folder**: `R/_campagnes/<campaign>/{scenarios,prep}/` + the state of the fronts.
- **Conventions of the setting tree** (aligned with `lore-extract`) : one piece of information in **a single file** (the others reference/`[[link]]` it); max ~250 lines per file (otherwise synthesize); written in French; never overwrite an existing file — complete it. So that the files coincide, `lore-extract` targets the `canon/` of the same `<univers-root>`.
- **Canon vs MJ provenance**: `rpg` writes **only into `mj/`** (content created by the game master) and **never** modifies `canon/` (reserved for `lore-extract`, which is authoritative). An entity lives in **a single** sub-tree — if the GM extends a canon entity, create the sheet in `mj/` that `[[links]]` the canon entry, without duplicating it. MJ content must **not silently contradict the canon**: report any divergence. When reading, `canon/` takes precedence for established facts, `mj/` adds the GM layer.
- **Canonical PC vs campaign instance**: the durable character lives in `R/_pjs/<pj>/` (skill `pc`, source of the `intention.md`); the played instance of a campaign lives in `R/_campagnes/<campaign>/pj/` (`solo-mc`) and **references** the canonical PC. `rpg` always anchors on the canonical `intention.md` from `pc`; if only a campaign PC exists, report it and propose attaching it to a `pc` PC.
- The campaign declares its setting (`config.yaml › univers: <slug>` → `R/_univers/<univers>/`; a domain may have several); failing that, ask which setting and list those present under `R/_univers/`.
- Ask for the campaign name if it is not in `$ARGUMENTS`; list the existing campaigns under `R/_campagnes/` (folders containing a `config.yaml`).
- If `config.yaml` is absent, the action **`campaign` bootstraps it** — but **only the identity/wiring** (`jeu`, `univers`, `type`, `pjs`, `pj_canonique`, lore/system refs, companion roster). The **game tuning** (`ton`, `approche`, `difficulte`, `rythme`, chaos, gauges) **is NOT written by `rpg`**: it belongs to `solo-mc` (its setup), at play time. **Do not run a questionnaire** — ask only for the setting and the PC to attach.
- **Game system**: for any mechanic (rewards, NPC tags, challenges), `rpg` consults the rules of the game system in rules-keeper format (`obs:rules-keeper`), split canon/mj, under `R/_systeme/{canon,mj}/`. Effective rules = canon + declared house rules. **Never invent a mechanic.** Two unavailability cases to distinguish: if `R/_systeme/canon/` is **absent**, ask for regeneration (`extract-pdf` then `rules-keeper`); if the system is **present but silent** on the requested mechanic (e.g. no XP/progression track in a simulation system), **report it** as not covered by the system — never fill the silence with an invented mechanic. The **generic sub-systems** are **live-play tools** consumed by `solo-mc` only — outside the scope of `rpg`.
- **Agent procedure vs TTRPG material**: if the request is about the agent's way of working, the orchestration, or the choice of tools/skills, `rpg` relies first on the relevant skills for the workflow. On the other hand, the game material, the lore, the NPCs, the fronts and the campaign remain anchored in the `R` domain.
- **Creation method (system-agnostic)**: the operational reference is **`references/methode-creation.md`** — *our* 8-step prep process (canon + intent → bootstrap the PC → relationship map → fronts/secrets → NPCs → situation scenario → braid/arc → prepare the session) + safety guardrail + checklist. It relies on **`references/corpus-recherche.md`** (sourced corpus: R-map, bangs, kicker, flags, Czege principle, fronts/clocks, poisoned gifts, mirror NPCs…) and **`references/methodes-mj.md`** (map of seeds + constraints). Everything is **transversal craft**: **no mechanic** specific to a game. A framework like the MC agenda/principles/moves is **PbtA-specific** (→ `_systeme/canon/` of the active game if it is PbtA; inapplicable to a simulation system). For any mechanic, defer to `_systeme/{canon,mj}/`.
- Serve the PC: anchor scenarios and sessions on the PC's `intention.md` (themes, red line, visceral question) managed by `pc`. The prep serves the player's stakes, not the reverse.
- Read `config.yaml` (tone, pace, difficulty, chaos, NPC/location depth) and conform to it.
- The prep is **consumed by `solo-mc`** at play time (scenes, oracle, fronts/clocks); never play live here.
- **Arbitrate preparatory information (a prep file is working material, not canon)** — the prep (`R/_campagnes/<campagne>/prep/session-<n>.md`) is a **working file**; it never stands as a canonical truth on its own and **must not substitute for canon**. At the end of every prep (and at `review`), give **each piece of preparatory information an explicit status** — visible and reproducible (two passes reach the same verdict): **(a) canon → promote** a durable truth (named NPC, place, faction, world fact, established secret) into a fiction `mj/` — `R/_campagnes/<campagne>/mj/` (campaign scope) or `R/_univers/<univers>/mj/` (world scope); `rpg` writes only into `mj/`, **never `canon/`**; **(b) temporary → keep** session scaffolding (likely scenes, pre-armed oracle questions, tables, hooks) inside `prep/session-<n>.md`, explicitly named as prep; **(c) disposable → delete** obsolete information (abandoned idea, hypothesis invalidated in play, prep of an already-played session with no durable residue). **Nothing important stays stuck in a working file**: if a truth must be part of the campaign, it is promoted to `mj/`. Full table: `../../references/jdr-layout.md › Arbitrage des informations préparatoires (rpg)`.
- Preserve existing content — complete it, never overwrite; mark the incomplete `[To complete]`; do not invent what is missing from the source.
- Date format: `YYYY-MM-DD`.

## External references (relative to `R`)

- `R/_campagnes/<campagne>/config.yaml` — campaign parameters (game tuning filled in by `solo-mc setup`)
- `R/_univers/<univers>/canon/` — official lore (read-only for `rpg`; written by `lore-extract`)
- `R/_univers/<univers>/mj/` — content created by the GM (written by `rpg`); same thematic tree as `canon/`
- `R/_pjs/<pj>/intention.md` — themes, red line, visceral question of the PC (skill `pc`)
- `R/_systeme/{canon,mj}/` — rules of the **game system** (rules-keeper format); the only mechanical reference for `rpg`. The sub-systems (`R/_subsystems/<nom>/`) are consumed by `solo-mc` only.
- Full tree convention: `../../references/jdr-layout.md`

## Evals

- `evals/scenarios.json`
