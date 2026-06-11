# 01 - challenge

Rethink une direction de design et l'ouvrir : critiquer ce qui est convenu, incohérent ou risqué, puis proposer des pistes d'évolution contrastées et actionnables. Lecture seule — le rapport ne modifie rien.

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

## Outputs

Un rapport structuré, remis dans la conversation (ou sauvé en `design/destructure-report.md` si demandé — jamais ailleurs) :

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

Le rapport ne modifie aucun fichier ; il accepte les deux entrées (sortie define ET élément existant) ; en standalone sur un projet figé, le manifeste/charte ont été lus et chaque piste indique si elle rentre dans le contrat ou demande un re-figeage ; chaque piste est actionnable (inspiration/principe nommé, pas un vœu) ; un score de distinction et un verdict à fort levier sont présents ; l'emoji-comme-icône est signalé s'il existe.
