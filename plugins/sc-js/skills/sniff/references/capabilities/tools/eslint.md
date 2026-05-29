---
---

# ESLint — linter JS/TS

Applicable quand `eslint` est détecté en devDependencies. Pour un projet qui utilise Biome à la place, voir `tools/biome.md` — ne pas faire tourner les deux linters sur les mêmes fichiers.

## Flat config (`eslint.config.js`) — ESLint 9+

Depuis ESLint 9, la flat config est le défaut (`.eslintrc.*` est legacy) :

```js
import js from '@eslint/js'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
    },
  },
  { ignores: ['dist/', 'build/', 'coverage/'] },
]
```

- `@eslint/js` fournit `js.configs.recommended` — la base à étendre, jamais à réécrire à la main.
- `globals` déclare les variables d'environnement (browser/node) ; sans lui, `no-undef` produit des faux positifs sur `window`, `process`, etc.
- Les `ignores` se déclarent dans un objet de config dédié (sans autre clé), pas via un `.eslintignore` (déprécié en flat config).

## Règles prioritaires

- `no-undef` / `no-unused-vars` : erreurs logiques certaines — garder en `error`/`warn`, jamais `off`.
- Préférer `js.configs.recommended` comme socle plutôt qu'une liste de règles maison qui dérive.
- Activer `eslint-config-prettier` (en dernier) si Prettier formate, pour désactiver les règles stylistiques d'ESLint qui entrent en conflit.

## Intégration CI

```bash
eslint . --max-warnings=0
```

| Flag | Comportement |
|---|---|
| `--max-warnings=0` | Exit code 1 si **un seul** warning — empêche l'accumulation silencieuse |
| `--fix` | Corrige l'auto-fixable — **ne pas utiliser en CI** (modifs non commitées) |
| `--cache` | Cache local, accélère les runs répétés en dev |

## Pre-commit

```bash
# Avec lint-staged
{ "*.{js,ts}": "eslint --fix --max-warnings=0" }
```

## Anti-patterns

| Anti-pattern | Problème |
|---|---|
| `// eslint-disable-next-line` sans nom de règle ni justification | Désactive **toutes** les règles sur la ligne et accumule de la dette opaque ; toujours cibler la règle + commenter |
| `rules: { ... 'off' }` sur `no-undef`/`no-unused-vars` | Supprime les protections les plus utiles ; désactiver de façon ciblée, pas globale |
| ESLint **et** Biome actifs sur les mêmes fichiers | Diagnostics redondants/contradictoires — choisir l'un ou l'autre |
| `--fix` en CI | Les corrections n'entrent pas dans le commit et passent silencieusement |
| Règles de format (`indent`, `quotes`…) actives avec Prettier | Conflits de formatage ; déléguer le format à Prettier + `eslint-config-prettier` |
| `.eslintrc.*` conservé avec ESLint 9 en flat config | Deux systèmes de config concurrents — migrer vers `eslint.config.js` |
