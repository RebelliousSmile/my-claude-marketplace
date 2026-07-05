# design — état du plugin

| Champ | Valeur |
|---|---|
| Version courante | 1.16.0 |
| Dernière release | 2026-07-05 |

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

## copycat (1.1.0 → 1.2.0) — réplication de maquette mesurée

> **1.2.0 (enforcement structurel)** — les invariants en prose n'étaient pas suivis fiablement par l'agent (2 dry-runs ratés : tunnel vision hero-only, config non réconcilié, clôture auto-déclarée par grep). Déplacé dans la mécanique de `measure.py` : **verdict machine** `summary.verdict` (CLOSED ssi 0 diff non-ledgeré + 0 missing + aucune section manquante + couverture ok) que l'agent doit citer ; **scan de complétude** headings (guillemets normalisés) ; **garde de couverture** (under-coverage ⇒ OPEN sauf `coverage_ack`) ; **conscience ledger** (`ledger:[{target,prop,why}]` exclut un diff assumé du verdict). Re-run validé : 1 appel d'outil, verdict CLOSED cité, 0 édition.

> **1.1.2 (durcissement post dry-run réel)** — en mode dérive, l'agent avait *contourné* des règles existantes (DB-only sur page seedée, config désynchronisé, succès auto-déclaré, pivot court-circuité). Comblé : (1) « source authoritative » généralisée à tout contenu seedé/généré, pas que les patterns — DB-only = **P1** ; (2) couplage config↔markup : réconcilier les sélecteurs quand le markup change (`missing` masque le fix) ; (3) **invariants de clôture opposables** : delta clos seulement si source+pivot+config réconcilié+oracle à 0 diff ET 0 missing — clôture affirmée depuis l'oracle, jamais depuis l'édition ; (4) pivot non-skippable ; (5) **passe de complétude structurelle avant la mesure** (sections maquette ↔ cible) — une section absente est l'écart dominant, invisible au `getComputedStyle` scopé (le dry-run a « validé » un hero pendant que le corps de page manquait).

Réplication fidèle d'une maquette arbitraire vers le contrat, **sans nouveau verbe** (entonnoir toujours à 5). Composants :

- **Agent** `agents/copycat.md` (`model: sonnet`) — opérateur par page : mesure → classe l'écart à sa couche → propose tokens/composants. 4 frontières (1.1.1) : (1) jamais d'arbitrage cross-page — **bulk = propose-only ; dérive unité = boucle fermée** `enforce`→`adjust au besoin` (séquentiel, pas de course) · (2) mesure dans le script déterministe · (3) **feuille** (ne spawn aucun agent, mais appelle les skills design) · (4) **pivot** : possède le QUOI, délègue le COMMENT stack-spécifique à `sc-php`/`sc-js:design-bridge` (WP : patterns, `render.php`, `theme.json`, lint DB ; source + réimport). `tools` omis (= tous).
- **Oracle Python** `adapters/measure/` — `measure.py` (getComputedStyle, Mode A/B, **par breakpoint**) + `screenshot.py` + `pixeldiff.py`. Cross-OS, sans Node. OD-1 (spike) : Python validé (install propre, headless déterministe) ; fallback MCP documenté pour l'interactif, mais le gate CI reste Python.
- **`define/05-copycat-fanout`** — fan-out parallèle (1 agent/page), agrège + remonte les conflits (sans arbitrer) → table de correspondance au **checkpoint P2** avant `adjust`. Modèle : Sonnet défaut, override par pré-signal (Haiku/Opus).
- **`enforce/05-fidelity-gate`** — **2ᵉ gate** : fidélité (référence externe = maquette résolue) en plus du lint vocabulaire (référence interne). Lit `ds-deviation-ledger`. Les deux verts.
- **Templates** `references/` : correspondence-table, deviation-ledger, copycat-checklist (résumable, mi-intégration). **Responsive** : ask-or-derive ; tablette = cas derive canonique.

> Invocation native `subagent_type: design:copycat` : **validée** (reload 1.1.0, smoke test OK). Oracle Python exécuté en réel sur `mentions-legales` (Mode B, headless) — OD-1 confirmé hors spike. ⚠ Après une édition de l'agent, réinstall + `/reload-plugins` requis pour que la session recharge le registry.

## Mode utility-first + thème/mode + adapter v3 (1.2.0 → 1.16.0, 2026-07-05)

Mode `utility-first` de 1ʳᵉ classe dans `lint-core.mjs` (vocabulaire fermé = namespaces d'usage de tokens, pas des noms de classe BEM), dimension thème/mode dans les tokens, adaptateur Tailwind v3, factorisation en deux tracks (BEM vs utility-first), réconciliation retrofit au figeage (`adjust/02-freeze`), persistance de la critique destructure, statut preview non intégrée de `diffuse`.

- **Fixtures par mode, pas un dossier unique** : `fixtures/` = contrat de base (`clean.html`/`dirty.html`, `tokens.json`+`components.json` directement dedans) ; `fixtures/themed/`, `fixtures/utility/`, `fixtures/retrofit/` = un manifeste par mode. `lint-core.mjs <file> <dir>` exige le bon dossier par paire de fixture — s'y tromper échoue bruyamment pour certaines paires et donne un résultat silencieusement faux pour d'autres (pas d'erreur visible).
- **Rule 4 (namespaces de couleur, mode utility-first) — trade-off assumé** : les préfixes Tailwind (`text`, `border`, `ring`...) sont à double usage (`text-lg`, `border-2`, `ring-offset-2` ne portent aucune couleur). La règle ne déclenche que sur la forme `<namespace>-<shade numérique 2-3 chiffres>` (ex. `bg-brand-500`) — seul signal fiable. Conséquence acceptée : un mot-clé de couleur nu sans shade (`bg-white`, `border-black`) hors contrat n'est plus détecté.
- Revue de code indépendante post-implémentation a trouvé 1 critique (le point Rule 4 ci-dessus, corrigé avant commit) + 2 mineurs (collision de libellé "Étape 2bis" dans `adjust/02-freeze.md` ; `$EXT_PATTERN` non assigné dans le snippet pre-commit de `sc-js/01-realize-lint.md`, corrigé avec garde-fou explicite).
