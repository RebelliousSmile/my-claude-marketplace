# 02 - scenario

Écrit un scénario / une situation jouable pour la campagne — le cœur de l'écriture de scénarios.

## Inputs

- `campagne` (requis) — nom de la campagne.
- `pitch` — idée de départ (paste libre) ; sinon, dériver du `synopsis.md` et des fronts en cours.

## Process

1. **Lire le contexte** : `synopsis.md`, `config.yaml` (ton/rythme/difficulté, univers), les données d'univers **canon ET MJ** (`JDR/<jeu>/univers/<univers>/canon/` et `mj/` : `personnages.md`, `factions.md`, `geographie.md`), les fronts actifs `JDR/<jeu>/campagnes/<campagne>/fronts.md`, et l'`intention.md` du PJ (thèmes, ligne rouge, question viscérale). Le canon prime ; le MJ étend.
2. **Construire en situation, pas en intrigue linéaire** (adapté au solo) :
   - **Prémisse & enjeu** : ce qui est vrai au départ, ce qui va déraper si le PJ n'agit pas.
   - **Lieux** : 3–6 lieux clés ; `[[lier]]` les lieux existants (`canon/` ou `mj/geographie.md`), créer les nouveaux (invention MJ) dans `mj/geographie.md` ; n'inscrire ici que leur mise en jeu (ambiance, ce qu'on y trouve maintenant).
   - **PNJ impliqués** : `[[lier]]` les fiches d'univers (`canon/` ou `mj/personnages.md`) ; en créer de nouveaux via `npc` (écrits dans `mj/`).
   - **Fronts & horloges** : ce qui avance en arrière-plan (lier à `fronts.md` de la campagne et aux factions d'univers).
   - **Amorces de scènes** : 4–8 scènes-germes (déclencheur + tension), pas un script figé.
   - **Issues possibles** : succès / échec / coût, et conséquences sur les fronts.
   - **Récompenses** : matérielles, narratives, et toute récompense mécanique propre au système de jeu (consulter les références — ne pas inventer).
3. **Ancrer sur le PJ** : au moins une scène-germe touche la ligne rouge ou la question viscérale du PJ.
4. **Écrire** `JDR/<jeu>/campagnes/<campagne>/scenarios/<slug>.md` (le scénario est de la prep de campagne ; lieux/PNJ/factions durables restent dans l'univers, liés) ; mettre à jour `index.md`.

## Outputs

`JDR/<jeu>/campagnes/<campagne>/scenarios/<slug>.md` (prémisse, lieux liés, PNJ liés, fronts, amorces, issues, récompenses) + `index.md` à jour. Lister les PNJ/factions/lieux d'univers à créer (via `npc`/`faction`/`lore-extract`) et les `[À compléter]`.

## Test

Le scénario contient au moins prémisse + lieux + amorces de scènes + issues possibles, `[[lie]]` les PNJ/factions/lieux à l'univers (sans les dupliquer) et les fronts à la campagne, et au moins une amorce touche la ligne rouge ou la question viscérale du PJ.
