---
name: wp-blocks
description: >-
  Validate Gutenberg block markup through a Playwright editor round trip and report structural validity failures.
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

# sc-js:wp-blocks

## Rôle

Vérifier qu'un markup de bloc Gutenberg **généré par du code** (pas par
l'éditeur) est **éditable**, pas seulement affichable. Le seul juge fiable de la
validité d'un bloc est l'éditeur lui-même : la skill l'instrumente via Playwright.

## Le round-trip (pourquoi c'est le seul vrai test)

Un bloc est stocké dans `post_content` sous forme de HTML encadré de
commentaires, p. ex. :

```html
<!-- wp:heading {"level":2,"fontSize":"xl"} -->
<h2 class="wp-block-heading has-xl-font-size">Titre</h2>
<!-- /wp:heading -->
```

Chaque type de bloc a une fonction `save()` **en JS** qui définit le HTML exact
attendu pour des attributs donnés. À l'ouverture dans l'éditeur, Gutenberg :

1. **parse** le markup stocké → en extrait les attributs ;
2. **régénère** le HTML via `save()` avec ces attributs ;
3. **compare** régénéré ↔ stocké.

Identiques → bloc **valide** (`isValid: true`). La moindre différence (une
classe en trop/manquante, un ordre de classes, un attribut, un espace) → bloc
**invalide**, marqué cassé dans l'éditeur avec « Tenter une récupération ». Le
frontend, lui, ne valide rien : la page **s'affiche** correctement, ce qui masque
le problème jusqu'à ce qu'un humain ouvre l'éditeur.

## Quand l'utiliser

- Thème FSE / patterns / `post_content` **générés par des scripts** (import,
  builders PHP qui concatènent des chaînes `<!-- wp:… -->`).
- Après toute modification d'un pattern ou d'un générateur de markup.
- En complément — **pas en remplacement** — d'un linter de design system
  (vocabulaire/tokens) et d'un diff de fidélité texte/visuel.

## Périmètre de validation (ce que le round-trip juge vraiment)

| Type de bloc | Validé ? | Raison |
|---|---|---|
| Blocs natifs statiques (`core/heading`, `core/paragraph`, `core/list`, `core/group`, `core/buttons`, `core/columns`…) | ✅ oui | ont un `save()` → comparaison stricte |
| Blocs dynamiques / SSR (`save` renvoie `null`, rendu PHP) | ➖ toujours « valide » | pas de `save()` à comparer — seul leur wrapper est vérifié |
| `core/html` (bloc « HTML personnalisé ») | ➖ freeform | jamais validé |
| Bloc **non enregistré** dans l'éditeur | ⚠️ `core/missing` | l'éditeur ne sait pas le gérer → signal réel (plugin non chargé / nom erroné) |

→ Le risque porte sur les **blocs natifs statiques** générés à la main. C'est
exactement ce que la skill cible.

## Prérequis

- Une instance WordPress **locale en marche** (wp-env, Local, Docker…) avec
  l'éditeur accessible.
- `playwright` disponible (le projet l'a déjà, ou `pnpm dlx playwright`).
- Identifiants admin (wp-env par défaut : `admin` / `password`).
- Les plugins fournissant les blocs custom doivent être **actifs** (sinon ils
  ressortent en `core/missing`, ce qui est un vrai signal mais à distinguer).

## Actions disponibles

| # | Action | Déclencheur | Sortie |
|---|--------|-------------|--------|
| 01 | `validate-roundtrip` | « valide les blocs gutenberg » / après édition d'un pattern | Script Playwright + rapport des blocs invalides (page · type · extrait), exit 1 si ≥ 1 invalide |

## Intégration

- Gate dédié (`pnpm qa:blocks`) **distinct** du lint design system : ils testent
  des choses orthogonales (vocabulaire ≠ validité d'édition).
- Lancer après l'import / la régénération des patterns, et avant livraison.

## Références

- WP Block API — `save`, validation : https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/
- `wp.data.select('core/block-editor').getBlocks()` → arbre de blocs avec `isValid`.
