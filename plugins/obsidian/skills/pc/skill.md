---
name: pc
description: >-
  Manages JDR solo player-character files stored in JDR/<jeu>/pjs/<pj>/ — create a new PJ,
  fill or reorganize its files, log a game session (système de jeu), or display the
  character sheet. Use when the user invokes /obsidian:pc with a player-character intent.
  Do NOT use for campaign prep (scénarios, PNJ, factions) — use `rpg`; nor for live play
  (scene, oracle, roll) — use `solo-mc`.
disable-model-invocation: true
---

# PC — Player Character

Manages player character folders stored in `C:/Users/fxgui/Public/Notes/Perso/JDR/<jeu>/pjs/`.
Routes to the appropriate action based on user intent.

**Racine par jeu** — le coffre est rangé **par jeu** sous `JDR/<jeu>/`. Le `<jeu>` est le premier segment sous la racine du coffre, déduit du répertoire courant d'invocation (`pc` est lancé dans l'arborescence du jeu concerné). Les personnages vivent dans `JDR/<jeu>/pjs/<pj>/`.

## Available actions

| #   | Action        | Role                                                              | Input                     |
| --- | ------------- | ----------------------------------------------------------------- | ------------------------- |
| 01  | `new`         | Create a new PJ folder from the `_template/`                      | PJ name                   |
| 02  | `fill`        | Fill PJ files from a pasted text (brainstorm, notes, etc.)        | PJ name, source text      |
| 03  | `reorganize`  | Redistribute content to the 6 standard files                      | PJ name or loose .md file |
| 04  | `log-session` | Update PJ files after a game session (système de jeu)      | PJ name, session info     |
| 05  | `show`        | Display the current character sheet (tags, statuses, relations)   | PJ name or active session |

## Default flow

Router — dispatches based on user intent:

- "nouveau PJ", "créer PJ", "new PJ", "créer <nom>" → `new`
- "remplir PJ", "fill PJ", "remplir les fichiers" → `fill`
- "réorganiser PJ", "reorganize", "restructurer <nom>" → `reorganize`
- "log session", "mettre à jour après session", "fin de session" → `log-session`
- "afficher PJ", "fiche personnage", "show PJ", "/pj" → `show`

## Transversal rules

- PJ root: `C:/Users/fxgui/Public/Notes/Perso/JDR/<jeu>/pjs/` (`<jeu>` resolved from the current working directory)
- Template (shared): `C:/Users/fxgui/Public/Notes/Perso/JDR/_shared/pj-template/`
- Manager script (shared): `C:/Users/fxgui/Public/Notes/Perso/JDR/_shared/pj-manager.py`
- Ask for the PJ name if not supplied via `$ARGUMENTS`. List existing folders in `<jeu>/pjs/`.
- Rules reference (terminology and mechanics): the active **game system**'s rules-keeper-optimized rules at `JDR/<jeu>/systeme/{canon,mj}/` (official `canon/` + GM house rules `mj/`), produced by `writing:rules-keeper`. Effective rules = canon + declared house rules. **Generic subsystems** (Parallaxe, Cinério, Muses et Oracles) are live-play tools consumed by `solo-mc` only — `pc` does not reference them.
- Never invent mechanics — always consult the references above.
- **Setup après clone (`tnn-jdr`)** — `systeme/canon/` (sortie de `rules-keeper`) et tous les `sources/` (entrées brutes des PDF) sont **gitignored** par convention : absents après un clone sur une nouvelle machine. Tant que `systeme/canon/` n'a pas été régénéré — relancer `extract-pdf` (PDF commercial requis) puis `rules-keeper` —, les références de règles ci-dessus sont indisponibles : n'inventer aucune mécanique, demander à l'utilisateur de lancer le setup. Les règles maison `systeme/mj/` et le lore `<univers>/.docs/canon/` sont versionnés et survivent au clone.
- Le `_template/` et `pj-manager.py` (hors dépôt) reflètent le **système de jeu** actif ; pour tout terme mécanique, ce skill défère aux références rules-keeper du système de jeu ci-dessus. (Les sous-systèmes — Parallaxe, Cinério, Muses et Oracles — restent du ressort de `solo-mc`.)
- Date format: `YYYY-MM-DD` throughout all files.

## Action: new

