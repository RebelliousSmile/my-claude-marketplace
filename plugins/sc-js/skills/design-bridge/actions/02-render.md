# 02-render (sc-js)

## Rôle

Rendre l'élément neutre en composant Vue 3 SFC ou React idiomatique à partir du spec de rendu reçu de `design:diffuse/03-pivot`. Dérive strictement du spec — toutes les classes et tokens utilisés doivent être dans les valid class sets et token paths du spec.

## Input attendu (spec de rendu)

```
## Design render spec
Source: design/tokens.json + design/components.json
Version: <semver>
Component: { name, base, elements, modifiers, backgrounds, a11y }
Variants to produce: [...]
Render target: { language: vue | react, output_dir: ... }
```

## Étape 1 — Détecter le framework cible

| Signal | Rendu |
|--------|-------|
| `render_target.language: vue` ou Nuxt/Vue dans package.json | Vue 3 SFC |
| `render_target.language: react` ou React/Next dans package.json | React fonctionnel + TypeScript |
| Non déterminable | Signaler et demander à l'utilisateur |

## Vue 3 SFC

Structure type pour un composant `card` avec variante `featured` :

```vue
<!-- Card.vue — généré depuis design/components.json v<version> -->
<!-- Ne modifier que les slots de contenu ; les classes sont liées au manifeste -->
<script setup lang="ts">
defineProps<{
  featured?: boolean
  title: string
  imageSrc?: string
  imageAlt?: string
}>()
</script>

<template>
  <article
    class="card"
    :class="{ 'card--featured': featured }"
    role="article"
  >
    <div v-if="imageSrc" class="card__media">
      <img :src="imageSrc" :alt="imageAlt ?? title" />
    </div>
    <div class="card__body">
      <h2 class="card__title">{{ title }}</h2>
      <slot />
    </div>
  </article>
</template>

<style scoped>
/* Tokens uniquement via CSS custom properties — ne pas dupliquer les valeurs */
.card {
  background: var(--color-semantic-surface);
}
</style>
```

Règles :
- Les classes dynamiques (`:class`, `classList`) n'utilisent que des modifiers du spec.
- Les styles scoped utilisent `var(--token-css-property)` — jamais de valeurs en dur.
- Le nom de la custom property correspond au chemin de token aplati : `color.semantic.surface` → `--color-semantic-surface`.

## React fonctionnel + TypeScript

Structure type pour le même `card` :

```tsx
// Card.tsx — généré depuis design/components.json v<version>
import type { FC, ReactNode } from 'react'

interface CardProps {
  featured?: boolean
  title: string
  imageSrc?: string
  imageAlt?: string
  children?: ReactNode
}

export const Card: FC<CardProps> = ({ featured, title, imageSrc, imageAlt, children }) => {
  const classes = ['card', featured && 'card--featured'].filter(Boolean).join(' ')

  return (
    <article className={classes} role="article">
      {imageSrc && (
        <div className="card__media">
          <img src={imageSrc} alt={imageAlt ?? title} />
        </div>
      )}
      <div className="card__body">
        <h2 className="card__title">{title}</h2>
        {children}
      </div>
    </article>
  )
}
```

CSS module associé (`Card.module.css`) :
```css
/* Tokens via CSS custom properties uniquement */
.card { background: var(--color-semantic-surface); }
```

## Étape 2 — Produire toutes les variantes

Pour chaque variante du spec (`variants to produce`) :
- Si "toutes" → générer un composant avec toutes les props/modifiers déclarés dans `.modifiers`.
- Si liste précise → n'inclure que ces variantes.

## Étape 3 — Gate enforce

Extraire le HTML rendu du composant (ou utiliser un template statique représentatif) et linter :

```bash
# Créer un exemple HTML statique pour le gate
node design/lint/lint-core.mjs /tmp/<canonical-name>-example.html
```

L'exemple HTML doit contenir le composant dans toutes ses variantes. Si exit 1 → corriger les classes non conformes.

## Étape 4 — Placer le fichier et documenter l'import

Écrire le fichier dans `output_dir` du spec (ex. `src/components/<CanonicalName>.vue`).

Documenter l'import dans le retour au design :

```
// Vue
import Card from '@/components/Card.vue'

// React
import { Card } from './components/Card'
```

## Sortie attendue

> Composant `<CanonicalName>.<vue|tsx>` produit : `<output_dir>`
> Variantes : <liste>
> Gate enforce : vert (exit 0)
>
> Retour à design:diffuse — rendu JS livré.
