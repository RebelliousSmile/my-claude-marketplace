# Action 08 — skillconf

Audits the skills active in the current project context, classifies them as auto-trigger vs user-invocable-only based on description analysis, and writes `skillOverrides` to the **project** `.claude/settings.json` — leaving the global settings untouched. Each project gets its own configuration scoped to its active plugins.

## Context required

The current working directory must be a project with or without an existing `.claude/settings.json`.

## Prompt

Execute the following workflow verbatim:

### Step 1 — Identify active skills

Do NOT read `enabledPlugins` from the global settings — it may include plugins that are not loaded in this session. Instead, use the skills visible in the current system-reminder (the `Available skills` block). These are the skills actually active in this project context.

For each active skill, locate its `SKILL.md` in the cache at:
`~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/skills/<skill-name>/SKILL.md`

Extract:
- `description` frontmatter field (verbatim — this is what gets shown in context)
- Character count of the description

### Step 2 — Read project baseline

Read `.claude/settings.json` in the current working directory (create if absent — start from `{}`).
Extract existing `skillOverrides` as the baseline.

### Step 3 — Classify each skill

Apply the following rule:

**→ `user-invocable-only`** if ALL are true:
- Description contains none of: `TRIGGER when`, `Use proactively`, `automatically`, `detect`, `check if`, `proactively`
- Skill is always invoked explicitly by the user (`/skill-name` or alias command)
- Hiding it from the auto-trigger context loses no detection value

**→ keep auto** if ANY is true:
- Description contains `TRIGGER when`, `Use proactively when`, or conditions Claude must evaluate passively
- Skill is infrastructure that Claude should apply on its own initiative (`update-config`, `claude-api`, `aidd-context:05-learn`, `fewer-permission-prompts`)

### Step 4 — Emit classification table

```
📋 skillconf — <project name> (<N> skills active)

| Skill                      | Desc chars | Baseline  | Proposed            | Rationale                                      |
|----------------------------|------------|-----------|---------------------|------------------------------------------------|
| sc-js:sniff                | 312        | auto      | auto                | TRIGGER when: — passive detection needed       |
| aidd-overlay:alias         | 198        | auto      | user-invocable-only | always user-invoked via slash command          |
| aidd-overlay:harvest       | 145        | auto      | user-invocable-only | explicit workflow, never auto-triggered        |
| ...                        |            |           |                     |                                                |

Chars removed from context: ~N  (M skills reclassified)
Target file: .claude/settings.json
```

### Step 5 — Confirm and apply

Ask: *"Apply this configuration to `.claude/settings.json`? (y/n)"*

On confirmation, merge into `.claude/settings.json`:
- For each skill proposed as `user-invocable-only`: set `skillOverrides["<skill-key>"] = "user-invocable-only"` (use the same key format as the existing `skillOverrides` entries, or match the format visible in the global settings)
- For each skill proposed as `auto` that has a current override in the project settings: remove its entry
- Preserve all other keys in `.claude/settings.json` — only touch `skillOverrides`

### Step 6 — Report

```
✅ skillconf applied — .claude/settings.json

→ user-invocable-only: N skills (−X chars from context)
→ kept auto:           M skills
→ unchanged:           K skills (already correct)

Reload the session for changes to take effect.
```
