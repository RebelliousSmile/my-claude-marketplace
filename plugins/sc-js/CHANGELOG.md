# Changelog — sc-js

## [0.17.3] — 2026-09-16

### Changed

- `cd automata` délègue son enveloppe de livraison à `overcode:deploy`.

## [0.17.2] — 2026-08-28

### Fixed

- `sc-js:audit` délègue à `aidd-dev:04-audit` avec le pilier `code-quality` et conserve le rapport AIDD comme artefact autoritatif ; le README reflète ce contrat.

## [0.17.1] — 2026-08-28

### Fixed

- Refuse la préservation des permissions, propriétaires et groupes issus de DrvFs vers Linux ; accepte un artefact Linux natif ou des modes destination explicites avec preuve post-transfert sur répertoire, nouveau fichier et fichier mis à jour.
- Relie désormais `proof` et `recovery` aux événements ordonnés du script réellement inspecté, et rejette une preuve décorative ou un rollback supprimé avant la fin de sa fenêtre annoncée.
- Ajoute six fixtures et un oracle sans dépendance pour reproduire ces décisions hors réseau.

## [0.17.0] — 2026-08-28

- CD v2 multi-cibles avec autorités distinctes pour code, schéma SQL, données serveur, IndexedDB et médias.

## [0.16.0] — 2026-08-28

### Added

- Skill `cd` pour réconcilier le local et une façade `deploy:prod` native, avec stratégies Nuxt, Vue/Vite, SvelteKit, Astro et Node.
- Contrats SQL/IndexedDB distincts et remise des enveloppes CI/PaaS à `web-tiers` sans dupliquer la procédure projet.

## [0.15.4] — 2026-08-06

### Fixed — la table `## Phases` du workflow SPA ne disait pas où ses phases s'insèrent

Trois phases `off-funnel` (servir la référence, build, déployer) sans point d'insertion déclaré : leur place dans la séquence de la classe était interprétée, pas dérivée. Colonne **`position`** renseignée pour les cinq lignes (`design` ≥ 2.11.0, `sc-pivot-contract.md § Déclaration de phase`) — `avant define`, `après diffuse`, `fin`, et `—` pour les deux phases qui instancient un verbe.

## [0.15.3] — 2026-08-05

### Fixed — le corps illustré de `Case A` se lisait comme la liste à reproduire (S8, rouge au run 3)

`sniff/02-install-pivots` posait sa clause de sortie sur le seul **en-tête** — *Pick the header by what actually happened* — et ne disait rien du corps. Le bloc *Case B* voisin, lui, porte `Use this header verbatim`. Le fichier posait donc une norme de copie littérale sur un bloc et **aucune contre-instruction sur l'autre** : un lecteur qui reproduit *Case A* énumère les cibles des tables au lieu de celles qu'il a écrites. C'est le contrôle négatif **S8** de `plugins/web-tiers/skills/setup/evals/pivot-install-scenarios.md`, laissé délibérément non jugé en 0.3.0 et rendu **FAIL** au run 3 sur les quatre installeurs `sniff`.

- **Marqueur d'exemple** sous chaque famille du bloc : `… one line per target actually processed`.
- **Contre-instruction** au-dessus du bloc : les blocs sont des *formes, pas des contenus*, et seuls les pivots que le manifeste liste sont traités — un projet détecté Vue SPA + Vite émet deux lignes, `perf-pivots-nuxt.md` et `perf-pivots-sveltekit.md` n'apparaissent **pas même en `skipped`**. C'est ici que le défaut portait le plus loin : **13 cibles** dans les tables, contre 9 pour `sc-python`, 6 pour `sc-php` et 4 pour `sc-rust` — donc le plus grand nombre de lignes à recopier à tort.
- **Les `(skipped — not applicable)` sont retirés du corps illustré.** Ils contredisaient la règle d'installation du fichier lui-même, qui boucle *For each pivot in the manifeste* : un pivot absent du manifeste ne peut jamais ressortir en `skipped`. Ajouter le marqueur ne suffisait pas — ce que l'exemple **montrait** était faux.

## [0.15.2] — 2026-08-03

### Fixed — la liste fermée de `sniff/03-clean` contenait un chemin que le plugin n'a jamais distribué

L'action de migration énumère les treize chemins que `sc-js 0.3.0` *pouvait* avoir installés, et ne supprime qu'un fichier dont le chemin figure dans cette liste. `.claude/rules/capabilities/styling/design-system.md` en faisait partie sans jamais avoir eu de fichier de référence dans le plugin — vérifié sur tout l'historique, `git log --all` ne connaît pas ce fichier. Jamais versionné, donc jamais installable par `0.3.0`. La liste passe à **12**, et les compteurs de l'exemple sont recalés.

