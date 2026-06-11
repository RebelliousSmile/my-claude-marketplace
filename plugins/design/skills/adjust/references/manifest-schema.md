# Manifest schema — `design/components.json`

`design/components.json` est la **2e couche** du contrat à 3 couches. C'est le vocabulaire fermé, machine-vérifiable, des composants du design system. Il est écrit par `adjust/02-freeze.md` et consommé par `enforce` pour dériver ses règles de lint.

## Position dans le contrat

| Couche | Fichier | Contenu | Mutabilité |
|--------|---------|---------|------------|
| 1 | `design/tokens.json` | Valeurs (couleurs, espacements, typographie…) | Figé à `adjust` |
| 2 | `design/components.json` | Vocabulaire composants (noms canoniques, BEM, variantes, contextes de fond) | Figé à `adjust` |
| 3 | `design-system.md` | Charte prose (fondations narratives, inventaire candidat, provenance) | `brouillon` → `figé` à `adjust` |

Règle absolue : **une valeur vit dans une seule couche.** Les valeurs vivent en couche 1 ; la nomenclature des composants vit en couche 2 ; la prose et la provenance vivent en couche 3. Le manifeste (couche 2) PROMEUT l'inventaire prose candidat de `design-system.md` — ce sont deux artefacts distincts ; le manifeste est la source fermée vérifiable.

## Structure de `design/components.json`

```json
{
  "$schema": "design/references/manifest-schema#",
  "$version": "1.0.0",
  "components": {
    "<canonical-name>": {
      "base": "<BEM-block>",
      "elements": {
        "<element-label>": "<BEM-element>"
      },
      "modifiers": {
        "<variant-label>": "<BEM-modifier>"
      },
      "backgrounds": ["<token.path>"],
      "a11y": {
        "role": "<ARIA-role>",
        "requires": ["<attribute>"]
      }
    }
  }
}
```

### Champs

| Champ | Requis | Description |
|-------|--------|-------------|
| `$schema` | oui | Toujours `"design/references/manifest-schema#"` |
| `$version` | oui | Semver ; bump **minor** sur ajout, **major** sur renommage ou suppression |
| `components` | oui | Map des composants canoniques ; au moins 1 entrée |
| `components.<name>` | — | Clé = nom canonique en kebab-case (ex. `btn`, `card`, `hero`) |
| `.base` | oui | Classe BEM block (ex. `"btn"`, `"c-card"`) — source unique de la nomenclature |
| `.elements` | non | Map `label → BEM-element` (ex. `"body": "card__body"`) |
| `.modifiers` | non | Map `label → BEM-modifier` (ex. `"primary": "btn--primary"`) |
| `.backgrounds` | non | Liste de chemins de tokens autorisés comme fond pour ce composant (ex. `["color.semantic.background", "color.brand.primary"]`). Omis = pas de contrainte de fond. |
| `.a11y.role` | non | Rôle ARIA attendu (ex. `"button"`, `"region"`) |
| `.a11y.requires` | non | Attributs ARIA requis (ex. `["aria-label"]`) |

## Invariants du manifeste

1. **Vocabulaire fermé** : toute classe CSS dérivée du design system doit correspondre à un `.base`, `.elements.*`, ou `.modifiers.*` dans le manifeste. Une classe non déclarée est une violation lint.
2. **Pas de doublons** : deux composants ne peuvent pas partager le même `.base`.
3. **Concordance couche 2 ↔ couche 3** : chaque composant listé dans `design-system.md § Inventaire des composants` doit avoir une entrée dans `components.json`, et vice-versa. `enforce` signale toute divergence.
4. **Backgrounds token-référencés** : les chemins dans `.backgrounds` doivent exister dans `design/tokens.json`. Un chemin mort est une violation lint.
5. **$version en phase avec design-system.md** : la version de `components.json` et la version de `design-system.md` doivent correspondre après chaque `adjust`.

## Exemple complet

```json
{
  "$schema": "design/references/manifest-schema#",
  "$version": "1.2.0",
  "components": {
    "btn": {
      "base": "btn",
      "elements": {
        "icon": "btn__icon",
        "label": "btn__label"
      },
      "modifiers": {
        "primary":   "btn--primary",
        "secondary": "btn--secondary",
        "ghost":     "btn--ghost",
        "sm":        "btn--sm",
        "lg":        "btn--lg"
      },
      "backgrounds": [
        "color.semantic.background",
        "color.semantic.surface",
        "color.brand.primary"
      ],
      "a11y": {
        "role": "button",
        "requires": []
      }
    },
    "card": {
      "base": "card",
      "elements": {
        "media":   "card__media",
        "body":    "card__body",
        "title":   "card__title",
        "actions": "card__actions"
      },
      "modifiers": {
        "featured":  "card--featured",
        "horizontal":"card--horizontal"
      },
      "backgrounds": [
        "color.semantic.surface"
      ],
      "a11y": {
        "role": "article",
        "requires": ["aria-label"]
      }
    },
    "hero": {
      "base": "hero",
      "elements": {
        "eyebrow": "hero__eyebrow",
        "headline":"hero__headline",
        "body":    "hero__body",
        "cta":     "hero__cta",
        "media":   "hero__media"
      },
      "modifiers": {
        "dark":     "hero--dark",
        "centered": "hero--centered"
      },
      "backgrounds": [
        "color.semantic.background",
        "color.brand.primary",
        "color.neutral.900"
      ],
      "a11y": {
        "role": "banner",
        "requires": []
      }
    }
  }
}
```

## Consommation par `enforce`

`enforce/adapters/lint-core.mjs` lit `design/components.json` et dérive :

- **Ensemble de classes autorisées** : union de tous les `.base` + `.elements.*` + `.modifiers.*` → toute classe hors de cet ensemble est une violation `error`.
- **Règles de fond** : pour chaque composant avec `.backgrounds`, si ce composant apparaît dans un conteneur dont la couleur de fond ne correspond pas à un des tokens listés → violation `warning`.
- **Règles a11y** : si un composant avec `.a11y.role` est rendu sans l'attribut `role` correspondant ou sans les attributs `.a11y.requires` → violation `warning`.

## Déclenchement d'un re-figeage

Si `destructure` (rejouable à tout moment) identifie une direction incompatible avec le manifeste actuel (`coût contrat: demande un re-figeage`), le flux est :

1. `/design:adjust` rejoue l'arbitrage sur le delta (nouvelles pistes uniquement).
2. `02-freeze.md` met à jour `components.json` + bump version.
3. `enforce` propage et re-lint (réconciliation, absorbée dans l'entonnoir).
