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

### 1a-bis — Cibles autres que React

Le bloc ci-dessus est l'**implémentation de référence (archétype A / React)**. Les autres frameworks **ne se traitent pas en renommant le nœud** : le point d'entrée du parser, le nom de l'attribut et l'angle mort dynamique diffèrent. Trois archétypes couvrent l'ensemble des cibles.

#### Archétype A — attribut dans un AST de template

Même logique de visiteur que le bloc React, paramètres différents :

| Cible | Parser ESLint | Point d'entrée | Nœud · attribut · valeur | Angle mort dynamique |
|---|---|---|---|---|
| React/JSX | espree / typescript-eslint | visiteur direct dans `create()` | `JSXAttribute` · `className` · `value` (`Literal`) | `className={expr}` |
| Astro | `astro-eslint-parser` | visiteur direct | `JSXAttribute` · **`class`** (pas `className`) · `value` | `class:list`, `{expr}` |
| Vue SFC | `vue-eslint-parser` | **`context.sourceCode.parserServices.defineTemplateBodyVisitor()`** | `VAttribute` · `key.name === 'class'` · `value.value` | `:class` / `v-bind:class` (`VExpressionContainer`) |
| Svelte | `svelte-eslint-parser` | visiteur direct | `SvelteAttribute` · `key.name === 'class'` · `value[]` | directives `class:`, `{expr}` |
| HTML statique / Alpine | `@html-eslint/parser` | visiteur direct | `Attribute` · `key.value === 'class'` · `value.value` | `:class` / `x-bind:class` |

Normatif :
- **Vue est le seul à *exiger* `defineTemplateBodyVisitor`** — un visiteur `VAttribute` posé directement dans `create()` ne se déclenche jamais.
- **Astro et Vue/Svelte/HTML utilisent `class`, pas `className`** — ne pas copier la garde React telle quelle.
- **Alpine n'a pas de parser propre** : ses classes statiques sont l'attribut HTML `class` standard → archétype HTML. Seul le dynamique passe par `:class`/`x-bind:class`.
- **Déclarer explicitement l'angle mort des liaisons dynamiques** dans le message de sortie plutôt que de laisser croire à une couverture totale.
- Vérifier le nom exact du nœud sur astexplorer.net (parser sélectionné) avant de figer — les parsers tiers évoluent.

#### Archétype B — vanilla JS (aucun attribut, manipulation DOM)

Pas de nœud attribut : cibler les appels et affectations DOM.

```js
// visiteurs à ajouter au même create() pour le vanilla JS
'CallExpression[callee.property.name=/^(add|remove|toggle|replace)$/]'(node) {
  // el.classList.add('...') — vérifier que callee.object porte .classList
  const obj = node.callee.object;
  if (!(obj?.type === 'MemberExpression' && obj.property.name === 'classList')) return;
  for (const arg of node.arguments) {
    if (arg.type === 'Literal') checkClass(context, node, String(arg.value));
  }
},
'AssignmentExpression[left.property.name="className"]'(node) {
  // el.className = '...'
  if (node.right.type === 'Literal') {
    for (const cls of String(node.right.value).trim().split(/\s+/)) checkClass(context, node, cls);
  }
},
```

Cibles : `classList.add/remove/toggle/replace(...)`, `.className = '...'`, `setAttribute('class', '...')`. Angle mort : chaînes calculées et template literals (`` html`<div class="...">` ``) → relèvent de l'archétype C.

#### Archétype C — scanner de chaînes (`lint-core.mjs`), fallback

Quand aucune surface n'est parseable par ESLint (fichiers `.html` sans `@html-eslint/parser`, HTML de template littéral, ou projet Biome) : réutiliser `design/lint/lint-core.mjs` (fourni par `design:enforce`), qui scanne `class="..."` par regex. Alpine/vanilla en `.html` sans parser HTML atterrissent ici. **Signaler que le scanner ne suit pas les liaisons dynamiques.**

### 1b — Enregistrer la règle dans la config ESLint du projet

**ESLint flat config (`eslint.config.mjs`) :**

```js
import designRule from './design/lint/eslint-design-rule.mjs';

export default [
  {
    plugins: { design: { rules: { 'class-vocab': designRule } } },
    rules: { 'design/class-vocab': 'error' },
    files: ['**/*.jsx', '**/*.tsx', '**/*.vue', '**/*.svelte', '**/*.astro', '**/*.html', '**/*.js'],
  },
];
```

**Parser requis par cible (archétype A) :** sans override de `languageOptions.parser` sur le bloc `files` concerné, ESLint **ne parse pas** `.vue`/`.svelte`/`.astro`/`.html` et la règle est silencieusement inactive. Ajouter un bloc de config par cible détectée :

```js
import vueParser from 'vue-eslint-parser';
// { files: ['**/*.vue'], languageOptions: { parser: vueParser }, ... }
// idem : svelte-eslint-parser, astro-eslint-parser, @html-eslint/parser
```

N'installer/enregistrer que les parsers des cibles réellement présentes dans le projet (issues de `Enforcement target`). Ne pas enrôler `.js` si le projet n'a pas de vanilla (archétype B), sinon faux positifs sur du JS applicatif.

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

Étendre le hook `scripts/hooks/pre-commit` (câblé par enforce/02-wire-gates). Construire l'extension glob **depuis les `targets` du spec reçu** — même règle qu'à l'étape 1a-bis : n'inclure `js` que si l'archétype B (vanilla) est présent parmi les targets, sinon exclure `\.js$` du pattern pour éviter les faux positifs sur du JS applicatif sans classes DOM :

```bash
# Ajouter dans scripts/hooks/pre-commit
# EXT_PATTERN dérivé des `targets` du spec d'enforcement — ne pas coder en dur.
# Exemple si targets = [jsx, vue] (pas de vanilla) : EXT_PATTERN='\.(jsx|vue)$'
# Exemple si targets inclut vanilla (archétype B) : EXT_PATTERN='\.(jsx|vue|js)$'

CHANGED_JS=$(git diff --cached --name-only --diff-filter=ACM | grep -E "$EXT_PATTERN")
if [ -n "$CHANGED_JS" ]; then
  echo "[design lint js] Checking staged component files..."
  pnpm eslint --rule 'design/class-vocab: error' $CHANGED_JS || FAIL=1
fi
```

## Étape 3 — Tester

```bash
# Vérifier que la règle détecte une violation
echo 'export default () => <div className="btn btn--danger">test</div>;' > /tmp/test.jsx
pnpm eslint --rule 'design/class-vocab: error' /tmp/test.jsx  # doit reporter 1 erreur
```

## Sortie attendue

> Règle ESLint `design/class-vocab` installée — cibles couvertes : <React/Vue/Svelte/Astro/Alpine-HTML/vanilla selon détection>.
> Parsers enrôlés : <liste>. Angles morts non couverts : <liaisons dynamiques `:class`/`class:list`/`x-bind:class`, chaînes calculées>.
> `scripts/hooks/pre-commit` étendu.
>
> Retour à design:enforce — gate JS opérationnel.
