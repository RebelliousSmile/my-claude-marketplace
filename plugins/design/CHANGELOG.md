# Changelog — design

## [2.17.1] — 2026-09-24

### Fixed

- `config-gen.py --check` refuse une collection dont la valeur n'est pas un sélecteur (ex. `{ "skip": … }`),
  comme `--page` le faisait déjà : les deux ne divergent plus sur un gate déclaré complet.
- `config-gen.py --page` sur une page `null` ou sans composant sort en exit 2 nommant la page, au lieu
  d'une trace d'erreur ou d'une config sans cible.
- `enforce fidelity-gate` inclut dans sa liste fermée d'ajouts les cibles propres à la page, en ajout
  seulement, comme le permet `copycat` en dérive.

## [2.17.0] — 2026-09-24

### Added

- `oracle.json § pages` : le gate de fidélité figé par page (`root`, `elements` avec sélecteur maquette
  ou `{ "skip": raison }`, `collections`), source unique des sélecteurs maquette du gate.
- `config-gen.py --check` : complétude statique du gate (exit 0 complet, 1 défauts listés, 2 entrée
  invalide) ; `--page` filtre les cibles et la propriété sur les composants de la page ;
  `--implementation-url` devient optionnel pour mesurer la maquette seule.
- `adjust freeze` écrit `oracle.json § pages` depuis la carte signée, rapproche les libellés du
  brouillon des noms canoniques et refuse de figer tant que `--check` échoue, qu'une clé de page manque
  au harness ou qu'une cible maquette est `missing` en Mode A. Référence non mesurable : étape sans objet.
- Carte des éléments dans la table de correspondance : `copycat` rend un `element_map` couvrant chaque
  cible mesurée, `define` la fusionne par page et le sign-off P2 la couvre.

### Changed

- `measure.py` lit les `props` déclarées par cible, en remplacement de la liste globale pour cette cible.
- `enforce fidelity-gate` applique le config généré sans le compléter : seuls ajouts permis, les URLs,
  l'authentification `ownership`, les `ledger` et `coverage_ack`. `copycat` en dérive ne surcharge ni ne
  retire plus une cible générée ; un `missing` côté maquette remonte à `adjust`.
- `gate-natures.md` : un élément non mappé n'est plus une limite admise mais un défaut refusé au gel ;
  seules les exclusions `skip` restent hors mesure, nommées.

### Migration

- Un contrat à référence mesurable dont `oracle.json` n'a pas de `pages` est refusé par
  `enforce fidelity-gate` jusqu'au re-gel par `adjust`. `config-gen.py` sans `pages` produit encore
  l'ancienne config, avec un avertissement.
- Les `props` d'élément déjà présentes dans un `oracle.json`, ignorées jusqu'ici par `measure.py`,
  s'appliquent désormais : un verdict peut changer sans modification du contrat.

## [2.16.0] — 2026-09-23

### Added

- Le spec d'enforcement transporte les chemins de tokens, leurs valeurs canoniques résolues et les
  overlays de thèmes, afin que les réceptacles puissent vérifier les valeurs natives sans lecture cachée.
- `enforce build-linter` distingue installation et extension d'un gate brownfield marqué ; le bloc
  généré est idempotent et la commande existante reste l'unique autorité.

### Fixed

- Un linter existant sans point d'extension explicite ferme désormais l'opération avant écriture au lieu
  d'être remplacé ou doublé silencieusement.

### Verification

- Les scénarios d'autonomie couvrent l'extension, le refus ambigu et le transport des échelles ; les 13
  scénarios `enforce` et le gate comportemental design passent.

## [2.14.0] — 2026-09-01

### Added

- Skill publique `design:wireframes` avec quatre routes : génération depuis manifeste, normalisation non destructive d’un HTML auteur, lint statique/rendu et promotion vers `design:harness`.
- Contrat de planche autonome fondé sur un socle obligatoire et quatre piliers optionnels (`responsive`, contenu représentatif, contexte existant, branding), avec seulement les cadres desktop 1440 px et mobile 390 px.
- Reçu de review détaché lié par SHA-256 à l’HTML et aux deux rapports, révocable et vérifié à nouveau avant tout handoff.
- Handoff atomique `pages.json` + `migration-payload.json` + `handoff.json`, état initial seul dans le harness, dispositions explicites des autres états et politique tablette obligatoire.

### Changed

- `design:detail` expose désormais huit capacités tout en conservant les six classes de lifecycle et les cinq verbes du pipeline ; `wireframes → review → harness` reste un préalable UI optionnel hors entonnoir.
- `design:diffuse` réserve les prototypes libres et route les planches structurées vers `design:wireframes`.

### Verification

- Selftest portable wireframes : 26 assertions vertes, incluant immutabilité, ambiguïtés, reçus périmés/révoqués, dispositions d’états et consommation par les interfaces officielles du harness.
- Selftest Chromium ciblé : 7 tests verts sur planche conforme, page normalisée, collision, débordement et état masqué ; absence de Playwright ou Chromium confirmée en exit 2.
- Runner ciblé et `pnpm test` contre-prouvés par mutations jetables du manifeste, d’une route et de la fixture canonique, puis rejoués au vert sur l’arbre sain.

## [2.13.3] — 2026-08-28

### Fixed

- Le README identifie `copycat` comme un agent interne consommé par `overcode:alias mirror`, et non comme une skill publique `design:copycat`.

## [2.13.2] — 2026-08-28

### Added

- Action `harness/normalize` pour reconstruire un HTML existant dans le shell canonique sans modifier la source.
- Analyseur en lecture seule distinguant format, runtime, complétude de migration et fidélité visuelle, avec comparaison de taille optionnelle via `--baseline`.
- Applicateur déterministe `harness-apply.py` pour sérialiser le HTML de page sans sortie de `<script>`, remplir les zones auteur et publier atomiquement.
- Représentation `pageBodies` pour conserver les fonctions et layouts mutualisés quand l’aplatissement HTML dépasserait le seuil de taille.
- Zones gouvernées `AUTHOR SHARED HELPERS` et `AUTHOR AFTER RENDER` pour mutualiser le markup et conserver, en opt-in, les interactions locales.

### Changed

- La normalisation choisit explicitement `snapshot` ou `interactive`, inventorie chaque interaction et exige une preuve visuelle avant toute conclusion de fidélité.
- Les requêtes media de viewport restent interdites au profit des classes du cadre ; les préférences d’accessibilité sont désormais préservées.

### Fixed

- L’analyseur limite les options à `#page-select` et les styles au `<head>`, signale les sources absolues illisibles et les snapshots de tokens sans provenance.
- Les feuilles externes déclarées par `@import` sont inventoriées comme les liens `<link rel="stylesheet">` au lieu de disparaître du rapport de dépendances.
- Le runtime borne l’évaluation VM des scripts, empêchant un helper auteur infini de bloquer l’analyse ou la CI.

## [2.13.0] — 2026-08-14

### Added

- Routage composite des rendus FSE vers `sc-php` (markup/runtime) et `sc-css` (feuilles), avec sorties disjointes et refus d'intégrer un retour partiel.
- Preuve optionnelle de propriété de cascade dans `measure.py`, incluse dans le verdict de fidélité sur chaque surface et breakpoint.
- Dérivation des propriétés gouvernées depuis les déclarations CSS effectives, session éditeur fournie uniquement par l'environnement et cas `unrealized` bloquants.

### Changed

- Le gate distingue désormais une valeur calculée correcte d'une valeur réellement gouvernée par la feuille et la classe DS attendues.
- Copycat exige une re-mesure d'ownership après suppression d'un override WordPress.

## [2.12.1] — 2026-08-12

### Added

- Manifeste Codex natif, routage autonome des sept skills et suites Behave couvrant les déclenchements, NO-GO, frontières d'écriture et codes publics.
- Classification canonique P0/P1/P2 : les preuves outcome et système bloquent, les commodités de workflow avertissent.

### Changed

- Chaque skill accepte désormais son entrée précise sans imposer le cycle complet ; la recette de bout en bout reste réservée aux demandes explicites.
- Les outils embarqués résolvent la racine depuis le `SKILL.md` chargé, sans dépendre d'une variable propre à un hôte.
- Le fan-out `copycat` charge un contrat feuille portable, utilise les sous-agents natifs et le modèle par défaut de l'hôte, avec fallback séquentiel.
- `wire-gates` persiste les instructions dans `AGENTS.md` pour Codex et `.claude/rules/` pour Claude Code, sans modifier une skill installée.

### Fixed

- `run-gates.py` refuse les statuts de pivot inconnus, les règles inconnues ou dupliquées et les rapports mal formés au lieu de les compter comme preuves réalisées.
- Une commande de réalisateur en échec, vide ou sans nouveau rapport ne peut plus recycler un ancien rapport vert ; la preuve repose sur une recréation, pas sur la granularité du `mtime`.
- Le préflight Behave valide le dernier run structuré : un verdict vert individuel par scénario et un tally cohérent, sans dépendance au fuseau ni date-bombe quotidienne.

## [2.11.0] — 2026-08-06

Mineur — **le chemin par lequel les phases d'un pivot atteignent le consommateur n'existait pas.** Constat relevé sur un terrain réel (une maquette de 11 pages à porter en WordPress FSE, `sc-php` installé). Quatre défauts, un seul motif que le plugin traque depuis 2.9 : *un artefact produit que personne n'intègre*.

### `02-route` n'était pas tenu d'ouvrir le workflow du pivot

`sc-pivot-contract.md` déclare depuis toujours que les cinq titres du workflow de plateforme sont « attendus à l'identique par `design:detail/02-route` ». **`02-route` ne les utilisait nulle part** : ni dans ses inputs, ni dans son process, ni dans sa sortie. Il constatait la présence d'un pivot et émettait la séquence agnostique — le contrat décrivait une lecture qui n'existait pas. Conséquence directe et mesurée sur le terrain : la phase *Établir le modèle de contenu*, ajoutée à `sc-php` 0.11.0 précisément pour fermer un trou de la chaîne, était invisible à son unique consommateur.

La table `## Phases` est maintenant une **entrée obligatoire** quand l'extension est présente, la séquence **fusionnée** une sortie obligatoire, et la sortie porte sa propre falsifiabilité : extension annoncée présente, la séquence compte au moins une ligne que `workflow-classes.md` ne déclare pas. Le test l'a suivie — l'ancien ne prouvait que la présence du pivot, le nouveau retire une ligne de la table et exige que la phase disparaisse de la sortie.

