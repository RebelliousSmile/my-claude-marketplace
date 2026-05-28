---
name: pc
description: >-
  Manages JDR solo player-character files stored in JDR/pjs/<pj>/ — create a new PJ,
  fill or reorganize its files, log a game session (Jauges & Tarot), or display the
  character sheet. Use when the user invokes /obsidian:pc with a player-character intent.
  Do NOT use for campaign-level features (oracle, scene, roll) — those stay in jdr/.claude.
disable-model-invocation: true
---

# PC — Player Character

Manages player character folders stored in `C:/Users/fxgui/Public/Notes/Perso/JDR/pjs/`.
Routes to the appropriate action based on user intent.

## Available actions

| #   | Action        | Role                                                              | Input                     |
| --- | ------------- | ----------------------------------------------------------------- | ------------------------- |
| 01  | `new`         | Create a new PJ folder from the `_template/`                      | PJ name                   |
| 02  | `fill`        | Fill PJ files from a pasted text (brainstorm, notes, etc.)        | PJ name, source text      |
| 03  | `reorganize`  | Redistribute content to the 6 standard files                      | PJ name or loose .md file |
| 04  | `log-session` | Update PJ files after a Jauges & Tarot game session               | PJ name, session info     |
| 05  | `show`        | Display the current character sheet (tags, statuses, relations)   | PJ name or active session |

## Default flow

Router — dispatches based on user intent:

- "nouveau PJ", "créer PJ", "new PJ", "créer <nom>" → `new`
- "remplir PJ", "fill PJ", "remplir les fichiers" → `fill`
- "réorganiser PJ", "reorganize", "restructurer <nom>" → `reorganize`
- "log session", "mettre à jour après session", "fin de session" → `log-session`
- "afficher PJ", "fiche personnage", "show PJ", "/pj" → `show`

## Transversal rules

- PJ root: `C:/Users/fxgui/Public/Notes/Perso/JDR/pjs/`
- Template: `C:/Users/fxgui/Public/Notes/Perso/JDR/pjs/_template/`
- Manager script: `C:/Users/fxgui/Public/Notes/Perso/JDR/pjs/pj-manager.py`
- Ask for the PJ name if not supplied via `$ARGUMENTS`. List existing folders in `pjs/` (excluding `_template`).
- J&T reference for terminology: `C:/Users/fxgui/Public/Notes/Perso/JDR/jauges-et-tarot/jauges-tarot-synthese.md`
- Never invent J&T mechanics — always consult the reference above.
- Date format: `YYYY-MM-DD` throughout all files.

## Action: new

Runs:
```bash
python "C:/Users/fxgui/Public/Notes/Perso/JDR/pjs/pj-manager.py" new "<nom>"
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
   - Jauge Narrative, échos, challenges, descriptions, PD → `etat-jeu.md`
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
   - Which content belongs outside `pjs/` (campaign-level: PNJs, rules, context)
   - Which content is ambiguous and needs user arbitration
3. Waits for user validation.
4. If source is a single `.md`: creates `pjs/<slug>/` first, then copies missing files from template.
5. Redistributes validated content. Preserves existing target content — completes, never overwrites.
6. Archives source files to `pjs/<pj>/.archive/` (never deletes directly).

Redistribution rules:
- `pj.md` ← identity, name, age, gender, origin, social facade, background, personality, world relationship
- `fiche_technique.md` ← stats, attributes, skills, power/weakness tags, spells, equipment, persistent statuses
- `intention.md` ← themes, tone, truths, what I want to experience/avoid, visceral question, story threads
- `etat-jeu.md` ← Jauge Narrative, échos (Charge Mentale), PD pile, Challenges, Descriptions, As/Cavaliers, suspended Lignes de Temps
- `journal.md` ← dated session reports, played scenes, generated/resolved échos, dénouements (newest first)
- `backlog.md` ← scene ideas, threads to revive, open questions, narrative todo

## Action: log-session

Asks the user for:
1. Session number and date (default: today)
2. Played scenes (short summary per scene)
3. Échos: newly generated, resolved
4. Points de Destin gained / spent
5. Re-remplissage or dénouement triggered?
6. Final table state: Jauge Narrative position, active échos count, PD in pile, active Challenges

Then updates:
1. **`journal.md`** — new entry at the top (newest first) with scenes, échos, PD, re-remplissage/dénouement, free notes
2. **`etat-jeu.md`** — snapshot update: Jauge Narrative, Charge Mentale échos table, PD counter, active Challenges, Descriptions, As/Cavaliers, suspended Lignes de Temps
3. **`intention.md`** — proposes an update if a new story thread emerged, the visceral question evolved, or a theme shifted
4. **`backlog.md`** — proposes adding new scene ideas and open questions that emerged

Reports modified files at the end.

## Action: show

Determines the active PJ:
- If argument supplied (`/obsidian:pc show @<pj>`): use it
- Otherwise read `.current-session` in `Mes PJs/`
- If empty or missing: prompt the user

Loads character state from (priority order):
1. `<campagne>/sessions/.session-state.yaml` (if active session)
2. `<campagne>/config.yaml`
3. `<pj>/fiche_technique.md` and `<pj>/pj.md`

Displays a structured sheet with: progress statuses, themes, power/weakness tags, recent tag changes, active statuses, NPC relations, objectives.

For campaign-level mechanics and narrative context, refer the user to `/status` and `/previously`.
