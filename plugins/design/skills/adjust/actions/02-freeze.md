# Freeze

## Rôle

Figer le contrat. Prend le brief d'arbitrage produit par `01-arbitrate` et :
1. Canonise `design/tokens.json` (déduplique, vérifie les groupes requis).
2. Écrit les artefacts dérivés — `components.json`, `policies.json`, et `oracle.json` quand la référence est mesurable — conformes à `${DESIGN_PLUGIN_ROOT}/references/contract-schema.md`, puis prouve le gate de fidélité côté maquette.
3. Marque `design/design-system.md` comme figé et bumpe la version.
4. Écrit la racine `design/release.json` : versions par artefact, empreintes, provenance, statut.

Un contrat encore en 1.x se migre d'abord par `03-migrate` — le figeage ne convertit pas au passage.

**Prérequis** : le brief d'arbitrage doit être complet (aucun cas non tranché). Si ce n'est pas le cas, interrompre et renvoyer à `01-arbitrate`.

## Étape 1 — Canoniser `design/tokens.json`

À partir des tokens résolus dans le brief d'arbitrage :

### 1a. Vérifier les groupes requis

Auditer `tokens.json` contre les groupes requis de `${DESIGN_PLUGIN_ROOT}/references/token-schema.md` :
- Groupes présents → OK
- Groupes manquants → les créer avec les valeurs retenues dans le brief
- Groupes partiels → les compléter

### 1b. Dédupliquer

Identifier les tokens avec des valeurs identiques sur des chemins différents. Règle : conserver le chemin sémantique (`color.semantic.*`) et créer un alias `{color.semantic.*}` sur le chemin redondant. Documenter chaque déduplication dans les commentaires de Provenance.

### 1c. Vérifier les alias

Tous les `{token.path}` dans `$value` doivent pointer vers un chemin existant dans le même fichier. Aucun alias circulaire.

### 1d. Auditer les overlays de thème (si `themes` est présent)

Pour chaque thème sous `themes.<nom>` (§ Modes / themes de `${DESIGN_PLUGIN_ROOT}/references/token-schema.md`) et chaque chemin qu'il re-déclare :
- Vérifier que le chemin existe dans l'arbre de base (hors `themes`) de `tokens.json`. Un chemin d'overlay absent de l'arbre de base est une **erreur bloquante** (jamais un warning) — corriger le chemin, ou l'ajouter d'abord à l'arbre de base s'il doit exister pour tous les thèmes.
- Vérifier qu'une entrée d'overlay ne porte que `$value` (jamais `$type` — le type est toujours hérité du chemin de base). Une entrée avec `$type` est non conforme au schéma.
- `default` n'est jamais une entrée de `themes` — c'est l'arbre de base lui-même ; signaler toute clé `themes.default` comme erreur.

### 1e. Écrire le fichier

Réécrire `design/tokens.json` avec les tokens canonisés. Conserver le format W3C DTCG (chaque token = `{ "$type": "...", "$value": "..." }`).

## Étape 2 — Écrire les artefacts dérivés

Construire les artefacts à partir des composants résolus dans le brief d'arbitrage, en suivant `${DESIGN_PLUGIN_ROOT}/references/contract-schema.md`. Chaque donnée vit dans un seul artefact ; ne rien dupliquer d'un fichier à l'autre.

### Structure minimale requise

`design/components.json` — anatomie seule, `.states` compris. Schéma, champs et exemples : `${DESIGN_PLUGIN_ROOT}/skills/adjust/references/manifest-schema.md`, seul exemplaire.

`design/policies.json` — ce qui est transverse au contrat :

```json
{
  "$schema": "design/references/contract-schema#policies",
  "mode": "bem",
  "$utilityPrefixes": [],
  "usage": { },
  "adapters": [{ "artifact": "adapters/<fichier>", "consumer": "<rôle du consommateur>" }]
}
```

`design/oracle.json` — cibles de mesure et gate de fidélité figé par page, écrit quand la référence est mesurable (§ Prouver le gate de fidélité) — seul exemplaire du schéma ; ses champs sont décrits dans `${DESIGN_PLUGIN_ROOT}/references/contract-schema.md § oracle.json` :