### L'ordre d'insertion des phases `off-funnel` n'était spécifié nulle part

Une phase `off-funnel` n'instancie aucun verbe : rien ne disait où elle tombe. La fusion des deux listes était **interprétée**, pas dérivée. Quatrième champ **`position`** dans la déclaration de phase — `avant <verbe>`, `après <verbe>`, `fin`, et rien d'autre ; `—` pour une phase qui instancie un verbe, requis pour toute phase `off-funnel`. Une position se lit contre la séquence de la classe **résolue** : quand le verbe ancre en est absent, la phase est omise et l'omission énoncée, jamais rapprochée du verbe le plus proche. Les trois workflows de plateforme existants (`fse`, `spa`, `static`) renseignent la colonne.

### Une énumération qui dérive à chaque phase ajoutée

`workflow-classes.md` listait en dur les phases `off-funnel` d'un pivot — trois éléments pour quatre réels. La liste vit dans le pivot, qui en est l'autorité ; ce fichier n'en énumère plus aucune. Même défaut, non signalé, dans le champ **verbe** de `sc-pivot-contract.md` : la parenthèse d'exemples est retirée.

### L'invariant à trois branches d'une clé de page n'avait aucun vérificateur

Une clé de page est écrite trois fois — le registre `const pages`, le `value` de son `<option>`, le `reference_page` de la config d'oracle — par trois auteurs différents, et rien ne les réconciliait. Renommée dans une seule branche, la page devient injoignable depuis le sélecteur, ou l'oracle mesure un vide : sans erreur, sans rouge. Le défaut était **latent** sur le terrain observé, pas réalisé.

`harness-runtime-check.mjs` compare registre ↔ `<option>` à chaque appel, et vérifie la troisième branche sous `--oracle-config` (`reference_page: null` est la valeur déclarée « pas de clé SPA », pas un défaut). Il lit le registre depuis la **portée lexicale** du contexte `vm` — `const pages` au top-level d'un script n'est jamais une propriété du global —, et le HTML **débarrassé de ses commentaires**, le cadrage LLM en tête du fichier citant du markup qui rendrait rouge tout fichier conforme. Le contrôle vaut sur un fichier **rempli** autant que sur un scaffold.

Sept assertions au selftest, dont **quatre par mutation** : la clé renommée dans le registre seul, dans l'`<option>` seule, un `reference_page` inconnu, une config absente — chacune doit passer au rouge, et chaque mutant est comparé à sa source pour qu'aucune ne soit un no-op. Un vert qu'aucune mutation ne rougit n'atteste rien.

### Aussi

- La notice en tête du fichier généré nommait un champ de config qui n'existe pas : `maquette_page` → **`reference_page`** (`measure.py`, `config-gen.py`, `configs/example.json`).
- `harness/SKILL.md` citait `references/harness-contract.md` en relatif à deux endroits — le fichier est à la racine du plugin, pas sous la skill. Préfixé `${CLAUDE_PLUGIN_ROOT}`.
- `02-route` émet désormais les **capabilities sans cible** sur le terrain et les phases qu'elles bloquent : une séquence dont la dernière phase est inatteignable s'arrêtait en silence sur un vert.

`pnpm test` vert, 38 assertions au selftest du harness.

**Non mesuré, dit ici plutôt qu'ailleurs** : les trois premiers points sont des règles écrites. Seul le quatrième est opposé par une machine.

## [2.10.0] — 2026-08-05

Mineur — **les trois 🔴 de l'audit du harness généré, chacun prouvé par une mesure avant et après, puis la chaîne entière rejouée contre un WordPress FSE réel.** Un audit trois piliers (`ui`, `tests`, `security`) avait rendu trois constats critiques ; les trois portaient sur la même faute de méthode : une propriété affirmée depuis la règle CSS, la présence d'un texte prise pour la preuve qu'il s'exécute, un chemin déclaré lu sans être borné.

### Le bezel du cadre device sort du modèle de boîte

`border` sous `box-sizing: border-box` est **à l'intérieur** de la boîte : le cadre `.preview-frame.mobile` annonçait un échantillon de 390 px et rendait une boîte de contenu de **359 px** à la fenêtre 375 × 812 de l'oracle, **374 px** à fenêtre large ; le tablet, **814 px** au lieu de 834. L'oracle de fidélité compare des chaînes normalisées, sans tolérance : toute valeur dérivée d'un pourcentage de largeur était facturée à une implémentation conforme. Mesuré après correction (`outline`, encre pure hors boîte) : **359 → 375 px** de boîte de contenu au viewport de l'oracle, et `paddingLeft` **17.9375px → 18.75px**, chaîne identique à la référence nue. À fenêtre large, mobile **374 → 390**, tablet **814 → 834** ; `scrollWidth` égal au viewport, aucune barre horizontale introduite. Les marges absorbent le bezel (24+10, 32+8) : l'écart visuel est inchangé. Contre-épreuve : le `border: 8px` réintroduit fait échouer le selftest.

### Le fichier généré est exécuté, plus seulement grepé

Le selftest n'assertait que du texte. Un `<script>` mort — erreur de syntaxe, `pages` non défini — passait ALL GREEN, et le défaut n'apparaissait qu'au navigateur, là où l'oracle appelle `window.setPage`. `tools/harness-runtime-check.mjs` (stdlib seule, `node:fs` + `node:vm`, sortie 0/1) évalue **les deux** scripts du fichier produit, refuse un `<script` porteur d'attributs, exige un `#page-container` non vide après `init()`, la bascule de classe de viewport, `Page introuvable` sur une clé inconnue, et pour chaque clé attendue un contenu non vide avec `select.value` accordé. Contre-épreuve dans un arbre jetable, générateur régressé sur une accolade : `FAIL runtime : script 2 did not evaluate: SyntaxError: Unexpected end of input` → `SELFTEST FAILED exit=1`. Branché sur `pnpm test`.

### Le chemin `--contract` cesse d'accepter n'importe quoi

