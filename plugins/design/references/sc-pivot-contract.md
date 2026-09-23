# Contrat de pivot — design ↔ sc-\<langage\>

Interface partagée entre `design:enforce` / `design:diffuse` (émetteurs) et `sc-<langage>:design-bridge` (réceptacles). Fige le format du spec d'enforcement et du spec de rendu, et ce que le réceptacle doit renvoyer.

Réutilise l'idiome de relais existant du dépôt (cf `overcode:service help` et `sc-*:sniff` → `.claude/rules/07-quality`).

---

## Pourquoi un contrat de pivot

Le design garde le **QUOI** (le contrat : tokens + manifeste = autorité). Les `sc-<langage>` font le **COMMENT** (linter réel idiomatique + wiring natif + rendu). Ce contrat est l'interface qui les découple : `enforce` et `diffuse` n'ont pas besoin de connaître l'outillage de lint natif d'un langage ; `sc-<langage>:design-bridge` n'a pas besoin de savoir comment le manifeste a été produit.

---

## Spec d'enforcement (enforce → design-bridge)

`skills/enforce/actions/04-pivot.md` émet ce spec en contexte (pas dans un fichier) quand un `sc-<langage>` est détecté.

```
## Design enforcement spec

Source: design/tokens.json + design/components.json + design/policies.json
Version: <release.json § designSystem.version>
Themes: [liste plate des thèmes nommés déclarés sous `tokens.json` § `themes`, ex. default, dark, grimoire — vide si aucun `themes` overlay]
Mode: <bem | utility-first> (design/policies.json § mode — toujours déclaré, jamais déduit)

### Valid class sets (mode bem)
Base classes: [liste des .base]
All valid classes: [union de tous .base + .elements.* + .modifiers.*]

### Token paths
All token paths: [liste des chemins de tokens.json aplatis]

### Token scales
Canonical values: [map plate `<token.path>: <valeur résolue>` pour chaque feuille de tokens.json]
Theme overlays: [map `<theme>: { <token.path>: <valeur résolue dans ce thème> }`, vide sans thème]

### a11y requirements
[Par composant avec .a11y.requires non vide]
- <component>: role=<role>, requires=[<attr>, ...]

### Token-usage rules (mode utility-first — design/policies.json § usage)
Raw hex forbidden: <true|false> (usage.rawHexForbidden)
Colour utility prefixes: [usage.colorUtilityPrefixes, ex. bg, text, border, ring]
Allowed colour namespaces: [clés top-level de tokens.json § color.*, ex. brand, neutral, semantic]
Declared rules:
[Par entrée de usage.rules[] dont l'enforcement désigne ce réceptacle]
- <rule.id> (enforcement: <type du registre>): <rule.description>

### Enforcement target
Language: <langage du réceptacle>
Targets: [globs de fichiers à linter — en mode utility-first, couvrir tous les fichiers de composants, pas seulement le markup statique]

### Report path
<chemin du fichier de rapport attendu — doit figurer dans gates.config.json § pivotReports>

### Request
Réalise un linter natif idiomatique pour <langage> qui vérifie, selon Mode :
1. (bem) Toute classe appartenant au design system utilise un nom déclaré dans valid class sets.
2. Les références de tokens CSS (var(--...)) pointent vers un path existant.
2-bis. Quand la plateforme expose une valeur brute gouvernée (preset CMS, configuration native,
attribut sérialisé), cette valeur appartient à la **Token scale** correspondante. Comparer la valeur
canonique résolue, pas l'alias `{path}` ni une chaîne normalisée au hasard du réceptacle.
3. (bem) Les composants déclarant .a11y.requires portent les attributs requis.
4. Si Themes n'est pas vide, le linter natif reste theme-agnostique (§ A2 : les thèmes re-déclarent les mêmes noms de `--var` dans leur bloc de sélecteur — aucune règle par thème à générer côté vocabulaire).
5. (utility-first) Toute couleur hexadécimale brute est interdite si Raw hex forbidden = true (le baseline le vérifie déjà dans style="…"/<style> — le pivot peut étendre à d'autres contextes CSS-in-JS idiomatiques au langage, ex. styles co-localisés dans le composant, template literals `css\`...\``).
6. (utility-first) Toute classe utilitaire de couleur (préfixe ∈ Colour utility prefixes) résout son namespace dans Allowed colour namespaces.
7. Pour chaque règle de Declared rules, réalise-la nativement à partir de la preuve que son type d'enforcement nomme (`references/enforcement-registry.md`) — c'est ce que le cœur portable, scanner de chaînes fichier par fichier, ne peut pas couvrir sans faux positif. Ne réinvente pas la règle : reprends l'id et la description tels quels.
8. Écris le rapport à Report path, au format `references/gate-config-schema.md § Rapport de pivot`. Toute règle de Declared rules que tu ne réalises pas y figure en `status: "unrealized"` — c'est une obligation, pas une option (§ Obligation de report).

