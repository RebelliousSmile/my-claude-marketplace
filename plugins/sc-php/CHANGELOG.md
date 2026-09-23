# Changelog — sc-php

## [0.15.0] — 2026-09-23

### Added

- `design-bridge` adapte les tokens couleur, tailles typographiques et espacements vers les presets
  `theme.json`, avec slugs déterministes, overlays nommés et frontière générée explicite.

### Changed

- Le réceptacle PHP étend un checker brownfield marqué dans sa commande existante et refuse les points
  d'intégration ambigus. La cohérence `theme.json` contrôle désormais les valeurs contre l'échelle active.

### Verification

- Les fixtures prouvent la préservation des clés humaines, la suppression des presets générés obsolètes,
  l'idempotence, la résolution d'overlay et le refus des collisions ; 6 tests FSE/Chromium passent.

## [0.14.2] — 2026-09-16

### Changed

- `cd automata` délègue son enveloppe de livraison à `overcode:deploy`.

## [0.14.1] — 2026-08-28

### Fixed

- `sc-php:audit` délègue à `aidd-dev:04-audit` avec le pilier `code-quality` et conserve le rapport AIDD comme artefact autoritatif ; le README reflète ce contrat.

## [0.14.0] — 2026-08-28

- CD v2 multi-cibles et miroir WordPress staging différentiel ; données, contenu et uploads de production protégés.

## [0.13.1] — 2026-08-28

### Fixed

- `cd server` préserve désormais la façade racine réellement détenue par le projet — Composer, pnpm, npm ou équivalent — et n'ajoute plus `composer.json` autour d'une procédure WordPress déjà cohérente.
- Les stratégies WordPress sont choisies d'après les capacités vérifiées de chaque cible. Un hébergement disposant de davantage de libertés conserve rsync, WP-CLI distant, sauvegardes ou automatisation, sans être ramené aux limitations d'un autre hébergeur.
- Les alias dont le nom masque un périmètre plus large, par exemple une commande `theme` qui transfère aussi plugin et médias, sont traités comme conflits sémantiques à corriger ou arbitrer.

## [0.13.0] — 2026-08-28

### Added

- Skill `cd` pour WordPress, Laravel et Symfony : wp-env/Docker en local, façade Composer en production et synchronisations WordPress bornées par surface.

### Changed

- `setup wire-deploy` devient une route de compatibilité vers `cd server` ; les anciens scripts et cibles sont migrés derrière une seule façade sans écrasement silencieux.

## [0.12.0] — 2026-08-14

### Added

- Patterns FSE natifs `patterns/*.php` avec en-têtes auto-enregistrés complets et validation de la grammaire de blocs.
- Entrée CSS design partagée entre front et éditeur, plus `fse-bindings.css` pour les éléments peints internes de `core/button` et `core/navigation-link`.
- Enrôlement effectif du même handle par `enqueue_block_assets` dans le canvas iframe et binding navigation compatible avec le porteur front comme éditeur.
- Gate de propriété de cascade front/canvas éditeur, fixtures adversariales et intégration wp-env explicite.

### Changed

- `pnpm wp` est l'unique accès WP-CLI documenté dans la chaîne sc-php.
- Les attributs de présentation Gutenberg concurrents sont retirés lorsque le contrat DS possède la propriété ; la fermeture exige ensuite la provenance gagnante, pas seulement la valeur calculée.

## [0.11.1] — 2026-08-06

### Fixed — la table `## Phases` du workflow FSE ne disait pas où ses phases s'insèrent

Quatre phases `off-funnel` sur six lignes, et rien qui dise à quel moment de la séquence elles tombent : la fusion avec la séquence de verbes de la classe était laissée à l'interprétation du lecteur. Colonne **`position`** renseignée pour les six lignes (`design` ≥ 2.11.0, `sc-pivot-contract.md § Déclaration de phase`) : environnement mesurable `avant define`, modèle de contenu `avant enforce`, import `après diffuse`, déploiement `fin`, `—` pour les deux phases qui instancient un verbe.

Le placement du modèle de contenu est justifié dans le fichier, à côté de la table : **avant `enforce`** et non avant `diffuse`, parce que les vues des types sont ce que le gate vocabulaire linte et ce que le périmètre de mesure énumère. Placée plus tard, la phase laisse les deux gates verts sur un dénominateur amputé — le défaut même que 0.11.0 a fermé.

