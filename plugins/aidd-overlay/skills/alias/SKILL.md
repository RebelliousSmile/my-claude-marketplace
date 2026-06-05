---
name: alias
model: sonnet
description: Fires a pre-crafted workflow prompt to chain aidd skills in one command, or rewrite a prompt file in place (smarten). Use when you want to trigger plan→challenge or implement→review sequences, project snapshot with status context (previously), or compress a .md prompt to its minimal form (smarten). Do NOT use for single-skill tasks, custom workflows, or when you need direct control over each step.
---

# Alias

Expands a short command into a well-crafted, pre-authored prompt that chains aidd skills. Each alias carries the exact instruction sequence for a recurring workflow — call it once, it fires the right prompt.

## Available actions

| #   | Action        | Role                                                                           | Input                        |
| --- | ------------- | ------------------------------------------------------------------------------ | ---------------------------- |
| 01  | `rechallenge` | Plan the current task, then challenge until 0 deal-breakers and 0 suggestions  | current task in context      |
| 02  | `endtask`     | Commit → archive plan → learn (auto) → merge/push → changelog → push tags → close issue | current branch + optional issue number |
| 03  | `bump-plugin` | Bump plugin version in plugin.json + index.json → commit → push marketplace    | plugin name + version or bump type |
| 04  | `previously`  | Project snapshot with status context — status summary + tests/git/lint snapshot | optional depth (commit count or duration like 7d) |
| 05  | `smarten`     | Rewrite a prompt file in place — remove fluff, compress steps, bullet points    | file path |
| 06  | `skillconf`   | Classify enabled skills as auto-trigger vs user-invocable-only → update skillOverrides | settings.json accessible |
| 07  | `aiddlegacy`  | Scan `.claude/` legacy AIDD (<v4) → dry-run report → confirm → delete transferred agents/commands/skills → arbitrate rules | `.claude/` du projet courant |
| 08  | `weeklyemail` | Collecte les commits de la semaine sur tous les dépôts GitHub ou GitLab accessibles et génère un e-mail client synthétique | plateforme (`github` / `gitlab`) + optionnel `since` |

## Default flow

Trigger-to-action mapping:

- "plan and challenge", "plan then challenge", "alias rechallenge", "rechallenge", "challenge the plan in a loop", "plan with challenge" → `rechallenge`
- "end task", "close task", "endtask", "alias endtask", "commit and release", "wrap up this task", "finish the task", "end plan", "close plan", "endplan", "merge the plan branch", "archive the plan", "finish the plan branch" → `endtask`
- "bump plugin", "release plugin", "bump-plugin", "alias bump-plugin", "monter en version", "bumper le plugin", "release <plugin>" → `bump-plugin`
- "where are we in the project", "catch me up", "what's the current project state", "project snapshot", "previously", "alias previously" → `previously`
- "smarten", "slim this", "simplify this prompt", "optimize this prompt", "compress this file", "alias smarten" → `smarten`
- "skillconf", "configure skills", "auto-configure skills", "reduce skill context", "skill overrides", "alias skillconf", "skills prennent trop de place", "descriptions écretées" → `skillconf`
- "aiddlegacy", "aidd legacy", "clean aidd legacy", "migrate aidd v4", "nettoyer l'ancienne installation aidd", "nettoyer aidd", "legacy cleanup" → `aiddlegacy`
- "weeklyemail", "weekly email", "rapport hebdomadaire", "email client semaine", "résumé commits semaine", "weekly report", "rapport de la semaine" → `weeklyemail`

## Transversal rules

- Execute the pre-crafted prompt verbatim — do not paraphrase, summarize, or reorder steps.
- No user confirmation is needed between steps unless the action explicitly requires it.
- If the required context (task description, plan file) is missing, ask for it before firing.
