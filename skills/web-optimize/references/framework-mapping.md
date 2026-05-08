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
- §4 : `useFirebase()` lazy, Vite `dynamic import will not move` warning load-bearing, modulepreload Nitro stripper avec signatures dans `shared/<sdk>SdkSignatures.js` source unique + tripwire postbuild `verify-marketing-strip.mjs` (DEC-029, DEC-032)
- §6 : Firebase Hosting `firebase.json` `trailingSlash`, `routeRules` Nuxt
- §7 : `<ClientOnly>`, hydration mismatches, prerender list, routes `ssr: false` → fallback `200.html` (vérifier le strip sur le bon fichier)
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

Pivots :

- §1 : tout le HTML est rendu par Django templates → focus sur `{% static %}` cachés agressivement, fichiers `collectstatic` versionnés (hash dans le nom)
- §2 LCP : préload image hero dans le `<head>` Django template, `fetchpriority="high"`
- §4 : minimiser le JS additionnel ; si Alpine.js → §section dédiée ci-dessous
- §6 :
  - **WhiteNoise** ou CDN devant `STATIC_URL` ; `Cache-Control: public, max-age=31536000, immutable` sur fichiers hashés
  - `Cache-Control: private, max-age=0, must-revalidate` sur HTML rendered (sauf si page publique cachable)
- §7 : N/A SSR JS — remplacer par "Django template fragment caching (`{% cache %}`), `low-level cache API` sur queries lourdes"
- §9 (CRITIQUE) :
  - `django-debug-toolbar` en dev : compter les requêtes SQL par page (cible < 10)
  - `select_related` / `prefetch_related` pour casser N+1
  - Index DB sur les colonnes filtrées (`Meta: indexes = [...]`)
  - `connection.queries` profilable, ou `silk` / `django-silk` pour profiling continu
  - Cache framework : Redis/Memcached pour vues + queries lourdes (`@cache_page`, `cache.get_or_set`)
  - `gunicorn` workers = `2 * cores + 1`, `--worker-class gevent` si I/O-bound
- §10 : k6 / locust load tests sur les routes critiques

---

## Django + Alpine.js (hybride classique)

Combine les pivots Django (§9 critique) + ces ajouts spécifiques Alpine :

- §4 :
  - Charger Alpine.js via `<script defer src="...">` (defer obligatoire, sinon directives non hydratées)
  - **Préférer la version CDN avec `defer`** (~15 KB gzip) plutôt qu'un bundle custom
  - Si bundle Alpine custom : `esbuild --minify` ; éviter de bundler Alpine + plugins dans le même fichier que le code applicatif (tree-shaking limité)
- §8 :
  - Alpine.js `x-data` initialise au DOMContentLoaded → coût startup proportionnel au nombre de composants `x-data`
  - Auditer les `x-init` lourds (préférer `x-intersect` du plugin Intersect pour défer)
  - `x-show` vs `x-if` : `x-if` retire du DOM (mieux pour LCP), `x-show` garde les nodes (mieux pour CLS si toggle fréquent)
- §1 : Alpine.js doit être loadé APRÈS le HTML qu'il anime (sinon flash unstyled : ajouter `[x-cloak]{display:none}` dans le CSS critique)
- §10 (storage spécifique Alpine) :
  - **Items SSR-guard du template Nuxt → N/A** : Alpine tourne uniquement côté browser, le HTML est rendu par Django (pas de `window undefined`)
  - **`Alpine.$persist` plugin** : magie qui synchronise une variable `x-data` avec localStorage → auditer chaque `$persist(...)`. Risques : quota silencieuse (échec écriture non géré), pas de TTL natif, sérialisation JSON sur chaque mutation (coût CPU sur listes)
  - Préfixer la clé `$persist` avec un namespace : `Alpine.data('cart', () => ({ items: Alpine.$persist([]).as('shop:cart') }))` — défaut Alpine est `_x_<expr>`, collision possible
  - Cookies session/CSRF Django : `HttpOnly` + `Secure` + `SameSite=Lax` ; **ne JAMAIS lire le csrftoken depuis Alpine `document.cookie`** si le cookie est `HttpOnly` (ne sera pas accessible) — Django expose `csrftoken` non-HttpOnly par défaut, à durcir si besoin
  - État UI léger (accordéons, tabs, filtres) : `x-data` éphémère suffit, `$persist` seulement si la persistence cross-page est explicitement demandée
  - IndexedDB en Django+Alpine : très rare ; si besoin offline-first → revoir l'architecture (PWA dédiée plutôt que Alpine)

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