L'adaptateur stylesheet déclaré était lu puis inliné **verbatim** dans `<style>…</style>`, sans borne ni contrôle. Mesuré contre le générateur d'avant (`7c7997f`) : une `policies.json` déclarant `../2x/adapters/tokens.css` sortait en **0** avec une feuille hors contrat inlinée, et une feuille portant `</style><script>window.__PWNED=1;</script>` sortait en **0** avec la charge présente dans le fichier produit. Le chemin est désormais confiné **avant ouverture** (`relative_to` sous `try/except`, chemins résolus — un répertoire d'artefacts symlinké au-dehors est refusé aussi), et la séquence qui referme le contexte CSS est **refusée, jamais échappée** : `tools/generate.py` ne l'émet jamais, donc le refus n'a pas de faux positif légitime. Les deux cas sortent maintenant en **2**, sans rien écrire — deux fixtures de refus (`2x-artifact-escape`, `2x-style-breakout`) et une garde qui vérifie qu'aucun fichier produit ne porte la charge.

### La chaîne rejouée, pas les fixtures

`harness.py → HTML → remplissage → measure.py → verdict` contre un WordPress FSE réel scaffoldé par `sc-php:setup` (WP 7.0.2, thème custom actif, page publiée). **Même site, même balisage, même contrat : seul le générateur change entre les deux passes.** Le contrat déclare un token `breakpoint.tablet`, donc trois échantillons ont tourné — relevés, pas supposés (`config-gen.py:54-67` n'en pose que deux sans ce token). Avant : `OPEN — 8 unledgered style diff(s)` (mobile 4, tablet 4, desktop 0). Après : **`CLOSED`**, 126 comparaisons appariées sur chacun des trois échantillons. Le verdict desktop est identique entre les deux passes — l'échantillon desktop n'a pas de bezel — et les seuls écarts qui bougent valent exactement le bezel retiré de la boîte : 0.8125 px en mobile (5 % de 16), 1 px en tablet (5 % de 20). Relevé complet : `aidd_docs/tasks/2026_08/2026_08_05_harness-trois-critiques/verification-chaine.md`.

`pnpm test` vert, 31 assertions au selftest du harness.

## [2.9.1] — 2026-08-05

Correctif — **trois warnings d'une revue de code de 2.9.0, tous de la classe que 2.9.0 prétendait fermer : un état non rendu, une sortie muette, une preuve qui ne tient que là où elle a été écrite.**

- **La garde ajoutée en 2.9.0 dans `init()` commençait après la ligne qui jette.** `decodeURIComponent` lève `URIError` sur un fragment mal formé : l'IIFE avortait avant `setViewport()` et `render()`, et `#page-container` — vide dans le template — restait vide. Mesuré au navigateur sur `#%E0%A4%A` : `innerHTML.length: 0`, aucun bloc d'erreur, `preview-frame` sans classe de viewport. Après, sur le même fragment : `152` caractères, `h1 = "Page 1"`, `window.setPage`/`setViewport` opérants (`preview-frame mobile`). Le décodage est passé **dans** le `try`, là où se lit déjà le registre. Le selftest asserte la ligne qui précède le décodage ; contre-épreuve faite en la remettant dehors, l'assertion tombe.
- **Une sentinelle de template sans valeur partait littérale dans le HTML, à exit 0.** `substitute()` laisse volontairement intact un `%%…%%` inconnu — pour ne pas manger un `--title` qui en contiendrait un — mais rien ne distinguait ce cas d'une clé oubliée côté générateur. `missing_sentinels()` compare les sentinelles **du template** aux clés fournies, avant écriture : mesuré sur une copie où `PAGE_REGISTRY` est mal orthographiée, **exit 2**, message nommant `%%PAGE_REGISTRY%%`, et **aucun fichier écrit**. Le selftest vérifie en plus qu'aucun `%%` ne survit dans la sortie scaffold et dans la sortie couplée.
- **Le selftest appelait `python` en dur, sur la ligne que 2.9.0 avait réécrite et fait entrer dans `pnpm test`.** Ubuntu 22+ n'expose que `python3` : chaque `check` y aurait rendu 127, rapporté comme « exit 127, expected 0 » — un interpréteur absent déguisé en échec d'assertion, la mesure exacte du défaut `bash`/WSL corrigé la veille. L'interpréteur est résolu (`HARNESS_SELFTEST_PYTHON`, puis `python3`, puis `python`) et **l'override est vérifié utilisable** : mesuré avec `HARNESS_SELFTEST_PYTHON=/nope/python`, le script s'arrête d'emblée sur un message qui nomme l'interpréteur, exit 1, au lieu de dérouler quatorze faux échecs.

`pnpm test` vert, 22 assertions au selftest du harness.

## [2.9.0] — 2026-08-05

Mineur — **le générateur de `harness` respecte enfin l'espace de codes qu'il déclare, refuse d'écrire un fichier dont le JS serait invalide, et une preuve branchée sur `pnpm test` casse si l'un de ces points régresse.** Un audit trois piliers (`code-quality`, `ui`, `tests`) a relevé 17 constats ; un 18ᵉ, le plus grave, a été trouvé au challenge du plan. Tous sont fermés, chacun remesuré après correction. La chaîne complète `harness.py → HTML → remplissage → measure.py → verdict` a ensuite été rejouée contre un WordPress FSE réel, pas contre des fixtures.

### L'espace 0/2/3 vaut pour tout le programme

`harness-contract.md` écrivait « jamais 1 ni 4 » sans restriction ; `SKILL.md` restreignait la règle au chemin `--contract`. C'est cette phrase-là qui était fausse, et elle s'aligne.

- **Une clé de page qui n'est pas un identifiant JS valide écrivait `function page/contact/()` et sortait en 0.** Le fichier était mort (`pages is not defined`) mais `window.setPage` existait toujours, posé par un autre `<script>` : l'oracle ne voyait rien et `page.evaluate` levait. Ce défaut n'était dans aucun des trois rapports d'audit. Après correction, `--pages '/contact/:C'` sort en **2** et le message nomme la clé fautive, le nom dérivé, et rappelle qu'une clé est un slug. La validité se teste par `key_to_fn(k).isidentifier()` : Python et JS suivent tous deux UAX-31, donc le test est plus strict que JS sans jamais l'être à tort — `café` passe là où une regex ASCII le rejetterait.
- **`--pages-json` était lu par un `json.loads` nu** — fichier absent, JSON invalide ou forme inattendue rendaient **1 + traceback**. Les trois branches sortent maintenant en **2** avec un message nommant le fichier ou l'index fautif (`pages-json-absent`, `pages-json-not-json`, `pages-json-strings` au selftest).
- **`my-page` et `my_page` dérivaient tous deux `pageMyPage`**, déclarée deux fois, la seconde gagnant silencieusement. Détecté avant écriture : **exit 2** nommant les deux clés et le nom dérivé (`pages-fn-collision`).
- **`--pages 'home:A,home:B'` était accepté**, `pageHome` apparaissant cinq fois. **Exit 2** nommant la clé et les deux index (`pages-duplicate-key`).

### Le harness produit

- **Le scaffold ne contenait aucun `h1`** — mesuré `h1: 0`, `h2: 1` — dans un fichier qui prescrit « un seul h1 par page » trois lignes plus haut. Après correction : `h1: 1` sur une page remplie comme sur le repli « Page introuvable ». Le selftest asserte que **chaque** bloc `.ph` ouvre sur un `h1`, et non qu'un `h1` existe quelque part : la version faible de cette assertion laissait passer un `placeholder()` rétrogradé en `<h2>`, vérifié.
- **`<select id="page-select">` n'avait ni `<label>` ni `aria-label`.** Le seul contrôle de navigation du harness n'était pas nommé (WCAG 2.2 · 4.1.2). Mesuré après : nom accessible `"Page"`.
- **`render()` assignait `container.innerHTML = fn()` sans `try`.** Une fonction de page qui jetait laissait l'écran sur la page précédente et propageait l'exception jusqu'à `measure.py:191`, qui appelle `window.setPage(k)` sans garde. Désormais un bloc d'erreur est **rendu** : mesuré `raised: null`, texte `⚠ La page « contact » n'a pas pu être rendue / <message> / Corrigez pageContact() dans ce fichier.`, erreur consignée en console. Le `try` enveloppe la **recherche dans le registre**, pas seulement l'appel : quand le premier `<script>` meurt sur une erreur de syntaxe, `pages` n'existe pas alors que `window.setPage` existe — mesuré, ce cas rend aussi un bloc d'erreur (`pages is not defined`) au lieu de lever.
- **Les trois `.viewport-btn` portaient un état actif purement visuel**, et leurs `<svg>` décoratifs n'étaient pas masqués. Après : `aria-pressed` maintenu par `setViewport` en même temps que la classe — mesuré `[["desktop","false"],["tablet","false"],["mobile","true"]]` après `setViewport('mobile')`, cadre à 390 px — et `aria-hidden="true"` sur les trois `<svg>`.
- **`<html lang="fr">` était codé en dur** dans un générateur par ailleurs agnostique. Paramètre `--lang`, défaut `en` : mesuré `lang="en"` sans le flag, `lang="fr"` avec `--lang fr`.
- **Deux `preconnect` vers Google Fonts** étaient émis inconditionnellement dans un fichier vendu comme autonome, qu'aucune `@font-face` n'utilisait. Mesuré après : **0 occurrence** dans le scaffold nu.

### Échappement

- **Le même label était traité différemment selon la cible** : `build_functions` échappait `<`/`>`, `build_options` interpolait brut — `p1:Fiche <b>x</b>` affichait « Fiche **x** » dans le sélecteur et `Fiche &lt;b&gt;x&lt;/b&gt;` dans la page. Une seule fonction d'échappement s'applique maintenant à `key`, `label` et `group`, attribut `value=` compris ; le selftest asserte qu'aucun `<b>` ne ressort du document.
- **`--title` était substitué en chaîne, avant `%%PAGE_OPTIONS%%`, et sans échappement.** Substitution en une passe et titre échappé : mesuré, `--title '%%PAGE_OPTIONS%%'` laisse la sentinelle littérale dans le `<title>` et génère quand même la bonne `<option>` ; `--title 'Fin --> injection <script>'` rend `Fin --&gt; injection &lt;script&gt;` dans le `<title>`, et la séquence `--` est brisée dans le commentaire d'en-tête pour qu'un titre ne puisse pas le fermer.
- **`--pages` découpe sur `,` sans échappement possible** : un libellé portant une virgule crée une page fantôme. Comportement inchangé — c'est le format qui le veut — mais la limite est écrite dans `SKILL.md § Paramètres` et renvoie à `--pages-json`, et un scénario d'évaluation route l'intention correspondante.

### La preuve, branchée

- **`tools/harness-selftest.sh` n'était appelé par aucun runner.** Écrit le 2026-07-25, jamais rejoué depuis. `tools/eval/design-harness.mjs` l'invoque et `pnpm test` compte désormais **six** maillons : mesuré exit 0 ; un `harness.py` volontairement cassé le fait rendre ≠ 0, restauré il rend 0. `bash` introuvable est un **échec explicite**, jamais un skip silencieux — reproduire le skip serait reproduire le défaut. Le runner **résout lui-même** son interpréteur : sous Windows, `bash` du `PATH` est celui de WSL, qui ne voit pas `C:/…` — mesuré, exit 127 depuis PowerShell alors que le même appel rendait 0 depuis Git Bash. Le bash de Git for Windows est donc dérivé de `git --exec-path` (`HARNESS_SELFTEST_BASH` prime), et les séparateurs sont passés en `/` parce que bash traite `\` comme un échappement et recevait le chemin amputé. Mesuré après : exit 0 depuis PowerShell **et** depuis Git Bash — une preuve qui ne passe que dans le shell où on l'a écrite n'en est pas une. Le fichier est nommé `design-harness.mjs` et non `harness.mjs` : `tools/eval/harness.mjs` est le harnais d'évaluation du marketplace, homonyme et sans rapport, et l'en-tête le rappelle.
- **Le selftest n'assertait rien du HTML produit** hors deux chaînes. Il asserte maintenant les `h1` de chaque bloc `.ph`, l'unicité des `function page…` déclarées (ancrées sur l'indentation des déclarations générées, pour ne pas compter les exemples du cadrage LLM), l'absence de markup ré-émis, l'`aria-label` du sélecteur, les trois `aria-pressed`, l'absence de `preconnect` et de `@media`, et le contenu des messages d'erreur.
- **Rien n'assertait que 1 ne sort jamais.** Le garde est posé **dans `check()`** : toute invocation de `harness.py`, quelle que soit la branche, échoue si elle rend 1 — même si le code attendu de la ligne valait 1. C'est l'interdit, distinct de l'assertion « code attendu », et c'est lui qui aurait attrapé le défaut `--pages-json`. Le script reste du POSIX `sh` : son shebang dit `sh`, son en-tête d'usage lance `bash`, et les deux ont été vérifiés à 0 après extension.
- **`scenarios.json` ne couvrait que l'axe `--contract`** : 9 scénarios, zéro sur l'entrée nominale du scaffold. Trois s'ajoutent (pages en JSON, libellés à virgules, clés qui sont des chemins d'URL). Ils n'auraient rien attesté seuls : `coverage.mjs` classait la skill « couverture **non vérifiable** — aucune action déclarée dans SKILL.md ». Une table d'actions (`scaffold`, `contract-inline`) est donc déclarée d'abord ; mesuré après, `coverage.mjs` rend `2 action(s) routable(s) couverte(s) [déclencheur explicite]` et exit 0.
- **Le couplage temporel `transition: max-width .4s` ↔ `wait_for_timeout(400)`** n'était déclaré nulle part. Il l'est dans `harness-contract.md`, à côté de l'accord sur les viewports : mesuré, à t=400 ms la largeur mobile est stabilisée à 390 px — la valeur est juste, c'est son implicite qui ne l'était pas. Raccourcir la transition est sans risque ; l'allonger sans toucher à l'attente ferait mesurer un cadre en cours d'animation, silencieusement.

### Contre-épreuve de chaîne contre un WordPress FSE réel

Le bootstrap `sc-php:setup` 0.10.3 a été rejoué sur une racine jetable (port 8899, projet Docker isolé, six conteneurs voisins intacts avant et après), puis la chaîne complète a tourné dessus.

- La génération refuse le piège qu'elle devait éviter de tendre : `--pages '/:Accueil,/sample-page/:Page exemple'` sort en **2**, les slugs en **0**.
- Le harness rempli d'après le rendu réel donne **un `h1` par page**, zéro `<style>` injecté par une fonction, zéro erreur console, et les variations device en classe s'appliquent (titre 32 · 28 · 24 px pour cadres 1440 · 834 · 390).
- `measure.py` rend un **verdict machine** sur les trois échantillons device, sans exception : `OPEN — 13 unledgered style diff(s)`, complétude structurelle sans section manquante, couverture `5 targets / 3 headings` ok. Les 13 écarts sont ceux introduits sciemment dans la maquette (line-height posé côté maquette, absent du thème ; variations device que le thème sans media query n'a pas). Un écart de fidélité n'est pas un défaut de la chaîne — seul un plantage ou un verdict impossible à produire en serait un.
- Une seconde exécution sur `page-exemple` / `/sample-page/` confirme qu'aucune page n'est mesurée à la place d'une autre : `setPage` est honoré côté maquette et la parité de texte du titre tient sur les trois breakpoints.

## [2.8.0] — 2026-08-03

### Changed — le rapport du gate a sept lignes, pas quatre

Le contrat de pivot et l'action qui le consomme décrivaient tous deux la sortie du gate en quatre lignes. Le runner en imprime **sept**. Un lecteur confronté à une des trois lignes non documentées n'avait aucun moyen de savoir si elle signalait un défaut, une configuration, ou rien. Les deux tables sont réalignées sur ce que le runner émet réellement, dans l'ordre où il l'émet — lignes de règle d'abord, `VIOLATION` en bloc.

- **`VIOLATION` ne préfixe pas toujours un réalisateur.** Deux producteurs impriment cette ligne et le préfixe change de nature avec eux : **chemin de fichier** côté cœur portable (lint markup), **réalisateur** côté rapport de pivot. Rien dans la ligne ne les distingue hors la forme de la cible. Un lecteur de `VIOLATION src/Button.tsx: …` qui l'ignore conclut à un réalisateur portant le nom d'un fichier du projet.
- **Deux lignes `UNREALIZED` manquaient**, et une troisième était mal formée : `UNREALIZED <id> - declared with no realizer` n'a **pas** de `(<type>)`, contrairement à ses voisines. La table reproduit la sortie, elle ne la régularise pas.
- **`REALIZED <id> (unrealized) by <realizer>` existe** : un réceptacle a couvert une règle que le contrat ne route vers personne. La règle est réalisée, et le contrat est périmé sur ce point. Le `<type>` y vaut toujours `unrealized` — c'est la garde même qui produit la ligne.
- **Une règle typée `markup` sort `by lint-core`** : une constante du runner, jamais un réceptacle qui rapporte — d'où le `—` qu'elle porterait en colonne *ce que le réceptacle écrit*.
- **Pourquoi l'obligation de rapport ne vaut que pour l'enforcement** est maintenant écrit. Le contrat n'en demande aucun au réceptacle de rendu, et ce n'est pas une lacune : une règle non réalisée est **silencieuse**, un artefact non produit est **auto-évident**. L'obligation de report paie un silence ; là où il n'y en a pas, elle n'a rien à payer.

### Fixed

- **Trois chemins d'action faux dans `references/sc-pivot-contract.md`** — `enforce/04-pivot.md` et `diffuse/04-pivot.md` cités sans leur segment `skills/…/actions/`, le second portant en outre un numéro que le fichier n'a jamais eu (`03-pivot.md`). Idem pour l'adaptateur `html-css.md`. Un chemin de référence qui ne résout pas se corrige à sa source, pas à sa citation.

## [2.7.1] — 2026-07-28

Correctif — **le plugin disait de lui-même des choses fausses, et un rapport taisait un désaccord entre ses deux sources.** Un audit code-quality + architecture a relevé quinze points ; treize sont fermés ici. Aucune capacité nouvelle : chaque changement corrige un énoncé que le code contredisait déjà, ou range une matière qui n'avait pas à être distribuée.

### Ce que le plugin affirmait de faux sur lui-même

- `define/SKILL.md` annonçait produire des adapters. `write-system-procedure.md § Test` exigeait l'inverse — « aucun fichier écrit sous `design/adapters/` ». La description est corrigée : `define` **recense** les consommateurs sans rien émettre, l'émission étant le fait de `tools/generate.py` au figeage. La bannière « généré » de `token-schema.md` découlait de cette erreur ; elle est réalignée sur `generate.py` octet pour octet.
- `harness/SKILL.md` se plaçait dans l'entonnoir par son diagramme, quand `funnel-map.md`, `workflow.md` et `concepts.md` le disaient hors entonnoir — tous trois avaient raison. Le seul fichier faux est corrigé, et renvoie désormais à la position canonique.
- « Quatre artefacts » subsistait dans `plugin.json`, `marketplace.json`, `design-system-contract.md` et `adjust/SKILL.md` alors que `deviations.json` est un artefact depuis la 2.5. Le contrat en compte **cinq**, partout, et `design-system-contract.md` déclare enfin où vivent les écarts tolérés.

### Un désaccord de sources n'est plus silencieux

Une règle typée `unrealized` — le contrat dit qu'aucun réalisateur n'existe — qu'un rapport de pivot couvre malgré tout était imprimée `REALIZED` sans un mot. Elle reste réalisée : le pivot l'a mesurée, et ses violations étaient déjà comptées, si bien que la démoter aurait imprimé « non vérifiée » au-dessus de sa propre liste de violations. Mais la ligne nomme maintenant que le contrat ne route rien vers elle. Code de sortie inchangé. Énoncé opposable ajouté à `enforcement-registry.md § Marqueur non réalisé`.

### `run-gates.py` — un orchestrateur de seize lignes

`run()` faisait 166 lignes et propageait cinq codes de sortie par `return` à travers une quinzaine de points de sortie. Décomposé en huit fonctions nommées, avec une exception `GateError` qui porte son code : le message s'imprime au site du `raise`, donc un nouveau chemin d'échec ne peut pas être muet. Vérifié côte à côte contre la version précédente sur quinze cas couvrant les cinq codes — stdout, stderr et code identiques, à la seule ligne de collision près.

### Restatements remplacés par des pointeurs

La règle du vocabulaire ouvert était réécrite en quatre endroits, avec des formulations qui commençaient à diverger. `adjust/references/manifest-schema.md § Invariant 1` la porte seule et se déclare telle ; `design-system-contract.md`, `enforce/SKILL.md`, `write-system-procedure.md` et `docs/concepts.md` y renvoient. Même geste sur le périmètre de la baseline dans `enforce/SKILL.md`, dont deux sections se recouvraient.

### Rangé

- `CHANGELOG.md` scindé : la série 1.x, close et sans rapport avec le format courant, part dans `CHANGELOG-1.x.md`. 875 → 326 lignes.
- `audits/2026_07_design-cycle-critique.md` déplacé vers `aidd_docs/tasks/audits/` — un audit expérientiel n'a pas à voyager dans un plugin distribué. Le dossier `audits/` disparaît.
- Frontmatter complété : les sept skills déclarent `triggers`, `requires` et `references`. `enforce/actions/01-build-linter.md` ne donne plus un exemple de `targets` pointant hors du projet.

## [2.7.0] — 2026-07-28

Mineur — **une couleur porte du texte parce qu'un composant le déclare, et le figeage refuse un contrat où cette déclaration manque partout.** Le contrôle de contraste existait déjà et s'exécutait au figeage ; il n'avait presque rien à regarder, parce que la seule façon d'être apparié était de porter un nom que l'heuristique reconnaissait. Un contrat pouvait donc sortir avec `checks.contrast.allPass = true` calculé sur **zéro paire** — un verdict vide présenté comme un verdict. Le lot ferme la chaîne de bout en bout : `define` relève ou décide les appariements pendant qu'ils sont encore gratuits, `destructure` les chiffre, `adjust` refuse de figer quand il n'y a rien à mesurer, et le périmètre réel de chaque gate est réénoncé partout où il était décrit comme un trou.

### `components.json § .foregrounds` — la moitié symétrique de `.backgrounds`

Aucun mécanisme nouveau : le champ existant `.backgrounds` gagne son pendant. Les deux portent des chemins de tokens libres sous `color.*` — pas une convention de nommage, une référence. Un composant purement structurel (grille, espaceur) laisse les deux vides, ce qui est une déclaration et non un oubli ; un composant qui affiche du texte et les laisse vides ne rend pas sa couleur conforme, il la rend **intestable**.

### `contrast.py` — appariements déclarés d'abord, et un exit pour « rien à comparer »

`evaluate()` émet les paires déclarées par les composants, puis les paires inférées par rôle **dédupliquées** contre elles : une paire déclarée n'est jamais réémise comme inférée. L'inférence par rôle sous `color.semantic` reste, comme repli faible. Nouvel espace de sortie : **0** calculé sur ≥1 paire · **2** contrat inexploitable · **3** lu, mais rien à comparer — *qui n'est pas un pass*. `--allow-unpaired` rabat 3 sur 0 et estampille `unpairedAllowed: true` dans le rapport. Chaque exécution imprime une ligne `coverage: <appariées>/<déclarées> feuilles couleur`, avec les branches non appariées. Sortie octet-pour-octet identique d'une exécution à l'autre, inchangé.

### Invariant 7 — rien à comparer n'est pas un contrat conforme

C'est le **seul** point a11y qui refuse le figeage, et la doctrine tient : une paire qui échoue AA reste un `gap` qui plafonne, jamais un blocage. Ce qui est refusé n'est pas un ratio insuffisant, c'est un vocabulaire hors de portée du contrôle. Renommer un token pour plaire à l'heuristique est explicitement interdit — la sortie est de déclarer l'appariement. Une dérogation reste possible et coûte **trois** écritures conjointes : `--allow-unpaired`, une entrée `deviations.json § active[]` motivée, et un gap `contrast-unpaired` plafonnant à `normalized`. Sans les trois, le refus tient. Une dérogation ne fait donc pas monter le contrat : elle l'autorise à exister à `normalized` en disant pourquoi.

### `production-ready` exige un nombre de paires non nul

`status.py` lit désormais `allPass` **avec** `pairs` : un `allPass` vrai sur zéro paire ne vaut plus vert. Le champ absent vaut 1 par défaut, pour ne pas démoter les `checks` écrits avant ce lot. Nouvelle classe de gap `contrast-unpaired` au registre de maturité.

### Le contraste n'est pas « hors périmètre » — il est scindé

Requalification, pas ajout de couverture : les paires **déclarées** sont mesurées en amont, au figeage, et le résultat vit dans `release.json § checks.contrast` ; ce qui se recompose **à la peinture** (`opacity`, `color-mix`, voiles, dégradés) n'est vu par aucun des deux gates et revient à G6. `references/token-schema.md` affirmait qu'aucun outil du plugin ne mesure un contraste et que la conformité WCAG d'un contrat figé est « non établie » — c'était faux, et déjà faux avant ce lot. Corrigé, ainsi que `gate-natures.md`, `enforce/SKILL.md`, `05-fidelity-gate.md`, `agents/copycat.md` et les deux docs.

### Normalisation couleur de l'oracle de fidélité

`measure.py` compare les propriétés de `COLOR_PROPS` à travers `_normalize_color()`, qui replie une couleur calculée en `rgba(r, g, b, a)` canonique avant le test d'égalité. Sans elle, l'oracle rapportait `rgba(255, 255, 255, 0.7)` et `color(srgb 1 1 1 / 0.7)` — la même couleur, sérialisée deux fois par Chromium selon que l'auteur a écrit `rgba()` ou `color-mix()` — comme un écart de style. **Forme canonique, pas tolérance** : deux couleurs réellement différentes diffèrent toujours, et une valeur qui ne parse pas retombe sur l'égalité de chaîne brute au lieu d'être comptée comme un match. Seul sRGB est replié. Couvert par `adapters/measure/tests/test_color_norm.py`.

### Ajouté

- `adapters/a11y/contrast.py` — `color_leaves()`, `coverage()`, `declared_pairs()`, `value_at()` ; `run()` prend `allow_unpaired` ; `main()` imprime `NOTHING COMPARED — …` et la ligne `coverage:`.
- `skills/adjust/references/manifest-schema.md` — champ `.foregrounds` et **Invariant 7**.
- `skills/destructure/references/critique-report-template.md` — sections `## Contrastes mesurés` (table de verdicts, ligne de couverture, consigne explicite sur le cas zéro paire) et `### Appariements à déclarer`.
- `references/write-system-procedure.md` — l'inventaire de composants de la charte porte deux colonnes couleur, fonds et avant-plans : le seul endroit où l'usage transite d'un skill qui peut le voir vers un skill qui doit l'exiger.
- `adapters/measure/tests/test_color_norm.py`.

### Modifié

- `skills/define/actions/02-extract.md` — relever les appariements observés, pas seulement les couleurs ; un `brand.deep` qui porte un titre est un appariement au même titre qu'un `semantic.text`.
- `skills/define/actions/03-construct.md` — sur le chemin brief rien n'est observable : les appariements se décident en même temps que les couleurs, sinon personne ne les dira plus tard.
- `skills/define/actions/04-write-material.md` — colonnes couleur requises pour tout composant affichant du texte.
- `skills/destructure/actions/01-challenge.md` — étape 2-bis, exécution de `contrast.py` ; `references/critique-lenses.md` — la lentille 3 rend des ratios, plus une appréciation.
- `skills/adjust/actions/02-freeze.md` — refus sur exit 3, deux sources d'appariement nommées (charte et rapport de critique, le second primant puisqu'il a été chiffré), dérogation à trois écritures.
- `skills/diffuse/actions/01-define-element.md` — ne jamais choisir une couleur de texte hors de `.foregrounds` ; signaler le silence du contrat au lieu de le combler.
- `tools/status.py`, `references/maturity-status.md`, `references/contract-schema.md`, `references/enforcement-registry.md`, `references/token-schema.md`, `tools/migrate-contract.py` (`foregrounds` au jeu `KNOWN_COMPONENT`), `skills/enforce/fixtures/status/validated/release.json`, `docs/concepts.md`, `docs/troubleshooting.md`.
- Titres des fichiers d'action dénumérotés (`# 01-explain` → `# Explain`) sur les cinq skills concernés.

## [2.6.1] — 2026-07-27

### Fixed — README décrivait des numéros de version au lieu de l'existant

- Titres de section (`Statut de maturité et seuil de conformité`, `Artefacts dérivés`, `copycat — réplication de maquette mesurée`) et la phrase du gate de fidélité portaient un numéro de version entre parenthèses (`(2.4.0)`, `(2.1.0)`, `(1.1.0)`, « Depuis 1.1.0 : … »). Retirés — l'historique des versions est le rôle du CHANGELOG, pas du README.

## [2.6.0] — 2026-07-25

Mineur — **le harness de maquette peut, en opt-in, parler les mêmes tokens que ceux contre lesquels l'implémentation est lintée.** Un nouveau flag optionnel `--contract <dir>` fait inline à la maquette générée la feuille de tokens **déjà produite** du contrat (l'entrée `policies.json § adapters[]` de `consumer:"stylesheet"`), avant le chrome, pour que la référence et l'implémentation partagent une source de vérité unique. Sans le flag, le scaffold est **inchangé** et sort toujours en 0.

