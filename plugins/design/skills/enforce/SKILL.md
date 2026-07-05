---
name: enforce
description: >
  Transforme le contrat figé (tokens.json + components.json) en gate vérifiable, en HYBRIDE.
  (1) BASELINE : installe lint-core.mjs portable (dérivé du contrat, aucune liste codée en dur),
  câble les 4 gates (import tokens.css · rules de génération · success_condition des plans · hook pre-commit auto-armé).
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
  - ${CLAUDE_PLUGIN_ROOT}/skills/enforce/references/gate-wiring.md
  - ${CLAUDE_PLUGIN_ROOT}/skills/enforce/adapters/lint-core.mjs
  - ${CLAUDE_PLUGIN_ROOT}/skills/enforce/adapters/wordpress.md
  - ${CLAUDE_PLUGIN_ROOT}/references/sc-pivot-contract.md
  - ${CLAUDE_PLUGIN_ROOT}/references/wordpress-pitfalls.md
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

## Routage à deux tracks

Le contrat est stack-agnostique, mais la **réalisation** de `03-lint-instances` et `05-fidelity-gate`
diverge selon la stack du projet consommateur. Deux tracks, à identifier avant de dérouler le flux :

| Track | Terrain | Ce qui s'applique |
|-------|---------|---------------------|
| **app-JS-modern** (SPA / from-code) | Vue/React/Tailwind, code source versionné, pas de contenu en DB | 01/02/04 (track-agnostiques) · 03 § Track: app-JS-modern (file-lint) · 05 *seulement si* une maquette de référence externe existe — sinon vocabulaire + bonnes pratiques seules (cf. `05-fidelity-gate.md § Chemin construction-depuis-brief`) |
| **WP/maquette** | WordPress FSE, contenu en DB, réconciliation depuis une maquette | 01/02/04 (track-agnostiques) · 03 § Track: WP-maquette (`wp post get`) · 05 pleine forme (oracle de fidélité) · `agents/copycat.md` |

01, 02 et 04 sont communs aux deux tracks (baseline du linter, câblage des gates, pivot langage).
Seuls 03 et 05 ont un contenu track-spécifique — voir leurs sections `## Track: …` respectives.

## Flux d'exécution

```
01-build-linter → 02-wire-gates → 03-lint-instances → 04-pivot (si applicable) → 05-fidelity-gate (si une maquette de référence existe)
```

1. **01-build-linter** — installe lint-core.mjs dans le projet, configure les chemins, vérifie que la fixture tourne.
2. **02-wire-gates** — câble les 4 points : import `tokens.css` (Gate 0, si pas déjà fait par `adjust`) · rules de génération · success_condition des plans · hook pre-commit.
3. **03-lint-instances** — lint DB/instances (WordPress : `wp post get`) + boucle corriger→propager→re-lint.
4. **04-pivot** — détecte le langage, mappe vers sc-php/sc-js si présents, émet le spec et relaie ; sinon baseline seule.
5. **05-fidelity-gate** — *second gate, nature différente* : mesure la FIDÉLITÉ du rendu à la maquette résolue via l'oracle Python (`getComputedStyle` par breakpoint) + boucle mesurer→corriger→re-mesurer, lit le registre d'écarts. À jouer quand une maquette de référence existe (sinon le lint vocabulaire seul s'applique).

## Les 4 gates

| Gate | Déclenchement | Effet si rouge |
|------|--------------|----------------|
| **Import (`tokens.css`)** | une fois, au figeage du contrat | app garde des `:root` concurrents, dérive silencieuse |
| **Rules** | lors de la génération d'éléments design (diffuse, block patterns) | génération bloquée |
| **success_condition** | dans les plans aidd-dev | plan bloqué tant que gate rouge |
| **pre-commit** | git commit | commit refusé |

Voir `${CLAUDE_PLUGIN_ROOT}/skills/enforce/references/gate-wiring.md` pour le câblage détaillé.

## Deux modes d'enforcement de vocabulaire : BEM et utility-first

Le lint vocabulaire (les 4 gates) n'a pas une seule forme. `components.json § mode` (`bem` | `utility-first`, cf. `adjust/references/manifest-schema.md`) détermine ce que `lint-core.mjs` vérifie réellement, **et ce n'est pas un mode dégradé du pivot** — les deux sont de première classe dans le baseline :

| | Mode `bem` (défaut/détecté) | Mode `utility-first` |
|---|---|---|
| Vocabulaire fermé porte sur | noms de classe BEM (`.base`/`.elements`/`.modifiers`) | usage de tokens (namespaces de couleur autorisés, raw-hex interdit — bloc `usage` du manifeste) |
| Cible typique | wireframes HTML, templates WP FSE | Tailwind/Vue/React (aucune classe BEM dans le code) |
| Rule class-vocab | s'exécute | **jamais exécutée** (gate explicite — évite le faux "0 hit" vacuité, finding #2) |
| Rules raw-hex / namespace | inertes (`usage` absent en général) | s'exécutent si `usage` déclaré |
| Règle `state = couleur + icône` | — | **déclarée** dans `usage.rules[]`, enforcement `pivot-only` (AST/ESLint côté `sc-js:design-bridge`) |

Un projet ne choisit pas entre les deux modes en abandonnant le baseline pour le pivot : le baseline enforce déjà ce qu'un string-scanner peut vérifier sans faux positif dans **les deux** modes ; seule la règle sémantique `state = couleur + icône` (co-occurrence, hors de portée d'un scanner sans AST) est pivot-only, et sa spec voyage jusqu'au pivot via `references/sc-pivot-contract.md` au lieu d'être réinventée côté `sc-js`.

