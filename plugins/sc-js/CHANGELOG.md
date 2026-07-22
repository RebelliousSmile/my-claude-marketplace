# Changelog — sc-js

## [0.11.0] — 2026-07-22

### Pivot `testing` — frontières externes

- **`Risk signals`** — le champ porte désormais les **frontières externes de la stack** : SDK tiers chargés côté client, conteneurs de tags, clients d'API sortants, webhooks. Elles alimentent le critère de dépendance à un contrat externe d'`overcode:control` (3.5.0), qui détient le critère mais pas l'inventaire — quelles intégrations existent dans une stack donnée est une connaissance de stack, et c'est déjà le rôle de ce champ. Aucun champ nouveau : le contrat de pivot est inchangé.
- **Gotcha** ajouté — une majeure de SDK tiers déplace un contrat externe sans qu'une ligne du dépôt ne bouge : aucun signal interne ne se déclenche, et le test qui couvrait le chemin dégradé continue de passer contre une réalité qui a changé.

## [0.10.0] — 2026-07-22

### Pivot `testing` — exploitable par `strengthen`

- **`Coverage command`** — sort de la ligne « Test runner(s) » et devient une section à part entière, avec les commandes **vérifiées sur un projet réel** (Vitest 4.1.0 / `@vitest/coverage-v8`, 55 fichiers, 1829 tests) et le chemin du fichier produit (`coverage/coverage-summary.json`, une entrée par fichier avec `{total, covered, skipped, pct}` pour lignes, branches, fonctions et instructions). Trois règles d'usage adossées à des pièges constatés : `--coverage.reportOnFailure` obligatoire (un seul test rouge supprime sinon tout le rapport), code de sortie à ignorer (les seuils sont évalués après l'écriture des rapports), et lecture de `covered`/`total` jamais de `pct` seul.
- **`Source glob & exclusions`** — définit le code de production classable de la stack (`src/`, `lib/`, et pour Nuxt `composables/`, `stores/`, `server/api/`, `middleware/`…) et ce qui ne l'est jamais (artefacts de build, config, `*.d.ts` et code généré, barrels de réexport, fixtures, stories). C'est ce glob qui définit l'univers classé par `strengthen` : le rapport de coverage ne fait que l'enrichir, un fichier du glob absent du rapport est **non couvert**, pas inexistant.
- **`Risk signals`** — ce qui est structurellement à forte conséquence en JS (argent, autorisation et règles Firestore, persistance destructrice, entrées externes non maîtrisées, état transverse Pinia, routes Nitro exposées) et ce qui ne mérite structurellement pas de test propre (pass-through de framework, getters triviaux, glue générée). **Priorisent sans jamais classer un tier** — l'autorité de tier reste `Tier thresholds`.
- **Quatre gotchas d'outillage** ajoutés aux trois axes problème/détection/correctif : rapport de coverage supprimé par un test rouge, fichiers non testés absents du rapport sans `coverage.include` (`coverage.all` ayant été supprimé en Vitest 4), `pct` à 100 % trompeur sur un fichier sans branche, et race `ENOENT coverage/.tmp/` du provider v8 à ne pas confondre avec une absence d'outillage.
- Titres de section maintenus en anglais, alignés mot pour mot sur les noms de champ du contrat de pivot d'`overcode:control` : aucune liste de correspondance n'est nécessaire côté `sc-js`.

## [0.9.0] — 2026-07-21

### Nouveau pivot — `testing` (gouvernance de tests)

- **`skills/sniff/references/capabilities/tools/testing.md`** — premier pivot du plugin destiné à un **autre plugin** : il n'est lu ni par `/sc-js:audit` ni par le matching par chemin, mais découvert par glob (`**/capabilities/**/testing.md`) par la skill `control` d'`overcode`. Fournit les mécaniques JS de gouvernance des tests : runners Vitest/Jest et Playwright, glob des fichiers de test, commande de comptage, raffinements de tier (générique JS/TS, Nuxt, Firebase) et gotchas d'outillage. Ne décide jamais s'il faut écrire un test — c'est `control` qui décide, le pivot ne fait que raffiner pour la stack.

