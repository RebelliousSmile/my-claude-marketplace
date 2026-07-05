# Changelog — design

## [1.16.0] — 2026-07-05

Minor — **le rendu baseline de `diffuse` est contractuellement une preview non intégrée, jamais un livrable implicite** — quand aucun pivot `sc-*:design-bridge` n'est détecté, `02-render` retombait sur l'adaptateur HTML/CSS baseline sans jamais énoncer que ce rendu est un artefact isolé, sans chemin d'intégration vers le vrai composant applicatif (Vue/React/WP) — un lint vert le faisait passer pour « livré » alors que personne ne le rebranchait dans l'app, 2nd-audit #4 (Med/Large). 1.16.0 rend ce statut et son hand-off **obligatoires** dans le message de livraison, sans jamais relâcher le gate enforce.

### Modifié — `skills/diffuse/adapters/html-css.md`

- Nouvelle section **"Statut de la sortie"** en tête : le rendu de cet adaptateur est une **preview autonome, non intégrée** (wrapper `diffuse-demo`), pas un composant applicatif ; aucun chemin d'intégration automatique vers le code réel ; un lint vert valide le vocabulaire, jamais l'intégration ; renvoi vers le hand-off de `02-render.md` Étape 5 et vers la table de `SKILL.md`.

### Modifié — `skills/diffuse/actions/02-render.md`

- **Étape 1** : quand la branche baseline est retenue, le rendu est explicitement marqué **preview non intégrée** ; si une stack JS/WP est détectée sans le `sc-<techno>` correspondant installé, recommandation conditionnelle notée dès cette étape (« installer `sc-<techno>` pour un rendu natif ») ; sur cible statique/stack non identifiée, pas de recommandation de pivot.
- **Étape 5 (Livraison)** scindée en deux messages : **Rendu natif (pivot)** (inchangé) et **Rendu baseline (preview non intégrée)** — énonce systématiquement (a) le statut preview non intégrée, (b) le chemin de promotion (quel composant/fichier réel elle deviendrait), (c) la recommandation conditionnelle d'installer `sc-<techno>` si une stack JS/WP est détectée sans pivot, et rappelle explicitement qu'un **lint vert n'implique pas un artefact intégré** — le hand-off est une obligation additionnelle, jamais un relâchement du gate.

### Modifié — `skills/diffuse/SKILL.md`

- Table "Ce que diffuse produit" : ligne **Rendu baseline** relabellée **"preview HTML/CSS non intégrée"**, renvoi vers `adapters/html-css.md § Statut de la sortie`.
- Section "Invariant critique : gate enforce" : nouveau paragraphe **"Lint vert ≠ artefact intégré"** — le rendu baseline reste une preview non intégrée même en gate vert ; le hand-off de `02-render` Étape 5 est une obligation de livraison additionnelle, jamais une relaxation du gate.

### Modifié — `references/sc-pivot-contract.md`

- Section "Dégradation gracieuse" : la ligne existante sur le fallback baseline de `diffuse` est complétée d'une clause d'alignement (preview non intégrée, renvoi vers `02-render.md § Étape 5` et `adapters/html-css.md § Statut de la sortie`) — pas de duplication du contenu, seulement la frontière.

## [1.15.0] — 2026-07-05

Minor — **persistance par défaut de la critique `destructure`** — `destructure/SKILL.md` et `actions/01-challenge.md` faisaient de la persistance du rapport un cas opt-in (« si demandé ») : à la fin de session ou après compaction de contexte, la critique multi-lentille et ses pistes contrastées disparaissaient sans laisser de trace exploitable par un `adjust` ultérieur — 2nd-audit #2 (Med/Large). 1.15.0 rend l'écriture **par défaut**, sous un chemin historique daté, sans jamais toucher au contrat gelé ni au code source, et branche la lecture optionnelle côté `adjust`.

### Ajouté — `skills/destructure/references/critique-report-template.md`

- Squelette canonique du rapport (score de distinction, cible & mode, mesures, critique par lentille, pistes avec coût contrat, verdict), pour que toute critique persistée soit structurée uniformément et repérable par `adjust`.

### Modifié — `skills/destructure/actions/01-challenge.md`