Runs:
```bash
python "C:/Users/fxgui/Public/Notes/Perso/JDR/_shared/pj-manager.py" new "<nom>" --into "C:/Users/fxgui/Public/Notes/Perso/JDR/<jeu>/pjs"
```

The script copies the template, slugifies the name for the folder, and replaces `[Nom du PJ]` in all `.md` files.

Files created: `pj.md`, `fiche_technique.md`, `intention.md`, `etat-jeu.md`, `journal.md`, `backlog.md`.

After creation, remind the user to:
1. Fill `pj.md` (background) — use `fill` action if starting from a text
2. Choose the system in `fiche_technique.md`
3. Fill `intention.md` before the first session

## Action: fill

Asks the user to paste the source text, then:

1. Analyzes the text and identifies which sections it feeds:
   - Identity, facade, background, personality, world relationship → `pj.md`
   - Stats, power/weakness tags, equipment, mechanics → `fiche_technique.md`
   - Themes, tone, truths, line rouge, visceral question → `intention.md`
   - État mécanique de jeu (jauges, ressources, statuts, compteurs selon les règles actives (système de jeu) → `etat-jeu.md`
   - Scene ideas, open threads → `backlog.md`

2. Distributes content into the relevant files. Preserves existing content — completes, never overwrites.

3. Marks incomplete sections with `[À compléter]`.

4. Does not invent content missing from the source text.

Reports modified files and lists sections still marked `[À compléter]`.

## Action: reorganize

1. Reads all existing PJ files (recursively if folder; otherwise the single `.md`).
2. Presents a redistribution plan before writing anything:
   - Which source content goes to which target file
   - Which missing files will be created from template
   - Which content belongs outside `pjs/` (campaign prep → `rpg` ; univers durable → arborescence `lore-extract`/`rpg` ; jeu en direct → `solo-mc`)
   - Which content is ambiguous and needs user arbitration
3. Waits for user validation.
4. If source is a single `.md`: creates `pjs/<slug>/` first, then copies missing files from template.
5. Redistributes validated content. Preserves existing target content — completes, never overwrites.
6. Archives source files to `pjs/<pj>/.archive/` (never deletes directly).

Redistribution rules:
- `pj.md` ← identity, name, age, gender, origin, social facade, background, personality, world relationship
- `fiche_technique.md` ← stats, attributes, skills, power/weakness tags, spells, equipment, persistent statuses
- `intention.md` ← themes, tone, truths, what I want to experience/avoid, visceral question, story threads
- `etat-jeu.md` ← état mécanique de jeu selon les règles actives (système de jeu) : jauges, ressources, statuts, compteurs et éléments en suspens
- `journal.md` ← dated session reports, played scenes, mechanical events and session outcomes per the active rules (game system) (newest first)
- `backlog.md` ← scene ideas, threads to revive, open questions, narrative todo

## Action: log-session

Asks the user for:
1. Session number and date (default: today)
2. Played scenes (short summary per scene)
3. Mechanical events of the session (resources gained/spent, statuses, counters) per the active rules (game system)
4. Notable outcomes / turning points of the session
5. Final mechanical state of the sheet per the active rules (game system) (jauges, ressources, statuts, compteurs, éléments en suspens)

Then updates:
1. **`journal.md`** — new entry at the top (newest first) with scenes, mechanical events, outcomes, free notes
2. **`etat-jeu.md`** — snapshot of the current mechanical state per the active rules (game system) (jauges, ressources, statuts, compteurs, éléments en suspens)
3. **`intention.md`** — proposes an update if a new story thread emerged, the visceral question evolved, or a theme shifted
4. **`backlog.md`** — proposes adding new scene ideas and open questions that emerged

Reports modified files at the end.

## Action: show

Determines the active PJ:
- If argument supplied (`/obsidian:pc show @<pj>`): use it
- Otherwise read `.current-session` at the vault root (`JDR/.current-session`)
- If empty or missing: prompt the user

Loads character state from (priority order):
1. `<jeu>/campagnes/<campagne>/sessions/.session-state.yaml` (if active session)
2. `<jeu>/campagnes/<campagne>/config.yaml`
3. `<jeu>/pjs/<pj>/fiche_technique.md` and `<jeu>/pjs/<pj>/pj.md`

Displays a structured sheet with: progress statuses, themes, power/weakness tags, recent tag changes, active statuses, NPC relations, objectives.

For campaign-level mechanics and narrative context, refer the user to `/status` and `/previously`.
