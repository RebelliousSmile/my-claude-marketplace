---
paths:
  - "composables/**/*.ts"
  - "stores/**/*.ts"
  - "plugins/**/*.ts"
  - "nuxt.config.ts"
---

# SSR — guards storage isomorphique

Applicable aux stacks **JS SSR isomorphique** : Nuxt 3, Next.js, SvelteKit, Remix.
Pour CSR pur (Vue SPA, React SPA), ces guards sont N/A.

## Règle universelle (toutes APIs storage)

- **Quota** : `navigator.storage.estimate()` ; quota silencieuse possible (5-10 MB localStorage)
- **XSS** : tout contenu sérialisé est lisible par n'importe quel script injecté — jamais de PII sensible (tokens, secrets) en localStorage
- **Audit PII** : vérifier les stores Pinia/Zustand sérialisés : email, téléphone, profil, adresse ?
  - Options : (a) allowlist filtrant `$state`, (b) IndexedDB chiffré, (c) suppression + re-fetch au mount, (d) sessionStorage si l'UX accepte

## Guards SSR JS isomorphique

- `localStorage` / `sessionStorage` / `indexedDB` **interdits au top-level d'un module** — `window` est undefined côté serveur → crash build/render
- Placer dans `onMounted` / `useEffect` / `onMount` ou derrière un guard `if (process.client)` / `if (typeof window !== 'undefined')`
- Composables : exposer une fonction lazy, pas une valeur initiale lue depuis le storage
- Pinia + persist plugin : config par store, jamais global ; sérialiseur custom si valeurs non-JSON

## Hydratation

Si la valeur localStorage diffère du HTML rendu côté serveur → warning mismatch :
- Initialiser à valeur neutre, lire depuis le storage post-mount
- Exception : plugins `.client.*` (skip SSR par contrat Nuxt → règle hydratation N/A)

## Firebase Auth

Stocke son token en IndexedDB interne (`firebaseLocalStorageDb`), **PAS** en localStorage.
L'absence de `document.cookie` / `localStorage.token` au grep n'est PAS un faux négatif — c'est le comportement attendu.

## PWA / offline-first

- Service Worker + Cache API → cache name versionné par déploiement (sinon build n'invalide rien chez les clients)
- IndexedDB pour données persistantes offline
- `navigator.storage.persist()` pour éviter l'éviction
- Background Sync API pour rejouer les writes offline ; idempotency keys côté backend
