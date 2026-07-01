---
name: builder-coverage
description: >-
  Gate de couverture « page-builder » pour un thème bloc WordPress FSE. Prouve —
  par un parcours exhaustif du contenu réel, pas par un mapping mental — que
  CHAQUE composant présent sur les pages dispose d'une block pattern enregistrée,
  donc insérable et éditable dans l'éditeur. C'est la promesse d'un builder
  (Divi/Elementor) portée nativement par FSE : tout élément de page est un bloc
  réutilisable. Deux actions : 01-scan (audit → liste des composants non couverts)
  et 02-close-gaps (créer les patterns manquantes, natives et lint-propres).
  Sibling de design-bridge (qui PRODUIT une pattern depuis le pivot design) :
  builder-coverage VÉRIFIE la complétude et se chaîne après. Invoquer sur un thème
  FSE quand on veut garantir l'édition WYSIWYG de toutes les pages.
triggers:
  - "sc-php:builder-coverage"
  - "vérifier que toutes les pages sont éditables en WYSIWYG / au clic"
  - "chaque élément de page a-t-il une pattern dans l'éditeur ?"
  - après une intégration FSE, pour garantir la couverture builder
---

# sc-php Builder Coverage

Gate de couverture WYSIWYG pour thèmes blocs WordPress FSE.

## Pourquoi

Un site FSE « éditable comme un builder » exige que **chaque composant visible
sur une page ait une pattern éditable dans l'inserteur**. À la main, l'œil en
oublie toujours (clusters de contact, variantes de section, wrappers de grille,
formulaires SSR, boutons). **Ne jamais conclure « complet » sur un raisonnement** :
seul un parcours programmatique du contenu réel le prouve.

## Modèle mental

| | design (`design-bridge`) | builder-coverage |
|---|---|---|
| Rôle | **produire** 1 pattern depuis un spec | **vérifier** que tout est couvert |
| Déclenchement | pivot design (indirect) | direct / standalone / CI |
| Entrée | contrat design | le contenu réel du site |

builder-coverage se chaîne **après** design-bridge : design-bridge rend →
builder-coverage contrôle la complétude. Il reste autonome et lançable seul.

## Actions

| # | Action | Quand |
|---|--------|-------|
| 01 | `01-scan` | Auditer la couverture → liste des composants non couverts |
| 02 | `02-close-gaps` | Créer/étendre les patterns pour amener les gaps à 0 |

## Prérequis

- Thème **bloc** FSE avec des patterns en `patterns/*.php` (auto-enregistrées par en-tête).
- wp-env (ou WP accessible en CLI). **Toujours** `pnpm dlx @wordpress/env run cli wp` —
  jamais `php wp-cli.phar` (cible une autre DB).

## Scripts fournis

- `actions/scripts/builder-coverage.php` — le gate (inventaire + verdict `GAPS: N`).
  Préfixe de classe **auto-détecté** (surchargeable `BC_PREFIX`), post types
  configurables (`BC_POST_TYPES`).
- `actions/scripts/dump-section.php` — extrait le markup natif d'un composant
  (`BC_DUMP_POST`, `BC_DUMP_CLASS`) pour bâtir sa pattern fidèlement.

## Pièges (lire avant d'agir)

- **Cache des patterns du thème** : ajouter un `patterns/*.php` ne le rend pas
  visible tout de suite — `WP_Theme::get_block_patterns()` met la liste en cache,
  invalidée seulement au **bump de `Version:` du thème** (ou `wp_clean_themes_cache()`).
  Toujours bumper la version après ajout de patterns.
- **Échappement `--`** : dans le JSON des commentaires, `--` s'écrit `--`.
  Le script normalise ; sans ça, les variantes `--x` génèrent de faux « non couverts ».
- **Îlot `wp:html` vs natif** : une classe dans un `wp:html` est « couverte » si une
  pattern la contient, **mais son texte n'est pas éditable au clic**. Pour l'édition
  réelle, préférer des blocs natifs. Le CSS étant presque toujours **basé classe**
  (`.x-card` et non `a.x-card`), on peut rendre une carte-lien en `wp:group` éditable
  (texte natif) + un îlot uniquement pour le lien/icône/SVG.
- **SSR** : un bloc dynamique (`sc-*/…`) n'est PAS une pattern éditable — fournir en
  plus une variante native (ex. FAQ SSR → FAQ `wp:details`).

## Gate de sortie

`GAPS: 0` sur `01-scan`, plus les linters DS du projet à 0 erreur
(`patterns-lint`, `ds-lint`, `ds-lint:db`) et `do_blocks` sans fatal.
