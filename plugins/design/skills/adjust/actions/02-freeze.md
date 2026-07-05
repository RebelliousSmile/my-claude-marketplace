# 02-freeze

## Rôle

Figer le contrat. Prend le brief d'arbitrage produit par `01-arbitrate` et :
1. Canonise `design/tokens.json` (déduplique, vérifie les groupes requis).
2. Écrit `design/components.json` conforme à `${CLAUDE_PLUGIN_ROOT}/skills/adjust/references/manifest-schema.md`.
3. Marque `design/design-system.md` comme figé et bumpe la version.

**Prérequis** : le brief d'arbitrage doit être complet (aucun cas non tranché). Si ce n'est pas le cas, interrompre et renvoyer à `01-arbitrate`.

## Étape 1 — Canoniser `design/tokens.json`

À partir des tokens résolus dans le brief d'arbitrage :

### 1a. Vérifier les groupes requis

Auditer `tokens.json` contre les groupes requis de `${CLAUDE_PLUGIN_ROOT}/references/token-schema.md` :
- Groupes présents → OK
- Groupes manquants → les créer avec les valeurs retenues dans le brief
- Groupes partiels → les compléter

### 1b. Dédupliquer

Identifier les tokens avec des valeurs identiques sur des chemins différents. Règle : conserver le chemin sémantique (`color.semantic.*`) et créer un alias `{color.semantic.*}` sur le chemin redondant. Documenter chaque déduplication dans les commentaires de Provenance.

### 1c. Vérifier les alias

Tous les `{token.path}` dans `$value` doivent pointer vers un chemin existant dans le même fichier. Aucun alias circulaire.

### 1d. Auditer les overlays de thème (si `themes` est présent)

Pour chaque thème sous `themes.<nom>` (§ Modes / themes de `${CLAUDE_PLUGIN_ROOT}/references/token-schema.md`) et chaque chemin qu'il re-déclare :
- Vérifier que le chemin existe dans l'arbre de base (hors `themes`) de `tokens.json`. Un chemin d'overlay absent de l'arbre de base est une **erreur bloquante** (jamais un warning) — corriger le chemin, ou l'ajouter d'abord à l'arbre de base s'il doit exister pour tous les thèmes.
- Vérifier qu'une entrée d'overlay ne porte que `$value` (jamais `$type` — le type est toujours hérité du chemin de base). Une entrée avec `$type` est non conforme au schéma.
- `default` n'est jamais une entrée de `themes` — c'est l'arbre de base lui-même ; signaler toute clé `themes.default` comme erreur.

### 1e. Écrire le fichier

Réécrire `design/tokens.json` avec les tokens canonisés. Conserver le format W3C DTCG (chaque token = `{ "$type": "...", "$value": "..." }`).

## Étape 2 — Écrire `design/components.json`

Construire le manifeste à partir des composants résolus dans le brief d'arbitrage, en suivant le schéma de `${CLAUDE_PLUGIN_ROOT}/skills/adjust/references/manifest-schema.md`.

### Structure minimale requise

```json
{
  "$schema": "design/references/manifest-schema#",
  "$version": "<semver>",
  "components": {
    "<canonical-name>": {
      "base": "<BEM-block>",
      "elements": { },
      "modifiers": { },
      "backgrounds": ["<token.path>"],
      "a11y": { "role": "<ARIA-role>", "requires": [] }
    }
  }
}
```

### Règles d'écriture

