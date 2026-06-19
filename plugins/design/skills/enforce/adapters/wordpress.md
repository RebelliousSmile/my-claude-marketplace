# Adaptateur WordPress — lint instances DB

Instructions spécifiques pour linter le contenu d'un projet WordPress FSE contre le manifeste design system. À lire en complément de `03-lint-instances.md` et `${CLAUDE_PLUGIN_ROOT}/references/wordpress-pitfalls.md`.

## Règle absolue : CLI du conteneur

**Toujours utiliser `pnpm dlx @wordpress/env run cli wp`.**
Jamais `php wp-cli.phar` ni `wp` local — ils ciblent une DB Windows distincte de la DB Docker visible par le navigateur.

## Exporter le contenu HTML d'un post/page

```bash
# Export du post_content d'un post donné (remplacer <ID>)
pnpm dlx @wordpress/env run cli wp post get <ID> \
  --field=post_content \
  --format=json \
  > /tmp/post-<ID>.html

# Linter l'export
node design/lint/lint-core.mjs /tmp/post-<ID>.html
```

## Lister les pages publiées pour audit systématique

```bash
pnpm dlx @wordpress/env run cli wp post list \
  --post_type=page \
  --post_status=publish \
  --fields=ID,post_title \
  --format=csv
```

Pour chaque ID retourné, exporter et linter.

## Block patterns (contenu stocké en bibliothèque)

Les block patterns sont stockés en DB (`wp_posts` avec `post_type=wp_block`). Ils se propagent comme copies indépendantes à chaque usage — c'est le piège n°1 de WordPress FSE.

```bash
# Lister les block patterns
pnpm dlx @wordpress/env run cli wp post list \
  --post_type=wp_block \
  --fields=ID,post_title \
  --format=csv

# Exporter un pattern
pnpm dlx @wordpress/env run cli wp post get <ID> \
  --field=post_content > /tmp/pattern-<ID>.html

# Linter
node design/lint/lint-core.mjs /tmp/pattern-<ID>.html
```

**Après correction d'un block pattern**, réimporter via le script d'import dédié du projet (ex. `tools/import/`). Ne jamais corriger uniquement en DB sans mettre à jour la source — la source fait foi.

## Piège : classes appariées `has-background` / `has-text-color`

Gutenberg génère des classes de style en paires obligatoires :
- `has-<color-slug>-background-color` requiert `has-background`
- `has-<color-slug>-color` requiert `has-text-color`

Si le manifeste ne déclare pas ces classes comme modifiers, `lint-core.mjs` les signalera. Deux options :
1. Les déclarer comme modifiers dans `components.json` (si le projet utilise des blocs natifs WP).
2. Les exclure du lint (modifier `lint-core.mjs` pour ignorer les classes `has-*` générées par Gutenberg).

Voir `${CLAUDE_PLUGIN_ROOT}/references/wordpress-pitfalls.md` pour la décision recommandée.

## Piège : `wp eval-file` deprecated en PHP 8.2

`wp eval-file` émet un avertissement de dépréciation PHP 8.2 qui supprime stdout. Utiliser `wp eval` avec `file_get_contents` à la place :

```bash
# ❌ Ne pas utiliser
wp eval-file tools/import/script.php

# ✅ Utiliser
wp eval '$c = file_get_contents("/var/www/html/tools/import/script.php"); eval($c);'
```

## Piège : NFC/NFD sur Windows

`existsSync` échoue sur les noms de fichiers accentués en NFD sur Windows (ex. fichier créé par Finder macOS). Pour les scripts d'import PHP exportant des fichiers HTML, utiliser une fonction `resolveFile()` qui normalise en NFC avant de vérifier l'existence.
