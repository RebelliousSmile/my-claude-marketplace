# Render

## Rôle

Prendre la spec neutre produite par `01-define-element` et la rendre dans la stack cible. Impose le gate enforce (lint vert) avant toute clôture. **Refus absolu de livrer si le linter sort en exit 1.**

## Prérequis

- Spec neutre complète et validée (issue de `01-define-element`).
- `design/lint/lint-core.mjs` installé (ou utiliser le plugin source : `plugins/design/skills/enforce/adapters/lint-core.mjs`).
- Contrat figé (`release.json` présent) — les artefacts dérivés n'existent qu'à partir du figeage.

## Étape 0 — Gate de dérive (obligatoire)

Rendre sur des dérivés périmés, c'est valider contre un état que les sources ont quitté.

```bash
python ${DESIGN_PLUGIN_ROOT}/tools/generate.py --check --contract design/
```

| Exit | Sens | Suite |
|---|---|---|
| 0 | dérivés à jour | rendre |
| 1 | dérive — retouche manuelle, ou source non régénérée | **stop** : le message nomme le fichier ; corriger la **source**, relancer `generate.py --contract design/` |
| 2 | contrat invalide | **stop** → invoquer `design:adjust` |
| 3 | contrat 1.x | **stop** → `adjust/03-migrate` |

Aucun drapeau ne neutralise un exit 1.

## Étape 1 — Sélectionner l'adaptateur

L'adaptateur se choisit sur **le langage dans lequel l'artefact doit exister**, jamais sur le nom du framework ou de la plateforme : c'est le langage qui décide quel réceptacle sait l'écrire.

| Condition | Adaptateur |
|-----------|-----------|
| Langage de la cible identifié ET `sc-<langage>` installé | `03-pivot` → `sc-<langage>:design-bridge` |
| Langage identifié, `sc-<langage>` absent OU langage non identifié | `${DESIGN_PLUGIN_ROOT}/skills/diffuse/adapters/html-css.md` (baseline) |

Si le langage de la cible n'a pas été précisé dans `01-define-element`, demander avant de continuer :
> Dans quel langage l'artefact doit-il exister ? (langage de template ou de composant du projet / HTML+CSS baseline)

Si la branche **baseline** est retenue, le rendu produit est contractuellement une **preview non intégrée** (cf. `adapters/html-css.md § Statut de la sortie`), jamais un livrable applicatif. Si un langage de cible est identifié sans que le `sc-<langage>` correspondant soit installé, noter dès cette étape la recommandation conditionnelle : « installer `sc-<langage>` pour un rendu natif `design-bridge` ». Sur une cible statique ou un langage non identifié, pas de recommandation de pivot — seule la preview + sa note de promotion sont dues (Étape 5).

## Étape 2 — Rendre

Appliquer l'adaptateur sélectionné (voir `${DESIGN_PLUGIN_ROOT}/skills/diffuse/adapters/html-css.md` pour la baseline, `03-pivot.md` pour le pivot). Produire le fichier de rendu.

## Étape 3 — Gate enforce (obligatoire)

Après avoir produit le rendu, exécuter le lint :

```bash
node design/lint/lint-core.mjs <fichier-rendu>.html --contract design
# ou depuis le plugin source :
node plugins/design/skills/enforce/adapters/lint-core.mjs <fichier-rendu>.html --contract design
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

**Ne jamais livrer un rendu en exit 1.** Si la correction est bloquée (la spec neutre elle-même référence une classe qui n'est plus dans le manifeste), interrompre et proposer de re-figer en invoquant `design:adjust`.

## Étape 4 — Propagation aux instances (si applicable)

Applicable dès que le rendu est **recopié** dans un magasin de contenu au lieu d'y être référencé : chaque instance est alors une copie indépendante, que corriger la source ne met pas à jour. C'est le type d'enforcement `stored-content` (`${DESIGN_PLUGIN_ROOT}/references/enforcement-registry.md`).

Déléguer la propagation à `${DESIGN_PLUGIN_ROOT}/skills/enforce/actions/03-lint-instances.md` :
- La source du rendu est mise à jour.
- Les instances déjà stockées sont réécrites depuis cette source.
- Les instances sont re-lintées après réécriture.

Une source corrigée sans propagation laisse le gate vert sur les fichiers et faux sur le contenu servi.

## Étape 5 — Livraison

### Rendu natif (pivot)

Annoncer à l'utilisateur :

> Rendu livré : `<fichier>` (<langage de la cible>)
> Gate enforce : vert (0 erreur, <N> warning(s))
> Variantes produites : <liste>
>
> [Si le rendu est recopié en instances] Propagation nécessaire → relancer `${DESIGN_PLUGIN_ROOT}/skills/enforce/actions/03-lint-instances.md` pour réécrire les instances stockées.

### Rendu baseline (preview non intégrée)

Le message de livraison énonce systématiquement les trois éléments du hand-off, jamais un sous-ensemble :

> Rendu livré : `<fichier>` — **preview HTML/CSS non intégrée**, pas un composant applicatif.
> Gate enforce : vert (0 erreur, <N> warning(s)) — **un lint vert n'implique pas un artefact intégré** : ce hand-off est une obligation de livraison additionnelle, pas un relâchement du gate.
> Chemin de promotion : ce rendu deviendrait `<chemin réel du composant ou du template dans le projet>` une fois porté dans le langage de la cible.
> [Si un langage de cible est identifié sans pivot installé] Installer `sc-<langage>` pour un rendu natif `design-bridge` — artefact idiomatique du langage — au lieu de cette preview.

## Exemple — rendu baseline d'un `card` (fixture enforce)

Spec neutre d'entrée : composant `card`, variante `featured`, fond `color.semantic.surface`.

Rendu baseline attendu (voir `${DESIGN_PLUGIN_ROOT}/skills/diffuse/adapters/html-css.md`) :

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
