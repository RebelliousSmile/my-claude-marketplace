# 02-render

## Rôle

Prendre la spec neutre produite par `01-define-element` et la rendre dans la stack cible. Impose le gate enforce (lint vert) avant toute clôture. **Refus absolu de livrer si le linter sort en exit 1.**

## Prérequis

- Spec neutre complète et validée (issue de `01-define-element`).
- `design/lint/lint-core.mjs` installé (ou utiliser le plugin source : `plugins/design/skills/enforce/adapters/lint-core.mjs`).

## Étape 1 — Sélectionner l'adaptateur

| Condition | Adaptateur |
|-----------|-----------|
| Stack cible = WordPress FSE ET sc-php disponible | `03-pivot` → sc-php:design-bridge |
| Stack cible = Vue / React / JS ET sc-js disponible | `03-pivot` → sc-js:design-bridge |
| Aucun sc-* disponible OU stack non identifiée | `${CLAUDE_PLUGIN_ROOT}/skills/diffuse/adapters/html-css.md` (baseline) |

Si la stack cible n'a pas été précisée dans `01-define-element`, demander avant de continuer :
> Stack cible pour ce rendu ? (WordPress FSE / Vue / React / HTML+CSS baseline / autre)

Si la branche **baseline** est retenue (dernière ligne du tableau), le rendu produit est contractuellement une **preview non intégrée** (cf. `adapters/html-css.md § Statut de la sortie`), jamais un livrable applicatif. Si une stack JS ou WP est détectée sans que le `sc-<techno>` correspondant soit installé, noter dès cette étape la recommandation conditionnelle : « installer `sc-<techno>` pour un rendu natif `design-bridge` ». Sur une cible statique ou une stack non identifiée, pas de recommandation de pivot — seule la preview + sa note de promotion sont dues (Étape 5).

## Étape 2 — Rendre

Appliquer l'adaptateur sélectionné (voir `${CLAUDE_PLUGIN_ROOT}/skills/diffuse/adapters/html-css.md` pour la baseline, `03-pivot.md` pour le pivot). Produire le fichier de rendu.

## Étape 3 — Gate enforce (obligatoire)

Après avoir produit le rendu, exécuter le lint :

```bash
node design/lint/lint-core.mjs <fichier-rendu>.html
# ou depuis le plugin source :
node plugins/design/skills/enforce/adapters/lint-core.mjs <fichier-rendu>.html
```

### Si exit 0 (gate vert) → clôturer

Annoncer le résultat et proposer la prochaine action.

### Si exit 1 (gate rouge) → corriger, ne PAS clôturer

1. Lire chaque erreur signalée par le linter.
2. Corriger le rendu :
   - Classe non déclarée → remplacer par la classe du manifeste correspondante ou supprimer.
   - Token fantôme → remplacer par un chemin de token valide de `tokens.json`.
3. Re-linter après correction.
4. Répéter jusqu'à exit 0.

**Ne jamais livrer un rendu en exit 1.** Si la correction est bloquée (la spec neutre elle-même référence une classe qui n'est plus dans le manifeste), interrompre et proposer de re-figer via `/design:adjust`.

## Étape 4 — Propagation WP (si applicable)

Si le rendu produit un block pattern WordPress, déléguer la propagation à `${CLAUDE_PLUGIN_ROOT}/skills/enforce/actions/03-lint-instances.md` :
- Le pattern source est mis à jour.
- Le pattern est réimporté en DB via le script d'import du projet.
- Les pages qui utilisent ce pattern sont re-lintées.

Voir `${CLAUDE_PLUGIN_ROOT}/references/wordpress-pitfalls.md § Piège 2 : Block patterns = copies indépendantes`.

## Étape 5 — Livraison

### Rendu natif (pivot)

Annoncer à l'utilisateur :

> Rendu livré : `<fichier>` (<stack>)
> Gate enforce : vert (0 erreur, <N> warning(s))
> Variantes produites : <liste>
>
> [Si WP] Propagation nécessaire → relancer `${CLAUDE_PLUGIN_ROOT}/skills/enforce/actions/03-lint-instances` pour mettre à jour les instances en DB.

### Rendu baseline (preview non intégrée)

Le message de livraison énonce systématiquement les trois éléments du hand-off, jamais un sous-ensemble :

> Rendu livré : `<fichier>` — **preview HTML/CSS non intégrée**, pas un composant applicatif.
> Gate enforce : vert (0 erreur, <N> warning(s)) — **un lint vert n'implique pas un artefact intégré** : ce hand-off est une obligation de livraison additionnelle, pas un relâchement du gate.
> Chemin de promotion : ce rendu deviendrait `<composant/fichier réel envisagé, ex. components/Card.vue ou template-parts/card.php>` une fois porté dans la stack cible.
> [Si stack JS/WP détectée sans pivot installé] Installer `sc-<techno>` pour un rendu natif `design-bridge` (composant Vue/React idiomatique ou block pattern WP) au lieu de cette preview.

## Exemple — rendu baseline d'un `card` (fixture enforce)

Spec neutre d'entrée : composant `card`, variante `featured`, fond `color.semantic.surface`.

Rendu baseline attendu (voir `${CLAUDE_PLUGIN_ROOT}/skills/diffuse/adapters/html-css.md`) :

```html
<article class="card card--featured" role="article">
  <div class="card__media">
    <img src="" alt="Image illustrative">
  </div>
  <div class="card__body">
    <h2 class="card__title">Titre de la carte</h2>
  </div>
</article>
```

Lint sur la fixture `enforce/fixtures/components.json` : `card`, `card--featured`, `card__media`, `card__body`, `card__title` → tous déclarés → exit 0. ✓