## [0.8.0] — 2026-06-24

### Nouvelle skill — `wp-blocks` (validation de blocs Gutenberg)

- **Round-trip de validité** : ouvre chaque page/article dans l'éditeur (Playwright) et asserte que tout bloc natif statique survit au cycle parse → `save()` → compare. Cible les projets WordPress FSE où le `post_content` / les patterns sont **générés hors éditeur** (chaînes PHP, scripts d'import) — le frontend masque les blocs invalides, seul l'éditeur les détecte.
- Action `01-validate-roundtrip` : script `gutenberg-validate.mjs` réutilisable (énumération REST des pages+posts, login admin, lecture récursive de `wp.data … getBlocks().isValid`, rapport page · type · markup fautif, exit 1 si ≥ 1 invalide), gate `qa:blocks`.
- Distingue `core/missing` (bloc non enregistré) de l'invalidité `save()`. Orthogonal au lint design system et au diff texte/visuel — les trois sont complémentaires.
- Issu de la session fidélité maquette Mauceri : `diff-all` (texte) et `ds-lint` (vocabulaire) ne voient pas un markup cassé pour l'éditeur ; il manquait ce juge.

## [0.6.8] — 2026-05-29

### Capability pivot — perf/vanilla.md

- **§2 LCP** : ajout d'un cas explicite pour les `<img>` dont le `src` est absent du HTML brut (défini dynamiquement par JS) — le preload scanner est aveugle et le LCP est potentiellement retardé de plusieurs centaines de ms. Corriger : `src` statique par défaut dans le HTML + surcharge JS, ou `<link rel="preload">` mis à jour en JS en même temps que le `src`. Commande de détection ajoutée.
- **§8 INP/TBT** : `{passive: true}` maintenant documenté comme **obligatoire** sur `scroll` et `touchstart` — sans cet option le navigateur attend la fin du handler avant de scroller (jank tactile, TBT dégradé). Commande de détection ajoutée.

> Learnings issus du premier audit `web-optimize` sur un projet vanilla réel (SmartLockers/multisite-clients, 2026-05-29).

## [0.6.7] — 2026-05-29

### audit

- **Step 3 — review targets are now stack-aware**, not Vue-biased. A table maps each detected stack (Vue/Nuxt, SvelteKit, Alpine, **vanilla web**, Node backend) to its typical targets, with linter/test config and `tests/` always included. Vanilla web explicitly covers `*.html` inline styles/scripts and JS-generated DOM.
- **`quality_score` now uses a fixed rubric** (reproducible across runs): 100 − 10×major − 3×minor, floored at 0; N/A pivots cost 0. The reviewer must show the arithmetic.
- **Per-pivot status table is now mandatory** — one row per loaded pivot (`✅ verified` / `⚠️ N major · M minor` / `➖ N/A`), so the completion claim is auditable at a glance, not only the clean pivots.
- **Removed the hard-coded `sc-js 0.4.0` version string** from the criteria-document example.

### Capability pivot

- **`tools/playwright.md` reframed: perf measurement + functional-E2E reliability.** Most projects use Playwright for functional E2E, not perf — the pivot now has a dedicated reliability section (ban `waitForTimeout`, resilient role/testid selectors, test isolation, web-first assertions). A perf pivot against a purely functional suite is N/A, not a violation.

## [0.6.6] — 2026-05-29

### sniff

