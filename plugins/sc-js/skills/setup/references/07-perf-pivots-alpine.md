---
paths:
  - "**/*.html"
  - "**/*.blade.php"
  - "**/*.twig"
  - "templates/**/*.html"
---

# Perf pivots — Alpine.js (hybride backend SSR)

Stack-specific overrides applied **in addition** to backend pivots when `import 'alpinejs'` or `<script src="...alpinejs">` is detected. Concatenate with Django / Laravel / Symfony / WordPress pivots. Loaded by `web-optimize`.

## §1 — Render-blocking

- Alpine.js doit être loadé APRÈS le HTML qu'il anime (sinon FOUC) — ajouter `[x-cloak]{display:none}` dans le CSS critique
- `<script defer>` obligatoire si chargé en `<head>`, sinon directives non hydratées

## §3 — CLS

- `x-if` retire du DOM (mieux pour LCP) ; `x-show` garde les nodes (mieux pour CLS si toggle fréquent) — choix documenté par usage

## §4 — Bundle

- **Préférer CDN avec `defer`** (~15 KB gzip) plutôt qu'un bundle custom — sauf si Vite déjà présent
- Si bundle Alpine custom : `esbuild --minify` ; éviter de bundler Alpine + plugins + code applicatif dans le même chunk (tree-shaking limité)
- `Alpine.data()` enregistre les composants au démarrage — si > 20 composants déclarés sur une page, vérifier qu'aucun ne fait de travail synchrone à `init()`

## §8 — INP / TBT

- Auditer chaque `x-init` lourd → préférer `x-intersect` (plugin Intersect) pour défer below-fold
- Long lists : rendre côté serveur (pagination backend) PAS `x-for` sur JSON — `x-for` > 100 items thrashe le layout
- Event handlers debounced via `@input.debounce.300ms`
- **`setInterval` polling** : toujours nettoyer dans `destroy()` du composant Alpine, sinon fuite mémoire / requêtes fantômes après navigation

## §10 — Storage

- Items SSR-guard (`process.client`, `typeof window`) **N/A** sur backend SSR (Django/Laravel/Symfony render le HTML, pas de `window undefined`)
- **`Alpine.$persist` plugin** : sync localStorage ↔ variable `x-data`. Risques :
  - quota silencieuse
  - pas de TTL natif
  - sérialisation JSON par mutation (coût CPU sur listes)
- Namespace obligatoire : `Alpine.$persist([]).as('app:cart')` — défaut Alpine `_x_<expr>` collide entre composants
- JSON-parse une seule fois en mémoire — jamais `JSON.parse(localStorage.getItem(key))` à chaque update réactif
