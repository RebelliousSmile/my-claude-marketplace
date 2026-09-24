# Contract schema — cinq artefacts, une racine

Le contrat est un répertoire d'artefacts adressables et d'une **racine** qui les identifie. Trois artefacts sont requis (`tokens.json`, `components.json`, `policies.json`) ; `oracle.json` et `deviations.json` sont conditionnels — un contrat sans référence mesurable n'écrit pas le premier, un contrat sans écart toléré n'écrit pas le second.

| Fichier | Rôle | Écrit par | Lu par |
|---|---|---|---|
| `release.json` | Racine — identité, versions par artefact, hash de source, provenance, statut de maturité | `adjust/02-freeze.md`, `tools/migrate-contract.py` | `lint-core.mjs` (présence + les trois artefacts dont il dérive ses règles), `tools/status.py` |
| `tokens.json` | Valeurs (couleurs, espacements, typographie, breakpoints…) au format W3C DTCG | `adjust/02-freeze.md` | `lint-core.mjs` Règles 2/4, `config-gen.py`, générateurs d'adapters |
| `components.json` | Anatomie des composants — nomenclature déclarée, rien d'autre | `adjust/02-freeze.md` | `lint-core.mjs` Règles 1/5, `config-gen.py` |
| `policies.json` | Politiques transverses — mode, usage des tokens, préfixes utilitaires, table des adapters | `adjust/02-freeze.md` | `lint-core.mjs` Règles 1/3/4, pivots `sc-*` |
| `oracle.json` | Cibles de mesure — hints par composant, gate figé par page | `adjust/02-freeze.md` | `config-gen.py` |
| `deviations.json` | Écarts sanctionnés — la source structurée des tolérances de fidélité | `tools/migrate-contract.py --ledger`, main | `adapters/measure/measure.py`, `tools/generate.py` (vue Markdown) |

`design-system.md` (charte prose) n'est **pas** un artefact du contrat : c'est une **entrée** dont `release.json § charter` enregistre la présence et la version. Aucun outil ne la lit ; `status.py` observe seulement qu'elle existe ou non.

**Règle fondamentale : une donnée vit dans un seul artefact.** Une valeur vit dans `tokens.json`, une nomenclature dans `components.json`, une politique dans `policies.json`, un hint de mesure dans `oracle.json`, une version dans `release.json`. Aucun champ n'est dupliqué d'un artefact à l'autre.

**L'absence de `release.json` identifie un contrat 1.x.** `lint-core.mjs` sort alors en 3 et nomme la commande de migration. Aucun chemin de lecture 1.x ne subsiste.

## Étiquetage des champs

Chaque champ est **exécutable** — un consommateur nommé le lit et en tire un effet vérifiable — ou **informationnel** — il documente une intention qu'aucun outil ne vérifie. Un champ dont le seul consommateur est un lot à venir est informationnel à cette version, et le lot est nommé.

## `release.json`

```json
{
  "$schema": "design/references/contract-schema#release",
  "$format": "2.0",
  "designSystem": { "version": "1.2.0" },
  "artifacts": {
    "tokens.json":     { "version": "1.2.0", "sourceHash": "sha256:…" },
    "components.json": { "version": "1.2.0", "sourceHash": "sha256:…" },
    "policies.json":   { "version": "1.2.0", "sourceHash": "sha256:…" },
    "oracle.json":     { "version": "1.2.0", "sourceHash": "sha256:…" }
  },
  "charter": { "present": true, "path": "design-system.md", "version": "1.2.0" },
  "provenance": { "producedBy": "migrate-contract.py", "producedAt": "<ISO-8601>", "from": "contrat 1.x" },
  "checks": null,
  "status": "normalized"
}
```

