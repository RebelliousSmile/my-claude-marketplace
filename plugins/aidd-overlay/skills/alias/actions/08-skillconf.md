# Action 08 — skillconf

Audits all enabled skills, classifies them as auto-trigger vs user-invocable-only based on description analysis, and updates `skillOverrides` in `~/.claude/settings.json` to minimize context footprint and prevent description truncation.

## Context required

`~/.claude/settings.json` must be accessible.

## Prompt

Execute the following workflow verbatim:

### Step 1 — Inventory

Read `~/.claude/settings.json`. Extract:
- `enabledPlugins` — list of active plugin keys
- `skillOverrides` — current overrides (baseline)

For each enabled plugin, locate its skills in the cache at `~/.claude/plugins/cache/<marketplace>/<plugin>/`. Find the version folder, then read each skill's `SKILL.md`. Extract:
- `description` frontmatter field (the string shown in context)
- `name` frontmatter field
- Character count of the description

### Step 2 — Classify each skill

Apply the following rule to each skill:

**→ `user-invocable-only`** if ALL are true:
- Description contains none of: `TRIGGER when`, `Use proactively`, `automatically`, `detect`, `check if`
- Skill is always invoked explicitly by the user (`/skill-name`, keybinding, or slash command alias)
- No passive auto-detection value is lost by hiding it from context

**→ keep auto** if ANY is true:
- Description contains `TRIGGER when`, `Use proactively when`, `automatically`, or describes conditions Claude must evaluate passively (file patterns, import signals, conversation cues)
- The skill is infrastructure (update-config, claude-api, update-memory)

### Step 3 — Emit classification table

```
📋 skillconf — classification

| Skill                  | Desc chars | Current   | Proposed            | Rationale                                     |
|------------------------|------------|-----------|---------------------|-----------------------------------------------|
| sc-js:sniff            | 312        | auto      | auto                | TRIGGER when: — passive detection needed      |
| aidd-overlay:alias     | 198        | auto      | user-invocable-only | always user-invoked via slash command         |
| aidd-overlay:harvest   | 145        | auto      | user-invocable-only | explicit workflow, never auto-triggered       |
| ...                    |            |           |                     |                                               |

Total description chars removed from context: ~N
Skills reclassified: M
```

### Step 4 — Confirm and apply

Ask: *"Apply this configuration? (y/n)"*

On confirmation:
- For each skill proposed as `user-invocable-only`: add or update `skillOverrides` in `~/.claude/settings.json` with key `"<plugin>:<skill>"` → `"user-invocable-only"` (follow the key format already present in the file)
- For each skill proposed as `auto` that has a current override: remove its entry from `skillOverrides`
- Do not modify any override for skills outside the current enabled set

### Step 5 — Report

```
✅ skillconf applied

→ user-invocable-only: N skills (−X chars from context)
→ kept auto:           M skills
→ unchanged:           K skills

Updated: ~/.claude/settings.json
Reload the session for changes to take effect.
```
