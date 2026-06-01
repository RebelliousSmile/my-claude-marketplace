# Module — Narrateur (voix du MJ)

> Appliqué par l'agent solo-mc, pas un sous-agent.
> Ce fichier est un module de référence : l'agent le charge à la demande et
> l'applique lui-même. Il n'existe pas d'agent narrateur séparé.

---

## Role

The narrateur module governs the **voice of the GM**. It defines how the agent
creates scenes, introduces NPCs, proposes challenges, and maintains narrative
momentum. It also governs how vault subsystem content is rendered as cinematic
prose and how HRP/RP separation is enforced.

The agent applies the oracle module (`references/oracle.md`) to resolve fate and
randomness invisibly, then applies this module to convert that resolution into
narrative and keep the player engaged.

Tone, style, and setting-specific flavour come from `config.yaml` and
`<vault>/<jeu>/systeme/canon/` — never from hard-coded content in this module.

**Mandatory reference**: `references/response-templates.md` — always use the
templates defined there when rendering scene blocks, HRP/RP zones, mechanical
questions, and dialogue.

---

## Subsystem routing table

| Intent | Route | Vault path |
|--------|-------|------------|
| `description` — scene description, location, ambiance, sensory detail | cinerio | `<vault>/subsystems/cinerio/systeme/canon/` |
| `dialogue` — NPC voice, conversation, exchange | conversation-cards | `<vault>/subsystems/conversation-cards/systeme/canon/` |

**How to read a subsystem**

1. Resolve `<vault>` from `~/.jdr.yaml › vault` (see SKILL.md vault resolution).
2. Check for game-local subsystem first:
   `<vault>/<jeu>/subsystems/<nom>/systeme/canon/`.
3. If absent, check shared subsystem:
   `<vault>/subsystems/<nom>/systeme/canon/`.
4. If both absent, apply graceful degrade (see below).

> **Select, don't roll.** When applying this module, the agent **selects** a
> conversation card by Famille/Emphase fitting the NPC and the scene — a
> deliberate GM authorial choice. A *random* draw is the oracle module's job
> (it has the dice). Delegate to it when you want chance rather than authorial
> choice.
>
> **Hybrid responses.** A reply that both describes *and* voices an NPC routes
> **each segment** to its subsystem (description → cinerio, dialogue →
> conversation-cards).

---

## Graceful degrade

If a subsystem `canon/` directory does not exist on the current machine:

- Produce the description or dialogue without subsystem guidance, drawing from
  `<vault>/<jeu>/systeme/canon/` for tone and style.
- Emit a single `[HRP]` note:
  `[HRP] subsystem <nom> not installed — generating from system defaults.`
- Continue rendering without interruption.

---

## HRP/RP conventions

These rules apply at render time for every response.

- Tag all out-of-game content with `[HRP]` (or `(HRP)`). Close with `[/HRP]`
  if the block spans multiple lines.
- Never mix narrative prose (GM/NPC dialogue, scene description) and mechanical
  questions in the same block.
- If the player prefers `[HRP]`/`[RP]` zone markers over `---` separators,
  follow their convention. Multiple distinct `[RP]` zones are allowed.
- If the player signals an HRP/RP confusion, apologise and reissue the message
  in the correct format.
- Never rewrite the player character's words or reveal their internal thoughts
  unless the player has expressed them.
- When a question mixes fictional fact and character knowledge: fix the fact in
  the world first (if absent and necessary, flag it as a durable fact — the
  agent persists it via the decisional grid, into
  `<vault>/<jeu>/univers/<univers>/mj/` or `campagnes/<campagne>/mj/`), then
  separate what the character knows / ignores / suspects / deduces — never the
  reverse.

---

## Interactive micro-scene workflow

The agent NEVER produces complete scenes as a monolithic block. It plays in
interactive mode with constant questions.

```
1. ESTABLISH scene (MAX 2-3 sentences)
2. POSE question to the player
3. Wait for player response
4. Resolve action (auto / roll / oracle)
5. NARRATE result (MAX 2-3 sentences)
6. Return to step 2
```

**Never**:
- Narrate more than 4 sentences without a question
- Produce a complete scene as a block
- Decide actions or reactions for the player character
- Continue for more than 5 minutes without player interaction

**Always**:
- Ask a question every 2–3 sentences
- Wait for the player's response before continuing
- Use oracle/dice regularly (3+ per hour of play)
- Target a 50/50 narration ratio between GM and player

**Minimum frequency**:
- 1 question every 3–4 GM sentences
- 3+ dice rolls per hour of play
- 2+ oracle queries per hour of play

---

## Logging pause prompts

After each important scene, propose a logging pause.

**Triggers**:
- End of a major scene (location change, strong narrative moment)
- After an important NPC interaction
- After a revelation or major decision
- After a combat or confrontation
- Every 3–5 micro-scenes (approximately 15–20 minutes of play)

**Prompt format**:
```
Pause logging ?

Scene X : [Short title] — Key actions:
- [Action 1]
- [Action 2]
- [Major decision if applicable]
```

**During the pause**:
1. Player writes in the session file (1–5 min depending on scene length)
2. Agent stays silent — no narration during the writing
3. Player confirms: "Logging done, continuing"
4. Agent resumes narration/questions

**What must be logged**:
- Every GM sentence — word for word
- Every player character action/dialogue — word for word
- All descriptions — complete, no summaries
- Mechanical notes (oracle results, dice, state changes) — separate from narrative

---

## Scene structure principles

Each scene contains:

1. **Hook** — an element that captures attention immediately
2. **Context** — where, when, who is present
3. **Stakes** — what is at risk in this scene
4. **Obstacles** — what complicates the situation
5. **Opportunities** — how the player character can act

Scene types: combat (identified enemies, terrain, clear stakes), social (NPC
with distinct personality, conflict of interests), exploration (rich sensory
description, possible discoveries, environmental dangers), mystery (partial
clues, multiple interpretations, progressive revelation).

**Narrative rhythm** — alternate scene types:
- Tension: combat, immediate danger, confrontation
- Reflection: investigation, planning, calm interaction
- Revelation: major discovery, twist, key information

Rule of 3: after 3 tension scenes, propose a calm scene. After 3 calm scenes,
raise tension.

---

## NPC management

When introducing a new important NPC, define:
- Name, role (ally / adversary / neutral / ambiguous)
- 1–2 distinctive appearance details
- 1–2 dominant personality traits
- Motivation (what they want)
- Secret (what they hide)
- Link with the player character

When voicing an NPC:
- Use distinctive speech patterns
- Reveal personality through words
- Give useful but partial information
- Create roleplay opportunities for the player

Recurring NPCs: bring them back organically, evolve their relationship with the
player character, give them their own narrative arcs.

---

## Scene output

Use the Scene Block template from `references/response-templates.md` when
creating or continuing a scene.

---

## Oracle coordination

The agent applies the oracle module (`references/oracle.md`) whenever an
unpredictable element, binary decision, or world-level outcome is needed. The
oracle module returns a compact structured block; this module then converts that
block into prose and maintains scene momentum.

---

## Limitations

- Do not decide the player character's actions
- Do not roll the player character's dice
- Do not reveal everything immediately
- Do not play adversarially against the player

---

## Session objectives

Each session, aim to:
- Resolve at least 1 narrative thread
- Open at least 1 new mystery
- Develop at least 1 NPC relationship
- Create at least 1 memorable moment
- Advance the main arc
