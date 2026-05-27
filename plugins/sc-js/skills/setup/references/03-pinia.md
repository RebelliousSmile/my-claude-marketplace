# Pinia — patterns Vue 3 / Nuxt 3

## Store vs composable : quand choisir ?

| Cas | Recommandation |
|---|---|
| État partagé entre composants non-parents | Pinia store |
| Cache de données serveur avec TTL | Pinia store avec `fetchedAt` + guard TTL |
| État local à un arbre de composants | Composable avec `provide`/`inject` |
| État UI éphémère (modal, tooltip) | Ref locale, jamais store |

## Convention de nommage

- `useXxxStore()` — préfixe `use`, suffixe `Store`
- Un store par domaine fonctionnel — jamais un store global fourre-tout
- Fichier : `stores/xxx.ts`

## Setup store (syntaxe préférée)

```ts
export const useCandidateStore = defineStore('candidate', () => {
  const profile = ref<CandidateProfile | null>(null)
  const fetchedAt = ref<number | null>(null)
  const TTL_MS = 5 * 60 * 1000

  async function fetchProfile(uid: string) {
    if (profile.value && fetchedAt.value && Date.now() - fetchedAt.value < TTL_MS) return
    profile.value = await getCandidateProfile(uid)
    fetchedAt.value = Date.now()
  }

  function $reset() { profile.value = null; fetchedAt.value = null }

  return { profile, fetchProfile, $reset }
})
```

## `storeToRefs()` — réactivité

```ts
const store = useCandidateStore()
const { profile } = storeToRefs(store)  // ✅ réactif
const { fetchProfile } = store           // ✅ méthodes : pas de toRefs
// const { profile } = store             // ❌ perd la réactivité
```

## SSR / Nuxt

- Jamais `useXxxStore()` au top-level d'un fichier `.ts` (Pinia non initialisée côté serveur → crash)
- Appeler uniquement dans `setup()` ou `<script setup>`, ou guard par `process.client`
- Éviter les valeurs non-sérialisables dans le state (fonctions, instances de classe) — Nuxt sérialise le state dans `__NUXT_DATA__`

## Persistance (pinia-plugin-persistedstate)

- Réserver à l'état client-only (préférences UI)
- `persist: { storage: localStorage }` → composant wrappé dans `<ClientOnly>` ou guard `process.client`
- Jamais persister tokens ou données sensibles en localStorage

## Anti-patterns

| Anti-pattern | Raison |
|---|---|
| `useXxxStore()` au top-level d'un module `.ts` | Crash SSR — Pinia non initialisée |
| Store global avec 50+ propriétés | Pas de code-split → bundle non-lazy |
| `watch(store.someRef, ...)` sans `storeToRefs` | Watch silencieusement mort |
| `localStorage` brut pour persister du state | Pas de TTL, pas SSR-safe |
