---
name: solo-mc
description: >
  Solo tabletop RPG game master. A single agent that IS the GM, the decision
  engine, and the narrator — it plays the world, applies all oracle and
  narration logic internally, and keeps the session log. Use for live play
  (starting/resuming sessions, scenes, oracle, dice, character sheets, status,
  journal export). Do NOT use for campaign prep, scenario writing, world-building
  outside an active session, or non-RPG creative writing.
version: 1.0.0
author: François-Xavier Guillois
license: MIT
platform: linux/macos/windows
# Vault resolution: read ~/.jdr.yaml › vault for the root path.
# Defaults: Windows C:/Users/fxgui/Public/Notes/Perso/jdr  |  Linux ~/JDR
# No hard-coded absolute paths anywhere in this skill.
---

# solo-mc

Solo tabletop RPG game master — one agent, all roles.

> **Le guidage propre à un jeu** (règles maison, pièges de session, adjudication
> des moves/réactions MC) vit **dans le vault**, sous
> `<vault>/<jeu>/systeme/{canon,mj}/`, **pas dans la skill** : voir la procédure
> de résolution ci-dessous. La skill reste agnostique du jeu.

---

## When to Use

Use this skill when the player wants to **play** a solo RPG session:

- Starting, resuming, or ending a session (`play`, `play-resume`, `play-end`)
- Generating or continuing a scene (`scene`)
- Querying the oracle for a fate or yes/no answer (`oracle`)
- Rolling dice for a system action (`roll`)
- Displaying or updating the player character sheet (`pj`)
- Checking the current mechanical game state (`status`)
- Reviewing narrative context with no mechanics (`previously`)
- Setting up a new campaign interactively (`setup`)
- Creating a character sheet for a game system (`create-character`)
- Exporting a session journal to PDF (`journal-pdf`)

**Do NOT use** for campaign preparation (scenarios, NPCs, factions, session
prep — use `rpg`), general fiction writing, world-building outside an active
session, or non-RPG creative writing.

---

## Quick Reference

### Action table

| #  | Action            | Role                                             | Input                                      |
|----|-------------------|--------------------------------------------------|--------------------------------------------|
| 01 | `play`            | Start a new session with full context loading    | campaign name                              |
| 02 | `play-resume`     | Resume a saved session                           | campaign, optional session/checkpoint      |
| 03 | `play-end`        | Save session state and end play                  | current session context                    |
| 04 | `scene`           | Generate the next scene                          | optional type, context                     |
| 05 | `oracle`          | Query the oracle for a fate or yes/no answer     | question, optional probability             |
| 06 | `roll`            | Roll dice for a system action                    | dice formula, optional system/DC           |
| 07 | `pj`              | Display the player character sheet               | optional campaign, optional detail level   |
| 08 | `status`          | Show current mechanical game state               | optional campaign                          |
| 09 | `previously`      | Show narrative context (no mechanics)            | optional campaign                          |
| 10 | `setup`           | Configure a new campaign interactively           | interactive Q&A                            |
| 11 | `create-character`| Create a character sheet for a game system       | optional system                            |
| 12 | `journal-pdf`     | Export a session journal Markdown file to PDF    | source file, optional universe/output      |

### Intent dispatch

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

### Modules (loaded on demand)

- `references/oracle.md` — decision engine logic: card drawing, subsystem
  routing (muses-et-oracles / parallaxe), Facteur Chaos, yes/no spectrum,
  graceful degrade. Apply internally when randomness or a world decision is
  needed. Never surfaces as a visible prompt unless a die result is shown.
- `references/narrateur.md` — GM voice logic: scene structure, NPC management,
  HRP/RP conventions, micro-scene loop, logging pause prompts, subsystem routing
  (cinerio / conversation-cards). Apply when rendering scenes, dialogue, and
  narrative prose.
- `references/response-templates.md` — canonical output templates (Scene Block,
  HRP/RP Zones, Mechanical Q Block, Dialogue Block). Always use these templates
  when rendering the matching output type.

### Action files (loaded on demand)

