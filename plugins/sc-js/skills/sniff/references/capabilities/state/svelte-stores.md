---
paths:
  - "src/**/*.svelte"
  - "src/**/*.ts"
  - "src/**/*.js"
---
# Svelte Stores — patterns et bonnes pratiques

## writable

- Pattern de base : `export const count = writable(0)`
- `set(value)` — remplace l'état entier ; préférer quand la nouvelle valeur ne dépend pas de l'ancienne
- `update(fn)` — reçoit la valeur courante et retourne la suivante ; préférer pour les incréments, toggles et toute mutation relative à l'état précédent
- Centraliser les stores dans `src/lib/stores/` et les exporter nommément pour le partage entre composants

```ts
// src/lib/stores/counter.ts
import { writable } from 'svelte/store'

export const count = writable(0)

export function increment() {
  count.update(n => n + 1)
}

export function reset() {
  count.set(0)
}
```

## derived

- Dépendance unique : `derived(store, $val => $val * 2)`
- Dépendances multiples : `derived([a, b], ([$a, $b]) => $a + $b)`
- Valeur asynchrone : troisième argument `set` pour les cas où le calcul est asynchrone ou différé

```ts
import { derived } from 'svelte/store'
import { items } from './items'

// Dépendance unique
export const total = derived(items, $items => $items.reduce((s, i) => s + i.price, 0))

// Dépendances multiples
export const summary = derived([items, total], ([$items, $total]) => ({
  count: $items.length,
  total: $total,
}))

// Asynchrone avec set
export const remoteSummary = derived(items, ($items, set) => {
  fetch(`/api/summary?ids=${$items.map(i => i.id).join(',')}`)
    .then(r => r.json())
    .then(set)
  return () => { /* cleanup si nécessaire */ }
})
```

## readable

- Adapté aux sources externes : WebSocket, timer, geolocation — le consommateur ne doit pas pouvoir modifier la valeur
- Le callback reçoit `set` pour pousser des valeurs ; la fonction qu'il retourne est appelée à l'unsubscribe (cleanup)
- Pattern timer :

```ts
import { readable } from 'svelte/store'

export const time = readable(new Date(), set => {
  const interval = setInterval(() => set(new Date()), 1000)
  return () => clearInterval(interval)
})
```

- Pattern WebSocket :

```ts
export const feed = readable<string[]>([], set => {
  const ws = new WebSocket('wss://example.com/feed')
  const msgs: string[] = []
  ws.onmessage = e => { msgs.push(e.data); set([...msgs]) }
  return () => ws.close()
})
```

## $store auto-subscription

- La syntaxe `$count` est compilée par le compilateur Svelte — disponible **uniquement** dans les fichiers `.svelte`
- Le compilateur insère automatiquement `subscribe` à l'initialisation et `unsubscribe` à la destruction du composant
- Dans un fichier `.ts` ou `.js` ordinaire, utiliser `store.subscribe()` avec cleanup manuel obligatoire

```ts
// Dans un fichier .ts — cleanup manuel
import { myStore } from '$lib/stores/myStore'
import { onDestroy } from 'svelte'

const unsub = myStore.subscribe(val => {
  console.log(val)
})
onDestroy(unsub)
```

```svelte
<!-- Dans un fichier .svelte — auto-subscription -->
<script>
  import { count } from '$lib/stores/counter'
</script>

<p>{$count}</p>
```

## Anti-patterns

| Anti-pattern | Conséquence |
|---|---|
| `store.subscribe()` sans unsubscribe hors composant Svelte | Memory leak — le callback s'accumule à chaque import de module |
| Exposer le `writable` directement quand l'écriture doit être contrôlée | N'importe quel consommateur peut appeler `set()` ou `update()` — encapsuler avec `readable` + fonctions de mise à jour exportées séparément |
| Store utilisé comme cache HTTP sans stratégie d'invalidation | Données périmées silencieuses — ajouter un champ `fetchedAt` et un guard TTL avant tout refetch |
| Nested stores — `writable(writable(...))` | Impossible à souscrire correctement ; utiliser `derived` pour composer deux stores |

## Svelte 5

Pour les projets en cours de migration vers Svelte 5, voir `legacy/references/svelte-migration.md` — les runes (`$state`, `$derived`) remplacent les stores dans les fichiers `.svelte.js` partagés.
