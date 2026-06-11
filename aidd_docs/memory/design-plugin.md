# design — état du plugin

| Champ | Valeur |
|---|---|
| Version courante | 1.0.0 |
| Dernière release | 2026-06-11 |

## Architecture — entonnoir 5 verbes

`define → destructure → adjust → enforce → diffuse`

| Verbe | Rôle |
|---|---|
| `define` | Extraction depuis référence/brief → tokens + inventaire composants + charte brouillon |
| `destructure` | Challenge multi-angles avant figeage |
| `adjust` | Arbitrage + figeage du **contrat 3 couches** |
| `enforce` | Linter portable + 3 gates + pivot sc-* |
| `diffuse` | Éléments répétables sous gate lint |

## Contrat 3 couches (cristallise à `adjust`)

| Couche | Fichier | Rôle |
|---|---|---|
| 1 | `design/tokens.json` (W3C DTCG) | Valeurs nommées, source unique |
| 2 | `design/components.json` (vocabulaire fermé) | Classes BEM déclarées — base du linter |
| 3 | `design/design-system.md` | Charte prose |

**Invariant cardinal** : une valeur vit dans une seule couche.

## Enforcement hybride

1. **Baseline** — `lint-core.mjs` (Node.js portable, dérivé du contrat à l'exécution, 0 hard-code)
2. **Pivot** — `sc-php:design-bridge` (PHP/WP FSE) ou `sc-js:design-bridge` (Vue/React/TS) si disponibles
3. **Dégradation gracieuse** : pas de sc-* → baseline active, non bloquant

Gate `enforce` = **obligatoire** avant toute livraison via `diffuse` (refus absolu si lint exit 1).

## Profil optionnel

`profile-mobile-first.md` — 7 conventions (mobile-first authoring, enrichissement progressif, UX mobile-only, tokens, variantes, a11y, iconographie). Proposé par `define/01-intake`, jamais imposé.
