---
name: upgrade
model: sonnet
description: Iteratively improves a piece of writing or a workshop prompt through structured analysis, targeted suggestions, and validated rewrites. Use when improving an existing chapter draft, refining a workshop prompt file, or iterating on any written artifact. Do NOT use for persona-based chapter review — use `review` instead; do NOT use for full chapter rewrites from TOC — use `write --feedback` instead.
---

# Upgrade

Applies structured improvement to any written artifact: analyzes the current version, identifies weaknesses, proposes targeted improvements, validates with the user, and rewrites the improved version. Works on chapter drafts, workshop prompts, overview files, or any narrative document. Iterates until the user is satisfied.

## Available actions

| #   | Action    | Role                                              | Input                                   |
| --- | --------- | ------------------------------------------------- | --------------------------------------- |
| 01  | `upgrade` | Analyze artifact, propose improvements, rewrite   | file path or last output to improve     |

## Default flow

Single action: `01 → iterate until user satisfied`.

Trigger-to-action mapping:
- "upgrade", "improve this", "make it better", "refine this text", "upgrade the prompt", "iterate on this" → `upgrade`

## Transversal rules

- Always analyze before proposing: identify what works, what doesn't, what is missing.
- Propose specific improvements with rationale — never generic suggestions.
- Present the improved version and ask for validation before saving.
- Preserve the original's voice, intent, and structure unless the user explicitly asks to change them.
- Log the version history if the artifact has a `version:` frontmatter field.
- When saving back to the project, use `<projet-root>` = `<jeu>/ecrits/<projet>/` as the base path.
- When loading universe context, read from `<univers-root>/canon/`.

> Path variables: see `setup/references/vault-layout.md`.