## [0.11.0] — 2026-08-06

### Added — le modèle de contenu n'appartenait à personne dans la chaîne maquette → site FSE

Trou relevé en routant un cas `mockup-multipage` réel : référence de onze pages, dont deux intitulées
« Modèle — `<nom au singulier>` », plus leurs deux listes et un formulaire de soumission. Après scaffold,
`register_post_type` : **zéro occurrence** dans le thème comme dans le plugin. Et rien dans la chaîne ne
devait en produire.

- **Aucun verbe design ne produit de types de contenu, par construction.** `design` détient le vocabulaire
  visuel, `design-bridge` le rendu natif ; le modèle de données n'appartient ni à l'un ni à l'autre, et le
  contrat de pivot a raison de ne pas le lui donner. Les seules mentions de CPT dans `sc-php` étaient
  **consommatrices** — `builder-coverage` qui scanne `--post_type=…`, `sniff` qui traite les slugs
  d'enregistrement comme cible de lint. Jamais productrices.
- **`setup` ne pouvait pas combler le trou** : `02-scaffold-wordpress` s'exécute sur un dossier vide, avant
  que la référence n'existe. Son squelette est figé à trois templates génériques et un `includes/` vide.
- **Nouvelle phase `off-funnel` *Établir le modèle de contenu*** dans `workflow-fse.md`, entre la
  préparation de l'environnement et l'enforcement natif. Le squelette du contrat l'autorisait déjà — le
  pivot ajoute ses phases `off-funnel` (`sc-pivot-contract.md § Déclaration de phase`) ; aucune extension
  du contrat n'a été nécessaire, et aucun gate nouveau n'est introduit.
- **`references/content-model-fse.md`** porte le COMMENT : trois signatures qui distinguent un spécimen
  d'une page (page « Modèle — X », liste de cartes homogènes, page de soumission), la règle de preuve — un
  type se prouve par au moins deux vues, une page unique n'est jamais un type —, l'enregistrement dans le
  plugin et jamais dans le thème (un CPT enregistré par le thème rend son contenu inatteignable au
  changement de thème), les paramètres non facultatifs en FSE (`show_in_rest`, `has_archive`, `supports`
  énuméré, `rewrite['slug']` pris sur la référence, `register_post_meta`, régénération des règles de
  réécriture hors de `init`), les templates dérivés, et une vérification à contre-épreuve.
- **Le mode de défaillance est nommé parce qu'il est invisible** : sans `single-<type>.html`, la hiérarchie
  sert `single.html`. Ni le code HTTP, ni la présence de `wp-site-blocks`, ni l'absence d'erreur ne
  distinguent ce cas du cas nominal. D'où l'étape 4 de la vérification — retirer le template et rejouer :
  la réponse doit rester 200 et le marqueur disparaître. Sans cette bascule, l'étape précédente n'atteste
  que la disponibilité du site. Même motif que le `wp core version` de 0.10.3.

### Fixed — `02-render` livrait des patterns que rien ne posait

Même motif que le trou du modèle de contenu, relevé en remontant la chaîne : la chaîne produit un artefact
et personne ne l'intègre. `02-render` écrivait `patterns/<name>.html` puis passait au gate. Or un pattern
enregistré n'est rendu nulle part — il entre dans l'inserteur, et c'est tout. Le gate de vocabulaire linte
le fichier du pattern et sort vert ; le gate de fidélité mesure des templates qui ne le contiennent pas et
sort vert. Deux verts, site inchangé.

L'ancienne étape 5 ne couvrait que le cas d'un pattern **déjà en base** à re-propager, via « le script
d'import du projet » — qui n'existe pas sur un projet neuf. Le cas de la première pose n'était traité nulle
part, et le spec de rendu ne pouvait pas le porter : son `Render target` nomme un langage et un répertoire
de sortie, jamais un point d'insertion, et `03-pivot` a interdiction de transporter des contraintes de
plateforme. Le placement appartenait donc à ce réceptacle, qui ne le réclamait pas.

- **Étape 5 — Poser le pattern**, avec trois destinations exclusives : référence `wp:pattern` dans un
  template, copie dans `post_content`, ou **aucune assumée**. La troisième est un statut déclaré
  (`posé: non — brique d'auteur`), jamais un silence : sans elle, un pattern oublié et un pattern
  délibérément non posé laissent la même trace. La propagation devient l'étape 6.
