---
name: improve
model: sonnet
description: >-
  Amélioration ciblée de l'architecture CSS existante : extraction vers custom properties,
  organisation en cascade layers, réduction de spécificité, modernisation syntaxique
  (nesting, :is()/:where()/has(), container queries). Travaille sur les findings d'audit
  ou sur une demande directe. Propose un plan avant d'éditer.
---

# sc-css:improve

Amélioration CSS ciblée — propose → valide → exécute.

## Actions disponibles

| # | Action | Rôle | Input |
|---|--------|------|-------|
| 01 | `analyze` | Lire le rapport audit ou inspecter la zone cible, prioriser les améliorations | rapport audit ou fichier CSS ciblé |
| 02 | `plan` | Proposer le plan de modifications (diff lisible) avant toute édition | output de analyze |

## Default flow

Séquentiel : `analyze` → `plan` → validation humaine → exécution.

## Périmètre par capability

### custom-properties
Extraire les valeurs littérales répétées (couleurs, espacements, typo) vers des déclarations `--custom-property` dans `:root`. Si un contrat design (`design/tokens.json`) est présent, aligner les noms sur la nomenclature du contrat (`--color-brand-primary`, `--space-4`, etc.) — les custom props CSS deviennent la réalisation du token.

### cascade-layers
Déclarer `@layer` en tête du CSS principal (reset, base, components, utilities, overrides), reclasser les règles existantes dans la layer appropriée. Supprimer les `!important` rendus inutiles par l'ordre des layers.

### specificity
Remplacer les sélecteurs ID par classes, aplatir les chaînes trop profondes, retirer les qualificateurs superflus (`.btn.btn--primary` → `.btn--primary`). Utiliser `:where()` pour les sélecteurs réinitialisables à zéro-spécificité.

### modernize
Introduire `:is()`, `:where()`, `:has()`, nesting natif, container queries — en respectant la cible de support navigateur du projet (`package.json → browserslist`).

## Règles

- Ne jamais éditer sans avoir soumis le plan à validation (action 02 d'abord).
- Conserver la sémantique exacte des règles — `improve` ne change pas le rendu visuel, seulement l'architecture.
- Si un contrat design est présent, tout token extrait en custom property doit être aligné sur la nomenclature du contrat.
- Signaler quand une amélioration change le rendu (ex. retrait d'un `!important` qui masquait un bug latent).
