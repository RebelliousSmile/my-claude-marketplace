# 04 - npc

Crée ou développe un PNJ de campagne (distinct du personnage-joueur, géré par `pc`).

## Inputs

- `campagne` (requis) — nom de la campagne.
- `pnj` — nom ou rôle ; sinon, proposer à partir du scénario/des fronts.

## Process

1. **Lire le contexte** : `config.yaml` (univers visé, profondeur PNJ attendue), les `personnages.md` / `factions.md` de l'univers (`JDR/univers/<univers>/.docs/`), le `synopsis.md` et le scénario qui l'invoque.
2. **Définir le PNJ (durable)** :
   - Identité : nom, rôle, première impression / façade.
   - **Motivation & agenda** : ce qu'il veut, ce qu'il fera pour l'obtenir (relié à une faction de l'univers si pertinent).
   - **Secret / levier** : ce qu'il cache, ce qui le rend manipulable.
   - **Voix** : 2–3 tics de langage ou de comportement pour le jouer vite.
   - **Tags Parallaxe** : forces/faiblesses, statuts éventuels (consulter la référence Parallaxe — ne pas inventer).
3. **Écrire l'entrée durable dans l'univers** : ajouter/compléter le PNJ dans `JDR/univers/<univers>/.docs/personnages.md` (arborescence partagée avec `lore-extract` : une info dans un seul fichier, ne pas écraser, synthétiser si > ~250 lignes). `[[lier]]` la faction dans `factions.md`.
4. **Spécifique à la campagne** : si le PNJ a un rôle/une posture propre à *cette* partie (lien à la ligne rouge du PJ, implication dans un front actif), le consigner côté campagne — dans le scénario concerné (`scenarios/`) ou `fronts.md` — en référençant l'entrée d'univers, sans la dupliquer.
5. Mettre à jour l'`index.md` de la campagne (PNJ en jeu → lien vers l'univers).

## Outputs

Entrée PNJ dans `JDR/univers/<univers>/.docs/personnages.md` (durable, partagée) + éventuelles notes de rôle côté campagne référençant cette entrée. Marquer les `[À compléter]`.

## Test

L'entrée PNJ vit dans `personnages.md` de l'univers (pas dupliquée ailleurs), contient au moins motivation/agenda + un secret/levier, les tags Parallaxe (s'il y en a) proviennent de la référence Parallaxe, et tout rôle spécifique à la campagne référence l'entrée d'univers.
