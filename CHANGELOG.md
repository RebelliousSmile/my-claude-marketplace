# Changelog — my-claude-marketplace

Journal au niveau du marketplace : ajout/retrait de plugins et changements transverses. Les évolutions internes à un plugin sont dans son propre `CHANGELOG.md`.

Format inspiré de [Keep a Changelog](https://keepachangelog.com/). Versionnement du marketplace en SemVer (`marketplace.json`).

## [3.2.0] - 2026-07-22

### Added

- **Consommation cross-plugin d'un pivot `sc-*`** (`DEC-004`) — premier cas d'un pivot lu par un plugin **autre** que le sien : `sc-js/tools/testing.md` (0.10.0) est découvert **par glob** et consommé par `overcode:control` (3.3.0), qui détient le contrat (`references/pivot-contract.md`). Champs optionnels à repli documenté, titres de section alignés sur le contrat, et frontière d'autorité explicite — un pivot priorise un classement, il ne décide jamais d'un tier. Tout futur pivot `testing` (`sc-php`, `sc-python`…) s'y conforme sans modifier `control`.
- La résolution de racine du pivot accepte la **racine source** (`plugins/<plugin>/`) quand le consommateur tourne contre le dépôt marketplace — sans quoi aucun pivot n'est testable avant publication, les versions étant épinglées à l'installation.

### Fixed

- **Dérive de `marketplace.json`** — le manifeste annonçait encore `overcode` 3.1.5 et `sc-js` 0.8.0 alors que les plugins étaient publiés en 3.2.0 / 0.9.0, et la description d'`overcode` ignorait la skill `control`. Version du marketplace réalignée sur ce CHANGELOG (elle indiquait 3.0.0 pour une entrée 3.1.0 existante).

## [3.1.0] - 2026-06-13

### Added

- **Infra de test `tools/eval/`** (Node, zéro dépendance) — trois couches : `harness.mjs` (conformité structurelle d'un projet brief→output + invariants de portabilité + invariant plateau), `coverage.mjs` (chaque action *routable* a ≥1 scénario, tous plugins) et `behavioral/` (spec + rubrique LLM-juge à la demande). 4 fixtures golden + spec comportementale.
- **`writing` (1.1.0)** — boucle de review convergente + **PLATEAU** (`Δ < 1.0`), artefact `chapter-NN-scores.md`, routes de triage vers `tone-finder:improve` / `persona:train` (`references/review-loop.md`).

### Changed

- **Contrat brief resserré** : `_brief/personas/` et `_brief/output-styles/` exigent ≥3 entrées distinctes (`writing` 1.1.0 + `obsidian` 0.14.0).

### Fixed

- **`obsidian` (0.15.0)** — `rules-keeper/evals/scenarios.json` réparé (ids d'action périmés) ; dérive de version + description corrigée dans `index.json` (obsidian 0.11.0 → 0.15.0).

> `obsidian` 0.15.0 inclut aussi la formalisation de la convention `Pro/Projets` dans `tree` (`references/tree-convention.md`) — détail dans `plugins/obsidian/CHANGELOG.md`.

## [3.0.0] - 2026-06-13

### Added

- **Plugin `writing`** (1.0.0) — production éditoriale à partir d'un brief : documentation pro (`specification`, `technical-document`, `user-guide`) + craft narratif (`toc`, `write`, `tone-finder`, `persona`, `review`, `storyboard`, `upgrade`). Fusion de `doc-writer` + `rpg-writer`.
- **Plugin `game-writer`** (1.0.0) — contenu narratif jeu vidéo (bank, dialogic-draft, dialogic-review) ; remplace `gamedesign` (renommé).
- **Plugin `sc-godot`** (0.1.0) — coquille Godot/GDScript ; pendant technique de `game-writer`.
- **`obsidian`** (0.13.0) — skill `tree` (organiseur Documents/ piloté par cache) ; skill `brief` (construit `_brief/` autosuffisant) ; 8 skills JDR migrés vers domaines locaux autonomes (`R = <jeu>`, résolution via `_savoir/`) ; réf `jdr-layout.md`.

### Changed

- **Séparation des responsabilités** : `obsidian` assemble les intrants (`brief`, `forge`, `research`, `lore-extract`, `rules-keeper`, `extract-pdf`) ; `writing` produit à partir du brief — sans remonter vers `R` ni `bank.yml`.
- **`obsidian` — modèle JDR autonome (BREAKING)** : abandon de `tnn-jdr` / `~/.jdr.yaml` / variable globale `<vault>`. Savoir durable en `R/_savoir/{systeme,subsystems,univers}/{canon,mj}/` ; campagnes en `R/_campagnes/<c>/<AAAA>/<MM>/` ; résolution locale via marqueur `_savoir/`.

### Removed ⚠ BREAKING

- **Plugin `doc-writer`** — fusionné dans `writing`. Les déclencheurs `/doc-writer:*` sont inactifs.
- **Plugin `rpg-writer`** — fusionné : craft narratif → `writing`, skills JDR + assemblage intrants → `obsidian`. Les déclencheurs `/rpg-writer:*` sont inactifs.
- **Plugin `gamedesign`** — renommé `game-writer`. Les déclencheurs `/gamedesign:*` sont inactifs.
- **`obsidian`** — agents `claude-code-optimizer-jdr` et `documentation-architect-jdr` supprimés (obsolètes).

## [2.0.0] - 2026-06-11

### Added

- **Plugin `design`** (1.0.0) — entonnoir 5 verbes `define → destructure → adjust → enforce → diffuse` avec contrat 3 couches (tokens W3C · manifeste composants · charte prose), linter portable `lint-core.mjs` dérivé du contrat, 3 gates (règles génération, success_condition, pre-commit auto-armé), et pivot hybride vers `sc-php:design-bridge` / `sc-js:design-bridge`.
- **`sc-php`** (0.5.0) — skill `design-bridge` : réceptacle pivot design — linter PHP natif + block patterns WP FSE dérivés du contrat.
- **`sc-js`** (0.7.0) — skill `design-bridge` : réceptacle pivot design — règle ESLint/Biome + composant Vue 3 SFC ou React TypeScript dérivés du contrat.
- **`aidd-overlay`** (2.1.x) — skill `seo-optimize` ; alias `weeklyemail` ; endtask auto-détecte le numéro d'issue depuis 5 sources.
- **Plugin `doc-writer`** (0.1.0) — rédaction professionnelle : `user-guide`, `technical-document`, `specification`.
- **`LICENSE`** (MIT), **`CONTRIBUTING.md`** et ce **`CHANGELOG.md`** à la racine.

### Changed

- **`obsidian`** (0.10.0) — `solo-mc` enrichi (narrateur-agent, oracle agent, grille décisionnelle, substitution compagnon) ; `pc` avec questionnaire de background par genre (mapping GROG).
- **`rpg-writer`** (0.10.0) — migration vers vault layout par jeu ; pipeline canon/MJ ; extract-pdf préserve le brut.
- **`sc-python`** (0.5.2) — modèle pivot v0.5.0 (8 nouveaux pivots, catégorie AP protocol, refonte sniff).
- **`sc-js`** (0.6.8→0.7.0) — perf-vanilla : couverture img-src-dynamic + passive listeners.

### Removed ⚠ BREAKING

- **`design`** — 9 skills supprimés : `setup`, `from-reference`, `from-brief`, `wireframe`, `component`, `audit`, `diagnose`, `refactor`, `export-wordpress`. Tous les déclencheurs `/design:<skill>` correspondants sont inactifs. Voir `plugins/design/CHANGELOG.md` pour la correspondance legacy → 5 verbes.
- **Plugin `hermes`** — retiré du marketplace. La skill `solo-mc` est portée par `obsidian:solo-mc` (Claude Code).

### Fixed

- **`aidd-overlay`** (2.1.4) — endtask : auto-détection numéro d'issue depuis branche, frontmatter, commits.
- **`design`** — skill `doctor` renommé `diagnose` pour éviter la collision avec `/doctor` natif de Claude Code.
- **`sc-python`** — corrections AP protocol (ap-optimize audit v2 + v3).

## [1.0.0] - (unreleased)

### Added

- **Plugin `design`** (0.2.0) — design system mobile-first et responsive : intakes `from-reference` / `from-brief`, tokens W3C (DTCG) + adaptateurs CSS/Tailwind générés, wireframes HTML vivants, composants réutilisables à options, `audit` de conformité, `doctor` + `refactor` pour le code en production, et `export-wordpress` (`theme.json` v3 + block patterns). Règle « jamais d'émoticons » et décision du trio palette/typo/icônes en priorité.

## [1.0.0-initial]

- État initial du marketplace : `aidd-overlay`, `gamedesign`, `writing`, `sc-js`, `sc-php`, `sc-python`, `sc-rust`, `sc-tiers`, `obsidian`.
