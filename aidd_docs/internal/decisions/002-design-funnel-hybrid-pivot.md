# Decision: Enforcement hybride — baseline portable + pivot sc-*

| Field   | Value |
|---------|-------|
| ID      | DEC-002 |
| Date    | 2026-06-11 |
| Feature | Plugin design — enforce + diffuse |
| Status  | Accepted |

## Context

Le plugin `design` doit produire du code idiomatique pour des stacks très différentes (WP FSE, Vue, React, PHP, JS). Imposer un seul linter ou renderer générique sacrifie la qualité native ; déléguer entièrement aux sc-* rend design dépendant d'eux.

## Decision

Architecture **hybride à deux niveaux** :
1. **Baseline** — `lint-core.mjs` portable (Node.js, 0 dépendance) + rendu HTML/CSS agnostique. Toujours disponible, dérivé du contrat à l'exécution.
2. **Pivot** — quand un `sc-<techno>:design-bridge` est disponible, `enforce` émet un spec d'enforcement et `diffuse` émet un spec de rendu ; le réceptacle réalise nativement (linter idiomatique, composant natif).

**Design garde le QUOI** (contrat = autorité : tokens.json + components.json). **sc-* fait le COMMENT** (réalisation native par stack).

Dégradation gracieuse obligatoire : l'absence de sc-* n'est pas une erreur.

## Alternatives Considered

| Alternative | Pros | Cons | Rejected because |
|---|---|---|---|
| Linter universel unique dans design | Simple | Non idiomatique, ne couvre pas PHP | Qualité insuffisante pour WP/PHP |
| Délégation totale aux sc-* | Natif optimal | design bloqué sans sc-* installé | Couplage fort, non viable |
| Plugins sc-* autonomes sans contrat partagé | Indépendance | Vocabulaire divergent entre stacks | Incohérence garantie à terme |

## Consequences

- Tout futur réceptacle (`sc-python:design-bridge`, `sc-rust:design-bridge`) doit implémenter le même contrat de pivot (`design/references/sc-pivot-contract.md`).
- Le gate `enforce` reste obligatoire même avec le pivot — la baseline vérifie toujours en sortie.
- Les linters idiomatiques sc-* peuvent étendre le contrat mais pas le contredire.
