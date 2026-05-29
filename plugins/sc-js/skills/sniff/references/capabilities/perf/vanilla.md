---
paths:
  - "gulpfile.js"
  - "gulpfile.mjs"
  - "gulpfile.babel.js"
  - "index.html"
  - "**/*.html"
---

# Perf pivots — Vanilla web (no JS framework)

Stack-specific overrides for browser-targeting projects with no JS framework — typically a Gulp/BrowserSync/manual-bundle build serving hand-written HTML/CSS/JS. Loaded by `web-optimize`. No framework runtime means **every byte of JS is yours** — there is no framework to blame and no framework-level optimization to lean on.

## §0 — Pre-flight

- Build : `npx gulp build 2>&1 | tee build.log` (ou la tâche de build du projet)
- Inventaire JS chargé : `grep -rn "<script" *.html src/**/*.html` — chaque `<script>` non-`defer`/non-`module` est render-blocking
- Pas de manifest de bundle → mesurer le poids réel servi via DevTools Network ou Playwright (cf. `tools/playwright.md`)
- PSI : variance ±10 ; 5 runs, médiane comme référence

## §1 — Render-blocking

- Tout `<script>` sans `defer`/`async`/`type="module"` dans le `<head>` bloque le parsing → ajouter `defer` (ordre préservé) ou `type="module"` (defer implicite)
- CSS critique inline dans `<head>` ; le reste en `<link rel="stylesheet">` avec `media` adapté ou chargé après
- Fonts : `<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/inter.woff2">`
- Scripts tiers (analytics, widgets) : `defer` + `<link rel="preconnect">` vers leur origine (cf. `networking/preconnect.md`)

## §2 — LCP

- Image LCP : `<img src="hero.webp" fetchpriority="high" loading="eager" width="1440" height="800" alt="…">`
- `<link rel="preload" as="image" imagesrcset="hero_480.webp 480w, hero_1024.webp 1024w" imagesizes="(max-width:640px) 480px, 1024px">` dans `<head>`
- Jamais `loading="lazy"` sur l'image above-fold (retarde le LCP)
- Responsive : `srcset`/`sizes` sur `<img>` (cf. `images/web-optimization.md`)
- ⚠️ `<img>` dont le `src` est absent du HTML brut (défini dynamiquement par JS) → le preload scanner est aveugle → candidat LCP non préchargé → retard potentiel de plusieurs centaines de ms. Corriger : ajouter un `src` statique par défaut dans l'attribut HTML et surcharger en JS si nécessaire, ou ajouter un `<link rel="preload" as="image">` mis à jour en JS en même temps que le changement de `src`
- Détection : `grep -n '<img' index.html | grep -v 'src='` — repère les `<img>` above-fold sans attribut `src` statique

## §3 — CLS

- `width`/`height` **obligatoires** sur tout `<img>`/`<video>`/`<iframe>` — pas de framework pour les injecter
- `font-display: swap` dans `@font-face` ; réserver l'espace des éléments injectés par JS (slots dimensionnés)
- Contenu inséré dynamiquement (carrousels, bannières) : réserver la hauteur en CSS avant l'injection

## §4 — Bundle / JS

- Pas de tree-shaking automatique sans bundler moderne → auditer manuellement les libs lourdes ; préférer les imports ESM ciblés aux bundles UMD complets
- `<script type="module">` permet le code-splitting natif via `import()` dynamique — charger les fonctionnalités below-fold à la demande
- Concaténation Gulp (`gulp-concat`) → un seul gros fichier : vérifier qu'il ne contient pas de code mort ; minifier (`gulp-terser`)
- Cible : JS total servi < 100 KB gzip pour un site vitrine vanilla

## §5 — CSS

- Purge manuelle ou via `gulp-clean-css` + PurgeCSS ; vérifier `ls -lh dist/**/*.css`
- `transition: all` interdit → `transition: transform, opacity` (seules propriétés composited)
- Détecter : `grep -rn "transition.*all" src/`
- Préférer `transform`/`opacity` pour les animations (cf. `styling/css-transitions.md`)

## §6 — Caching

- Assets hashés (via `gulp-rev` ou hash manuel) : `Cache-Control: public, max-age=31536000, immutable`
- HTML : `Cache-Control: public, max-age=0, stale-while-revalidate=60`
- Sans hash dans les noms de fichiers → ne **jamais** mettre un long `max-age` (le navigateur sert du JS/CSS périmé) ; ajouter `gulp-rev` d'abord

## §7 — SSR

- **N/A** — site rendu côté client uniquement ; pas d'hydratation, pas de mismatch

## §8 — INP / TBT

- Découper les longues tâches JS (> 50 ms) avec `requestIdleCallback` ou `setTimeout(…, 0)` / `scheduler.postTask`
- Délégation d'événements plutôt qu'un listener par élément sur les longues listes
- `IntersectionObserver` pour déclencher le JS below-fold seulement quand visible
- Pas de framework = pas de batching automatique → regrouper les écritures DOM, lire puis écrire (éviter le layout thrashing)
- `{passive: true}` **obligatoire** sur tous les listeners `scroll` et `touchstart` : sans cette option le navigateur attend la fin du handler avant de scroller → jank tactile, TBT dégradé
- Détection : `grep -rn "addEventListener.*scroll\|addEventListener.*touchstart" --include="*.js" . | grep -v passive`

## §9 — Backend

- **N/A** pour un site statique vanilla ; si un backend existe (API consommée en `fetch`), l'auditer séparément

## §10 — Storage

- `localStorage`/`sessionStorage` accessibles directement (pas de garde SSR nécessaire) mais synchrones et bloquants → ne pas lire/écrire dans une boucle ou un handler de scroll
- Préférer une lecture unique au boot, mise en cache en mémoire

## §11 — Verification

- Critère déterministe : nombre de `<script>` render-blocking (→ 0), JS total gzip, CSS final gzip, `width`/`height` présents sur 100 % des médias
- Mesure : Playwright throttlé (cf. `tools/playwright.md`) — médiane post-fix (≥ 5 runs) vs maximum pré-fix
- `du -sh dist/` pour la taille totale servie