- **Vanilla web now has a perf pivot.** New `perf/vanilla.md` (§0–§11) — render-blocking scripts, native lazy-loading, `<script type="module">` code-splitting, `requestIdleCallback`/INP, manual caching with `gulp-rev`. Installed as `perf-pivots-vanilla.md` for framework-less web projects (Gulp/BrowserSync/manual bundle), consumed by `web-optimize` like any other perf pivot.
- **`01-scan` Step 5 — `styling/css-transitions.md` now applies to vanilla web.** The condition wrongly required a framework (`runtime = "web"` *(frontend framework detected)*); it now matches any `runtime = "web"`, framework or vanilla. CSS transitions were being silently dropped from the manifeste of framework-less projects.
- **`01-scan` Step 3 — `✅ Vanilla web` line is now mandatory in the structured Framework block**, not only in the prose summary.

### New capability pivot

- **`perf/vanilla.md`** — perf overrides for browser projects with no JS framework.

## [0.6.5] — 2026-05-29

### sniff

- **`02-install-pivots` — explicit no-op output.** No longer prints `✅ pivots installed` when nothing was written. New headers: `nothing to install` (no applicable perf/data pivot, e.g. vanilla web) and `pivots up-to-date` (all already current).
- **ESLint detection** — `eslint` in devDependencies now maps to the new `tools/eslint.md` pivot, restoring symmetry with Biome (the dominant linter was previously sunk into the tooling/infra bucket).
- **`01-scan` Step 6 — companion-package dedup.** Satellites of an already-covered pivot (e.g. `@vitest/coverage-v8` under `tools/vitest.md`, `@eslint/js`/`globals` under `tools/eslint.md`, `playwright-core` under `tools/playwright.md`) are dropped instead of re-listed as gaps.

### New capability pivot

- **`tools/eslint.md`** — flat config (ESLint 9+), `@eslint/js`/`globals`, CI (`--max-warnings=0`), Prettier coexistence, anti-patterns.

## [0.6.4] — 2026-05-29

### sniff

- **`01-scan` Step 6 — gaps sorted into three buckets.** Capability gaps (pivot candidates) are still listed exhaustively; tooling/infra (build systems, dev servers, test runners, env loaders, DOM emulators) is condensed one line per family; private/workspace packages are **excluded** by scope-matching the project's own `@scope/` (plus `workspace:`/`file:`/`link:` deps). Stops internal monorepo packages and build tooling from drowning out the actionable signal.
- **`01-scan` Step 3 — "Vanilla web (no JS framework)" is now a formal classification.** No more improvised labels like "Gulp SPA": Gulp/BrowserSync are named as build/dev tooling for context only, and the absence of a vanilla perf pivot is documented as expected, not a defect.
- **Vitest detection** — `vitest` in devDependencies now maps to the new `tools/vitest.md` pivot instead of being reported as a gap (parity with the existing Playwright/Biome tooling pivots).
- **Closing-summary constraint** — any free-text summary must not call something a "gap" if it appears in the pivot manifeste; the structured manifeste is authoritative.

### New capability pivot

- **`tools/vitest.md`** — Vitest config, `@vitest/coverage-v8` thresholds, CI (`vitest run`) vs watch modes, anti-patterns.

## [0.6.3] — 2026-05-28

- **Alpine.js component pivot** (`components/alpine-x-data.md`) and **Express MVC pivot** (`server/express-mvc.md`) added, with detection wired into `sniff`.
- **`01-scan` Step 5 — invented pivots forbidden.** A pivot path is only added to the manifeste after verifying the file physically exists in the plugin; otherwise the capability is reported as a gap.

## [0.6.2] — 2026-05-28

- **`01-scan` Step 5 — pivots decided from `package.json` only**, never by inspecting source files. The sniff maps what is available; `/sc-js:audit` decides whether a pattern is missing or misused.
- **`/sc-js:audit` fixes** — all applicable pivots reported as covered, fixed severity scale, and a score with explicit breakdown.

## [0.6.1] — 2026-05-28