- Process : nouvelle étape terminale « Écrire le rapport (par défaut) » sous `design/critique/<yyyy_mm_dd>-<cible>.md`.
- Outputs : écriture **par défaut** sur le chemin canonique daté (historique, jamais d'écrasement), `<cible>` en slug ; `design/destructure-report.md` redevient un alias accepté en lecture, plus le chemin d'écriture ; opt-out explicite documenté (`--no-write` / « ne sauvegarde pas ») ; rappel que cette écriture ne contrevient pas à la lecture seule sur le contrat.
- Test : vérifie l'écriture par défaut (ou l'absence d'écriture sur opt-out) en plus des critères déjà en place.

### Modifié — `skills/destructure/SKILL.md`

- Description et corps reformulés : « lecture seule » s'entend désormais explicitement comme *n'édite jamais le contrat gelé (`tokens.json`/`components.json`/`design-system.md`) ni le code source* — carve-out explicite pour la persistance de son propre rapport sous `design/critique/`.
- Référence ajoutée vers `critique-report-template.md`.

### Modifié — `skills/adjust/actions/01-arbitrate.md`

- Étape 1 : nouvelle entrée optionnelle et non-bloquante — lit le rapport de critique persisté le plus récent sous `design/critique/` (absence de fichier : non-bloquant) et reprend chaque piste retenue avec son étiquette de coût contrat (`rentre dans le contrat` / `demande un re-figeage`).

### Modifié — `references/design-system-contract.md`

- `design/critique/` ajouté au Project layout et déclaré explicitement **non-contractuel** (informationnel, jamais versionné avec `$version`) ; Consumption rules reformulées pour `destructure` (lecture seule sur le contrat et le code, persistance de son propre rapport).

## [1.14.0] — 2026-07-05

Minor — **réconciliation manifeste ↔ code réel au figeage (cas retrofit)** — `adjust/02-freeze.md` réconciliait `components.json` contre la prose de `design-system.md` (couche 2 ↔ couche 3) mais jamais contre les classes/utilitaires **réellement présents** dans le code déjà écrit d'un projet retrofit : un manifeste cohérent avec la charte pouvait diverger du code réel sans que rien ne le signale avant `enforce/03-lint-instances`, bien après le figeage — 2nd-audit #1 (Med/Large). 1.14.0 ajoute une étape de réconciliation mode-aware au figeage, réutilisant `lint-core.mjs` comme oracle unique de scan (aucun nouveau scanner écrit), avec une politique de divergence asymétrique par direction (A10) : additif, aucune régression sur les fixtures existantes.

### Ajouté — `skills/adjust/actions/02-freeze.md`

- Nouvelle étape top-level **"Étape 2bis — Réconciliation avec le code réel (retrofit)"**, entre l'écriture du manifeste (Étape 2) et le figeage (Étape 3) : scan mode-aware (glob + jeu de règles dérivés de `mode`, jamais codés en dur — `bem` → vocabulaire de classes ; `utility-first` → namespaces `usage`), réutilisation de `lint-core.mjs` comme oracle, classification des divergences par direction (code→manifeste = bloquant ; manifeste→code = warning + ledger optionnel, jamais bloquant), interdiction de figer tant qu'une divergence bloquante subsiste, comportement always-on/neutre en greenfield documenté (A10).
- Ligne de réconciliation ajoutée à la checklist **"Test de validité"**.

### Ajouté — `skills/enforce/adapters/lint-core.mjs`

- Commentaire d'en-tête documentant que ce même scanner est invoqué tel quel par l'étape de réconciliation du figeage (`adjust/02-freeze.md § Étape 2bis`) — source unique de vérité "code vs contrat", aucune duplication de scanner.
- Mode additif `--report-unused` (flag, défaut off) : liste les entrées du manifeste (`components.*.base`/`.elements`/`.modifiers`) sans occurrence littérale dans le fichier scanné — réalise la direction **manifeste→code** de la réconciliation (A10.3). Purement informatif (sortie `UNUSED …`), n'ajoute jamais à `errors`/`warnings`, n'affecte jamais le code de sortie ; heuristique bornée aux occurrences de chaînes littérales (une classe assemblée dynamiquement en code — `` `btn--${variant}` ``, `:class="…"` — donne un faux "inutilisé" documenté, raison pour laquelle cette direction reste warning/ledger et jamais bloquante).

### Ajouté — `skills/enforce/fixtures/retrofit/`, `skills/enforce/fixtures/retrofit-{clean,dirty}.html`

- Fixture `tokens.json` + `components.json` (mode `bem`) représentant un manifeste tout juste figé pour un projet qui a déjà du markup (composants `btn`/`card` utilisés par le code existant ; `nav` déclaré en avance de son premier usage — cas manifeste→code non bloquant, démontré par `--report-unused`).
- `retrofit-clean.html` (markup préexistant dont chaque classe ∈ le manifeste figé → exit 0) et `retrofit-dirty.html` (markup préexistant portant une classe `card__legacy-note` absente du manifeste → exit 1, drift code→manifeste bloquant).

### Modifié — `skills/adjust/references/manifest-schema.md`

- Nouvel **Invariant 7 — "Concordance couche 2 ↔ code réel (retrofit)"**, en complément de l'Invariant 3 (couche 2 ↔ couche 3) : précondition de figeage mode-aware, portée par `adjust/02-freeze.md § Étape 2bis`, always-on/neutre en greenfield, politique de divergence par direction identique à celle documentée dans `02-freeze.md`.

## [1.13.1] — 2026-07-05

Patch — **factorisation en deux tracks (app-JS-modern vs WP/maquette) + limite de fidélité brief-path documentée** — l'ADN WordPress/maquette (`wp post get`, oracle `measure.py` par breakpoint, copycat, BEM) dominait la surface de `enforce`/`copycat`/`wordpress-pitfalls`, masquant le chemin SPA/from-code bien qu'il fût correctement contournable (#8) ; par ailleurs, l'absence de gate de fidélité sur le chemin `define/03-construct` (construction depuis un brief, aucun visuel de référence) n'était nommée nulle part comme une limite assumée (2nd-audit #3). 1.13.1 est un pur refactor documentaire/architectural — aucun changement de comportement, `lint-core.mjs` inchangé : marqueurs de track par action, in-place (A8, option 1 — pas de `references/tracks/*.md`), et sous-section explicite de la limite brief-path dans `05-fidelity-gate.md` (A9, option 1).

### Modifié — `skills/enforce/SKILL.md`

- Nouvelle section "Routage à deux tracks" en tête du flux d'exécution : tableau `app-JS-modern` vs `WP/maquette`, quelles actions (01/02/04 communes, 03/05 track-spécifiques) s'appliquent à chaque track.

### Modifié — `skills/enforce/actions/03-lint-instances.md`

- Préambule de routage ajouté en tête ("Track: app-JS-modern" / "Track: WP-maquette").
- Section "Approche selon la stack" scindée en deux titres `## Track: …` : `## Track: app-JS-modern` (flux file-lint — utility-first + autres stacks non-WP, servi en premier/first-class) et `## Track: WP-maquette` (flux DB-lint `wp post get`, anciennement en tête). Aucun contenu supprimé, seulement réordonné et titré.

### Modifié — `skills/enforce/actions/05-fidelity-gate.md`

- Préambule de routage : scope à la track WP/maquette (oracle maquette-vs-rendu par nature) + note app-JS-modern (l'oracle s'applique identiquement dès qu'une maquette externe existe, quelle que soit la stack).
- Nouvelle sous-section **"Chemin construction-depuis-brief — pas de gate de fidélité"** (A9, 2nd-audit #3) : déclare que sans rendu de référence externe (chemin `define/03-construct`), l'oracle ne s'applique pas *par nature* ; profil de gate = vocabulaire (`lint-core.mjs`) + bonnes pratiques visuelles uniquement ; limite assumée et nommée, pas un gap silencieux ; renvoi croisé vers `define/actions/03-construct.md` ; option de gate de substitution (A9 option 2) notée comme piste de suivi non construite.

### Modifié — `skills/define/actions/03-construct.md`

- Nouvelle section "En aval" (une ligne) : une construction depuis brief n'a pas de visuel de référence, donc pas de gate de fidélité en aval (vocabulaire + bonnes pratiques seulement) ; renvoi vers `05-fidelity-gate.md § Chemin construction-depuis-brief`.

### Modifié — `agents/copycat.md`

- Nouvelle section "Track boundary" : copycat est l'opérateur de la track WP/maquette (par nature — il reconcilie une page **contre une maquette**), s'applique à toute stack qui a une maquette de référence, mais pas à une extraction SPA pure depuis code ni à une construction depuis brief (aucune maquette à mesurer).

### Modifié — `references/wordpress-pitfalls.md`

- En-tête de scope de track : fichier explicitement WP-track-exclusif, référencé uniquement depuis le track WP de `enforce`/`diffuse` — un projet app-JS-modern n'a jamais besoin de l'ouvrir.

## [1.13.0] — 2026-07-05

Minor — **artefact adapter Tailwind v3 nommé explicitement dans le contrat** — `token-schema.md` était biaisé v4 (`@theme`) ; v3 n'obtenait qu'une vague instruction "émettre un `theme.extend`" sans nom d'artefact, ce qui a conduit un auditeur à inventer hors-contrat `adapters/tailwind-theme.js`, sans étape de fusion documentée pour une config existante (Nuxt) — finding #6 (Medium). 1.13.0 nomme l'artefact v3 canonique, documente son câblage (greenfield vs fusion manuelle obligatoire) et la manière dont les overlays de thème (Part 1) y sont portés, additif et rétrocompatible : l'artefact v4 `theme.css` est inchangé.

### Ajouté — `references/token-schema.md`

- Section `## Adapter: Tailwind (theme.css v4 / tailwind-tokens.cjs v3)` restructurée en deux sous-sections : **v4** (`design/adapters/theme.css`, bloc `@theme`, inchangé, auto-consommé par Tailwind) et **v3** (`design/adapters/tailwind-tokens.cjs`, nouveau, artefact **nommé et canonique** — cf. Amendment A7 de la Part 3).
- v3 documenté comme un **partiel** exportant un objet `theme.extend` (jamais un `tailwind.config.cjs` complet — collision avec `content`/`plugins` du projet consommateur), jamais nommé `theme.css`, jamais auto-consommé par Tailwind. Exemple d'export JS concret avec `themes` (overlays Part 1).
- **Câblage** documenté pour les deux cas : greenfield (le partiel assigné directement à `theme.extend`) et config existante (Nuxt) — **étape de fusion manuelle obligatoire** avec exemple concret `theme: { extend: { ...require('./design/adapters/tailwind-tokens.cjs') } }` dans `tailwind.config.ts`.
- Overlays de thème (Part 1) en v3 : réexportés par le partiel sous une clé `themes` dédiée, mêmes noms de thème que v4, seul le mécanisme d'émission diffère (`darkMode: 'class'`/`'selector'` + bloc CSS `.dark`/`[data-theme="…"]`, identique à `adapters/tokens.css` § Theme-scoped emission).
- Ancienne sous-section "Themes in Tailwind targets" (renvoi hors-scope vers une part ultérieure) supprimée — son contenu est désormais spécifié inline dans chacune des deux sous-sections v3/v4.

### Vérifié — `skills/diffuse/adapters/html-css.md`, `skills/diffuse/SKILL.md`, `references/sc-pivot-contract.md`

- Grep de contrôle : aucun des trois fichiers ne référence l'adaptateur Tailwind (`theme.css`/`tailwind-tokens.cjs`) — ils référencent uniquement `adapters/tokens.css` (l'adaptateur custom-properties, hors périmètre de ce finding). Laissés intacts, aucune dérive à corriger.

## [1.12.0] — 2026-07-05

Minor — **mode utility-first de première classe dans le baseline d'enforcement** — sur un projet Tailwind/Vue/React, le manifeste BEM (`components.json`) ne correspond à aucune classe réellement présente dans le code : la Règle 1 (`class-vocab`) de `lint-core.mjs` tournait sans jamais rien trouver à signaler — un gate vert qui ne vérifiait rien (finding #2, 0 hit mesuré sur du code réel avant qu'un pivot ad-hoc ne soit bricolé pour compenser). 1.12.0 donne au contrat une place pour déclarer des règles de **token-usage** (namespaces de couleur autorisés, raw-hex interdit) et les fait enforcer par le baseline lui-même, additif et rétrocompatible avec tout manifeste BEM existant.

### Ajouté — `skills/adjust/references/manifest-schema.md`

- Champ `mode: "bem" | "utility-first"` (explicite, défaulté par auto-détection : `components` vide/absent ⇒ `utility-first`). Nouvelle section **"Mode utility-first"** documentant l'invariant qui bascule : en `utility-first` le vocabulaire fermé porte sur l'usage des tokens, pas les noms de classe BEM, et la map `components` devient optionnelle (additive avec `usage`, jamais exclusive).
- Bloc `usage` (additif dans `components.json`) : `usage.rawHexForbidden` (bool), `usage.colorUtilityPrefixes` (liste de préfixes utilitaires porteurs de couleur, contrat-déclarée, jamais codée en dur dans le linter), `usage.rules[]` (règles déclarées avec `enforcement: "baseline" | "pivot-only"` — ex. `state-colour-icon`, co-occurrence sémantique hors de portée d'un string-scanner). Namespaces de couleur autorisés dérivés à l'exécution des clés top-level de `tokens.json § color.*`.
- Exemple de manifeste utility-first travaillé ; rétrocompatibilité explicite (manifeste BEM existant inchangé, mode par défaut = bem/détecté).

### Ajouté — `skills/enforce/adapters/lint-core.mjs`

- **Rule 3 — raw-hex forbidden** : si `usage.rawHexForbidden`, toute couleur hexadécimale brute dans un `style="…"` ou un bloc `<style>` inline est une erreur. Scopé à ces deux contextes CSS-value non ambigus pour éviter tout faux positif (ex. `href="#cafe"`).
- **Rule 4 — allowed colour namespaces** : en mode `utility-first`, pour chaque préfixe de `usage.colorUtilityPrefixes`, le segment de couleur d'une classe utilitaire (`bg-…`, `text-…`, …) doit résoudre à un groupe top-level de `tokens.json § color.*` — sinon erreur. Ensemble dérivé du contrat à l'exécution, aucune liste Tailwind codée en dur.
- Correctif (revue de code, avant tout commit) : ces mêmes préfixes sont à double usage en Tailwind réel (`text-lg`/`text-center`, `border-2`/`border-t`, `ring-2`/`ring-offset-2` ne portent aucune couleur) — la règle ne déclenche désormais que sur la forme `<namespace>-<NN|NNN>` (shade numérique 2-3 chiffres), seul signal fiable d'une référence de couleur pour ces préfixes ambigus. Limite connue et acceptée : un mot-clé de couleur nu sans shade (`bg-white`, `border-black`) n'est plus détecté s'il est hors contrat. Fixture `utility-dirty.html` étendue (`text-lg`, `border-2`, `border-t`, `ring-2`, `ring-offset-2` — doivent rester silencieux).
- **Gate de mode (A6)** : Rule 1 (`class-vocab`, BEM) ne s'exécute plus jamais quand `mode === "utility-first"` — élimine le faux-positif "0 hit" du finding #2. Mode dérivé de `manifest.mode` ou auto-détecté (`components` vide/absent ⇒ `utility-first`). Rules 3/4 restent inertes tant que `usage` est absent — zéro régression sur les manifestes BEM existants.

### Ajouté — `skills/enforce/fixtures/utility/`, `skills/enforce/fixtures/utility-{clean,dirty}.html`

- Fixture `tokens.json` + `components.json` (`mode: "utility-first"`, `components` absent, `usage` avec `rawHexForbidden` + `colorUtilityPrefixes` + règle `state-colour-icon` déclarée `pivot-only`).
- `utility-clean.html` (classes Tailwind-style dans les namespaces `brand`/`neutral`/`semantic` déclarés, aucun hex brut → exit 0) et `utility-dirty.html` (un hex brut inline `#ff00aa` + une classe `bg-red-500` hors namespace → exit 1).

### Modifié — `skills/enforce/SKILL.md`, `skills/enforce/actions/01-build-linter.md`, `skills/enforce/actions/03-lint-instances.md`

- Documentent les deux modes d'enforcement de vocabulaire (`bem`/`utility-first`) comme fonctionnalité de première classe du **baseline**, pas un mode dégradé du pivot.
- `01-build-linter.md` : `.lintrc.json` est un gabarit de référence projet (aucun fichier canonique n'existe dans ce plugin) — deux profils documentés (`bem` ciblant le HTML de wireframe, `utility-first` ciblant `**/*.{vue,jsx,tsx,html}`) avec les nouvelles sévérités (`rawHexForbidden`, `colorNamespace`, `stateColourIcon: pivot-only`).
- `03-lint-instances.md` : nouvelle section "Stack utility-first" — la boucle corriger→propager→re-lint porte sur les violations `usage`, cibles étendues au-delà du HTML.

### Modifié — `references/sc-pivot-contract.md`

- Le spec d'enforcement (`enforce → design-bridge`) porte désormais `Mode`, la section **"Token-usage rules"** (raw hex forbidden, colour utility prefixes, allowed colour namespaces, `usage.rules[]` déclarées avec leur `enforcement`) en plus des class sets/token paths existants, et une consigne dédiée pour que `sc-js:design-bridge` réalise nativement (AST/ESLint) les règles `pivot-only` (ex. `state-colour-icon`) **sans les réinventer** — elles voyagent verbatim depuis le contrat.

### Modifié — `skills/adjust/actions/02-freeze.md`

- Nouvelle étape 2bis : audit du bloc `usage` au figeage (mode écrit explicitement, `colorUtilityPrefixes` aligné sur la stack réelle, `state-colour-icon` déclarée au minimum si le design system a une notion de statut visuel).
- Table de bump version étendue : ajout/extension de `usage` → **minor** ; suppression d'un namespace ou d'une règle `usage` → **major**. Item de checklist ajouté au test de validité.

## [1.11.0] — 2026-07-05

Minor — **dimension thème/mode dans les tokens** — le contrat ne pouvait modéliser qu'un seul thème visuel ; un projet avec un mode sombre par classe **et** un second territoire thématique ("Grimoire") ne pouvait pas être contractualisé (le mode sombre finissait en Open question sans support de contrat). 1.11.0 ajoute un axe thème/mode additif et rétrocompatible, avec émission theme-aware des deux adaptateurs et un gate exécutable qui valide les références de tokens thémés.

### Ajouté — `references/token-schema.md`

- Nouvelle section **"Modes / themes"** : overlay top-level `themes` qui ne re-déclare que les tokens surchargés par thème/mode — l'arbre de base reste mono-valeur et DTCG-valide (rétrocompatible, aucune migration requise pour un contrat existant sans `themes`). Liste plate de thèmes nommés sur un seul axe (`default`, `dark`, `grimoire`, `grimoire-dark`), pas de matrice 2-D mode × thème. Invariant : un overlay ne peut surcharger qu'un chemin existant dans l'arbre de base, jamais en introduire un nouveau. Exemple travaillé `default` + `dark` + `grimoire` résolvant les alias par thème.
- § Adapter `tokens.css` : sous-section **"Theme-scoped emission"** — `:root` (base) + un bloc `.dark` / `[data-theme="…"]` par thème, ne re-déclarant que les vars surchargées, mêmes noms de `--var` qu'en base (pas de suffixe).
- § Adapter `theme.css` : note que les overlays de thème doivent être émissibles côté Tailwind v3 (`tailwind.config.js`) et v4 (`@theme`) — détail de l'artefact v3 hors scope, renvoyé à une part ultérieure du plan.

### Ajouté — `skills/enforce/fixtures/themed/`, `skills/enforce/fixtures/themed-{clean,dirty}.html`

- Fixture `tokens.json` avec overlay `themes.dark` (2 tokens surchargés) + `themes.grimoire` (1 token surchargé) sur une base de 3 tokens de couleur, et `components.json` minimal référençant un fond thémable (`surface`).
- `themed-clean.html` (référence uniquement des vars valides, y compris thémées → exit 0) et `themed-dirty.html` (référence un var thémé inexistant → exit 1, garde de non-régression).

### Modifié — `skills/enforce/adapters/lint-core.mjs`

- Commentaire ajouté près de `validVars` documentant la décision A2 (thèmes re-déclarent les mêmes noms de `--var` par bloc de sélecteur, jamais de suffixe) — **aucun changement de logique** : la Règle 2 valide déjà `var(--x)` indépendamment du bloc CSS où `--x` est déclaré.

### Modifié — `references/sc-pivot-contract.md`

- Les specs d'enforcement et de rendu portent désormais un champ `Themes:` (liste plate des thèmes nommés) pour que les pivots `sc-<techno>` émettent nativement les mêmes blocs theme-scoped (`.dark`/`[data-theme]`) et restent compatibles avec la cascade thème.

### Modifié — `skills/adjust/actions/02-freeze.md`

- Nouvelle étape d'audit (1d) : chaque chemin d'overlay `themes.*` doit exister dans l'arbre de base (erreur bloquante sinon) ; une entrée d'overlay ne porte que `$value` (jamais `$type`) ; `themes.default` est interdit.
- Table de bump version : ajout d'un thème ou d'un token surchargé → **minor** ; suppression d'un thème ou d'un chemin d'overlay → **major**.

### Modifié — `skills/adjust/references/manifest-schema.md`

- Nouvel invariant (6) : le contraste WCAG AA d'une variante sombre (`.backgrounds`) est vérifié contre la valeur **résolue dans le thème du variant**, jamais contre la valeur `default` par défaut.

## [1.10.0] — 2026-07-05

Minor — **durcissement du gate d'enforcement + résorption de dérive documentaire** — deux audits indépendants (dont un run réel sur un projet tiers, "choix-narratifs") ont remonté un bug de mapping token→var silencieusement faussé, une dérive documentaire sur les verbes remplacés, une étape d'arbitrage inutilement cérémonieuse, et un angle mort de câblage (`tokens.css` jamais importé dans l'app réelle). 1.10.0 ferme ces points en additif/rétrocompatible et ajoute un mode `--strict` optionnel pour distinguer les typos BEM des classes utilitaires.

### Corrigé — `skills/enforce/adapters/lint-core.mjs`

- **Bug critique** : la Règle 2 (référence `var(--token)`) reconstruisait le chemin de token en inversant `-`→`.`, ambigu dès qu'un segment de chemin contient déjà un tiret (`text-muted`, `semantic-grimoire`) → faux positifs "unknown token" (jusqu'à ~290 sur un run réel). Remplacé par un mapping direct chemin→var (`.`→`-`, jamais l'inverse), seule direction sans perte.
- Règle 1 (vocabulaire de classes) ne matchait que `class="…"` — étendue à `className="…"` pour couvrir JSX/TSX.

### Ajouté — `skills/enforce/adapters/lint-core.mjs` + `skills/adjust/references/manifest-schema.md`

- Mode `--strict` (opt-in, rétrocompatible) : toute classe de forme BEM (`__`/`--`) dont le bloc n'est pas déclaré devient un `warning` de typo potentielle, sauf si elle matche un préfixe du nouveau champ optionnel `$utilityPrefixes` du manifeste. Comportement par défaut inchangé (classes non déclarées = utilitaires, ignorées silencieusement).

### Corrigé — `references/token-schema.md`, `references/write-system-procedure.md`

- Dérive documentaire : références mortes à `/design:from-reference` / `/design:from-brief` (verbes remplacés par `define` depuis la fusion) corrigées vers `/design:define` / `04-write-material`.
- Formulation du "core trio" alignée sur son comportement réel (présentation non bloquante, pas une approbation attendue).
- Règle kebab/camelCase de l'adaptateur `tokens.css` clarifiée : transform mécanique `.`→`-` uniquement, aucun re-cassage de segment — évite une contradiction avec le camelCase intentionnel de certains groupes (miroir des noms de propriété DOM `getComputedStyle`, cf. `config-gen.py`).

### Modifié — `skills/adjust/actions/01-arbitrate.md`, `skills/define/SKILL.md`

- Étape d'arbitrage : la cérémonie de vote "motif dominant" ne se déclenche plus que pour des sources réellement concurrentes (maquettes divergentes) — le cas à direction unique (le plus fréquent) saute directement à la synthèse.
- Checkpoint "core trio" reformulé pour ne plus prétendre attendre une approbation qui n'est en réalité jamais bloquante.

### Ajouté — `skills/enforce/references/gate-wiring.md` (Gate 0)

- Nouveau point de câblage (le 4e) : import de `design/adapters/tokens.css` comme source unique dans l'app consommatrice, avant toute autre feuille de style — sans quoi l'app peut garder des `:root` concurrents qui dérivent silencieusement, un angle mort qu'aucun des 3 gates précédents ne couvrait.
- Hook pre-commit étendu au-delà du `.html` seul : `.astro`, `.vue`, `.jsx`, `.tsx`, `.svelte`.
- `skills/enforce/actions/02-wire-gates.md` : nouvelle étape de câblage/vérification de Gate 0.
- Terminologie "3 gates/points de câblage" → "4" propagée dans `SKILL.md`, `README.md`, `.claude-plugin/plugin.json`.

## [1.9.0] — 2026-06-16

Minor — **pont manifest → config oracle** — le config oracle (`measure.py`) était construit de zéro à chaque page, source de friction et d'oublis. `components.json` contient déjà les sélecteurs WP (classes BEM) et `tokens.json` les propriétés CSS à mesurer. 1.9.0 ferme ce gap.

### Ajouté — `adapters/measure/config-gen.py`

Génère un config oracle complet depuis `design/components.json` + `design/tokens.json` :
- **Targets** : un target par élément BEM (`elements.*`) + target racine par composant, sélecteurs dérivés directement du manifeste.
- **Props** : dérivées des groupes de tokens présents (`font.size` → `fontSize`, `color` → `color/backgroundColor`, `space` → `padding/gap`, `radius` → `borderRadius`, `shadow` → `boxShadow`, etc.).
- **Breakpoints** : dérivés de `tokens.breakpoint.*` (heuristique mobile/tablet/desktop) ou fallback 375+1440.
- **Hints oracle** : `check_text` et `collections` lus depuis le nouveau champ `components.oracle` si présent.
- Le config produit est un point de départ : vérifier que les sélecteurs résolvent sur les deux DOMs (measure.py signale `missing` sinon), surcharger le champ `maq` si la maquette utilise des classes différentes des classes DS.

### Modifié — `skills/adjust/references/manifest-schema.md`

Nouveau champ optionnel `oracle` par composant — ignoré par `enforce`, lu par `config-gen.py` :
- `oracle.elements.<elem>.check_text` : label dont le `textContent` doit matcher la maquette.
- `oracle.elements.<elem>.props` : surcharge la liste de props pour cet élément.
- `oracle.collections[]` : structures répétées à mesurer (`name` + `item_selector`), avec `ack` optionnel (P13).

### Modifié — `agents/copycat.md`

- **§3 (build config)** remplacé : démarrer par `config-gen.py` (contrat → config auto), puis étendre par inspection DOM pour les éléments hors manifeste et pour valider/surcharger les sélecteurs maquette. Ne plus construire le config de zéro.

## [1.9.1] — 2026-06-16

Patch — **`destructure` étendu aux lentilles UX et a11y approfondies** — la critique de direction incluait déjà une lentille accessibilité minimale ; deux nouvelles lentilles et un approfondissement de la lentille 3 couvrent les risques UX dès la phase divergente, avant `adjust`.

### Modifié — `skills/destructure/references/critique-lenses.md`

- **Lentille 3 — Accessibilité** : étendue — contrastes WCAG détaillés (AA corps vs AA grands titres), états portés uniquement par la couleur, cibles tactiles, presets-reduced-motion, **navigation clavier impliquée par la direction** (focus-trap modal, rôles ARIA implicites), emoji-icône (conservé).
- **Lentille 6 — États comportementaux (UX implicite)** : nouvelle — inventaire des états composants manquants (default/hover/focus/active/disabled/loading/error/empty), friction de flux, affordance des éléments cliquables, densité vs contexte d'usage.
- **Lentille 7 — Lisibilité & hiérarchie de lecture** : nouvelle — taille de corps, longueur de ligne, contraste de taille H1→H3, line-height, point d'entrée visuel, poids du CTA primaire.

### Modifié — `skills/destructure/SKILL.md`

- Description mise à jour : 7 lentilles listées explicitement.
- Classification des trouvailles : ajout de `risque UX` aux catégories existantes.

## [1.8.0] — 2026-06-16

Minor — **visual-diff pass intégrée dans la méthode copycat** — le gap entre « oracle CLOSED sur les éléments mappés » et « rendu visuellement fidèle » était comblé de façon ad-hoc (screenshot + demande LLM non structurée). La passe visuelle est maintenant un step de §4, produit des rows `source: visual` classifiées au même format que l'oracle, et ferme la boucle enforce existante.

### Ajouté — `references/visual-diff-procedure.md`

Procédure détaillée : commandes `screenshot.py` + `pixeldiff.py`, protocole d'analyse des zones magenta, filtrage du bruit (< 5px isolés), format de sortie des rows visuelles, règle de clôture (un delta visuel n'est pas clos par re-capture seule — re-mesurer l'oracle pour confirmer).

### Modifié — `agents/copycat.md`

- **§4 (run oracle)** : étendu en « run the full measurement suite » — l'oracle style (`measure.py`) et la passe visuelle (`screenshot.py` + `pixeldiff.py`) tournent sur la même config. Les diff images `-sbs.png` sont analysées zone par zone. Référence vers `visual-diff-procedure.md` pour le protocole.
- **§5 (classify)** : « for each delta in the JSON » → « from the oracle JSON **and** from the visual zones » — tous les deltas, quelle que soit leur source, passent par les mêmes routes de classification.
- **Outputs YAML** : `source:` ajoute `visual` ; `confidence: high | medium | low` ajouté (requis sur les rows visuelles, omis sur measured/derived). `visual_noise:` ajouté pour les zones low-confidence (signalées, non actionnées sans validation humaine).

## [1.7.0] — 2026-06-16

Minor — **P13 : mécanisme de sanction pour les collections** — les échecs `ok:false` ne pouvaient être ni sanctionnés ni omis proprement ; ils forçaient soit un gate OPEN permanent soit une exclusion silencieuse du config. P13 ajoute un `ack` par entrée de collection, miroir exact du `ledger` de ligne, validé par `--ledger-registry`.

### Modifié — `adapters/measure/measure.py`

- **P13 — `ack` sur entrée `collections`** : `{"ack":{"id":"DEV-xxx","reason":"..."}}` sur une entrée sanctionne une divergence de contenu/structure délibérée. L'entrée `ok:false` ackée est exclue de `collection_failures` → ne bloque plus le verdict. Son `id` est intégré dans `report["ledger_ids"]` et validé par `--ledger-registry` au même titre que les ids de ligne. Un ack sans `id` (non signé) : même comportement qu'une entrée de ledger non signée — appliqué mais signalé dans `ledger_ids` comme chaîne vide → seul `--ledger-registry` force OPEN.
- `_diff_collections` : propage `acked`, `ack_id`, `ack_reason` (et `ack_unused` quand `ok:true` + ack présent) depuis la config vers le rapport.
- `measure()` : après `_diff_collections`, intègre les `ack_id` des collections dans `report["ledger_ids"]` avant `_verdict` et `_validate_ledger_registry`.
- `_verdict` : `collection_failures` ne compte que les échecs non-ackés. `collection_acked` (nb de sanctions appliquées) et `collection_ack_unused` (sanctions inutiles — `ok:true` + ack) ajoutés au résumé si non nuls.
- `_summarize` : collections ackées → `~` (avec id), échecs non-ackés → `!`, acks inutilisés → `~` (avec note).

### Modifié — `agents/copycat.md`

- **§3 (build config)** : documentation de `ack` par entrée de collection — quand la divergence est un choix de contenu/métier délibéré (ex. stats SLA produit vs social-proof maquette), ajouter `"ack":{"id":"DEV-TBD","reason":"..."}`. Enregistrer dans `ds-deviation-ledger.md` d'abord. **Ne jamais omettre une collection divergente** — l'omettre la rend invisible à tous les runs futurs.
- **§5 (classify)** : route `collections` failure enrichie — si choix éditorial/métier assumé → `ack` + enregistrement registre (jamais omission) ; si alignement requis → fix à la source.
- **Invariant de clôture** `collection_failures == 0` : mis à jour — les entrées ackées sont exclues du compte mais leur `id` doit être enregistré dans `ds-deviation-ledger.md` (unsigned ack = gate non fermé).
- **Outputs YAML** `collections_checked` : ajout des champs `acked: bool`, `ack_id: DEV-xxx`.

## [1.6.0] — 2026-06-16

Minor — **P9–P12 : oracle et méthode copycat durcis** — P7/P8 rendus obligatoires dans la méthode de l'agent (check_text + collections désormais des défauts dans tout config Mode B, pas des options laissées à l'interprétation). Crash Windows corrigé. check_text ciblable par target. diff collections robuste aux réordonnancemements. Unification des conventions de référencement en `${CLAUDE_PLUGIN_ROOT}`.

### Modifié — `adapters/measure/measure.py`

- **P10 — Crash stdout Windows** : `sys.stdout.reconfigure(encoding="utf-8", errors="replace")` en tête de `main()`. Les caractères →/★/· de `_summarize` ne causent plus de `UnicodeEncodeError` sur les terminaux cp1252 Windows. Le rapport JSON était déjà UTF-8 (`ensure_ascii=False`) ; seule la console était vulnérable.
- **P11 — `check_text` ciblable par target** : `_GRAB` JS évalue maintenant `t.check_text !== undefined ? t.check_text : check_text` — un flag par cible surpasse le défaut global. La détection côté Python (`measure()`) vérifie la présence de `__text` dans le résultat JS, pas le flag global. Evite les dizaines de lignes `prop:"text"` non-match sur les cibles en prose (corps, testimonials) qui nécessiteraient un ledger individuel et réintroduiraient l'interprétation humaine.
- **P12 — `_diff_collections` LCS** : le diff par index est remplacé par un alignement `SequenceMatcher` (LCS). Une insertion en tête ne cascade plus tous les items suivants en "mismatch". `missing_in_wp`/`extra_in_wp` (set-based) restent les données d'entrée du verdict ; `diffs[]` est une trace lisible.
- `import sys`, `from difflib import SequenceMatcher` ajoutés aux imports.
- Docstring config : `check_text` documenté avec sa sémantique per-target (P11).

### Modifié — `agents/copycat.md`

- **P9 — P7/P8 obligatoires dans la méthode** :
  - **§2 (complétude structurelle)** étendu : inventorier les structures répétées (stats, grilles de cartes, nav, FAQ, steps, groupes de boutons) → une entrée `collections` par structure. Inventorier les libellés-clés singletons → couverts par `check_text` per-target. La complétude couvre maintenant les contenus invisibles à `getComputedStyle`.
  - **§3 (build config)** : `check_text: true` par cible de libellé-clé et `collections` par structure répétée sont désormais des **défauts obligatoires** dans tout config Mode B. Garde-fou sélecteur : vérifier `maq_count`/`wp_count` avant d'interpréter les diffs (un sélecteur trop large pollue la séquence).
  - **§5 (classify)** : routes ajoutées — `prop:"text"` non-match → content/markup/ledger selon la nature ; échec `collections` → content/structure, traité comme `missing_sections`.
  - **Invariants de clôture** : deux cases ajoutées — `summary.collection_failures == 0` ET toute ligne `prop:"text"` matchée ou ledgerée. Description du verdict corrigée (était "closed iff 0 diff AND 0 missing AND no missing_in_wp AND coverage ok", périmée depuis 1.5.0 — inclut maintenant collections et text).
  - **Outputs YAML** : `collections_checked` ajouté ; `prop:` annoté `text` parmi les valeurs valides.
- Conventions de référencement : `design/references/sc-pivot-contract.md`, `enforce/adapters/wordpress.md`, `references/correspondence-table-template.md` → `${CLAUDE_PLUGIN_ROOT}/...` (unification #1 du plan d'audit).

### Modifié — `skills/*/SKILL.md`, actions, adapters (refactoring pur)

- Unification des conventions de référencement sur `${CLAUDE_PLUGIN_ROOT}/...` dans tous les SKILL.md (enforce, adjust, diffuse, define, destructure) et leurs fichiers d'action/adapter. Findings #1 et #4 de l'audit architecture 2026-06 résolus.

## [1.5.0] — 2026-06-16

Minor — **oracle P7+P8** : parité de texte et parité de collection — les écarts de contenu/structure (eyebrow manquant, libellé bouton, stats 3 vs 4 items) passaient silencieusement ; ils alimentent maintenant le verdict OPEN.

### Modifié — `adapters/measure/measure.py`

- **P7 — Parité de texte (`check_text`)** : nouveau flag config `"check_text": true`. Quand actif, `_GRAB` capture le `textContent` normalisé de chaque target et émet une ligne `{prop:"text", match}`. Coût quasi nul (DOM déjà chargé). Attrape les dérives de libellé (eyebrow "Offre …", bouton "Être rappelé").
- **P8 — Parité de collection (`collections`)** : nouvelle clé config `"collections": [{name, maq:<sél>, wp:<sél>}]`. `_COLLECT` énumère tous les éléments correspondants, `_diff_collections` diffe les séquences normalisées → `maq_count`, `wp_count`, `diffs[{index,maquette,wp,match}]`, `missing_in_wp`, `extra_in_wp`, `ok`. Chaque entrée `ok:false` alimente le verdict OPEN exactement comme `missing_sections`. Mesuré une fois (contenu layout-indépendant). Attrape stats 3 vs 4 items, items manquants (étoiles), items en trop ("48 h délai").
- `_verdict` : intègre `failed_collections` dans les `reasons` + `collection_failures` dans le résumé.
- `_summarize` : affiche les collections en échec.

### Config (additions)

```json
"check_text": true,
"collections": [
  {"name": "Stats hero", "maq": ".hero__stat", "wp": ".hero__stat"}
]
```

## [1.4.0] — 2026-06-16

Minor — **durcissement oracle + agent copycat** : 6 corrections issues d'observations terrain (projet SARL). P1–P2 : intégrité du ledger (id obligatoire, registre canonique, entrées inutilisées). P3 : isolation frame active. P4 : `coverage_ack` structuré. P5 : `!important` WP documenté. P6 : route "remove-override" codifiée.

### Modifié — `adapters/measure/measure.py`

- **P1 — Clôture du ledger** : chaque entrée `ledger` doit porter un champ `id` (DEV-xxx). Les ids sont systématiquement reportés dans `summary.ledger_ids` pour revue humaine. Nouveau CLI `--ledger-registry <path>` : si fourni, chaque id est vérifié dans le fichier registre ; un id absent force `verdict=OPEN` avec raison explicite. Les entrées sans id sont appliquées mais signalées comme "non signées" dans `ledger_ids` (chaîne vide).
- **P2 — Ledger inutilisé** : `_apply_ledger` calcule `ledger_unused` (entrées ne correspondant à aucun diff réel — delta déjà corrigé ou sélecteur fantôme). Reporté dans le JSON top-level ET dans `_summarize`. Non-bloquant pour le verdict mais visible : signale le gonflement du ledger.
- **P3 — Isolation du frame actif** : `_prepare_mockup` détache du DOM les `.preview-frame` non-actifs après `setViewport()`. Chaque breakpoint ouvre une page fraîche (`ctx.new_page()`), le détachement est donc sans effet de bord sur les autres breakpoints. Règle le bug SARL où `document.querySelector(sel)` frappait le frame desktop lors de la mesure mobile.
- **P4 — `coverage_ack` structuré** : accepte désormais un dict `{"sections":[…],"reason":"…"}` avec liste de sections non vide pour désactiver la garde. Un `true` brut (legacy) déclenche un avertissement de migration (le dict est requis) ; il est encore accepté mais la garde reste active s'il n'y a pas de liste `sections`. Le champ `ack_sections` est écrit dans `coverage` pour traçabilité.

### Modifié — `agents/copycat.md`

- **P1 — Write-through registre** : invariant de clôture renforcé — une entrée `ledger` en config DOIT avoir un `id` ET cet id doit exister dans `ds-deviation-ledger.md` du projet. Citer le config-ledger sans entrée registre n'est pas une clôture. Procédure : enregistrer dans le registre d'abord, puis référencer l'id.
- **P4** : `coverage_ack` mis à jour dans l'invariant (dict requis, `true` brut rejeté).
- **P6 — Route "remove-override"** : route nommée dans l'étape Classify — quand la correction est de supprimer un style concurrent (attr bloc WP, inline style, classe utilitaire) pour que le CSS composant gouverne seul → `routed_layer: markup`, `action: align`, `action_detail: remove-override`. Préférée à un counter-`!important`. Les entrées ledger proposées doivent inclure un `id` placeholder (DEV-TBD) pour assignation humaine.

### Modifié — `skills/enforce/adapters/wordpress.md`

- **P5 — `has-*-font-size` et `!important`** : nouvelle section documentant que WP génère ces classes avec `!important`. Un override CSS composant sans `!important` ne gagne pas la cascade. Route préférée : supprimer l'override de markup (`remove-override`) ; alternative : counter-`!important` documenté.

## [1.3.0] — 2026-06-16

Minor — **skill `harness`** : générateur de maquette de référence HTML autonome.

### Ajouts

- **Skill `harness`** (`skills/harness/SKILL.md`) — génère un fichier HTML standalone exposant `window.setPage(key)` / `window.setViewport(mode)` + barre `.preview-bar` (page selector + boutons device Desktop/Tablette/Mobile). Paramètres : `--out`, `--title`, `--pages "key:Label, …"`, `--pages-json`. Défaut : une page placeholder `page-1`. Piloté par l'oracle `measure.py` et l'agent `copycat`.
- **Adaptateur `adapters/harness/harness.py`** — générateur Python (stdlib uniquement, aucune dépendance). Responsive class-based (`.preview-frame.mobile|tablet`), pages en fonctions JS (isolation DOM par page), optgroups supportés dans le sélecteur, hash URL pour navigation directe.

### Contrat

- **Responsive** : variations device via `.preview-frame.mobile <sel>` / `.preview-frame.tablet <sel>` dans le `<style>` du `<head>`. `@media` fonctionne sous l'oracle (viewport réel) mais pas pour l'aperçu manuel — le class-based est préféré.
- **Scroll** : `overflow:hidden` sur body/html → `.preview-stage` est le seul scrolleur (contrainte oracle).
- **Pages** : fonctions JS (seule la page active est dans le DOM → pas de collision de sélecteurs entre pages).
- **Oracle** : `.preview-bar` masquée avant mesure ; sélecteurs stables/BEM ; un seul `h1` par page.

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
