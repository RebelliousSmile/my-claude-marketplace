# Output Format — Rules Keeper

Complete annotated format for optimized rules files. All 6 sections are required.

---

```markdown
---
name: [system-name]
description: [one-line summary of the game system]
mechanics: [dice|cards|diceless|hybrid]
complexity: [light|medium|crunchy]
source-language: [fr|en|other]
validated: [true|false]
validated-date: [YYYY-MM-DD]
backup: [true|false]
---

# [System Name]

## CHEATSHEET
# ↑ Must stay under 500 tokens (~2000 chars). Rapid recall only.

### Core Loop
[action] → [resolution] → [outcome]
# One line. No exceptions, no edge cases.

### Resolution
| Roll/Result | Name     | Effect                    |
|-------------|----------|---------------------------|
| [threshold] | [name]   | [what mechanically happens] |
# Max 6 rows. Critical/special results included.

### Key Modifiers
- [condition]: [modifier]
# Max 5 items. Most frequent situational modifiers only.

### Character Elements
- [element]: [format/range]
# Max 5 items. Stats, resources, or other character components.


## LEXICON
# ↑ Bridges source language (often English) → French for writing.
# Required even if source is already in French (for jargon alignment).

> Source terms → French equivalents for writing

| Source term | Français       | Context                        |
|-------------|----------------|--------------------------------|
| [term]      | [terme]        | [where/how it appears in text] |

# Group by category if > 10 terms:
# Core | Characters | Combat | Social | Items | GM Tools


## PATTERNS
# ↑ Copy-paste templates for writing actions. One per action type present in the system.
# Do NOT create patterns for action types not in the source.

### [Action Type]
[Character] [attempts/does] [action] [using/with] [skill/stat/method].
→ Roll: [formula]
→ [Result tier]: [narrative + mechanical effect]
→ [Result tier]: [narrative + mechanical effect]

### [Action Type]
...


## ENTITY TEMPLATES
# ↑ Pointers only. The actual files are in .templates/.

> Files created in `.templates/`

### Player Character
See: `.templates/<system>-pc.template.md`

### NPC
See: `.templates/<system>-npc.template.md`

### Obstacle / Threat
See: `.templates/<system>-obstacle.template.md`

### Asset / Item
See: `.templates/<system>-asset.template.md`


## FULL REFERENCE
# ↑ Complete rules, organized. No duplication with CHEATSHEET.
# Every mechanic from the source must appear here.

### Character Creation
[Step-by-step procedure]

### Core Mechanics
[All rules, edge cases, exceptions, examples]

### Advanced Rules
[Optional mechanics, variant rules, subsystems]

### GM Section
[Running the game, pacing tools, NPC creation guidelines]


## CHANGELOG
# ↑ One row per restructure or update operation.

| Date       | Source                | Changes                        |
|------------|-----------------------|--------------------------------|
| YYYY-MM-DD | original              | Initial restructure            |
| YYYY-MM-DD | supplement-name.md    | Added [X], modified [Y]        |
```