**Conséquence pour un projet qui possède ce fichier** : il ne vient pas de `sc-js`, et `03-clean` ne le proposera plus à la suppression. C'est le bon comportement — le supprimer aurait détruit un fichier d'une autre provenance sous couvert d'une migration `sc-js`.

- **La garde de correspondance reçoit sa branche manquante.** Elle compare le contenu du candidat à la référence du plugin ; il n'était écrit nulle part ce qu'elle doit faire quand **aucune référence n'existe** pour ce chemin. Elle passe le fichier et le rapporte, plutôt que de supprimer du contenu non vérifié. C'est ce silence qui rendait le treizième chemin dangereux et non seulement faux.

## [0.15.1] — 2026-07-30

### Changed — le pivot `testing` déclare le prérequis d'outillage de sa couverture

Mise en conformité avec la section `## Prerequisites` du contrat (`overcode` 4.2.0, DEC-009) : un prérequis constaté absent vaut champ absent pour ce run, et c'est au pivot de nommer le prérequis et la commande qui le constate. Bloc **Prérequis** ajouté avant les trois règles d'usage — `@vitest/coverage-v8` pour Vitest, et le marquage explicite de ce qui n'a pas été rejoué : le projet mesuré portait le paquet, son absence n'a pas été observée en exécution, et le prérequis Jest n'a pas été mesuré du tout. Rendre le non-vérifié visible plutôt que de le laisser passer pour vérifié.

## [0.15.0] — 2026-07-30

### Added — le pivot `testing` fournit `Domain resolution`, jusqu'ici sans aucun fournisseur

Le contrat de pivot définit ce champ depuis sa refonte : **comment une stack exprime un domaine fonctionnel** dans le système de fichiers et dans les identifiants. Aucun pivot ne le remplissait — celui-ci portait neuf sections, dont aucune n'était celle-là. Le champ est optionnel, donc son repli s'appliquait partout sans erreur ; c'est le silence qui coûtait, pas l'échec. Les prochains pivots l'auraient chacun réinventé de leur côté.

- **Trois voies, dans l'ordre de fiabilité décroissante** : les répertoires (routing par système de fichiers, découpe `features/<domaine>/`, workspaces de monorepo, layers Nuxt), les identifiants (suffixes `*.service.ts`/`*.guard.ts`, symboles `use<Domaine>Store`/`<Domaine>Repository`, premier segment sous `server/api/`), puis les prudences.
- **La découpe par couche ne porte pas le domaine** — `controllers/`, `services/`, `stores/`, `composables/`, `server/api/` sont des couches. Un arbre exclusivement en couches n'expose aucun domaine par ses répertoires, et c'est le cas ordinaire d'un backend Express : la section le dit plutôt que de laisser déduire un domaine d'un nom de couche.
- **Les segments techniques sont nommés** — dynamiques (`[id]`, `[...slug]`), groupes sans effet d'URL (`(group)`), fichiers de rôle (`+page`/`+layout`, `layout.tsx`). Sans cette liste, un routeur file-based rend un « domaine » par segment, dont plusieurs n'en sont pas un.
- **Un fichier de test se rattache au domaine du fichier qu'il exerce**, pas à son propre emplacement — une suite entière peut vivre sous `tests/` sans qu'un seul segment de son chemin porte un domaine.
- **Aucune liste de domaines**, conformément au contrat : le champ répond *comment les trouver ici*, jamais *lesquels existent*, et il complète une résolution déjà énoncée sans jamais primer sur elle. Il reste distinct de `Source glob & exclusions` — l'un est structurel, l'autre sémantique.
- `README.md` § *Pivot de gouvernance `testing`* énumère le champ ajouté.

Mineure et pas corrective : un champ apparaît, aucun ne change ni ne disparaît. Aucun consommateur n'a à être modifié — le repli documenté cesse simplement de s'appliquer à cette stack.

## [0.14.1] — 2026-07-30

### Fixed — l'entrée 0.14.0 sous-déclarait ce qui a été fait au pivot

