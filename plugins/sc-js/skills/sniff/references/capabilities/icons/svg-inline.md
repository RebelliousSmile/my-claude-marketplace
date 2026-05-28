---
paths:
  - "**/*.html"
  - "**/*.blade.php"
  - "**/*.twig"
  - "**/*.js"
  - "**/*.ts"
---

# Icons — SVG inline / Iconify (Alpine & Vanilla)

## Trois approches selon le contexte

| Approche | Quand l'utiliser | Avantage |
|---|---|---|
| `<iconify-icon>` web component | Alpine, Vanilla — chargement à la demande | Aucun bundler requis |
| SVG sprite | Icônes répétées sur la même page | Un seul fetch, pas de repeat inline |
| SVG inline direct | 1-2 icônes critiques above-fold | Zéro requête réseau |

## Iconify (recommandé pour Alpine/Vanilla)

```html
<!-- 1. Charger le web component (une seule fois dans le layout) -->
<script src="https://cdn.jsdelivr.net/npm/iconify-icon@2/dist/iconify-icon.min.js"></script>

<!-- 2. Utiliser n'importe quelle icône de n'importe quel pack -->
<iconify-icon icon="lucide:search" width="24"></iconify-icon>
<iconify-icon icon="heroicons:heart" width="24"></iconify-icon>
<iconify-icon icon="tabler:x" width="20"></iconify-icon>
```

- Chargement lazy par défaut : l'icône n'est requise que quand l'élément est dans le DOM
- Compatible avec les bindings Alpine : `<iconify-icon :icon="$store.ui.currentIcon">`
- Packs disponibles : `lucide:`, `heroicons:`, `tabler:`, `mdi:`, `ph:` (Phosphor), etc.

## SVG sprite (icônes répétées)

```html
<!-- Dans le layout, hidden sprite sheet -->
<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
  <symbol id="icon-search" viewBox="0 0 24 24">
    <!-- path SVG -->
  </symbol>
  <symbol id="icon-heart" viewBox="0 0 24 24">
    <!-- path SVG -->
  </symbol>
</svg>

<!-- Usage (référence légère, pas de SVG inline répété) -->
<svg width="24" height="24" aria-hidden="true"><use href="#icon-search"/></svg>
```

## SVG inline direct (above-fold critique)

```html
<!-- ✅ icône critique — zéro requête réseau -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
        stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>
```

## Sélecteurs CSS

Les SVG n'héritent pas de `color` sur tous les navigateurs sans `fill="currentColor"` ou `stroke="currentColor"`. Toujours utiliser `currentColor` pour que les icônes respectent la couleur du texte parent.

## Anti-patterns

| Anti-pattern | Raison |
|---|---|
| Importer toute une bibliothèque d'icônes en bundle | Gonfle le JS pour des centaines d'icônes inutilisées |
| SVG inline répété pour des icônes courantes | DOM inutilement lourd — utiliser sprite ou web component |
| PNG/JPG pour des icônes | Pas de mise à l'échelle propre, pas de `currentColor` |