- **Playwright perf pivot** (`tools/playwright.md`) + detection — Core Web Vitals measurement, network/CPU throttling, trace capture, Lighthouse integration.
- **`01-scan` Step 2 — `node` runtime for pure backends** (Fastify/Express/Koa/NestJS with no frontend framework) — avoids applying browser-specific pivots to Node.js APIs.
- **`01-scan` Step 3 — SvelteKit adapter detection** (reads `svelte.config.*`) and **Step 6 — exhaustive gaps** that no longer go silent between runs.

## [0.6.0] — 2026-05-28

- **SvelteKit perf pivot** (`perf/sveltekit.md`) with `ssr/storage-guards.md`, adapter-static vs adapter-node guidance.
- **Svelte stores pivot** (`state/svelte-stores.md`) — writable/derived/readable, auto-subscription, anti-patterns.
- **Biome pivot** (`tools/biome.md`) — config, CI (`biome ci`), pre-commit, anti-patterns.
- All three wired into `sniff` (and `improve`) detection.

## [0.5.6] — 2026-05-28

- **`legacy` skill** — added Svelte 4→5 runes and SvelteKit 1→2 migration references.

## [0.5.5] — 2026-05-28

- **`improve` Step 1.5** — wired 5 previously-missing capability pivots, added SvelteKit detection.

## [0.5.4] — 2026-05-28

- **`improve` Step 1.5** — load applicable capability pivots so stack-specific anti-patterns are checked during improvement.

## [0.5.3] — 2026-05-28

- **TypeScript capability pivot** (`typescript.md`) — detected in `sniff`, guarded in `improve`.

## [0.5.2] — 2026-05-28

- **Guard against installing capability rules** — reinforces the 0.4.0 contract that capability pivots are read from the plugin at audit time, never written to the project.

## [0.5.1] — 2026-05-28

- **`legacy` skill references** added (migration knowledge files).

## [0.5.0] — 2026-05-28

- **New skills: `improve`, `legacy`, `teach`.** `improve` applies stack-specific fixes, `legacy` handles framework migrations, `teach` explains JS patterns.

## [0.4.0] — 2026-05-28

### Breaking changes

- **sniff no longer installs capability rules to `.claude/rules/capabilities/`**. In 0.3.0, `sniff` would write files like `.claude/rules/capabilities/state/pinia.md` to the project. In 0.4.0, those files are loaded from the plugin at audit time — never installed.
- **`skills/setup` removed**. The install-all setup skill is gone. Use `sniff` (detector) and `audit` (code review) instead.
- **`02-sync` action renamed to `02-install-pivots`**. Scope is now restricted to perf and data pivots only.

### New features

- **`/sc-js:audit`** — new skill that detects the project stack, loads applicable JS capability pivots from the plugin, and delegates a structured code review to `aidd-dev:reviewer`. Zero file writes.
- **`03-clean` migration action** — opt-in migration tool to remove orphaned `.claude/rules/capabilities/*` files left by sc-js 0.3.0. Safe: only deletes files whose content matches the plugin reference exactly (content-match guard). Invoke explicitly with `/sc-js:sniff clean`.

### Preserved

- Perf pivots (`perf-pivots-*.md`) and data pivots (`data-pivots-*.md`) are still installed to `.claude/rules/07-quality/` by `02-install-pivots`. The `web-optimize` and `data-optimize` contract is unchanged.

### Migration from 0.3.0

1. Reload the plugin (Claude Code: `/reload-plugins`)
2. Run `/sc-js:sniff` on your project — emits pivot manifeste and installs perf/data pivots as before
3. Optionally clean up orphaned capability rules: `/sc-js:sniff clean --dry-run` to preview, then `/sc-js:sniff clean` to delete

If you have manually edited any `.claude/rules/capabilities/` file, `03-clean` will detect the content mismatch and skip it — your edits are safe.

## [0.3.0]

Capability-based rules: sniff detects runtime/framework/ORMs and installs matching coding rules.

## [0.2.0]

Flat rule files install model.
