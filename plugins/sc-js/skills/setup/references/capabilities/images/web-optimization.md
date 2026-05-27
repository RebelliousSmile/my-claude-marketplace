---
paths:
  - "**/*.vue"
  - "**/*.html"
  - "**/*.blade.php"
  - "assets/**"
  - "public/**"
---

# Images — optimisation web (WebP, LCP, CLS)

## Conversion WebP

Chaque PNG/JPG ajouté dans assets/ doit avoir sa version WebP. Conversion via sharp (jamais sharp-cli — peu fiable sur Windows) :

```js
import sharp from 'sharp'
await sharp('input.png').webp({ quality: 90 }).toFile('output.webp')
```

sharp est une devDependency. Ne jamais l'importer dans le code app.

## Markup — above-fold vs below-fold

Le preload scanner Chrome fetch `<img src>` avant d'évaluer `<picture>`. Pour les images above-fold, le fallback PNG dans `<img src>` est requêté puis annulé (`net::ERR_ABORTED`) → pénalité Lighthouse Bonnes pratiques.

**Above-fold (candidat LCP, `fetchpriority="high"`)** : `<img>` direct, pas de `<picture>` :

```html
<img
  src="image.webp"
  alt="..."
  loading="eager"
  fetchpriority="high"
  width="NNN"
  height="NNN"
  decoding="async"
/>
```

**Below-fold (`loading="lazy"`)** : `<picture>` sans risque ERR_ABORTED :

```html
<picture>
  <source srcset="image.webp" type="image/webp" />
  <img src="image.png" alt="..." loading="lazy" width="NNN" height="NNN" decoding="async" />
</picture>
```

| Position | Markup | `loading` | `fetchpriority` | `decoding` |
|---|---|---|---|---|
| Above-fold (LCP) | `<img src="webp">` | `eager` | `high` | `async` |
| Above-fold (non-LCP) | `<img src="webp">` | `eager` | — | `async` |
| Below-fold | `<picture>` | `lazy` | — | `async` |

## Attributs obligatoires

Tout `<img>` doit avoir `width` et `height` explicites correspondant aux dimensions intrinsèques. Utiliser `sharp(file).metadata()` pour obtenir les dimensions. Ces attributs préviennent le CLS — le CSS (`w-full`, `object-cover`) contrôle toujours la taille d'affichage.

## Images responsives (above-fold large, ≥800px)

```html
<img
  src="img-1600.webp"
  srcset="img-800.webp 800w, img-1600.webp 1600w"
  sizes="(max-width: 767px) 100vw, 1600px"
  loading="eager"
  fetchpriority="high"
  width="1600"
  height="900"
  decoding="async"
/>
```

**Nuxt — preload responsive** : utiliser `imagesrcset`/`imagesizes`, pas `href` seul (sinon le browser précharge toujours la plus grande variante) :

```js
useHead({
  link: [{
    rel: 'preload', as: 'image',
    imagesrcset: `img-800.webp 800w, img-1600.webp 1600w`,
    imagesizes: '(max-width: 767px) 100vw, 1600px'
  }]
})
```

## Poster vidéo

`<video poster>` est un attribut URL simple — `<picture>` / `<source>` ne peuvent pas être utilisés ici. Pointer directement vers un `.webp` :

```html
<!-- ✅ -->
<video poster="/video-posters/my-poster.webp">
```

## Polices (Nuxt)

Les polices nécessitant `<link rel="preload">` doivent être dans `public/fonts/` avec un nom de fichier stable. Ne pas preloader depuis `/_nuxt/` — Vite hashe ces chemins à chaque build.
