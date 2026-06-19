---
name: adjust
description: >
  Pivot de l'entonnoir. Arbitre les incohérences entre maquettes, directions ou pistes issues de
  destructure (motif dominant gagne ; gate humain sur les cas non tranchables), puis fige le contrat :
  canonise les tokens, écrit le manifeste components.json (vocabulaire fermé, 2e couche), marque la
  charte comme figée et bumpe la version. Explicitement rejouable : un re-figeage bumpe la version et
  déclenche la réconciliation dans enforce.
triggers:
  - "arbitre les directions"
  - "fige le contrat"
  - "écris le manifeste"
  - "adjust"
  - "cristallise le design system"
  - "canonise les tokens"
references:
  - ${CLAUDE_PLUGIN_ROOT}/skills/adjust/references/manifest-schema.md
  - ${CLAUDE_PLUGIN_ROOT}/references/design-system-contract.md
  - ${CLAUDE_PLUGIN_ROOT}/references/token-schema.md
---

# adjust

## Rôle dans l'entonnoir

```
define (malléable) → destructure (malléable) → adjust (FIGEAGE) → enforce → diffuse
```

`adjust` est le point de non-retour : tout ce qui entre sort figé. Il est cependant **rejouable** — si `destructure` identifie une piste requérant un re-figeage (coût contrat `demande un re-figeage`), `adjust` rejoue le delta, bumpe la version et `enforce` propage.

## Ce que adjust produit

| Artefact | Statut après adjust |
|----------|---------------------|
| `design/tokens.json` | Canonisé (dédupliqué, groupes requis vérifiés) |
| `design/components.json` | Créé ou mis à jour — vocabulaire fermé (2e couche) |
| `design/design-system.md` | `status: figé` · version bumped · Provenance mise à jour |

## Ce que adjust NE fait PAS

- Adjust ne critique pas la direction visuelle (→ `destructure`).
- Adjust n'installe pas de linter ni ne câble des gates (→ `enforce`).
- Adjust ne produit pas d'éléments répétables ni d'exports (→ `diffuse`).

## Flux

```
01-arbitrate → résolution des conflits → 02-freeze → contrat figé
```

1. **01-arbitrate** — collecte la matière malléable (define output + pistes destructure), compte les occurrences de chaque option, tranche automatiquement sur motif dominant (≥ 2/3), expose les cas non tranchables à l'humain.
2. **02-freeze** — prend le brief d'arbitrage résolu, canonise `tokens.json`, écrit `components.json`, marque `design-system.md` figé, bumpe les versions.

## Mode re-figeage

Si `components.json` existe déjà (projet déjà figé), `adjust` rejoue uniquement sur le **delta** (nouvelles pistes ou tokens modifiés). Les composants et tokens non touchés sont conservés. La version est bumped minor (delta additif) ou major (renommage/suppression).

## Références

- `${CLAUDE_PLUGIN_ROOT}/skills/adjust/references/manifest-schema.md` — structure et invariants de `components.json`
- `${CLAUDE_PLUGIN_ROOT}/references/design-system-contract.md` — contrat 3 couches et règles de consommation
- `${CLAUDE_PLUGIN_ROOT}/references/token-schema.md` — groupes requis, liaison tokens ↔ manifeste