- **Ligne `Posé dans :` dans la sortie attendue**, avec le marqueur qui le prouve. Un `patterns/` peuplé
  n'est pas une preuve de pose.
- **Piège 2 étendu aux templates** : un template sauvegardé depuis l'éditeur de site est copié en base
  (`wp_template`) et cette copie **prend le pas sur le fichier du thème**, pattern aplati compris. Le
  fichier corrigé ensuite ne change plus rien à l'écran, sans erreur ni avertissement — le diagnostic est
  une question (ce template existe-t-il en base ?), pas une inspection du fichier.

### Fixed — « énumérer tous les templates du thème » rendait vert sur un dénominateur amputé

Le § *Périmètre de mesure* de `workflow-fse.md` et le piège 10 de `wordpress-pitfalls.md` traitaient déjà
`single-<cpt>.html` et `archive*.html` comme un trou d'**oracle** : un template sans config est un manque
déclaré. Ils ne couvraient pas le cran au-dessus — un template **qui n'existe pas** ne manque pas à
l'énumération. Trois templates génériques énumérés, trois mesurés, trois verts, et les vues des types que
la référence implique hors du dénominateur : la règle rendait exacte une couverture complète d'un thème
incomplet.

- **Règle d'antériorité** ajoutée au § *Périmètre de mesure* : l'énumération n'est recevable qu'après la
  phase de modèle de contenu, et chaque type de l'inventaire doit y avoir ses lignes — `measured` ou
  `unmeasured(<raison>)`. Un inventaire sans lignes correspondantes invalide le bilan aussi sûrement qu'un
  template sans ligne.
- **Piège 10 étendu** : la distinction manque de mesure / manque de production est écrite, avec sa
  résolution — la phase, jamais une config d'oracle supplémentaire.
- **`theme-plugin-skeleton.md` et `02-scaffold-wordpress.md` énoncent leur propre limite.** `includes/`
  vide et trois templates génériques se lisaient comme un état complet ; l'action prescrit désormais de
  dire ce qu'elle ne fait pas et où la suite se traite.

## [0.10.4] — 2026-08-06

### Fixed — le garde `COMPOSE_PROJECT_NAME` produisait un nom qui ne nommait pas le projet

Défaut relevé en exécutant `setup` contre un projet déjà scaffoldé (`arbre-de-jade/_code`), puis corrigé et rejoué.

- **Un dossier feuille générique rendait un nom Compose partagé.** La dérivation ne lisait que `Split-Path -Leaf`, donc `arbre-de-jade/_code` rendait `COMPOSE_PROJECT_NAME=code`. **Mesuré** : `docker volume ls` montrait déjà un `code_webpool_pgdata` appartenant à un projet sans rapport — deux projets sur le même nom, donc sur les mêmes conteneurs et volumes. La référence assumait pourtant l'absence d'anti-collision comme un choix (« peu de projets en parallèle ») : le choix était faux dès qu'un `_code` est en jeu, et ce motif est justement celui des projets de ce terrain. `Get-SafeComposeProjectName` porte désormais une liste `$genericNames` (`code`, `src`, `app`, `www`, `web`, `site`, `public`, `project`, `workspace`) ; quand le dossier feuille y figure, le parent le préfixe — `arbre-de-jade-code`. Rejoué : nom distinct, conteneurs et volumes séparés. Pas de hash : le nom reste lisible dans `docker ps`.
- **Le coût de la bascule n'était documenté nulle part.** Changer la dérivation sur un projet déjà démarré crée des volumes neufs et laisse les anciens orphelins — attendu. Ce qui ne l'est pas : le cache wp-env est indexé sur le **chemin** (`~/.wp-env/<hash>`), pas sur le nom Compose, donc il tient l'installation pour déjà faite et wp-cli rend `The site you have requested is not installed. Run 'wp core install'` sur une base vide. **Mesuré**, puis levé par `wp-env start --update`. La séquence de bascule (stop sous l'ancien nom → modifier les trois scripts → `start --update` → réactiver le thème) est écrite dans la référence, avec la mention que les volumes orphelins se suppriment à la main et jamais automatiquement.

## [0.10.3] — 2026-08-05

### Fixed — le scaffold WordPress de `setup` produisait un site blanc, et son test ne pouvait pas le voir

