---
name: design-bridge
description: >-
  Réceptacle du pivot design pour la couche CSS pure. Reçoit le contrat design
  (tokens.json + components.json) émis par design:enforce ou design:diffuse, et produit :
  (1) un fichier de custom properties CSS (tokens → :root) ; (2) des stylesheets de
  composants BEM (components.json → .block, .block__element, .block--modifier) avec
  cascade layers. Jamais invoqué directement — appelé via le pivot design:enforce/04-pivot
  ou design:diffuse/03-pivot quand la stack est CSS pure.
triggers:
  - "sc-css:design-bridge"
  - invoqué par design:enforce quand la stack est CSS pure (pas de sc-php/sc-js)
  - invoqué par design:diffuse quand la cible est CSS standalone
---

# sc-css:design-bridge

## Rôle

Réceptacle côté CSS du pivot design. **design garde le QUOI** (contrat = tokens + manifeste) ; **sc-css:design-bridge fait le COMMENT** (custom properties + stylesheets BEM + layers).

## Prérequis

Le spec de pivot doit être présent en contexte, émis par :
- `design:enforce/04-pivot` → spec d'enforcement (quelles classes doivent exister, quels tokens référencés)
- `design:diffuse/03-pivot` → spec de rendu (composant neutre + variantes)

Lire `plugins/design/references/sc-pivot-contract.md` pour le format attendu.

## Actions disponibles

| # | Action | Déclencheur | Output |
|---|--------|-------------|--------|
| 01 | `realize-tokens` | spec reçu de enforce ou diffuse, `tokens.json` présent | `design/css/tokens.css` (`:root { --token-path: value; }`) |
| 02 | `realize-components` | spec reçu, `components.json` présent | `design/css/<component>.css` par composant |

## Règle de dérivation stricte

Les fichiers produits **dérivent du contrat** — ils n'inventent pas de règles ni de sélecteurs.

- `realize-tokens` : chaque custom property correspond à un token dans `tokens.json`. Nommage : chemin de token en kebab-case (`color.brand.primary` → `--color-brand-primary`).
- `realize-components` : chaque sélecteur correspond à un `.base`, `.elements.*`, ou `.modifiers.*` du manifeste. Aucune classe inventée.

## Format produit

### `realize-tokens` → `design/css/tokens.css`

```css
/* Généré par sc-css:design-bridge depuis design/tokens.json — ne pas éditer manuellement */
@layer design.tokens {
  :root {
    /* color.brand */
    --color-brand-primary: #1a56db;
    --color-brand-secondary: #0e9f6e;

    /* font.size */
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;

    /* space */
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    /* … */
  }
}
```

### `realize-components` → `design/css/<component>.css`

```css
/* Généré par sc-css:design-bridge depuis design/components.json — ne pas éditer manuellement */
@layer design.components {
  .hero {
    background-color: var(--color-semantic-background);
    padding-block: var(--space-16);
  }

  .hero__eyebrow {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-brand-primary);
    letter-spacing: 0.12em;
  }

  .hero__headline {
    font-size: var(--font-size-display);
    line-height: var(--line-height-tight);
  }

  .hero--dark {
    background-color: var(--color-neutral-900);
    color: var(--color-neutral-0);
  }
}
```

## Cascade layers déclarées

Le fichier d'entrée CSS du projet doit déclarer l'ordre des layers :
```css
@layer design.tokens, design.components, project.overrides;
```
sc-css:design-bridge signale si ce fichier n'existe pas et propose sa création.

## Références

- `plugins/design/references/sc-pivot-contract.md` — format des specs reçus
- `plugins/design/references/token-schema.md` — structure tokens.json
- `plugins/design/skills/adjust/references/manifest-schema.md` — structure components.json
