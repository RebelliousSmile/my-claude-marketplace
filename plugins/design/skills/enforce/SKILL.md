---
name: enforce
description: >
  Transforme le contrat figé (tokens.json + components.json) en gate vérifiable, en HYBRIDE.
  (1) BASELINE : installe lint-core.mjs portable (dérivé du contrat, aucune liste codée en dur),
  câble les 3 gates (rules de génération · success_condition des plans · hook pre-commit auto-armé).
  Porte le lint instances/DB + boucle corriger→propager→re-lint.
  (2) PIVOT : si un sc-<techno> est présent pour le langage du projet, émet un spec
  d'enforcement agnostique (sc-pivot-contract.md) et relaie la réalisation NATIVE idiomatique
  du linter au sc-<techno>:design-bridge. Dégradation gracieuse si aucun sc-<techno> disponible.
triggers:
  - "installe le linter"
  - "câble les gates"
  - "enforce"
  - "lint les instances"
  - "vérifie la conformité"
  - "arme le pre-commit"
requires:
  - "design/tokens.json (figé par adjust)"
  - "design/components.json (figé par adjust)"
references:
  - enforce/references/gate-wiring.md
  - enforce/adapters/lint-core.mjs
  - enforce/adapters/wordpress.md
  - design/references/sc-pivot-contract.md
  - design/references/wordpress-pitfalls.md
---

# enforce

## Rôle dans l'entonnoir

```
define → destructure → adjust (figé) → enforce (GATE) → diffuse
```

`enforce` est le verrou. Aucun `diffuse` ni commit n'est valide sans gate vert.

## Prérequis

`design/tokens.json` et `design/components.json` doivent exister et être figés (produits par `adjust`). Si l'un des deux est absent, interrompre et proposer de jouer `adjust` d'abord.

## Architecture hybride

```
enforce
  ├── BASELINE (toujours)
  │     lint-core.mjs — dérive ses règles de tokens.json + components.json
  │     Sortie : exit 0 (clean) / exit 1 (errors)
  │
  └── PIVOT (si sc-<techno> présent)
        Émet un spec d'enforcement (sc-pivot-contract.md)
        → sc-<techno>:design-bridge réalise le linter natif idiomatique
        → wiring dans l'outillage natif du projet (ESLint, PHP_CodeSniffer, etc.)
```

Le **design garde le QUOI** (contrat = autorité) ; le **sc-<techno> fait le COMMENT** (linter réel, wiring natif).

## Flux d'exécution

```
01-build-linter → 02-wire-gates → 03-lint-instances → 04-pivot (si applicable) → 05-fidelity-gate (si une maquette de référence existe)
```

1. **01-build-linter** — installe lint-core.mjs dans le projet, configure les chemins, vérifie que la fixture tourne.
2. **02-wire-gates** — câble les 3 points : rules de génération · success_condition des plans · hook pre-commit.
3. **03-lint-instances** — lint DB/instances (WordPress : `wp post get`) + boucle corriger→propager→re-lint.
4. **04-pivot** — détecte le langage, mappe vers sc-php/sc-js si présents, émet le spec et relaie ; sinon baseline seule.
5. **05-fidelity-gate** — *second gate, nature différente* : mesure la FIDÉLITÉ du rendu à la maquette résolue via l'oracle Python (`getComputedStyle` par breakpoint) + boucle mesurer→corriger→re-mesurer, lit le registre d'écarts. À jouer quand une maquette de référence existe (sinon le lint vocabulaire seul s'applique).

## Les 3 gates

| Gate | Déclenchement | Effet si rouge |
|------|--------------|----------------|
| **Rules** | lors de la génération d'éléments design (diffuse, block patterns) | génération bloquée |
| **success_condition** | dans les plans aidd-dev | plan bloqué tant que gate rouge |
| **pre-commit** | git commit | commit refusé |

Voir `enforce/references/gate-wiring.md` pour le câblage détaillé.

## Deux natures de gate : vocabulaire + fidélité

Les 3 gates ci-dessus vérifient tous le **vocabulaire** (lint-core.mjs, référence interne). Ils sont **aveugles au rendu calculé** : un lint vert ne garantit pas la fidélité visuelle (mauvais token appliqué, cascade, pas de réduction mobile). `05-fidelity-gate` ajoute donc un **second gate de nature différente** :

| Gate | Oracle | Référence | Vérifie |
|------|--------|-----------|---------|
| Vocabulaire (3 points) | `lint-core.mjs` (Node) | `components.json`/`tokens.json` — **interne** | vocabulaire fermé respecté |
| Fidélité (`05`) | `measure.py` getComputedStyle (Python, par breakpoint) | la maquette résolue par `adjust` — **externe** | rendu calculé fidèle à l'intention |

Les deux doivent être verts ensemble ; aucun ne remplace l'autre. Le gate de fidélité lit `ds-deviation-ledger.md` pour distinguer un écart sanctionné d'une dérive.

## Rejouabilité

Si `adjust` re-fige (version bump), re-jouer `/design:enforce` pour re-dériver les règles du linter depuis le nouveau contrat. La boucle corriger→re-lint (03-lint-instances) est l'outil de réconciliation après un re-figeage.

## Références

- `enforce/adapters/lint-core.mjs` — cœur portable du linter (code réel, tourne avec Node.js ≥ 18)
- `enforce/adapters/wordpress.md` — adaptateur WP (lint DB via CLI conteneur)
- `enforce/references/gate-wiring.md` — les 3 points de câblage détaillés
- `design/references/sc-pivot-contract.md` — interface pivot design ↔ sc-*
- `design/references/wordpress-pitfalls.md` — pièges WP partagés (classes appariées, eval-file, NFC/NFD…)
- `${CLAUDE_PLUGIN_ROOT}/adapters/measure/` — oracle de fidélité Python (getComputedStyle par breakpoint) ; voir son README — utilisé par `05-fidelity-gate`
- `${CLAUDE_PLUGIN_ROOT}/agents/copycat.md` — agent qui classe les deltas mesurés à la bonne couche (mesure dans le script, jugement dans l'agent)
- `${CLAUDE_PLUGIN_ROOT}/references/deviation-ledger-template.md` — registre des écarts tolérés lu par le gate de fidélité
