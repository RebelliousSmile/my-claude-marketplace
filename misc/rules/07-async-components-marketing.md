---
paths:
  - "pages/index.vue"
  - "pages/entreprises/index.vue"
  - "pages/*/index.vue"
---

# defineAsyncComponent on marketing pages

- All non-critical components on public marketing pages must use `defineAsyncComponent`
- "Non-critical" = not visible at first paint (below-fold, modals, video, FAQ, blog highlights, testimonials)
- Above-fold components (hero, CTA, BandeauAccroche, ButtonPrimary) stay as synchronous imports
- Pattern already applied on `/` and `/entreprises` — extend to any new marketing page

## Why

Synchronous imports force all component JS into the initial parse budget, increasing main-thread work and TBT. `defineAsyncComponent` splits the chunk even for above-fold components, reducing parse time.

## Pattern

```js
// ✅ non-critical — lazy chunk
const FaqSection = defineAsyncComponent(() => import('~/components/FaqSection.vue'))

// ✅ critical above-fold — synchronous
import HeroSection from '~/components/HeroSection.vue'
```
