---
name: storyboard
model: sonnet
description: Identifies key visual moments in a chapter and generates detailed illustration briefs (for an artist or an image AI). Use when planning illustrations for a chapter, generating image prompts from narrative content, or building a visual brief from a scene. Do NOT use for writing or correcting chapter text — use write or review instead; do NOT use for defining the writing style — use tone-finder instead.
---

# Storyboard

Analyse un chapitre pour en extraire les moments visuels clés, puis génère des briefs visuels détaillés cohérents avec les docs univers et l'output-style. Les outputs alimentent soit un brief artiste, soit des prompts pour génération d'images IA.

## Available actions

| #  | Action      | Role                                                              | Input                                           |
|----|-------------|-------------------------------------------------------------------|-------------------------------------------------|
| 01 | `extract`   | Identifier et classer les moments illustrables d'un chapitre     | Fichier chapitre + `bank.yml`                   |
| 02 | `describe`  | Générer un brief visuel détaillé pour un moment ciblé            | Moment (depuis extract ou décrit directement)   |

## Default flow

`01 → user sélectionne les moments → 02` à la demande pour chaque moment choisi.

Trigger-to-action mapping :
- "storyboard ce chapitre", "identifie les moments à illustrer", "quels passages illustrer", "visual moments" → `extract`
- "décris ce moment", "brief visuel pour la scène X", "génère le prompt pour l'illustration", "brief artiste" → `describe`

## Transversal rules

- Lire les docs univers déclarés dans `bank.yml` avant toute description de personnage ou de lieu — ne jamais inventer de descriptions physiques canoniques.
- Tagger `[VISUAL-INTRO]` pour la première apparition visuelle d'un élément (personnage, lieu, objet important).
- Le ton visuel doit être cohérent avec l'output-style du projet.
- Fichiers de sortie : `.storyboard/<chapitre>-moments.md` (extract) et `.storyboard/<chapitre>-brief-<NN>.md` (describe).
- Ne jamais supprimer un brief existant sans confirmation — les briefs sont des livrables potentiels.

## External data

- `bank.yml` — liste les docs univers (personnages, lieux, terminologie, output-style).
- `.storyboard/<chapitre>-moments.md` — liste des moments extraits, consommée par `describe`.
- `setup/references/vault-layout.md` — convention des variables de chemin (`<univers-root>`, `<projet-root>`, …).
