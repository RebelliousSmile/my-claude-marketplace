# Changelog — sc-css

## [0.7.2] — 2026-09-16

### Changed

- `cd automata` délègue son enveloppe de livraison à `overcode:deploy`.

## [0.7.1] — 2026-08-28

### Fixed

- Les délégations fournisseur et CI de `sc-css:cd automata` pointent vers le plugin renommé `web-tiers`; le README et les scénarios utilisent le même namespace.

## [0.7.0] — 2026-08-28

- CD v2 multi-cibles : artefact statique partagé, cache/preuve/récupération par cible et refus des surfaces mutables.

## [0.6.0] — 2026-08-28

### Added

- Skill `cd` avec interface `local`, `server`, `automata`, façade statique native et contrat projet portable.
- Propriété bornée : sc-css possède les sites statiques purs et reste contributeur d'assets dans les applications pilotées par une stack de langage.

## [0.5.0] — 2026-08-14

### Added

- Support des stacks composites : `Output dir` peut viser les assets publics d'un thème et l'entrée charge tokens, composants puis adapter de plateforme.
- Transmission des feuilles réellement contrôlées au gate runtime de propriété de cascade.

### Changed

- `fse-bindings.css` reste produit par le pivot WordPress et linté par sc-css ; le rapport stylesheet demeure une preuve statique et ne revendique plus le gagnant rendu.

## [0.4.1] — 2026-08-06

### Fixed — la table `## Phases` du workflow statique ne disait pas où ses phases s'insèrent

Deux phases `off-funnel` (servir la référence, déployer) sans point d'insertion déclaré : leur place dans la séquence de la classe était interprétée, pas dérivée. Colonne **`position`** renseignée pour les quatre lignes (`design` ≥ 2.11.0, `sc-pivot-contract.md § Déclaration de phase`) — `avant define`, `fin`, et `—` pour les deux phases qui instancient un verbe.

## [0.4.0] — 2026-08-03

### Removed — `sniff/02-install-pivots` et les six pivots qu'elle promettait

L'action déclarait six pivots à installer dans `.claude/rules/07-quality/`. **Aucun des six n'existait dans le plugin** — ni fichier de référence, ni contenu d'aucune sorte. La procédure décrivait en détail une comparaison de versions, une écriture conditionnelle et un signalement `❌ non disponible dans le plugin` pour une population qui était intégralement dans ce dernier cas.

Les six cibles retirées, sous la forme du fichier qu'un projet aurait vu apparaître :

- `sc-css-custom-props.md` · `sc-css-layers.md` · `sc-css-specificity.md`
- `sc-css-float-legacy.md` · `sc-css-prefixes.md` · `sc-css-prepro-vars.md`

**`sc-css` n'installe donc aucun fichier de règle dans un projet**, et c'est désormais l'énoncé du plugin — dans le `SKILL.md` de `sniff`, dans son unique action, et dans le `README.md`. Le savoir CSS est porté par les actions d'`audit`, `improve` et `legacy` ; il n'a jamais transité par un pivot installé. Ce n'est pas une régression de couverture : rien n'était installé avant non plus.

- **La clé `pivots_recommended` disparaît du manifeste `css-pivot.json`.** Ses trois valeurs d'exemple (`improve/custom-properties`, `improve/cascade-layers`, `legacy/float-to-flex`) ne résolvaient vers aucune action réelle, et plus aucun lecteur n'écrivait à partir d'elle. Le manifeste décrit l'état mesuré, rien d'autre.
- **Les suites sont nommées comme des skills, jamais comme des fichiers à installer** — le rapport de `01-scan` renvoie vers `/sc-css:improve` et `/sc-css:legacy`.

**Conséquence pour un projet** : `/sc-css:sniff` ne propose plus d'installation et n'a plus qu'une action. Un projet qui l'aurait lancée n'a jamais rien reçu ; il n'y a donc rien à désinstaller.

## [0.3.3] — 2026-07-28

### Changed

