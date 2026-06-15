# Changelog — design

## [1.2.0] — 2026-06-15

Minor — **enforcement structurel de la fidélité dans l'oracle** (les invariants en prose de copycat n'étaient pas suivis de façon fiable par l'agent ; un 2ᵉ dry-run l'a reconfirmé). On déplace la discipline du texte vers la mécanique du script.

### Ajouts — `adapters/measure/measure.py`

- **Verdict machine** : sortie top-level `summary.verdict` (`CLOSED`/`OPEN`) **calculée par le script** (`closed` ssi 0 diff non-ledgeré ET 0 missing ET aucune `missing_in_wp` ET `coverage.ok`). La clôture n'est plus déclarable par l'agent — il doit **citer** le bloc. Tue le « verified by grep of source ».
- **Scan de complétude structurelle** : `completeness` énumère les headings maquette ↔ cible (sélecteurs scopables via `headings_sel`), **normalise les guillemets/tirets** (un `wptexturize` curly ≠ droit ne crée plus de fausse « section manquante ») et alimente le verdict via `missing_in_wp`. Défait la tunnel vision hero-only par construction.
- **Garde de couverture** : `coverage` — moins de cibles que de headings ⇒ `OPEN: under-coverage` sauf `coverage_ack:true` (avec justification). Empêche un config hero-only de « passer » pendant que le corps n'est pas mesuré.
- **Conscience du deviation-ledger** : clé de config `ledger:[{target,prop,why}]` — un diff sanctionné est marqué `ledgered:true` et **exclu du verdict** (jamais par omission, toujours tracé).

### Modifié

- `agents/copycat.md` — invariant de clôture ré-ancré sur `summary.verdict == "CLOSED"` (cité comme preuve) + source ré-importée (source ≠ live = pas fait) + `coverage.ok`. `enforce/05-fidelity-gate` aligné sur le verdict du script.

## [1.1.2] — 2026-06-15

Patch — durcissement de `copycat` en mode dérive, suite à un dry-run réel (`mentions-legales`) où l'agent a **contourné** des règles existantes plutôt qu'enfreint des règles absentes. Deux trous réels comblés, deux règles rendues opposables.

### Corrigé — `copycat` (`agents/copycat.md`)

- **Échappatoire « source authoritative » fermée** : boundary 4 ne parlait que de *block patterns* → l'agent a édité un `post_content` seedé directement en DB en raisonnant « pas un pattern → DB ok ». Généralisé : **tout** contenu généré/seedé (`post_content`, menus, nav posts, options produits par `tools/import/`, seeds, migrations) s'édite à sa **source** + réimport. Une édition DB-only est nommée **violation P1** (écrasée au prochain import, absente de git). « Ce n'est pas un pattern » n'est plus une exemption.
- **Couplage config↔markup (trou réel)** : changer une classe/un sélecteur désynchronise la table de correspondance → l'oracle ressort `missing`, ce qui *masque* le correctif au lieu de le confirmer. Nouvelle étape Method (§9) : réconcilier le config dans le même geste ; préférer les **classes DS stables** au mapping ad-hoc.
- **Invariants de clôture (checklist opposable)** : un delta n'est « fermé » que si TOUS tiennent — fix à la source (jamais DB-only), réalisation via le **pivot** (ou baseline explicite si pas de `sc-<techno>`), config réconcilié, et **re-mesure oracle à 0 diff ET 0 missing**. La clôture s'affirme **depuis le rapport oracle, jamais depuis l'édition**. Corrige l'auto-déclaration de succès du dry-run.
- **Pivot rendu non-skippable** : interdiction explicite de hand-driver la stack (ex. `wp post update`) pour court-circuiter `sc-php`/`sc-js:design-bridge`.
- **Passe de complétude structurelle AVANT la mesure (trou réel, tunnel vision)** : nouvelle étape Method §2 — inventorier les sections maquette ↔ cible et diffuser au niveau **structure** avant tout `getComputedStyle`. Une section présente en maquette / absente en cible est l'écart **dominant** (route `content`, P1) et reste invisible à une mesure scopée sur quelques sélecteurs. Le dry-run l'a montré : copycat a « validé » un hero et optimisé 1px de lede pendant que tout le corps de page était absent. Champs `missing_sections`/`extra_sections` ajoutés aux Outputs ; invariant de clôture « aucune section silencieusement manquante » ajouté.

### Corrigé — `enforce/05-fidelity-gate`

- Étape « corriger à la source » généralisée au-delà des patterns (P1) ; nouvelle étape réconciliation-config ; nouvelle étape clôture-depuis-l'oracle (`missing` = échec, pas pass). Pièges complétés en conséquence.

## [1.1.1] — 2026-06-15

Patch — durcissement de l'oracle et clarification des frontières de `copycat` (entonnoir inchangé, toujours 5 verbes).

### Corrigé / durci

