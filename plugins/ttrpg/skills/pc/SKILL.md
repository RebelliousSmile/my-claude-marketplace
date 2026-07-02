---
name: pc
description: >-
  Manages JDR solo player-character files stored in R/_pjs/<pj>/ — create a new PJ,
  fill or reorganize its files, log a game session (game system), display the character
  sheet tied to the active campaign, or manage the PJ's companions (the recurring team).
  Use when the user's message is about PJ management in a solo JDR domain or invokes
  /ttrpg:pc with a player-character intent.
  Do NOT use for campaign prep (scénarios, PNJ, factions) — use `campaign`; nor for live play
  (scene, oracle, roll) — use `ttrpg:solo-mc`.
disable-model-invocation: true
---

# PC — Player Character

Manages player character folders stored in `R/_pjs/<pj>/`.
Routes to the appropriate action based on user intent.

**Domain `R` resolution (local, discovery)** — `pc` operates relative to a reference directory (argument passed, else CWD) and **discovers** the game domain `R`: walk up the parents to the first folder containing one of the markers `_campagnes/`, `_univers/` or `_pjs/` — that folder is `R` (typically `Perso/RPG/<jeu>/`, but relocatable anywhere). No marker found → the target is not inside an initialized JDR domain: report it. **No absolute path, no per-machine config**: everything is relative to `R`. Characters live in `R/_pjs/<pj>/`. Full reference: `../../references/jdr-layout.md`.

## Available actions

| #   | Action        | Role                                                              | Input                     |
| --- | ------------- | ----------------------------------------------------------------- | ------------------------- |
| 01  | `new`         | Create a new PJ folder from the `_template/`                      | PJ name                   |
| 02  | `fill`        | Fill PJ files from a pasted text (brainstorm, notes, etc.)        | PJ name, source text      |
| 03  | `reorganize`  | Redistribute content to the 6 standard files                      | PJ name or loose .md file |
| 04  | `log-session` | Update PJ files after a game session (game system)                | PJ name, session info     |
| 05  | `show`        | Display the current character sheet (tags, statuses, relations)   | PJ name or active session |
| 06  | `companion`   | Create / fill / show a companion sheet (autonomous or by reference); register it in the PJ-level team roster | companion name |
| 07  | `background`  | Build the PJ's background through a questionnaire tailored to the game's **genre** | PJ name, genre |
| 08  | `sessions`    | List **all** the PJ's played sessions, aggregated across its campaigns + the PJ axis (read-only) | PJ name |

Each action is defined in `actions/<NN>-<slug>.md` (Inputs → Outputs → Process → Test).

## Default flow

Router — dispatches based on user intent:

- "nouveau PJ", "créer PJ", "new PJ", "créer <nom>" → `new`
- "remplir PJ", "fill PJ", "remplir les fichiers" → `fill`
- "réorganiser PJ", "reorganize", "restructurer <nom>" → `reorganize`
- "log session", "mettre à jour après session", "fin de session" → `log-session`
- "afficher PJ", "fiche personnage", "show PJ", "/pj" → `show`
- "compagnon", "companion", "team", "équipe", "allié", "ajouter un compagnon" → `companion`
- "construire le background", "background", "questionnaire", "aide-moi à créer le perso", "construire le perso" → `background`
- "toutes les sessions", "liste des sessions", "sessions jouées", "historique des parties", "list sessions", "lister les séances" → `sessions`

## Transversal rules

- PJ root: `R/_pjs/<pj>/` (`R` discovered locally via `_campagnes/`, `_univers/` or `_pjs/` marker — see resolution above)
- Template (shared, in `R`): `R/_shared/pj-template/`
- Manager script (shared, in `R`): `R/_shared/pj-manager.py`
- Ask for the PJ name if not supplied via `$ARGUMENTS`. List existing folders in `R/_pjs/`.
- Rules reference (terminology and mechanics): the active **game system**'s rules-keeper-optimized rules at `R/_systeme/{canon,mj}/` (official `canon/` + GM house rules `mj/`), produced by `obs:rules-keeper`. Effective rules = canon + declared house rules. **Generic subsystems** (Parallaxe, Cinério, Muses et Oracles) are live-play tools consumed by `ttrpg:solo-mc` only — `pc` does not reference them.
- Never invent mechanics — always consult the references above.
- **Rules unavailable** — if `R/_systeme/canon/` (output of `rules-keeper`) does not exist yet (for example, raw sources not yet dispatched: re-run `extract-pdf` then `rules-keeper`), the rules references above are unavailable: invent no mechanics, ask the user to regenerate the system. The house rules `R/_systeme/mj/` and the lore `R/_univers/<univers>/canon/` do not depend on this regeneration.
- The `_template/` and `pj-manager.py` reflect the active **game system**; for any mechanical term, this skill defers to the rules-keeper references (`R/_systeme/{canon,mj}/`) of the game system above. (Subsystems — Parallaxe, Cinério, Muses et Oracles — remain the purview of `ttrpg:solo-mc`.)
- Date format: `YYYY-MM-DD` throughout all files.
- **Session dating / numbering** — dated session journals live at `R/<AAAA>/<MM>/<pj>/session-<AAAA-MM-JJ>-<N>.md`. Number them and pick "the last session" with the **canonical session ordering** (`../../references/jdr-layout.md › Ordre canonique des séances`), shared with `ttrpg:solo-mc`: `<N>` is the authority, extracted by suffix form (never read a date day as `<N>`); exclude `-prep-`; the last session is the file of **maximal `<N>`**. This is the same key `solo-mc`'s `play`/`play-resume` use — `pc` and `solo-mc` must agree on which session is the last.
- **Companions (PJ's team)** — The PJ can have a **team** of companions played **by substitution** (recreate the feel of a tabletop session, not drive 4–5 full PCs). Lightweight **wrapper** sheets in `R/_pjs/<pj>/compagnons/<slug>.md`.
  - **Roster.** The reference roster lives **at the PJ level**: `R/_pjs/<pj>/compagnons/_roster.yaml`. It is thus definable **without an active campaign** (a team can be built from PJ creation onward). When a campaign starts, its `config.yaml` (key `compagnons:`) **references** this PJ-level roster (via `roster: _pjs/<pj>/compagnons/_roster.yaml`, or by copying the `actif: true` entries) rather than redefining it.
  - **Sheet by reference.** A companion sheet can either be autonomous (*Minimal playable* shape — see the `companion` action), or **reference an existing canonical character sheet** (a setting pre-gen, a mue, an univers NPC) via the `ref:` field. In that case, the wrapper sheet does **not** duplicate the mechanics: it points to the canonical source and adds only role in the team, link to the PJ and current state. This is the recommended mode when the companion already has a complete sheet elsewhere (e.g. `_univers/<univers>/pretires/<x>.md`).
  - Read by `ttrpg:solo-mc` in play (substitution) — `pc` holds the data, play is solo-mc's business.

## References

- `references/genres-et-background.md` — genre-driven background questionnaire (common trunk, signature questions per family, GROG mapping table). Used by `background`.
- `../../references/jdr-layout.md` — full JDR domain layout.
