# Entity Templates — Base Models

Base templates to adapt per game system. Replace generic placeholders with system-specific fields. Remove irrelevant fields. Add system-specific fields.

These are starting points, not constraints.

---

## Player Character (`<system>-pc.template.md`)

```markdown
# [System] Player Character

**[Name]** — [Class/Playbook/Role]

## Stats / Characteristics
[stat-name]: [value]
[stat-name]: [value]

## Skills / Abilities / Moves
- [skill/ability]: [brief description if non-obvious]

## Resources / Tracks
[resource-name]: [current]/[max]   ← HP, stress, tokens, etc.

## Equipment / Gear
- [item]: [tags or brief effect]

## Bonds / Relationships
- [character]: [nature of bond / hx value]

## Notes
[Space for session notes, conditions, wounds]
```

---

## NPC (`<system>-npc.template.md`)

```markdown
# [System] NPC

**[Name]** — [Role/Type]

## Profile
[stat-name]: [value]   ← only stats relevant for conflict
[stat-name]: [value]

## Drive
[What this NPC wants — their core motivation]

## Weakness / Vulnerability
[What can be used against them — exploitable flaw or fear]

## Moves / Abilities
- [GM move or special ability]: [trigger and effect]

## Resources / Tracks
[resource-name]: [current]/[max]

## Notes
[Relationships, secrets, information they hold]
```

---

## Obstacle / Threat (`<system>-obstacle.template.md`)

```markdown
# [System] Obstacle / Threat

**[Name]** — [Type: environmental / social / creature / faction]

## Description
[What it is, briefly]

## Trigger
[What activates or escalates this obstacle]

## Countdown / Segments
[ ] → [ ] → [ ] → [consequence]   ← adapt to system's clock/progress mechanics

## Stakes
- Success: [what the players gain or prevent]
- Failure: [what happens / what escalates]

## Moves / Abilities
- [Threat move]: [trigger and effect]

## Notes
[Connections, weaknesses, information the players can discover]
```

---

## Asset / Item (`<system>-asset.template.md`)

```markdown
# [System] Asset / Item

**[Name]** — [Tag/Type/Category]

## Effect
[Mechanical effect — when active and what it does]

## Bonus Type
[+1 forward / +1 ongoing / advantage / reroll / other — adapt to system]

## Limitations
[Single use / requires X / charges: N / condition for use]

## Acquisition
[How to obtain, cost, or crafting requirements]

## Notes
[Flavor, history, or additional interactions]
```
