---
paths:
  - "astro.config.mjs"
  - "astro.config.ts"
  - ".eleventy.js"
  - "**/*.astro"
---

# Perf pivots — Static HTML / Astro / 11ty

Stack-specific overrides for static site generators with minimal hydration. Loaded by `web-optimize`.

## §0 — Pre-flight

- Build Astro : `pnpm astro build 2>&1 | tee build.log`
- Build 11ty : `npx @11ty/eleventy 2>&1 | tee build.log`
- **Warnings load-bearing Astro** :
  - `[warn] CSS bundle exceeds...` = CSS non-purgé ou trop de styles globaux
  - `[warn] ... has a circular dependency` = risque de chunk entry gonflé
  - `[warn] Missing image dimensions` = CLS potentiel
- PSI : variance ±10 sur SSG hébergé sur CDN ; 5 runs, médiane comme référence

## §1 — Render-blocking

- Critical CSS inline natif (Astro `<style>` scoped, 11ty PostCSS critical)
- Pas de framework JS au top-level — chaque `<script>` doit être justifié
- Fonts : `<link rel="preload" as="font" href="/fonts/inter.woff2" crossorigin>` dans le `<head>` du layout principal
- Scripts tiers : charger en `defer` ou via `type="module"` uniquement

## §2 — LCP

- Astro : `<Image src={import('./hero.webp')} fetchpriority="high" loading="eager" alt="hero">` (composant `@astrojs/image`)
- 11ty : `<img src="/images/hero.webp" fetchpriority="high" loading="eager" width="1440" height="800">`
- `<picture>` : autorisé above-fold uniquement si `fetchpriority="high"` est sur le `<img>` interne (pas sur `<source>`) — sinon ERR_ABORTED Chrome
- `<link rel="preload" as="image" imagesrcset="hero_480.webp 480w, hero_1024.webp 1024w" imagesizes="(max-width: 640px) 480px, 1024px">` dans `<head>`
- Responsive : `srcset`/`sizes` directement sur `<img>` ou via le composant `<Image>` Astro

## §3 — CLS

- Astro `<Image>` : injecte automatiquement `width`/`height` si les dimensions sont connues au build — préférer `<Image>` à `<img>` brut
- 11ty : `width`/`height` obligatoires sur tout `<img>` dans les templates Nunjucks/Liquid/HTML
- FOUT : `font-display: swap` dans `<style>` du layout ou dans un fichier CSS global

## §4 — Bundle

- **Astro Islands** → seules les iles JS hydratées comptent ; auditer chaque `client:*` directive :
  - `client:load` — JS exécuté au mount (lourd)
  - `client:idle` — JS exécuté pendant requestIdleCallback (mieux)
  - `client:visible` — JS exécuté quand l'île entre dans le viewport (le mieux pour below-fold)
- Préférer `client:visible` partout où possible
- Vérifier le JS bundle total : `ls -lh dist/_astro/*.js | sort -k5 -h` — chaque Island doit être < 50 KB gzip

## §5 — CSS

- Astro : Tailwind purgé automatiquement si `@astrojs/tailwind` est configuré ; vérifier `pnpm astro build && ls -lh dist/_astro/*.css`
- 11ty : Tailwind `content: ['**/*.{html,njk,liquid,md}']` dans `tailwind.config.js`
- `transition: all` interdit → `transition: transform, opacity`
- Détecter : `grep -rn "transition.*all" src/`

## §6 — Caching

- Pages HTML statiques `.html` : `Cache-Control: public, max-age=0, stale-while-revalidate=60` (Netlify/Vercel appliquent ça nativement à chaque déploiement)
- Assets hashés Astro `dist/_astro/*` : `Cache-Control: public, max-age=31536000, immutable`
- CDN + immutable cache **obligatoire** sur les assets
- `s-maxage=3600` possible si les pages ne changent pas souvent et qu'un `surrogate-key` de purge existe

## §7 — SSR

- SSG → pas d'hydratation JS de tout le HTML par défaut ; pas de hydration mismatch hors Astro Islands
- Astro Islands : mismatch possible si le composant frontend (React/Vue) produit un output différent en SSR vs CSR → vérifier les avertissements `hydration mismatch` dans la console
- Si Astro en mode SSR (`output: 'server'` ou `'hybrid'`), revenir aux pivots Nuxt/Vue SPA selon le composant frontend utilisé
- Composants client-only Astro : `client:only="react"` pour les composants qui accèdent à `window` (pas de SSR Astro pour eux)

## §8 — INP / TBT

- `client:idle` = `requestIdleCallback` implicite via Astro — préférer à `client:load` pour tout composant non-critique au premier rendu
- `client:visible` = `IntersectionObserver` implicite — toujours préféré pour les Islands below-fold
- Éviter `client:load` sur des Islands lourdes ; les remplacer par `client:idle` ou `client:visible`
- 11ty : pas de système d'Islands → `requestIdleCallback` manuel pour le JS interactif

## §9 — Backend

- **N/A** pour pure SSG
- Si Astro SSR : auditer les API routes (`src/pages/api/`) comme une API standard ; max 3 queries séquentielles ; `Promise.all` impératif

## §10 — Storage

- Astro Islands `client:visible` : initialiser le storage dans le composant hydraté, PAS dans le module global Astro (le module global tourne côté Astro build = Node, pas browser)
- `localStorage` uniquement dans les composants hydratés (`client:*`) ou dans des `<script>` `type="module"` du côté client
- 11ty : tout le JS est côté client — pas de contrainte SSR sur `localStorage`

## §11 — Verification

- Critère déterministe : nombre d'Islands `client:load` (minimiser), taille JS total par Island (< 50 KB gzip chacune), taille CSS final gzip
- PSI : médiane post-fix (≥ 5 runs) vs maximum pré-fix
- `pnpm astro build && du -sh dist/` pour la taille totale du site
