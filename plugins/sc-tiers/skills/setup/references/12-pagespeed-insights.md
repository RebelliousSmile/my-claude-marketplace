# PageSpeed Insights / Lighthouse — Nuxt 3

> **Portée :** Nuxt 3 + Firebase Hosting. §2 (LCP), §3 (CLS) et §8 (INP/TBT) sont stack-agnostiques. §1 (chemin critique) est partiellement Nuxt (`inlineSSRStyles`). §4–§7 et §9 sont spécifiques à Nuxt 3 / Firebase.

## Règle fondamentale — variance PSI

**Une seule mesure PSI ne prouve rien.** La variance cloud est de ±29 points sur un build identique (trois runs consécutifs peuvent donner 53 / 82 / 55). Le score PSI mobile est un signal bruité, pas un KPI fiable.

```
Protocole minimal : 5 runs PSI mobile, intervalles de 5 min, déclarer gain uniquement si
  median_post > max_pre
Sinon : "fix shippé, la variance PSI domine, le delta déterministe est le signal fiable"
```

## Métriques cibles (PSI mobile, Slow 4G / 4× CPU)

| Métrique | Cible |
|---|---|
| LCP | ≤ 2.5 s |
| CLS | ≤ 0.1 |
| INP | ≤ 200 ms |
| TBT | ≤ 200 ms |

## Signal déterministe vs signal PSI

Avant de coder, définir le **critère de succès déterministe** — c'est lui qui porte la preuve :

| Critère déterministe | Exemple |
|---|---|
| Bytes économisés | `webpack-bundle-analyzer` : chunk Firebase -40 KB gzip |
| Chunks bloqués | `modulepreload` Firebase absent du HTML marketing (`view-source:/`) |
| Requêtes supprimées | Klaviyo non chargé sans consentement |
| Requêtes Firestore supprimées | `getDocs` remplacé par `getAggregateFromServer(count())` |

PSI sert à confirmer — le delta déterministe est la preuve.

## Limites de l'API PSI

- API anonyme : ~25 runs/jour. Au-delà, utiliser une Google API Key ou la web UI
- `npx lighthouse` local ≠ PSI cloud : throttling différent, pool différent, **médianes non comparables entre les deux**
- Ne jamais comparer un score local Lighthouse avec un score PSI cloud

## Checklist performance Nuxt 3

### 1. Chemin critique — render-blocking

- Pas de CSS bloquant chargé en `<head>` pour des icônes (Boxicons via CDN, FontAwesome CDN)
- CSS critique inline uniquement pour above-fold ; le reste différé via `experimental.inlineSSRStyles`
- GTM, Klaviyo, Clarity chargés via `requestIdleCallback` ou trigger d'interaction — jamais en synchrone
- `preconnect` réservé aux origines **above-fold** uniquement ; les origines différées utilisent `dns-prefetch`
- Aucune origine dans `preconnect` / `dns-prefetch` dont la requête n'est jamais émise (`grep`-vérifier)
- Fonts préchargées via `<link rel="preload">` pointant sur une **URL publique stable** (`/fonts/...`), jamais un chemin haché `/_nuxt/` (Nuxt rehache à chaque build)
- `<link rel="preload" as="font">` doit avoir `crossorigin`

### 2. LCP (image hero)

- Hero image : `<link rel="preload" as="image" fetchpriority="high">` — `fetchpriority` est obligatoire
- Responsive hero : `imagesrcset` + `imagesizes` dans le preload (pas `href` seul)
- `<img>` hero : `fetchpriority="high"` + `loading="eager"` + `decoding="async"`
- **Above-fold hero : `<img :src="webp">` direct — PAS de wrapper `<picture>`** : le scanner de preload Chrome demande `<img src>` (JPG de fallback) avant que `<picture>` soit évalué → ERR_ABORTED → Inspector Issue → "Bonnes pratiques" -4%
- Below-fold : garder `<picture><source type="image/webp"><img src="jpg"></picture>` (pas de preload agressif sur les images lazy)
- Responsive above-fold : `srcset`/`sizes` directement sur `<img>`, pas sur `<source>`
- Pas de `net::ERR_ABORTED` sur les ressources image (vérifier DevTools Network)
- `width` + `height` explicites sur tout `<img>` (guard CLS)

### 3. CLS

- Espace réservé pour le contenu async : squelettes, `min-height` fixe, boxes aspect-ratio
- `font-display: swap` avec les mêmes URL `@font-face src:` que le preload (sinon FOUT + avertissement)
- Bannières cookie / UI auth dans un `<ClientOnly>` avec hauteur réservée

### 4. Bundle JS / lazy-loading

- `pnpm nuxt build` — zéro avertissement `dynamic import will not move module into another chunk`
- Chaque import Firebase passe par le composable `useFirebase()` (init lazy)
- Pas de `getFirestore()` / `doc(db, …)` au top-level d'un composable (SSR crash + chunk non splitté)
- Routes marketing (`/`, `/entreprises`, etc.) gérées via `isMarketingPath()` — stores lourds (Auth, Candidate, Company) non instanciés
- `<link rel="modulepreload">` chunks Firebase **supprimés** du HTML des routes marketing via plugin Nitro (`render:html` hook) — vérifier avec `view-source:/`
- Les signatures du strip-plugin vivent dans un fichier partagé unique — jamais dupliquées inline
- Tripwire postbuild (`pnpm postbuild:check`) : échoue si une signature Firebase fuite dans le HTML marketing prérendu
- Fichiers statiques lourds (JSON communes, fixtures) chargés à la première interaction, pas au boot