Le flow `01 → 02 → 06` a été exécuté **littéralement** contre Docker et WordPress 7.0.2, puis rejoué contre les références corrigées. Sept défauts, tous mesurés, la plupart avec contre-épreuve. Constat : `aidd_docs/tasks/2026_08/2026_08_05-constat-bootstrap-wordpress-fse.md`.

- **`theme-plugin-skeleton.md` déclarait cinq fichiers `.html` sans en spécifier le contenu nulle part.** Mesuré : thème actif, HTTP 200, `.wp-site-blocks` **absent**, `body.innerText` de **zéro caractère**. Les cinq fichiers portent désormais leur markup de bloc (header/footer en `template-part`, boucle `wp:query` avec pagination et `query-no-results`, `post-title`/`post-content` pour `single`/`page`), et `theme.json` les rattache par `templateParts`. Rejoué : **161 caractères** rendus, `<header>`/`<main>`/`<footer>` présents, `single.html` et `page.html` vérifiés séparément.
- **Le *Test* de l'action ne pouvait pas échouer sur ce défaut** — `wp core version` retourne `7.0.2` sur un site à zéro caractère. Remplacé par un test qui mesure le rendu (`wp-site-blocks` dans la page d'accueil) et l'activation du thème. Même motif que les pivots orphelins : une sortie verte qui n'atteste rien.
- **`tests.port: 8889` était codé en dur** alors que le port du site est paramétrable. Mesuré : `Bind for 0.0.0.0:8889 failed`, et — c'est là le vrai défaut — **l'échec du conteneur de tests fait échouer `wp-env start` en entier**, rendant toute commande ultérieure impossible pour un port qui ne sert pas le site. `"testsEnvironment": false` remplace le bloc `env` ; rejoué avec 8889 toujours occupé par un voisin : démarrage complet.
- **Le garde `COMPOSE_PROJECT_NAME` était absent d'exactement les deux endroits où la skill demandait de taper une commande Docker.** Mesuré : six conteneurs up, `service "cli" is not running`. Ajout de `scripts/wp.ps1` (troisième script du garde) et de `pnpm wp <commande>` comme seule forme prescrite ; `deploy.mjs` pose désormais la même variable, ce que sa propre section *Wiring additionnel* exigeait déjà. Contre-épreuve dans la même exécution : forme nue → `service "cli" is not running`, wrapper → `7.0.2`.
- **`WP_DEFAULT_THEME` n'active rien** — la constante ne s'applique qu'à `wp core install`, que wp-env a déjà fait. Mesuré : `WP_DEFAULT_THEME` correctement posée, `get_stylesheet()` rendant `twentytwentyfive`. Retirée du template ; l'activation devient une **étape explicite** de l'action. Rejoué : `twentytwentyfive` → `fse-bootstrap`.
- **`Requires at least: 6.5` contre `theme.json` v3**, qui exige 6.6 (dev-note core du 2024-06-19). Aligné sur 6.6, avec la raison écrite dans la référence.
- **Deux placeholders déclarés que l'action ne collectait pas** : `{{THEME_NAME}}` et `{{PLUGIN_NAME}}` sont les en-têtes `Theme Name:` / `Plugin Name:` sans lesquels WordPress ne reconnaît rien. Les *Inputs* collectent maintenant quatre valeurs, pas deux.
- **Le garde ne dérivait qu'une chose sur deux : le nom du projet, pas le répertoire d'exécution.** wp-env comme Docker Compose résolvent le projet depuis le répertoire **courant**, jamais depuis l'emplacement du script — un `.ps1` lancé par son chemin absolu depuis ailleurs pose le bon `COMPOSE_PROJECT_NAME` et cible quand même le vide. **Mesuré** sur le terrain jetable de la contre-épreuve `design:harness` : `& <racine>\scripts\stop.ps1` depuis un dossier tiers rend `Environment not initialized. Run wp-env start first.` avec les trois conteneurs up, script en échec et **projet laissé debout** ; la même ligne depuis la racine rend `Stopped WordPress.` — seule différence, le répertoire courant. Variante Compose, contre-épreuve appariée sur un projet témoin d'un service : sans `Push-Location`, `no configuration file provided: not found` et exit 1 ; avec, le service est résolu, exit 0, et le répertoire de l'appelant est rendu par le `finally`. Les trois scripts (`start`, `stop`, `wp`) portent désormais `Push-Location $ProjectRoot` / `finally { Pop-Location }` et propagent `$LASTEXITCODE`, `deploy.mjs` passe `cwd: projectRoot` à chaque `execSync`, et les *Tests* des trois actions de scaffold prescrivent d'exercer les scripts **depuis un autre répertoire** — lancés à la racine, ils passent avec ou sans le garde, donc n'en attestent rien.
- **Le bloc `env` était déprécié** par wp-env. Retiré. Nuance mesurée sur `@wordpress/env` 11.12.0 : `testsEnvironment` est nommée dans le message de dépréciation mais, seule, n'en déclenche aucun.

