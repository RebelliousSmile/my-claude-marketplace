# 04 - npc

Crée ou développe un PNJ de campagne (distinct du personnage-joueur, géré par `pc`).

## Inputs

- `campagne` (requis) — nom de la campagne.
- `pnj` — nom ou rôle ; sinon, proposer à partir du scénario/des fronts.

## Process

1. **Lire le contexte** : `config.yaml` (profondeur PNJ attendue), `synopsis.md`, factions concernées, et le scénario qui l'invoque.
2. **Définir le PNJ** :
   - Identité : nom, rôle, première impression / façade.
   - **Motivation & agenda** : ce qu'il veut, ce qu'il fera pour l'obtenir (relié à une faction/front si pertinent).
   - **Secret / levier** : ce qu'il cache, ce qui le rend manipulable.
   - **Lien au PJ** : comment il croise la ligne rouge / les enjeux du PJ.
   - **Voix** : 2–3 tics de langage ou de comportement pour le jouer vite.
   - **Tags J&T** : forces/faiblesses, statuts éventuels (consulter la référence J&T — ne pas inventer).
3. **Lier** : `[[faction]]`, scénarios où il apparaît ; mettre à jour `index.md`.
4. **Écrire** `JDR/<campagne>/pnjs/<slug>.md` (compléter si la fiche existe, sans écraser).

## Outputs

`JDR/<campagne>/pnjs/<slug>.md` + `index.md` à jour. Marquer les `[À compléter]`.

## Test

La fiche PNJ contient au moins motivation/agenda + un secret/levier + un lien au PJ ou à une faction, et les tags J&T (s'il y en a) proviennent de la référence J&T.
