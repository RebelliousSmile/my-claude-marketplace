# Module — Oracle (moteur de décision)

> Appliqué par l'agent solo-mc, pas un sous-agent.
> Ce fichier est un module de référence : l'agent le charge à la demande et
> l'applique lui-même. Il n'existe pas d'agent oracle séparé.

---

## Role

The oracle is an **invisible decision engine**. Its job is to break the linear
cause-to-effect chain by introducing structured randomness and world-level
decisions. It is an internal operation of the solo-mc agent — it does not speak
to the player directly unless a die result needs to be shown. The player sees
outputs, not the oracle's process.

The oracle does not narrate. It does not ask the player questions. It does not
drive the micro-scene loop. That is handled by applying `references/narrateur.md`.

---

## Subsystem routing table

| Intent | Route | Vault path |
|--------|-------|------------|
| `hasard` — dice roll, random word, random concept, unexpected event | muses-et-oracles | `<vault>/subsystems/muses-et-oracles/systeme/canon/` |
| `decision` — what does the world decide? what happens next? | parallaxe | `<vault>/subsystems/parallaxe/systeme/canon/` |

**How to draw from a subsystem**

1. Resolve `<vault>` from `~/.jdr.yaml › vault` (see SKILL.md vault resolution).
2. Locate the subsystem canon — test the **full path**: game-local
   `<vault>/<jeu>/subsystems/<nom>/systeme/canon/` first, else shared
   `<vault>/subsystems/<nom>/systeme/canon/`. (A present-but-**empty**
   `<jeu>/subsystems/` dir does not count — only the complete canon path does.)
   If both absent → graceful degrade (below).
3. Read the subsystem **index file** (`<nom>.md`); its CHEATSHEET maps each need
   to the right table, file, and die.
4. **Draw a card, don't roll.** The single random act is drawing a card: pick a
   random card index with `terminal`
   (`python -c "import random;print(random.randint(1,N))"`, N = deck size), then
   read that card's **row** in the master table. One muses Standard card carries
   *all* its generators **and** a pre-rolled `[d4]…[d20]` block at once → one
   draw = a coherent bundle. For parallaxe, filter the pool first, then draw
   1 card uniformly.
5. Return the drawn result (Output format below). Do not narrate.

**muses-et-oracles — draw a card, don't roll dice** (the whole point of M&O):
the Standard deck replaces dice. Draw **one** card (random # 1–N) and read what
the moment needs from that single card's master-table row — it carries one of
*each* generator **and** a pre-rolled dice block `[d4]…[d20]`. So a game-system
die (d20, d6…) is **read off the drawn card's `[dX]` value**, not rolled. For a
single targeted value (just a weather), you may instead pick from that
generator's pool table.

| Need | Where to read it |
|------|------------------|
| A game-system die (d20, d6, …) | the drawn card's `[dX]` index value — no rolling |
| Fate yes/no | the card's Réponse d'oracle (6-tier scale `Non, et…` → `Oui, et…`) |
| NPC attitude | the card's Attitude (or Attitude pool, 20 values) |
| NPC emotion | the card's Émotion |
| New full NPC | the card's PNJ block (Apparence/Motivation/Traits/Secret/Relation) — or draw several cards |
| Dry inspiration | the card's Mot-oracle / Verbe / Adjectif |
| Décor / ambiance | the card's Météo + Lieu |
| Stalled scene / twist | deck Rebondissements — draw a card (see note below) |
| Frame a session / scenario | deck Bonus — draw (Genre / Thème / Situation) |

**Rebondissements draw** — the carte-titre (Menace, Intrigue, Coup de théâtre…)
sets the **register/tone**; the sous-option tables (Focus / Soudain… / Hors des
sentiers battus / Coup de théâtre) give the **concrete content**: pick a line
(1–N), then **d3** within it. The source does not define a strict
title→table linkage — treat the title as tone and the sous-option as content
(draw the sous-option table that fits the moment, or independently).

**parallaxe filtering** — the axis-less **Pause** card (#54) is never removed
by axis filters; it always stays in the pool (its ~2% chance is intentional).

**Routing a « relance »** — injecting entropy / a twist into a stalled scene →
muses **Rebondissements**; a *decisional* block (no direction imposes itself) →
**parallaxe**.

---

## Graceful degrade

If a subsystem `canon/` directory does not exist on the current machine:

- Fall back to system-appropriate dice read from
  `<vault>/<jeu>/systeme/canon/`.
- Emit a single `[HRP]` note **naming the formula**:
  `[HRP] subsystem <nom> not installed — using system default (<système>'s dice, e.g. 2d6).`
- Continue resolution using the yes/no/yes-but spectrum below.

If `systeme/canon/` is also absent (fresh clone — see SKILL.md post-clone
setup):

- Use the generic 2d6 oracle (result 2–6 = No, 7–9 = Yes-but, 10–12 = Yes).
- Emit: `[HRP] systeme/canon/ absent — run rules-keeper before playing. Using 2d6 fallback.`

---

## Facteur Chaos

Represents the unpredictability level of the current situation.

| Value | State |
|-------|-------|
| 1–3 | Stable, predictable |
| 4–6 | Normal, balanced |
| 7–9 | Chaotic, many surprises |
| 10 | Total chaos |

Evolution:
- +1 when a scene ends badly or unexpectedly
- -1 when a scene resolves cleanly and predictably
- Default: 5

The Facteur Chaos modulates probability thresholds: higher chaos shifts
"Moyenne" outcomes toward complication.

---

## Yes/no answer spectrum

When resolving a fate question, the oracle produces one of these outcomes:

- **Oui** — clean success
- **Oui, et...** — success with a bonus
- **Oui, mais...** — success with a complication
- **Non** — clean failure
- **Non, mais...** — failure with a consolation
- **Non, et...** — failure with an aggravation

---

## System-adaptive dice

The system dice formula is read from `<vault>/<jeu>/systeme/canon/`. The oracle
adapts its probability mapping to whatever the active system uses. The mapping
rules live in the system's canon rules — never hard-coded here.

If the system cannot be detected, ask once (see SKILL.md), then remember for
the session.

---

## Output (returned to the agent for narration)

Return a compact structured block — never prose:

- **Source**: subsystem + deck/table (e.g. `muses-et-oracles / Standard`)
- **Draw**: the card drawn + the value(s) read from it
  (e.g. `muses #137 → Réponse: Oui, mais… ; [d20]=14`; or `parallaxe #4`)
- **Result**: the drawn entry(ies)
  (`Oui, mais…`; or for parallaxe, the card name + axes + phrase / impulsions / signe)
- **Chaos**: current Facteur Chaos and any change

The agent then converts this into fiction (applying `references/narrateur.md`);
the player sees the consequence — and the die only when a roll is shown.

---

## Principles

- **Never confirm the player's expectations by default.** Introduce twists and
  complications.
- **Avoid evidence.** Create situations that force difficult choices.
- **Every 3–4 questions, introduce an unexpected element** — a hidden NPC
  motive, a past element returning, a significant coincidence.
- **Do not control player character actions.** The oracle answers questions about
  the world and NPCs only.
- **Do not narrate.** Return a result. The narration layer converts it into prose.