| Champ | Requis | Statut · consommateur | Description |
|---|---|---|---|
| `$schema` | oui | informationnel | Toujours `"design/references/contract-schema#release"` |
| `$format` | oui | informationnel | Version du format de contrat. C'est la **présence du fichier**, pas sa valeur, qui distingue 2.x de 1.x |
| `designSystem.version` | oui | informationnel | Semver du design system pris comme un tout |
| `artifacts` | oui | exécutable · `lint-core.mjs` (doit déclarer `tokens.json`, `components.json` et `policies.json` ; chaque artefact déclaré doit exister et se parser ; sinon exit 2) | Clés = noms de fichier des artefacts. `oracle.json` et `deviations.json` ne sont déclarés que si le contrat en produit un |
| `artifacts.<file>.version` | oui | informationnel | Version **déclarée** de cet artefact. Des versions divergentes sont une donnée, pas une violation (§ Disparition de l'invariant 5) |
| `artifacts.<file>.sourceHash` | oui | informationnel | `sha256:<hex>` de la source dont l'artefact dérive. Sur un contrat migré, cette source est le manifeste 1.x : le champ documente une provenance, il ne mesure pas la fraîcheur d'un artefact généré (§ Enregistrement de dérive) |
| `generated` | non | exécutable · `tools/generate.py --check` | Enregistrement de dérive des artefacts générés. Absent = aucun artefact généré n'a été figé ; `--check` n'a alors rien à comparer et ne peut que régénérer (§ Enregistrement de dérive) |
| `charter.present` | oui | exécutable · `tools/status.py` | Charte prose présente ou absente dans le répertoire du contrat |
| `charter.path` | oui | exécutable · `tools/status.py` | Chemin relatif de la charte |
| `charter.version` | non | informationnel | Version déclarée par la charte ; `null` si absente ou non déclarée |
| `provenance.producedBy` | oui | informationnel | Outil ou action qui a écrit ce contrat |
| `provenance.producedAt` | oui | informationnel | Horodatage ISO-8601 |
| `provenance.from` | oui | informationnel | Origine — contrat 1.x migré, ou figeage direct |
| `checks` | oui | exécutable · `tools/status.py` | Enregistrement des vérifications passées. `null` = jamais jouées |
| `gaps` | non | exécutable · `tools/status.py` | Gaps connus qui plafonnent le statut (§ Statut de maturité). Absent = aucun gap enregistré |
| `status` | oui | exécutable · `tools/status.py` (écriture), `tools/run-gates.py` (lecture, opposable au seuil) | Statut de maturité, calculé par `tools/status.py` et par lui seul (§ Statut de maturité) |

### Enregistrement de dérive

`tools/generate.py --check` sanctionne deux dérives distinctes :

1. **Édition manuelle** — un artefact généré présent sur disque diffère d'une régénération fraîche. Aucun enregistrement n'est nécessaire : la comparaison suffit.
2. **Source périmée** — les sources JSON ont changé depuis la génération, sans régénération. Cette dérive n'est lisible que contre un repère écrit au moment de la génération, et figé par `adjust/02-freeze.md`.

Seule la dérive 2 a besoin d'un enregistrement. Sa forme est le champ `release.json § generated`.

```json
"generated": {
  "adapters/tokens.css": {
    "sources": {
      "tokens.json": "sha256:<hex>"
    }
  }
}
```

| Champ | Requis | Statut · consommateur | Description |
|---|---|---|---|
| `generated.<artifact>` | — | exécutable · `tools/generate.py --check` | Clé = chemin de l'artefact généré, relatif au répertoire du contrat. Identique à `policies.json § adapters[].artifact` |
| `generated.<artifact>.sources` | oui | exécutable · `tools/generate.py --check` | Un `sha256:<hex>` **par fichier source réellement lu** pour produire cet artefact. Clé = nom de fichier du source, relatif au répertoire du contrat |

Un hash par source, non un hash unique sur le jeu concaténé : un adapter peut lire plusieurs sources, et le message de dérive doit nommer celle qui a bougé, pas constater qu'une l'a fait. Le jeu de sources est propre à chaque artefact — la feuille de tokens ne lit que `tokens.json`, un adapter de plateforme peut lire `tokens.json` et `policies.json` — et l'enregistrement porte sur le jeu réellement lu, jamais sur le jeu que le générateur sait lire.

Ce champ ne recouvre pas `artifacts.<file>.sourceHash`. Les deux portent un `sha256:`, ils ne répondent pas à la même question : `artifacts` dit **d'où vient un artefact du contrat** (provenance, écrite une fois, historique), `generated` dit **avec quel état des sources un fichier produit a été écrit** (fraîcheur, réécrite à chaque génération, opposable).

Deux états ne sont pas une dérive et ne sortent pas en 1 : une clé `generated` absente — rien n'a jamais été figé, `--check` n'a pas de repère — et un artefact déclaré dans `policies.json § adapters[]` sans entrée `generated` correspondante, qui est un artefact jamais généré. En revanche une entrée `generated` dont l'artefact manque sur disque **est** une dérive : le fichier a été produit puis supprimé.

Aucun drapeau ne neutralise un échec de dérive. La réponse correcte est de changer la source puis de régénérer.

### Statut de maturité

Une échelle : la première condition non tenue arrête la montée. `tools/status.py` est la seule implémentation ; aucun autre code ne calcule un statut. Le modèle complet — ce que chaque barreau exige et autorise, le seuil de conformité, la manière dont un gap plafonne — vit dans `references/maturity-status.md`.

| Statut | Condition atteinte |
|---|---|
| `extracted` | Les artefacts requis existent et se parsent |
| `normalized` | + charte présente |
| `validated` | + vérifications enregistrées (`checks` non nul) |
| `production-ready` | + contraste vert sur chaque paire et états déclaratifs complets |

Charte absente ⇒ plafond à `extracted`, quelles que soient les vérifications : l'échelle plafonne, elle ne saute pas de barreau. Le champ est **opposable** : `run-gates.py` refuse d'affirmer la conformité sous le seuil `validated` et sort en 4 (`master § Exit-code space`).

Le contenu de `checks`, écrit par `adjust/02-freeze.md` et lu par `status.py`, enregistre le résultat des deux contrôles a11y calculables au figeage :

```json
"checks": {
  "contrast": { "ran": true, "allPass": false },
  "states":   { "ran": true, "allPass": true }
}
```

| Champ | Requis | Statut · consommateur | Description |
|---|---|---|---|
| `checks.contrast.ran` | oui si `checks` non nul | exécutable · `tools/status.py` | Le contraste (`adapters/a11y/contrast.py`) a été calculé |
| `checks.contrast.allPass` | oui si `ran` | exécutable · `tools/status.py` | Chaque paire de tokens passe le seuil AA, sur chaque thème |
| `checks.states.ran` | oui si `checks` non nul | exécutable · `tools/status.py` | La présence déclarative des états a été contrôlée |
| `checks.states.allPass` | oui si `ran` | exécutable · `tools/status.py` | Aucun composant ne porte de déclaration d'états partielle (§ `adjust/references/manifest-schema.md`) |

### Enregistrement des gaps

Un gap connu — une paire de contraste qui échoue, un état déclaratif manquant, une charte absente — est enregistré dans `release.json § gaps`, jamais laissé en prose. Il **plafonne** le statut au barreau qu'il nomme ; la table classe → plafond vit dans `references/maturity-status.md`.

```json
"gaps": [
  { "class": "contrast", "caps": "validated", "detail": "color.semantic.text sur color.semantic.surface, thème dark" }
]
```

| Champ | Requis | Statut · consommateur | Description |
|---|---|---|---|
| `gaps[].class` | oui | exécutable · `tools/status.py` | Classe du gap — une clé de la table de `maturity-status.md` |
| `gaps[].caps` | oui | exécutable · `tools/status.py` | Statut plafond ; une valeur de l'échelle |
| `gaps[].detail` | non | informationnel | Ce que le gap recouvre, en une phrase |

### Disparition de l'invariant 5

En 1.x, `components.json § $version` devait rester en phase avec `design-system.md § version:` — un invariant qu'aucun consommateur ne vérifiait. `release.json` déclare une version par artefact et une version de charte. Un écart est **enregistré**, pas sanctionné.

## `tokens.json`

Inchangé — schéma complet dans `token-schema.md`. Aucun champ ne quitte ni ne rejoint cet artefact au passage en 2.0.

## `components.json`

Anatomie seule. `mode`, `$utilityPrefixes` et `usage` sont partis en `policies.json` ; `oracle` en `oracle.json` ; `$version` en `release.json`.

Schéma, champ par champ, invariants et exemples : `${DESIGN_PLUGIN_ROOT}/skills/adjust/references/manifest-schema.md`, seul exemplaire.

## `policies.json`

```json
{
  "$schema": "design/references/contract-schema#policies",
  "mode": "bem",
  "$utilityPrefixes": ["<utility-prefix>"],
  "usage": {
    "rawHexForbidden": true,
    "colorUtilityPrefixes": ["<utility-prefix>"],
    "rules": [
      { "id": "<rule-id>", "description": "<prose>", "enforcement": "markup" }
    ]
  },
  "adapters": [
    { "artifact": "adapters/tokens.css", "consumer": "stylesheet" }
  ]
}
```

| Champ | Requis | Statut · consommateur | Description |
|---|---|---|---|
| `$schema` | oui | informationnel | Toujours `"design/references/contract-schema#policies"` |
| `mode` | oui | exécutable · `lint-core.mjs` (sélection des règles) · `tools/migrate-contract.py` (refuse de le deviner) | `"bem"` ou `"utility-first"`. Aucune auto-détection : absent, le contrat est inutilisable et le linter sort en 2 |
| `$utilityPrefixes` | non | exécutable · `lint-core.mjs` Règle 1 (`--strict`) | Préfixes de classes utilitaires à ne jamais signaler |
| `usage.rawHexForbidden` | non | exécutable · `lint-core.mjs` Règle 3 | `true` ⇒ toute couleur hexadécimale brute dans un `style="…"` ou un `<style>` inline est une `error`. Hors de ces deux contextes, aucune détection |
| `usage.colorUtilityPrefixes` | non | exécutable · `lint-core.mjs` Règle 4 | Préfixes de classe utilitaire porteurs de couleur. Pour `<prefix>-<nom>-<NN\|NNN>`, `<nom>` doit être une clé top-level de `tokens.json § color.*`. Mode `utility-first` uniquement |
| `usage.rules[].id` | oui | exécutable · `tools/run-gates.py` · pivot `sc-*` | Identifiant de la règle déclarée |
| `usage.rules[].description` | oui | exécutable · pivot `sc-*` | Énoncé lu par le réalisateur, repris verbatim |
| `usage.rules[].priority` | non | exécutable · `tools/run-gates.py` | `P0`, `P1` ou `P2`; défaut `P1`. Une preuve P0/P1 absente bloque, P2 avertit |
| `usage.rules[].enforcement` | oui | exécutable · `tools/run-gates.py` (sélection du réalisateur) | Preuve que la règle doit lire, donc qui la réalise. Espace fermé : `references/enforcement-registry.md`. Absent ou hors registre ⇒ exit 2 |
| `adapters[].artifact` | non | exécutable · `tools/generate.py` | Chemin de l'artefact à émettre, relatif au répertoire du contrat |
| `adapters[].consumer` | non | exécutable · `tools/generate.py` (sélection de l'émetteur) | Rôle qui consomme cet artefact. Jamais un nom de plateforme ni de projet. Absent ou `unknown` ⇒ entrée non émise, signalée une fois sur stderr |

### Table de correspondance des adapters

La liste d'émission : `tools/generate.py` écrit un artefact par entrée qui déclare un `consumer`, et rien d'autre. Une entrée sans `consumer` reste déclarative — elle nomme un fichier que le contrat connaît et que personne ne produit.

`tools/migrate-contract.py` amorce la table à partir des adapters **réellement présents** sous `<contrat>/adapters/`, en dérivant le rôle de l'extension :

| Extension | `consumer` |
|---|---|
| `.css` | `stylesheet` |
| `.scss` · `.sass` · `.less` | `stylesheet source` |
| `.json` | `platform token file` |
| `.js` · `.mjs` · `.cjs` · `.ts` | `build configuration` |
| autre | `unknown` — remonté comme anomalie du rapport, à compléter à la main |

Un rôle échappe à cette dérivation par extension : `deviation ledger` émet la vue Markdown de `deviations.json` (et non de `tokens.json`). Il n'est jamais amorcé depuis un adapter présent sous `adapters/` ; on le déclare à la main quand le contrat tolère des écarts. Gabarit de sortie : `references/deviation-ledger-template.md`.

Règle d'émission d'un adapter : `write-system-procedure.md § Adapter emission rule`.

## `oracle.json`

Inerte pour le lint. Seul `config-gen.py` le lit. **Requis quand la référence est mesurable** (maquette servie avec DOM, harness `setPage`) : il porte alors `pages`, le gate de fidélité figé par `adjust`. Sans référence mesurable (brief seul, maquette-image), le contrat ne l'écrit pas et ne le déclare pas dans `release.json § artifacts` — la fidélité y est sans objet.

Schéma : `${DESIGN_PLUGIN_ROOT}/skills/adjust/actions/02-freeze.md § Structure minimale requise`, qui le fige et en porte le seul exemplaire. Champs :

| Champ | Requis | Statut · consommateur | Description |
|---|---|---|---|
| `$schema` | oui | informationnel | Toujours `"design/references/contract-schema#oracle"` |
| `components.<name>.elements.<label>.check_text` | non | exécutable · `config-gen.py` | `true` sur les éléments dont le texte doit correspondre à la référence. Interdit sur les cibles en prose |
| `components.<name>.props` | non | exécutable · `config-gen.py`, `measure.py` | Props de la cible racine (mise en page : `display`, `gridTemplateColumns`, `gap`…). Remplace la liste token-dérivée pour cette cible |
| `components.<name>.elements.<label>.props` | non | exécutable · `config-gen.py`, `measure.py` | Surcharge la liste de props token-dérivées pour cet élément : la remplace, sans union. Absente, la liste globale s'applique |
| `pages` | oui si référence mesurable | exécutable · `config-gen.py --page`, `config-gen.py --check` | Gate figé. Clés = clés `setPage` du harness (la valeur que `--page` pose en `reference_page`) |
| `pages.<page>.components.<name>` | — | exécutable · `config-gen.py` | Composant présent sur la page. Seuls ceux-là sont mesurés sur cette page |
| `pages.<page>.components.<name>.root` | oui | exécutable · `config-gen.py` | Sélecteur maquette de la racine ; le côté implémentation reste la classe `base` |
| `pages.<page>.components.<name>.elements.<label>` | oui, par élément | exécutable · `config-gen.py` | Sélecteur maquette de l'élément, ou `{ "skip": "<raison>" }` : exclusion explicite, non mesurée, reportée. Tout élément de `components.<name>.elements` a l'un ou l'autre |
| `pages.<page>.components.<name>.collections.<collection>` | oui, par collection | exécutable · `config-gen.py` | Sélecteur maquette de l'item répété ; le côté implémentation reste `item_selector` |
| `components.<name>.collections[].name` | — | exécutable · `config-gen.py` | Libellé de la structure répétée |
| `components.<name>.collections[].item_selector` | — | exécutable · `config-gen.py` | Classe de l'item répété |
| `components.<name>.collections[].ack` | non | exécutable · `adapters/measure/measure.py` | Pré-sanction d'une divergence attendue : `{ "id": "…", "reason": "…" }` |
| `contract` | non | informationnel | Hints de mesure de portée contrat, hérités d'un `components.json § oracle` 1.x. Aucun consommateur ne les lit — seule la forme par composant en a un. Conservés pour ne rien perdre à la migration, à reventiler à la main |

Les clés de `oracle.json § components` sont les noms canoniques de `components.json § components` ; les libellés d'élément sont ceux de `components.<name>.elements`. Un composant sans hint n'a pas d'entrée — `config-gen.py` génère quand même une cible par élément, sans `check_text` et avec les props par défaut.

**Gate complet.** `config-gen.py --check` (sans URL) refuse (exit 1) : `pages` absent, page sans composant, composant inconnu, racine sans sélecteur, élément sans sélecteur ni `skip`, collection sans sélecteur, libellé inconnu. Il rapporte les exclusions et les composants présents sur aucune page — ceux-ci ne bloquent pas : aucune référence ne les montre, le lint seul les couvre. La config de mesure est un dérivé (`config-gen.py --page` + URLs) : elle ne se complète pas à la main ; un sélecteur faux se corrige ici, via `adjust`. Un `oracle.json` sans `pages` (contrat 2.x antérieur) reste lisible — mockup = classe DS, avec avertissement — mais `enforce` le refuse sur une référence mesurable.

## `deviations.json`

Inerte pour le lint. `adapters/measure/measure.py` le lit pour valider les exceptions du gate de fidélité ; `tools/generate.py` en dérive une vue Markdown. **Fichier optionnel** : un contrat sans écart toléré ne l'écrit pas et ne le déclare pas dans `release.json § artifacts`.

Schéma complet — champs, séparation actif/historique, cas de verdict `OPEN`, migration depuis le registre Markdown : `references/deviations-schema.md`.

## Dérivation des règles de lint

`lint-core.mjs` lit `tokens.json`, `components.json` et `policies.json`, sur **un fichier de markup à la fois**, et n'en dérive que les cinq règles ci-dessous. Aucun autre champ du contrat n'a d'effet sur le lint.

| Règle | Mode | Dérivée de | Sévérité |
|---|---|---|---|
| 1 — vocabulaire de classes | `bem` | `components.json § .base + .elements.* + .modifiers.*` ; `policies.json § $utilityPrefixes` | `error` (bloc déclaré) · `warning` sous `--strict` (forme BEM, bloc non déclaré, hors `$utilityPrefixes`) |
| 2 — références `var(--…)` | les deux | chemins de `tokens.json` aplatis en `--chemin-avec-tirets` | `error` |
| 3 — raw-hex | les deux (inerte sans `usage`) | `policies.json § usage.rawHexForbidden` | `error` |
| 4 — namespaces de couleur | `utility-first` | `policies.json § usage.colorUtilityPrefixes` × clés top-level de `tokens.json § color.*` | `error` |
| 5 — `--report-unused` | `bem` | entrées de `components.json` absentes du fichier scanné | rapport seul, jamais bloquant |

Champs **inertes pour le lint** : `.backgrounds`, `.foregrounds` et `.a11y` de `components.json`, `policies.json § adapters[]`, `usage.rules[]` de type autre que `markup`, et `oracle.json` entier. Inerte pour le lint n'est pas inerte pour le gate : `tools/run-gates.py` route chaque règle vers son réalisateur et rapporte celles qui n'en ont pas (`references/enforcement-registry.md`).

### Où porte le vocabulaire, selon `mode`

Sur une stack qui compose des classes utilitaires au lieu de classes BEM, `components` ne décrit rien de ce que le code écrit : la Règle 1 tourne à vide et ressort verte sans avoir rien vérifié. `mode` déplace donc la cible.

| | `bem` | `utility-first` |
|---|---|---|
| Le vocabulaire porte sur | les noms de classe | l'usage des tokens |
| `components.json § components` | requis | optionnel — absent, vide ou partiel |
| `policies.json § usage` | généralement absent | requis pour que le linter vérifie quoi que ce soit |
| Règle 1 | s'exécute | jamais |
| Règles 3/4 | inertes sans `usage` | s'exécutent |

Les deux modes sont de première classe ; aucun n'est un mode dégradé de l'autre. Les namespaces de couleur autorisés se dérivent à l'exécution des clés top-level de `tokens.json § color.*` : ajouter `color.accent` au contrat l'autorise immédiatement, sans toucher `policies.json`.

## Redistribution depuis un contrat 1.x

Exhaustive. Rien n'est inventé, rien n'est perdu. `tools/migrate-contract.py` applique exactement cette table.

| Source 1.x | Cible 2.0 |
|---|---|
| `tokens.json` (entier) | `tokens.json`, inchangé |
| `components.json § $schema` | `components.json § $schema`, réécrit vers ce document |
| `components.json § $version` | `release.json § designSystem.version` et `§ artifacts.*.version` |
| `components.json § mode` (ou `--mode`) | `policies.json § mode` |
| `components.json § $utilityPrefixes` | `policies.json § $utilityPrefixes` |
| `components.json § usage.*` | `policies.json § usage.*` |
| `components.json § components.<n>.{base, elements, modifiers, backgrounds, foregrounds, a11y}` | `components.json § components.<n>.*` |
| `components.json § components.<n>.oracle.{elements, collections}` | `oracle.json § components.<n>.*` |
| `components.json § oracle` (portée contrat) | `oracle.json § contract` — sans lecteur, signalé en anomalie |
| `components.json § <clé top-level non listée ci-dessus>` | `policies.json § <clé>`, verbatim — signalé en anomalie |
| `components.json § components.<n>.<clé non listée ci-dessus>` | `components.json § components.<n>.<clé>`, verbatim — signalé en anomalie |
| `design-system.md` — présence et `version:` | `release.json § charter` |
| adapters présents sous `adapters/` | `policies.json § adapters[]` |
| registre d'écarts Markdown (`--ledger`) | `deviations.json § active[]` — une entrée par bloc `### DEV-NNN` |
| — (nouveau) | `release.json § artifacts.*.sourceHash`, `§ provenance`, `§ checks`, `§ status` |

La passe `--contract` et la passe `--ledger` sont indépendantes : la première redistribue le manifeste, la seconde convertit le registre d'écarts. Forme cible et cas d'anomalie : `references/deviations-schema.md § Migration depuis le registre Markdown`.

## Contrat incomplet

| Situation | Diagnostic |
|---|---|
| `release.json` absent | Contrat 1.x — `lint-core.mjs` sort en 3 et imprime la commande de migration |
| `release.json` présent, un artefact déclaré absent ou illisible | Contrat inutilisable — exit 2, l'artefact est nommé |
| `policies.json § mode` absent | Décision que l'outil refuse de deviner — exit 2 |
| Un champ dont la forme ne correspond pas à sa déclaration | Contrat invalide — exit 2, l'artefact, le champ et la valeur reçue sont nommés. Un artefact structurellement invalide n'est ni une violation (exit 1) ni un contrat plus petit : lu tel quel, il rend un verdict sur un vocabulaire que le contrat ne déclare pas |
