---
name: storyboard
model: sonnet
description: Identifies key visual moments in a chapter and generates detailed illustration briefs (for an artist or an image AI). Use when planning illustrations for a chapter, generating image prompts from narrative content, or building a visual brief from a scene. Do NOT use for writing or correcting chapter text — use write or review instead; do NOT use for defining the writing style — use tone-finder instead.
---

# Storyboard

Analyse un chapitre pour en extraire les moments visuels clés, puis génère des briefs visuels détaillés cohérents avec le brief univers et l'output-style. Les outputs alimentent soit un brief artiste, soit des prompts pour génération d'images IA.

Reads the **brief model**: `${CLAUDE_PLUGIN_ROOT}/references/brief-model.md`. All context comes from `<brief>/summary.md` (lore consolidated) — `storyboard` never reads outside `<brief>/` and `<output>/`.

## Available actions

| #  | Action      | Role                                                              | Input                                                        |
|----|-------------|-------------------------------------------------------------------|--------------------------------------------------------------|
| 01 | `extract`   | Identifier et classer les moments illustrables d'un chapitre     | `<brief>` `--out <output>` `--chapter <NN>`                  |
| 02 | `describe`  | Générer un brief visuel détaillé pour un moment ciblé            | Moment ID (depuis extract) ou description directe            |

## Default flow

`01 → user sélectionne les moments → 02` à la demande pour chaque moment choisi.

Trigger-to-action mapping :
- "storyboard ce chapitre", "identifie les moments à illustrer", "quels passages illustrer", "visual moments" → `extract`
- "décris ce moment", "brief visuel pour la scène X", "génère le prompt pour l'illustration", "brief artiste" → `describe`

## Transversal rules

- Le contexte univers vient exclusivement de `<brief>/summary.md` (autosuffisant). Ne jamais lire hors de `<brief>/`.
- Tagger `[VISUAL-INTRO]` pour la première apparition visuelle d'un élément (personnage, lieu, objet important).
- Le ton visuel doit être cohérent avec l'output-style déclaré dans `<brief>/summary.md` ou `<brief>/output-styles/`.
- Fichiers de sortie : `<output>/storyboard/chapter-<NN>.md` contient les moments extraits (action 01) et les briefs décrits (action 02).
- Ne jamais supprimer un brief existant sans confirmation — les briefs sont des livrables potentiels.
- Numérotation 2 chiffres : `chapter-01`, `chapter-02`, … `chapter-10`.

## External data

- `${CLAUDE_PLUGIN_ROOT}/references/brief-model.md` — the brief → output working-dir contract.
- `<brief>/summary.md` — autonomous brief (synopsis, type, language, lore consolidated).
- `<brief>/output-styles/<name>.md` — writing and visual conventions.
- `<output>/chapters/chapter-<NN>.md` — the chapter to analyse (produced by `write`).
- `<output>/storyboard/chapter-<NN>.md` — moments list produced by `extract`, consumed by `describe`.
