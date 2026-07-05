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

### En mode re-figeage (components.json existant)

- Conserver les entrées non touchées telles quelles.
- Appliquer les modifications du brief (delta uniquement).
- Suppressions : retirer l'entrée ET noter dans Provenance.

### Déterminer le type de bump version

| Changement | Bump |
|------------|------|
| Ajout de composant, d'élément, de variante, de fond | **minor** |
| Ajout d'un thème (`themes.<nom>`) ou d'un token surchargé dans un thème existant | **minor** |
| Renommage de `base`, suppression d'entrée ou de variante | **major** |
| Suppression d'un thème ou d'un chemin d'overlay | **major** |
| Premier figeage (fichier inexistant) | **1.0.0** |

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
- [ ] `design-system.md status:` == `figé`
