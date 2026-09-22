# Framework mapping — perf pivots

> **Generic file**: this file contains ONLY the 12-section schema and the fallback procedure.
> Stack- and service-specific pivots are NOT embedded here — specialist plugins install them as project-level rules. **Which plugin supplies which pivot, and by which command, is read in `${OVERCODE_PLUGIN_ROOT}/references/pivot-providers.md` — never guessed, never derived from a plugin's name.** The command is carried per plugin, not per family: `overcode` installs by `setup`, the four `sc-<language>` by `sniff`.
>
> **Dispatch order** when running an audit on a detected stack:
>
> 1. Look for `${PROJECT_RULES_ROOT}/07-quality/perf-pivots-<stack>.md` (and any related `data-pivots-<stack>.md`) — installed by the matching `sc-*` plugin
> 2. If found → use it as the primary checklist source for §1–§11
> 3. If not found → fall back to the generic schema below + the fallback procedure
>
> Always check `${PROJECT_RULES_ROOT}/07-quality/` for ALL `perf-pivots-*.md` and `data-pivots-*.md` files (hybrid stacks aggregate pivots from multiple plugins).

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

## Plugin → stack mapping

**Read it in `${OVERCODE_PLUGIN_ROOT}/references/pivot-providers.md` › `perf-pivots-*`.** That table is the sole source, and it is not duplicated here: a second copy drifts from the installers silently, which is exactly how this file came to advertise `overcode` perf pivots and `sc-rust` Actix/Rocket pivots that no installer has ever written.

If a stack you detect has no line in that table, the state is `no provider` — follow the fallback procedure below, and say so in the receipt.

## Fallback: stack not covered by any installed pivot

Si la stack ne matche aucun pivot installé :

1. Demander à l'utilisateur 3 infos : (a) framework backend, (b) framework frontend, (c) build tool
2. Construire la checklist en repartant des **12 sections génériques** ci-dessus
3. Lister explicitement les items non-couverts comme "à valider" plutôt que d'inventer
4. **Si `aidd_docs/internal/decisions/` existe :** proposer un DEC documentant les conventions découvertes. **Sinon :** inline les conventions retenues dans le header du nouveau template (rendre la skill réutilisable sans dépendance ADR)
5. **Suggérer la création d'un plugin `sc-<stack>`** si la stack est susceptible d'être réutilisée dans d'autres projets — l'audit a déjà produit le contenu, le packager comme plugin évite de répéter l'exercice