```json
{
  "$schema": "design/references/contract-schema#oracle",
  "components": {
    "<canonical-name>": {
      "props": ["display", "gridTemplateColumns", "gap"],
      "elements": {
        "<element-label>": { "check_text": true, "props": ["fontSize", "color"] }
      },
      "collections": [
        { "name": "<label>", "item_selector": "<BEM-element>", "ack": { "id": "DEV-xxx", "reason": "<prose>" } }
      ]
    }
  },
  "pages": {
    "<page-key>": {
      "components": {
        "<canonical-name>": {
          "root": "<mockup selector>",
          "elements": {
            "<element-label>": "<mockup selector>",
            "<other-label>": { "skip": "<raison>" }
          },
          "collections": { "<collection-name>": "<mockup item selector>" }
        }
      }
    }
  }
}
```

`$version` ne figure dans aucun des trois : les versions sont déclarées une seule fois, dans `release.json` (§ Écrire la racine `design/release.json`, dernière écriture de cette étape).

### Règles d'écriture

1. **Noms canoniques en kebab-case** : `btn`, `card`, `hero`, `nav`, `form-field`, etc.
2. **BEM strict** : `base` = le block ; `elements.*` = `block__element` ; `modifiers.*` = `block--modifier`.
3. **Fonds et avant-plans token-référencés** : chaque chemin dans `.backgrounds` et `.foregrounds` doit exister dans le `tokens.json` canonisé. Si un chemin est absent → erreur bloquante, corriger `tokens.json` d'abord.
3-bis. **Chaque composant qui porte du texte déclare ses `.foregrounds`** — les chemins réellement posés sur ses fonds, pris où ils vivent : `color.brand.*` et `color.domain.*` sont aussi légitimes que `color.semantic.text`. C'est la seule déclaration d'**usage** du contrat, et elle commande tout le contrôle de contraste. Un composant purement structurel (`grid`, `spacer`) l'omet ; un composant qui affiche du texte et l'omet rend sa couleur de texte intestable. Deux sources fournissent ces appariements, et aucune ne se réinvente ici : `design-system.md § Inventaire des composants` porte les colonnes fonds/avant-plans renseignées par `define` (`${DESIGN_PLUGIN_ROOT}/references/write-system-procedure.md`) — c'est la source normale, présente sur tout contrat ; et si un rapport `design/critique/` existe, il porte la table des appariements proposés après mesure (`destructure/01-challenge.md § étape 2-bis`), qui prime en cas de divergence puisqu'elle a été chiffrée. Si les deux sont muettes sur un composant qui affiche du texte, c'est une question à poser, pas un blanc à combler : deviner un appariement produirait une mesure sur une paire que personne n'emploie.
4. **Concordance avec la charte** : chaque composant listé dans `design-system.md § Inventaire des composants` doit avoir une entrée, et vice-versa. Si discordance → résoudre (ajouter l'entrée manquante ou retirer le composant de la charte).

### Sous-étape — Auditer `policies.json`

`mode` est **toujours** écrit, dans les deux modes : plus aucun outil ne le déduit, et un `mode` absent fait sortir `lint-core.mjs` en 2. Les champs suivants concernent le mode utility-first (ou un `components` partiel, cf. `${DESIGN_PLUGIN_ROOT}/references/contract-schema.md § Où porte le vocabulaire, selon mode`) :
- **`usage.rawHexForbidden`** : `true` sauf raison documentée de l'omettre.
- **`usage.colorUtilityPrefixes`** : la liste des préfixes de classe utilitaire porteurs de couleur réellement utilisés par le projet — ne pas copier un préfixe qu'aucun fichier du projet n'emploie.
- **`usage.rules[]`** : toute règle identifiée pendant `destructure` qu'un scanner de chaînes ne peut pas vérifier — au minimum `state-colour-icon` (`enforcement: "source-graph"`) si le design system a une notion de statut visuel. Chaque règle porte un `enforcement` du registre (`${DESIGN_PLUGIN_ROOT}/references/enforcement-registry.md`) : absent ou hors registre, le contrat est inutilisable. Aucun réalisateur pour la règle ⇒ `unrealized`, déclarée et rapportée plutôt que sous-entendue.
- **`adapters[]`** : la liste d'émission lue par `tools/generate.py` — une entrée par artefact dérivé attendu, nommant le **rôle** qui le consomme, jamais une plateforme ni un projet. Sans `consumer`, l'entrée n'est pas émise ; un rôle inconnu se complète à la main, il ne se devine pas.
- **Cohérence avec les tokens** : les namespaces de couleur autorisés dérivent des clés top-level de `tokens.json § color.*` — vérifier qu'aucun groupe de couleur nécessaire au projet n'est manquant de l'arbre de tokens avant de figer (sinon le namespace ne sera jamais reconnu par `lint-core.mjs`).
- Si le projet garde des composants BEM legacy à côté de l'utilitaire (transition), `components` peut rester partiel — c'est additif, pas une erreur (A5).

### Bump de version avec le bloc `usage`

Ajouter/étendre `usage` (nouveau namespace, nouvelle règle déclarée) suit la même table de bump que l'ajout de composant : **minor**. Une suppression de règle ou de namespace autorisé : **major** (rétrécit le vocabulaire accepté, peut casser du code existant qui en dépendait).

### En mode re-figeage (contrat existant)

- Conserver les entrées non touchées telles quelles.
- Appliquer les modifications du brief (delta uniquement).
- Suppressions : retirer l'entrée ET noter dans Provenance.

### Déterminer le type de bump version

| Changement | Bump |
|------------|------|
| Ajout de composant, d'élément, de variante, de fond | **minor** |
| Ajout d'un thème (`themes.<nom>`) ou d'un token surchargé dans un thème existant | **minor** |
| Ajout/extension du bloc `usage` (namespace de couleur, règle déclarée) | **minor** |
| Renommage de `base`, suppression d'entrée ou de variante | **major** |
| Suppression d'un thème ou d'un chemin d'overlay | **major** |
| Suppression d'un namespace de couleur ou d'une règle `usage` | **major** |
| Premier figeage (contrat inexistant) | **1.0.0** |

### Sous-étape — Calculer les contrôles a11y, enregistrer `checks` et `gaps`

Deux volets a11y sont **calculés par le plugin au figeage** (`${DESIGN_PLUGIN_ROOT}/references/enforcement-registry.md § Contrôles a11y`), déterministes, sans aucun markup. Le figeage ne bloque **jamais** sur un point a11y non vert : il l'enregistre comme `gap` et laisse `status.py` plafonner la maturité. Ce qui n'est pas atteint est constaté, pas caché — et jamais transformé en refus de figer.

Une seule exception, et elle ne porte pas sur un résultat : **un contrôle qui n'a rien eu à regarder n'est pas un contrôle non vert, c'est un contrôle impossible**. Un contrat sur lequel aucune paire de contraste ne peut être construite ne produit pas un écart mesuré à plafonner, il produit un vocabulaire hors de portée du contrôle — un défaut de conception, corrigeable tant que la matière est malléable et coûtant un bump majeur une fois figée. Celui-là refuse le figeage (`manifest-schema.md § Invariant 7`).

1. **Contraste par thème** — lancer
   ```
   python ${DESIGN_PLUGIN_ROOT}/adapters/a11y/contrast.py --contract design/ --json
   ```
   Les paires viennent de `components.json § .foregrounds × .backgrounds`, par composant, et à défaut d'une heuristique de nom bornée à `color.semantic`. Traiter la sortie par code :

   | Exit | Signification | Conduite |
   |---|---|---|
   | `0` | au moins une paire comparée | écrire `checks.contrast`, ouvrir un gap par paire échouée, poursuivre |
   | `2` | contrat structurellement invalide (tokens illisibles, chemin pendant) | corriger, ne pas poursuivre |
   | `3` | **aucune paire à comparer** | **refuser le figeage** — voir ci-dessous |

   Sur exit 0, écrire `release.json § checks.contrast = { "ran": true, "allPass": <toutes les paires passent>, "pairs": <nombre de paires comparées>, "declared": <nombre issu de .foregrounds> }`. Pour **chaque paire qui échoue**, ajouter un gap `{ "class": "contrast", "caps": "validated", "detail": "<fg> / <bg> @ <thème> = <ratio>" }`. Ne jamais écrire `allPass: true` sans `pairs`: sur zéro paire il serait vrai par vacuité, et c'est précisément la confusion que l'exit 3 existe pour rendre impossible.

   Sur exit 3, **ne rien écrire et ne pas figer**. Rapporter le bloc `coverage` du JSON tel quel — combien de feuilles couleur le contrat déclare, combien ont été appariées, et le décompte des non appariées par branche — puis nommer la sortie : **déclarer les paires dans `components.json § .foregrounds`**, composant par composant, en pointant les chemins réellement utilisés, `color.brand.*` et `color.domain.*` compris. Ne jamais proposer de renommer des tokens pour satisfaire l'heuristique de nom : ce serait déformer le vocabulaire du projet pour plaire à un mécanisme de secours.

   Une dérogation reste possible, jamais implicite, et elle coûte **trois** écritures conjointes : `--allow-unpaired` sur la commande ; une entrée dans `deviations.json § active[]` portant le motif et l'étendue ; et un gap `{ "class": "contrast-unpaired", "caps": "normalized", "detail": "<n> feuilles couleur déclarées, 0 appariée — <motif>" }`. Sans les trois, le refus tient. Le `checks.contrast` alors écrit porte `"pairs": 0` : `allPass` y serait vrai sans rien affirmer, et `status.py` le lit avec le compte précisément pour cette raison (`${DESIGN_PLUGIN_ROOT}/references/maturity-status.md`). Une dérogation ne fait donc pas monter le contrat — elle l'autorise à exister à `normalized` en disant pourquoi.

2. **Présence déclarative des états** — lancer
   ```
   python ${DESIGN_PLUGIN_ROOT}/tools/status.py --contract design/ --states
   ```
   Écrire `release.json § checks.states = { "ran": true, "allPass": <aucune déclaration partielle> }`. Pour **chaque composant dont la déclaration `.states` est partielle** (une clé manquante), ajouter un gap `{ "class": "states", "caps": "validated", "detail": "<composant>: clés manquantes" }`.

Si un volet ne peut pas être calculé — pas de tokens couleur résolubles, ou choix explicite de ne pas le lancer — laisser `checks` sans ce volet (ou `checks: null` si aucun n'a tourné) et enregistrer le gap de classe correspondante (`contrast` ⇒ plafond `validated`) : un contrôle non lancé plafonne la maturité, il ne fait pas échouer le figeage. La table gap→plafond fait foi : `${DESIGN_PLUGIN_ROOT}/references/maturity-status.md`.

Une charte absente est elle-même un gap `charter-absent` (plafond `extracted`), enregistré ici avec `charter.present: false`.

### Sous-étape — Écrire `oracle.json § pages` (référence mesurable)

**Portée.** La référence est mesurable quand c'est une maquette servie avec un DOM (harness `setPage`, jeu d'URLs). Brief seul ou maquette-image seule : sous-étape et § Prouver le gate de fidélité **sans objet** — ni `--check` ni mesure, `release.json` ne déclare aucun gate de fidélité, et la sortie le dit.

**Source.** La table de correspondance signée par `define` (checkpoint P2), section *Carte des éléments*, et l'URL de maquette de son en-tête. Référence mesurable sans carte signée : refus de figer, renvoi à `define`.

1. **Rapprocher** chaque entrée de la carte du nom canonique de `components.json` et du libellé d'élément final (un composant renommé ou re-découpé par `destructure` se rattache, il ne bloque pas). Entrée orpheline — composant supprimé ou fusionné sans cible — listée dans la sortie, jamais écrite.
2. **Couvrir** chaque élément canonique de chaque composant placé sur une page. Élément sans sélecteur dans la carte :
   - proposer un sélecteur maquette, le prouver en Mode A (`measure.py --mode A --side mockup` sur une config réduite à cette cible : l'élément est trouvé, pas `missing`), et le soumettre à l'utilisateur avec les autres décisions de gel ;
   - refusé ou non prouvable : `{ "skip": "<raison>" }`.
   Aucun sélecteur hors carte n'entre dans `oracle.json` sans preuve Mode A et confirmation de l'utilisateur.
3. **Écrire** `oracle.json § pages` (forme : § Structure minimale requise) et le déclarer dans `release.json § artifacts`. Un composant de `components.json` placé sur aucune page n'est pas écrit : il est listé `UNPLACED` dans la sortie, non bloquant.

### Écrire la racine `design/release.json`

Dernière écriture de l'Étape 2 : sans elle il n'y a pas de contrat lisible, et l'Étape 2bis ne peut pas s'exécuter. Champs et sémantique : `${DESIGN_PLUGIN_ROOT}/references/contract-schema.md § release.json`.

- `artifacts.<nom>.version` — la version de chaque artefact, indépendante des autres. Un artefact non touché par ce figeage garde la sienne.
- `artifacts.<nom>.sourceHash` — empreinte de la source dont l'artefact dérive, recalculée à chaque écriture.
- `charter` — présence, chemin et version de `design-system.md`, relevés, jamais supposés.
- `provenance` — quoi a écrit, quand, à partir de quoi.
- `checks` — le résultat des deux contrôles a11y de la sous-étape précédente (`contrast`, `states`), ou `null` si aucun n'a tourné. Lu par `status.py` pour franchir le 3ᵉ échelon.
- `gaps` — la liste des écarts connus, chacun avec `class` / `caps` / `detail`. Chaque gap plafonne la maturité au lieu d'être noté en prose. La table des classes : `${DESIGN_PLUGIN_ROOT}/references/maturity-status.md`.
- `status` — la valeur rendue par `${DESIGN_PLUGIN_ROOT}/tools/status.py --contract design/`. Ne jamais l'écrire à la main : le statut a une seule implémentation, qui lit `charter`, `checks` et `gaps` ci-dessus.

### Générer les artefacts dérivés

Après `release.json` — le générateur le lit et y écrit l'enregistrement de dérive :

```
python ${DESIGN_PLUGIN_ROOT}/tools/generate.py --contract design/
```

Un artefact dérivé n'est jamais écrit à la main, ici ni ailleurs. La commande émet une entrée par `policies.json § adapters[]` déclarant un `consumer`, et grave dans `release.json § generated` l'empreinte de chaque source lue — le repère que `--check` opposera aux sources. Sans figeage, une source périmée est invisible.

Exit 2 ⇒ contrat structurellement invalide : corriger l'artefact nommé, ne pas poursuivre le figeage.

### Prouver le gate de fidélité

Sans objet si la référence n'est pas mesurable (§ Écrire `oracle.json § pages`) : le dire, ne rien lancer. Sinon, avec `<maquette>` = l'URL de l'en-tête de la table signée :

1. Complétude statique :
   ```
   python ${DESIGN_PLUGIN_ROOT}/adapters/measure/config-gen.py --components design/components.json --tokens design/tokens.json --oracle design/oracle.json --check
   ```
   Exit 1 ⇒ refus de figer : rapporter les lignes `DEFECT` telles quelles, corriger `oracle.json` et recommencer. Exit 2 ⇒ entrée invalide. Les lignes `SKIP` et `UNPLACED` sont rapportées, non bloquantes.
2. Clés de page, une fois, quand la maquette est un fichier harness local :
   ```
   node ${DESIGN_PLUGIN_ROOT}/tools/harness-runtime-check.mjs <fichier maquette> --expect-pages <clé1,clé2,…>
   ```
   Exit ≠ 0 ⇒ refus de figer. Maquette servie par URL : une clé inconnue se révèle par des cibles `missing` au pas 3.
3. Résolution côté maquette, pour chaque clé de `pages` :
   ```
   python ${DESIGN_PLUGIN_ROOT}/adapters/measure/config-gen.py --components design/components.json --tokens design/tokens.json --oracle design/oracle.json --page <clé> --reference-url <maquette> --out <tmp>/<clé>.config.json
   python ${DESIGN_PLUGIN_ROOT}/adapters/measure/measure.py --config <tmp>/<clé>.config.json --mode A --side mockup --ledger-registry design/deviations.json --out <tmp>/<clé>.report.json
   ```
   Sans `--implementation-url` : seule la maquette est mesurée, et le registre n'est pas lu en Mode A. Toute ligne `missing` ⇒ refus de figer : le sélecteur figé ne résout pas, corriger `oracle.json` (ou `skip` motivé) et reprendre au pas 1.

**Interdiction de figer** : ne pas passer à l'Étape 2bis ni à l'Étape 3 tant que `--check` ≠ 0, qu'une clé de page manque au harness ou qu'une cible maquette est `missing`.

## Étape 2bis — Réconciliation avec le code réel (retrofit)

> Nouvelle étape top-level, distincte de la sous-étape "Auditer `policies.json`" ci-dessus (qui, elle, reste une sous-partie de l'Étape 2). Cette étape-ci s'exécute une fois les artefacts et `release.json` écrits, et **avant** de figer (Étape 3).

Un manifeste peut être parfaitement cohérent avec la prose de `design-system.md` (concordance artefacts ↔ charte, § Étape 2 Règle 4) tout en divergeant du code **déjà écrit** du projet consommateur — le cas **retrofit** : un projet qui a du markup/composants avant même que le contrat ne soit figé. Sans cette étape, cette dérive n'est repérée que bien plus tard, à `enforce/03-lint-instances`, une fois le contrat déjà figé et du travail déjà construit dessus. Réconcilier maintenant, pas après.

### Portée du scan (mode-aware)

Jamais de glob ou de jeu de règles codé en dur : les deux se dérivent du champ `mode` de `policies.json` tout juste écrit à l'Étape 2.

| Mode | Glob scanné | Règle de réconciliation |
|------|-------------|--------------------------|
| `bem` | `**/*.{html,vue,jsx,tsx}` du projet consommateur | attributs `class`/`className` du code réel vs vocabulaire `components.*.base` / `.elements` / `.modifiers` du manifeste |
| `utility-first` | `**/*.{html,vue,jsx,tsx}` du projet consommateur | utilitaires couleur (`bg-…`, `text-…`, …) et hex bruts du code réel vs les namespaces déclarés sous `usage.colorUtilityPrefixes` / `usage.rawHexForbidden` |

### Oracle de scan : `lint-core.mjs`, réutilisé tel quel

Aucun nouveau scanner n'est écrit : `enforce/adapters/lint-core.mjs` est invoqué comme oracle, une fois par fichier du glob résolu ci-dessus, contre le contrat tout juste écrit :

```
node lint-core.mjs <fichier-du-glob> --contract <dossier-du-contrat-tout-juste-figé>
```

Rule 1 (`class-vocab`, mode `bem`) et Rule 4 (`allowed colour namespaces`, mode `utility-first`) portent déjà exactement la direction **code → manifeste** ci-dessous : un `ERROR` remonté par `lint-core.mjs` sur un fichier du glob EST la divergence à traiter ici. Pour la direction **manifeste → code**, invoquer le mode additif `--report-unused` (voir `enforce/adapters/lint-core.mjs`) sur chaque fichier du glob ; une entrée n'est réellement "inutilisée dans le projet" que si **tous** les fichiers scannés la rapportent `UNUSED` — un seul fichier ne prouve que son absence locale.

### Deux directions de divergence, deux politiques

- **code → manifeste** (une classe/utility présente dans le code réel est **absente** du manifeste tout juste figé) : **bloquant**. Le figeage est **invalide** tant qu'au moins une telle divergence subsiste sur le glob scanné. Corriger avant de continuer — ajouter l'entrée manquante au manifeste si elle est légitime, ou corriger le code — jamais les deux à la fois de façon silencieuse.
- **manifeste → code** (un composant/élément/modificateur/namespace déclaré dans le manifeste n'apparaît **jamais** dans le code scanné) : **warning + entrée de ledger optionnelle** (`DEV-NNN`), **jamais bloquante** — un composant peut légitimement être déclaré en avance de son premier usage.
- Dans les deux directions : **aucune mutation automatique et silencieuse du manifeste**. Toute correction (ajout d'entrée, retrait de classe côté code, entrée de ledger) est un choix explicite pris avant de poursuivre le figeage.

### Comportement always-on / neutre en greenfield

Cette étape s'exécute **toujours** — jamais derrière un flag `retrofit` à retenir ou à oublier. Sur un projet greenfield (aucun code préexistant, glob vide ou fichiers sans classes/utilitaires du design system), le scan ne remonte aucune correspondance : zéro divergence des deux côtés, la réconciliation est un no-op, et le figeage procède normalement à l'Étape 3. Ce n'est pas un cas particulier à coder à part — c'est la conséquence naturelle d'un scan qui ne trouve rien à comparer.

### Interdiction de figer

Ne pas passer à l'Étape 3 (marquer `design-system.md` comme figé) tant qu'une divergence **code → manifeste** est ouverte sur le glob scanné. Les divergences **manifeste → code** n'empêchent jamais le figeage — les documenter (ledger ou simple mention en Provenance) suffit pour continuer.

## Étape 3 — Marquer `design-system.md` comme figé

Modifier l'en-tête de `design/design-system.md` :

```markdown
---
status: figé
version: <semver de la charte>
---
```

Mettre à jour la section **Provenance** avec :
- Date du figeage
- Version bumped (et raison si major)
- Liste des décisions d'arbitrage clés (extrait du brief)

Si `design-system.md` contient encore des "Open questions" qui n'ont pas été résolues, les conserver mais les marquer `[non résolu au figeage — à traiter]`.

## Étape 4 — Reporter la version de la charte dans `release.json`

Relever la version de `design-system.md` et l'écrire dans `release.json § charter.version`, puis recalculer le statut (`tools/status.py`) — la charte vient de passer à `figé`.

Il n'y a **plus d'invariant de parité** : la version de la charte n'a pas à égaler celle des artefacts. `release.json` déclare les deux ; un écart est une donnée constatée, pas une violation.

## Sortie attendue

Annoncer à l'utilisateur :

> Contrat figé v{version}.
>
> - `design/tokens.json` — {N} tokens canoniques, {X} alias créés, {Y} groupes complétés
> - `design/components.json` — {M} composants ({P} ajouts, {Q} modifications, {R} suppressions)
> - `design/policies.json` — mode {mode}, {A} adapters
> - `design/oracle.json` — {Pg} pages, {T} cibles, {S} exclusions (`skip`), {Pr} sélecteurs proposés par `adjust` et confirmés ; orphelins : {liste} ; composants présents sur aucune page (`UNPLACED`) : {liste} *(référence non mesurable : « gate de fidélité sans objet — brief seul | maquette-image »)*
> - `design/release.json` — statut {statut}, charte v{version charte}
> - `design/design-system.md` — status: figé, version bumped {ancien} → {nouveau}
>
> Prochaine étape : invoquer `design:enforce` pour installer le linter et câbler les gates.

## Test de validité

Avant d'annoncer la complétion, vérifier mentalement :

- [ ] `release.json` existe, `$format` vaut `2.0`, et déclare `tokens.json`, `components.json` et `policies.json`, plus `oracle.json` si la référence est mesurable ; chaque artefact déclaré est présent sur disque, aucun artefact non déclaré ne traîne à côté
- [ ] `release.json § status` provient de `tools/status.py`, jamais écrit à la main
- [ ] `contrast.py` n'a pas rendu exit 3 — ou une dérogation est enregistrée dans `deviations.json § active[]` et `--allow-unpaired` a été passé explicitement. Un contrat sans paire comparable ne se fige pas en silence
- [ ] `release.json § checks` porte le résultat de `contrast.py` et de `status.py --states` (ou `null` si aucun contrôle n'a tourné) ; `checks.contrast` porte `pairs` à côté d'`allPass`, jamais `allPass` seul ; chaque paire de contraste échouée et chaque déclaration `.states` partielle a un `gap` correspondant, jamais une simple note en prose
- [ ] Aucun point a11y non vert n'a **bloqué** le figeage : les écarts sont enregistrés en `gaps[]` et plafonnent la maturité via `status.py`, conformément à `references/maturity-status.md`
- [ ] Aucun `$version` ne subsiste dans `components.json`, `policies.json` ou `oracle.json`
- [ ] Tous les chemins `.backgrounds` et `.foregrounds` existent dans `tokens.json`
- [ ] Chaque composant affichant du texte déclare ses `.foregrounds` ; aucun n'est laissé intestable par omission
- [ ] Tous les composants de l'inventaire prose ont une entrée dans `components.json`
- [ ] Aucun token en doublon (valeurs identiques sur chemins différents sans alias)
- [ ] Tous les chemins de `themes.*` (si présent) existent dans l'arbre de base ; aucune entrée d'overlay ne porte `$type` ; aucune clé `themes.default`
- [ ] `policies.json § mode` est écrit explicitement dans les deux modes ; chaque namespace visé par `usage.colorUtilityPrefixes` correspond à un groupe existant sous `tokens.json § color.*`
- [ ] `policies.json § adapters` déclare chaque artefact dérivé attendu, sans consommateur `unknown` restant
- [ ] `tools/generate.py --contract design/` a tourné après `release.json` ; `§ generated` porte une entrée par artefact émis, aucun dérivé écrit à la main
- [ ] Référence mesurable : `config-gen.py --check` a rendu exit 0, `harness-runtime-check.mjs --expect-pages` exit 0 si la maquette est un harness local, et aucune cible `missing` dans les rapports Mode A `--side mockup` de chaque page ; chaque sélecteur hors carte a sa preuve Mode A et la confirmation de l'utilisateur. Référence non mesurable : ni `--check` ni mesure, dit dans la sortie
- [ ] **Réconciliation Étape 2bis** : le scan mode-aware du code réel (via `lint-core.mjs`) ne remonte aucune divergence code→manifeste bloquante sur le glob concerné ; les divergences manifeste→code (le cas échéant) sont documentées en warning/ledger, jamais bloquantes ; comportement always-on confirmé (greenfield → scan vide → non-bloquant, rien à coder à part)
- [ ] `design-system.md status:` == `figé`
