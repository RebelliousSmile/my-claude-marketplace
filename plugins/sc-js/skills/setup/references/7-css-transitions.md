---
paths:
  - "**/*.vue"
  - "**/*.css"
---

# CSS transitions — éviter les no-op

## Règle

- Jamais `transition: all` ni `transition-all` Tailwind
- Toujours restreindre aux propriétés qui changent réellement
- Seuls `transform` et `opacity` sont GPU-composités
- Toute autre propriété déclenche paint ou layout

## Patterns no-op silencieux

- Données Vue réactives changent mais classes CSS statiques → transition ne se déclenche jamais
- `v-if` / `v-else` détruit le DOM node → pas de changement CSS sur le parent → transition ignorée

## Exemple

```css
/* ❌ */
transition: all 0.3s ease;

/* ✅ */
transition: border-color 0.3s ease, box-shadow 0.3s ease;
/* Tailwind: */
transition-[background-color,transform]
```

## Vérification

- Chrome DevTools > Performance > Rendering > Paint Flashing pour confirmer le retrait
