# Framework mapping — perf pivots

> Référence rapide pour générer une checklist adaptée par stack. À lire UNIQUEMENT quand un framework non couvert par un template existant doit être audité.

## Schéma général

Une checklist perf web tient en 12 sections, identiques quel que soit le stack :

0. Pre-flight (deterministic baseline + 3-5 PSI runs to characterize variance)
1. Render-blocking critical path
2. LCP (image / hero)
3. CLS
4. JS bundle size & lazy-loading
5. CSS
6. Caching & hosting (HTTP / CDN)
7. SSR / prerender / hydration
8. Render performance (INP / TBT)
9. Backend / DB perf (TTFB) — *spécifique au type de stack*
10. Client-side storage (localStorage / sessionStorage / IndexedDB / Cache API / Cookies) — *transverse, applicable à tout stack JS*
11. Verification & non-regression

Les pivots ci-dessous remplacent les items section-par-section selon le framework cible.

---

## Nuxt 3 (template existant)

Voir `aidd_docs/templates/dev/perf_checklist_nuxt.md`. Pivots clés :

- §0 : caractériser le noise floor PSI (DEC-030 — variance ±29 sur build identique) ; baseline déterministe (bytes/chunks) primaire
- §2 LCP : above-fold hero → `<img :src="webp">` DIRECT sans `<picture>` (DEC-033 — Chrome preload scanner fetch `<img src>` avant `<picture>` → ERR_ABORTED sur JPG fallback → Inspector Issue → Bonnes pratiques -4%) ; responsive → `srcset`/`sizes` sur `<img>` directement
- §2 LCP : hero LCP = `<img>` obligatoire — jamais `div:style="background-image"` (WICG LCP API — background-image invisible au preload scanner → LCP dégradé) ; background-image acceptable uniquement pour éléments décoratifs below-fold
- §4 : `useFirebase()` lazy, Vite `dynamic import will not move` warning load-bearing, modulepreload Nitro stripper avec signatures dans `shared/<sdk>SdkSignatures.js` source unique + tripwire postbuild `verify-marketing-strip.mjs` (DEC-029, DEC-032)
- §6 : Firebase Hosting `firebase.json` `trailingSlash`, `routeRules` Nuxt
- §7 : `<ClientOnly>`, hydration mismatches, prerender list, routes `ssr: false` → fallback `200.html` (vérifier le strip sur le bon fichier)
- §9 Firebase : items Firestore N/A si stack Prisma/SQL — utiliser les pivots Prisma du template (`§9 Prisma / SQL`)
- §9 Prisma : SSR critical path ≤ 3 queries séquentielles (`Promise.all`) ; N+1 via `include`/`select` Prisma ; profiler avec `$queryRaw EXPLAIN ANALYZE` si TTFB > 800ms ; cache Pinia TTL sur données semi-statiques (rooms, locations)
- §10 (storage) : pas de `localStorage` top-level (SSR crash + sync read) ; auth via Firebase Auth (HttpOnly cookie côté custom claims, jamais `document.cookie` token) ; Pinia store avec TTL pour cache reference data plutôt que localStorage brut
- §11 : succès = delta déterministe (bytes, chunks) primaire ; médiane PSI > max baseline = secondaire

---

## Vue SPA (Vite + Vue, sans SSR)

Pivots :

- §1 : pas de SSR → tout le HTML initial est minimal ; le critical path = `<link rel="modulepreload">` du chunk entry + CSS critique inliné par Vite
- §2 LCP : préload via `<link rel="preload" as="image" fetchpriority="high">` dans `index.html`, OU défini dynamiquement avant mount
- §4 :
  - `vite.config.ts` `build.rollupOptions.output.manualChunks` pour isoler vendors lourds
  - Route-based code-split : `defineAsyncComponent` + `<Suspense>` côté `<router-view>`
  - Vite report : `pnpm vite build --mode production` + `vite-plugin-visualizer` ou `rollup-plugin-visualizer`
- §7 : N/A SSR ; remplacer par "Initial HTML reste < 50 KB ; squelette + skeletons + meta"
- §9 : N/A backend ; remplacer par "API latency p95 < 300ms" si l'app consomme une API

---

## Django (backend full-page render, pas de JS framework)

Template existant : `aidd_docs/templates/dev/perf_checklist_django.md`. Couvre §0–§12 pour Django pur (TTFB, N+1, ORM, WhiteNoise, caching, gunicorn, security, federation, cookies). Les hybrides ci-dessous **complètent** ce template — ils ne le remplacent jamais.

---

## Alpine.js (frontend reactive layer, hybride avec n'importe quel backend SSR)

À concaténer aux items du template backend (Django, Laravel, Symfony) quand `import 'alpinejs'` ou `<script src="...alpinejs">` est présent.

