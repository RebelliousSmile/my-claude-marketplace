# 01 - challenge

Rethink une direction de design et l'ouvrir : critiquer ce qui est convenu, incohérent ou risqué, puis proposer des pistes d'évolution contrastées et actionnables. Lecture seule sur le contrat gelé et le code source — le rapport est persisté par défaut sous son propre chemin dédié.

## Inputs

- `target` (required) — entrée polymorphe, l'une de :
  - la **sortie de define** : `design/tokens.json` + `design/design-system.md` (brouillon) — mode entonnoir
  - un **élément existant isolé** : un chemin de composant (`design/components/card.md`), une page, un token set, ou un fragment d'UI en production — mode standalone
- Les lentilles de critique : `references/critique-lenses.md`.
- Le schéma de tokens : `${CLAUDE_PLUGIN_ROOT}/references/token-schema.md`.

## Process

1. **Cadrer la cible et le mode** :
   - Mode entonnoir → lire la matière de `define`.
   - Mode standalone → lire l'élément ciblé. **Si un contrat figé existe** (`design/components.json` + `design/design-system.md`), le lire d'abord pour situer chaque piste : rentre-t-elle dans le vocabulaire fermé actuel, ou demande-t-elle un re-figeage par `adjust` ?
2. **Mesurer avant de juger** (hérité d'ex-diagnose, sur un existant) : valeurs distinctes et sprawl (couleurs, tailles de police, espacements, breakpoints), densité de valeurs en dur vs tokens, doublons de composants, emoji-comme-icônes. Rapporter des comptes, pas des impressions.
3. **Passer les lentilles** de `references/critique-lenses.md` sur la direction :
   - **Générique vs distinctif** — quoi de convenu, de "stock framework" ; où la personnalité ne transparaît pas.
   - **Cohérence interne** — tokens qui se contredisent, rythme d'espacement irrégulier, échelle de type bancale.
   - **Accessibilité** — paires de contraste limites, cibles tactiles, focus, emoji porteurs de sens.
   - **Tendances & fraîcheur** — où la direction date, où elle suit une mode fragile.
   - **Divergence d'inspiration** — quelles autres références/familles visuelles ouvriraient un autre territoire.
4. **Générer 2–4 pistes contrastées par axe critiqué** : chaque piste nomme une inspiration ou un principe directeur concret, l'effet attendu, et le coût (rentre dans le contrat actuel / demande un re-figeage). Diverger, ne pas trancher.
5. **Classer** chaque trouvaille : `générique` / `incohérent` / `risque-a11y` / `occasion-manquée`.
6. **Scorer** la distinction de la direction (voir Outputs) et donner un verdict d'une ligne : la piste la plus à fort levier.
7. **Écrire le rapport (par défaut)** sous `design/critique/<yyyy_mm_dd>-<cible>.md`, sauf opt-out explicite (`--no-write` ou "ne sauvegarde pas") — voir Outputs.

## Outputs

Un rapport structuré, remis dans la conversation **et écrit par défaut sur disque** — squelette : `references/critique-report-template.md`.

- **Chemin canonique** : `design/critique/<yyyy_mm_dd>-<cible>.md` (historique daté, un fichier par exécution, jamais d'écrasement). `<cible>` est un slug dérivé de l'élément critiqué (nom de composant, de page, ou `design-system` en mode entonnoir).
- **Alias rétrocompatible** : `design/destructure-report.md` reste un chemin accepté en lecture pour les rapports antérieurs à cette convention ; ce n'est plus le chemin d'écriture.
- **Opt-out explicite** : `--no-write`, ou une demande explicite ("ne sauvegarde pas") — le rapport reste alors conversationnel uniquement.
- **Réconciliation lecture seule** : cette écriture ne contrevient pas à l'invariant — `destructure` n'édite jamais `tokens.json`, `components.json`, `design-system.md` ni le code source ; le rapport de critique est un artefact séparé, non-contractuel (cf. `${CLAUDE_PLUGIN_ROOT}/references/design-system-contract.md`).

```text
Score de distinction : XX/100

# Cible & mode
# Mesures (sprawl, densité, doublons, emoji)   ← si existant
# Critique par lentille
  - Générique vs distinctif
  - Cohérence
  - Accessibilité
  - Tendances
  - Inspiration
# Pistes d'évolution (2–4 par axe, contrastées, actionnables, avec coût contrat)
# Verdict : la piste à plus fort levier
```

## Test

Le rapport ne modifie jamais `tokens.json`, `components.json`, `design-system.md` ni le code source ; par défaut il est écrit sous `design/critique/<yyyy_mm_dd>-<cible>.md`, sauf opt-out explicite (`--no-write` / "ne sauvegarde pas", auquel cas il reste conversationnel uniquement) ; il accepte les deux entrées (sortie define ET élément existant) ; en standalone sur un projet figé, le manifeste/charte ont été lus et chaque piste indique si elle rentre dans le contrat ou demande un re-figeage ; chaque piste est actionnable (inspiration/principe nommé, pas un vœu) ; un score de distinction et un verdict à fort levier sont présents ; l'emoji-comme-icône est signalé s'il existe.
