---
name: design-bridge
description: >-
  Réceptacle du pivot design pour PHP/WordPress. Reçoit le spec du contrat de pivot
  (plugins/design/references/sc-pivot-contract.md) émis par design:enforce ou design:diffuse,
  et réalise nativement : (1) enforce → linter PHP/WP idiomatique (PHPCS ruleset ou script PHP
  + wiring pre-commit) dérivant strictement du spec ; (2) diffuse → élément neutre rendu en
  block pattern WordPress FSE + theme.json. Jamais invoqué directement — uniquement appelé
  via le pivot de design:enforce/04-pivot ou design:diffuse/03-pivot.
triggers:
  - "sc-php:design-bridge"
  - invoqué par design:enforce quand la stack est PHP/WordPress
  - invoqué par design:diffuse quand la cible est block pattern WP
---

# sc-php:design-bridge

## Rôle

Réceptacle côté PHP/WP du pivot technique design. Le **design garde le QUOI** (contrat = tokens + manifeste = autorité) ; **sc-php:design-bridge fait le COMMENT** (réalisation native idiomatique PHP/WP).

## Prérequis

Le spec de pivot (enforcement ou rendu) doit être présent en contexte, émis par :
- `design:enforce/04-pivot` → spec d'enforcement
- `design:diffuse/03-pivot` → spec de rendu

Lire `plugins/design/references/sc-pivot-contract.md` pour le format attendu du spec.

## Actions disponibles

| # | Action | Déclencheur | Input |
|---|--------|-------------|-------|
| 01 | `01-realize-lint` | Spec d'enforcement reçu de enforce/04-pivot | Valid class sets + token paths + targets |
| 02 | `02-render` | Spec de rendu reçu de diffuse/03-pivot | Composant neutre + variantes + stack WP |

## Règle de dérivation stricte

Le linter et le rendu **dérivent du spec reçu** — ils n'inventent pas de règles ni de classes. Toute classe produite par `02-render` doit être dans le spec's valid class sets. Toute règle de lint dans `01-realize-lint` doit correspondre à un token path ou une classe du spec.

## Retour au design

Après exécution, renvoyer au contexte appelant (enforce ou diffuse) :
- `01-realize-lint` : confirmation linter installé + wiring pre-commit réalisé
- `02-render` : fichier(s) produit(s) + instructions d'intégration + confirmation gate enforce exit 0

## Pièges WP

Lire `plugins/design/references/wordpress-pitfalls.md` avant toute action WP :
- CLI conteneur obligatoire (`pnpm dlx @wordpress/env run cli wp`)
- Classes appariées `has-background` / `has-text-color`
- `wp eval-file` deprecated en PHP 8.2
- Block patterns = copies en DB — réimporter après modification

## Références

- `plugins/design/references/sc-pivot-contract.md` — format des specs reçus
- `plugins/design/references/wordpress-pitfalls.md` — pièges WP
- `plugins/design/references/token-schema.md` — structure tokens.json
- `plugins/design/skills/adjust/references/manifest-schema.md` — structure components.json
