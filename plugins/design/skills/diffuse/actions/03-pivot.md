# 03-pivot

## Rôle

Détecter la stack cible. Si un `sc-<techno>:design-bridge` est disponible pour cette stack, émettre le spec de rendu (cf `${CLAUDE_PLUGIN_ROOT}/references/sc-pivot-contract.md`) et relayer à `sc-<techno>:design-bridge`. Sinon, utiliser la baseline `${CLAUDE_PLUGIN_ROOT}/skills/diffuse/adapters/html-css.md` et le signaler.

Consomme `${CLAUDE_PLUGIN_ROOT}/references/wordpress-pitfalls.md` pour le cas WordPress FSE.

## Prérequis

- Spec neutre complète (issue de `01-define-element`).
- Stack cible identifiée (précisée par `02-render`).

## Étape 1 — Mapper la stack vers le sc-*

| Stack cible | sc-* | Statut |
|-------------|------|--------|
| WordPress FSE (block pattern, theme template) | `/sc-php:design-bridge` | disponible (sc-php v0.5.0+) |
| Vue.js, React, Nuxt, Next.js | `/sc-js:design-bridge` | disponible (sc-js v0.7.0+) |
| Python templates (Django/Jinja) | `sc-python:design-bridge` | non encore implémenté |
| Rust templates | `sc-rust:design-bridge` | non encore implémenté |
| HTML+CSS pur | baseline (pas de pivot) | — |

## Étape 2a — Si sc-* disponible : émettre le spec de rendu

Construire le spec de rendu depuis la spec neutre, selon le format de `${CLAUDE_PLUGIN_ROOT}/references/sc-pivot-contract.md § Spec de rendu` :

```
## Design render spec

Source: design/tokens.json + design/components.json
Version: <manifest.$version>

### Component to render
Name: <canonical-name>
Base: <.base>
Elements:
  <label>: <BEM-element>
  ...
Modifiers:
  <label>: <BEM-modifier>
  ...
Backgrounds: [<token.path>, ...]
a11y: { role: <role>, requires: [<attr>, ...] }

### Variants to produce
<liste des variantes de la spec neutre ou "toutes">

### Render target
Language: <php-fse-block | vue | react | html-css>
Output dir: <design/components/<canonical-name>/ ou autre cible précisée>

### Request
[Texte du contrat de pivot — § Spec de rendu]
```

Puis appeler `/sc-<techno>:design-bridge` avec ce spec en contexte.

**Cas WordPress spécifique** : avant d'appeler `sc-php:design-bridge`, lire `${CLAUDE_PLUGIN_ROOT}/references/wordpress-pitfalls.md` et injecter les contraintes WP dans le spec :
- Classes appariées `has-*` : documenter la décision (déclarer dans le manifeste ou exclure du lint).
- CLI conteneur obligatoire pour la propagation en DB.
- `wp eval-file` deprecated → utiliser `wp eval` avec `file_get_contents`.
- Propagation block patterns : réimporter via `tools/import/` après chaque modification.

## Étape 2b — Si sc-* absent : baseline + signal

Utiliser `${CLAUDE_PLUGIN_ROOT}/skills/diffuse/adapters/html-css.md` et informer :

```
Pivot non disponible pour <stack> : sc-<techno>:design-bridge n'est pas installé.
Rendu assuré par la baseline HTML+CSS (portable, universel).
Pour un rendu natif idiomatique <stack>, installer sc-<techno> et re-jouer /design:diffuse.
```

La baseline est fonctionnelle — ce n'est pas une erreur, seulement une dégradation gracieuse.

## Étape 3 — Confirmer le gate

Que le rendu vienne du pivot ou de la baseline, `02-render` impose le gate enforce sur la sortie. `03-pivot` ne clôture pas lui-même — il remet la main à `02-render` pour le lint final.

Si le rendu du pivot sort en exit 1, corriger en appliquant uniquement des classes et tokens du manifeste, puis re-linter.

## Sortie attendue

**Avec pivot** :
> Spec de rendu émis vers `sc-<techno>:design-bridge` (stack: <stack>, composant: <name>).
> Retour de rendu → gate enforce en cours.

**Sans pivot** :
> Baseline HTML+CSS — aucun sc-<techno> disponible pour <stack>.
> → Rendu via `adapters/html-css.md`, gate enforce en cours.