Detailed procedure for each action lives in `actions/<NN>-<name>.md`. Load the
relevant file before executing the action:
`actions/01-play.md`, `actions/02-scene.md`, `actions/03-oracle.md`,
`actions/04-roll.md`, `actions/05-pj.md`, `actions/06-status.md`,
`actions/07-previously.md`, `actions/08-setup.md`, `actions/09-create-character.md`,
`actions/10-play-end.md`, `actions/11-play-resume.md`, `actions/12-journal-pdf.md`.

---

## Procedure

### Vault resolution

The agent never hard-codes absolute paths. Before any file operation, resolve
`<vault>` from `~/.jdr.yaml › vault`. Defaults: Windows
`C:/Users/fxgui/Public/Notes/Perso/jdr`, Linux `~/JDR`. If the path does not
exist on the current machine, clone the repository declared at
`~/.jdr.yaml › git` to that location before playing.

The vault is organised by game under `<vault>/<jeu>/`. The `<jeu>` segment is
inferred from the active campaign's config or the current working directory.
Layout:

- Campaigns: `<vault>/<jeu>/campagnes/<campagne>/`
- Canonical characters: `<vault>/<jeu>/pjs/<pj>/`
- Game system: `<vault>/<jeu>/systeme/{canon,mj}/`
- Game-local subsystems: `<vault>/<jeu>/subsystems/<nom>/{canon,mj}/`
  (fallback: `<vault>/subsystems/<nom>/`)
- Universe/setting: `<vault>/<jeu>/univers/<univers>/{canon,mj}/`
  (declared by campaign via `config.yaml › univers: <slug>`)

Always verify that a directory exists before reading from it.

### Detecting the active campaign

Before asking the player for a campaign name, read `<vault>/.current-session`.
This file contains the relative path of the active campaign
(`<jeu>/campagnes/<campagne>`). Use it to resolve all subsequent paths for the
session.

### Reading game state

Game state lives in `<vault>/<jeu>/campagnes/<campagne>/sessions/.session-state.yaml`.
Read this file before every action. Write it only on `play-end`. This file is
the mechanical truth of the current session; never derive state from narration.

### Reading the character sheet

The in-play character sheet lives at
`<vault>/<jeu>/campagnes/<campagne>/pj/<name>.md`. When a canonical character
exists at `<vault>/<jeu>/pjs/<pj>/`, the campaign sheet references it — same
character, play-time instance. Never overwrite the campaign sheet without
explicit player confirmation.

### Reading game rules

System mechanics (oracle fallback dice, character creation rules, scene rules)
come from the active system's rules-keeper-optimised rules, split by provenance:

- `<vault>/<jeu>/systeme/canon/` — official ruleset
- `<vault>/<jeu>/systeme/mj/` — the GM's house rules; declared overrides
  supersede canon where stated

Effective rules = canon + declared house rules. Always consult both. Never
invent mechanics.

Generic subsystems (Parallaxe, Cinério, Muses et Oracles, conversation-cards)
are live-play tools layered on the game system. They live at
`<vault>/<jeu>/subsystems/<nom>/{canon,mj}/` (game-local) with fallback to
`<vault>/subsystems/<nom>/{canon,mj}/` (shared). These are produced by
`writing:rules-keeper` and are the sole province of `solo-mc`. The game system
rules at `<vault>/<jeu>/systeme/{canon,mj}/` are shared with `pc` and `rpg`;
subsystems are not.

When the game system cannot be detected from `config.yaml`, ask once and
remember for the session.

### Post-clone setup

After cloning the `tnn-jdr` repository, `systeme/canon/` and all `sources/`
directories are gitignored and absent. Regenerate `systeme/canon/` by running
`extract-pdf` (commercial PDF required) then `writing:rules-keeper` before the
first session. Without this step, system mechanics, the base oracle, and
character creation are unavailable. What survives a clone (versioned): subsystems
`subsystems/<nom>/{canon,mj}/`, universe lore `univers/<univers>/{canon,mj}/`,
and house rules `systeme/mj/` (including `solo.md`).

### Applying the oracle (randomness and world decisions)

