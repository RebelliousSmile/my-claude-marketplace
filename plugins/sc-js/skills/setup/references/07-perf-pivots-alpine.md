---
paths:
  - "**/*.html"
  - "**/*.blade.php"
  - "**/*.twig"
  - "templates/**/*.html"
---

# Perf pivots — Alpine.js (hybride backend SSR)

Stack-specific overrides applied **in addition** to backend pivots when `import 'alpinejs'` or `<script src="...alpinejs">` is detected. Concatenate with Django / Laravel / Symfony / WordPress pivots. Loaded by `web-optimize`.

## §0 — Pre-flight

- Build : **N/A** pour Alpine CDN (pas de build propre à Alpine)
- Si Alpine bundlé avec Vite : `pnpm vite build 2>&1 | tee build.log` — auditer la taille du bundle Alpine (~8 KB gzip en CDN vs bundle potentiellement gonflé si plugins inutiles inclus)
- Warnings load-bearing : `chunk size limit exceeded` si Alpine bundlé avec des plugins lourds
- PSI : variance ±10 normale pour pages backend SSR + Alpine ; 5 runs, médiane comme référence

## §1 — Render-blocking

- Alpine.js doit être loadé APRÈS le HTML qu'il anime (sinon FOUC) — ajouter `[x-cloak]{display:none}` dans le CSS critique
- `<script defer>` obligatoire si chargé en `<head>`, sinon directives non hydratées
- CSS critique = responsabilité du backend (Django/Laravel/Symfony) qui génère le HTML ; Alpine n'injecte aucun CSS
- Scripts tiers : `<script defer>` dans les templates backend, jamais de `<script>` nu en `<head>`

## §2 — LCP

- Images above-fold dans les templates backend — `fetchpriority="high"` directement dans le HTML du template
- `<img>` direct, **sans `<picture>`** above-fold — même règle ERR_ABORTED Chrome
- `<link rel="preload" as="image">` dans `<head>` du template
- Responsive : `srcset`/`sizes` sur le `<img>` du template backend

## §3 — CLS

- `x-if` retire du DOM (mieux pour LCP) ; `x-show` garde les nodes (mieux pour CLS si toggle fréquent) — choix documenté par usage
- `width`/`height` dans les templates HTML backend sur tout `<img>`
- `font-display: swap` dans le CSS du backend

## §4 — Bundle

- **Préférer CDN avec `defer`** (~15 KB gzip) plutôt qu'un bundle custom — sauf si Vite déjà présent
- Si bundle Alpine custom : `esbuild --minify` ; éviter de bundler Alpine + plugins + code applicatif dans le même chunk (tree-shaking limité)
- `Alpine.data()` enregistre les composants au démarrage — si > 20 composants déclarés sur une page, vérifier qu'aucun ne fait de travail synchrone à `init()`

## §5 — CSS

- **N/A** — Alpine ne génère et ne gère aucun CSS ; toutes les règles CSS sont sous la responsabilité du backend et de son système de build (Tailwind côté Laravel/Django, voir leurs pivots)
- Règle transverse : `transition: all` interdit même dans les styles Alpine — `transition: transform, opacity` uniquement

## §6 — Caching

- **N/A** — Alpine ne produit aucun asset hashé ; la politique de caching est intégralement gérée par le backend et son CDN
- Si Alpine est servi depuis CDN public : URL versionée (ex. `alpinejs@3.14.0`) = immutable de facto

## §7 — SSR / hydration

- **N/A** — Alpine = progressive enhancement sur DOM existant généré par le backend ; pas d'hydration mismatch (Alpine initialise sur le DOM existant, ne recrée pas le DOM)
- Pas de composant `client-only` au sens SSR : tout le HTML est rendu par le serveur, Alpine décorèle l'interactivité
- Vérification : `document.querySelectorAll('[x-data]')` en console pour lister les composants Alpine actifs

## §8 — INP / TBT

- Auditer chaque `x-init` lourd → préférer `x-intersect` (plugin Intersect) pour défer below-fold
- Long lists : rendre côté serveur (pagination backend) PAS `x-for` sur JSON — `x-for` > 100 items thrashe le layout
- Event handlers debounced via `@input.debounce.300ms`
- **`setInterval` polling** : toujours nettoyer dans `destroy()` du composant Alpine, sinon fuite mémoire / requêtes fantômes après navigation
- `{ passive: true }` sur listeners `scroll`/`touchstart` : `document.addEventListener('scroll', fn, { passive: true })`

## §9 — Backend / TTFB

- **N/A** — TTFB non lié à Alpine ; voir les pivots du backend correspondant (Django, Laravel, Symfony, WordPress)
- Alpine ne fait aucun appel serveur de lui-même (sauf `fetch()` explicite dans le code applicatif)

## §10 — Storage

- Items SSR-guard (`process.client`, `typeof window`) **N/A** sur backend SSR (Django/Laravel/Symfony render le HTML, pas de `window undefined`)
- **`Alpine.$persist` plugin** : sync localStorage ↔ variable `x-data`. Risques :
  - quota silencieuse
  - pas de TTL natif
  - sérialisation JSON par mutation (coût CPU sur listes)
- Namespace obligatoire : `Alpine.$persist([]).as('app:cart')` — défaut Alpine `_x_<expr>` collide entre composants
- JSON-parse une seule fois en mémoire — jamais `JSON.parse(localStorage.getItem(key))` à chaque update réactif

## §11 — Verification

- Critère déterministe : Core Web Vitals mesurés (LCP, CLS, INP) ; taille bundle Alpine si bundlé custom
- PSI : médiane post-fix (≥ 5 runs) vs maximum pré-fix ; les gains Alpine sont souvent sur INP (debounce, defer x-init)
- Tripwire : **N/A** pas de build artifacts Alpine en CDN