Elle dit *« le contenu est conservé tel quel »* du champ renommé `Anchor boundary`. **Faux** : le même commit a retiré de la section les attributions de tier (`→ toujours contract`, `→ e2e`) et l'argument de budget, et lui a donné son ouverture actuelle — *« Ne nomme aucun tier, et n'en dérive aucun »*. Seul le **savoir de position** est conservé : l'émulateur qui n'ancre pas, le mismatch d'hydratation que seul le navigateur réel établit, le handler Nitro appelable en process. Le retrait n'est pas un détail de rédaction, c'est ce qui met le pivot en conformité avec la borne du contrat (`pivot-contract.md:24`).

Aucun fichier de pivot ne change ici — il est déjà correct. Ce qui change est ce que le journal en dit. Un correctif sous-déclaré est un correctif qu'on refait : sur la foi de cette phrase et d'une lecture du **cache installé** plutôt que de la source, le champ a été rouvert comme non conforme deux jours plus tard. Même rectification dans DEC-007 §3 et dans les journaux d'`overcode` et du marketplace.

## [0.14.0] — 2026-07-30

### Changed — le pivot `testing` cesse de nommer son consommateur

Livré dans le même commit que `overcode` 4.0.0 : le contrat de pivot est une interface publique (DEC-004 §5), et une interface ne peut pas diverger de sa seule implémentation le temps d'une version.

