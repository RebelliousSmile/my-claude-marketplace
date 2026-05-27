# Image optimization — WebP pattern

## Adding a new image

Every new PNG/JPG added to assets/ must have a WebP version alongside it.
Conversion: run `node scripts/convert-webp.mjs` or use sharp directly at quality 90.

## Markup pattern — above-fold vs below-fold

Chrome's preload scanner fetches `<img src>` before `<picture>` is evaluated. For above-fold images (`fetchpriority="high"`), the fallback JPG/PNG in `<img src>` is requested then aborted (`net::ERR_ABORTED`) → Lighthouse Inspector Issues → Bonnes pratiques penalty.

**Above-fold (LCP candidate, `fetchpriority="high"`)**: use `<img :src="imgWebp">` directly — no `<picture>` wrapper:

```html
<img
  :src="imgWebp"
  alt="..."
  loading="eager"
  fetchpriority="high"
  width="NNN"
  height="NNN"
  decoding="async"
/>
```

**Below-fold (`loading="lazy"`)**: use `<picture>` pattern — preload scanner doesn't aggressively fetch lazy images, no ERR_ABORTED risk:

```html
<picture>
  <source :srcset="imgWebp" type="image/webp" />
  <img :src="imgPng" alt="..." loading="lazy" width="NNN" height="NNN" decoding="async" />
</picture>
```

| Position | Markup | `loading` | `fetchpriority` | `decoding` |
|----------|--------|-----------|-----------------|------------|
| Above-fold (LCP candidate) | `<img src="webp">` | `eager` | `high` | `async` |
| Above-fold (not LCP) | `<img src="webp">` | `eager` | — | `async` |
| Below-fold | `<picture>` | `lazy` | — | `async` |

`fetchpriority="high"` MUST être appliqué sur chaque LCP image preload — à la fois `<img>` et le `<link rel="preload">` correspondant dans `useHead()`. Sans cet attribut, le browser déprioritise l'image derrière fonts/CSS et le LCP régresse silencieusement (10s+ mesuré). Une omission sur une seule page régresse cette page sans signal CI.

## Required attributes

Every `<img>` must have explicit `width` and `height` matching intrinsic image dimensions.
Use `sharp(file).metadata()` to get dimensions if unknown.
These attributes prevent CLS — CSS (`w-full`, `object-cover`) still controls display size.

## WebP conversion

Use sharp via a Node script (not sharp-cli — unreliable on Windows):

```js
import sharp from 'sharp'
await sharp('input.png').webp({ quality: 90 }).toFile('output.webp')
```

sharp is a devDependency. Never import it in app code.

## Responsive images (large above-fold)

Large above-fold images (hero, ≥800px intrinsic) served to mobile must use `srcset` + `sizes` directly on `<img>` (no `<picture>` wrapper — see above-fold rule):

```html
<img
  :src="img1600Webp"
  :srcset="`${img800Webp} 800w, ${img1600Webp} 1600w`"
  sizes="(max-width: 767px) 100vw, 1600px"
  loading="eager"
  fetchpriority="high"
  width="1600"
  height="900"
  decoding="async"
/>
```

The `<link rel="preload">` for responsive images must use `imagesrcset`/`imagesizes`, not `href` alone — otherwise the browser always preloads the largest variant:

```js
useHead({
  link: [{
    rel: 'preload', as: 'image',
    imagesrcset: `${img800Webp} 800w, ${img1600Webp} 1600w`,
    imagesizes: '(max-width: 767px) 100vw, 1600px'
  }]
})
```

## Video poster WebP

`<video poster>` is a plain URL attribute — `<picture>` / `<source>` cannot be used here.
Simply point the poster to a `.webp` file: all modern browsers support WebP in video poster.

```html
<!-- ✅ -->
<video poster="/video-posters/my-poster.webp">

<!-- ❌ impossible — poster is not an img element -->
<picture><source type="image/webp" ...><video poster="..."></picture>
```

## Fonts

Custom fonts needing `<link rel="preload">` must be in `public/fonts/` with a stable filename.
Do not preload from `/_nuxt/` — Vite hashes those paths on every build.
