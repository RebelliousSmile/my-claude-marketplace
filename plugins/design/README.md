# design

*Plugin de design system en entonnoir : du brief ou de la référence jusqu'à des éléments répétables vérifiés par un gate de lint.*

Principe directeur : **le gate de lint est la référence** — pas la charte (décorative), pas les maquettes (divergentes), mais le vocabulaire fermé `components.json` vérifiable à chaque livraison.

## Flux

```
define → destructure → adjust → enforce → diffuse
  ↓           ↓            ↓         ↓         ↓
poser      challenger     figer    verrou    produire
```

- **define** — pose, écoute, construit la matière : tokens de travail, inventaire composants candidat, charte brouillon. Depuis une référence (screenshot, Figma, URL) ou un brief. Peut injecter le profil mobile-first/a11y optionnel.
- **destructure** — challenge la direction avant de la figer : critique des angles (a11y, cohérence, mobilité…), pistes alternatives. Pendant design de `aidd-refine:challenge`.
- **adjust** — arbitre les maquettes divergentes (motif dominant gagne ; gate humain sur les cas non tranchables) et **fige le contrat 3 couches**.
- **enforce** — dérive un linter portable (`lint-core.mjs`) du contrat figé, câble 3 gates (règles de génération, success_condition des plans, pre-commit). Pivot vers `sc-php:design-bridge` ou `sc-js:design-bridge` pour une réalisation native idiomatique.
- **diffuse** — produit des éléments répétables (spec neutre + baseline HTML/CSS ou pivot sc-*). **Refus absolu de livrer si lint exit 1.**

## Contrat 3 couches (figé à `adjust`)

| Couche | Fichier | Rôle |
|--------|---------|------|
| 1 — Tokens | `design/tokens.json` (W3C DTCG) | Valeurs nommées, source unique |
| 2 — Manifeste composants | `design/components.json` (vocabulaire fermé) | Classes BEM déclarées ; base du linter |
| 3 — Charte | `design/design-system.md` | Prose normative, fondations, règles prose |

**Règle cardinale : une valeur vit dans une seule couche.** Toute couleur dans un composant = token `color.*`. Toute classe dans le HTML = déclarée dans `components.json`.

## Skills

| Skill | Invocation | Description |
|-------|-----------|-------------|
| `define` | `/design:define` | Extraction depuis références/brief → tokens + inventaire + charte brouillon. Profil mobile-first optionnel. |
| `destructure` | `/design:destructure` | Challenge la direction design — critique multi-angles + pistes alternatives. |
| `adjust` | `/design:adjust` | Arbitrage maquettes + figeage du contrat 3 couches (tokens.json · components.json · design-system.md). |
| `enforce` | `/design:enforce` | Linter portable dérivé du contrat · 3 gates · pivot sc-php/sc-js · lint instances/DB. |
| `diffuse` | `/design:diffuse` | Éléments répétables sous gate lint · baseline HTML/CSS · pivot sc-php/sc-js. |

## Enforcement hybride

`enforce` et `diffuse` fonctionnent en mode hybride :

1. **Baseline** — `lint-core.mjs` portable (Node.js, aucune dépendance), dérivé du contrat à l'exécution.
2. **Pivot** (si disponible) — `sc-php:design-bridge` (WP FSE, PHP) ou `sc-js:design-bridge` (Vue/React/TS) pour une réalisation native idiomatique.

Dégradation gracieuse : pas de sc-\<techno\> → baseline active, non bloquant.

## Artefacts produits dans le projet

```
design/
  tokens.json            # couche 1 — W3C DTCG, source unique
  components.json        # couche 2 — vocabulaire fermé, base du linter
  design-system.md       # couche 3 — charte prose, statut: figé après adjust
  lint/
    lint-core.mjs        # linter portable dérivé du contrat
    .lintrc.json         # chemins cibles
```

## Démarrage rapide

```
/design:define          # poser le contrat depuis brief ou référence
/design:destructure     # challenger avant de figer (optionnel mais recommandé)
/design:adjust          # arbitrer + figer le contrat 3 couches
/design:enforce         # câbler le linter + les 3 gates
/design:diffuse <comp>  # produire sous gate
```

## Profil mobile-first optionnel

`define` propose le profil `profile-mobile-first.md` (7 conventions : mobile-first authoring, enrichissement progressif, UX mobile-only, tokens sans magic number, composants à variantes, baseline a11y, iconographie sans emoji). Il s'installe dans `.claude/rules/08-design/` uniquement si retenu.

## Licence

MIT — voir [LICENSE](../../LICENSE).
