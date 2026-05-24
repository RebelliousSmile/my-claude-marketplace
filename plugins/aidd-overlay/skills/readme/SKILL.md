---
name: readme
model: sonnet
description: Writes or updates a README.md following a structured guideline — `write` creates from scratch (full / draft / fragment when no README exists); `update` revises an existing README globally or section by section. Triggers on "rédige le README", "crée un README pour", "write a README", "améliore ce README", "challenge cette version", "mets à jour la section X", "draft README", "écris le README de mon projet". Do NOT use for CONTRIBUTING, CHANGELOG, release notes, API docs, or code documentation.
---

# Readme

Rédige ou met à jour un `README.md` en suivant un guide de structure et de ton précis. Deux actions selon que le fichier existe ou non : `write` crée de zéro, `update` améliore l'existant.

## Available actions

| #  | Action   | Role                                                              | Input                               |
|----|----------|-------------------------------------------------------------------|-------------------------------------|
| 01 | `write`  | Crée un README de zéro — full, draft, ou section isolée          | Inputs bloquants (voir action)      |
| 02 | `update` | Révise un README existant — global ou section ciblée             | `README.md` existant                |

## Default flow

Dispatcher selon l'état du fichier et le déclencheur :

| Situation | Action |
|---|---|
| Pas de `README.md` | `write` |
| `README.md` existe + déclencheur neutre (`/readme`, "améliore…", "challenge…", "mets à jour…") | `update` |
| `README.md` existe + section manquante à ajouter | `update` (détecte l'absence et l'ajoute) |
| `README.md` existe + "réécris complètement" | `write` (demander confirmation avant d'écraser) |
| Snippet de section sans contexte de projet | `write` |

## Transversal rules

- Never invent versions, URLs, platform names, or performance figures — see `@references/tone.md`
- Self-verification is mandatory for both actions — never skip the 8-point checklist
- Output: raw Markdown printed in the response (no ` ```markdown ``` ` wrapper); write `README.md` only on explicit request
- If `README.md` already exists and the user requests file output: ask confirmation before overwriting — never overwrite silently

## External references

- `@references/sections.md` — sections 1–12 specification and annotated example
- `@references/tone.md` — tone rules, format rules, length guide, auto-verification procedure
