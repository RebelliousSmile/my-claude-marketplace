# Framework mapping — perf pivots

> **Generic file**: this file contains ONLY the 12-section schema and the fallback procedure.
> Stack-specific pivots are NOT embedded here — they are installed as project-level rules by `sc-*` plugins (sc-js, sc-php, sc-python, sc-tiers, sc-rust, …) via their `setup` skills.
>
> **Dispatch order** when running an audit on a detected stack:
>
> 1. Look for `.claude/rules/07-quality/perf-pivots-<stack>.md` (and any related `data-pivots-<stack>.md`) — installed by the matching `sc-*` plugin
> 2. If found → use it as the primary checklist source for §1–§11
> 3. If not found → fall back to the generic schema below + the fallback procedure
>
> Always check `.claude/rules/07-quality/` for ALL `perf-pivots-*.md` and `data-pivots-*.md` files (hybrid stacks aggregate pivots from multiple plugins).

## Generic 12-section schema

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
9. Backend / DB perf (TTFB) — *stack-specific, see installed pivot rule*
10. Client-side storage (localStorage / sessionStorage / IndexedDB / Cache API / Cookies) — *transverse, JS stacks only*
11. Verification & non-regression

Les pivots installés par `sc-*` plugins remplacent les items section-par-section selon le framework cible.

## Plugin → stack mapping (informative)

| Plugin | Stacks covered |
|---|---|
| `sc-js` | Nuxt 3, Vue SPA, Vite, Alpine.js, Static / Astro / 11ty, §10 storage SSR |
| `sc-php` | Laravel, Symfony, WordPress, PHP vanilla, HTMX hybrid |
| `sc-python` | Django, Django + Alpine / HTMX hybrid |
| `sc-rust` | Axum, Actix, Rocket (server-side perf) |
| `sc-tiers` | Firebase Hosting, Supabase, third-party SaaS hosting concerns |

If a stack you detect has no matching plugin/pivot file, follow the fallback procedure below.

## Fallback: stack not covered by any installed pivot

Si la stack ne matche aucun pivot installé :

1. Demander à l'utilisateur 3 infos : (a) framework backend, (b) framework frontend, (c) build tool
2. Construire la checklist en repartant des **12 sections génériques** ci-dessus
3. Lister explicitement les items non-couverts comme "à valider" plutôt que d'inventer
4. **Si `aidd_docs/internal/decisions/` existe :** proposer un DEC documentant les conventions découvertes. **Sinon :** inline les conventions retenues dans le header du nouveau template (rendre la skill réutilisable sans dépendance ADR)
5. **Suggérer la création d'un plugin `sc-<stack>`** si la stack est susceptible d'être réutilisée dans d'autres projets — l'audit a déjà produit le contenu, le packager comme plugin évite de répéter l'exercice