1. **Noms canoniques en kebab-case** : `btn`, `card`, `hero`, `nav`, `form-field`, etc.
2. **BEM strict** : `base` = le block ; `elements.*` = `block__element` ; `modifiers.*` = `block--modifier`.
3. **Backgrounds token-référencés** : chaque chemin dans `.backgrounds` doit exister dans le `tokens.json` canonisé. Si un chemin est absent → erreur bloquante, corriger `tokens.json` d'abord.
4. **Concordance avec la couche 3** : chaque composant listé dans `design-system.md § Inventaire des composants` doit avoir une entrée, et vice-versa. Si discordance → résoudre (ajouter l'entrée manquante ou retirer le composant de la charte).

### Sous-étape — Auditer le bloc `usage` (mode utility-first)

Si le brief d'arbitrage retient un contrat `mode: "utility-first"` (ou si `components` reste vide/partiel parce que le projet est Tailwind/Vue/React — cf. `adjust/references/manifest-schema.md § Mode utility-first`), auditer/écrire le bloc `usage` de `components.json` :

- **`mode`** : écrire explicitement `"bem"` ou `"utility-first"` — ne jamais laisser à l'auto-détection dans un contrat figé (l'auto-détection est un filet pour les manifestes legacy, pas une pratique d'écriture pour un nouveau figeage).
- **`usage.rawHexForbidden`** : `true` sauf raison documentée de l'omettre.
- **`usage.colorUtilityPrefixes`** : la liste des préfixes de classe utilitaire porteurs de couleur réellement utilisés par le projet (ex. `["bg", "text", "border", "ring"]` pour Tailwind) — ne pas copier un préfixe non utilisé par la stack du projet.
- **`usage.rules[]`** : au minimum déclarer `state-colour-icon` (`enforcement: "pivot-only"`) si le design system a une notion de statut/état visuel ; ajouter toute autre règle sémantique identifiée pendant `destructure` qu'un scanner de chaînes ne peut pas vérifier.
- **Cohérence de couche** : les namespaces de couleur autorisés dérivent des clés top-level de `tokens.json § color.*` — vérifier qu'aucun groupe de couleur nécessaire au projet n'est manquant de l'arbre de tokens avant de figer (sinon le namespace ne sera jamais reconnu par `lint-core.mjs`).
- Si le projet garde des composants BEM legacy à côté de l'utilitaire (transition), `components` peut rester partiel — c'est additif, pas une erreur (A5).

### Bump `$version` avec le bloc `usage`

Ajouter/étendre `usage` (nouveau namespace, nouvelle règle déclarée) suit la même table de bump que l'ajout de composant : **minor**. Une suppression de règle ou de namespace autorisé : **major** (rétrécit le vocabulaire accepté, peut casser du code existant qui en dépendait).

### En mode re-figeage (components.json existant)

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
| Premier figeage (fichier inexistant) | **1.0.0** |

## Étape 2bis — Réconciliation avec le code réel (retrofit)

> Nouvelle étape top-level, distincte de la sous-étape "Auditer le bloc `usage`" ci-dessus (qui, elle, reste une sous-partie de l'Étape 2). Cette étape-ci s'exécute une fois `components.json` écrit et **avant** de figer (Étape 3) ou de bumper la version.

Un manifeste peut être parfaitement cohérent avec la prose de `design-system.md` (concordance couche 2 ↔ couche 3, § Étape 2 Règle 4) tout en divergeant du code **déjà écrit** du projet consommateur — le cas **retrofit** : un projet qui a du markup/composants avant même que le contrat ne soit figé. Sans cette étape, cette dérive n'est repérée que bien plus tard, à `enforce/03-lint-instances`, une fois le contrat déjà figé et du travail déjà construit dessus. Réconcilier maintenant, pas après.

### Portée du scan (mode-aware)

Jamais de glob ou de jeu de règles codé en dur : les deux se dérivent du champ `mode` du contrat tout juste écrit à l'Étape 2.

| Mode | Glob scanné | Règle de réconciliation |
|------|-------------|--------------------------|
| `bem` | `**/*.{html,vue,jsx,tsx}` du projet consommateur | attributs `class`/`className` du code réel vs vocabulaire `components.*.base` / `.elements` / `.modifiers` du manifeste |
| `utility-first` | `**/*.{html,vue,jsx,tsx}` du projet consommateur | utilitaires couleur (`bg-…`, `text-…`, …) et hex bruts du code réel vs les namespaces déclarés sous `usage.colorUtilityPrefixes` / `usage.rawHexForbidden` |

### Oracle de scan : `lint-core.mjs`, réutilisé tel quel

Aucun nouveau scanner n'est écrit : `enforce/adapters/lint-core.mjs` est invoqué comme oracle, une fois par fichier du glob résolu ci-dessus, avec le `components.json` tout juste écrit comme contrat :

```
node lint-core.mjs <fichier-du-glob> <dossier-du-contrat-tout-juste-figé>
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
version: <même semver que components.json>
---
```

Mettre à jour la section **Provenance** avec :
- Date du figeage
- Version bumped (et raison si major)
- Liste des décisions d'arbitrage clés (extrait du brief)

Si `design-system.md` contient encore des "Open questions" qui n'ont pas été résolues, les conserver mais les marquer `[non résolu au figeage — à traiter]`.

## Étape 4 — Synchroniser les versions

S'assurer que `$version` dans `components.json` et `version:` dans `design-system.md` sont identiques. C'est un invariant du contrat (vérifié par `enforce`).

## Sortie attendue

Annoncer à l'utilisateur :

> Contrat figé v{version}.
>
> - `design/tokens.json` — {N} tokens canoniques, {X} alias créés, {Y} groupes complétés
> - `design/components.json` — {M} composants ({P} ajouts, {Q} modifications, {R} suppressions)
> - `design/design-system.md` — status: figé, version bumped {ancien} → {nouveau}
>
> Prochaine étape : `/design:enforce` pour installer le linter et câbler les gates.

## Test de validité

Avant d'annoncer la complétion, vérifier mentalement :

- [ ] `components.json.$version` == `design-system.md version:`
- [ ] Tous les chemins `.backgrounds` existent dans `tokens.json`
- [ ] Tous les composants de l'inventaire prose ont une entrée dans `components.json`
- [ ] Aucun token en doublon (valeurs identiques sur chemins différents sans alias)
- [ ] Tous les chemins de `themes.*` (si présent) existent dans l'arbre de base ; aucune entrée d'overlay ne porte `$type` ; aucune clé `themes.default`
- [ ] Si `usage` est présent : `mode` est écrit explicitement (jamais laissé à l'auto-détection dans un contrat figé) ; chaque namespace visé par `usage.colorUtilityPrefixes` correspond à un groupe existant sous `tokens.json § color.*`
- [ ] **Réconciliation Étape 2bis** : le scan mode-aware du code réel (via `lint-core.mjs`) ne remonte aucune divergence code→manifeste bloquante sur le glob concerné ; les divergences manifeste→code (le cas échéant) sont documentées en warning/ledger, jamais bloquantes ; comportement always-on confirmé (greenfield → scan vide → non-bloquant, rien à coder à part)
- [ ] `design-system.md status:` == `figé`
