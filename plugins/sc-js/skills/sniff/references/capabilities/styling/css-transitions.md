---
paths:
  - "**/*.vue"
  - "**/*.css"
  - "**/*.html"
---

# CSS transitions — éviter les no-op

## Règle

- Jamais `transition: all` ni `transition-all` Tailwind
- Toujours restreindre aux propriétés qui changent réellement
- Seuls `transform` et `opacity` sont GPU-composités
- Toute autre propriété déclenche paint ou layout

## Patterns no-op silencieux

- État réactif qui change mais classes CSS statiques → transition ne se déclenche jamais
- `v-if` / `v-else` ou `x-if` détruit le nœud DOM → pas de changement CSS sur le parent → transition ignorée
- Propriété non-animatable ciblée (ex. `display`, `visibility`) → pas d'interpolation

## Exemple

```css
/* ❌ */
transition: all 0.3s ease;

/* ✅ */
transition: border-color 0.3s ease, box-shadow 0.3s ease;
```

```html
<!-- Tailwind -->
<!-- ❌ -->
<div class="transition-all">

<!-- ✅ -->
<div class="transition-[background-color,transform]">
```

## Vérification

- Chrome DevTools > Performance > Rendering > Paint Flashing pour confirmer le retrait
