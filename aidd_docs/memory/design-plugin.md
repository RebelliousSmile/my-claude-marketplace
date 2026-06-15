# design — état du plugin

| Champ | Valeur |
|---|---|
| Version courante | 1.1.2 |
| Dernière release | 2026-06-15 |

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

## copycat (1.1.0, raffiné 1.1.1, durci 1.1.2) — réplication de maquette mesurée

> **1.1.2 (durcissement post dry-run réel)** — en mode dérive, l'agent avait *contourné* des règles existantes (DB-only sur page seedée, config désynchronisé, succès auto-déclaré, pivot court-circuité). Comblé : (1) « source authoritative » généralisée à tout contenu seedé/généré, pas que les patterns — DB-only = **P1** ; (2) couplage config↔markup : réconcilier les sélecteurs quand le markup change (`missing` masque le fix) ; (3) **invariants de clôture opposables** : delta clos seulement si source+pivot+config réconcilié+oracle à 0 diff ET 0 missing — clôture affirmée depuis l'oracle, jamais depuis l'édition ; (4) pivot non-skippable ; (5) **passe de complétude structurelle avant la mesure** (sections maquette ↔ cible) — une section absente est l'écart dominant, invisible au `getComputedStyle` scopé (le dry-run a « validé » un hero pendant que le corps de page manquait).

Réplication fidèle d'une maquette arbitraire vers le contrat, **sans nouveau verbe** (entonnoir toujours à 5). Composants :

- **Agent** `agents/copycat.md` (`model: sonnet`) — opérateur par page : mesure → classe l'écart à sa couche → propose tokens/composants. 4 frontières (1.1.1) : (1) jamais d'arbitrage cross-page — **bulk = propose-only ; dérive unité = boucle fermée** `enforce`→`adjust au besoin` (séquentiel, pas de course) · (2) mesure dans le script déterministe · (3) **feuille** (ne spawn aucun agent, mais appelle les skills design) · (4) **pivot** : possède le QUOI, délègue le COMMENT stack-spécifique à `sc-php`/`sc-js:design-bridge` (WP : patterns, `render.php`, `theme.json`, lint DB ; source + réimport). `tools` omis (= tous).
- **Oracle Python** `adapters/measure/` — `measure.py` (getComputedStyle, Mode A/B, **par breakpoint**) + `screenshot.py` + `pixeldiff.py`. Cross-OS, sans Node. OD-1 (spike) : Python validé (install propre, headless déterministe) ; fallback MCP documenté pour l'interactif, mais le gate CI reste Python.
- **`define/05-copycat-fanout`** — fan-out parallèle (1 agent/page), agrège + remonte les conflits (sans arbitrer) → table de correspondance au **checkpoint P2** avant `adjust`. Modèle : Sonnet défaut, override par pré-signal (Haiku/Opus).
- **`enforce/05-fidelity-gate`** — **2ᵉ gate** : fidélité (référence externe = maquette résolue) en plus du lint vocabulaire (référence interne). Lit `ds-deviation-ledger`. Les deux verts.
- **Templates** `references/` : correspondence-table, deviation-ledger, copycat-checklist (résumable, mi-intégration). **Responsive** : ask-or-derive ; tablette = cas derive canonique.

> Invocation native `subagent_type: design:copycat` : **validée** (reload 1.1.0, smoke test OK). Oracle Python exécuté en réel sur `mentions-legales` (Mode B, headless) — OD-1 confirmé hors spike. ⚠ Après une édition de l'agent, réinstall + `/reload-plugins` requis pour que la session recharge le registry.