Retourne : le linter installé dans le projet + les instructions de câblage dans l'outillage natif + le rapport écrit.
```

`Token paths` répond à « ce nom existe-t-il ? » ; `Token scales` répond à « cette valeur appartient-elle
à l'échelle ? ». Aucun réceptacle ne relit `tokens.json` en secret pour reconstruire le second champ :
l'émetteur aplatit les feuilles, résout les alias, et transporte la valeur canonique avec le path. Un
overlay de thème ne crée pas un nouveau path ; il remplace sa valeur dans la map du thème, séparée de la
base afin qu'un linter puisse choisir la surface réellement inspectée.

---

## Spec de rendu (diffuse → design-bridge)

`skills/diffuse/actions/03-pivot.md` émet ce spec quand un `sc-<langage>` est détecté. Une cible native
peut demander plusieurs langages : l'action émet alors **une instance complète de ce même spec par
réceptacle**. Il n'existe pas d'enveloppe composite distincte à interpréter.

```
## Design render spec

Source: design/tokens.json + design/components.json
Version: <release.json § designSystem.version>
Themes: [liste plate des thèmes nommés déclarés sous `tokens.json` § `themes`, ex. default, dark, grimoire — vide si aucun `themes` overlay]

### Component to render
Name: <canonical-name>
Base: <.base>
Elements: <map>
Modifiers: <map>
Backgrounds: <liste>
a11y: <.a11y>

### Variants to produce
[Liste des variantes demandées ou "toutes"]

### Render target
Language: <format de composant natif du réceptacle>
Output dir: <chemin souhaité dans le projet>

### Request
Produit le composant en code idiomatique <langage> :
- N'utilise que les classes et tokens du manifeste.
- Consomme design/adapters/tokens.css pour les valeurs.
- Satisfait les attributs .a11y.requires.
- Si Themes n'est pas vide, le composant natif doit rester compatible avec les blocs `.dark`/`[data-theme="…"]` émis par l'adaptateur (aucune valeur en dur qui court-circuiterait la cascade thème).
- Passe le gate enforce : `python design/lint/run-gates.py --config design/lint/gates.config.json` = exit 0.

