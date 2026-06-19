---
name: audit
model: sonnet
description: >-
  Audit CSS multi-dimensionnel : spécificité (guerres de cascade), code mort
  (sélecteurs inutilisés, règles inaccessibles), magic numbers (valeurs littérales
  hors tokens), couverture a11y (contrastes, focus visible, réduction de mouvement),
  opportunités modernes (has(), container queries, nesting, subgrid). Read-only :
  identifie et classe les problèmes, n'édite jamais le code.
---

# sc-css:audit

Audit CSS read-only — détecte, classe, priorise.

## Dimensions d'audit

| # | Dimension | Ce qu'on cherche |
|---|-----------|-----------------|
| 01 | `specificity` | Sélecteurs `!important`, combinateurs trop profonds (> 3), ID dans les règles de composants |
| 02 | `dead-code` | Sélecteurs ne ciblant aucun élément HTML du projet (cross-reference DOM), `@keyframes` inutilisées |
| 03 | `magic-numbers` | Valeurs littérales de couleur/spacing/typo hors `var(--)` et hors `tokens.json` |
| 04 | `a11y` | Ratio de contraste < 4.5:1 (AA), `outline: none` sans alternative `:focus-visible`, absence de `prefers-reduced-motion` sur les animations |
| 05 | `modern-opportunities` | Constructions remplaçables par `has()`, `:is()`, `:where()`, container queries, nesting natif, subgrid |

## Routing

- Audit ciblé (`/sc-css:audit specificity`) → une seule dimension.
- Audit complet (`/sc-css:audit`) → toutes les dimensions, un rapport fusionné.

## Format du rapport

Fichier `aidd_docs/tasks/audits/<yyyy>_<mm>_css.md` (une seule passe), template `@assets/audit-template.md`.

Chaque finding : sévérité (`error`/`warning`/`info`) · dimension · `file:line` · problème · suggestion de fix · effort (`xs`/`s`/`m`/`l`).

## Règles

- Read-only : aucune modification de fichier.
- Ne pas inventer des findings pour une dimension non applicable (ex. pas de `:focus-visible` à auditer si aucune interaction JS).
- Croiser les sélecteurs morts avec le HTML réel du projet (pas seulement la liste CSS).
- Si un contrat design est présent (`design/tokens.json`), utiliser ses valeurs comme référence pour détecter les magic numbers.