- **`## Tier thresholds` devient `## Anchor boundary`** (`sniff/references/capabilities/tools/testing.md`). Le champ était mal nommé : il ne fixe aucun seuil et n'attribue aucun tier — il dit où passe, dans cette stack, la frontière entre une preuve **ancrée** (qui traverse la frontière publique réelle du produit) et une preuve **interne** (qui reste en processus). Le contenu est conservé tel quel. DEC-007 lui retire l'autorité de classement que DEC-004 §4 lui donnait, et la nouvelle borne est explicite : ce champ raffine la **position** de la frontière, jamais la preuve exigée.
- **Onze mentions du consommateur retirées, et il n'en reste aucune** — huit occurrences de `strengthen`, une de `configure`, une d'`overcode:control` (le préambule du fichier), une de `phase-framework.md` (le renvoi d'arbitrage en fin de section *External contract dependency*). Le décompte annoncé d'abord ici était **huit**, sur les seules occurrences de nom d'action ; il ratait le préambule et le renvoi, c'est-à-dire les deux endroits où le fichier nommait son lecteur en toutes lettres plutôt qu'à travers une de ses actions. Le compte exact est vérifié contre le dernier commit, pas reconstitué de mémoire. C'est la règle transversale du modèle : *le pivot déclare ce qu'il fournit, jamais qui le consomme*. Un champ qui nomme son consommateur s'attribue un droit d'usage exclusif que le contrat ne lui donne pas, et empêche mécaniquement toute autre skill de lire un fait vrai de la stack. Les faits n'ont pas bougé d'un mot : `--coverage.reportOnFailure` reste non optionnel, `covered`/`total` reste ce qui se lit à la place de `pct` seul, un fichier du glob absent du rapport reste **non couvert et pas inexistant**. Seule la phrase qui désignait le lecteur a disparu.
- **`README.md` § *Pivot de gouvernance `testing`* aligné sur le fichier qu'il décrit.** Il annonçait des « seuils de tier » — un champ qui n'existe plus sous ce nom — et présentait `overcode:control` comme le destinataire du pivot. Il décrit désormais ce que le pivot expose et par quel glob il est découvrable, et mentionne `control` pour ce qu'il est : le seul lecteur **à ce jour**, un fait d'écosystème que le README a le droit de constater et que le pivot, lui, n'a pas le droit de savoir. La distinction n'est pas cosmétique : c'est le fichier de données qui doit rester lisible par n'importe qui, pas la documentation d'architecture qui doit taire son terrain.
- **Un signal de mauvais câblage n'est plus adressé à une action nommée.** La coexistence de `vitest` et `jest` en devDependencies était « à remonter côté action `configure` » ; elle est désormais « un signal de mauvais câblage d'outillage à remonter ». Ce qui est détecté est une propriété du projet, pas une commande à passer à quelqu'un.

## [0.13.2] — 2026-07-28

### Changed

- **Les titres `H1` des actions ne portent plus leur numéro** — `# Explain`, plus `# Action 01 — explain`. Le numéro vivait à trois endroits, il n'en occupe plus que deux : le nom de fichier et la table de `SKILL.md`, que le gate de cohérence du marketplace compare désormais. Changement transversal aux onze plugins, détaillé dans le journal du marketplace (3.4.0).

## [0.13.1] — 2026-07-27

### Fixed — README décrivait une migration de version au lieu de l'existant

- **`README.md § Migration depuis 0.3.0`** renommée en « Nettoyage des fichiers de règles orphelins » — la commande `sniff clean` reste documentée, mais sans l'ancrer à un numéro de version passé (rôle du CHANGELOG, pas du README).

### Fixed — discipline de sévérité (l'audit alimente des mutants)

Même correctif transversal que sc-css/sc-rust/sc-php/sc-python. `improve/01-analyze` et `legacy/01-scan` sont read-only mais alimentent `02-plan`→`aidd-dev:implement` et `legacy/02-migrate` (mutants). Correction **inline**, conditionnée à une propriété **mesurée**. (Classe C absente : `no-unused-vars` reste un `warn`, jamais un verdict de code mort prouvé.)

- **(A) Verdict sur propriété supposée → mesurée.** Le **système de module se mesure par fichier**, pas par dépôt : un `.cjs`/`.cts` reste CommonJS même sous un `package.json` en `"type": "module"` — `require()` n'y est plus flagué. Le tree-shaking cassé par `import * as` est un **comportement de bundler**, pas une propriété du source : ne plus l'affirmer sans bundler mesuré (`improve/01-analyze.md`, `legacy/01-scan.md`, `legacy/02-migrate.md`).
- **(B) Sévérité alimentant la mutation — la pire ici.** « Unhandled promise rejection » était émis 🔴 et routé en Priorité 1 vers l'implémenteur, qui injecte `await`/`.catch`. Or « non géré » n'est **pas décidable au scan** (handler global, `await` amont, fire-and-forget voulu) et l'`await` ajouté **change le flux de contrôle**. Rétrogradé en 🟡 « à décider » ; `Promise.all` vs `allSettled` de même (sémantique voulue, pas grep-décidable) (`improve/01-analyze.md`, `improve/02-plan.md`).
- **(E) Le moteur d'analyse mal-juge les constructions qu'il recommande.** Les deux regex de détection de la non-null assertion `!` capturaient le **NOT logique** que TypeScript recommande : `[^!=]![^=]` attrape `if (!x)`, et le jumeau `!\w` matche `!foo` (exactement l'inverse de l'assertion `foo!`). Resserrés pour exiger un identifiant/`)`/`]` **avant** le `!`, avec mention explicite que c'est un signal à confirmer (`sniff/references/capabilities/typescript.md`, `legacy/references/typescript-strictness.md`).

## [0.13.0] — 2026-07-25

### Reçu du pivot design (design 2.5.0 — verbe 0 `detail`)

- **`design-bridge/references/workflow-spa.md`** (nouveau) — ce pivot possède désormais le **workflow de plateforme SPA** (application à composants : SFC Vue, composant React), sous le squelette figé par `plugins/design/references/sc-pivot-contract.md § Workflow de plateforme` (cinq titres, déclaration de phase input/output/verbe, prérequis en capabilities). Il instancie les classes de cas agnostiques de `design:detail` : phases `enforce`/`diffuse` natives + phases `off-funnel` (build, mise en ligne). `design:detail/02-route` l'étend à la classe quand ce pivot est installé et la stack correspond. Un workflow de plateforme est un COMMENT : il vit dans le pivot, jamais dans `design` (dec-002).
- **`design-bridge/SKILL.md`** — section « Workflow de plateforme (application à composants / SPA) » + référence ajoutée.

## [0.12.0] — 2026-07-24

### Reçu du pivot design (design 2.2.0)

- **Obligation de report** (`design-bridge/SKILL.md`) — toute règle reçue en `Declared rules` est rendue au gate, réalisée ou non, au format `plugins/design/references/gate-config-schema.md § Rapport de pivot`. Cas fréquent ici : les **liaisons dynamiques** (`:class`, `class:list`, `x-bind:class`, chaînes calculées). Une règle dont la preuve n'est lisible qu'à l'exécution ne se réalise pas par AST — elle se déclare `unrealized`. Sans cette déclaration, elle est indistinguable d'une règle oubliée.
- **`design-bridge/actions/01-realize-lint.md § Étape 2`** — le hook pre-commit n'est plus étendu par ce pivot. Il exécute la **commande unique du gate**, identique en local, en pre-commit et en CI (`design/skills/enforce/references/gate-wiring.md § La commande unique`) ; un second linter appelé à côté produirait un deuxième verdict que rien n'agrège. L'étape écrit désormais le rapport et le branche dans `gates.config.json § pivotReports` avec un `command`, pour que le runner relance la vérification avant de lire.

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
