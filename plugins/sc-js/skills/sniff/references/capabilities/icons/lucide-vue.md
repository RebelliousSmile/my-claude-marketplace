---
paths:
  - "**/*.vue"
  - "**/*.ts"
  - "**/*.js"
---

# Icons — lucide-vue-next

## Import pattern

```js
import { Search, Heart, X, User } from 'lucide-vue-next'
```

Importer uniquement ce que le composant utilise — les icônes sont tree-shaken automatiquement.

## Sélecteurs CSS

Lucide rend un `<svg>`, pas un `<i>`. Tout sélecteur CSS ciblant un conteneur d'icône doit inclure `svg` :

```css
/* ✅ inclure les deux */
.my-container i,
.my-container svg {
  transition: transform 0.2s ease;
}
```

## Binding dynamique

Protéger les bindings dynamiques avec `v-if` — Lucide n'a pas de placeholder pour les valeurs vides :

```html
<!-- ✅ -->
<component v-if="iconName" :is="iconName" />

<!-- ❌ rend un élément vide -->
<component :is="iconName" />
```

## Taille

Utiliser la prop `:size="N"` (nombre, en px). Valeur par défaut : 24. Valeurs courantes : 18 (sm), 24 (md), 32 (lg).

## Installation

```bash
pnpm add lucide-vue-next
```