- **Oracle `measure.py` — schéma `missing` désambiguïsé** : sortie explicite `{"maquette":"present|absent","wp":"present|absent"}` + `searched` (sélecteurs réellement testés), au lieu du `null`/sélecteur contre-intuitif (lisible à l'envers — a déjà causé une mauvaise classification d'un eyebrow présent en maquette/absent en WP). Schéma du rapport figé en contrat dans la docstring.
- **Règle de chemin du rapport** : `--out` pointe toujours vers l'arbre QA du **projet consommateur** (gitignored, ex. `aidd_docs/qa/fidelity/<page>-<mode>.json`), jamais le plugin (`out/` du plugin = fixtures de self-test uniquement). Encodé dans `copycat.md`, `enforce/05-fidelity-gate`, docstring `measure.py`.

### Modifié — `copycat`

- **Comportement mode-dépendant** : en **bulk** (fan-out parallèle de `define`) il PROPOSE seulement ; en **dérive unité** (piloté par `enforce`, séquentiel) il **ferme la boucle** `enforce` → `adjust` *au besoin* jusqu'à delta 0. Boundary 1 révisée — le figeage parallèle créerait une course d'écriture sur le contrat partagé + perdrait l'arbitrage motif-dominant et le checkpoint P2.
- **Boundary 4 (pivot) ajoutée** : `copycat` possède le **QUOI** (classer l'écart, align/extend) ; toute réalisation stack-spécifique passe par le **pivot** `sc-php:design-bridge` / `sc-js:design-bridge`. Pour WordPress : block patterns, `render.php`/markup FSE, presets `theme.json`, lint des instances DB via le CLI conteneur ; corriger la **source + réimporter**, jamais la DB seule.
- **`define/05-copycat-fanout`** : documente la **fermeture de boucle post-agrégation** (séquentielle, via l'entonnoir `define → adjust → enforce`), jamais dans le fan-out parallèle.

## [1.1.0] — 2026-06-15

Ajout de **copycat** : réplication fidèle d'une maquette arbitraire vers le contrat, mesurée, sans casser l'entonnoir (5 verbes inchangés).

### Ajouts

- **Agent `copycat`** (`agents/copycat.md`, `model: sonnet`) — opérateur de réconciliation maquette→contrat **par page** : mesure les styles calculés via l'oracle, classe chaque écart à sa couche, propose des contributions tokens/composants. Trois frontières : il PROPOSE (n'arbitre/fige jamais), la mesure vit dans le script déterministe, c'est une **feuille** (ne spawn aucun agent).
- **Oracle de fidélité Python** (`adapters/measure/`) — `measure.py` (getComputedStyle, Mode A extraction / Mode B diff, **par breakpoint**), `screenshot.py`, `pixeldiff.py` ; cross-OS, sans dépendance Node. `requirements.txt` figé ; `python -m playwright install chromium`.
- **`define/05-copycat-fanout`** — fan-out parallèle de l'agent `copycat` sur une maquette multi-pages (`Agent` pour quelques pages / `Workflow` pour des dizaines), agrégation + remontée des conflits inter-pages (sans arbitrer), table de correspondance agrégée au **checkpoint humain P2**. Sélection de modèle : Sonnet par défaut, override par pré-signal (Haiku trivial / Opus complexe).
- **`enforce/05-fidelity-gate`** — **2ᵉ gate, de nature différente** du lint vocabulaire : mesure le rendu vs la maquette résolue par breakpoint, lit le registre d'écarts (`ds-deviation-ledger`), boucle mesurer→corriger à la source→re-mesurer. Lint = référence **interne** (vocabulaire) ; fidélité = référence **externe** (intention). Les deux doivent être verts.
- **Templates génériques** (`references/`) — `correspondence-table-template`, `deviation-ledger-template`, `copycat-checklist-schema` (checklist résumable pour la mi-intégration).
- **Responsive** : règle ask-or-derive (mesurer chaque breakpoint si la maquette le fournit ; sinon déduire du profil mobile-first + flaguer). Le tablette est le cas « derive » canonique.

## [1.0.0] — 2026-06-11 ⚠ BREAKING

Refonte totale : **remplacement des 9 skills legacy par un entonnoir de 5 verbes**. Tous les déclencheurs `/design:setup`, `/design:from-reference`, `/design:from-brief`, `/design:wireframe`, `/design:component`, `/design:audit`, `/design:diagnose`, `/design:refactor`, `/design:export-wordpress` sont supprimés.

### Nouveaux skills (5 verbes)

- **`define`** — extraction depuis référence ou brief → tokens de travail + inventaire composants candidat + charte brouillon. Unifie ex-`from-reference` + ex-`from-brief`. Profil mobile-first optionnel injectable (`profile-mobile-first.md`), proposé par `01-intake` et jamais imposé.
- **`destructure`** — challenge la direction design : critique multi-angles (a11y, cohérence, mobilité, alternatives) + pistes d'évolution. Couvre ex-`diagnose`. Pendant design de `aidd-refine:challenge`.
- **`adjust`** — arbitrage maquettes divergentes (motif dominant gagne automatiquement ; gate humain sur les cas non tranchables) + figeage du **contrat 3 couches** : `tokens.json` (W3C DTCG) · `components.json` (vocabulaire fermé, base du linter) · `design-system.md` (charte prose, statut: figé). Règle cardinale : une valeur vit dans une seule couche.
- **`enforce`** — linter portable `lint-core.mjs` dérivé du contrat à l'exécution (2 sévérités, aucune valeur en dur) + 3 gates (règles de génération, `success_condition` des plans, pre-commit auto-armé) + lint instances/DB + boucle corriger→propager→re-lint. Pivot hybride vers `sc-php:design-bridge` (WP FSE) ou `sc-js:design-bridge` (Vue/React/TS) quand disponibles. Absorbe ex-`audit` + ex-`refactor`.
- **`diffuse`** — éléments répétables sous gate lint obligatoire (refus absolu si lint exit 1) : spec neutre depuis `components.json` + rendu baseline HTML/CSS + pivot `sc-php:design-bridge` ou `sc-js:design-bridge`. Absorbe ex-`wireframe` + ex-`component` + ex-`export-wordpress`.

### Réceptacles sc-* (pivot hybride)

- **`sc-php:design-bridge`** (sc-php v0.5.0+) — réalisation native PHP/WP : linter PHP checker + block pattern WP FSE.
- **`sc-js:design-bridge`** (sc-js v0.7.0+) — réalisation native JS/TS : règle ESLint + composant Vue 3 SFC ou React TypeScript.

### Supprimés (BREAKING)

`setup` · `from-reference` · `from-brief` · `wireframe` · `component` · `audit` · `diagnose` · `refactor` · `export-wordpress`

Toute la logique est absorbée dans les 5 verbes (voir ci-dessus pour la correspondance). La philo mobile-first/a11y de `setup` est disponible en profil optionnel via `define`.

### Interface de contrat pivot

`plugins/design/references/sc-pivot-contract.md` — format de spec d'enforcement + spec de rendu partagés entre `design` et `sc-*`.

---

## [0.2.1] — 2026-05-31

### Changed

- **`doctor` renommé `diagnose`** (invocation : `/design:diagnose`). Le nom nu `doctor` entrait en collision avec le `/doctor` natif de Claude Code, qui résolvait `/doctor` vers ce skill. Aucun changement de comportement ni d'actions (`diagnose → prescribe`).

## [0.2.0] — 2026-05-28

### New skills

- **`doctor`** — design-health triage for projects already in production with no clean system: reverse-engineers the de-facto tokens, measures sprawl (color/font/spacing counts, hardcoded-value density, breakpoint chaos, emoji-as-icons, a11y red flags, duplicated components), and prescribes a phased, low-risk remediation roadmap. Read-only. `diagnose → prescribe`.
- **`refactor`** — migrates existing production UI into compliance incrementally: token substitution, mobile-first conversion, component de-dup, emoji→icon — in reviewable batches, each gated by `audit`. `plan → apply`.
- **`export-wordpress`** — ports a design onto a WordPress block theme: maps `design/tokens.json` to a `theme.json` (v3) palette/typography/spacing presets (rest under `settings.custom`), and turns wireframes/components into block patterns/templates with the token CSS enqueued. `theme-json → blocks`. Idempotent: re-runnable as an update — `theme.json` merges (design sections overwritten, non-design keys preserved) and patterns regenerate in place via a generated-marker guard (no duplicates, human-edited files left untouched).

### Changed

- **Core trio first** — `from-reference` and `from-brief` now settle the palette anchor, type, and icon set up front and present them for one quick approval before expanding the full scale.
- **Iconography is now a foundation** — `icon.library`/`icon.style` recorded in `design-system.md`, `icon.size.*`/`icon.stroke.*` added to the token schema.
- **Never emoji** — new rule `08-design/7-iconography` (one icon set, sized from tokens, no emoji/emoticons as UI icons); `audit` adds an iconography category that flags emoji-as-icons as blocking; `setup` now installs seven rules.

## [0.1.0] — 2026-05-28

Initial release. A condensed, mobile-first responsive design-system plugin.

### Skills

- **`setup`** — installs six binding rules to `.claude/rules/08-design/` (mobile-first, progressive enrichment, mobile-only UX, design-token discipline, reusable components with options, accessibility baseline), each with a `paths:` glob for auto-loading on UI files.
- **`from-reference`** — establishes the design system from a visual reference (screenshot, URL, Figma export, existing CSS): `capture → extract → write-system`.
- **`from-brief`** — establishes the design system from a written need / user story with no reference: `clarify → derive → write-system`.
- **`wireframe`** — turns a user story into a living, standalone mobile-first HTML preview across three breakpoints, with enriched-only and mobile-only regions made explicit: `layout → render`.
- **`component`** — designs and implements reusable components driven by options/variants: `spec → implement` (framework-agnostic).
- **`audit`** — verifies any wireframe/page/component against the system and rules; severity-ranked report with fixes (read-only by default, `--fix` to apply).

### Conventions

- Tokens are framework-agnostic (W3C DTCG) in `design/tokens.json`; CSS-variable and Tailwind adapters are generated and never hand-edited.
- Shared contract and procedures (`design-system-contract.md`, `token-schema.md`, `write-system-procedure.md`) live at the plugin root and are referenced via `${CLAUDE_PLUGIN_ROOT}` to keep the two intake skills DRY.
