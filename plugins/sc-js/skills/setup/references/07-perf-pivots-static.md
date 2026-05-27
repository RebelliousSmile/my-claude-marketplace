---
paths:
  - "astro.config.mjs"
  - "astro.config.ts"
  - ".eleventy.js"
  - "**/*.astro"
---

# Perf pivots — Static HTML / Astro / 11ty

Stack-specific overrides for static site generators with minimal hydration. Loaded by `web-optimize`.

## §1 — Render-blocking

- Critical CSS inline natif (Astro `<style>` scoped, 11ty PostCSS critical)
- Pas de framework JS au top-level — chaque `<script>` doit être justifié

## §4 — Bundle

- **Astro Islands** → seules les iles JS hydratées comptent ; auditer chaque `client:*` directive :
  - `client:load` — JS exécuté au mount (lourd)
  - `client:idle` — JS exécuté pendant requestIdleCallback (mieux)
  - `client:visible` — JS exécuté quand l'île entre dans le viewport (le mieux pour below-fold)
- Préférer `client:visible` partout où possible

## §6 — Caching

- CDN + immutable cache **obligatoire**
- HTML peut avoir `s-maxage` long (revalidation par déploiement)
- Assets hashés (Astro / 11ty génèrent des hash dans le nom de fichier) servis en `max-age=31536000, immutable`

## §7 — SSR

- SSG → pas d'hydratation JS de tout le HTML par défaut
- Si Astro en mode SSR (`output: 'server'` ou `'hybrid'`), revenir aux pivots Nuxt/Vue SPA selon le composant frontend utilisé

## §9 — Backend

- **N/A** pour pure SSG
- Si Astro SSR : auditer les API routes (`src/pages/api/`) comme une API standard

## §10 — Storage

- Astro Islands `client:visible` : initialiser le storage dans le composant hydraté, PAS dans le module global Astro (le module global tourne côté Astro build = Node, pas browser)