- §1 (render-blocking) :
  - Alpine.js doit être loadé APRÈS le HTML qu'il anime (sinon FOUC) — ajouter `[x-cloak]{display:none}` dans le CSS critique
  - `<script defer>` obligatoire si chargé en `<head>`, sinon directives non hydratées
- §4 (bundle) :
  - **Préférer CDN avec `defer`** (~15 KB gzip) plutôt qu'un bundle custom — sauf si Vite déjà présent
  - Si bundle Alpine custom : `esbuild --minify` ; éviter de bundler Alpine + plugins + code applicatif dans le même chunk (tree-shaking limité)
  - `Alpine.data()` enregistre les composants au démarrage — si > 20 composants déclarés sur une page, vérifier qu'aucun ne fait de travail synchrone à `init()`
- §3 (CLS) :
  - `x-if` retire du DOM (mieux pour LCP) ; `x-show` garde les nodes (mieux pour CLS si toggle fréquent) — choix documenté par usage
- §8 (INP / TBT) :
  - Auditer chaque `x-init` lourd → préférer `x-intersect` (plugin Intersect) pour défer below-fold
  - Long lists : rendre côté serveur (pagination backend) NOT `x-for` sur JSON — `x-for` > 100 items thrashe le layout
  - Event handlers debounced via `@input.debounce.300ms`
  - **`setInterval` polling** : toujours nettoyer dans `destroy()` du composant Alpine, sinon fuite mémoire / requêtes fantômes après navigation
- §10 (storage) :
  - Items SSR-guard (`process.client`, `typeof window`) → **N/A** sur backend SSR (Django/Laravel/Symfony render le HTML, pas de `window undefined`)
  - **`Alpine.$persist` plugin** : sync localStorage ↔ variable `x-data`. Risques : quota silencieuse, pas de TTL natif, sérialisation JSON par mutation (coût CPU sur listes)
  - Namespace obligatoire : `Alpine.$persist([]).as('app:cart')` — défaut Alpine `_x_<expr>` collide entre composants
  - JSON-parse une seule fois en mémoire — jamais `JSON.parse(localStorage.getItem(key))` à chaque update réactif

---

## HTMX (server-driven UI, hybride avec n'importe quel backend SSR)

À concaténer quand `import 'htmx.org'` ou `<script src="...htmx">` est présent.

- §1 :
  - `htmx.org` chargé via `defer` ou en fin de `<body>` — jamais render-blocking
  - `htmx-indicator` styles préchargés dans le CSS critique (sinon FOUC sur premier `hx-*`)
- §4 :
  - HTMX importé une seule fois (entry chunk) — pas de `<script src=htmx>` dupliqué par page
  - `hx-boost` selectif : éviter sur navigation lourde (pages avec gros assets, où full reload serait équivalent)
- §3 (CLS) :
  - HTMX swaps préservent le layout : target avec `min-height` réservé si contenu de hauteur variable
- §7 (SSR / fragments) :
  - Endpoints HTMX retournent du HTML (partials), JAMAIS du JSON (typeahead inclus)
  - State-mutating endpoints décorés `@require_POST` AVANT `@login_required` — un GET (`<img>`, prefetch nav) déclenche sinon un delete fantôme
  - `hx-target` + `hx-swap="outerHTML"` sur chaque trigger d'action ; bouton "Annuler" appelle un endpoint GET qui rend la carte d'origine
  - Pattern 3 templates pour actions inline : `_X_form.html` (formulaire inline), `_X_resolved.html` (état post-action), `_X_card_fragment.html` (restauration)
  - Détection HTMX : `getattr(request, "htmx", False)` (Django — django-htmx sans stubs mypy → `request.htmx` casse)
  - Injection JS via `data-*` + `|escapejs`, jamais `{{ var }}` direct dans `onclick`
  - Helper centralisé `htmx_render(request, full_template, partial_template, context)` plutôt que `if getattr(request, "htmx", False): ... else: ...` dupliqué dans chaque vue (réduit la surface du bug `request.htmx` direct + DRY)
- §8 :
  - `hx-trigger` debounced sur input/scroll : `hx-trigger="keyup changed delay:300ms"`
  - Polling `hx-trigger="every Ns"` : durée justifiée, pas < 5s sans raison forte
- §10 :
  - `csrftoken` cookie NON-`HttpOnly` requis (HTMX lit `X-CSRFToken` depuis JS) — durcir avec `Secure` + `SameSite=Lax` obligatoires en prod

---

## Vite (build tool, hybride avec n'importe quel backend)

À concaténer quand `vite.config.{js,ts}` ou `@vitejs/plugin-*` est présent.

