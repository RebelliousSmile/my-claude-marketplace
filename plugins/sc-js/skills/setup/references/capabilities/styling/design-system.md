---
paths:
  - "pages/**/*.vue"
  - "components/**/*.vue"
  - "layouts/**/*.vue"
  - "assets/css/*.css"
  - "src/**/*.vue"
  - "src/**/*.css"
---

# Design system — Tailwind + CSS custom properties

> ⚠️ **Template à personnaliser** : noms des tokens (`theme-primary`, `semantic-error`…), familles de polices, border-radius, ombres et palette de couleurs sont spécifiques au projet. Adapter toutes les valeurs concrètes avant usage.

## Couleurs — thème

- Accents : toujours `*-theme-primary`, jamais de hex en dur ni de couleur Tailwind nommée
- Accent secondaire : `*-theme-secondary`
- Fonds légers : `bg-theme-primary/10`, `bg-theme-primary/20`
- Dans les fichiers CSS : utiliser `var(--color-primary)`, `var(--color-primary-rgb)`

## Couleurs — variantes d'opacité (IMPORTANT)

- Tailwind JIT ne génère pas automatiquement les variantes d'opacité pour les tokens CSS custom
- Toutes les variantes (`bg-theme-primary/10`, `bg-theme-primary/90`, etc.) sont définies manuellement dans le CSS global avec `rgba(var(--color-primary-rgb), opacity)`
- Avant d'utiliser une nouvelle variante, vérifier qu'elle existe — sinon l'ajouter
- Les utilitaires gradient `from-theme-*` / `to-theme-*` n'existent pas par défaut — utiliser `bg-theme-*` pour les fonds solides

## Couleurs — sémantique

- Erreur / destructif : `text-semantic-error`, `bg-semantic-error-light`, `border-semantic-error-border`
- Succès : `text-semantic-success`, `bg-semantic-success-light`, `text-semantic-success-text`
- Avertissement : `text-semantic-warning`, `bg-semantic-warning-light`
- Info : `text-semantic-info`, `bg-semantic-info-light`, `border-semantic-info-border`
- Boutons destructifs : toujours `semantic-error`, jamais la couleur thème

## Couleurs — neutres

- Texte principal : `text-gray-900` ou `text-white`
- Texte secondaire : `text-gray-600`, `text-gray-500`
- Fond de page : `bg-gray-50`
- Bordures : `border-gray-200`

## Boutons

- Primary : `bg-theme-primary text-white hover:opacity-90`
- Outline : `border-2 border-theme-primary text-theme-primary bg-white hover:bg-theme-primary hover:text-white`
- Destructif : `bg-semantic-error text-white hover:bg-semantic-error/90`
- Hover lift : `transition-[background-color,color,box-shadow,transform] hover:-translate-y-0.5` (jamais `transition-all`)
- Boutons icône (rond) : `w-10 h-10 rounded-full flex items-center justify-center`

## Cartes et conteneurs

- Shadow : utiliser une classe custom cohérente ou un token shadow (`shadow-elevated`)
- Titres de section : `font-bold text-gray-900` + taille heading selon échelle design

## Formulaires

- Input : `rounded-lg border border-gray-300 px-4 py-2.5 text-sm`
- Focus : `focus:ring-2 focus:ring-theme-primary focus:border-theme-primary outline-none`
- Label : `block text-sm font-medium text-gray-700 mb-1`
- Texte d'aide : `text-xs text-gray-500`
- Erreur de validation : `text-sm text-semantic-error`

## Messages et alertes

- Erreur : `bg-semantic-error-light text-semantic-error-text border border-semantic-error-border rounded-lg p-4`
- Succès : `bg-semantic-success-light text-semantic-success-text border border-semantic-success-border rounded-lg p-4`
- Info : `bg-semantic-info-light text-semantic-info-text border-l-4 border-semantic-info p-4 rounded-r-lg`
- Toast : `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg`
