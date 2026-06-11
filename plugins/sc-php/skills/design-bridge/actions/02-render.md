# 02-render (sc-php)

## Rôle

Rendre l'élément neutre en **block pattern WordPress FSE** idiomatique + mettre à jour `theme.json` si nécessaire. Dérive strictement du spec de rendu reçu de `design:diffuse/03-pivot`.

## Input attendu (spec de rendu)

```
## Design render spec
Source: design/tokens.json + design/components.json
Version: <semver>
Component: { name, base, elements, modifiers, backgrounds, a11y }
Variants to produce: [...]
Render target: { language: php-fse-block, output_dir: ... }
```

Vérifier que le spec est présent avant de continuer.

## Prérequis WP

Lire `plugins/design/references/wordpress-pitfalls.md` intégralement avant de produire quoi que ce soit. Points critiques :
- CLI conteneur obligatoire pour toute opération DB
- Classes appariées `has-*` → décider de les déclarer dans le manifeste ou les exclure du lint
- `wp eval-file` deprecated → utiliser `wp eval` avec `file_get_contents`
- Propagation block patterns : la source doit être réimportée après modification

## Étape 1 — Produire le HTML du block pattern

Le block pattern WP est du HTML enrichi de commentaires Gutenberg (`<!-- wp:... -->`). Seules les classes du spec sont utilisées dans les balises HTML ; Gutenberg peut ajouter les siennes dans les commentaires (ex. `{"className":"card card--featured"}`).

Structure type :

```html
<!-- wp:group {"className":"<base> <modifier>","style":{}} -->
<div class="wp-block-group <base> <modifier>">

  <!-- wp:image {} -->
  <figure class="wp-block-image <base>__<element>">
    <img src="" alt=""/>
  </figure>
  <!-- /wp:image -->

  <!-- wp:group {} -->
  <div class="wp-block-group <base>__body">

    <!-- wp:heading {"level":2} -->
    <h2 class="wp-block-heading <base>__title">Titre</h2>
    <!-- /wp:heading -->

  </div>
  <!-- /wp:group -->

</div>
<!-- /wp:group -->
```

Règle : la classe design system (`card`, `card__body`, etc.) est sur l'élément HTML ; la classe WP (`wp-block-group`, etc.) est sur le même élément mais ne fait PAS partie du manifeste design — ne pas la linéter contre le manifeste.

## Étape 2 — Mettre à jour theme.json

Pour chaque fond autorisé (`.backgrounds`) du composant, vérifier que la couleur correspondante existe dans `theme.json § settings.color.palette` :

```json
{
  "settings": {
    "color": {
      "palette": [
        {
          "name": "Background",
          "slug": "semantic-background",
          "color": "#f7f8fa"
        }
      ]
    }
  }
}
```

- Si le slug existe déjà avec la bonne valeur → OK.
- Si le slug manque → ajouter l'entrée (valeur dérivée de `tokens.json` via le spec).
- Si la valeur diffère → signaler comme divergence (voir piège 7 de `wordpress-pitfalls.md`).

## Étape 3 — Enregistrer le block pattern

Créer le fichier du pattern dans l'output dir du spec (ex. `patterns/<canonical-name>.html`) avec une en-tête WordPress :

```php
<?php
/**
 * Title: <Nom du composant>
 * Slug: <plugin-ou-theme>/<canonical-name>
 * Categories: <categorie>
 * Viewport Width: 1200
 */
?>
<!-- Block pattern HTML ici -->
```

Si le projet utilise un répertoire `patterns/` dans le thème, placer le fichier à cet endroit.

## Étape 4 — Gate enforce

Linter le HTML du block pattern produit :

```bash
# Extraire le HTML (sans les commentaires wp:...) dans un fichier temporaire
# Puis linter contre le contrat
node design/lint/lint-core.mjs /tmp/pattern-<canonical-name>.html
```

Si exit 1 → corriger les classes non conformes, re-lint, ne pas livrer en exit 1.

## Étape 5 — Propagation (si pattern existant mis à jour)

Si le pattern existait déjà en DB, relancer le script d'import du projet pour propager :

```bash
pnpm dlx @wordpress/env run cli wp eval \
  '$c = file_get_contents("/var/www/html/tools/import/<script>.php"); eval($c);'
```

Puis relancer `design:enforce/03-lint-instances` pour vérifier les instances en DB.

## Sortie attendue

> Block pattern WP produit : `patterns/<canonical-name>.html`
> Variantes : <liste>
> theme.json : <mis à jour / aucune modification>
> Gate enforce : vert (exit 0)
>
> Retour à design:diffuse — rendu WP livré.
