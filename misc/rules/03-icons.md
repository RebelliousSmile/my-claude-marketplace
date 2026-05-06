# Icons — lucide-vue-next pattern

## Library

Use `lucide-vue-next` for all new icons on marketing and candidate-facing pages.
Do NOT add new `<i class="bx-*">` or `<box-icon>` elements outside admin pages.

## Import pattern

```js
import { Search, Heart, X, User } from 'lucide-vue-next'
```

Import only what the component uses — icons are tree-shaken automatically.

## Dual system warning

This codebase has TWO boxicons systems that coexist:
- `bx-*` CSS classes on `<i>` elements (render-blocking, being phased out)
- `<box-icon>` web components (dynamically loaded, still used in admin pages)

When auditing for icon migration, search for **both** independently:
- `grep "bx-"` for CSS-class usage
- `grep "box-icon"` for web component usage

## CSS selector rule

Lucide renders `<svg>`, not `<i>`. Any CSS selector animating an icon container must include `svg`:

```css
/* Always include both */
.my-container i,
.my-container svg {
  transition: transform 0.2s ease;
}
```

## Dynamic icon binding

Guard dynamic icon bindings with `v-if` — Lucide has no placeholder for empty values:

```html
<!-- ✅ -->
<i v-if="step.icon" :class="step.icon" />

<!-- ❌ renders empty element -->
<i :class="step.icon" />
```

## Size

Use `:size="N"` prop (number, in px). Default is 24. Common values: 18 (sm), 24 (md), 32 (lg).
