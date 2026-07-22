# sc-js — état de la stack

| Champ | Valeur |
|---|---|
| Version courante | 0.10.0 |
| Dernière release | 2026-07-22 |

## Frameworks détectés

Nuxt, SvelteKit, Svelte SPA, Vue SPA, Vite hybrid, Alpine.js, Astro, 11ty

## Pivots capability disponibles

| Catégorie | Pivots |
|---|---|
| State | pinia, alpine-store, svelte-stores |
| Code splitting | dynamic-import, defineAsyncComponent |
| SSR | storage-guards |
| Server | nitro-imports |
| TypeScript | typescript |
| Icons | lucide-vue, svg-inline |
| Images | web-optimization |
| Networking | preconnect |
| Styling | css-transitions |
| Tools | biome, testing |

## Pivots perf installés (web-optimize)

nuxt, vue-spa, vite, alpine, static, sveltekit

## Pivots data installés (data-optimize)

prisma, drizzle, typeorm, mongoose, graphql, trpc

## Pivot consommé par un autre plugin

`tools/testing.md` (v0.9.0+) — seul pivot de `sc-js` qui n'est lu par aucune skill de `sc-js`. Il est découvert **par glob** (`**/capabilities/**/testing.md`) et consommé par `overcode:control`, dont `references/pivot-contract.md` fait foi sur les champs attendus. Voir `DEC-004`.

## Réceptacles pivot design

`design-bridge` (v0.7.0+) — réceptacle pour `design:enforce` + `design:diffuse` :
- `01-realize-lint` → génère `design/lint/eslint-design-rule.mjs` (règle ESLint + Biome fallback)
- `02-render` → composant Vue 3 SFC ou React TypeScript + CSS module