- §0 :
  - `pnpm vite build` — capturer entry chunk size, vendor chunks, total bytes (raw + gzip) AVANT toute optim
- §1 :
  - Le tag d'intégration backend (`{% vite_css %}` Django, `@vite([...])` Laravel) doit produire des URLs hashées (manifest.json) — vérifier `last-modified` matchant le déploiement
  - CSS critique above-fold : extraction via plugin (`vite-plugin-critical`, ou hand-inline tokens + layout) — Vite ne le fait pas par défaut
- §4 (CRITIQUE — Vite porte le bundle) :
  - **Heavy editor libs** (EasyMDE, CodeMirror, TinyMCE) JAMAIS dans entry chunk — split via dynamic `import()` triggered uniquement sur pages d'édition
  - `vite build --report` (ou `rollup-plugin-visualizer`) — flag toute dep > 30% du bundle
  - Per-route bundle : split entry par type de page (`main.js` minimal + `editor.js` lazy + `admin.js` lazy)
  - `manualChunks` configuré pour isoler vendors lourds (Alpine plugins, htmx extensions, icon collections)
  - Icon framework purgé (UnoCSS, Tabler, Lucide) — vérifier CSS final < 50 KB gzip
  - Build warnings load-bearing : `pnpm vite build 2>&1 | grep -E "(dynamic import will not move|warn|ERROR)"`
- §5 :
  - `import 'virtual:uno.css'` (UnoCSS) — `safelist` audité, chaque entrée justifiée (classe dynamique depuis backend)
- §6 :
  - `vite build` produit `manifest.json` consommé par le backend → vérifier que le tag `{% vite_asset %}` / `@vite()` lit bien le manifest et émet des URLs avec hash
  - `STATIC_URL` (Django) ou `public/build/` (Laravel) servi en `Cache-Control: public, max-age=31536000, immutable` (assets hashés)
