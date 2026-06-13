# 01 - Restructure

Restructure a single rules file into the LLM-optimized 6-section format.

> **Position dans le pipeline** : `rules-keeper` consomme les sources de référence brutes produites par `extract-pdf` (`<systeme-root>/sources/<source>/rules.md` ou `<subsys-root>/sources/<source>/rules.md`) et les restructure vers `<systeme-root>/canon/` (ou `<subsys-root>/canon/`). Il peut aussi restructurer n'importe quel fichier de règles existant.
> Voir `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md` pour la convention complète.

## Inputs

- `rules-file` (required) — chemin vers le fichier de règles à restructurer (tout format, tout système). Format privilégié issu du pipeline : `<systeme-root>/sources/<source>/rules.md` ou `<subsys-root>/sources/<source>/rules.md`.
- `--homemade` (optional) — provenance : le fichier d'entrée contient des règles maison, pas le ruleset officiel. Le résultat est un **overlay maison** qui vit dans le sous-arbre `mj/` et déclare quelles règles canon il remplace/étend. Par défaut (sans flag) : ruleset canonique → sous-arbre `canon/`.

## Outputs

- Règles restructurées au format optimisé, écrites dans le **sous-arbre de provenance** — `<systeme-root>/canon/` (défaut) ou `<systeme-root>/mj/` (`--homemade`) ; pour un sous-système, `<subsys-root>/canon/` ou `<subsys-root>/mj/`.
- Backup à `<rules-file>.original.md` (créé avant écrasement ; ignoré si déjà existant)
- Pour `--homemade` : chaque règle restructurée **référence la règle canon qu'elle modifie** (section/heading) et déclare l'override — jamais de divergence silencieuse ; canon et maison ne sont jamais mélangés dans un même fichier.
- Artefacts annexes dans `.templates/` (au même niveau que le fichier de règles) :
  - `<system>-pc.template.md`
  - `<system>-npc.template.md`
  - `<system>-obstacle.template.md`
  - `<system>-asset.template.md`

> `<systeme-root>` = `R/_systeme/` ; `<subsys-root>` = `R/_subsystems/<nom>/`. `R` est le domaine de jeu, découvert localement en remontant jusqu'à l'un des marqueurs `_campagnes/`, `_univers/` ou `_pjs/` (voir `jdr-layout.md`).

## Process

### Step 1 — Backup

Copy `<rules-file>.md` → `<rules-file>.original.md`.
If `.original.md` already exists: skip (preserve the original first version).
Log: `"Backup: <file>.original.md"`

### Step 2 — Read and detect

Read the file. Identify:
- Resolution system (dice / cards / diceless / hybrid)
- Core action loop
- Success/failure thresholds and modifiers
- Character components (stats, skills, HP equivalents, resources)
- Complexity level: light / medium / crunchy

**Derive `<system>` name** — used for all template filenames and frontmatter:
1. If the file contains a YAML frontmatter `name:` field → use that value.
2. Else → derive from filename: strip path and extension, then strip trailing version suffix (`-vN`, `-v1.2`…), then strip trailing descriptive suffixes (`-regles`, `-rules`, `-core`, `-base`, `-system`) — keep the root identifier (e.g. `nadir-regles-v5.md` → `nadir`, `pbta-world-regles-v2.md` → `pbta-world`, `spire-core.md` → `spire`).
3. If still ambiguous → ask the user: `"Nom du système pour les templates (ex: spire, pbta, d&d5e) ?"`

All subsequent `<system>` placeholders refer to this derived value.

If the file content does not appear to be game mechanics (no dice, resolution, or stat block): stop and report.
If key mechanics are ambiguous: ask for clarification before proceeding.

### Step 3 — Extract core mechanics

From the file, extract:
- Core resolution formula (e.g. "2d6 + stat vs difficulty")
- All result tiers with their effects
- All modifiers (situational, permanent, stacking rules)
- All character elements referenced in mechanics

### Step 4 — Build CHEATSHEET (≤ 500 tokens)

```markdown
## CHEATSHEET

### Core Loop
[action] → [resolution] → [outcome]   ← one line

### Resolution
| Roll/Result | Name     | Effect              |
|-------------|----------|---------------------|
| [threshold] | [name]   | [mechanical effect] |

### Key Modifiers
- [condition]: [modifier]   ← max 5 items

### Character Elements
- [element]: [format]       ← max 5 items
```

