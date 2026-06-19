# Action 02 — install-pivots

## Rôle

Installer les pivots d'amélioration CSS recommandés dans `.claude/rules/07-quality/` pour qu'ils soient disponibles lors des sessions `improve` et `legacy`.

## Procédure

1. Lire `pivots_recommended` du pivot manifeste (produit par `01-scan`).
2. Pour chaque pivot recommandé, vérifier si la version installée est identique à la référence plugin.
3. Écrire ou mettre à jour uniquement les fichiers qui diffèrent.
4. Signaler chaque fichier : `✅ installé`, `✅ déjà à jour`, `❌ non disponible dans le plugin`.

## Pivots disponibles

| Pivot | Fichier installé | Déclencheur |
|-------|-----------------|-------------|
| `improve/custom-properties` | `sc-css-custom-props.md` | adoption custom properties < full |
| `improve/cascade-layers` | `sc-css-layers.md` | cascade layers absent ou partial |
| `improve/specificity` | `sc-css-specificity.md` | architecture ad-hoc détectée |
| `legacy/float-to-flex` | `sc-css-float-legacy.md` | `float:` détecté dans les fichiers |
| `legacy/vendor-prefixes` | `sc-css-prefixes.md` | `-webkit-`/`-moz-` systématiques détectés |
| `legacy/preprocessor-vars` | `sc-css-prepro-vars.md` | variables `$var` Sass ou `@var` Less détectées |

## Règles

- Ne jamais installer un pivot pour un pattern non détecté dans `01-scan`.
- Ne pas écraser un fichier déjà identique (comparer le contenu avant écriture).
- Signaler les gaps : un pivot recommandé mais absent du plugin.
