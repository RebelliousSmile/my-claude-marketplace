# Adaptateur baseline — HTML + CSS

## Statut de la sortie

Le rendu produit par cet adaptateur est une **preview autonome, non intégrée** (wrapper `diffuse-demo`) — pas un composant applicatif. Aucun chemin d'intégration automatique n'existe vers le code réel du projet (Vue/React/WP) : c'est un artefact de démonstration, jamais un livrable branché dans l'app. Un lint vert (`lint-core.mjs` exit 0) valide le vocabulaire du rendu, il n'implique jamais qu'il soit intégré. Ce statut est contractuel — le hand-off de promotion (quel composant/fichier réel il deviendrait, et la recommandation conditionnelle d'installer `sc-<techno>` si une stack JS/WP est détectée) est émis par `02-render.md` Étape 5. Voir aussi `SKILL.md § Ce que diffuse produit` (ligne "Rendu baseline").

Rendu universel sans dépendance externe. Produit un fichier HTML autonome (avec CSS inline ou lié) à partir de la spec neutre. Fonctionne sur toute stack, sans pivot.

## Règles de rendu

### Classes

N'utiliser que les classes déclarées dans le manifeste (`components.json`) :
- Classe block : `.base`
- Classes éléments : valeurs de `.elements`
- Classes modifiers : valeurs de `.modifiers`

**Interdiction absolue** d'inventer des classes non déclarées. Si un besoin de style ne peut être satisfait par le vocabulaire du manifeste → STOP, signaler et proposer de re-figer via `adjust`.

### Tokens

N'utiliser que les tokens déclarés dans `tokens.json`, référencés via les CSS custom properties générées par l'adaptateur CSS :

```html
<!-- Lier l'adaptateur tokens.css du projet -->
<link rel="stylesheet" href="../adapters/tokens.css">
<!-- ou chemins absolus selon la structure du projet -->
```

Pour les styles inline nécessaires (fond du conteneur de démo), utiliser `var(--<token-property>)` :

```html
<div style="background: var(--color-semantic-surface); padding: var(--space-8);">
  <!-- composant ici -->
</div>
```

Le nom de la custom property correspond au chemin de token aplati avec `-` : `color.semantic.surface` → `--color-semantic-surface`.

### HTML sémantique

- Utiliser le tag sémantique adapté au rôle ARIA du composant :
  - `role: button` → `<button type="button">`
  - `role: article` → `<article>`
  - `role: banner` → `<header>` ou `<section>`
  - `role: navigation` → `<nav>`
  - Autres → `<div>` avec `role="..."` explicite
- Appliquer les attributs `.a11y.requires` de la spec (ex. `aria-label`, `aria-expanded`).
- Jamais d'emoji dans les attributs `alt`, `aria-label`, ou le contenu textuel.

### Structure du fichier de sortie

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Diffuse — <canonical-name></title>
  <link rel="stylesheet" href="<chemin-vers-adapters/tokens.css>">
</head>
<body>
  <!-- Wrapper de démonstration avec le fond autorisé -->
  <div class="diffuse-demo" style="background: var(--<token-fond>); padding: var(--space-8);">

    <!-- Forme de base -->
    <h2>Base</h2>
    <<tag> class="<base>" <a11y-attrs>>
      <!-- slots de contenu -->
    </<tag>>

    <!-- Variante 1 -->
    <h2><label variante 1></h2>
    <<tag> class="<base> <modifier-1>" <a11y-attrs>>
      <!-- slots de contenu -->
    </<tag>>

    <!-- ... une section par variante déclarée -->

  </div>
</body>
</html>
```

## Correspondance spec neutre → HTML

| Champ spec neutre | Rendu HTML |
|-------------------|-----------|
| `Base class` | Attribut `class` sur le tag racine |
| `Slots → Classe BEM` | Attribut `class` sur les éléments enfants |
| `Slots → Contenu` | Contenu textuel ou placeholder |
| `Variantes → Modifier` | Ajouté à la classe du tag racine |
| `Contexte de fond → Token` | `style="background: var(--...)"` sur le wrapper |
| `a11y.role` | Tag sémantique ou `role="..."` |
| `a11y.requires` | Attributs ARIA explicites |

## Exemple complet — composant `card`

Spec neutre (fixture enforce) :
- Base: `card` ; éléments: `card__media`, `card__body`, `card__title` ; modifiers: `card--featured`
- Fond: `color.semantic.surface` ; a11y: `role=article`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Diffuse — card</title>
  <link rel="stylesheet" href="../adapters/tokens.css">
</head>
<body>
  <div class="diffuse-demo" style="background: var(--color-semantic-surface); padding: var(--space-8);">

    <h2>Base</h2>
    <article class="card">
      <div class="card__media">
        <img src="" alt="Image illustrative de la carte">
      </div>
      <div class="card__body">
        <h3 class="card__title">Titre de la carte</h3>
      </div>
    </article>

    <h2>Variante : featured</h2>
    <article class="card card--featured">
      <div class="card__media">
        <img src="" alt="Image illustrative de la carte mise en avant">
      </div>
      <div class="card__body">
        <h3 class="card__title">Titre de la carte mise en avant</h3>
      </div>
    </article>

  </div>
</body>
</html>
```

Ce rendu utilise uniquement `card`, `card--featured`, `card__media`, `card__body`, `card__title` — tous déclarés dans le manifeste → gate enforce exit 0.
