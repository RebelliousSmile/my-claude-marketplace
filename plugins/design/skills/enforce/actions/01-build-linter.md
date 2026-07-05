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
    lint-core.mjs       ← copie du cœur portable (source : ${CLAUDE_PLUGIN_ROOT}/skills/enforce/adapters/lint-core.mjs)
    .lintrc.json        ← config projet (chemins, préfixe BEM optionnel)
```

Créer `design/lint/` s'il n'existe pas.

## Étape 2 — Copier lint-core.mjs

Copier `${CLAUDE_PLUGIN_ROOT}/skills/enforce/adapters/lint-core.mjs` vers `design/lint/lint-core.mjs` dans le projet.

Si le projet gère déjà Node avec un `package.json`, ajouter un script :

```json
{
  "scripts": {
    "lint:design": "node design/lint/lint-core.mjs"
  }
}
```

## Étape 3 — Créer `.lintrc.json`

`design/lint/.lintrc.json` n'est pas consommé directement par `lint-core.mjs` (qui lit ses règles depuis `components.json`/`tokens.json`, jamais depuis un fichier de config séparé) — c'est un **fichier de référence projet**, documentant pour les humains/CI quelles cibles linter et comment calibrer les sévérités du wiring (hook pre-commit, script CI). Il n'existe pas de `.lintrc.json` canonique dans ce plugin ; ce qui suit est le gabarit à créer dans le projet consommateur.

Deux profils selon le mode du contrat (`components.json § mode`, cf. `adjust/references/manifest-schema.md`) :

**Profil `bem`** (wireframes HTML, templates WP FSE) :

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

**Profil `utility-first`** (Tailwind/Vue/React — aucune classe BEM dans le code, `usage` déclaré dans `components.json`) :

```json
{
  "contractDir": "design",
  "targets": ["src/**/*.{vue,jsx,tsx,html}"],
  "severity": {
    "unknownToken": "error",
    "rawHexForbidden": "error",
    "colorNamespace": "error",
    "stateColourIcon": "pivot-only"
  }
}
```

- `contractDir` : chemin vers le répertoire contenant `tokens.json` + `components.json` (relatif à la racine projet).
- `targets` : globs à linter par défaut (utilisés par le hook pre-commit et la CI). En mode `bem`, le HTML de wireframe suffit généralement ; en mode `utility-first`, les cibles doivent couvrir **tous** les fichiers composants du projet — `**/*.{vue,jsx,tsx,html}` — pas seulement le HTML, sans quoi la majorité du code (composants Vue/React) échappe au gate.
- `severity` : calibrage optionnel des sévérités. `rawHexForbidden`/`colorNamespace` sont des `error` de la baseline (§ Rules 3/4 de `lint-core.mjs`) ; `stateColourIcon` reste `pivot-only` — elle est déclarée dans `usage.rules[]` mais `lint-core.mjs` ne l'enforce jamais lui-même (co-occurrence sémantique hors de portée d'un string-scanner, cf. `references/sc-pivot-contract.md`).

## Étape 4 — Vérification de fonctionnement

Demander à l'utilisateur (ou exécuter si le contexte le permet) :

```bash
# Test baseline sur les wireframes existants
node design/lint/lint-core.mjs design/wireframes/<premier-fichier>.html
```

Si exit 0 → installation OK. Si exit 1 → des violations existent avant même de commencer ; les documenter et proposer de jouer `03-lint-instances` pour les résoudre.

Si aucun wireframe n'existe encore, utiliser les fixtures du plugin comme smoke test :

```bash
# Profil bem
node plugins/design/skills/enforce/adapters/lint-core.mjs \
  plugins/design/skills/enforce/fixtures/clean.html

# Profil utility-first
node plugins/design/skills/enforce/adapters/lint-core.mjs \
  plugins/design/skills/enforce/fixtures/utility-clean.html \
  plugins/design/skills/enforce/fixtures/utility
```

## Sortie attendue

> lint-core.mjs installé dans `design/lint/`. Config `.lintrc.json` créée.
> Smoke test : [OK / N erreurs trouvées].
> Prochaine étape : `/design:enforce` → 02-wire-gates.
