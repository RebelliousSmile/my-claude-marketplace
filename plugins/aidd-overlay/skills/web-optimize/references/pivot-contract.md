# Contrat de pivot — perf-pivots-<stack>.md

> Toute `perf-pivots-<stack>.md` installée par un plugin `sc-*` doit répondre aux questions ci-dessous pour chaque section qu'elle couvre.
> Une section sans réponse à sa question obligatoire (\*) est incomplète — l'audit `web-optimize` produira des recommandations génériques non vérifiables sur ce stack.

## Comment utiliser ce contrat

1. Quand tu crées ou révises un `perf-pivots-<stack>.md`, parcours chaque §N couvert par ta pivot et vérifie que les questions marquées **\*** ont une réponse concrète (commande, nom de fichier, pattern de code).
2. Les questions sans astérisque sont optionnelles mais améliorent la qualité de l'audit.
3. Si une question ne s'applique pas à ton stack (ex. §7 SSR sur un stack purement statique), indique explicitement `N/A — raison`.

---

## §0 — Pre-flight

| \* | Question |
|---|---|
| \* | Quelle commande de **build** produit les warnings et la taille des chunks ? |
| \* | Quels warnings sont **load-bearing** (signalent une vraie dégradation perf) et ne doivent pas être ignorés ? |
| \* | Comment **capturer le bruit PSI** pour ce stack (variance attendue, nb de runs recommandé) ? |
|   | Existe-t-il un **tripwire CI** qui échoue le build en cas de régression ? |

## §1 — Critical path (render-blocking)

| \* | Question |
|---|---|
| \* | Comment le stack injecte-t-il le **CSS critique** ? Est-il inline ou chargé via `<link>` bloquant ? |
| \* | Y a-t-il des **scripts en `<head>`** sans `defer`/`async` ? Comment les identifier ? |
|   | Comment les **fonts** sont-elles préchargées ? L'URL est-elle stable entre builds ? |
|   | Comment les scripts tiers (analytics, chat) sont-ils **différés** (requestIdleCallback, lazyload) ? |

## §2 — LCP (image héro / above-fold)

| \* | Question |
|---|---|
| \* | Comment servir une image **above-fold** dans ce stack : `<img>` natif ou composant framework ? |
| \* | Le wrapper `<picture>` est-il **autorisé above-fold** ? (ERR_ABORTED si oui sur certains stacks) |
| \* | Comment déclarer `fetchpriority="high"` et `<link rel="preload" as="image">` dans ce stack ? |
| \* | Comment déclarer un **responsive hero** (`srcset`/`sizes` ou `imagesrcset`/`imagesizes` dans le preload) ? |
|   | Y a-t-il un composant image optimisé natif (ex. `@nuxt/image`, `next/image`, `@astrojs/image`) ? Quand l'utiliser vs `<img>` direct ? |

## §3 — CLS

| \* | Question |
|---|---|
| \* | Comment réserver l'**espace pour les images** (width/height, aspect-ratio) dans les composants de ce stack ? |
| \* | Comment éviter le **FOUT** lié aux fonts (`font-display`, timing de chargement) ? |
|   | Comment protéger les éléments **injectés dynamiquement** (cookie banners, auth UI) pour éviter un layout shift ? |

## §4 — JS bundle & lazy-loading

| \* | Question |
|---|---|
| \* | Quel est le **mécanisme de code-splitting** de ce stack ? (dynamic import, route-based, manual chunks) |
| \* | Comment déclare-t-on un **import lazy** ? Y a-t-il des restrictions (ex. Vite : `dynamic import will not move`) ? |
| \* | Comment **auditer la taille des chunks** après build ? (commandes, fichiers à inspecter) |
|   | Y a-t-il des **dépendances lourdes** à isoler dans un chunk vendor séparé ? |
|   | Comment vérifier qu'un import lourd **n'a pas glissé dans le chunk d'entrée** (entry chunk) ? |

## §5 — CSS

| \* | Question |
|---|---|
| \* | Comment le stack **purge le CSS inutilisé** ? Est-ce automatique ou à configurer ? |
| \* | Quelles propriétés CSS sont à **éviter** pour la perf (transition-all, layout-triggering) ? Comment les détecter ? |
|   | Quelle est la **taille cible** du CSS final sur les routes marketing (gzip) ? |

## §6 — Caching & hosting

| \* | Question |
|---|---|
| \* | Quels `Cache-Control` le stack applique-t-il aux **assets hashés** (`_nuxt/*`, `build/*`) ? |
| \* | Quels `Cache-Control` le stack applique-t-il aux **routes HTML** (max-age, must-revalidate, CDN) ? |
|   | Y a-t-il une **config CDN / hosting** spécifique (Firebase, Vercel, Nginx, Cloudflare) à vérifier ? |

## §7 — SSR / prerender / hydration

| \* | Question |
|---|---|
| \* | Le stack supporte-t-il le **SSR / prerender** ? Quelles routes sont statiques vs dynamiques ? |
| \* | Quels composants doivent être **client-only** (accès window, auth) ? Comment les déclare-t-on ? |
| \* | Comment **détecter les hydration mismatches** (outil, message console) ? |
|   | Y a-t-il des **imports côté serveur** qui crashent si une lib browser-only est chargée au top-level ? |

## §8 — INP / TBT (render performance)

| \* | Question |
|---|---|
| \* | Comment **déférer le travail synchrone coûteux** dans ce stack (`requestIdleCallback`, `IntersectionObserver`, `scheduler.postTask`) ? |
|   | Les event handlers `scroll`/`touchstart` utilisent-ils **`{ passive: true }`** ? Comment le vérifier ? |
|   | Comment les **listes longues** (> 100 items) sont-elles virtualisées dans ce stack ? |
|   | Comment **débouncer** les inputs/keyup handlers dans ce stack ? |

## §9 — Backend / TTFB

| \* | Question |
|---|---|
| \* | Quel est le **chemin critique côté serveur** pour une route SSR (ex. nombre de queries séquentielles max) ? |
| \* | Comment le stack se **connecte-t-il à la couche data** ? (voir `data-pivots-<stack>.md` correspondant) |
|   | Y a-t-il un **warm-up** ou un cold-start problématique (serverless, Cloud Functions) ? Comment le mesurer ? |

## §10 — Client-side storage

| \* | Question |
|---|---|
| \* | Le stack peut-il accéder à `localStorage`/`sessionStorage`/`document.cookie` **côté serveur** ? Quel guard utiliser ? |
|   | Quel est le **pattern recommandé** pour le state persisté côté client (store avec TTL, plugin persistedstate, etc.) ? |

## §11 — Verification & non-regression

| \* | Question |
|---|---|
| \* | Quel est le **critère de succès déterministe** pour ce stack (bytes économisés, chunks supprimés, requêtes supprimées) ? |
| \* | Comment comparer **médiane post-fix vs maximum pré-fix** pour déclarer un vrai gain PSI ? |
|   | Y a-t-il un **tripwire postbuild** automatique ? Sur quelle signature ? |