### Changed — le terrain est du matériau, pas du contenu

Cinq références et deux actions nommaient un projet client et un hébergeur en clair (`pitfalls.md`, `docker-compose-laravel.md`, `deploy-pipeline.md`, `SKILL.md`, `05-wire-deploy.md`). La provenance — « généralisé depuis un déploiement réel » — porte tout ce que le lecteur a besoin de savoir ; le nom ne portait rien. Les terrains nommés dans le pivot `sniff/capabilities/tools/testing.md` restent : là, ils rendent la mesure traçable, ce qui est leur fonction.

## [0.10.2] — 2026-08-05

### Fixed — le corps illustré de `Case A` se lisait comme la liste à reproduire (S8, rouge au run 3)

`sniff/02-install-pivots` posait sa clause de sortie sur le seul **en-tête** — *Pick the header by what actually happened* — et ne disait rien du corps. Le bloc *Case B* voisin, lui, porte `Use this header verbatim`. Le fichier posait donc une norme de copie littérale sur un bloc et **aucune contre-instruction sur l'autre** : un lecteur qui reproduit *Case A* énumère les cibles des tables au lieu de celles qu'il a écrites. C'est le contrôle négatif **S8** de `plugins/web-tiers/skills/setup/evals/pivot-install-scenarios.md`, laissé délibérément non jugé en 0.3.0 et rendu **FAIL** au run 3 sur les quatre installeurs `sniff`.

- **Marqueur d'exemple** sous chaque famille du bloc : `… one line per target actually processed`.
- **Contre-instruction** au-dessus du bloc : les blocs sont des *formes, pas des contenus*, et seuls les pivots que le manifeste liste sont traités — un projet détecté Laravel seul émet deux lignes, `perf-pivots-symfony.md` et `perf-pivots-wordpress.md` n'apparaissent **pas même en `skipped`**.
- **Les `(skipped — not applicable)` sont retirés du corps illustré.** Ils contredisaient la règle d'installation du fichier lui-même, qui boucle *For each pivot in the manifeste* : un pivot absent du manifeste ne peut jamais ressortir en `skipped`. Ajouter le marqueur ne suffisait pas — ce que l'exemple **montrait** était faux.

## [0.10.1] — 2026-08-03

### Fixed — l'en-tête d'installation est dérivé de ce qui a été écrit

`sniff/02-install-pivots` n'avait qu'un bloc de sortie, en-tête `✅ pivots installed` compris. Une bibliothèque PHP ou un outil CLI, sans framework ni ORM, recevait donc « pivots installed » alors qu'aucun fichier n'était écrit — et le cas se rencontre d'autant plus ici que le plugin cible aussi bien des dépôts sans `composer.json` que des installations WordPress. La sortie se branche maintenant en trois cas : au moins un pivot écrit ou mis à jour · **rien à installer** (en-tête `✅ sc-php sniff — nothing to install`, verbatim) · tout déjà à jour.

## [0.10.0] — 2026-07-30

### Added — pivot `testing`, mesuré sur deux mondes PHP qui ne partagent presque rien