Retourne : le ou les fichiers produits pour ce target + les instructions d'intégration dans le projet.
```

### Cardinalité du spec de rendu

- Cible mono-langage : exactement un spec, comportement historique inchangé.
- Cible native composite : un spec par réceptacle, avec `Language` et `Output dir` propres.
- Deux specs d'une même cible ne peuvent jamais revendiquer le même fichier de sortie.
- Le réceptacle de plateforme peut rendre un fichier compagnon indispensable à son markup (par exemple
  un adapter de sélecteurs FSE), à condition de le nommer dans son retour. Une feuille ainsi produite par
  la plateforme rejoint ensuite les `Enforcement target` du réceptacle CSS : producteur et contrôleur
  restent distincts.
- La livraison native n'est complète que lorsque chaque spec attendu a rendu ses fichiers et que le gate
  final passe. L'absence d'un seul réceptacle est déclarée ; la baseline de cet artefact n'est jamais
  présentée comme une intégration native complète.

---

## Obligation de report

Le réceptacle **écrit un rapport pour chaque règle qui lui a été assignée**, réalisée ou non. Format et statuts : `references/gate-config-schema.md § Rapport de pivot` — spécifiés là parce que c'est le fichier d'entrée du runner, et dupliqués nulle part.

Ce que l'obligation ferme : sans rapport, une règle assignée et une règle oubliée produisent la même trace — aucune. Le runner ne peut alors que la déclarer non réalisée « sans nouvelle de son réalisateur », ce qui est vrai des deux cas. Un `status: "unrealized"` nommé par son auteur les sépare : quelqu'un a lu la règle et dit ne pas la couvrir.

**Pourquoi l'obligation ne vaut que pour l'enforcement.** Le contrat demande un rapport au réceptacle d'enforcement et n'en demande aucun au réceptacle de rendu — la ligne *rapport* de la colonne rendu vaut `—` (§ *Ce que le réceptacle doit renvoyer*). Ce n'est pas une lacune : une règle non réalisée est **silencieuse**, un artefact non produit est **auto-évident**. Le fichier composant existe et passe le gate, ou il n'existe pas ; aucune trace n'a besoin d'être écrite pour que son absence se voie. L'obligation de report paie un silence — là où il n'y a pas de silence, elle n'a rien à payer.

### Les sept lignes du gate

Ordre du runner : les lignes de règle d'abord, dans l'ordre où le contrat les déclare, puis les `VIOLATION` en bloc.

| Situation | Ce que le réceptacle écrit | Ce que le rapport du gate affiche |
|---|---|---|
| règle réalisée, aucune violation | `status: "pass"` | `REALIZED <id> (<type>, <priority>) by <realizer>` |
| règle typée `unrealized` par le contrat, qu'un réceptacle a couverte quand même | `status: "pass"` | `REALIZED <id> (unrealized, <priority>) by <realizer> - the contract declares no realizer for it` |
| règle hors de portée du réceptacle | `status: "unrealized"` | `UNREALIZED <id> (<type>, <priority>) - <realizer> reports it unrealized` |
| règle typée `unrealized`, qu'aucun réceptacle n'a couverte | — | `UNREALIZED <id> (<priority>) - declared with no realizer` |
| réceptacle non lancé, ou rapport absent | — | `UNREALIZED <id> (<type>, <priority>) - no report from its realizer` |
| violation trouvée par le cœur portable (lint markup) | — | `VIOLATION <target>: <message>` — `<target>` est un **chemin de fichier**, exit 1 |
| règle réalisée, violations trouvées | `status: "fail"` + `violations[]` | `VIOLATION <realizer>: <message>` — exit 1 |

Trois lectures que la table impose et que sa version courte laissait passer :

- **`VIOLATION` ne préfixe pas toujours un réalisateur.** Deux producteurs impriment cette ligne, et le préfixe change de nature avec eux : chemin de fichier côté cœur portable, réalisateur côté rapport de pivot. Un lecteur de `VIOLATION src/Button.tsx: …` qui ignore cette dualité conclut à un réalisateur portant le nom d'un fichier du projet.
- **La quatrième ligne n'a pas de `(<type>)`**, contrairement à ses voisines. Le runner l'émet ainsi ; la table reproduit la sortie, elle ne la régularise pas.
- **Sur la deuxième ligne, `<type>` vaut toujours `unrealized`** — c'est la garde même qui la produit. Aucun `(markup)` ni `(stylesheet)` ne peut y apparaître.

Une règle typée `markup` sort `REALIZED <id> (markup, <priority>) by lint-core` : c'est la première ligne avec `<realizer>` = `lint-core`, une constante du runner et jamais un réceptacle qui rapporte — d'où le `—` qu'elle porterait en colonne *Ce que le réceptacle écrit*.

Un `unrealized` reste une preuve manquante : P0/P1 rougit le gate, P2 avertit sans le bloquer.

---

## Ce que le réceptacle doit renvoyer

`sc-<langage>:design-bridge` doit retourner :

| Pour enforcement | Pour rendu |
|-----------------|------------|
| Linter installé dans l'outillage natif du projet | Fichier(s) du target créé(s) à l'Output dir, tous nommés dans le retour |
| Instructions de câblage dans le workflow existant (pre-commit, CI) | Instructions d'intégration (import, registration, usage) |
| Confirmation que les règles dérivent du spec (pas de listes codées en dur) | Confirmation que le composant passe le gate (exit 0) |
| Le rapport écrit à Report path, couvrant **toutes** les règles assignées | — |

---

## Dégradation gracieuse

Si aucun `sc-<langage>` ne couvre le langage du projet :
- `enforce` reste sur la baseline `lint-core.mjs` et le signale clairement.
- `diffuse` reste sur le rendu HTML+CSS baseline et le signale clairement — ce rendu est une **preview non intégrée**, pas un artefact natif ; le hand-off de promotion vit dans `skills/diffuse/actions/02-render.md § Étape 5` (cf. `skills/diffuse/adapters/html-css.md § Statut de la sortie`).
- Aucune erreur bloquante — le contrat est toujours l'autorité, seule la réalisation idiomatique est absente.

---

## Workflow de plateforme (extension du contrat de pivot)

Un **workflow de plateforme** instancie une classe de cas agnostique (`design:detail`, `skills/detail/references/workflow-classes.md`) sur une plateforme concrète. C'est un artefact **du pivot**, jamais de `design` : le plugin fige sa forme et sa règle de résolution ; il n'en porte jamais le contenu (dec-002 — `design` garde le QUOI, le pivot garde le COMMENT, et un workflow est un COMMENT).

### Chemin canonique

```
plugins/sc-<langage>/skills/design-bridge/references/workflow-<plateforme>.md
```

Le suffixe nomme la **plateforme** que le pivot sert (`fse`, `spa`, `static`…), pas le langage — un même pivot peut en porter plusieurs.

### Cinq titres requis, dans cet ordre

```
## Case classes covered
## Prerequisites (capabilities)
## Phases
## Gates
## Out of scope
```

Ces cinq chaînes sont un **jeton d'interface** : `design:detail/02-route` les attend à l'identique pour lire le workflow d'un pivot. Le corps de chaque section est libre ; les titres ne le sont pas.

### Déclaration de phase

Sous `## Phases`, chaque phase déclare quatre champs :