### Couplage opt-in, option C — inline, jamais dérivé

`--contract` lit la feuille telle que produite par `tools/generate.py` et l'inline dans un `<style>` en tête de `<head>` ; le harness ne dérive ni ne régénère (un seul producteur, `generate.py`). Quand la feuille est inline, le cadrage LLM du fichier généré instruit l'auteur de consommer les tokens via `var(--…)` et de ne jamais coder en dur couleur/espacement/typographie.

### Espace de codes de sortie — sous `--contract` uniquement

Le harness rejoint l'espace fixe du plugin **seulement** sous `--contract` : `release.json` absent (contrat 1.x) → **3** (nomme `migrate-contract.py`) ; `release.json` présent mais JSON invalide → **2** (nomme `release.json`) ; `policies.json` ou l'adapter stylesheet déclaré absent/illisible → **2** (nomme `generate.py`) ; aucun adapter stylesheet déclaré → **0** avec un avertissement stderr et poursuite en scaffold. Le harness n'émet **jamais** 1 ni 4 ; le chemin historique « aucune page » sort désormais en 2, non en 1.

### Trois échantillons device, jamais de media query

Le modèle device est reformulé : trois vues discrètes **par classe** — desktop (fluide) · tablet 834 · mobile 390 —, des échantillons device et non des breakpoints, **rien n'étant dérivé** de `tokens.json § breakpoint.*`. Le template ne contient plus aucun `@media`. Accord documenté avec `measure.py` / `config-gen.py` (ensemble de viewports clos par construction) dans la nouvelle référence `references/harness-contract.md`. Ajoute des fixtures de contrat et `tools/harness-selftest.sh` (preuve exécutable des cinq branches).