- **`skills/sniff/references/capabilities/tools/testing.md`** (nouveau) — quatrième implémenteur du contrat `plugins/overcode/skills/control/references/pivot-contract.md`, écrit **en anglais** comme les dix autres fichiers `capabilities/` du plugin, titres de sections repris verbatim des noms de champs, aucune table de correspondance due. Trois terrains en lecture seule, parce qu'une seule mesure aurait décrit un seul des deux mondes de cette stack : une boutique PrestaShop à neuf modules (PHP 8.4.11, PHPUnit 10.5.63, deux suites exécutées de bout en bout — 46 et 29 tests), une installation WordPress complète versionnée, et un dépôt WordPress dont la racine **est** `wp-content`.
- **L'unité de mesure n'est pas le dépôt, c'est le composant.** Mesuré : neuf modules sous `modules/`, chacun son dépôt git, son `composer.json`, son `vendor/` et son `phpunit.xml.dist` ; **aucune commande racine ne les exécute**. Une mesure lancée depuis la racine du projet rend *zéro test* sur un projet qui en porte 225. C'est la première fois qu'un pivot doit dire qu'un projet n'a pas de point d'entrée unique.
- **La couverture échoue en silence avec un code de retour 0.** Sans driver installé, `phpunit --coverage-clover` avertit, affiche `OK, but there were issues!`, **sort 0** et **n'écrit aucun fichier** — mesuré. Un consommateur qui lit le code de retour conclut au succès puis ne trouve pas le rapport. C'est le cas d'application le plus net de la clause de prérequis entrée au contrat en 4.2.0 (DEC-009) : la commande de constat est `php -m` / `extension_loaded()`, et l'absence de Xdebug ou de PCOV est une propriété de la machine, jamais un défaut du projet mesuré.
- **`phpdbg -qrr` ne fournit plus de couverture** — conseil très répandu, mesuré faux sur PHPUnit 10 : même avertissement, même code 0, aucun fichier.
- **Un `vendor/bin/phpunit` présent peut être mort.** Mesuré sur deux modules : le binaire existe et sort en `Class "PHPUnit\TextUI\Application" not found`, l'autoloader ayant été régénéré sans les dépendances de développement pendant que `vendor/phpunit/` restait sur le disque. Le constat fiable est `installed.json`, pas l'existence du fichier.
- **Un `composer.json` sans `require-dev` ne signale pas un composant sans tests** — même contre-signal que le `[dev-dependencies]` absent de `sc-rust`, mesuré ici sur un module dépouillé pour l'empaquetage qui porte 93 méthodes de test et un `phpunit.xml.dist`.
- **L'univers source WordPress est le contre-exemple du glob naïf** : 1640 fichiers `**/*.php` dont **86 appartiennent au projet** (5,2 %), le reste étant le cœur et des extensions tierces. Et le layout ne se déduit pas de la stack — deux dépôts WordPress mesurés, univers opposés, discriminant : la présence de `wp-includes/` à la racine.
- **L'E2E d'un projet PHP n'est ordinairement pas en PHP.** Mesuré sur les deux terrains web : Playwright piloté depuis `package.json`. Le champ le dit plutôt que de nommer un outil PHP qu'aucun terrain n'utilise.

## [0.9.0] — 2026-07-28

### Added — `builder-coverage` : le scan inverse

- **`actions/scripts/orphan-selectors.mjs`** (verdict `ORPHANS: N`, exit 1 si non nul). `01-scan` part du contenu en base et voit les classes utilisées sans pattern ; ce script part du CSS et liste les classes **déclarées sans aucun consommateur** dans le markup — templates, parts, patterns, rendus SSR, JS. Le cas visé est une famille CSS portée depuis une maquette dont le markup n'a jamais été écrit : le CSS est complet, personne ne le voit, et rien ne le signalait. Limite assumée et affichée plutôt que masquée par une heuristique — une classe assemblée à l'exécution (`"prefix-" . $i`) n'est pas détectée comme consommée, le script signale le fragment pour arbitrage manuel.

### Changed

- **Les titres `H1` des actions ne portent plus leur numéro** — `# Explain`, plus `# Action 01 — explain`. Le numéro vivait à trois endroits, il n'en occupe plus que deux : le nom de fichier et la table de `SKILL.md`, que le gate de cohérence du marketplace compare désormais. Changement transversal aux onze plugins, détaillé dans le journal du marketplace (3.4.0).

## [0.8.1] — 2026-07-27

### Fixed — discipline de sévérité (l'audit alimente des mutants)

Même correctif transversal que sc-css/sc-rust, transposé au PHP. `legacy/01-scan` et `improve` sont read-only mais `legacy/02-migrate` mute (écriture in-place). Correction **inline**, conditionnée à une propriété **mesurée**, jamais à une stack supposée. (Classe C — code mort indécidable — absente ici : le plugin ne prétend nulle part prouver du code mort au scan.)

