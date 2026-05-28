---
paths:
  - "svelte.config.js"
  - "svelte.config.ts"
---

# Perf pivots — SvelteKit

Stack-specific overrides for the generic 12-section perf checklist when auditing a SvelteKit project. Loaded by `web-optimize`.

## §0 — Pre-flight

- Build : `pnpm vite build 2>&1 | tee build.log` — capturer entry chunk size, vendor chunks, total bytes (raw + gzip) AVANT toute optim
- **Warnings load-bearing** (ne pas ignorer) :
  - `dynamic import will not move` = import statique dans l'entry chunk — dégradation TBT directe
  - `chunk size limit exceeded` (> 500 KB gzip) = vendor non-splitté ou chunk commun gonflé
  - `Circular dependency` sur une dépendance partagée = risque d'entry chunk gonflé
- **PSI runs** : ≥ 5 runs successifs, médiane comme valeur de référence ; écarter max et min ; variance ±15 normale selon l'hébergeur

## §1 — Critical path

- `<svelte:head>` : émettre les `<link rel="modulepreload">` des chunks critiques (SvelteKit les génère automatiquement, vérifier leur présence dans le HTML rendu)
- CSS critique above-fold : Vite ne l'inline pas par défaut — utiliser `vite-plugin-critical` ou inliner manuellement dans `<style>` du bloc `<head>` dans `src/app.html`
- Scripts hors-Vite dans `src/app.html` (analytics, chat, scripts tiers) : vérifier que chaque `<script src="...">` dispose de `defer` ou `async` — tout script bloquant retarde le LCP
- Fonts : `<link rel="preconnect">` + `<link rel="preload" as="font">` dans `<svelte:head>` du layout racine

## §2 — LCP

- Images above-fold dans `+layout.svelte` ou `+page.svelte` : utiliser `<img>` **direct** sans `<picture>` above-fold
- `fetchpriority="high"` sur le `<img>` LCP : `<img src={hero} fetchpriority="high" loading="eager">`
- Preload hero via `<link rel="preload" as="image" fetchpriority="high">` dans `<svelte:head>` du composant parent
- `<picture>` **interdit** above-fold (le preload scanner Chrome fetch `<img src>` avant la résolution `<picture>` → ERR_ABORTED sur fallback) ; autorisé below-fold
- Responsive : `srcset`/`sizes` directement sur `<img>` (jamais `div` avec `background-image` above-fold)

## §3 — CLS

- `width` + `height` HTML explicites sur tout `<img>` — le navigateur réserve l'espace avant le chargement
- `font-display: swap` dans le CSS global (`src/app.css` ou `src/styles/global.css`) pour chaque `@font-face`
- Composants conditionnels (`{#if}`) qui injectent du contenu au-dessus du fold après le premier render : réserver un `min-height` ou utiliser `position: fixed` pour éviter de décaler le contenu existant

## §4 — Bundle (CRITIQUE)

- SvelteKit splitte naturellement par route (`+page.svelte` = chunk séparé automatique) — vérifier que ce split fonctionne correctement dans `build.log`
- Les libs lourdes importées dans des composants partagés par plusieurs routes atterrissent dans le **chunk commun** : les isoler via lazy `import()` dans les pages qui les utilisent uniquement (Konva, pdf-lib, EasyMDE, CodeMirror…)
- `vite.config.ts` `build.rollupOptions.output.manualChunks` pour isoler les vendors lourds récurrents dans des chunks dédiés
- `rollup-plugin-visualizer` pour inspecter la distribution des chunks et détecter le chunk commun gonflé
- Vérifier l'entry chunk cible : `ls -lh build/_app/immutable/entry/*.js | sort -k5 -h` — entry chunk cible < 100 KB gzip

## §5 — CSS