- §10 :
  - Service Worker (PWA Vite) : cache name versionné par déploiement (sinon `pnpm build` n'invalide rien)

---

## PHP — Laravel

Pivots :

- §4 :
  - Vite + Laravel via `@vite([...])` directive Blade → comportement Vite SPA standard pour les assets
  - `laravel-mix` (legacy) : éviter pour nouveaux projets
- §6 :
  - **OPcache** activé en prod (`opcache.enable=1`, `opcache.validate_timestamps=0`)
  - `php artisan optimize` (config + route + view caching)
  - CDN devant `public/build/` (assets Vite hashés)
- §9 (CRITIQUE) :
  - **Eloquent N+1** : `with()` / `load()` ; `Model::query()->toRawSql()` pour debug
  - Laravel Debugbar / Telescope en dev — compter les queries
  - Index DB sur clés étrangères + colonnes filtrées
  - Queue Redis pour les jobs lents (mail, image processing)
  - `Cache::remember()` sur queries répétées
- §10 : `wrk` / `siege` / `artillery` sur routes critiques

---

## PHP — Symfony

Pivots :

- §6 : OPcache + APCu pour Symfony cache ; `bin/console cache:warmup --env=prod` au déploiement
- §9 :
  - **Doctrine** : `EAGER` vs `LAZY` fetch ; `QueryBuilder` + `select` partial pour limiter les colonnes
  - `Symfony Profiler` (debug bundle) — compter requêtes par page (cible < 10)
  - `EntityManager` clear sur batch jobs pour éviter explosion mémoire
- §1 : assets via `webpack-encore` ou Vite + Stimulus (audit Stimulus controllers comme Alpine.js)

---

## PHP vanilla / WordPress / autres

- §4 : minimiser inline `<script>`, jQuery seulement si requis ; auditer plugins (chacun = +X KB JS)
- §6 : OPcache, page caching (W3 Total Cache, WP Super Cache pour WordPress) ; CDN obligatoire
- §9 : **DB queries** (Query Monitor plugin pour WP) ; persistent object cache (Redis Object Cache plugin)
- §10 : `wrk` ou `ab` (ApacheBench) en local

---

## Static HTML / Astro / 11ty

Pivots simplifiés :

- §1 : critical CSS inline natif (Astro `<style>` scoped, 11ty PostCSS critical)
- §4 : Astro Islands → seules les iles JS hydratées comptent ; auditer chaque `client:*` directive (`client:load`, `client:idle`, `client:visible`)
- §6 : CDN + immutable cache obligatoire ; HTML peut avoir `s-maxage` long (revalidation par déploiement)
- §7 : SSG → pas d'hydratation JS de tout le HTML
- §9 : N/A backend

---

## Section §10 transverse — Client-side storage (tous stacks)

S'applique partout, mais les **items SSR-guard** sont N/A sur les stacks où le HTML est rendu côté serveur sans hydratation JS (WordPress, Django templates pur, PHP vanilla, Astro static). Toujours conserver : quota, XSS, cookies, IndexedDB, Cache API, BroadcastChannel.

### Nuxt 3 / Next.js / SvelteKit (SSR JS isomorphic)

- `localStorage` / `sessionStorage` / `indexedDB` interdits au top-level d'un module — `window` undefined côté serveur → crash build/render
- Garder dans `onMounted` / `useEffect` / `onMount` ou guard `if (process.client)` / `if (typeof window !== 'undefined')`
- Composables/hooks : exposer une fonction lazy, pas une valeur initiale lue depuis storage
- Pinia/Zustand + persist plugin : config par store, jamais global ; sérialiseur custom si valeurs non-JSON
- **Plugin custom de persistence Pinia** : auditer chaque store sérialisé pour PII (email, phone, profile, address). Si présent, F2-priorité — options : (a) allowlist par store filtrant `$state`, (b) déplacement vers IndexedDB chiffré, (c) suppression + re-fetch au mount via Firestore, (d) sessionStorage scope-tab si UX accepte
- **Firebase Auth** (si présent) stocke son token en IndexedDB interne (`firebaseLocalStorageDb`), PAS en localStorage. L'absence de `document.cookie` / `localStorage.token` au grep n'est PAS un faux négatif — c'est le comportement attendu
- Hydratation : si la valeur localStorage diffère du HTML rendu côté serveur → mismatch warning. Initialiser à valeur neutre, lire depuis storage post-mount. Hors plugins `.client.*` (skip SSR par contrat Nuxt → règle hydration N/A)

### Vue SPA / React SPA / Astro Islands hydratées (CSR pur)

- **Pas de SSR JS → guards `process.client` inutiles**, mais quota et XSS toujours valides
- Astro Islands `client:visible` : initialiser le storage dans le composant hydraté, pas dans le module global Astro (le module global tourne côté Astro build = Node, pas browser)

### WordPress / PHP vanilla / Django templates (PHP/Python-rendered HTML, pas de SSR JS)

- **Items SSR-guard inapplicables** : pas de `window undefined` au build, le JS n'existe que dans le navigateur. Les bullets `process.client` / `typeof window` du template Nuxt §10 → marquer **N/A**
- Storage côté client utilisé pour l'état UI (filtres, tri, pagination, état accordéon) ; backend ignore localStorage
- **Cookies** = canal de partage serveur/client (CSRF, session WP, panier WooCommerce) — `HttpOnly` + `Secure` + `SameSite=Lax` obligatoires sur cookies sensibles
- **WordPress** : auditer les plugins qui écrivent dans localStorage (cookie banners, A/B testing, sliders) — chaque plugin = vecteur XSS supplémentaire
- IndexedDB rare en WP/Django — si présent, vient quasi toujours d'un plugin tiers ; auditer avant d'accepter
- BroadcastChannel applicable si plusieurs onglets WP-admin ouverts (ex. logout multi-tab)
- **Si Alpine.js / Stimulus / htmx présent** → voir la section dédiée `## Django + Alpine.js (hybride classique)` plus haut, qui ajoute le pivot `$persist`, namespace de clés, et coût sérialisation par mutation

### Laravel + Inertia / Livewire (hybride PHP + JS)

- Inertia : SPA-like côté client, hydratation Vue/React → **traiter comme Vue SPA / React SPA**
- Livewire : DOM patché par requêtes serveur → storage purement décoratif, jamais source de vérité (sera écrasé au prochain render Livewire)

### PWA / offline-first (transverse à tout stack JS)

- Service Worker + Cache API → cache name versionné par déploiement (sinon `pnpm build` n'invalide rien chez les clients)
- IndexedDB pour données persistantes offline ; `navigator.storage.persist()` pour éviter eviction
- Background Sync API pour rejouer les writes offline ; idempotency keys côté backend
- **WordPress + PWA** : plugins type Super PWA / PWA for WP — auditer la stratégie de cache HTML, conflit avec page-cache plugins (W3 Total Cache)

---

## Fallback : framework non listé

Si la stack ne matche aucun template existant ET aucune entrée ci-dessus :

1. Demander à l'utilisateur 3 infos : (a) framework backend, (b) framework frontend, (c) build tool
2. Construire la checklist en repartant des **10 sections génériques** (haut de ce document)
3. Lister explicitement les pivots non couverts comme "à valider" plutôt que d'inventer
4. **Si `aidd_docs/internal/decisions/` existe :** proposer un DEC documentant les conventions découvertes. **Sinon :** inline les conventions retenues dans le header du nouveau template (rendre la skill réutilisable sans dépendance ADR)