- **(A) Verdict sur propriété supposée → mesurée.** Le détecteur DIP flaguait tout `new ClassName()` en présupposant un conteneur DI. Désormais : ne flaguer que l'instanciation d'un **service** (jamais un value object / DTO / exception / collection, où `new` est correct) **et** seulement si le projet **injecte déjà ailleurs** (mesuré). Sans conteneur DI, prescrire l'injection est un choix d'architecture → `info`, pas une violation (`sniff/references/capabilities/php/solid.md`, `improve/01-analyze.md`).
- **(B) Sévérité alimentant la mutation.** `02-migrate` appliquait les transformations CRITICAL/WARN après simple affichage d'un diff — or **un signal grep n'est pas une preuve et un diff n'est pas une confirmation**. Un signal *nom de fonction nu* peut viser un homonyme utilisateur, un import de namespace ou une méthode. Ajout d'une confirmation explicite par occurrence (ou par lot de même pattern) avant écriture ; doute non résolu → `Skipped (needs manual review)`, jamais réécrit (`legacy/02-migrate.md`).
- **(E) Le moteur d'analyse mal-juge les constructions qu'il recommande.** Les signaux `each(` et `split(` capturaient `$collection->each(...)` / `Str::split(...)` (Laravel/Doctrine, valides) → resserrés en `(?<![>:$\w])each\s*\(` / `split\s*\(`, jamais précédés de `->`/`::`/`$`. Et le détecteur OCP ne flague plus un `match ($enum)` exhaustif — sur un `enum` le compilateur impose l'exhaustivité, c'est la fermeture même (`legacy/01-scan.md`, `solid.md`, `improve/01-analyze.md`).

## v0.7.1 — 2026-07-25

### Fixed
- **Description du manifeste** (`plugin.json` + `marketplace.json`) — omettait les skills `log-analysis` et `bruno`. `log-analysis` (commit `37f792f`, 2026-05-27) avait été livrée sans jamais toucher `plugin.json` ni ce CHANGELOG : silencieusement non versionnée depuis sa création. `bruno` figure dans l'historique (v0.4.0) mais n'était jamais entré dans la phrase de description.

## v0.7.0 — 2026-07-25

### Reçu du pivot design (design 2.5.0 — verbe 0 `detail`)

- **`design-bridge/references/workflow-fse.md`** (nouveau) — ce pivot possède désormais le **workflow de plateforme FSE**, sous le squelette figé par `plugins/design/references/sc-pivot-contract.md § Workflow de plateforme` (cinq titres, déclaration de phase input/output/verbe, prérequis en capabilities). Il instancie les classes de cas agnostiques de `design:detail` sur un thème de blocs : phases `enforce`/`diffuse` natives + phases `off-funnel` (environnement conteneurisé, import en base, déploiement). `design:detail/02-route` l'étend à la classe quand ce pivot est installé et la stack correspond. Un workflow de plateforme est un COMMENT : il vit dans le pivot, jamais dans `design` (dec-002).
- **`design-bridge/SKILL.md`** — section « Workflow de plateforme (block theme / FSE) » + référence ajoutée.

## v0.6.0 — 2026-07-24

### Reçu du pivot design (design 2.2.0)

- **Obligation de report** (`design-bridge/SKILL.md`) — toute règle reçue en `Declared rules` est rendue au gate, réalisée ou non, au format `plugins/design/references/gate-config-schema.md § Rapport de pivot`. Cas fréquent ici : les règles de type `stored-content`. Le vocabulaire vit en base, hors du dépôt, et n'est lisible qu'après extraction — sans instance extraite la règle est `unrealized`, quel que soit l'état du code. Un `pass` y mentirait sur du contenu jamais ouvert.
- **`design-bridge/references/wordpress-lint-instances.md`** (reçu de `design`, ex-`design/skills/enforce/adapters/wordpress.md`) — réalisation des règles `stored-content` : extraction du contenu stocké en fichiers, lint, correction à la source, réécriture, re-lint.
- **`design-bridge/references/wordpress-pitfalls.md`** (reçu de `design`, ex-`design/references/wordpress-pitfalls.md`) — les pièges de plateforme appartiennent au réceptacle qui la sert, plus au cœur agnostique. Les références internes (`actions/02-render.md`, `SKILL.md`) pointent désormais sur `${CLAUDE_PLUGIN_ROOT}`.
- **`design-bridge/actions/01-realize-lint.md`** — écrit le rapport et le branche dans `gates.config.json § pivotReports` avec un `command`, au lieu d'étendre le hook pre-commit : le gate n'a qu'une commande, la même partout.

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
