# Action 06 — skillconf

Audits the skills active in the current project context and classifies each as auto-trigger vs user-invocable-only against a small, curated **CORE allowlist** — not a per-description heuristic. Only a handful of skills stay in every project's passive context; everything else defaults to user-invocable-only (still callable via `/skill-name`, just absent from the "Available skills" block). Writes `skillOverrides` to the **project** `.claude/settings.json` — leaving global settings untouched.

## Context required

The current working directory must be a project with or without an existing `.claude/settings.json`.

## Prompt

Execute the following workflow verbatim:

### Step 1 — Read the CORE allowlist

Read `assets/skillconf-core.json` (next to this action, in the marketplace source) → `core` array. This is the single source of truth for what stays auto — maintained by hand across the whole marketplace, not recomputed per run. No `SKILL.md` reads, no description parsing: classification is a flat membership test, which is what makes this action cheap to run.

### Step 2 — Identify active skills

Use the skills visible in the current system-reminder's `Available skills` block (this session's actual loaded set — do not read `enabledPlugins` from global settings, it may list plugins not yet reloaded). List each as `plugin:skill-name` (or the bare name for un-namespaced project-level skills under `.claude/skills/`).

### Step 3 — Read project baseline

Read `.claude/settings.json` in the current working directory (create if absent — start from `{}`). Extract existing `skillOverrides` as the baseline.

### Step 4 — Classify each skill

```
verdict = CORE.includes(skillKey) ? "auto" : "user-invocable-only"
```

No exceptions, no per-project tech-stack logic needed: language-specific plugins (`sc-js`, `sc-php`, `sc-python`, `sc-rust`, `sc-css`, `sc-tiers`, `design`, `obs`, …) are never in CORE, so they're always proposed `user-invocable-only` regardless of the project's stack — the user calls the right one by hand when needed (e.g. `/sc-python:sniff` in a Python repo). This is what keeps it safe to enable every marketplace plugin globally: an idle plugin costs nothing in context until explicitly invoked.

### Step 5 — Emit classification table

```
📋 skillconf — <project name> (<N> skills active, <K> core)

| Skill                        | Baseline  | Proposed             | Rationale         |
|-------------------------------|-----------|-----------------------|--------------------|
| aidd-dev:01-plan               | auto      | auto                  | CORE               |
| overcode:alias                 | auto      | auto                  | CORE               |
| overcode:harvest                | auto      | user-invocable-only   | not in CORE        |
| sc-js:sniff                    | auto      | user-invocable-only   | not in CORE        |
| ...                            |           |                        |                    |

M skills reclassified to user-invocable-only · K stay auto (CORE)
Target file: .claude/settings.json
```

### Step 6 — Confirm and apply

Ask: *"Apply this configuration to `.claude/settings.json`? (y/n)"*

On confirmation, merge into `.claude/settings.json`:
- For each skill proposed as `user-invocable-only`: set `skillOverrides["<skill-key>"] = "user-invocable-only"`
- For each skill proposed as `auto` (CORE) that has a stale override in the project settings: remove its entry
- Preserve all other keys in `.claude/settings.json` — only touch `skillOverrides`

### Step 7 — Report

```
✅ skillconf applied — .claude/settings.json

→ user-invocable-only: N skills
→ kept auto (CORE):    K skills
→ unchanged:            J skills (already correct)

Reload the session for changes to take effect.
```

## Updating the CORE allowlist

`assets/skillconf-core.json` is hand-maintained, not generated. Add a skill key when it earns "applies itself on its own initiative, needed in every project" status (e.g. onboarding, planning, review, challenge, alias dispatch). Keep it short — the whole point is that most skills are opt-in via explicit invocation, not opt-out via keyword-matching.
