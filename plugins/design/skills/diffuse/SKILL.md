---
name: diffuse
description: >
  Produit les éléments de design répétables que le LLM réutilise sans refaire la création
  graphique. Définit l'élément en forme NEUTRE (consomme le manifeste, vocabulaire fermé),
  puis rend en HYBRIDE : (1) BASELINE adaptateur interne HTML+CSS (universel, sans pivot) ;
  (2) PIVOT technique vers sc-<techno>:design-bridge quand présent, pour un rendu natif
  idiomatique (block pattern WP via sc-php, composant Vue/React via sc-js).
  Chaque rendu passe sous le gate enforce (lint vert obligatoire avant clôture).
  Absorbe ex-wireframe, ex-component, ex-export-wordpress.
triggers:
  - "diffuse un composant"
  - "génère le rendu du composant"
  - "produis le block pattern"
  - "crée le wireframe"
  - "exporte pour WordPress"
  - "rends le composant en Vue"
  - "produis l'élément répétable"
requires:
  - "design/tokens.json (figé par adjust)"
  - "design/components.json (figé par adjust)"
  - "enforce gate installé (lint-core.mjs opérationnel)"
references:
  - ${CLAUDE_PLUGIN_ROOT}/skills/diffuse/adapters/html-css.md
  - ${CLAUDE_PLUGIN_ROOT}/references/sc-pivot-contract.md
  - ${CLAUDE_PLUGIN_ROOT}/references/wordpress-pitfalls.md
  - ${CLAUDE_PLUGIN_ROOT}/skills/enforce/adapters/lint-core.mjs
---

# diffuse

## Rôle dans l'entonnoir

```
define → destructure → adjust (figé) → enforce (gate) → diffuse (PRODUCTION)
```

`diffuse` est le point de sortie. Il traduit le contrat figé en éléments concrets réutilisables par le LLM à chaque session — sans qu'il ait besoin de recréer la direction visuelle.

## Ce que diffuse produit

| Artefact | Description |
|----------|-------------|
| **Spec neutre** | Représentation canonique de l'élément (composant + variantes + slots + a11y) — stack-agnostique, ne référence que le manifeste |
| **Rendu baseline** | **preview HTML/CSS non intégrée** (aucun pivot) — pas un livrable applicatif, cf. `adapters/html-css.md § Statut de la sortie` |
| **Rendu natif** (avec pivot) | Block pattern WP (sc-php), composant Vue/React (sc-js), ou autre stack via sc-* |

## Invariant critique : gate enforce

**Aucun rendu n'est clôturé si `lint-core.mjs` sort en exit 1.** Si le rendu produit des violations, `02-render` corrige et re-lint avant de livrer. Ce gate est non négociable.

**Lint vert ≠ artefact intégré.** Quand `02-render` retombe sur le rendu baseline (aucun pivot `sc-*:design-bridge` détecté), le fichier produit est une **preview non intégrée** — le lint valide son vocabulaire, il ne prouve jamais qu'elle est branchée dans l'app réelle. Le hand-off vers l'intégration (chemin de promotion + recommandation conditionnelle d'installer `sc-<techno>`) est une obligation de livraison **additionnelle**, émise par `02-render` Étape 5 — jamais un relâchement du gate enforce.

## Architecture hybride

```
diffuse
  ├── 01-define-element → spec neutre (vocabulaire fermé)
  │
  └── 02-render
        ├── Sélectionne l'adaptateur
        │     ├── sc-php présent + cible WP → 03-pivot → sc-php:design-bridge
        │     ├── sc-js présent + cible JS  → 03-pivot → sc-js:design-bridge
        │     └── sinon                     → adapters/html-css.md (baseline)
        │
        └── enforce gate → lint vert obligatoire → livraison
```

## Flux d'exécution

1. **01-define-element** — identifier le composant dans `components.json`, construire la spec neutre (slots, variantes, fond, a11y).
2. **02-render** — sélectionner l'adaptateur selon la stack cible, rendre, lint, corriger si nécessaire.
3. **03-pivot** (si applicable) — émettre le spec de rendu et relayer à `sc-<techno>:design-bridge`.

## Ce que diffuse NE fait PAS

- Diffuse n'invente pas de nouveaux composants (→ `adjust` pour étendre le manifeste).
- Diffuse ne modifie pas le contrat (`tokens.json`, `components.json`).
- Diffuse ne critique pas la direction (→ `destructure`).

## Références

- `${CLAUDE_PLUGIN_ROOT}/skills/diffuse/adapters/html-css.md` — baseline renderer (universel)
- `${CLAUDE_PLUGIN_ROOT}/references/sc-pivot-contract.md` — format du spec de rendu (pivot)
- `${CLAUDE_PLUGIN_ROOT}/references/wordpress-pitfalls.md` — pièges WP (propagation, classes appariées, CLI)
- `${CLAUDE_PLUGIN_ROOT}/skills/enforce/adapters/lint-core.mjs` — gate de lint (exécuté avant toute clôture)
