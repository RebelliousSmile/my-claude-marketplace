---
name: design-bridge
description: >-
  Réceptacle du pivot design pour JavaScript/TypeScript. Reçoit le spec du contrat de pivot
  (plugins/design/references/sc-pivot-contract.md) émis par design:enforce ou design:diffuse,
  et réalise nativement : (1) enforce → règle ESLint ou script Node.js validant les classes et
  tokens CSS, dérivant strictement du spec + wiring pre-commit ; (2) diffuse → élément neutre
  rendu en composant Vue 3 SFC ou React idiomatique. Jamais invoqué directement — uniquement
  appelé via le pivot de design:enforce/04-pivot ou design:diffuse/03-pivot.
triggers:
  - "sc-js:design-bridge"
  - invoqué par design:enforce quand la stack est JavaScript/TypeScript
  - invoqué par design:diffuse quand la cible est Vue ou React
---

# sc-js:design-bridge

## Rôle

Réceptacle côté JS/TS du pivot technique design. Le **design garde le QUOI** (contrat = tokens + manifeste = autorité) ; **sc-js:design-bridge fait le COMMENT** (réalisation native idiomatique JS/TS).

## Prérequis

Le spec de pivot (enforcement ou rendu) doit être présent en contexte, émis par :
- `design:enforce/04-pivot` → spec d'enforcement
- `design:diffuse/03-pivot` → spec de rendu

Lire `plugins/design/references/sc-pivot-contract.md` pour le format attendu du spec.

## Actions disponibles

| # | Action | Déclencheur | Input |
|---|--------|-------------|-------|
| 01 | `01-realize-lint` | Spec d'enforcement reçu de enforce/04-pivot | Valid class sets + token paths + targets |
| 02 | `02-render` | Spec de rendu reçu de diffuse/03-pivot | Composant neutre + variantes + stack JS |

## Détection du framework JS

Avant d'agir, identifier le framework du projet pour adapter le rendu de `02-render` :
- `nuxt.config.*` ou `vue` dans `package.json` → Vue 3 / Nuxt
- `react` ou `next` dans `package.json` → React / Next.js
- Aucun → HTML+JS vanilla (fallback sur baseline html-css)

Pour `01-realize-lint`, le framework importe moins : la règle ESLint/Biome s'applique à tous.

## Règle de dérivation stricte

Le linter et le rendu **dérivent du spec reçu** — ils n'inventent pas de règles ni de classes. Toute classe dans un composant rendu doit être dans le spec's valid class sets. Toute règle de lint doit correspondre à un token path ou une classe du spec.

## Retour au design

Après exécution, renvoyer au contexte appelant (enforce ou diffuse) :
- `01-realize-lint` : confirmation règle ESLint installée + wiring pre-commit réalisé
- `02-render` : fichier(s) composant produit(s) + instructions d'import + confirmation gate enforce exit 0

## Références

- `plugins/design/references/sc-pivot-contract.md` — format des specs reçus
- `plugins/design/references/token-schema.md` — structure tokens.json
- `plugins/design/skills/adjust/references/manifest-schema.md` — structure components.json
- Références ESLint/Biome du plugin sc-js (si présentes dans `skills/sniff/references/`)
