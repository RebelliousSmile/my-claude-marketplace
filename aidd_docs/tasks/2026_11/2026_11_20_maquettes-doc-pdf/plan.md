---
objective: "doc-pdf compose n'importe quelle maquette décrite dans un dossier externe au format 1, Scriptami vit dans son propre dépôt, les guides cerascan en sortent identiques, et l'agent compose et crée une maquette sans terminal administrateur ni méthode à réapprendre."
status: in-progress
---

# Plan: doc-pdf, des maquettes séparées du moteur

## Overview

| Field      | Value |
| ---------- | ----- |
| **Goal**   | Faire de `doc-pdf` un moteur sans marque qui lit une maquette externe (Scriptami d'abord), lance InDesign seul et conduit la création d'une maquette par une skill dédiée. |
| **Source** | [`brainstorm.md`](./brainstorm.md) (2026-11-20), inventaire des valeurs Scriptami du moteur (session cerascan du même jour). |

## Phases

| #   | Phase | File |
| --- | ----- | ---- |
| 1   | Lanceur InDesign par tâche planifiée et méthode générique (0.3.0) | [`phase-1.md`](./phase-1.md) |
| 2   | Banc de comparaison, format de maquette 1 et chargeur : grille, nuancier, polices | [`phase-2.md`](./phase-2.md) |
| 3   | Gabarits, styles, textes, logo, composition et export dans la maquette | [`phase-3.md`](./phase-3.md) |
| 4   | Dépôt Scriptami, squelette neutre et tests sur le squelette (0.4.0) | [`phase-4.md`](./phase-4.md) |
| 5   | Skill `doc-pdf:maquette`, commandes `maquette init` et `maquette specimen` (0.5.0) | [`phase-5.md`](./phase-5.md) |

## Decisions

| Decision | Why |
| -------- | --- |
| Une maquette est un dossier de **données** : `maquette.json` (format, grille, nuancier, polices, styles, gabarits, cadres, textes, export) et des ressources (tracés SVG du logo). Aucun code JavaScript ni ExtendScript dans la maquette. | Toute la logique reste dans le moteur, testée une fois. Une maquette de gamme vit dans un dépôt `schema-*` : le moteur ne doit jamais exécuter de code venu d'un autre dépôt. |
| Champ `maquette` **obligatoire** dans `documentation.config.json`, chemin relatif au fichier ; aucune maquette par défaut dans le moteur. Le moteur refuse un `format` qu'il ne connaît pas. | Un projet ne doit jamais sortir en silence avec une autre charte. Un format numéroté permet de faire évoluer le moteur sans casser les maquettes existantes. |
| La preuve d'extraction compare **deux moteurs** sur les mêmes sources cerascan : un worktree du Marketplace au commit de fin de la phase précédente, l'autre au code courant. Chaque phase s'achève sur un commit demandé à l'utilisateur, dont le SHA est noté dans son compte rendu. En phase 4, la configuration cerascan change aussi : la référence lit une copie de l'ancienne configuration, posée dans le scratchpad. On ne stocke aucune sortie. | `zip-store.js` n'écrit ni date ni `mtime` : ICML et IDML se comparent octet pour octet. Aucun contenu client n'entre dans le Marketplace, et la référence se rejoue tant que le commit existe. |
| Scriptami passe d'abord par `engine/maquettes/scriptami/` (phases 2 et 3), puis part dans son dépôt (phase 4). | Chaque phase garde la comparaison verte et ne change qu'une chose. Un déplacement mêlé à l'extraction rendrait un écart impossible à attribuer. |
| Le lanceur élevé passe par une tâche planifiée `RunLevel Highest`, `LogonType Interactive`, désenregistrée à la fin. | Le COM d'InDesign exige un processus administrateur. Ce contournement a été validé le 2026-11-20 en composant les trois guides cerascan sans terminal administrateur. |
| L'identifiant `cerascan_object_styles` (`icml-transform.js:138`) ne change pas. | Les `.indd` déjà composés le lisent (`SKILL.md:46`) : le renommer casserait leurs styles d'objet. |
| La maquette d'Adrenaline n'entre pas dans ce plan. | Trois points restent ouverts dans le brainstorm : le rendu des blocs PJ, PNJ et monstre, les polices OTF/TTF avec leurs licences, et les attentes d'un PDF vendu. Elle aura son propre plan, sur le format 1. |
