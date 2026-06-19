---
name: destructure
model: sonnet
description: >-
  Verbe 2 de l'entonnoir design (define → destructure → adjust → enforce → diffuse). Le CHALLENGE côté design —
  pendant de aidd-refine:02-challenge, mais pour la direction visuelle, pas pour un plan. Déconstruit le
  "plausible générique", critique la direction posée par define, et propose des inspirations et pistes
  d'évolution alternatives (phase DIVERGENTE). 7 lentilles : générique/distinctif, cohérence interne,
  accessibilité (contrastes WCAG, états d'interaction, navigation clavier), tendances, divergence d'inspiration,
  états comportementaux UX (états composants manquants, affordance, flux), lisibilité & hiérarchie de lecture.
  Double usage : (1) dans l'entonnoir, sur la sortie de define ; (2) STANDALONE sur un élément existant isolé.
  Lecture seule — produit un rapport structuré (critique + pistes actionnables + score), n'applique RIEN.
  Absorbe l'ancien diagnose. Ne pose pas la matière — c'est define ; ne fige pas — c'est adjust.
---

# destructure

Le **challenge côté design**. Là où `aidd-refine:02-challenge` rethink un plan pour vérifier sa correction, `destructure` rethink une **direction visuelle** pour l'ouvrir : il met en doute le confort du "plausible générique", nomme ce qui est convenu ou incohérent, et propose des pistes d'évolution et des inspirations alternatives. C'est la phase **divergente** de l'entonnoir — on élargit l'espace des possibles avant qu'`adjust` ne le referme.

Deux usages, une seule mécanique :

- **Mode entonnoir** — sur la sortie de `define` (matière malléable encore non figée). On critique la direction avant de la figer.
- **Mode standalone** — sur un élément existant isolé (un composant, une page, un token set déjà en place). « Comment cet élément pourrait-il évoluer ? » Sur un projet déjà figé, l'action LIT le manifeste et la charte en vigueur pour situer ses pistes contre le vocabulaire fermé existant.

**Lecture seule.** `destructure` ne propose que des pistes ; il n'écrit jamais dans `design/`. L'application d'une piste est le travail d'`adjust` (ou d'un nouveau cycle `define`).

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `challenge` | Critique la direction + génère des pistes d'évolution classées, avec score | sortie de define OU élément existant isolé |

## Default flow

Action unique. L'entrée est polymorphe : la sortie de `define`, ou un élément/chemin existant.

Trigger-to-action mapping :

- "challenge cette direction de design", "critique ce design system", "qu'est-ce qui est trop générique ici", "propose d'autres pistes/inspirations" → `challenge` (mode entonnoir)
- "comment ce composant pourrait évoluer", "destructure design/components/card.md", "explore des variantes pour cet élément" → `challenge` (mode standalone)
- "on a hérité de ce codebase, quel est l'état du design" → `challenge` (mode standalone, ex-diagnose)

## Transversal rules

- **Lecture seule absolue.** Ne jamais éditer `design/` ni le code source. La sortie est un rapport.
- Chaque piste doit être **actionnable** et concrète — jamais « améliore le contraste » ou « rends-le plus moderne ». Utiliser les lentilles de `references/critique-lenses.md` pour forcer la précision.
- En mode standalone sur un projet figé, **lire d'abord** `design/components.json` (manifeste) et `design/design-system.md` (charte) s'ils existent, pour situer chaque piste contre le vocabulaire fermé en vigueur — distinguer ce qui rentre dans le contrat actuel de ce qui demanderait un re-figeage par `adjust`.
- **Diverger, pas trancher** : proposer 2–4 pistes contrastées par axe critiqué, pas une seule "bonne" réponse. L'arbitrage est le rôle d'`adjust`.
- Classer les trouvailles (générique / incohérent / risque a11y / risque UX / occasion manquée) et donner un **score** de distinction de la direction.
- Signaler l'emoji-comme-icône explicitement (smell bloquant) et proposer le jeu d'icônes de remplacement.

## References

- `${CLAUDE_PLUGIN_ROOT}/skills/destructure/references/critique-lenses.md` — les lentilles de critique (générique vs distinctif, cohérence, accessibilité, tendances, divergence d'inspiration)
- `${CLAUDE_PLUGIN_ROOT}/references/design-system-contract.md` — pour situer les pistes contre les artefacts du contrat
- `${CLAUDE_PLUGIN_ROOT}/references/token-schema.md` — les groupes de tokens contre lesquels juger la matière

## Evals

- `evals/scenarios.json`
