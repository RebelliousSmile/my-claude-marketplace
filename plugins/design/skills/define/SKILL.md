---
name: define
model: sonnet
description: >-
  Verbe 1 de l'entonnoir design (define → destructure → adjust → enforce → diffuse). Pose la matière de
  design encore MALLÉABLE d'un projet : tokens de travail, inventaire de composants candidats (en prose),
  charte brouillon. Source unique d'entrée — soit l'EXTRACTION de maquettes existantes (capture/screenshot/
  URL/Figma/CSS), soit la CONSTRUCTION depuis un brief écrit (positionnement, user story, pas de visuel).
  Unifie les anciennes from-reference + from-brief. Produit design/tokens.json + design/design-system.md
  (brouillon, NON figé) + adapters. N'écrit JAMAIS de manifeste (components.json) : le figeage est le rôle
  de adjust (verbe 3). Ne challenge pas la direction — c'est destructure ; ne vérifie pas une page — c'est enforce.
---

# define

Porte d'entrée unique du contrat de design. `define` produit la **matière première malléable** dont les verbes suivants ont besoin : des tokens de travail, un inventaire de composants candidats, et une charte brouillon. Rien n'est figé ici — c'est délibéré. Tant que la matière bouge, le contrat n'existe pas encore.

Deux chemins, une seule sortie :

- **Extraction** — un visuel fait foi (maquette, screenshot, URL live, export Figma, CSS livré). On en dérive les tokens.
- **Construction** — pas de visuel, seulement un besoin écrit (brief client, positionnement, user story). On dérive un système cohérent et distinctif depuis l'intention.

La sortie est identique dans les deux cas : `design/tokens.json` + `design/design-system.md` (brouillon) + adapters générés. Le reste de l'entonnoir (`destructure`, `adjust`, `enforce`, `diffuse`) consomme cette matière.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `intake` | Détecte la source (maquettes vs brief) et route | la cible (visuel OU brief) |
| 02 | `extract` | Chemin maquettes : dérive tokens + composants candidats du visuel | évidence visuelle capturée |
| 03 | `construct` | Chemin brief : clarifie les attributs + dérive un token set distinctif | le brief / user story |
| 04 | `write-material` | Écrit tokens.json + design-system.md (brouillon) + adapters | tokens dérivés (de 02 ou 03) |
| 05 | `copycat-fanout` | Maquette MULTI-PAGES mesurée : fan-out de l'agent `copycat` (1/page, //) → table de correspondance agrégée (checkpoint P2) | maquette multi-pages + contrat brouillon |

## Default flow

Linéaire avec aiguillage : `01 → (02 OU 03 OU 05) → 04`.

Trigger-to-action mapping :

- "extrais le design system de cette maquette/ce screenshot/ce site/ce Figma/ce CSS", "matche ce visuel" → `intake` → `extract` → `write-material`
- "construis un design system depuis ce brief/cette user story", "pas de référence, design from scratch" → `intake` → `construct` → `write-material`
- "réconcilie cette maquette multi-pages", "copie conforme de ces N pages", "fan-out copycat sur les pages", "mesure toutes les pages par breakpoint" → `copycat-fanout` (puis checkpoint P2, puis `adjust`)
- "écris la matière depuis ces tokens" → `write-material`

Si la source est ambiguë (un brief mentionnant un visuel sans le fournir), `intake` tranche en demandant.

## Transversal rules

- Lire le contrat AVANT d'écrire : `${CLAUDE_PLUGIN_ROOT}/references/design-system-contract.md` et `${CLAUDE_PLUGIN_ROOT}/references/token-schema.md`.
- **Ne JAMAIS écrire de manifeste** (`design/components.json`). Le manifeste est le vocabulaire fermé produit par `adjust`. Ici, l'inventaire de composants est écrit en **prose candidate** dans la section "Component inventory" de `design-system.md` — explicitement malléable et distinct du manifeste JSON figé.
- La charte produite porte la mention **"brouillon / non figé"** : `define` n'arbitre pas et ne canonise pas.
- Identifier le **core trio d'abord, vite** — ancre de palette · type · jeu d'icônes — et le présenter pour une approbation rapide avant le token set complet.
- Référencer, ne pas inventer : chaque token trace à une observation (extraction) ou à un attribut du brief (construction). Tout le reste va en § Open questions.
- Un seul jeu d'icônes (`icon.library`/`icon.style`) ; jamais d'emoji comme iconographie.
- **Profil mobile-first OPTIONNEL** : `references/profile-mobile-first.md` rassemble la philosophie mobile-first / enrichissement progressif / a11y / no-emoji. L'injecter seulement si l'utilisateur le demande ou si le projet l'exige — il n'est plus imposé d'office.

## References

- `${CLAUDE_PLUGIN_ROOT}/references/design-system-contract.md` — emplacement des artefacts et sections requises
- `${CLAUDE_PLUGIN_ROOT}/references/token-schema.md` — groupes de tokens et génération des adapters
- `${CLAUDE_PLUGIN_ROOT}/references/write-system-procedure.md` — procédure d'écriture partagée (suivie par `04-write-material`, en mode brouillon)
- `references/intake-questions.md` — détection de source + drivers de clarification du brief
- `references/profile-mobile-first.md` — profil injectable OPTIONNEL (mobile-first, enrichissement, a11y, iconographie)
- `${CLAUDE_PLUGIN_ROOT}/agents/copycat.md` — agent feuille fan-outé par `05-copycat-fanout` (1/page)
- `${CLAUDE_PLUGIN_ROOT}/adapters/measure/` — oracle de fidélité Python (getComputedStyle par breakpoint) ; voir son README
- `${CLAUDE_PLUGIN_ROOT}/references/correspondence-table-template.md` — livrable agrégé du checkpoint P2
- `${CLAUDE_PLUGIN_ROOT}/references/copycat-checklist-schema.md` — checklist résumable (bulk) pour la mi-intégration

## Evals

- `evals/scenarios.json`
