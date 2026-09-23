# Realize-lint (sc-php)

## Rôle

Matérialiser un linter PHP/WP idiomatique à partir du spec d'enforcement reçu de `design:enforce/04-pivot`. Le linter dérive ses règles **strictement** du spec (valid class sets + token paths) — aucune liste codée en dur.

## Input attendu (spec d'enforcement)

```
## Design enforcement spec
Source: design/tokens.json + design/components.json
Version: <semver>
Valid class sets: [...]
Token paths: [...]
Token scales: { canonical values: {...}, theme overlays: {...} }
a11y requirements: [...]
Enforcement target: { language: php, targets: [...] }
```

Vérifier que le spec est présent avant de continuer. Si absent, signaler que `01-realize-lint` est invoqué uniquement via `design:enforce/04-pivot`.

## Stratégie de lint PHP/WP

WordPress FSE combine PHP (templates), JSON (block patterns, theme.json) et HTML (contenu en DB). La stratégie est en deux couches :

| Type d'enforcement | Couche | Outil | Cible |
|---|--------|-------|-------|
| `source-graph` | classes et bindings dans les templates/patterns | script PHP checker | fichiers `.php` portant `class="…"` ou commentaires de blocs `className` |
| `stored-content` | contenu HTML en base | `lint-core.mjs`, sur export | via `wp post get` (`${SC_PHP_PLUGIN_ROOT}/skills/design-bridge/references/wordpress-lint-instances.md`) |
| `platform-config` | palette déclarée par la plateforme | vérification JSON | cohérence `theme.json` ↔ `tokens.json` |

## Étape 0 — Étendre le gate existant quand il existe

Reprendre le mode décidé par `design:enforce/01-build-linter`. En mode `extend`, résoudre la commande
et le `generatedBlock` depuis son marqueur ; les deux sont requis. Si le projet possède déjà un checker
PHP/WP de design system :

- générer la logique dérivée du spec dans `design/lint/generated/design-enforce-v2/check-classes.php` ;
- enregistrer son appel **dans le bloc généré** de l'agrégateur existant ;
- ne jamais remplacer le checker humain ni ajouter une seconde commande pre-commit/CI ;
- remplacer le bloc à la ré-exécution, sans dupliquer `require`, commande ou rapport.

Un checker existant sans marqueur d'extension est ambigu : proposer le bloc et s'arrêter avant écriture.
En mode `install`, poursuivre avec le chemin historique ci-dessous.

## Étape 1 — Générer le PHP class checker

Créer `design/lint/check-classes.php` dans le projet en mode `install`, ou le module généré nommé à
l'étape 0 en mode `extend` :

```php
<?php
/**
 * Design system class checker for PHP templates.
 * Derives valid classes from the design pivot spec — no hard-coded values.
 * Usage: php design/lint/check-classes.php <file-or-dir> [--strict]
 */

// Valid class sets from the design enforcement spec (injected at generation time)
$validClasses = [
    // GENERATED from components.json — regenerate via /design:enforce
    // Base classes
    '__VALID_BASES__',
    // All valid classes
    '__VALID_CLASSES__',
];

$validBases = ['__VALID_BASES__'];

$errors = [];
$targets = isset($argv[1]) ? glob($argv[1], GLOB_BRACE) : [];

foreach ($targets as $file) {
    $content = file_get_contents($file);
    preg_match_all('/class=["\']([^"\']+)["\']/', $content, $matches);
    foreach ($matches[1] as $classAttr) {
        foreach (preg_split('/\s+/', trim($classAttr)) as $cls) {
            if (!$cls) continue;
            $block = preg_replace('/(__[^-]+)?(--.+)?$/', '', $cls);
            if (!in_array($block, $validBases, true)) continue;
            if (!in_array($cls, $validClasses, true)) {
                $errors[] = "$file: Unknown design-system class \"$cls\"";
            }
        }
    }
}

if ($errors) {
    foreach ($errors as $e) fwrite(STDERR, "  ERROR $e\n");
    fprintf(STDERR, "[php-design-lint]: %d error(s) — FAIL\n", count($errors));
    exit(1);
}
echo "[php-design-lint]: OK\n";
exit(0);
```

**Remplir les placeholders** depuis le spec reçu :
- `__VALID_BASES__` → liste des `.base` de chaque composant du spec (ex. `'btn', 'card', 'hero'`)
- `__VALID_CLASSES__` → union complète base + éléments + modifiers

Exemple généré depuis un spec avec `btn` + `card` :

```php
$validBases = ['btn', 'card'];
$validClasses = [
    'btn', 'btn__icon', 'btn__label', 'btn--primary', 'btn--secondary',
    'card', 'card__media', 'card__body', 'card__title', 'card--featured',
];
```

Pour `patterns/*.php`, le checker porte aussi une passe structurelle :

