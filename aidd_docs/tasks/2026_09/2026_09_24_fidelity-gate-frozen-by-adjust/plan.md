---
objective: "Au gel, adjust produit et vérifie un gate de fidélité complet par page depuis le contrat, et enforce ne fait que l'appliquer."
status: implemented
---

# Plan: gate de fidélité figé par adjust

## Overview

| Field      | Value                   |
| ---------- | ----------------------- |
| **Goal**   | Le contrat pilote le gate : props par élément, sélecteur maquette figé par page, filtre de page, gel bloquant sur gate incomplet, enforce sans complétion manuelle |
| **Source** | [`brainstorm.md`](./brainstorm.md) (session du 2026-09-24) |

## Phases

| #   | Phase                                        | File                         |
| --- | -------------------------------------------- | ---------------------------- |
| 1   | measure.py lit les props par cible           | [`phase-1.md`](./phase-1.md) |
| 2   | Schéma oracle `pages` + config-gen par page  | [`phase-2.md`](./phase-2.md) |
| 3   | Carte des éléments dans la table de define   | [`phase-3.md`](./phase-3.md) |
| 4   | adjust fige et vérifie le gate               | [`phase-4.md`](./phase-4.md) |
| 5   | enforce applique le gate figé                | [`phase-5.md`](./phase-5.md) |
| 6   | Release design 2.17.0                        | [`phase-6.md`](./phase-6.md) |

## Decisions

| Decision   | Why   |
| ---------- | ----- |
| Le gate figé vit dans `oracle.json § pages`, pas dans un nouvel artefact | Invariant « une donnée vit dans un seul artefact » : un sélecteur maquette est un hint de mesure. La config `measure.py` reste un dérivé déterministe (contrat + URL), régénérée à chaque run |
| `props` d'une cible **remplace** la liste globale ; la liste globale reste le repli | `contract-schema.md:246` documente déjà « Surcharge la liste de props » ; une union garderait le bruit que le contrat cherche à retirer |
| Le gel bloque sur un gate incomplet côté maquette | Critère utilisateur : un contrat qu'enforce ne peut pas appliquer complètement n'est pas figeable |
| Le gate ne s'impose qu'à une référence **mesurable** (DOM servi, harness `setPage`) ; brief seul ou maquette-image = fidélité sans objet, dit explicitement | `measure.py` mesure par sélecteur CSS : sans DOM, aucune cible n'existe et le gel serait bloqué à vie |
| La carte de define porte des libellés de brouillon ; `adjust` les rapproche des noms canoniques et comble les trous par un sélecteur prouvé en Mode A puis confirmé | `destructure` peut renommer ou fusionner ; sans ce rapprochement `--check` bloquerait sans chemin de sortie |
| Un composant présent sur aucune page ne bloque pas le gel ; il est listé dans la sortie et reste couvert par le seul lint | Aucune maquette ne le montre : il n'existe pas de référence de fidélité à laquelle le mesurer. La complétude se lit sur les deux gates réunis |
| Clés de `pages` = clés `setPage` du harness | `--page` pose déjà `reference_page` ; un second espace de noms dériverait |
| Le côté implémentation n'est vérifié qu'à enforce | Au gel, l'implémentation peut ne pas exister ; seule la maquette arbitrée est servie |
| Exclusion d'un élément possible seulement explicite (`skip` + raison), reportée | « Rien n'échappe sans le dire » : une exclusion muette est exactement le défaut actuel |
| Les travaux du dépôt consommateur (28 composants, lanceur) sont hors plan | Ils dépendent de ce plan et vivent dans un autre dépôt |
