---
name: legacy
model: sonnet
description: >-
  Migration CSS legacy vers standards modernes : float/clearfix → flex/grid,
  px → rem/em, préfixes vendor (-webkit-/-moz-) → standard, variables SCSS/Less ($var/@var)
  → custom properties CSS natives, hack IE/Edge classiques → standards. Propose un plan
  de migration par fichier, n'édite qu'après validation.
---

# sc-css:legacy

Migration CSS legacy — détecte les patterns obsolètes, propose un plan, migre.

## Actions disponibles

| # | Action | Rôle | Input |
|---|--------|------|-------|
| 01 | `scan` | Identifier tous les patterns legacy dans les fichiers CSS | chemins CSS du projet |
| 02 | `migrate` | Proposer plan de migration → valider → exécuter | output de scan |

## Patterns couverts

| Pattern | Migration | Effort |
|---------|-----------|--------|
| `float: left/right` + clearfix | → `display: flex/grid` sur le conteneur | M |
| `position: absolute` pour layout | → flex/grid selon le contexte | L |
| Valeurs `px` pour typo et spacing | → `rem` (typo) / `em` ou `rem` (spacing) | S |
| `-webkit-`, `-moz-`, `-ms-` vendor prefixes | → propriété standard (post-2020 baseline) | XS |
| Variables Sass `$var` / Less `@var` | → `var(--css-custom-property)` | M |
| `@import` Sass/Less pour chaque composant | → `@layer` ou bundler import | M |
| Hacks IE : `*property`, `_property`, `filter:` | → supprimer + tester | S |
| `calc()` avec unités mixtes redondantes | → simplifier ou custom property | XS |

## Règles

- Scanner avant de proposer — ne jamais migrer à l'aveugle.
- Pour `px` → `rem` : utiliser `1rem = 16px` (base navigateur) sauf si `font-size` root est surchargé (le signaler).
- Pour variables preprocesseur → custom properties : si un contrat design (`design/tokens.json`) est présent, nommer les custom properties en alignement avec le contrat.
- Ne pas migrer les `px` dans les `@media` queries (breakpoints en `px` = intentionnel pour la précision viewport).
- Signaler quand un pattern legacy résout un bug réel connu — ne pas retirer sans alternative.