## Deux natures de gate : vocabulaire + fidélité

Les 4 gates ci-dessus vérifient tous le **vocabulaire** (import compris — Gate 0 garantit que la source des tokens consommée par l'app est bien celle lintée par les autres gates). Ils sont **aveugles au rendu calculé** : un lint vert ne garantit pas la fidélité visuelle (mauvais token appliqué, cascade, pas de réduction mobile). `05-fidelity-gate` ajoute donc un **second gate de nature différente** :

| Gate | Oracle | Référence | Vérifie |
|------|--------|-----------|---------|
| Vocabulaire (4 points) | `lint-core.mjs` (Node) + import `tokens.css` | `components.json`/`tokens.json` — **interne** | vocabulaire fermé respecté |
| Fidélité (`05`) | `measure.py` getComputedStyle (Python, par breakpoint) | la maquette résolue par `adjust` — **externe** | rendu calculé fidèle à l'intention |

Les deux doivent être verts ensemble ; aucun ne remplace l'autre. Le gate de fidélité lit `ds-deviation-ledger.md` pour distinguer un écart sanctionné d'une dérive.

## Rejouabilité

Si `adjust` re-fige (version bump), re-jouer `/design:enforce` pour re-dériver les règles du linter depuis le nouveau contrat. La boucle corriger→re-lint (03-lint-instances) est l'outil de réconciliation après un re-figeage.

## Références

- `${CLAUDE_PLUGIN_ROOT}/skills/enforce/adapters/lint-core.mjs` — cœur portable du linter (code réel, tourne avec Node.js ≥ 18)
- `${CLAUDE_PLUGIN_ROOT}/skills/enforce/adapters/wordpress.md` — adaptateur WP (lint DB via CLI conteneur)
- `${CLAUDE_PLUGIN_ROOT}/skills/enforce/references/gate-wiring.md` — les 4 points de câblage détaillés
- `${CLAUDE_PLUGIN_ROOT}/references/sc-pivot-contract.md` — interface pivot design ↔ sc-*
- `${CLAUDE_PLUGIN_ROOT}/references/wordpress-pitfalls.md` — pièges WP partagés (classes appariées, eval-file, NFC/NFD…)
- `${CLAUDE_PLUGIN_ROOT}/adapters/measure/` — oracle de fidélité Python (getComputedStyle par breakpoint) ; voir son README — utilisé par `05-fidelity-gate`
- `${CLAUDE_PLUGIN_ROOT}/agents/copycat.md` — agent qui classe les deltas mesurés à la bonne couche (mesure dans le script, jugement dans l'agent)
- `${CLAUDE_PLUGIN_ROOT}/references/deviation-ledger-template.md` — registre des écarts tolérés lu par le gate de fidélité
