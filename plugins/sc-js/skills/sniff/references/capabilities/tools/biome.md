---
---

# Biome — linter et formatter JS/TS

Applicable quand `@biomejs/biome` est détecté en devDependencies.

## Config minimale recommandée (`biome.json`)

```json
{
  "$schema": "https://biomejs.dev/schemas/1.x/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  }
}
```

## Règles prioritaires

- `correctness` : toutes activées par `recommended` — erreurs logiques certaines (variables inutilisées, imports non résolus)
- `suspicious` : toutes activées par `recommended` — patterns probablement incorrects (comparaisons avec NaN, double negation…)
- `style` : sélectif — activer uniquement les règles consensuelles (`useConst`, `useTemplate`), désactiver les préférences stylistiques subjectives

## Intégration CI

Utiliser `biome ci` (pas `biome check`) :

| Commande | Comportement |
|---|---|
| `biome ci` | Exit code 1 si erreurs **ou** warnings — ne modifie pas les fichiers |
| `biome check` | Interactif, peut modifier les fichiers — **à éviter en CI** |

Commande CI recommandée :

```bash
pnpm biome ci --reporter=github
```

Le flag `--reporter=github` produit des annotations directement dans GitHub Actions. Ne pas utiliser `--write` en CI — les modifications de fichiers n'entrent pas dans le commit et passent silencieusement.

## Pre-commit

```bash
# Hook pre-commit direct
biome check --write --unsafe

# Avec lint-staged
{ "*.{js,ts,svelte}": "biome check --write" }
```

## VS Code

- Extension officielle : `biomejs.biome`
- `.vscode/settings.json` :

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true
}
```

Désactiver ESLint et Prettier si Biome les remplace — deux formatters actifs sur le même fichier produisent des conflits.

## Anti-patterns

| Anti-pattern | Problème |
|---|---|
| `// biome-ignore lint/correctness/xxx:` sans commentaire justificatif | Les ignores sans raison accumulent de la dette silencieuse — impossible de savoir si l'ignore est encore valide |
| `"all": false` sur `correctness` ou `suspicious` | Désactive les protections les plus critiques ; préférer une désactivation ciblée règle par règle |
| Formatter désactivé en CI mais activé localement | Divergence de format entre développeurs — le CI ne rejette pas les fichiers mal formatés |
| Glob `ignore` trop large (`"**/*"`, `"src/**"`) | Exclut tout le code source ; n'ignorer que les fichiers générés (`build/`, `dist/`, `.svelte-kit/`) |
| Biome et Prettier actifs simultanément | Formatages contradictoires sur le même fichier — choisir l'un ou l'autre |