### 5. CSS

- Tailwind purge effectif : CSS build < 50 KB gzip sur routes marketing
- Pas de `transition-all` / `transition: all` — restreindre à `transform`, `opacity`
- Pas de `transition-all` global sur `*`
- Icônes via `lucide-vue-next` (tree-shaken) sur pages publiques

### 6. Caching / hosting

- HTML `Cache-Control: public, max-age=0, must-revalidate` pour les routes prérendues
- Assets `_nuxt/*` : `Cache-Control: public, max-age=31536000, immutable`
- Fonts, posters vidéo, icônes sociales sous cache long terme
- `firebase.json` : `trailingSlash: false` si les canoniques SEO sont sans slash (sinon boucle de redirection)

### 7. SSR / prerender

- `pnpm nuxt build` sans erreur (`Unexpected token 'default'`, `Cannot find package`)
- Pas d'appel Firebase / Firestore / sessionStorage au top-level de composables
- `<ClientOnly>` uniquement là où strictement requis (UI auth) — l'abus nuit au SEO et au FCP
- 0 hydration mismatch en console DevTools au premier chargement SSR

### 8. INP / TBT

- Travail synchrone coûteux dans `onMounted` de composants below-fold différé via `IntersectionObserver` (`rootMargin: 200px`)
- Pas de boucles `requestAnimationFrame` sans throttle ni cleanup
- Listes longues (> 100 items) virtualisées
- Handlers input/scroll déboncés

### 9. Firebase / Firestore

- Tout `query()` a un `limit()`
- Comptage via `getAggregateFromServer(count())`, jamais `getDocs().length`
- Pas d'appel Firestore dans une boucle `for` / `map`
- `onSnapshot` désinscrit dans `onUnmounted`

## Anti-patterns répertoriés

| Anti-pattern | Pourquoi rejeté |
|---|---|
| Run PSI unique comme baseline | Variance ±29 pts — unfalsifiable |
| `npx lighthouse` vs PSI pour comparer | Throttling différent, non comparables |
| `<picture>` wrapper sur hero above-fold | ERR_ABORTED + Inspector Issue + "Bonnes pratiques" -4% |
| `<source type="image/jpeg">` en premier | Tous les browsers supportent JPEG → la source JPEG est toujours choisie → WebP jamais utilisé |
| `preconnect` sur toutes les origines tierces | Gaspille des slots TCP+TLS ; les scripts différés doivent utiliser `dns-prefetch` |
| `@nuxt/image` pour optimiser une image isolée | Coût module > gain vs `<picture>` natif |
| `loading="eager"` seul sur le hero | Pas suffisant — doit être accompagné de `fetchpriority="high"` dans le preload |
| `transition-all` pour un effet fluide | Peint les propriétés non composited ; nul si les classes ne changent pas via Vue |
| Signatures modulepreload dupliquées | Drift entre plugin et tripwire — source unique obligatoire |
| Single-static-import de dep lourde dans le chunk principal | Effondre le split de chunk — l'avertissement Vite est load-bearing |

## Commandes de vérification rapide

```bash
# Build et warnings
pnpm nuxt build 2>&1 | grep -E "(dynamic import|warn|WARN|ERROR)"
pnpm nuxt build 2>&1 | grep -i "modulepreload"

# Imports Firebase hors composable useFirebase()
grep -rn "from ['\"]firebase/" --include="*.{vue,js,ts}" .

# Transitions dangereuses
grep -rn "transition-all" --include="*.vue" --include="*.css" .

# Taille des chunks principaux (JS)
ls -lh .output/public/_nuxt/*.js | sort -k5 -h | tail -10

# Tripwire modulepreload marketing
pnpm postbuild:check

# Storage non gardé (SSR safety)
grep -rn "localStorage\|sessionStorage" --include="*.{vue,js,ts}" . | grep -v "process.client\|typeof window"
```

## Validation PSI — procédure complète

1. Définir le critère déterministe AVANT de coder
2. Capturer 3–5 runs PSI mobile avant le fix (baseline)
3. Déployer le fix sur un preview channel
4. Capturer 3–5 runs PSI mobile après le fix (intervalles 5 min)
5. Comparer : gain réel uniquement si `médiane_post > max_pré`
6. Sinon : documenter le delta déterministe dans le Decision Record

## Intégration avec les autres services

- GTM / Clarity chargés après consentement → ils n'impactent **pas** le score PSI tant que `requestIdleCallback` est respecté
- Firebase modulepreload strip est un prérequis pour un bon score PSI sur routes marketing
- Klaviyo chargé lazy (consent + `requestIdleCallback`) → pas de TBT sur pages publiques
