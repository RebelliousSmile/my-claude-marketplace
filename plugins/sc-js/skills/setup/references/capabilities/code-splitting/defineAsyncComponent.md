---
paths:
  - "src/**/*.vue"
  - "pages/**/*.vue"
  - "components/**/*.vue"
---

# Code splitting — defineAsyncComponent

## Règle

Les composants non-critiques doivent utiliser `defineAsyncComponent` pour diviser leur JS en un chunk lazy séparé.

"Non-critique" = non visible au premier rendu (below-fold, modales, drawers, dialogs, éditeurs lourds, lecteurs vidéo).

Les composants above-fold restent en imports synchrones.

## Pourquoi

Les imports synchrones forcent tout le JS du composant dans le chunk d'entrée, augmentant le temps de parsing et le TBT.
`defineAsyncComponent` crée un chunk séparé chargé uniquement au montage du composant.

## Pattern

```js
import { defineAsyncComponent } from 'vue'

// ✅ chunk lazy — chargé à la demande
const HeavyEditor = defineAsyncComponent(() => import('./HeavyEditor.vue'))
const SettingsPanel = defineAsyncComponent(() => import('./SettingsPanel.vue'))
const FaqSection = defineAsyncComponent(() => import('./FaqSection.vue'))

// ✅ above-fold — reste synchrone
import HeroSection from './HeroSection.vue'
import NavBar from './NavBar.vue'
```

## Avec états de chargement et d'erreur

```js
const AsyncComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorMessage,
  delay: 200,
  timeout: 5000
})
```

## Vérifier que le split fonctionne

Après `pnpm vite build`, vérifier qu'un chunk `.js` séparé est créé :
```bash
ls -lh dist/assets/*.js | sort -k5 -h
```

Si le composant atterrit toujours dans le chunk d'entrée, chercher un import statique du même fichier ailleurs (voir `dynamic-import.md`).
