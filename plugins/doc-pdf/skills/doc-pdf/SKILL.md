---
name: doc-pdf
description: >-
  Génère la documentation PDF d'un projet client depuis son Markdown : ICML et IDML de la charte Scriptami, mise à jour du .indd existant et export PDF par InDesign.
author: François-Xavier Guillois
version: 0.2.0
vibe_version: ">=1.0.0"
permissions:
  - bash
  - files
tags:
  - documentation
  - indesign
  - pdf
---

Read [host portability](../../references/host-portability.md) before resolving plugin files, invoking sibling skills, or persisting project guidance.

# doc-pdf

Moteur interprojets : le Markdown reste dans le dépôt du client, la charte Scriptami est unique, le moteur vit dans ce plugin.

## Available actions

Une seule skill, plusieurs commandes du moteur. Les lancer avec `node <DOC_PDF_PLUGIN_ROOT>/engine/cli.js <commande>`, depuis le dossier du projet client.

| Commande | Rôle | Prérequis |
|----------|------|-----------|
| `init` | Écrit un `documentation.config.json` de départ, refuse d'écraser | aucun |
| `merge` | Versions fusionnées des guides (`--check` pour seulement contrôler) | aucun |
| `icml` | Régénère les ICML depuis le Markdown (`--force` pour passer outre un ICML modifié) | Pandoc |
| `idml` | Modèle IDML de la charte (`--gabarits`, `--guide <id>`) | aucun |
| `pdf build` | Compose un chapitre d'essai dans InDesign | Pandoc, InDesign |
| `pdf update` | Met à jour le `.indd` du guide et exporte le PDF | Pandoc, InDesign |
| `pdf compose` | Place tous les chapitres (ICML liés) dans le modèle IDML, écrit le `.indd` et le PDF (`--remplacer`, `--sortie <fichier.indd>`) | Pandoc, InDesign |

## Default flow

1. Localiser `DOC_PDF_PLUGIN_ROOT` (cf. portabilité), puis vérifier la configuration : `init` si le projet n'a pas de `documentation.config.json`.
2. Régénérer les ICML avec `icml`. Si l'export s'arrête en nommant un ICML modifié à la main, le montrer à l'utilisateur : ne passer `--force` qu'avec son accord, car la régénération écrase la retouche.
3. Pour mettre à jour le PDF, lancer `pdf update --guide <id>`, seulement avec l'accord explicite de l'utilisateur.

## Transversal rules

- Sources uniques : le Markdown et `documentation.config.json`. Ne jamais corriger un ICML généré sans le dire : la prochaine régénération l'écrase, sauf si l'utilisateur le retouche exprès (le manifeste d'empreintes l'arrête alors).
- Ne jamais modifier la charte, les maquettes, ni le jeu de styles fermé (`STYLE_TABLE`) ; ne pas renommer `cerascan_object_styles` (identifiant lu par les `.indd` existants).
- Piloter InDesign (`pdf`) exige l'accord de l'utilisateur, le document fermé, une copie de sauvegarde (faite par `update`) et aucun terminal administrateur : le moteur passe par une tâche planifiée élevée (`run-elevated.ps1`, codes de sortie dans le runbook, section 3 quater). Sans l'accord de l'utilisateur, donner la commande au lieu de la lancer.
- Sans Pandoc dans le PATH, le moteur s'arrête avant d'écrire quoi que ce soit : indiquer l'installation à l'utilisateur.
- Un texte retouché dans InDesign sur un cadre lié est écrasé par la mise à jour : le rappeler.
- Ne rien copier du moteur dans le projet client : l'appeler depuis le plugin.

## References

- `references/runbook-export-indesign.md` : mise en page dans InDesign, jeu de styles, liens, dépannage.
