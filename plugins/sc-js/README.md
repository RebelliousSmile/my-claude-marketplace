# sc-js

*Plugin JS pour Claude Code : détecte le stack du projet et charge le référentiel de connaissance adapté plutôt que d'appliquer des règles génériques à tout projet JavaScript.*

## État du projet

**Statut : 🧰 Beta.**

- *Ça marche aujourd'hui :* détection runtime (web / desktop), framework (Nuxt 3, Vue SPA, SvelteKit/Svelte, Vite, Alpine.js, Astro, 11ty), ORMs (Prisma, Drizzle, TypeORM, Mongoose, GraphQL, tRPC), audit via `aidd-dev:04-audit` (`code-quality`), migration Vue 2 → 3 / ESM / TypeScript, enseignement composables / réactivité / async
- *Pas encore :* React, Angular, Solid ; pivots routing (`vue-router`), i18n (`vue-i18n`), composables utilitaires (`@vueuse/core`), design system (UnoCSS, Tailwind)
- *Prochaine étape :* couverture des gaps les plus fréquents (routing, composables utilitaires)

## Pourquoi

- **Contexte au stack, pas universel** — seuls les pivots applicables au framework et aux libs détectés sont chargés pour l'audit
- **Zéro écriture de capability rules** — les pivots de connaissance vivent dans le plugin, pas dans le projet
- **Audit délégué à `aidd-dev:04-audit` / `code-quality`** — les pivots de stack complètent le rapport AIDD sans imposer un second format
- **Perf et data sur mesure** — `web-optimize` et `data-optimize` lisent des checklists adaptées au stack réel

Pertinent si tu travailles sur des projets Vue / Nuxt / SvelteKit / Vite / Alpine avec le framework aidd. Pas applicable pour React, Angular ou Solid — aucun pivot disponible.

## Prérequis

- Claude Code avec le framework aidd
- Plugin `aidd-dev` (requis par `/sc-js:audit`)
- Plugin `overcode` (requis par `/web-optimize` et `/data-optimize`)

## Démarrage rapide

```
/sc-js:sniff          → détecte le stack, installe les perf/data pivots
/sc-js:audit          → revue de code JS avec les pivots du stack détecté
/sc-js:improve        → analyse + plan d'amélioration ciblé
/sc-js:legacy         → migration Vue 2 → 3, ESM, TypeScript strict
/sc-js:teach          → explications composables, réactivité, patterns async
/sc-js:design-bridge  → réceptacle du pivot design (règle ESLint + composant Vue 3/React) — rend au gate chaque règle assignée, réalisée ou non ; possède le workflow de plateforme SPA (application à composants)
/sc-js:wp-blocks      → round-trip de validité des blocs Gutenberg (Playwright) pour markup FSE généré hors éditeur
/sc-js:cd local|server|automata → local reproductible, façade de production native et enveloppe CI/PaaS via overcode
```

## Utilisation

### `/sc-js:sniff`

Lit `package.json`, classe le runtime / framework / ORMs, émet un pivot manifeste et installe les perf/data pivots dans `.claude/rules/07-quality/`. Les capability pivots sont listés dans le manifeste mais **non écrits sur le projet**.

### `/sc-js:audit`

Reprend le manifeste émis par `sniff` (ou le recrée), charge les capability pivots depuis le plugin, puis invoque `aidd-dev:04-audit` avec le pilier `code-quality`. Le rapport AIDD reste l'artefact autoritatif ; la skill ajoute seulement une quittance par pivot.

### `/sc-js:legacy`

Couvre trois migrations : Options API → Composition API (Vue 2 → 3), passage à l'ESM natif, et montée en TypeScript strict.

### `/sc-js:cd`

Préserve le gestionnaire détecté et privilégie `pnpm deploy:prod` lorsqu'un lockfile pnpm possède le projet. Nuxt, Vue/Vite, SvelteKit, Astro et les services Node suivent leur build/runtime configuré ; SQL sépare migrations et données, tandis qu'IndexedDB livre uniquement le code de migration cliente. `automata` exige `overcode` et ne fabrique aucun fallback concurrent.

## Architecture des pivots

`sniff` distingue trois types de règles selon leur consommateur :

### Capability pivots — plugin uniquement

