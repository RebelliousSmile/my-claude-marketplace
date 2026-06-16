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

### Cascade CSS : presets `has-*-font-size` / `has-*-color` et `!important`

WP génère les classes `.has-<slug>-font-size` (depuis `theme.json` → `settings.typography.fontSizes`) **avec `!important`** dans sa feuille consolidée. Un override CSS composant sans `!important` ne gagne jamais la cascade.

Routes (par ordre de préférence) :

1. **Supprimer l'override de markup** — retirer l'attribut du bloc qui génère `.has-*-font-size`. Le CSS composant gouverne seul. Côté `copycat` : `routed_layer: markup`, `action: align`, `action_detail: remove-override`.

2. **Counter avec `!important`** — si le preset doit rester sur d'autres instances du même bloc :
   ```css
   @media (max-width: 767px) { .hero__title { font-size: 1.5rem !important; } }
   ```
   Documenter dans une entrée `ds-deviation-ledger.md`.

3. **Réaligner via `theme.json`** — si le bon token existe déjà, retirer l'attribut et laisser la feuille du thème appliquer le bon slug.

> Si un diff `fontSize` ne se ferme pas malgré un fix CSS : vérifier que le markup ne porte pas une classe `has-*-font-size` concurrente.

## Références

- `plugins/design/references/sc-pivot-contract.md` — format des specs reçus
- `plugins/design/references/wordpress-pitfalls.md` — pièges WP
- `plugins/design/references/token-schema.md` — structure tokens.json
- `plugins/design/skills/adjust/references/manifest-schema.md` — structure components.json