## [2.5.0] — 2026-07-25

Mineur — **un consommateur qui ne sait rien du plugin obtient, en une invocation, la carte des verbes et la séquence exécutable pour sa propre classe de cas, étendue par le workflow de plateforme quand le pivot correspondant est installé.** Introduit un **7ᵉ skill `detail` (verbe 0)** en tête d'entonnoir : lecture seule, aucun artefact de sortie, deux actions — `explain` rend la carte des verbes, `route` rend ce qu'il faut exécuter. Le corps agnostique de la stack porte **six classes de cas** exhaustives (signature d'entrée × état du contrat) ; les workflows de niveau plateforme, eux, **quittent `design` pour les pivots `sc-*`**, sous un squelette figé par le contrat de pivot. Aucun verbe existant ne change ; l'entonnoir de production reste `define → destructure → adjust → enforce → diffuse`.

### `detail` ne fait rien de ce qu'il décrit

Le verbe 0 est **strictement en lecture seule** : il n'écrit aucun artefact, ne fige rien, ne corrige rien en silence. `explain` lit la carte autoritaire (`references/funnel-map.md`) sans jamais paraphraser le process d'un verbe — il cite le fichier autoritaire. `route` classe une intention dans l'une des six classes, relève l'état du contrat **observé** (et signale tout écart avec l'attendu au lieu de le corriger), applique la règle de résolution de pivot, émet la séquence et s'arrête.

### Les six classes de cas — fermées, agnostiques de la stack

`mockup-multipage` · `brief-only` · `codebase-inherited` (contrat absent) ; `element-evolution` · `contract-drift` · `element-production` (contrat figé). L'ensemble est **clos** : il couvre toute combinaison signature d'entrée × état du contrat. `harness` n'est **pas** une classe — c'est la précondition de `mockup-multipage`. Aucune classe ne présuppose de plateforme, de vendor ni de projet.

### Les workflows de plateforme vivent dans les pivots (dec-002)

Un workflow de plateforme est un COMMENT : il quitte le cœur agnostique pour le pivot qui sert la plateforme, sous un **squelette figé** (`references/sc-pivot-contract.md § Workflow de plateforme`) — cinq titres imposés, déclaration de phase input/output/verbe, prérequis écrits en capabilities (jamais en vendors), gates instanciés (jamais redéfinis). `02-route` étend la classe agnostique par ce workflow quand le pivot est installé **et** que la stack correspond ; sinon la classe seule, l'absence énoncée et l'installation de `sc-<langage>` recommandée.

### Ajouté

- `skills/detail/` — le 7ᵉ skill : `SKILL.md` (verbe 0, routage des deux actions, règles transversales de lecture seule), `actions/01-explain.md`, `actions/02-route.md`, `references/funnel-map.md` (la carte des verbes, source unique lue par `explain`), `references/workflow-classes.md` (les six classes de cas), `evals/scenarios.json` (18 scénarios `explain`/`route`/`null`).
- `references/sc-pivot-contract.md § Workflow de plateforme` — le squelette figé des workflows de plateforme portés par les pivots (chemin canonique, cinq titres, déclaration de phase, règle des capabilities, règle d'instanciation des gates, règle de résolution par `02-route`).
- Dans les pivots (livrés avec ce lot) : `sc-php:design-bridge/references/workflow-fse.md`, `sc-js:design-bridge/references/workflow-spa.md`, `sc-css:design-bridge/references/workflow-static.md` — les trois premiers workflows de plateforme instanciés.

### Migration des contrats figés (Part 7 — ops, version inchangée)

Les six contrats consommateurs figés en 1.x sont migrés en 2.x par l'outillage livré (lots 1–5), un projet à la fois. La migration s'exécute **dans les dépôts consommateurs** et ne modifie ni règle ni verbe du plugin. Trois classes de cas rencontrées à la migration deviennent des fixtures, seul apport de Part 7 au périmètre du plugin — aucun changement de version.

- `skills/enforce/fixtures/migration/oracle-empty/` — classe de cas : **aucune cible oracle**. `mode` déclaré, composants non vides, mais aucune clé `oracle`. La migration écrit `components`/`policies`/`release` sans `oracle.json` (`split()` ne pose pas d'oracle vide) ; le linter et `generate --check` sortent en 0. Complète `oracle-contract-level` (oracle de niveau contrat) et `nominal-*` (oracle par composant).
- `skills/enforce/fixtures/migration/platform-token-namespace/` — classe de cas : **namespace de tokens de plateforme non possédé par le contrat**. Contrat 2.x migré + `sample.html` inlinant `var(--platform--accent)` (namespace **générique**, jamais lié à une plateforme nommée). La Rule 2 (`token-reference`) vérifie contre le seul `tokens.json` et sort en **1** — divergence **de frontière attendue**, pas une régression ; l'extension de couverture appartient à un pivot `sc-<langage>:design-bridge`, jamais à `lint-core.mjs`.
- `skills/enforce/fixtures/migration/ledger-table-shape/` — classe de cas : **ledger en forme tableau**. `ds-deviation-ledger.md` en tableau pipe → `--ledger` lit **0 entrée** (le parseur attend des blocs `### DEV-NNN`). Un `deviations.json` préexistant plus riche fait autorité ; la passe ledger n'est pas jouée et la passe contrat ne le touche jamais. Complète `oracle/ledger-1x/` (ledger bien formé).

## [2.4.0] — 2026-07-25

Mineur — **chaque contrat porte un statut de maturité calculé qui commande l'invocation de la conformité, et tout écart connu plafonne ce statut au lieu d'être noté en prose**. Le statut est une échelle à quatre échelons — `extracted` (les artefacts existent) · `normalized` (+ charte) · `validated` (+ vérifications enregistrées) · `production-ready` (+ contraste vert et états déclaratifs complets) — calculée par une seule implémentation, `tools/status.py`. La conformité ne s'affirme qu'au **seuil `validated`** : en deçà, `tools/run-gates.py` **sort en 4** — les violations restent listées, mais la conformité n'est pas affirmée et le rapport nomme le chemin qui remonte le statut. Le seuil a une seule source humaine (`references/maturity-status.md`) et une seule source exécutable (la constante `THRESHOLD` de `status.py`, importée par `run-gates.py`). Aucune règle de lint n'est ajoutée ni retirée ; les configurations Lot 3 (contrat à `validated`) sortent toujours en 0 et 1.

### Pas de droit acquis — un contrat migré entre à `normalized`

Un contrat migré depuis 1.x n'hérite d'aucune conformité : il entre à `normalized`, donc **sous le seuil**, conformité suspendue jusqu'à ce que les vérifications soient enregistrées et le statut relevé. Le gate continue de bloquer les vraies violations (il ne se relâche jamais), mais il ne **certifie** rien tant que le contrat n'a pas grimpé. Le vert du linter porte sur le vocabulaire d'un fichier ; il n'a jamais valu attestation de maturité, et la sortie 4 rend cette distinction opposable.

### L'a11y calculable est scindée par ce qui l'est, et quand (dec-002)

- **Contraste texte/fond** — calculé par le plugin au figeage, déterministe, depuis les valeurs de tokens **résolues dans chaque thème** (`adapters/a11y/contrast.py`). Deux exécutions rendent une sortie octet-pour-octet identique, une ligne `pass`/`fail` par paire et par thème. Enregistré dans `release.json § checks.contrast` ; une paire qui échoue est un gap `contrast`.
- **Présence déclarative des états** `disabled`/`error`/`focus` — vérifiée par le plugin au figeage, **sans aucun markup** (`tools/status.py --states`, lit `components.json § .states`). Une déclaration partielle est un gap `states`.
- **Rôles et attributs ARIA** — restent du markup : réalisés par un pivot `sc-<langage>:design-bridge`, non réalisés à l'exécution sans pivot installé. Le plugin ne les affirme jamais.

### Les écarts vivent dans l'artefact, plus dans la prose

`release.json § gaps[]` porte chaque écart connu avec `class` / `caps` / `detail` ; le gap **plafonne** la maturité (charte absente → `extracted` · contraste jamais calculé → `normalized` · une paire de contraste ou un état qui échoue → `validated`). Le figeage ne **bloque plus** sur un point a11y non vert : il l'enregistre en gap et laisse `status.py` plafonner. Ce qui n'est pas atteint est constaté, jamais transformé en refus de figer ni dissous en commentaire.

### Ajouté

- `references/maturity-status.md` — l'énoncé humain unique des quatre statuts, du seuil et de la table classe-de-gap → plafond. Référencé par `enforce`, `diffuse` et `harness` ; aucun ne réénonce la valeur du seuil.
- `adapters/a11y/contrast.py` — l'oracle de contraste WCAG AA par thème, déterministe, `--json`. Exit 0 ou 2.
- `tools/status.py` étendu — constante `THRESHOLD`, `meets_threshold()`, contrôle des états (`--states`), plafonnement par `gaps[]`.
- `skills/enforce/fixtures/status/{layer-3-absent,no-contrast-run,validated}` — trois contrats calculant exactement `extracted`, `normalized`, `validated`.
- `skills/enforce/fixtures/gates.below-threshold.config.json` — contrat `no-contrast-run`, cibles dirty : le runner sort en 4 en listant les mêmes violations que la config dirty.

### Modifié

- `tools/run-gates.py` — oppose le seuil de maturité après le lint : sous le seuil, exit 4, violations toujours listées, chemin de remontée nommé. Importe `THRESHOLD` de `status.py`.
- `skills/adjust/actions/02-freeze.md` — calcule contraste et états au figeage, enregistre `checks` et `gaps`, écrit le statut rendu par `status.py`. Ne refuse plus de figer sur un point a11y non vérifié.
- `references/contract-schema.md`, `skills/adjust/references/manifest-schema.md`, `references/enforcement-registry.md` — champ `status` opposable, bloc `checks`, enregistrement des `gaps`, champ `.states` fermé (trois clés booléennes), table « qui réalise quel volet a11y ».

## [2.3.0] — 2026-07-25

Mineur — **la conformité n'est affirmée que par l'oracle par propriété, et tout écart toléré référence une entrée d'écart portant sa valeur attendue**. Le gate de fidélité cesse de pouvoir se rabattre sur un diff pixel vert : `measure.py` lit un registre d'écarts obligatoire, ne sanctionne un écart que via une entrée `active` non expirée portant son `expected`, et rend un verdict `CLOSED`/`OPEN` par propriété. Le registre `deviations.json` gagne une **vue Markdown générée** (`tools/generate.py`, rôle `deviation ledger`) : on édite le JSON, jamais la vue, et deux générations successives sont octet-pour-octet identiques. Un vocabulaire unique remplace le jargon projet dans tout l'oracle : `mockup`/`implementation` au lieu de `maq`/`wp`.

### Breaking — trois changements incompatibles

1. **`--ledger-registry` devient requis.** `measure.py` invoqué sans cet argument sort en **2** (erreur d'invocation) en nommant l'argument manquant, au lieu de mesurer. Un rendu non validé contre un registre n'est jamais déclaré conforme. Aucun alias, aucun défaut implicite.
2. **Les valeurs de `--side` sont renommées.** `maq|wp` → `mockup|implementation`. Idem pour les clés de config et de rapport : `maq`/`maquette`/`wp` → `mockup`/`implementation`, `missing_in_wp`/`extra_in_wp` → `_in_implementation`, `maq_count`/`wp_count` → `mockup_count`/`implementation_count`, `maq_viewport` → `mockup_viewport`. Les anciennes clés ne sont plus lues.
3. **La configuration d'exemple est remplacée.** Le config projet (`configs/mentions-legales.json`, adresses externes et sélecteurs spécifiques à une stack) est retiré ; `configs/example.json` le remplace — générique, deux adresses `localhost`, sélecteurs BEM neutres, aucun nom de projet.

### Conséquence assumée — l'oracle exige un câblage explicite

Le gate de fidélité refuse désormais d'affirmer la conformité quand une référence externe existe mais que l'oracle n'est pas câblé : il **refuse** et nomme l'étape (`config-gen.py` → config → `deviations.json` → `measure.py --ledger-registry`). Le refus est un état distinct du vert et du rouge. Ce n'est pas un durcissement gratuit : c'est le prix de ne plus laisser un diff pixel vert certifier une surface que l'oracle n'a pas mesurée.

## [2.2.0] — 2026-07-24

Mineur — **enforcement distribué : chaque règle déclarée a un réalisateur nommé, ou est visiblement déclarée non réalisée**. Le linter portable cesse d'être présenté comme le gate du système : son périmètre est écrit, et ce qu'il ne peut pas lire est typé, routé vers un pivot, et rendu au gate par un rapport. Un runner Python agrège le tout et renvoie **le même code de sortie aux trois sites d'appel**. Aucune règle de lint n'est ajoutée ni retirée, et la baseline des huit fixtures reste `0 1 0 1 0 1 0 1`.

### Conséquence assumée — Python devient un prérequis de pre-commit

Le runner est écrit en Python. **Tout projet consommateur doit donc disposer de Python 3.10+ pour armer son pre-commit, y compris un projet dont la source est du JavaScript pur** ; Node.js 18+ reste requis pour que le runner invoque `lint-core.mjs`. Ce n'est pas un effet de bord : c'est le prix de l'agrégation, énoncé plutôt que découvert. L'alternative — un runner Node — aurait rendu impossible l'appel depuis un projet sans Node, et le contrat en compte déjà (PHP, Python). Le prérequis est écrit une seule fois, dans `skills/enforce/references/gate-wiring.md`, et rappelé par l'exit **2** du runner quand un runtime manque : jamais un `1` silencieux, jamais une trace d'exception.

### Ce qu'une règle non réalisée change

Rien au code de sortie — et c'est le point. Une règle sans réalisateur n'est ni une violation ni une conformité : elle est **listée avec sa raison**. Avant, elle disparaissait ; un rapport vert certifiait alors une surface que personne n'avait ouverte. Aucun drapeau ne masque un `unrealized`.

| Situation | Rapport du gate | Exit |
|---|---|---|
| règle réalisée, aucune violation | `REALIZED <id> (<type>) by <realizer>` | inchangé |
| règle réalisée, violations | une entrée `VIOLATION` par occurrence | 1 |
| réceptacle qui déclare ne pas la couvrir | `UNREALIZED <id> - <realizer> reports it unrealized` | inchangé |
| réceptacle non lancé, ou rapport absent | `UNREALIZED <id> - no report from its realizer` | inchangé |

### Ajouté

- `tools/run-gates.py` — runner d'agrégation. **Il route, il n'évalue jamais** : il ne lit que la configuration, `policies.json`, la sortie `--json` du linter et les rapports de pivot ; il n'ouvre aucun fichier cible et ne fait correspondre aucun motif. Exits : `0` conforme · `1` violation · `2` invocation ou environnement (configuration illisible, type d'enforcement inconnu, runtime absent) · `3` contrat 1.x.
- `references/enforcement-registry.md` — les valeurs typées de `enforcement`, leur réalisateur et leur cible de pivot. Le type est **la preuve que la règle doit lire**, jamais le nom d'une plateforme : `markup` · `stylesheet` · `source-graph` · `stored-content` · `platform-config` · `unrealized`.
- `references/gate-config-schema.md` — `gates.config.json` (le périmètre exécutable : contrat, cibles, rapports de pivot) et le **format du rapport de pivot**, spécifié là parce que c'est le fichier d'entrée du runner, et dupliqué nulle part. Une entrée de `pivotReports` accepte `{ "path", "command" }` : avec `command`, le runner relance le réalisateur natif avant de lire — un rapport périmé devient impossible.
- `skills/enforce/fixtures/gates.clean.config.json` et `gates.dirty.config.json` — le runner sort en 0 sur l'un, en 1 sur l'autre.
- `lint-core.mjs --json` — sortie lisible par machine : violations, règles réalisées, fichier scanné. Aucune règle nouvelle.

### Modifié

- **Périmètre du linter portable, déclaré** (`skills/enforce/SKILL.md`) — c'est un scanner de chaînes, fichier par fichier, sans dépendance. Il ne résout ni cascade, ni graphe d'imports, ni liaison dynamique, ni contenu hors du disque. Ce périmètre est désormais écrit à côté du runner et du registre, comme trois choses distinctes.
- **Obligation de report côté pivots** (`references/sc-pivot-contract.md`, `skills/enforce/actions/04-pivot.md`) — le spec d'enforcement émet les règles assignées avec leur type et un `Report path` ; le réceptacle écrit un rapport **pour chaque règle assignée, réalisée ou non**. Réalisée dans sc-css 0.2.0, sc-js 0.12.0, sc-php 0.6.0.
- **Un seul appel, partout** (`skills/enforce/actions/02-wire-gates.md`, `references/gate-wiring.md`) — `python design/lint/run-gates.py --config design/lint/gates.config.json`, en local, en pre-commit et en CI. La boucle par fichier décrite dans le câblage pre-commit disparaît : un second linter appelé à côté produirait un deuxième verdict que rien n'agrège.

### Déplacé — les plateformes quittent le cœur

`references/wordpress-pitfalls.md` et `skills/enforce/adapters/wordpress.md` partent chez `sc-php`, contenu inchangé hors chemins de référence. Le principe qu'ils violaient : **une contrainte de plateforme appartient au réceptacle qui la sert**. Les fichiers d'instruction qui les citaient énoncent désormais la règle génériquement, la cible étant résolue par le registre d'enforcement.

Conséquence sur le routage de `enforce` : la table « à deux tracks » nommée par plateforme est remplacée par **deux propriétés du terrain, indépendantes** — tout le markup vit-il dans des fichiers versionnés ? une référence visuelle externe existe-t-elle ? Un projet peut avoir du contenu stocké sans maquette, ou l'inverse. Le nom de la plateforme n'en décide aucune. L'adaptateur de mesure (`adapters/measure/`) reste la dernière surface à nommer une plateforme dans son API : renommée au lot suivant.

## [2.1.0] — 2026-07-24

Mineur — **les artefacts dérivés cessent d'être écrits par un modèle**. `tools/generate.py` en devient le seul producteur : il lit les sources JSON du contrat, émet un artefact par entrée de `policies.json § adapters[]` déclarant un `consumer`, et grave dans `release.json § generated` l'empreinte de chaque source lue. `--check` refuse une retouche manuelle et une source périmée. Aucune règle de lint ne change, la baseline des huit fixtures reste `0 1 0 1 0 1 0 1`.

### Ce qui n'est plus écrit à la main

`adapters/tokens.css` et tout autre artefact dérivé déclaré dans la table de correspondance. Avant : `define/04-write-material` les écrivait en brouillon, `diffuse` les supposait à jour, et rien ne mesurait l'écart. Après :

| Étape | Avant | Après |
|---|---|---|
| `define/04-write-material` | écrit `tokens.json` **et** les adapters | écrit `tokens.json` seul ; **détecte** les consommateurs et les consigne en § Provenance |
| `adjust/02-freeze` | écrit `release.json`, fin | écrit `release.json`, puis `generate.py --contract design/` — les artefacts et leur enregistrement de dérive |
| `diffuse/02-render` | rend, puis lint | **Étape 0** : `generate.py --check` ; exit ≠ 0 ⇒ pas de rendu |

Une retouche manuelle d'un artefact dérivé est désormais un échec de dérive, **et aucun drapeau ne la neutralise** : la correction est de changer la source puis de régénérer. Un artefact généré puis supprimé est également une dérive. Ne le sont pas : un contrat sans clé `generated` (rien n'a jamais été figé — `--check` n'a pas de repère) et une entrée `adapters[]` sans `consumer` (déclarée, jamais produite).

### Ajouté

- `tools/generate.py` — génération déterministe. Ordre de source jamais retrié, LF, une déclaration par ligne, bannière nommant les sources : deux exécutions produisent des arbres identiques octet pour octet. Exit `0` succès · `1` dérive · `2` invocation ou artefact structurellement invalide · `3` contrat 1.x.
- `references/token-schema.md § Generator specification` — entrées, sélection, émetteurs **par rôle de consommateur**, ordre, formatage, résolution des alias et des thèmes. Aucun émetteur n'est indexé par un nom de stack : le contrat déclare un rôle, le générateur choisit l'émetteur, et une forme propre à une plateforme reste au pivot qui la possède (DEC-002).
- `references/token-schema.md § Path-to-variable transform` — la transformation chemin → variable, énoncée **une seule fois**, partagée par le générateur, `lint-core.mjs` et l'adaptateur baseline de `diffuse`.
- `references/contract-schema.md § Enregistrement de dérive` — `release.json § generated`, un `sha256` **par source réellement lue**, pas un hash unique sur le jeu concaténé : le message de dérive doit nommer la source qui a bougé, pas constater qu'une l'a fait.

### Modifié

- `policies.json § adapters[]` passe d'informationnel à **exécutable** : c'est la liste d'émission. `write-system-procedure.md § Adapter emission rule` décrit désormais une **détection** de consommateurs, table exprimée en rôles, et non plus une écriture de fichiers.
- La résolution des alias dépend du rôle : `{color.neutral.50}` devient `var(--color-neutral-50)` pour un rôle feuille de style — la cascade porte les thèmes — et la valeur littérale pour les autres rôles, qui n'ont pas de cascade.
- `config-gen.py` : `--maquette-url` → `--reference-url`, `--wp-url` → `--implementation-url` (dette annoncée en 2.0.1 § Reporté). Deux rôles au lieu d'une plateforme et d'une abréviation. **Les anciens noms restent acceptés** comme alias, et `measure.py` / `screenshot.py` lisent les anciennes clés de config en repli : un config déjà écrit reste mesurable sans réécriture. Clés canoniques : `reference_url`, `reference_page`, `implementation_url`.

## [2.0.1] — 2026-07-24

Patch — **un artefact structurellement invalide sort en 2 en nommant le champ, au lieu de rendre un verdict vert**. Le 2.0.0 avait posé la règle « une décision que l'outil refuse de deviner sort en 2 » et l'avait appliquée deux fois — `mode` non déclaré, argument de contrat manquant — sans balayer la classe. Cinq sites la prenaient encore pour acquise. Aucune règle de lint n'est ajoutée ni retirée, aucune surface CLI ne change, et la baseline des huit fixtures reste `0 1 0 1 0 1 0 1`.

### Corrigé

Le diagnostic initial supposait des exceptions non rattrapées (exit 1). La mesure sur fixtures a montré pire : côté `lint-core.mjs`, **les trois cas sortaient en 0**.

| Site | Entrée | Avant | Après |
|---|---|---|---|
| `lint-core.mjs` — dérivation du vocabulaire | un composant qui est une chaîne | **exit 0** — `comp.base` vaut `undefined`, `knownBases` le contient, aucune classe du markup ne correspond jamais à un bloc déclaré, tout devient utilitaire : vert sur un contrat qui ne déclare rien | exit 2, `components.json`, le champ et la valeur reçue |
| `lint-core.mjs` — idem | `base` absent ou non-chaîne | **exit 0** — la valeur entre dans le jeu de classes valides, où rien ne peut l'égaler | exit 2, idem |
| `lint-core.mjs` — `$utilityPrefixes` | un objet au lieu d'un tableau | **exit 0** tant que le markup n'atteint pas le site ; `.some` lève dès qu'il l'atteint, sous `--strict` | exit 2, `policies.json` |
| `migrate-contract.py` — racine du manifeste | un tableau | exit 1 + trace `AttributeError` | exit 2, le fichier et `$` |
| `migrate-contract.py` — un composant | une chaîne | exit 1 + trace `AttributeError` | exit 2, le fichier et `$.components.<nom>` |

La validation se fait **à la dérivation**, pas à chaque site d'usage : un contrat malformé l'est indépendamment du markup scanné, et `$utilityPrefixes` n'est lu que sous `--strict` sur une classe de forme BEM non déclarée — valider là aurait fait dépendre le refus du fichier passé. Côté migration, le contrôle précède aussi le chemin `--dry-run` : un dry-run qui plante n'est pas un dry-run.

`status.py` nomme désormais le contrat évalué — sur **stderr**. `adjust/02-freeze.md` copie stdout tel quel dans `release.json § status` ; tout ajout à cette ligne aurait atterri dans le contrat.

### Ajouté

- `skills/enforce/fixtures/malformed/` — cinq contrats malformés à la main, un par site, chacun accompagné du défaut qu'il atteint. Trois en 2.0 pour le linter, deux en 1.x (`1x-`) pour la migration. Ils ne sont pas dans l'énumération des huit fixtures et ne touchent pas la baseline.
- `skills/enforce/fixtures/migration/oracle-contract-level/` — la branche `$.oracle` de niveau contrat n'était couverte par aucune fixture. Elle produit bien `oracle.json § contract`, déclaré par `release.json`, avec l'anomalie qui signale que seule la forme par composant a un lecteur.
- `references/contract-schema.md § Contrat incomplet` — une ligne : un champ dont la forme ne correspond pas à sa déclaration sort en 2.

### Reporté

`config-gen.py --wp-url` / `--maquette-url` nomment une plateforme et une abréviation dans un outil déclaré agnostique. Les renommer est une rupture de CLI, incompatible avec un patch : le renommage est porté par le **Lot 2**, qui touche déjà ce fichier et prend la fenêtre de rupture.

## [2.0.0] — 2026-07-24

**BREAKING** — le contrat cesse d'être un monolithe. `components.json` portait quatre natures de données à la fois ; elles deviennent quatre artefacts adressables racinés par `release.json`. `lint-core.mjs` ne lit plus que ce format : un contrat 1.x est **diagnostiqué**, jamais parsé. La baseline des huit fixtures reste `0 1 0 1 0 1 0 1`. Décision : `aidd_docs/internal/decisions/005-design-2-0-contract-split.md`.

### Migrer

```
python plugins/design/tools/migrate-contract.py --contract <dossier> --dry-run
python plugins/design/tools/migrate-contract.py --contract <dossier>
```

Le contrat 1.x est sauvegardé avant écriture, une seconde exécution est un no-op, et `--dry-run` n'écrit rien. Le mode n'est **jamais** deviné : un contrat qui ne déclare pas `mode` fait sortir le script en 2 en nommant `--mode`. Procédure complète, contrôle de non-régression compris : `skills/adjust/actions/03-migrate.md`.

### Redistribution des champs

Rien n'est inventé, rien n'est perdu — une clé hors de cette table est transportée telle quelle et signalée comme anomalie.

| Source (1.x) | Cible (2.0) |
|---|---|
| `tokens.json` | inchangé |
| `components.*` (`base`, `elements`, `modifiers`, `backgrounds`, `a11y`) | `components.json` |
| `mode`, `$utilityPrefixes`, `usage.*` | `policies.json` |
| `components.*.oracle` (`check_text`, `props`, `collections`, `ack`) | `oracle.json` |
| `$version`, version de la charte | `release.json` |
| nouveau : empreintes de source, provenance, statut de maturité | `release.json` |
| nouveau : table de correspondance des adapters | `policies.json` |

`oracle.json` n'est écrit et déclaré que si le contrat 1.x porte au moins une cible de mesure ; sans cible, la migration produit trois artefacts, pas quatre. `design-system.md` reste une **entrée** du contrat, pas un artefact : sa présence et sa version sont constatées dans `release.json`.

### Rupture

- **`release.json` est obligatoire.** Son absence est la signature d'un contrat 1.x : `lint-core.mjs` sort en **3** en imprimant la commande de migration. Il n'y a plus aucun chemin de lecture 1.x.
- **`mode` est déclaré, jamais déduit.** L'inférence « jeu de composants vide ⇒ utility-first » est supprimée : elle transformait un contrat non écrit en run vert. Un `mode` absent ou inconnu → exit **2**.
- **L'invariant de parité de versions disparaît.** `release.json` déclare une version par artefact et celle de la charte ; un écart est une donnée constatée, plus une violation.
- **`$version` quitte les artefacts dérivés.** Il n'y a plus qu'un endroit où une version est écrite.

### Ajouté

- `tools/migrate-contract.py` — `--contract`, `--dry-run`, `--mode`, `--now`. Rapport : correspondance champ à champ, table des adapters dérivée des fichiers réellement présents, anomalies, statut initial.
- `tools/status.py` — **seule** implémentation du statut de maturité (`extracted → normalized → validated → production-ready`). Les quatre littéraux n'existent nulle part ailleurs. Le statut est écrit dans `release.json` ; il n'est opposable à rien à cette version.
- `references/contract-schema.md` — schéma des quatre artefacts et de la racine, chaque champ tagué *exécutable* (avec son consommateur nommé) ou *informationnel* ; table de redistribution depuis un contrat 1.x ; table de correspondance des adapters ; dérivation des règles de lint.
- `skills/adjust/actions/03-migrate.md` — pilote le script : verdict de référence relevé **avant** écriture, dry-run validé par un humain, sauvegarde, puis contrôle de non-régression fichier par fichier.
- `skills/enforce/fixtures/migration/` — quatre classes de cas : `nominal-1x` (+ sortie attendue `nominal-2x`), `no-layer-3` (charte absente), `version-skew` (versions divergentes), `mode-undeclared` (mode absent, composants non vides).

### Modifié

- `skills/enforce/adapters/lint-core.mjs` — lit `release.json`, `tokens.json`, `components.json`, `policies.json` et `oracle.json` ; présence et lisibilité vérifiées pour chaque artefact déclaré (absent ou illisible → exit 2). `mode` et `$utilityPrefixes` viennent de `policies.json`. **Aucune des cinq règles ne change.**
- `skills/enforce/adapters/lint-core.mjs` — le dossier de contrat s'écrit `--contract <dossier>`, forme uniforme avec `migrate-contract.py` et `config-gen.py`. Le second positionnel continue de fonctionner : les hooks pre-commit déjà installés tournent sans retouche. Les deux formes ensemble ne sont acceptées que si elles désignent le même dossier, sinon exit **2**. Une option inconnue sort en 2 au lieu d'être ignorée. Toutes les invocations documentées passent en forme nommée.
- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `index.json` — une seule description, identique dans les trois registres. Elle décrivait un contrat à trois couches que le linter refuse désormais de lire, comptait cinq skills sur six (`harness` invisible) et annonçait « 4 gates » ici, « 3 gates » là. Un consommateur lit ces fichiers avant d'installer.
- `adapters/measure/config-gen.py` — lit les hints dans `oracle.json` ; nouveau `--oracle`, par défaut le frère de `--components`.
- `skills/adjust/actions/02-freeze.md` — écrit les quatre artefacts puis `release.json` (empreintes, provenance, statut rendu par `status.py`) avant la réconciliation retrofit ; l'Étape 4 reporte la version de la charte au lieu de tenir une parité.
- `skills/adjust/SKILL.md` — route vers `03-migrate`.
- `skills/adjust/references/manifest-schema.md` — réduit à `components.json` ; six invariants au lieu de sept. Le renvoi de `02-freeze.md` vers sa section « Mode utility-first », supprimée par cette réduction, pointe désormais vers `references/contract-schema.md § Où porte le vocabulaire, selon mode`.
- `references/design-system-contract.md`, `references/token-schema.md`, `agents/copycat.md` et les skills concernées — le contrat n'est plus décrit comme trois couches.
- `references/gate-natures.md` (nouveau) — énoncé canonique des deux natures de gate. `skills/enforce/SKILL.md`, `skills/enforce/actions/05-fidelity-gate.md` et `README.md` le portaient chacun, en trois tables aux colonnes différentes qui avaient divergé : l'une nommait « 4 points » là où l'autre disait « Gates 1-3 », l'une omettait `policies.json` de la référence interne, une autre la mesure par breakpoint. Les trois pointent désormais vers un seul texte. `05-fidelity-gate.md` demandait encore `tokens.json` + `components.json` en prérequis, formulation 1.x.

### Corrigé — le remède offert à un contrat 1.x ne menait nulle part hors du dépôt

- **Symptôme.** `lint-core.mjs` construisait le chemin de `migrate-contract.py` par `../../../tools/` relatif à lui-même. Juste dans le plugin ; or `01-build-linter.md` l'installe en `design/lint/` chez le consommateur, où `../../../` remonte au-dessus de la racine projet. Les six contrats 1.x figés se voyaient donc offrir, comme seule issue, un chemin mort.
- **Second symptôme, même classe.** `migrate-contract.py` importe `status.py` en frère. Copié seul, l'import échouait en trace Python — sortie **1**, c'est-à-dire « violation de lint » dans l'espace de codes.
- **Correctif.** Le script est **localisé**, jamais supposé : sondé à côté du linter, puis dans `../tools/`, puis dans `../../../tools/`. Aucun trouvé → le message nomme le plugin au lieu d'un fichier inexistant. L'import de `status.py` sort en **2** en nommant le fichier manquant. `01-build-linter.md` copie les trois fichiers à plat dans `design/lint/`.
- **Vérifié.** Depuis le layout consommateur, la commande imprimée par l'exit 3 tourne réellement : dry-run 0, migration 0, re-lint lisible, rejeu no-op 0.

### Corrigé — un `release.json` partiel désactivait des règles en silence

- **Symptôme.** `release.json` étant écrit à la main au figeage, il pouvait ne déclarer qu'une partie des artefacts. `dirty.html` rendait 3 erreurs contre le contrat complet et **1** contre un `release.json` réduit à `tokens.json` + `policies.json` — sans `components.json`, la règle 1 tourne sur un vocabulaire vide et toute classe est valide. Aucun diagnostic.
- **Correctif.** Les trois artefacts dont les cinq règles dérivent (`tokens.json`, `components.json`, `policies.json`) doivent être déclarés : un contrat qui n'en déclare pas les trois n'est pas un contrat plus petit, c'est une règle désactivée → **exit 2**, en nommant ce qui manque. `oracle.json` reste facultatif : il n'est écrit que si le brief produit des cibles de mesure, et aucune règle ne le lit.

### Codes de sortie de `lint-core.mjs`

| Code | Sens |
|---|---|
| 0 | aucune erreur |
| 1 | au moins une violation |
| 2 | erreur d'invocation ou d'environnement, y compris une décision que l'outil refuse de deviner |
| 3 | contrat au format 1.x, migration requise |


---

Les versions 1.0.0 → 1.17.0 sont archivées dans [`CHANGELOG-1.x.md`](CHANGELOG-1.x.md).
