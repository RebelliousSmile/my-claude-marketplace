# WordPress FSE — pièges partagés

Track: WP-maquette exclusivement. Référencé uniquement depuis le track WP de `enforce` (§ Track:
WP-maquette de `enforce/actions/03-lint-instances.md`) et de `diffuse`. Un projet app-JS-modern
n'a jamais besoin d'ouvrir ce fichier — ces pièges sont spécifiques à WordPress FSE et n'ont pas
d'équivalent SPA/from-code.

Référence partagée entre `enforce` et `diffuse`. Ces pièges s'appliquent à tout projet WordPress FSE utilisant le design system.

---

## Piège 1 : Classes appariées `has-background` / `has-text-color`

**Symptôme** : Gutenberg génère automatiquement des classes en paires obligatoires lors de l'application d'une couleur via l'éditeur :
- Fond : `has-<slug>-background-color` + `has-background`
- Texte : `has-<slug>-color` + `has-text-color`

Si ces classes ne sont pas dans le manifeste, `lint-core.mjs` les signale comme violations.

**Solution recommandée** : déclarer les composants natifs WP (wp-block-*) dans `components.json` avec leurs modifiers has-*. Alternativement, configurer `lint-core.mjs` pour exclure les blocs natifs `wp-block-*` du lint de vocabulaire (ils ne font pas partie du design system custom).

**À ne pas faire** : ignorer les violations sans documenter la décision.

---

## Piège 2 : Block patterns = copies indépendantes

**Symptôme** : un block pattern corrigé dans sa source ne met pas à jour les pages qui l'utilisent — chaque insertion est une copie dans `wp_posts.post_content`.

**Règle** : après correction d'un block pattern, toujours réimporter via le script d'import du projet (`tools/import/`). Ne jamais corriger uniquement en DB ; la source fait foi.

**Lint** : linter le pattern source ET au moins une page qui l'utilise pour vérifier la propagation.

---

## Piège 3 : `wp eval-file` deprecated en PHP 8.2

**Symptôme** : `wp eval-file script.php` émet un avertissement de dépréciation PHP 8.2 qui pollue ou supprime stdout.

**Solution** :

```bash
# ❌
wp eval-file tools/import/script.php

# ✅
pnpm dlx @wordpress/env run cli wp eval \
  '$c = file_get_contents("/var/www/html/tools/import/script.php"); eval($c);'
```

---

## Piège 4 : CLI local vs CLI conteneur

**Symptôme** : `wp post get` retourne des données d'une DB distincte de ce que le navigateur affiche.

**Règle absolue** : toujours utiliser `pnpm dlx @wordpress/env run cli wp`. Jamais `php wp-cli.phar` ni `wp` local — ils ciblent la DB Windows, pas la DB Docker.

---

## Piège 5 : NFC/NFD sur Windows (noms de fichiers accentués)

**Symptôme** : `existsSync('design/fondations.html')` retourne `false` sur Windows alors que le fichier existe, si le nom a été créé sur macOS (NFD).

**Solution** : dans les scripts Node.js qui vérifient l'existence de fichiers, normaliser le chemin en NFC :

```js
import { normalize } from 'path';
const normalizedPath = normalize(filePath).normalize('NFC');
```

Ou utiliser une fonction `resolveFile()` centralisée qui applique la normalisation.

---

## Piège 6 : Navigation FSE — `__unstableLocation` ignoré dans WP 7+

**Symptôme** : les menus de navigation ne s'affichent pas ; `__unstableLocation` est ignoré et le fallback `wp:page-list` prend le dessus.

**Solution** : créer les posts `wp_navigation` via un script PHP (`tools/import/12-nav-posts.php`) et les référencer par `ref:ID` dans les templates HTML. Les IDs changent entre local et prod — relancer le script après tout import DB en prod.

---

## Piège 7 : `theme.json` = source des tokens WP

**Pour `enforce`** : les tokens WP (palette, typographie) viennent de `theme.json`, pas de CSS inline. Le lint doit vérifier la cohérence entre `design/tokens.json` (source design) et `theme.json` (source WP). Toute divergence est une violation.

**Pour `diffuse`** : les block patterns et templates WP consomment les tokens via `theme.json` + les classes générées par Gutenberg (pas via `adapters/tokens.css` directement). L'adaptateur WP de `diffuse` doit en tenir compte.