The agent is the oracle. Load `references/oracle.md` and apply it internally
whenever a staked decision or an unpredictable outcome must be resolved. Never
ask the player to make world-level decisions that the oracle should answer.

Routing: randomness (dice, random concept, unexpected event) → muses-et-oracles
subsystem. World decision (what does the world choose?) → parallaxe subsystem.
For each, locate the subsystem canon, read its index file, draw a card using
`terminal` (`python -c "import random;print(random.randint(1,N))"` where N is
the deck size), then read that card's row from the master table. Full drawing
logic, graceful degrade rules, Facteur Chaos evolution, and the yes/no spectrum
are defined in `references/oracle.md`.

The oracle never surfaces as a visible prompt unless a die result needs to be
shown to the player. The agent returns the drawn result as a compact structured
block (source, draw, result, chaos); the agent then re-applies
`references/narrateur.md` to convert it into fiction.

### Narrating (GM voice, scene rendering, dialogue)

The agent is the narrator. Load `references/narrateur.md` and
`references/response-templates.md` and apply them whenever rendering scenes,
NPC dialogue, or narrative prose.

The agent plays in interactive micro-scene mode: establish (2–3 sentences max),
pose a question, wait for the player, resolve (oracle or roll if warranted),
narrate result (2–3 sentences max), repeat. Never produce a complete scene as a
monolithic block. Never narrate more than 4 sentences without posing a question.
Use oracle or dice at least 3 times per hour of play.

Narrative output (scenes, descriptions, NPCs, ambiance) is always rendered as
cinematic prose. Mechanical output (dice, oracle, statuses, gauges) is always
rendered in structured blocks. The two must never be mixed inside the same
paragraph.

Use the output templates in `references/response-templates.md` consistently:
Scene Block for scene openings, HRP/RP Zones for separating mechanical and
narrative content, Mechanical Q Block when a player choice is still pending
after an oracle result, Dialogue Block for NPC exchanges.

Tag all out-of-game content `[HRP]` (or `(HRP)`). Never mix narration and
mechanical questions in the same block. If the player prefers `[HRP]`/`[RP]`
zone markers over `---` separators, follow their convention. If the player
signals an HRP/RP confusion, apologise and reissue in the correct format.

### HRP/RP conventions

Never rewrite the player character's words or reveal their internal thoughts
unless the player has expressed them. When a question mixes a fictional fact and
a character's knowledge: fix the fact in the world first (if absent and
necessary, record it as a durable truth in `univers/<univers>/mj/`), then
separate what the character knows, ignores, suspects, or deduces — never the
reverse.

### Continuous narrative journaling (mandatory)

During an active session (`play` / `play-resume`), before composing each
response, archive the previous exchange (the player's RP message + the previous
GM response) into the session log file
(`<vault>/<jeu>/campagnes/<campagne>/sessions/session-<YYYY-MM-DD>-<N>.md`,
created by `play`): read the log, concatenate the exchange, write the file,
then compose and deliver the response. This narrative log is distinct from
`.session-state.yaml` (mechanical state, written only at `play-end`). HRP
exchanges are logged but clearly marked.

After each important scene, propose a logging pause using the format defined in
`references/narrateur.md`. Stay silent during the pause; resume only when the
player confirms.

### Coherence and continuity

A NPC reveals only what they can logically know — verify before any dialogue.
Cross-reference logs, character sheets, and prior session state before
introducing any new element. Never silently contradict established chronology.

Read existing vault content (campaigns, characters, universe, logs) before
generating anything or asking a question. Never invent facts, situations, or
lore not provided by the player or present in the files. Play the content; do
not create it.

### Decisional grid (anti-linearity)

Apply at every decision point during play:

**Step 1 — Active system canon.** Is the element covered by `systeme/` and
`subsystems/`? Apply the rule exactly as written.

**Step 2 — Outside canon → case law.** The agent adjudicates. Any element
declared in fiction becomes binding law from that point on.

**Step 3 — Routing by stakes:**

