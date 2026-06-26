# Changelog — sc-php

## v0.5.4 — 2026-06-26

### Changed
- `wordpress/fse-patterns.md` — carve-outs affinés après audit réel sur un thème bloc : (1) **formulaires** — WP core n'a pas de bloc form natif, donc `<form>`/`<input>`/`<select>` en HTML brut est légitime ; ne lever que la copie à fort churn (label submit, phrase de consentement/intro). (2) **Patterns `Inserter: no`** (showcases design-system, previews) — non édités par le client, exemptés de la règle tout-natif ; la règle se limite aux patterns insérables et porteurs de contenu. (3) **Nuance grammaire** — un `wp:list` à `<li>` nus (sans `wp:list-item`) est une **déprécation core auto-migrée**, pas un « invalid content » : nit de cohérence, pas une erreur.

## v0.5.3 — 2026-06-26

### Added
- Capability pivot `wordpress/fse-patterns.md` — conventions d'authoring des **block patterns FSE statiques** (`patterns/*.php`), framées en critères d'audit : texte client-éditable en blocs natifs (jamais piégé dans `wp:html`), neutralisation de l'injection de layout WP au passage en natif (`is-layout-flex:center`, `block-gap` ; bouton stylé sur `.wp-block-button__link`), CSS de bloc aussi en `add_editor_style()` (WYSIWYG éditeur), en-têtes complets + catégories enregistrées, slug ↔ nom de fichier sans doublon, grammaire de blocs valide. Scope = correction d'écriture + éditabilité, distinct du vocabulaire design (`design-bridge`) et des blocs SSR (`wordpress/ssr.md`). Note le pendant déterministe (linter de patterns en pre-commit, réalisé via `design:enforce` → `sc-php:design-bridge`).
- `sniff/01-scan.md` : Step 4c — détection d'un thème bloc (`theme.json`) avec dossier `patterns/` → émet le pivot ; câblé en Step 5a + exemple de manifeste WordPress (block theme).
- `audit/01-audit.md` : `wordpress/fse-patterns.md` ajouté à la structure de critères chargés à l'audit.

## v0.5.2 — 2026-06-19

### Added
- Capability pivot `wordpress/ssr.md` — conventions d'authoring de blocs dynamiques (SSR `render_callback`/`render.php`), framées en critères d'audit : attributs de bloc additifs (ne pas casser les insertions sérialisées), `wp_kses_post` vs `esc_html`/echo brut pour le HTML inline dynamique, agrégats/compteurs calculés côté serveur (pas en dur, garde N+1), édition de la source `blocks/` vs build `build/` régénéré, et navigation SSR (liens + routes réelles) vs show/hide JS. Distinct du pivot perf (`perf/wordpress.md`) et de `design-bridge` (markup/design).
- `sniff/01-scan.md` : pivot câblé en Step 5a (capability pivots, condition « WordPress détecté ») + exemple de manifeste WordPress.
- `audit/01-audit.md` : `wordpress/ssr.md` ajouté à la structure de critères chargés à l'audit.

## v0.5.1 — 2026-06-16

### Added
- `design-bridge/SKILL.md` : section "Cascade CSS : presets `has-*-font-size` et `!important`" — routes (remove-override, counter-`!important`, réalignement `theme.json`). Contenu déplacé depuis `design/enforce/adapters/wordpress.md` : `design` doit rester stack-agnostique.

## v0.4.8 — 2026-05-29

### Changed
- `sniff/01-scan.md`: refactorise la readiness des skills — supprime la section `Skills support` séparée (systématiquement omise en 7 passes) et intègre les lignes `→ /skill : STATUS` directement dans chaque sous-bloc du Pivot manifeste (après capability pivots, perf pivots, data pivots). Supprime Step 8 et la closing gate.

## v0.4.7 — 2026-05-29

### Fixed
- `sniff/01-scan.md`: ajoute une closing gate avant `→ Proceed` — le modèle doit explicitement vérifier la présence du bloc `Skills support` et l'écrire s'il est absent.

## v0.4.6 — 2026-05-29

### Fixed
- `sniff/01-scan.md`: déplace `Skills support` après `Gaps`, en dernière position avant `→ Proceed` — le modèle sautait la section quand elle était intercalée entre deux sections qu'il génère naturellement.

## v0.4.5 — 2026-05-29

### Fixed
- `sniff/01-scan.md` Step 8: ajoute deux exemples concrets (vanilla PHP et Laravel+Eloquent) pour la section `Skills support` — le modèle sautait la section quand tous les pivots étaient NOT-APPLICABLE, faute d'exemple couvrant ce cas.

## v0.4.4 — 2026-05-29

### Fixed
- `sniff/01-scan.md`: ajoute Step 8 comme étape de traitement explicite pour la section `Skills support` — le modèle l'omettait car elle n'apparaissait que dans le template de sortie, jamais dans le processus.

## v0.4.3 — 2026-05-29

### Fixed
- `sniff/01-scan.md`: déplace la contrainte de format plain-text en tête du fichier, avant le processus, pour éviter que le modèle ne choisisse les tables markdown avant d'atteindre la section Output.
- `sniff/SKILL.md`: ajoute l'interdiction des tables markdown dans les règles transversales.

## v0.4.2 — 2026-05-29

### Added
- README.md — per-plugin documentation covering all six skills and their pivot model.

### Changed
- `improve` now loads capability pivots (`solid.md`, `eloquent.md`, `doctrine.md`) during analysis to surface stack-specific anti-patterns.

### Fixed
- `sniff/01-scan.md` output constraints: prohibit markdown tables, enforce plain-text format, mark **Skills support** section as mandatory.

## v0.4.0 — 2026-05-28

### Breaking changes
- Removed `setup` skill. Use `/sc-php:sniff` instead; it detects the stack and installs only the applicable pivots.
- Renamed sniff action `sync` to `install-pivots` (aligns with sc-js v0.4.0).

### Added
- New `/sc-php:audit` skill — delegates PHP code review to `aidd-dev:reviewer` using capability pivots as criteria.
- Two-tier pivot model: capability pivots (`php/solid.md`, `testing/bruno.md`) loaded at audit time; perf/data pivots installed to `.claude/rules/07-quality/`.
- References resolved via `${CLAUDE_PLUGIN_ROOT}` at runtime (cross-plugin convention).

### Changed
- `bruno` skill conventions moved to the sniff capability pivot store; `bruno/SKILL.md` updated to point to the new location.
