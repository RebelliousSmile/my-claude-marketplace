---
name: upgrade
model: sonnet
description: Iteratively improves a piece of writing or a workshop prompt through structured analysis, targeted suggestions, and validated rewrites. Use when improving an existing chapter draft (`<output>/chapters/chapter-<NN>.md`), refining a workshop prompt file, or iterating on any written artifact. Do NOT use for persona-based chapter review — use `review` instead; do NOT use for full chapter rewrites from TOC — use `write --feedback` instead.
---

# Upgrade

Applies structured improvement to any written artifact: analyzes the current version, identifies weaknesses, proposes targeted improvements, validates with the user, and rewrites the improved version. Works on chapter drafts (`<output>/chapters/chapter-<NN>.md`), workshop prompts, overview files, or any narrative document. Optionally loads `<brief>/summary.md` and `<brief>/output-styles/` for style consistency checks. Iterates until the user is satisfied.

Reads the **brief model**: `${CLAUDE_PLUGIN_ROOT}/references/brief-model.md`.

## Available actions

| #   | Action    | Role                                              | Input                                                         |
| --- | --------- | ------------------------------------------------- | ------------------------------------------------------------- |
| 01  | `upgrade` | Analyze artifact, propose improvements, rewrite   | `<file>` [`--brief <brief>`]                                  |

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
- When `--brief` is provided, load `<brief>/summary.md` and `<brief>/output-styles/` for style consistency checks. Never read outside `<brief>/`.
- Chapter file paths follow the brief-model convention: `<output>/chapters/chapter-<NN>.md` (2-digit numbers).

## External data

- `${CLAUDE_PLUGIN_ROOT}/references/brief-model.md` — the brief → output working-dir contract.
- `<file>` (positional) — the artifact to improve (typically `<output>/chapters/chapter-<NN>.md` or a workshop prompt file).
- `<brief>/summary.md` — optional context; loaded only when `--brief` is passed.
- `<brief>/output-styles/<name>.md` — optional style reference; loaded only when `--brief` is passed.
