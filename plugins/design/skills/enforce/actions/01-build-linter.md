# 01-build-linter

## Rôle

Installer `lint-core.mjs` dans le projet courant et vérifier qu'il tourne correctement sur le contrat figé.

## Prérequis

- `design/tokens.json` et `design/components.json` existent (produits par `adjust`).
- Node.js ≥ 18 disponible dans l'environnement du projet.

## Étape 1 — Créer le répertoire de lint

```
design/
  lint/
    lint-core.mjs       ← copie du cœur portable (source : plugin enforce/adapters/lint-core.mjs)
    .lintrc.json        ← config projet (chemins, préfixe BEM optionnel)
```

Créer `design/lint/` s'il n'existe pas.

## Étape 2 — Copier lint-core.mjs

Copier `enforce/adapters/lint-core.mjs` vers `design/lint/lint-core.mjs` dans le projet.

Si le projet gère déjà Node avec un `package.json`, ajouter un script :

```json
{
  "scripts": {
    "lint:design": "node design/lint/lint-core.mjs"
  }
}
```

## Étape 3 — Créer `.lintrc.json`

```json
{
  "contractDir": "design",
  "targets": ["design/wireframes/**/*.html"],
  "severity": {
    "unknownClass": "error",
    "unknownToken": "error",
    "a11yRole": "warning",
    "backgroundMismatch": "warning"
  }
}
```

- `contractDir` : chemin vers le répertoire contenant `tokens.json` + `components.json` (relatif à la racine projet).
- `targets` : globs HTML à linter par défaut (utilisés par le hook pre-commit et la CI).
- `severity` : calibrage optionnel des sévérités.

## Étape 4 — Vérification de fonctionnement

Demander à l'utilisateur (ou exécuter si le contexte le permet) :

```bash
# Test baseline sur les wireframes existants
node design/lint/lint-core.mjs design/wireframes/<premier-fichier>.html
```

Si exit 0 → installation OK. Si exit 1 → des violations existent avant même de commencer ; les documenter et proposer de jouer `03-lint-instances` pour les résoudre.

Si aucun wireframe n'existe encore, utiliser les fixtures du plugin comme smoke test :

```bash
node plugins/design/skills/enforce/adapters/lint-core.mjs \
  plugins/design/skills/enforce/fixtures/clean.html
```

## Sortie attendue

> lint-core.mjs installé dans `design/lint/`. Config `.lintrc.json` créée.
> Smoke test : [OK / N erreurs trouvées].
> Prochaine étape : `/design:enforce` → 02-wire-gates.