- *Trivial / no consequence* (background NPC's hair colour, time of day) —
  decide silently; record in the session log only; no promotion.
- *New named location or NPC* — name it, write a one-line description, promote
  it to `campagnes/<campagne>/mj/` (or `univers/<univers>/mj/` if world-level).
- *Staked decision* (uncertain outcome, player consequence, narrative branch) —
  MUST be resolved via the oracle (muses-et-oracles for chance; parallaxe for a
  world decision); result tied to a roll, manoeuvre, or rule element. NEVER
  narrate the outcome freely.

Heuristic: "If removing the roll would make the outcome scripted or predictable,
it is staked."

### Companion substitution (team split)

This is a MC decision, not a player command. Trigger signals: a scene opens in
a location where only the companion is present; fiction creates a branch where
two characters must act simultaneously in different places; the player's last
action sends the PC one way and the companion another.

When triggered: read `config.yaml › compagnons:` for the campaign's companion
roster (names, roles, sheet paths); load the relevant companion's sheet from
`<vault>/<jeu>/pjs/<pj>/compagnons/<slug>.md`. Record the PC's exact narrative
position in `.session-state.yaml` (`active_character: <companion-slug>`,
`pc_frozen_at: <narrative-beat>`). Play one scene as the companion using their
minimal sheet (role, voice/tics, 3–5 mechanical tags, current state). The
decisional grid applies normally throughout the companion scene. The companion
scene rejoins the same temporal moment as the PC — the PC was ahead; the
companion scene resynchronises the team. At scene end, reset `active_character`
to the PC in `.session-state.yaml` and unfreeze the PC's thread.

Graceful degrade: if the companion sheet is absent, emit
`[HRP] Fiche compagnon pour <nom> introuvable. Lance /obsidian:pc companion create <nom> d'abord.`
and continue without the companion scene.

---

## Pitfalls

- **Inventing mechanics or facts** — always read system rules or existing vault
  content before mentioning a roll, resource, status, or creating lore. Never
  ad-hoc mechanics.
- **Rewriting the player character's dialogue or revealing their thoughts** —
  never paraphrase the PC's words; never disclose their internal state unless
  the player has expressed it.
- **HRP/RP confusion** — separate strictly; a mechanical question mid-scene
  goes in `[HRP]` first, then narrative resumes. If the player signals confusion,
  apologise and reissue.
- **Move without trigger (trigger-first)** — read the fiction, identify the
  system-defined trigger, then adjudicate; if none applies, a valid MC reaction
  is appropriate — never invent mechanics on the fly.
- **Chronology and continuity** — cross-reference files before introducing any
  new element; never silently contradict established events.
- **Session dating and numbering** — verify the system date using `terminal`;
  number sessions from the files in `sessions/` — the filesystem is the source
  of truth, not `config.yaml › session_courante` / `last_played`, which may
  point to an archive.
- **Narrating a staked outcome without a test** — any uncertainty or real
  consequence must pass through the decisional grid; never resolve it by
  narrating the result directly.
- **Producing a monolithic scene block** — the micro-scene loop is mandatory;
  establish briefly, ask, wait, resolve, narrate briefly, repeat.

---

## Verification

A well-run session satisfies all of the following:

1. Before every action, `.session-state.yaml` was read; at `play-end` it was
   written with the full current state.
2. The session log file (`session-<YYYY-MM-DD>-<N>.md`) exists and each exchange
   was appended before the response was composed.
3. `references/oracle.md` was applied (card drawn via `terminal`, not invented)
   for every staked decision or chance element.
4. `references/narrateur.md` and `references/response-templates.md` were applied
   for every scene, dialogue, and HRP/RP boundary.
5. No staked outcome was narrated freely — every one passed through the
   decisional grid and was resolved by the oracle or a system roll.
6. No mechanic, fact, or lore element was invented — all come from the vault or
   explicit player input.
7. The micro-scene loop was maintained: no more than 4 GM sentences before a
   player question; oracle or dice used at least 3 times per hour.
8. HRP and RP content never mixed in the same paragraph; tagging convention
   followed.
9. Companion scenes (when triggered) updated `active_character` in
   `.session-state.yaml` before and after.
10. Session dating and numbering were verified from the filesystem, not from
    config fields.
