# Response Templates

Canonical output templates consumed by the narrateur agent. Each template defines when to use it, its format, and a generic example. No game-specific content belongs here — tone and setting details come from `R/_savoir/systeme/canon/` and `config.yaml`.

---

## Template 1 — Scene Block

**Name**: Scene Block

**When to use**: When opening a new scene, transitioning to a new location, or reframing the current situation. Use this template for the first message of any scene.

**Format**:
```
# Scene : [Evocative title]

## Context
[Where, when, general ambiance — 1-2 sentences]

## What is happening
[Initial situation, what the player character perceives — 2-3 sentences]

## NPCs present
[If applicable — name and one-line description each]

## Stakes
[What is at risk in this scene]

## Obstacles
[What complicates the situation]

## Opportunities
[What the player character can do — 2-3 options]

## [Optional] Surprise element
[An unexpected detail that changes the equation]
```

**Example** (generic):
```
# Scene : The Empty Crossroads

## Context
Late evening. A crossroads on the edge of town. The wind has died down.

## What is happening
You arrive at the crossroads just as the last cart is leaving. Three roads spread before you. Someone has left a lantern burning at the centre post — still warm.

## NPCs present
- Distant figure: at the far end of the western road, not yet close enough to identify.

## Stakes
You need to reach your contact before nightfall. Two of these roads add time. One is shorter but passes through contested territory.

## Obstacles
- You cannot see far enough in the fading light to identify the distant figure.
- Your map is old and may not show the current state of the roads.

## Opportunities
- Wait for the figure to approach and ask for directions.
- Take the shorter road and accept the risk.
- Examine the lantern — it may tell you something about who left it.

## Surprise element
Scratched into the post beneath the lantern: three symbols you recognise from an earlier scene.
```

---

## Template 2 — HRP/RP Zones

**Name**: HRP/RP Zones

**When to use**: Whenever mechanical content (dice results, oracle outputs, rule clarifications, session management) must appear alongside or near narrative content. Always separate the two — never mix them in the same paragraph.

**Format**:
```
[HRP]
[Mechanical content, rule note, oracle result, or out-of-game question here]
[/HRP]

[RP]
[Narrative prose, scene description, or NPC dialogue here]
[/RP]
```

Single-line HRP notes (no closing tag needed for one-liners):
```
[HRP] subsystem <nom> not installed — using system default.
```

**Rules**:
- Never write narrative inside `[HRP]` blocks.
- Never write mechanical content inside `[RP]` blocks.
- Multiple `[RP]` zones in one response are allowed.
- If the player prefers `---` separators to explicit tags, follow their convention.

**Example** (generic):
```
[HRP]
Oracle result: the contact is present — Oui, mais... (they are being watched).
Facteur Chaos: 6 → 7 (+1, complication introduced).
[/HRP]

[RP]
The door opens before you knock. The person you were looking for stands in the narrow gap, eyes flicking past your shoulder into the street. They step back without a word, leaving space for you to enter — but the movement is too controlled, too deliberate.

What do you do?
[/RP]
```

---

## Template 3 — Mechanical Q Block

**Name**: Mechanical Q Block

**When to use**: After the oracle has resolved a staked decision and the result requires player input before the narrative can continue. Use this when the player must choose how their character responds to a mechanical outcome.

**Format**:
```
[HRP]
Decision: [What was at stake]
Oracle / Roll: [Result summary — no raw dice notation needed here]
Outcome: [Oui / Non / Yes-but / etc.]
Facteur Chaos: [current value] → [new value if changed]

Question for you: [Specific question the player must answer to continue]
[/HRP]
```

**Rules**:
- One question per block.
- The question must be specific and actionable — not "what do you do?" in a vacuum but "given X, do you A or B?".
- Do not narrate the outcome before asking. The narrateur narrates after the player answers.
- **Use this block only when the outcome still depends on the player's choice** (decision pending input). For an oracle result that is **already resolved**, do not use this block — narrate the consequence as fiction via the HRP/RP Zones template instead.

**Example** (generic):
```
[HRP]
Decision: Does the guard recognise the player character?
Oracle: Oui, mais... — yes, but the guard hesitates before acting.
Facteur Chaos: 5 → 6

Question for you: The guard knows who you are. He has not raised the alarm yet. Do you speak first, or do you move?
[/HRP]
```

---

## Template 4 — Dialogue Block

**Name**: Dialogue Block

**When to use**: When voicing an NPC, especially when routing through the conversation-cards subsystem. Use for any exchange that has more than one line of NPC speech.

**Format**:
```
**[NPC NAME]** — [voice tic or tone note in brackets]

"[First line of dialogue]"

[Pause beat or action note if needed — italics]

"[Second line, if applicable]"
```

**Rules**:
- One NPC per block. If two NPCs are present, use two consecutive blocks.
- Voice tic / tone note is mandatory — it anchors the NPC's personality.
- Never have an NPC reveal everything in one exchange. Partial information drives engagement.
- After the NPC's dialogue block, the narrateur poses a question to the player before continuing.

**Example** (generic):
```
**ALDRIC** — [clipped, each sentence a statement, no question marks]

"You came back. Good."

_He does not look up from the table._

"There is one route they have not closed yet. I will tell you which one. But not here."
```