- **Les titres `H1` des actions ne portent plus leur numéro** — `# Explain`, plus `# Action 01 — explain`. Le numéro vivait à trois endroits, il n'en occupe plus que deux : le nom de fichier et la table de `SKILL.md`, que le gate de cohérence du marketplace compare désormais. Changement transversal aux onze plugins, détaillé dans le journal du marketplace (3.4.0).

## [0.3.2] — 2026-07-27

### Fixed — discipline de sévérité de l'audit (6 trous)

Chaque dimension présupposait une propriété du monde puis sur-affirmait la sévérité quand cette propriété était fausse. Correction **inline dans les actions** (pas de section de principes ; le verdict est conditionné à une propriété *mesurée* de la preuve, jamais à la plateforme). Rationale des six correctifs :

- **`!important` = `error` → conditionné à la topologie de layer mesurée** (`audit/actions/01-audit.md § 01`, `improve/SKILL.md § cascade-layers`). Hors d'un hôte layered, `!important` est un override porteur : dans la cascade, `important-unlayered`/`important-layered` battent le `normal-unlayered`, lui-même au-dessus de toute layer. Le marquer `error` poussait `improve` à le retirer et à casser l'override. Symétriquement, enrôler du CSS en `@layer` sous un hôte unlayered le fait descendre *sous* les styles hôtes — capability contre-indiquée tant que l'hôte n'émet pas en layer.
- **Moteur de spécificité honorant `:where()` / `:is()` / `:has()`** (`§ 01`). Un comptage à plat fabrique de faux conflits sur le code moderne que la dimension 05 recommande précisément.
- **ID / profondeur : `error` → `warning`, sélecteurs possédés seulement** (`§ 01`). Un id injecté par l'hôte/un tiers n'est ni renommable ni sûr à aplatir.
- **Code mort : jamais « mort », `warning` → `info: non-référencé dans les sources scannées`** (`§ 02`). Un scan statique ne voit pas les classes composées à l'exécution, le contenu stocké ni les noms runtime ; le glob scanné est déclaré dans le finding.
- **Magic numbers : rapprochement par rôle sémantique avec tolérance de proximité → `warning`, jamais `error`** (`§ 03`). Un rayon autour de chaque token (`ΔE ≤ 2` pour les couleurs en distance perceptuelle, `±1px`/`±3 %` pour espacement/typo) attrape les valeurs presque-égales : le but est l'**uniformité** — des littéraux éparpillés (`15px`/`16px`/`17px`) que l'égalité stricte laisserait invisibles en `info`. Verdicts : `warning: remplacer par var` si identique (rendu inchangé, auto-applicable) · `warning: proche — uniformité` si dans le rayon (rendu changerait → validation humaine) · liste si plusieurs tokens dans le rayon · `info` hors rayon (one-off légitime). Décision de politique : proximité ≠ faute *prouvée*, donc `warning` (« regarde »), jamais `error` (« c'est faux ») — ce qui protège `improve`/`legacy` d'un faux positif mutable, le garde-fou de rendu d'`improve` interdisant par ailleurs tout remplacement silencieux qui changerait le rendu.
- **Contraste WCAG : calculé seulement sur couleurs résolues, opaques, appariées, mono-thème** (`§ 04`). Sinon `info: non calculable` — posture alignée sur le plugin design, qui déclare le contraste comme gap non vérifié. Focus et `prefers-reduced-motion` résolus contre la cascade globale, pas le même sélecteur.

Transversal : l'audit read-only alimente `improve`/`legacy` (mutants), donc toute indécidabilité est portée dans la **sévérité** (`info`), jamais dans une note ignorée par le pipeline.

## [0.3.1] — 2026-07-25

### Fixed
- **`README.md` créé** — le plugin n'avait jamais eu de README, contrairement à tous ses pairs `sc-*` ; absent aussi de l'index et de la table de référence rapide du README racine. Les six skills (`sniff`, `audit`, `improve`, `legacy`, `teach`, `design-bridge`) étaient donc invisibles depuis la documentation du marketplace bien qu'installables.

## [0.3.0] — 2026-07-25

### Reçu du pivot design (design 2.5.0 — verbe 0 `detail`)

- **`design-bridge/references/workflow-static.md`** (nouveau) — ce pivot possède désormais le **workflow de plateforme statique** (cible sans runtime : custom properties, feuilles BEM, cascade layers), sous le squelette figé par `plugins/design/references/sc-pivot-contract.md § Workflow de plateforme` (cinq titres, déclaration de phase input/output/verbe, prérequis en capabilities). Il instancie les classes de cas agnostiques de `design:detail` : phases `enforce`/`diffuse` natives + phase `off-funnel` de mise en ligne sur hôte statique. `design:detail/02-route` l'étend à la classe quand ce pivot est installé et la stack correspond. Un workflow de plateforme est un COMMENT : il vit dans le pivot, jamais dans `design` (dec-002).
- **`design-bridge/SKILL.md`** — section « Workflow de plateforme (feuilles de style seules / statique) » + référence ajoutée.

## [0.2.0] — 2026-07-24

### Reçu du pivot design (design 2.2.0)

- **`design-bridge/actions/03-realize-lint.md`** (nouveau) — réalisation native des règles de type `stylesheet` : celles dont la preuve est **les feuilles de style réellement chargées**, sélecteurs compris. Le cœur portable de `design:enforce` scanne du markup fichier par fichier ; il ne peut ni résoudre une cascade ni voir un second `:root` redéclarant une custom property du contrat — le cas le plus destructeur, puisque le markup reste littéralement conforme pendant que la valeur dérive. Le périmètre est déclaré (feuilles dérivées du contrat + feuilles applicatives de `Enforcement target`) : une feuille hors périmètre et un style injecté à l'exécution sortent en `unrealized`, jamais en `pass`.
- **Obligation de report** (`design-bridge/SKILL.md`) — toute règle reçue en `Declared rules` est rendue au gate, réalisée ou non, au format `plugins/design/references/gate-config-schema.md § Rapport de pivot`. Sans `status: "unrealized"` explicite, une règle hors de portée et une règle oubliée laissent la même trace — aucune — et le gate ne peut que les confondre.
- Le rapport se déclare dans `gates.config.json § pivotReports` avec un `command` : le runner relance la vérification avant de lire, ce qui rend un rapport périmé impossible.

## [0.1.0] — 2026-06-16

Initial release — **couche CSS technique du pipeline design**.

### Ajouté

- **`sniff`** : détection d'architecture CSS (BEM, utility-first, CSS Modules, ad-hoc), stack (préprocesseur, linter), maturité (custom properties, cascade layers). Émet un pivot manifeste JSON pour audit et improve.
- **`audit`** : audit multi-dimensionnel read-only — spécificité (guerres de cascade, `!important`, ID sélecteurs), code mort (sélecteurs inutilisés cross-référencés avec le HTML), magic numbers (valeurs hors tokens), a11y CSS (contrastes WCAG, focus, `prefers-reduced-motion`), opportunités modernes (`:has()`, container queries, nesting).
- **`improve`** : amélioration ciblée — extraction custom properties, organisation cascade layers, réduction spécificité, modernisation syntaxique. Propose plan lisible avant toute édition.
- **`legacy`** : migration legacy → standards modernes : `float` → `flex/grid`, `px` → `rem`, vendor prefixes → standard, variables Sass/Less → custom properties CSS natives. Scan d'abord, plan, puis migration fichier par fichier.
- **`teach`** : explications CSS contextuelles (spécificité, cascade layers, custom properties, sélecteurs modernes, container queries) ancrées dans le code du projet.
- **`design-bridge`** : réceptacle du pivot design — `tokens.json` → `design/css/tokens.css` (custom properties en `@layer design.tokens`), `components.json` → `design/css/<component>.css` (BEM structuré en `@layer design.components`). Signale les sélecteurs orphelins et les tokens manquants. Invoqué par `design:enforce/04-pivot` et `design:diffuse/03-pivot` quand la stack est CSS pure.
