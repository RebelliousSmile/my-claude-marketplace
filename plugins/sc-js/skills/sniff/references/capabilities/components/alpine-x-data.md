# Alpine.js — patterns composants (x-data, lifecycle, communication)

## `Alpine.data()` — composants réutilisables

Préférer `Alpine.data()` à `x-data` inline dès que la logique dépasse 3 propriétés.

```js
// alpine/components/modal.js
document.addEventListener('alpine:init', () => {
  Alpine.data('modal', (initialOpen = false) => ({
    open: initialOpen,
    toggle() { this.open = !this.open },
    close() { this.open = false },
    init() { this.$watch('open', val => val && this.$nextTick(() => this.$refs.dialog?.focus())) },
  }))
})
```

```html
<div x-data="modal(false)">
  <button @click="toggle">Ouvrir</button>
  <dialog x-ref="dialog" x-show="open" @keydown.escape="close">...</dialog>
</div>
```

## `x-ref` — références DOM

```html
<input x-ref="email" type="email">
<button @click="$refs.email.focus()">Focus</button>
```

Ne pas utiliser `document.querySelector` quand `x-ref` suffit.

## `$dispatch` — communication parent → enfant → parent

```js
// Enfant émet :
this.$dispatch('product-added', { id: this.productId })

// Parent écoute :
// <div @product-added.window="cart.add($event.detail)">
```

Utiliser `.window` pour la communication inter-composants non imbriqués.

## `$watch` — effets réactifs

```js
init() {
  this.$watch('query', val => val.length > 2 && this.search(val))
}
```

Équivalent `watch` de Vue — s'exécute à chaque changement de la propriété observée.

## `$nextTick` — après le rendu DOM

```js
async submitForm() {
  this.submitted = true
  await this.$nextTick()
  this.$refs.successMessage?.scrollIntoView()
}
```

## `x-show` vs `x-if`

| | `x-show` | `x-if` |
|---|---|---|
| DOM | garde l'élément (display:none) | détruit / recrée |
| Coût toggle | faible | élevé |
| Cas d'usage | toggle fréquent | contenu conditionnel lourd |

## `x-cloak` — éviter le flash non stylisé

```html
<style>[x-cloak] { display: none !important; }</style>
<div x-data="app" x-cloak>...</div>
```

Ajouter dans le CSS global et sur tout composant Alpine racine.

## Anti-patterns

- `x-data` inline avec > 5 propriétés et méthodes → extraire dans `Alpine.data()`
- `document.querySelector` dans une méthode Alpine → utiliser `$refs`
- `setTimeout` pour attendre le DOM → utiliser `$nextTick`
- Mutater un store via affectation directe depuis un composant externe → passer par une action du store
- Omettre `x-cloak` sur les composants visibles au-dessus de la fold → flash de contenu non initialisé
- Écouter `@custom-event` sans `.window` quand les composants ne sont pas imbriqués → l'événement ne remonte pas
