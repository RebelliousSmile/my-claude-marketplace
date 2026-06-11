# 04-pivot

## Rôle

Détecter le langage du projet courant. Si un `sc-<techno>:design-bridge` est disponible pour ce langage, émettre le spec d'enforcement (cf `design/references/sc-pivot-contract.md`) et relayer à `sc-<techno>:design-bridge`. Sinon, rester sur la baseline `lint-core.mjs` et le signaler.

## Prérequis

- `design/tokens.json` + `design/components.json` figés.
- `lint-core.mjs` installé (baseline disponible).

## Étape 1 — Détecter le langage

Indices par ordre de priorité :

| Indice | Interprétation |
|--------|---------------|
| `package.json` + `pnpm-lock.yaml` présents | JavaScript/TypeScript → `sc-js` |
| `composer.json` présent | PHP → `sc-php` |
| `pyproject.toml` ou `requirements.txt` | Python → `sc-python` (non implémenté) |
| `Cargo.toml` | Rust → `sc-rust` (non implémenté) |
| WordPress (`functions.php`, `wp-env.json`) | PHP → `sc-php` |
| Aucun indicateur clair | Inconnu → baseline uniquement |

Un projet peut combiner plusieurs stacks (ex. PHP + JS). Dans ce cas, émettre un spec pour chaque `sc-*` disponible.

## Étape 2 — Vérifier la disponibilité du réceptacle

Les réceptacles implémentés :
- `/sc-php:design-bridge` — PHP/WordPress (sc-php v0.5.0+)
- `/sc-js:design-bridge` — JavaScript/TypeScript/Vue/React (sc-js v0.7.0+)

Si le plugin sc-php ou sc-js n'est pas installé dans la session → dégradation gracieuse sur baseline.

## Étape 3a — Si réceptacle disponible : émettre le spec

Construire le spec d'enforcement depuis `design/components.json` + `design/tokens.json` selon le format de `design/references/sc-pivot-contract.md § Spec d'enforcement` :

```
## Design enforcement spec

Source: design/tokens.json + design/components.json
Version: <manifest.$version>

### Valid class sets
Base classes: <liste des comp.base>
All valid classes: <union base + elements + modifiers>

### Token paths
<liste des chemins aplatis depuis tokens.json>

### a11y requirements
<par composant avec .a11y.requires non vide>

### Enforcement target
Language: <php | js>
Targets: <globs détectés ou fournis>

### Request
[texte du spec pivot-contract.md]
```

Puis appeler `/sc-<techno>:design-bridge` avec ce spec en contexte.

## Étape 3b — Si réceptacle absent : signaler et rester sur la baseline

```
Pivot non disponible pour <langage> : sc-<techno>:design-bridge n'est pas installé.
Enforcement assuré par la baseline lint-core.mjs (portable, sans dépendance native).
Pour une réalisation idiomatique native, installer le plugin sc-<techno> et re-jouer /design:enforce.
```

La baseline reste active et fonctionnelle — ce n'est pas une erreur.

## Sortie attendue

**Avec pivot** :
> Pivot activé vers `sc-<techno>:design-bridge`.
> Spec d'enforcement émis (version manifeste : <X.Y.Z>).
> → Réalisation native en cours via sc-<techno>.

**Sans pivot** :
> Baseline lint-core.mjs active. Aucun sc-<techno> disponible pour <langage>.
> Gate : `node design/lint/lint-core.mjs <cible> exits 0`.
