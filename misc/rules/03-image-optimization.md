# Image optimization — WebP pattern

## Adding a new image

Every new PNG/JPG added to assets/ must have a WebP version alongside it.
Conversion: run `node scripts/convert-webp.mjs` or use sharp directly at quality 90.

## Markup pattern

Always wrap `<img>` in `<picture>` when a WebP version exists:

```html
<picture>
  <source :srcset="imgWebp" type="image/webp" />
  <img :src="imgPng" alt="..." loading="lazy" width="NNN" height="NNN" decoding="async" />
</picture>
```

## Above-fold vs below-fold

| Position | `loading` | `fetchpriority` | `decoding` |
|----------|-----------|-----------------|------------|
| Above-fold (LCP candidate) | `eager` | `high` | `async` |
| Above-fold (not LCP) | `eager` | — | `async` |
| Below-fold | `lazy` | — | `async` |

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

Large above-fold images (hero, ≥800px intrinsic) served to mobile must use `srcset` + `sizes`:

```html
<source
  :srcset="`${img800Webp} 800w, ${img1600Webp} 1600w`"
  sizes="(max-width: 767px) 100vw, 1600px"
  type="image/webp"
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
