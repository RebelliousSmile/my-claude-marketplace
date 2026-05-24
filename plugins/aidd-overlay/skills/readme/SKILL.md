---
name: readme
model: sonnet
description: Writes, revises, or fragments a README.md following a structured guideline — detects scope (full / fragment / revision / draft), collects blocking inputs in one pass, writes, and self-verifies output. Triggers on "rédige le README", "crée un README pour", "write a README", "améliore ce README", "challenge cette version", "rédige la section X", "draft README", "écris le README de mon projet". Do NOT use for CONTRIBUTING, CHANGELOG, release notes, API docs, or code documentation.
---

# Readme

Rédige, révise ou fragmente un `README.md` en suivant un guide de structure et de ton précis. Détecte automatiquement le périmètre de la demande, collecte les inputs bloquants en une seule passe, rédige, puis s'auto-vérifie avant de rendre.

## Available actions

| #  | Action  | Role                                           | Input                               |
|----|---------|------------------------------------------------|-------------------------------------|
| 01 | `write` | Full README, fragment, revision, or draft      | See action for blocking inputs      |

## Default flow

Single action. Dispatch to `write` on any trigger.

## Transversal rules

- Never invent versions, URLs, platform names, or performance figures — see `@references/tone.md`
- Self-verification is mandatory — never skip the 8-point checklist
- Output: raw Markdown printed in the response (no ` ```markdown ``` ` wrapper); write `README.md` only on explicit request
- If `README.md` already exists and the user requests file output: ask confirmation before overwriting — never overwrite silently

## External references

- `@references/sections.md` — sections 1–12 specification and annotated example
- `@references/tone.md` — tone rules, format rules, length guide, auto-verification procedure