- parser le JSON des commentaires `<!-- wp:* {...} -->` et extraire `className` ;
- vérifier les délimiteurs équilibrés et correctement imbriqués ;
- exiger `Title`, `Slug`, `Categories`, `Inserter`, un slug unique et son dernier segment égal au nom ;
- pour `core/button` et `core/navigation-link` portant une classe DS, vérifier le sélecteur dérivé dans
  `assets/css/design/fse-bindings.css` ;
- signaler tout attribut de présentation Gutenberg qui gouverne une propriété déjà déclarée par le
  composant comme conflit `remove-override`.

Une classe valide mais posée sur un wrapper sans binding est une violation : le vocabulaire seul ne
prouve pas que l'élément peint est gouverné.

## Étape 2 — Vérifier le theme.json du thème actif

Résoudre d'abord le stylesheet actif depuis la racine projet avec `pnpm wp eval 'echo get_stylesheet();'`,
puis lire `wp-content/themes/<stylesheet-actif>/theme.json`. Ne jamais supposer un `theme.json` à la
racine : le scaffold ne l'y crée pas et un fichier homonyme pourrait appartenir à un autre outil.
Vérifier ensuite sa cohérence avec `design/tokens.json` :

```bash
# Extraire les color slugs de theme.json
node -e "
const theme = process.env.WP_ACTIVE_THEME;
if (!theme) throw new Error('WP_ACTIVE_THEME missing: resolve it with pnpm wp eval first');
const t = JSON.parse(require('fs').readFileSync(`wp-content/themes/${theme}/theme.json`,'utf8'));
const slugs = (t.settings?.color?.palette || []).map(c => c.slug);
console.log(JSON.stringify(slugs));
"
```

Chaque slug WP doit correspondre à un chemin de token dans le spec. Une divergence est signalée comme warning (non bloquant mais documenté).

Vérifier aussi les **valeurs** contre `Token scales`, sans relire `tokens.json` pour reconstruire une
information absente du spec :

- `settings.color.palette[*].color` ∈ échelle `color.*` canonique ;
- `settings.typography.fontSizes[*].size` ∈ échelle `font.size.*` ;
- `settings.spacing.spacingSizes[*].size` ∈ échelle `space.*` ;
- sur une surface de thème nommée, comparer à l'overlay correspondant, avec repli sur la base pour les
  paths non redéfinis.

Un preset humain hors vocabulaire DS reste autorisé s'il n'est pas déclaré dans le marqueur généré
`settings.custom.design.designTokenPresets`. Un slug déclaré généré dont la valeur sort de l'échelle est
une violation `platform-config`, pas un warning : il prétend dériver du contrat et le contredit.

## Étape 3 — Écrire le rapport et le brancher au gate

Le hook pre-commit n'est **pas** doublé : il exécute la commande unique du gate (`design/skills/enforce/references/gate-wiring.md § La commande unique`). En mode `extend`, c'est la commande existante du marqueur ; en mode `install`, la commande portable. Un checker appelé à côté produirait un second verdict que rien n'agrège.

Le checker écrit son résultat au format `plugins/design/references/gate-config-schema.md § Rapport de pivot`, une entrée par règle de `Declared rules` :

| Règle | Statut à écrire |
|---|---|
| réalisée, aucune violation | `pass` |
| réalisée, violations trouvées | `fail` + une entrée `violations` par occurrence, fichier nommé |
| aucune instance extraite, ou couche indisponible | `unrealized` |

La troisième ligne est le cas courant des règles `stored-content` : sans extraction préalable, il n'y a rien à lire, et un `pass` y serait un mensonge sur du contenu jamais ouvert.

Puis déclarer le rapport dans la configuration du gate :

```json
{
  "pivotReports": [
    { "path": "reports/design-php.json", "command": ["php", "design/lint/check-classes.php", "--report"] }
  ]
}
```

Avec `command`, le runner relance le checker avant de lire — un rapport périmé devient impossible.

## Étape 4 — Tester

```bash
# Sur un template propre
php design/lint/check-classes.php templates/hero.php    # exit 0

# Forger une violation (classe non déclarée) et vérifier exit 1
echo '<div class="btn btn--danger">test</div>' > /tmp/test.php
php design/lint/check-classes.php /tmp/test.php         # exit 1
```

## Sortie attendue

> Linter PHP/WP installé :
> - mode `extend` | `install`, commande unique `<commande>`
> - `<chemin du checker gouverné par le mode>` (classes dans les templates)
> - Rapport écrit à `<Report path>` — réalisées : \<ids\>, non réalisées : \<ids + raison\>
> - Branché dans `gates.config.json § pivotReports` avec `command`
> - Cohérence de la configuration de plateforme : [OK / N warnings]
>
> Retour à design:enforce — gate PHP opérationnel.
