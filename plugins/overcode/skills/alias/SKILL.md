---
name: alias
description: Fires a pre-crafted workflow prompt for recurring project operations. Use for plan/review chains, project snapshots, prompt compression, visual reconciliation, or AI-code review. Do NOT use for custom workflows or when direct control over each step is required.
author: François-Xavier Guillois
version: 4.7.0
vibe_version: ">=1.0.0"
permissions:
  - bash
  - files
tags:
  - workflow
  - shortcuts
  - automation
  - workflows
  - productivity
---

Read [host portability](../../references/host-portability.md) before resolving plugin files, invoking sibling skills, or persisting project guidance.

# Alias

Expands a short command into a well-crafted, pre-authored prompt that chains aidd skills. Each alias carries the exact instruction sequence for a recurring workflow — call it once, it fires the right prompt.

## Available actions

| #   | Action        | Role                                                                           | Input                        |
| --- | ------------- | ------------------------------------------------------------------------------ | ---------------------------- |
| 01  | `rechallenge` | Plan the current task, then challenge until 0 deal-breakers and 0 suggestions  | current task in context      |
| 02  | `endtask`     | Commit → resolve implemented plan directory → learn (auto) → merge/push → changelog → push tags → close issue → safe worktree/branch cleanup | current branch + optional issue number |
| 03  | `bump-plugin` | Bump version + description across plugin.json and marketplace.json → verify → commit → push | plugin name + version or bump type |
| 04  | `previously`  | Documentary catch-up — previous conversations + `aidd_docs/` movement + git state, no build and no audit | optional depth (commit count or duration like 7d), `--backlog <file.md>`, and optional `--milestone`/`--ml <title>` |
| 05  | `gitit`       | Init git dans `R` + dépôt distant **privé** via gh (si absent) + commit + pull + push + tag SemVer si un push a eu lieu | dossier cible `R` (défaut CWD) `[--public]` |
| 06  | `mirror`      | Image deux navigateurs côte à côte → diff texte + style → corrections via le contrat agent `design/agents/copycat.md` | image (chemin ou collée) + optionnel `--ref right` |

## Default flow

Trigger-to-action mapping:

- "plan and challenge", "plan then challenge", "alias rechallenge", "rechallenge", "challenge the plan in a loop", "plan with challenge" → `rechallenge`
- "end task", "close task", "endtask", "alias endtask", "commit and release", "wrap up this task", "finish the task", "end plan", "close plan", "endplan", "merge the plan branch", "archive the plan", "finish the plan branch" → `endtask`
- "bump plugin", "release plugin", "bump-plugin", "alias bump-plugin", "monter en version", "bumper le plugin", "release <plugin>" → `bump-plugin`
- "where are we in the project", "catch me up", "what's the current project state", "project snapshot", "previously", "alias previously" → `previously`
- "gitit", "alias gitit", "git it", "init le dépôt git", "crée le dépôt git", "versionne ce dossier", "crée et pousse le dépôt", "git init + remote + push" → `gitit`
- "mirror", "alias mirror", "comparer les deux navigateurs", "corriger les différences maquette", "aligner l'implémentation sur la maquette", "réconcilier mockup vs impl", "trouve les différences dans l'image", "corrige les écarts visuels" → `mirror`

## Transversal rules

- Preserve each pre-crafted prompt's semantics and ordering. Translate only host syntax: `$plugin:skill` on Codex, `/plugin:skill` on Claude Code, and native capability names for tools.
- No user confirmation is needed between steps unless the action explicitly requires it.
- If the required context (task description, plan file) is missing, ask for it before firing.
