# Decision: Conventions d'authoring des pivots sc-*

| Field   | Value |
|---------|-------|
| ID      | DEC-001 |
| Date    | 2026-05-28 |
| Feature | Plugin sc-* — création de pivots capability et perf |
| Status  | Accepted |

## Context

Lors de la création des pivots SvelteKit (0.6.0), trois erreurs de conception ont été identifiées au challenge avant implémentation. Ces conventions évitent de les reproduire sur les futurs pivots.

## Decision

### 1 — Détection framework : couvrir le framework nu ET son wrapper

Quand un framework peut être utilisé seul ou via un méta-framework, la condition de détection doit couvrir les deux signaux.

- ✅ `svelte` OR `@sveltejs/kit` — pas uniquement `@sveltejs/kit`
- ✅ `react` OR `next` — si on ajoute un pivot React stores

S'applique à : tables Step 3 de `sniff/01-scan.md`, Step 1.5 de `improve/01-analyze.md`.

### 2 — DRY cross-pivot : référencer, ne pas redéfinir

Quand un pivot perf couvre §7 (SSR) ou §10 (storage), vérifier si un pivot capability dédié existe déjà (`ssr/storage-guards.md`). Si oui : **référencer** ce pivot, ne pas redéfinir les mêmes règles.

- ✅ `§10 Storage — Voir ssr/storage-guards.md`
- ❌ Copier les règles `browser guard` dans le pivot perf

### 3 — `paths:` frontmatter des pivots perf : signal minimal

Le frontmatter `paths:` d'un pivot perf doit contenir uniquement les **fichiers de configuration** signalant la présence du framework — pas les globs de fichiers source.

- ✅ `["svelte.config.js", "svelte.config.ts"]`
- ✅ `["vite.config.ts", "vite.config.js"]`
- ❌ `["src/**/*.svelte", "src/routes/**"]` — trop large, ralentit le matching de web-optimize

## Alternatives Considered

| Alternative | Pros | Cons | Rejected because |
|---|---|---|---|
| Glob large dans paths: | Détection plus précise | Matching lent sur gros projets | Signal de config suffisant |
| Dupliquer les règles SSR dans chaque pivot perf | Auto-suffisant | Incohérences futures garanties | DRY — une seule source de vérité |

## Consequences

- Tout nouveau pivot sc-* doit être challengé sur ces 3 points avant implémentation
- Les pivots existants (nuxt.md, vue-spa.md) sont conformes — pas de migration nécessaire
