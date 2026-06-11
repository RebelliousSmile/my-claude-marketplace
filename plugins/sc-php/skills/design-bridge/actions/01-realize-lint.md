# 01-realize-lint (sc-php)

## Rôle

Matérialiser un linter PHP/WP idiomatique à partir du spec d'enforcement reçu de `design:enforce/04-pivot`. Le linter dérive ses règles **strictement** du spec (valid class sets + token paths) — aucune liste codée en dur.

## Input attendu (spec d'enforcement)

```
## Design enforcement spec
Source: design/tokens.json + design/components.json
Version: <semver>
Valid class sets: [...]
Token paths: [...]
a11y requirements: [...]
Enforcement target: { language: php, targets: [...] }
```

Vérifier que le spec est présent avant de continuer. Si absent, signaler que `01-realize-lint` est invoqué uniquement via `design:enforce/04-pivot`.

## Stratégie de lint PHP/WP

WordPress FSE combine PHP (templates), JSON (block patterns, theme.json) et HTML (contenu en DB). La stratégie est en deux couches :

| Couche | Outil | Cible |
|--------|-------|-------|
| HTML/classes dans templates PHP | Script PHP checker | Fichiers `.php` contenant des attributs `class="..."` |
| Contenu HTML en DB | `lint-core.mjs` existant | Via export `wp post get` (voir `wordpress.md`) |
| theme.json (palette WP) | Vérification JSON | Cohérence avec tokens.json |

## Étape 1 — Générer le PHP class checker

Créer `design/lint/check-classes.php` dans le projet :

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

## Étape 2 — Vérifier theme.json

Si le projet a un `theme.json` (WP FSE), vérifier la cohérence entre les tokens de palette et `design/tokens.json` :

```bash
# Extraire les color slugs de theme.json
node -e "
const t = JSON.parse(require('fs').readFileSync('theme.json','utf8'));
const slugs = (t.settings?.color?.palette || []).map(c => c.slug);
console.log(JSON.stringify(slugs));
"
```

Chaque slug WP doit correspondre à un chemin de token dans le spec. Une divergence est signalée comme warning (non bloquant mais documenté).

## Étape 3 — Wiring pre-commit

Ajouter la vérification PHP au hook pre-commit existant (`scripts/hooks/pre-commit` câblé par enforce/02-wire-gates) :

```bash
# Ajouter dans scripts/hooks/pre-commit après le bloc HTML existant

CHANGED_PHP=$(git diff --cached --name-only --diff-filter=ACM | grep '\.php$')
if [ -n "$CHANGED_PHP" ]; then
  echo "[design lint php] Checking staged PHP files..."
  for f in $CHANGED_PHP; do
    php design/lint/check-classes.php "$f" || FAIL=1
  done
fi
```

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
> - `design/lint/check-classes.php` (classes PHP templates)
> - `scripts/hooks/pre-commit` étendu (PHP)
> - Cohérence theme.json : [OK / N warnings]
>
> Retour à design:enforce — gate PHP opérationnel.