Les fichiers sous `skills/sniff/references/capabilities/` ne s'installent jamais dans le projet. Claude Code les charge depuis le plugin quand tu édites un fichier dont le chemin matche — le plugin est la source, le matching est fait par l'IDE/CLI au moment de l'édition. Aucun fichier de règle à maintenir côté projet.

### Perf et data pivots — installés dans le projet

Les fichiers `perf-pivots-*.md` et `data-pivots-*.md` sont copiés dans `.claude/rules/07-quality/` par `sniff`. Ils y sont parce que `web-optimize` et `data-optimize` les lisent explicitement à l'étape 2 de leur workflow :

> "Check installed plugin pivots first — scan `.claude/rules/07-quality/perf-pivots-*.md` for files matching the detected stack. If found → load them as the primary checklist source."

Si les fichiers sont absents, ces skills tombent en fallback sur un référentiel générique moins précis.

### Pivot de gouvernance `testing` — lu par un autre plugin

`skills/sniff/references/capabilities/tools/testing.md` est le seul pivot qui ne sert **ni** à `/sc-js:audit`, **ni** au matching par chemin : il est exposé par glob (`**/capabilities/**/testing.md`) sous la racine du plugin, à qui implémente le contrat de pivot. Il fournit la mécanique JS de gouvernance des tests — runners, glob des fichiers de test, commande de coverage, glob source, frontière d'ancrage (`Anchor boundary`), signaux de risque, gotchas d'outillage, résolution de domaine (`Domain resolution` — comment un domaine fonctionnel se lit dans l'arborescence et les identifiants JS/TS, jamais lesquels existent). Aujourd'hui `overcode:control` est le seul à le lire ; le fichier lui-même ne le sait pas, et c'est délibéré.

Ce que ce pivot **ne fait pas** : décider s'il faut écrire un test, ni où passe la frontière entre preuve ancrée et preuve interne. Il constate ce que la stack JS rend prouvable ; l'arbitrage et le plafond de coût appartiennent au consommateur.

### Résumé

| Type | Où ça vit | Qui le charge | Quand |
|---|---|---|---|
| Capability pivot | Plugin uniquement | Claude Code (automatique, via `paths:`) | À chaque édition de fichier matchant |
| Perf / data pivot | `.claude/rules/07-quality/` | `web-optimize` / `data-optimize` (explicite) | Au lancement du skill |
| Pivot `testing` | Plugin uniquement | Tout consommateur du contrat de pivot (découverte par glob) | À chaque action de gouvernance de tests sur un projet JS |

## Nettoyage des fichiers de règles orphelins

Un changement de structure des pivots peut laisser des fichiers orphelins dans `.claude/rules/capabilities/`. Pour nettoyer :

```
/sc-js:sniff clean --dry-run   → prévisualisation des suppressions
/sc-js:sniff clean             → suppression des fichiers orphelins
```

Le guard de contenu protège les fichiers modifiés manuellement — seuls les fichiers identiques à la référence plugin sont supprimés.

## Contribuer

Les retours sur les gaps de détection (libs non couvertes dans le manifeste) et sur la précision des pivots existants sont les plus utiles. Une issue avant PR pour les nouveaux pivots.

## CD multi-cibles

`sc-js:cd` conserve une seule façade du gestionnaire détecté et sélectionne une cible nommée. Le schéma SQL reste livrable, les données serveur et médias de production restent distants, et les migrations IndexedDB voyagent avec le code sans copier les données navigateur. Un staging peut refléter les surfaces persistantes uniquement avec une stratégie d'export/import ou d'inventaire prouvée.

Lorsqu'un artefact provient de Windows via DrvFs, ses bits de permissions ne sont jamais pris pour autorité Unix : la livraison doit soit préparer l'artefact sur un système de fichiers Linux natif, soit désactiver la préservation permissions/owner/group et appliquer des modes destination explicites. La livraison vérifie ensuite les modes d'un répertoire, d'un nouveau fichier et d'un fichier mis à jour.

Les champs `proof` et `recovery` doivent correspondre au comportement actuel du script projet. À chaque réconciliation, le skill relit ce script, lie les affirmations à des événements ordonnés et refuse notamment une preuve sans contrôle observable ou un rollback supprimé avant la fin de sa fenêtre annoncée.

## Licence

MIT — voir [LICENSE](../../LICENSE).
