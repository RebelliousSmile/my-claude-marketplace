---
paths:
  - "**/*.html"
  - "**/*.blade.php"
  - "**/*.twig"
  - "**/*.js"
---

# State management — Alpine.store()

## Store vs x-data : quand choisir ?

| Cas | Recommandation |
|---|---|
| État partagé entre plusieurs composants / pages | `Alpine.store('name', {...})` |
| État local à un composant | `x-data="{ ... }"` |

`Alpine.store()` = global, initialisé une fois. `x-data` = local, par instance.

## Définition du store

Déclarer avant `Alpine.start()` dans le fichier JS principal :

```js
import Alpine from 'alpinejs'

Alpine.store('cart', {
  items: [],

  add(product) {
    this.items.push(product)
  },

  get count() {
    return this.items.length
  },

  get total() {
    return this.items.reduce((sum, item) => sum + item.price, 0)
  }
})

Alpine.start()
```

## Accès depuis un composant

```html
<span x-text="$store.cart.count"></span>
<button @click="$store.cart.add(product)">Ajouter</button>
```

## Convention de nommage

Toujours nommer les clés de store avec un namespace : `'app:cart'`, `'app:user'`, `'ui:sidebar'`.
La clé par défaut `_x_<expr>` d'Alpine entre en collision entre composants — toujours explicite.

## Persistance avec $persist

```js
Alpine.store('preferences', {
  darkMode: Alpine.$persist(false).as('app:preferences:darkMode'),
  language: Alpine.$persist('fr').as('app:preferences:language'),
})
```

- `$persist` synchronise avec localStorage. Risques : quota (5–10 MB silencieux), pas de TTL natif
- Ne jamais persister des données sensibles (tokens, PII) — tout script injecté peut lire localStorage
- Parser une seule fois en mémoire — jamais `JSON.parse(localStorage.getItem(key))` dans chaque update réactif

## Anti-patterns

| Anti-pattern | Raison |
|---|---|
| Clé de store sans namespace | Collisions entre composants |
| Store global pour tout l'état | Défait le tree-shaking ; utiliser `x-data` pour l'état local |
| Tokens en `$persist` | Lisible par XSS — utiliser des cookies httpOnly à la place |
| `JSON.parse(localStorage...)` dans un getter calculé | Coût CPU à chaque update réactif |
