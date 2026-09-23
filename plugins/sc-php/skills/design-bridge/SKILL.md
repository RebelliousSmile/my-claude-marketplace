---
name: design-bridge
description: >-
  Realize design pivots as native PHP and WordPress FSE code with lint, block patterns, and rendered ownership proof.
author: François-Xavier Guillois
version: 0.12.0
vibe_version: ">=1.0.0"
permissions:
  - bash
  - files
tags:
  - backend
  - php
  - audit
---

Read [host portability](../../references/host-portability.md) before resolving plugin files, invoking sibling skills, or persisting project guidance.

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
| 01 | `realize-lint` | Spec d'enforcement reçu de enforce/04-pivot | Valid class sets + token paths + targets |
| 02 | `render` | Spec de rendu reçu de diffuse/03-pivot | Composant neutre + variantes + stack WP |

## Règle de dérivation stricte

Le linter et le rendu **dérivent du spec reçu** — ils n'inventent pas de règles ni de classes. Toute classe produite par `02-render` doit être dans le spec's valid class sets. Toute règle de lint dans `01-realize-lint` doit correspondre à un token path ou une classe du spec.

## Obligation de report

Toute règle reçue en `Declared rules` est **rendue au gate**, réalisée ou non. Le rapport s'écrit au `Report path` du spec, au format `plugins/design/references/gate-config-schema.md § Rapport de pivot`.

Une règle que ce réceptacle ne couvre pas s'écrit en `status: "unrealized"`. Sans elle, une règle hors de portée et une règle oubliée laissent la même trace — aucune — et le gate ne peut que les confondre.

Le cas fréquent ici : les règles de type `stored-content`. Le vocabulaire vit en base, hors du dépôt ; il n'est lisible qu'après extraction (`references/wordpress-lint-instances.md`). Sans instance extraite, la règle est non réalisée, quel que soit l'état du code.

## Retour au design

Après exécution, renvoyer au contexte appelant (enforce ou diffuse) :
- `01-realize-lint` : confirmation linter installé + wiring pre-commit réalisé + rapport écrit, règles réalisées et non réalisées nommées
- `02-render` : pattern + éventuel `fse-bindings.css` produits, chemins nommés sans chevauchement avec le spec CSS + instructions d'intégration + confirmation gate enforce exit 0
- `02-render` : config de fidélité FSE armé pour la propriété de cascade sur front + éditeur ; toute
  surface non mesurée ou toute déclaration gagnante WordPress maintient `summary.verdict` à `OPEN`

## Pièges WP

Lire `${SC_PHP_PLUGIN_ROOT}/skills/design-bridge/references/wordpress-pitfalls.md` avant toute action WP :
- CLI conteneur obligatoire via le wrapper gardé (`pnpm wp`)
- Classes appariées `has-background` / `has-text-color`
- `wp eval-file` deprecated en PHP 8.2
- Block patterns = copies en DB — réimporter après modification
- Les patterns auto-enregistrées sont des fichiers `patterns/*.php`, jamais `*.html`
- `core/button` et `core/navigation-link` exigent un binding vers leur élément peint interne

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

## Workflow de plateforme (block theme / FSE)

Ce pivot **possède** le workflow de plateforme FSE : `${SC_PHP_PLUGIN_ROOT}/skills/design-bridge/references/workflow-fse.md`. Il instancie les classes de cas agnostiques de `design:detail` sur un thème de blocs, sous le squelette figé par `sc-pivot-contract.md § Workflow de plateforme`. `design:detail/02-route` l'étend à la classe quand ce pivot est installé et la stack correspond.

### Modèle de contenu — hors contrat, dans le workflow

Aucun verbe design ne produit de types de contenu : le contrat porte le vocabulaire visuel, jamais le modèle de données. Sur block theme, la phase `off-funnel` *Établir le modèle de contenu* comble ce trou, avant le rendu natif et avant toute énumération du périmètre de mesure — `${SC_PHP_PLUGIN_ROOT}/skills/design-bridge/references/content-model-fse.md`.

Symptôme quand elle est sautée : `02-render` pose ses patterns dans les templates génériques du scaffold, et le bilan de fidélité rend un vert complet sur un thème qui ne porte aucune vue des types que la référence implique.

## Références

- `plugins/design/references/sc-pivot-contract.md` — format des specs reçus et squelette de workflow de plateforme
- `plugins/design/references/gate-config-schema.md` — format du rapport à écrire
- `${SC_PHP_PLUGIN_ROOT}/skills/design-bridge/references/workflow-fse.md` — workflow de plateforme FSE (classes de cas instanciées sur block theme)
- `${SC_PHP_PLUGIN_ROOT}/skills/design-bridge/references/content-model-fse.md` — dérivation du modèle de contenu depuis la référence (phase `off-funnel`)
- `${SC_PHP_PLUGIN_ROOT}/skills/design-bridge/references/wordpress-pitfalls.md` — pièges WP
- `${SC_PHP_PLUGIN_ROOT}/skills/design-bridge/references/wordpress-lint-instances.md` — réalisation des règles `stored-content` (extraction du contenu en base)
- `plugins/design/references/token-schema.md` — structure tokens.json
- `plugins/design/skills/adjust/references/manifest-schema.md` — structure components.json
