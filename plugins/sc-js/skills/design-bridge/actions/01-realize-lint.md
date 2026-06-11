# 01-realize-lint (sc-js)

## Rôle

Matérialiser un linter JS idiomatique à partir du spec d'enforcement reçu de `design:enforce/04-pivot`. Génère une règle ESLint (ou Biome si le projet l'utilise) dérivant ses ensembles valides **strictement du spec** — aucune liste codée en dur.

## Input attendu (spec d'enforcement)

```
## Design enforcement spec
Source: design/tokens.json + design/components.json
Version: <semver>
Valid class sets: [...]
Token paths: [...]
a11y requirements: [...]
Enforcement target: { language: js, targets: [...] }
```

## Détection de l'outillage

| Indice | Outillage choisi |
|--------|-----------------|
| `biome.json` ou `@biomejs/biome` dans `package.json` | Biome (lint rule via plugin) |
| `.eslintrc.*` ou `eslint.config.*` présents | ESLint (règle custom) |
| Aucun | Générer une config ESLint minimale |

## Approche ESLint (principale)

### 1a — Générer la règle ESLint

Créer `design/lint/eslint-design-rule.mjs` :

```js
// eslint-design-rule.mjs — rule générée depuis design/components.json
// Ne pas éditer manuellement — régénérer via /design:enforce

// GENERATED from enforcement spec — no hard-coded values
const VALID_CLASSES = new Set([
  // Remplacer par les classes du spec
  '__VALID_CLASSES__',
]);

const KNOWN_BASES = new Set([
  // Remplacer par les bases du spec
  '__VALID_BASES__',
]);

export default {
  meta: {
    type: 'problem',
    docs: { description: 'Enforce design system class vocabulary from manifest' },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.name !== 'className') return;
        const value = node.value;
        if (!value || value.type !== 'Literal') return;
        for (const cls of String(value.value).trim().split(/\s+/)) {
          if (!cls) continue;
          const block = cls.split('__')[0].split('--')[0];
          if (!KNOWN_BASES.has(block)) continue;
          if (!VALID_CLASSES.has(cls)) {
            context.report({
              node,
              message: `Unknown design-system class "${cls}" (block "${block}" known but element/modifier not in manifest)`,
            });
          }
        }
      },
    };
  },
};
```

Remplir `__VALID_CLASSES__` et `__VALID_BASES__` depuis le spec reçu.

### 1b — Enregistrer la règle dans la config ESLint du projet

**ESLint flat config (`eslint.config.mjs`) :**

```js
import designRule from './design/lint/eslint-design-rule.mjs';

export default [
  {
    plugins: { design: { rules: { 'class-vocab': designRule } } },
    rules: { 'design/class-vocab': 'error' },
    files: ['**/*.jsx', '**/*.tsx', '**/*.vue'],
  },
];
```

**ESLint legacy (`.eslintrc.cjs`) :** adapter selon la configuration existante du projet.

## Approche Biome (si `biome.json` présent)

Biome ne supporte pas encore les plugins custom stables. Fallback : générer le script Node.js `design/lint/lint-core.mjs` (déjà fourni par `design:enforce`) et ajouter un script dans `package.json` :

```json
{
  "scripts": {
    "lint:design": "node design/lint/lint-core.mjs"
  }
}
```

Signaler que pour Biome, la règle native n'est pas disponible ; lint-core.mjs fait office de linter design.

## Étape 2 — Wiring pre-commit

Étendre le hook `scripts/hooks/pre-commit` (câblé par enforce/02-wire-gates) :

```bash
# Ajouter dans scripts/hooks/pre-commit

CHANGED_JSX=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(jsx|tsx|vue)$')
if [ -n "$CHANGED_JSX" ]; then
  echo "[design lint js] Checking staged JSX/Vue files..."
  pnpm eslint --rule 'design/class-vocab: error' $CHANGED_JSX || FAIL=1
fi
```

## Étape 3 — Tester

```bash
# Vérifier que la règle détecte une violation
echo 'export default () => <div className="btn btn--danger">test</div>;' > /tmp/test.jsx
pnpm eslint --rule 'design/class-vocab: error' /tmp/test.jsx  # doit reporter 1 erreur
```

## Sortie attendue

> Règle ESLint `design/class-vocab` installée.
> `scripts/hooks/pre-commit` étendu (JS/JSX/Vue).
>
> Retour à design:enforce — gate JS opérationnel.
