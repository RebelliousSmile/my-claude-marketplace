---
paths:
  - "nuxt.config.ts"
  - "next.config.js"
  - "svelte.config.js"
  - "composables/**/*.ts"
  - "stores/**/*.ts"
---

# Perf pivots — §10 Client-side storage (SSR JS isomorphic)

Storage section pivots applied when the stack is **isomorphic JS SSR** (Nuxt 3, Next.js, SvelteKit, Remix). For pure CSR (Vue SPA, React SPA), see `perf-pivots-vue-spa.md`. For non-JS backend SSR (Django/Laravel/WordPress), most SSR-guard items are N/A — see the relevant `perf-pivots-*.md`.

## Universal rules (all storage APIs)

- **Quota** : `navigator.storage.estimate()` audit ; quota silencieuse possible (5-10 MB localStorage)
- **XSS** : tout contenu sérialisé est lisible par n'importe quel script injecté — jamais de PII sensible (tokens, secrets) en localStorage
- **PII review** : audit obligatoire des stores Pinia/Zustand sérialisés : email, phone, profile, address ?
  - Options : (a) allowlist par store filtrant `$state`, (b) déplacement vers IndexedDB chiffré, (c) suppression + re-fetch au mount, (d) sessionStorage scope-tab si UX accepte

## SSR JS isomorphic (Nuxt 3 / Next.js / SvelteKit / Remix)

- `localStorage` / `sessionStorage` / `indexedDB` **interdits au top-level d'un module** — `window` undefined côté serveur → crash build/render
- Garder dans `onMounted` / `useEffect` / `onMount` ou guard `if (process.client)` / `if (typeof window !== 'undefined')`
- Composables/hooks : exposer une fonction lazy, pas une valeur initiale lue depuis storage
- Pinia/Zustand + persist plugin : config par store, jamais global ; sérialiseur custom si valeurs non-JSON
- Hydratation : si la valeur localStorage diffère du HTML rendu côté serveur → mismatch warning
  - Initialiser à valeur neutre, lire depuis storage post-mount
  - Exception : plugins `.client.*` (skip SSR par contrat Nuxt → règle hydration N/A)

## Firebase Auth (si présent)

- Stocke son token en IndexedDB interne (`firebaseLocalStorageDb`), **PAS** en localStorage
- L'absence de `document.cookie` / `localStorage.token` au grep n'est PAS un faux négatif — c'est le comportement attendu

## PWA / offline-first (transverse)

- Service Worker + Cache API → cache name versionné par déploiement (sinon `pnpm build` n'invalide rien chez les clients)
- IndexedDB pour données persistantes offline
- `navigator.storage.persist()` pour éviter eviction
- Background Sync API pour rejouer les writes offline ; idempotency keys côté backend

## React/Inertia/Livewire (hybride)

- **Inertia** (Laravel) : SPA-like côté client, hydratation Vue/React → traiter comme Vue SPA / React SPA
- **Livewire** : DOM patché par requêtes serveur → storage purement décoratif, jamais source de vérité (sera écrasé au prochain render Livewire)
