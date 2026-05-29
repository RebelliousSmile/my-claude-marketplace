# 02 - scenario

Écrit un scénario / une situation jouable pour la campagne — le cœur de l'écriture de scénarios.

## Inputs

- `campagne` (requis) — nom de la campagne.
- `pitch` — idée de départ (paste libre) ; sinon, dériver du `synopsis.md` et des fronts en cours.

## Process

1. **Lire le contexte** : `synopsis.md`, `config.yaml` (ton/rythme/difficulté), `factions/` (fronts en cours), `pnjs/` existants, et l'`intention.md` du PJ (thèmes, ligne rouge, question viscérale).
2. **Construire en situation, pas en intrigue linéaire** (adapté au solo) :
   - **Prémisse & enjeu** : ce qui est vrai au départ, ce qui va déraper si le PJ n'agit pas.
   - **Lieux** : 3–6 lieux clés (ambiance, ce qu'on y trouve, accroche sensorielle).
   - **PNJ impliqués** : référencer/`[[lier]]` les fiches de `pnjs/` ; en proposer de nouveaux à créer via `npc`.
   - **Fronts & horloges** : ce qui avance en arrière-plan (lier aux `factions/`).
   - **Amorces de scènes** : 4–8 scènes-germes (déclencheur + tension), pas un script figé.
   - **Issues possibles** : succès / échec / coût, et conséquences sur les fronts.
   - **Récompenses** : matérielles, narratives, échos J&T (consulter la référence J&T).
3. **Ancrer sur le PJ** : au moins une scène-germe touche la ligne rouge ou la question viscérale du PJ.
4. **Écrire** `JDR/<campagne>/scenarios/<slug>.md` ; mettre à jour `index.md`.

## Outputs

`JDR/<campagne>/scenarios/<slug>.md` (prémisse, lieux, PNJ, fronts, amorces, issues, récompenses) + `index.md` à jour. Lister les PNJ/factions à créer et les `[À compléter]`.

## Test

Le scénario contient au moins prémisse + lieux + amorces de scènes + issues possibles, référence des PNJ/fronts de la campagne, et au moins une amorce touche la ligne rouge ou la question viscérale du PJ.
