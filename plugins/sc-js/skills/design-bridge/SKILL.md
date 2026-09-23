---
name: design-bridge
description: >-
  Realize design enforcement and rendered components as idiomatic JavaScript framework code from a design pivot spec.
author: François-Xavier Guillois
version: 0.15.4
vibe_version: ">=1.0.0"
permissions:
  - bash
  - files
tags:
  - frontend
  - audit
  - javascript
---

Read [host portability](../../references/host-portability.md) before resolving plugin files, invoking sibling skills, or persisting project guidance.

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
| 01 | `realize-lint` | Spec d'enforcement reçu de enforce/04-pivot | Valid class sets + token paths + targets |
| 02 | `render` | Spec de rendu reçu de diffuse/03-pivot | Composant neutre + variantes + stack JS |

## Détection du framework JS

Avant d'agir, identifier le framework du projet pour adapter le rendu de `02-render` :
- `nuxt.config.*` ou `vue` dans `package.json` → Vue 3 / Nuxt
- `react` ou `next` dans `package.json` → React / Next.js
- Aucun → HTML+JS vanilla (fallback sur baseline html-css)

Pour `01-realize-lint`, le framework importe moins : la règle ESLint/Biome s'applique à tous.

## Règle de dérivation stricte

Le linter et le rendu **dérivent du spec reçu** — ils n'inventent pas de règles ni de classes. Toute classe dans un composant rendu doit être dans le spec's valid class sets. Toute règle de lint doit correspondre à un token path ou une classe du spec.

## Obligation de report

Toute règle reçue en `Declared rules` est **rendue au gate**, réalisée ou non. Le rapport s'écrit au `Report path` du spec, au format `plugins/design/references/gate-config-schema.md § Rapport de pivot`.

Une règle que ce réceptacle ne couvre pas s'écrit en `status: "unrealized"`. Ce n'est pas un aveu à minimiser : sans elle, une règle hors de portée et une règle oubliée laissent la même trace — aucune — et le gate ne peut que les confondre.

Le cas fréquent ici : les liaisons dynamiques (`:class`, `class:list`, `x-bind:class`, chaînes calculées). Une règle dont la preuve n'est lisible qu'à l'exécution ne se réalise pas par AST — elle se déclare non réalisée.

## Retour au design

Après exécution, renvoyer au contexte appelant (enforce ou diffuse) :
- `01-realize-lint` : confirmation règle ESLint installée + wiring pre-commit réalisé + rapport écrit, règles réalisées et non réalisées nommées
- `02-render` : fichier(s) composant produit(s) + instructions d'import + confirmation gate enforce exit 0

## Workflow de plateforme (application à composants / SPA)

Ce pivot **possède** le workflow de plateforme SPA : `${SC_JS_PLUGIN_ROOT}/skills/design-bridge/references/workflow-spa.md`. Il instancie les classes de cas agnostiques de `design:detail` sur une application à composants, sous le squelette figé par `sc-pivot-contract.md § Workflow de plateforme`. `design:detail/02-route` l'étend à la classe quand ce pivot est installé et la stack correspond.

## Références

- `plugins/design/references/sc-pivot-contract.md` — format des specs reçus et squelette de workflow de plateforme
- `${SC_JS_PLUGIN_ROOT}/skills/design-bridge/references/workflow-spa.md` — workflow de plateforme SPA (classes de cas instanciées sur application à composants)
- `plugins/design/references/token-schema.md` — structure tokens.json
- `plugins/design/skills/adjust/references/manifest-schema.md` — structure components.json
- Références ESLint/Biome du plugin sc-js (si présentes dans `skills/sniff/references/`)