Validate: estimate character count. If > 2000 chars, compress by removing examples (keep only tables and bullets).

### Step 5 — Build LEXICON

Extract every game-specific term from the source. For each term:
- Source form (often English)
- French equivalent for writing
- Usage context

```markdown
## LEXICON

> Source terms → French equivalents for writing

| Source term | Français     | Context             |
|-------------|--------------|---------------------|
| [term]      | [terme]      | [usage context]     |
```

Group by category if > 10 terms: Core, Characters, Combat, Social, Items, etc.

### Step 6 — Build PATTERNS

Create copy-paste action templates for each action type present in the source:

```markdown
## PATTERNS

### [Action Type] (e.g. Skill Test)
[Character] attempts [action] using [skill/stat].
→ Roll: [formula]
→ [Result tier]: [outcome]
→ [Result tier]: [outcome]

### [Action Type] (e.g. Combat)
[Character] attacks [target] with [method].
→ Roll: [formula]
→ Hit: [effect]   Miss: [effect]

### [Action Type] (e.g. Social)
[Character] tries to [persuade/deceive/intimidate] [NPC].
→ Leverage: [what they want/fear]
→ Roll: [formula]
→ Stakes: [success effect] / [failure effect]
```

Only include action types that appear in the source. Do not invent new patterns.

### Step 7 — Build ENTITY TEMPLATES section + create template files

Read base templates from `@references/entity-templates.md`. Adapt each to this system:
- Replace generic placeholders with system-specific fields
- Remove fields not applicable to this system
- Add system-specific fields not in the base template

Create 4 files in `.templates/` (at same level as the rules file):

`<system>-pc.template.md` — Player Character stat block
`<system>-npc.template.md` — NPC with drives and weaknesses
`<system>-obstacle.template.md` — Challenges, threats, countdowns
`<system>-asset.template.md` — Equipment and resources

In the rules file, the ENTITY TEMPLATES section contains only pointers:

```markdown
## ENTITY TEMPLATES

> Files created in `.templates/`

### Player Character
See: `.templates/<system>-pc.template.md`

### NPC
See: `.templates/<system>-npc.template.md`

### Obstacle / Threat
See: `.templates/<system>-obstacle.template.md`

### Asset / Item
See: `.templates/<system>-asset.template.md`
```

### Step 8 — Build FULL REFERENCE

Reorganize all source content into:

```markdown
## FULL REFERENCE

### Character Creation
[Procedure, choices, starting values]

### Core Mechanics
[All rules with edge cases and exceptions]

### Advanced Rules
[Optional mechanics, variant rules]

### GM Section
[Running the game, NPC creation, pacing tools]
```

Remove any content already in CHEATSHEET to avoid duplication. Standardize headings. Preserve all numerical values exactly.

### Step 9 — Add CHANGELOG

```markdown
## CHANGELOG

| Date       | Source   | Changes          |
|------------|----------|------------------|
| YYYY-MM-DD | original | Initial restructure |
```

### Step 10 — Validate

- [ ] `.original.md` backup exists
- [ ] CHEATSHEET ≤ 2000 chars (estimate)
- [ ] LEXICON covers all game-specific terms from source
- [ ] All dice formulas from original are present in output
- [ ] All result thresholds match original (no value changed)
- [ ] All modifiers preserved
- [ ] No mechanics added that weren't in source
- [ ] 4 template files created in `.templates/`
- [ ] FULL REFERENCE contains no duplication with CHEATSHEET

### Step 11 — Preview and confirm

Show first 20 significant structural changes as a diff preview. Ask: `"Apply restructure? [Y/n]"`

On confirmation: write the optimized file, write the 4 template files.

## Test

After `rules-keeper <file>`, verify that: (1) `<file>.original.md` exists, (2) the output contains all 6 sections (CHEATSHEET, LEXICON, PATTERNS, ENTITY TEMPLATES, FULL REFERENCE, CHANGELOG), (3) CHEATSHEET is under 2000 characters, (4) at least one PATTERN entry exists, (5) no numerical value from the original was altered.