- **input** — ce que la phase consomme ;
- **output** — ce qu'elle produit ;
- **verbe** — le verbe design qu'elle instancie (`define`, `destructure`, `adjust`, `enforce`, `diffuse`), ou **`off-funnel`** quand elle n'en instancie aucun ;
- **position** — où la phase s'insère dans la séquence de la classe. Trois formes, et seulement trois : `avant <verbe>`, `après <verbe>`, `fin`.

Une phase qui instancie un verbe prend la place de ce verbe : sa position est déterminée, le champ vaut `—`. Le champ est **requis pour toute phase `off-funnel`**, dont rien d'autre ne dit où elle tombe.

Une position se lit **contre la séquence de la classe résolue**, pas contre la liste des cinq verbes. Toute classe n'appelle pas tous les verbes : quand le verbe ancre est absent de la séquence, la phase est **omise, et l'omission est énoncée** — jamais rapprochée du verbe le plus proche.

Sans ce champ, la fusion des deux listes — la séquence de verbes de la classe et la table `## Phases` du pivot — est interprétée, pas dérivée : deux lecteurs produisent deux ordres différents, tous deux défendables, et la contrainte réelle reste en prose dans une référence du pivot que le consommateur du contrat n'ouvre pas.

### Règle des capabilities

Sous `## Prerequisites (capabilities)`, un prérequis s'écrit comme une **capability** — runtime conteneurisé, accès shell distant, base de données distante, hébergement statique — **jamais** comme un fournisseur, un hébergeur ou un nom de projet. La plateforme est nommée ; le vendor ne l'est pas.

### Règle d'instanciation des gates

Sous `## Gates`, un workflow **instancie** les gates que le contrat connaît déjà (vocabulaire, fidélité, seuil de maturité) : il en nomme le point d'application dans sa séquence. Il n'en **redéfinit aucun** et n'en **introduit aucun** que le contrat ignore. Un gate créé hors du contrat ferait croire à une conformité locale qui n'en est pas une.

### Règle de résolution (par `02-route`)

| État du terrain | Ce que `route` émet |
|---|---|
| pivot installé **et** stack correspondante | la classe agnostique **étendue** par le workflow de plateforme |
| pivot absent | la classe agnostique **seule**, l'absence énoncée explicitement + recommandation conditionnelle d'installer `sc-<langage>` |
| pivot installé mais stack non correspondante | la classe agnostique **seule**, la non-correspondance énoncée (le workflow présent ne couvre pas cette plateforme) |

---

## Stack mapping

Le réceptacle se déduit du **langage de la preuve** que la règle doit lire, pas de la plateforme du projet. Le langage des feuilles de style et celui du runtime peuvent différer, et désignent alors deux réceptacles distincts pour un même projet (`references/enforcement-registry.md`).

| Langage de la preuve | sc-* à appeler |
|----------------------|---------------|
| Feuilles de style | `sc-css:design-bridge` |
| JavaScript / TypeScript | `sc-js:design-bridge` |
| PHP | `sc-php:design-bridge` |
| Python | `sc-python:design-bridge` (non encore implémenté) |
| Rust | `sc-rust:design-bridge` (non encore implémenté) |
| Aucun réceptacle installé | Cœur portable seul + règles assignées listées non réalisées |
