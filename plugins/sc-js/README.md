# sc-js

*Plugin JS pour Claude Code : détecte le stack du projet et charge le référentiel de connaissance adapté plutôt que d'appliquer des règles génériques à tout projet JavaScript.*

## État du projet

**Statut : 🧰 Beta.**

- *Ça marche aujourd'hui :* détection runtime (web / desktop), framework (Nuxt 3, Vue SPA, Vite, Alpine.js, Astro, 11ty), ORMs (Prisma, Drizzle, TypeORM, Mongoose, GraphQL, tRPC), audit via `aidd-dev:reviewer`, migration Vue 2 → 3 / ESM / TypeScript, enseignement composables / réactivité / async
- *Pas encore :* React, Svelte, Angular, Solid ; pivots routing (`vue-router`), i18n (`vue-i18n`), composables utilitaires (`@vueuse/core`), design system (UnoCSS, Tailwind)
- *Prochaine étape :* couverture des gaps les plus fréquents (routing, composables utilitaires)

## Pourquoi

- **Contexte au stack, pas universel** — seuls les pivots applicables au framework et aux libs détectés sont chargés pour l'audit
- **Zéro écriture de capability rules** — les pivots de connaissance vivent dans le plugin, pas dans le projet
- **Audit délégué à `aidd-dev:reviewer`** — pas une liste statique, une revue en contexte enrichi
- **Perf et data sur mesure** — `web-optimize` et `data-optimize` lisent des checklists adaptées au stack réel

Pertinent si tu travailles sur des projets Vue / Nuxt / Vite / Alpine avec le framework aidd. Pas applicable pour React, Angular, ou Svelte — aucun pivot disponible.

## Prérequis

- Claude Code avec le framework aidd
- Plugin `aidd-dev` (requis par `/sc-js:audit`)
- Plugin `aidd-overlay` (requis par `/web-optimize` et `/data-optimize`)

## Démarrage rapide

```
/sc-js:sniff    → détecte le stack, installe les perf/data pivots
/sc-js:audit    → revue de code JS avec les pivots du stack détecté
/sc-js:improve  → analyse + plan d'amélioration ciblé
/sc-js:legacy   → migration Vue 2 → 3, ESM, TypeScript strict
/sc-js:teach    → explications composables, réactivité, patterns async
```

## Utilisation

### `/sc-js:sniff`

Lit `package.json`, classe le runtime / framework / ORMs, émet un pivot manifeste et installe les perf/data pivots dans `.claude/rules/07-quality/`. Les capability pivots sont listés dans le manifeste mais **non écrits sur le projet**.

### `/sc-js:audit`

Reprend le manifeste émis par `sniff` (ou le recrée), charge les capability pivots depuis le plugin, et délègue la revue à `aidd-dev:reviewer`.

### `/sc-js:legacy`

Couvre trois migrations : Options API → Composition API (Vue 2 → 3), passage à l'ESM natif, et montée en TypeScript strict.

## Architecture des pivots

`sniff` distingue deux types de règles selon leur consommateur :

### Capability pivots — plugin uniquement

Les fichiers sous `skills/sniff/references/capabilities/` ne s'installent jamais dans le projet. Claude Code les charge depuis le plugin quand tu édites un fichier dont le chemin matche — le plugin est la source, le matching est fait par l'IDE/CLI au moment de l'édition. Aucun fichier de règle à maintenir côté projet.

### Perf et data pivots — installés dans le projet

Les fichiers `perf-pivots-*.md` et `data-pivots-*.md` sont copiés dans `.claude/rules/07-quality/` par `sniff`. Ils y sont parce que `web-optimize` et `data-optimize` les lisent explicitement à l'étape 2 de leur workflow :

> "Check installed plugin pivots first — scan `.claude/rules/07-quality/perf-pivots-*.md` for files matching the detected stack. If found → load them as the primary checklist source."

Si les fichiers sont absents, ces skills tombent en fallback sur un référentiel générique moins précis.

### Résumé

| Type | Où ça vit | Qui le charge | Quand |
|---|---|---|---|
| Capability pivot | Plugin uniquement | Claude Code (automatique, via `paths:`) | À chaque édition de fichier matchant |
| Perf / data pivot | `.claude/rules/07-quality/` | `web-optimize` / `data-optimize` (explicite) | Au lancement du skill |

## Migration depuis 0.3.0

Les projets sc-js 0.3.0 ont des fichiers orphelins dans `.claude/rules/capabilities/`. Pour nettoyer :

```
/sc-js:sniff clean --dry-run   → prévisualisation des suppressions
/sc-js:sniff clean             → suppression des fichiers orphelins
```

Le guard de contenu protège les fichiers modifiés manuellement — seuls les fichiers identiques à la référence plugin sont supprimés.

## Contribuer

Les retours sur les gaps de détection (libs non couvertes dans le manifeste) et sur la précision des pivots existants sont les plus utiles. Une issue avant PR pour les nouveaux pivots.

## Licence

MIT — voir [LICENSE](LICENSE).
