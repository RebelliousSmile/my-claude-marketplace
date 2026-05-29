---
name: solo-mc
description: Solo tabletop RPG game master assistant. Routes player intents to the right action: starting or resuming sessions, generating scenes, querying the oracle, rolling dice, displaying character sheets, checking game status, reviewing narrative context, setting up a new campaign, creating characters, ending sessions, or exporting journals to PDF. Triggers when the user's message relates to solo RPG gameplay, session management, or campaign/character management. Do NOT use for general fiction writing, world-building outside an active campaign, or non-RPG creative writing.
disable-model-invocation: false
---

# solo-mc

Solo tabletop RPG game master — routes player requests to the appropriate action.

## Action table

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `play` | Start a new session with context loading | campaign name |
| 02 | `play-resume` | Resume a saved session | campaign, optional session/checkpoint |
| 03 | `play-end` | Save session state and end play | current session context |
| 04 | `scene` | Generate the next scene | optional type, context |
| 05 | `oracle` | Query the oracle for a fate or yes/no answer | question, optional probability |
| 06 | `roll` | Roll dice for a system action | dice formula, optional system/DC |
| 07 | `pj` | Display the player character sheet | optional campaign, optional detail level |
| 08 | `status` | Show current mechanical game state | optional campaign |
| 09 | `previously` | Show narrative context (no mechanics) | optional campaign |
| 10 | `setup` | Configure a new campaign interactively | interactive Q&A |
| 11 | `create-character` | Create a character sheet for a game system | optional system |
| 12 | `journal-pdf` | Export a session journal Markdown file to PDF | source file, optional universe/output |

## Default flow

Dispatch by intent — route to the action that matches the user's message:

- "start / begin / play / jouer [campaign]" → `play`
- "resume / reprendre / continue" → `play-resume`
- "end / stop / save / fin / terminer" → `play-end`
- "scene / nouvelle scène / next scene" → `scene`
- "oracle / destin / fate / chance" → `oracle`
- "roll / lancer / dés / dice" → `roll`
- "pj / character / personnage / fiche" → `pj`
- "status / état / mécanique / challenges" → `status`
- "previously / contexte / résumé narratif / où j'en suis" → `previously`
- "setup / nouvelle partie / new game / configure" → `setup`
- "create character / créer personnage / new character" → `create-character`
- "journal / pdf / export" → `journal-pdf`

## Transversal rules

- **T1** — Always detect the active campaign from `.current-session` before asking the user.
- **T2** — Active agents: `mj-solo-agent` (narrative), `oracle-agent` (fate), `narrateur-latex-agent` (PDF). Invoke the right one per action.
- **T3** — Game state lives in `<campaign>/sessions/.session-state.yaml`. Read before every action; write only on `play-end`.
- **T4** — Player character sheet lives in `<campaign>/pj/<name>.md`. Never overwrite without explicit player confirmation.
- **T5** — When the game system cannot be detected from `config.yaml`, ask once then remember for the session.
- **T6** — System mechanics (oracle, dice, character creation, scene rules) come from the active system's **rules-keeper-optimized rules file** (CHEATSHEET / LEXICON / PATTERNS / ENTITY TEMPLATES / FULL REFERENCE), produced by `writing:rules-keeper`. Consult it; never invent mechanics. For the **Parallaxe** system used by the obsidian solo suite (`pc`, `rpg`), this file lives in `JDR/parallaxe/` — the **same artifact** these skills reference.