- Tailwind purge : `content: ['./src/**/*.svelte', './src/**/*.ts']` dans `tailwind.config.ts` (vérifier l'absence de chemins manquants)
- `transition: all` interdit → utiliser uniquement `transition: transform, opacity`
- Détecter : `grep -rn "transition.*all" src/`
- Taille cible CSS après purge : < 20 KB gzip

## §6 — Caching

- `adapter-static` : assets hashés dans `build/_app/immutable/` → `Cache-Control: public, max-age=31536000, immutable` (configurer côté CDN/nginx)
- `app.html` (ou `index.html` généré avec `adapter-static`) : `Cache-Control: no-cache, no-store` — sinon les déploiements ne sont pas pris en compte chez les clients
- Service Worker (vite-pwa) : cache name versionné par hash de déploiement ; invalider le cache SW à chaque `pnpm build`

## §7 — SSR vs adapter

- Distinguer les modes de déploiement :
  - `adapter-static` → SSG ou SPA (rendu statique au build) : les règles browser guard (`localStorage`, `window`, `document`) s'appliquent uniquement si `ssr: false` est absent dans `svelte.config.js`
  - `adapter-node` → SSR dynamique : rendu serveur sur chaque requête, hydration côté client
- Pour les règles browser guard complètes (`localStorage`, `window`, `sessionStorage`), **voir `ssr/storage-guards.md`** — ne pas redéfinir ces règles ici
- Note contextuelle SvelteKit : même avec `adapter-static`, la fonction `load()` dans `+page.ts` s'exécute **côté serveur en mode `dev`** → tester avec `adapter-static` en preview (`pnpm preview`) et non en dev, pour valider le comportement réel des guards

## §8 — INP / TBT

- `{#if visible}` + `IntersectionObserver` pour lazy-render les composants heavy below-fold (évite de parser et d'exécuter le JS avant qu'ils ne soient nécessaires)
- `tick()` de Svelte pour différer le travail coûteux après la mise à jour du DOM : `await tick(); /* heavy computation */`
- `{ passive: true }` sur tous les listeners `scroll` et `touchstart` pour ne pas bloquer le thread principal
- `requestIdleCallback(() => { /* analytics init, chat widget */ })` pour différer le JS non-critique

## §9 — Backend / API

- `load()` server-side dans `+page.server.ts` : paralléliser les fetches en retournant des promises simultanées — SvelteKit résout les promises en parallèle automatiquement :
  ```ts
  export const load = async ({ fetch }) => ({
    a: await fetch('/api/a'),
    b: await fetch('/api/b'),
  });
  // ✅ Mieux : retourner les promises sans await pour parallélisme
  export const load = ({ fetch }) => ({
    a: fetch('/api/a').then(r => r.json()),
    b: fetch('/api/b').then(r => r.json()),
  });
  ```
- TTFB dépend directement de la vitesse de `load()` server-side — p95 API < 300 ms
- Batching des calls redondants : regrouper les appels API dupliqués dans un seul `load()` parent plutôt que dans plusieurs composants enfants

## §10 — Storage

- **Voir `ssr/storage-guards.md`** pour les règles complètes sur `localStorage`, `sessionStorage`, `window`, `document`
- Spécificité SvelteKit : utiliser `import { browser } from '$app/environment'` comme guard universel — disponible dans tous les contextes SvelteKit (composants `.svelte` ET modules `+page.ts`, `+layout.ts`) :
  ```ts
  import { browser } from '$app/environment';
  if (browser) {
    localStorage.setItem('key', value);
  }
  ```
- Ne pas utiliser `typeof window !== 'undefined'` dans les contextes SvelteKit — `browser` est plus fiable et idiomatique

## §11 — Verification

- Critère déterministe : taille chunk par route (`ls -lh build/_app/immutable/chunks/ | sort -k5 -h`), nombre de chunks lazy générés (compter les imports dynamiques dans `build.log`)
- `vite-bundle-visualizer` (ou `rollup-plugin-visualizer`) pour inspecter la distribution des chunks et confirmer l'isolation des vendors lourds
- PSI médiane post-fix (≥ 5 runs) > maximum pré-fix = gain réel confirmé
- Vérifier l'absence de warnings `dynamic import will not move` dans le `build.log` après optimisation
