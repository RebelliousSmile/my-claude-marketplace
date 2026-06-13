# 04 - npc

Crée ou développe un PNJ **créé par le MJ** (distinct du personnage-joueur géré par `pc`, et du lore canon).

## Inputs

- `campagne` (requis) — nom de la campagne.
- `pnj` — nom ou rôle ; sinon, proposer à partir du scénario/des fronts.

## Process

1. **Lire le contexte** : `config.yaml` (univers visé, profondeur PNJ attendue), les personnages/factions **canon** (`R/_univers/<univers>/canon/`) ET MJ (`mj/`), le `synopsis.md` et le scénario qui l'invoque. Si le PNJ visé est canon, ne pas le réécrire : créer une fiche MJ qui l'**étend** et le `[[lie]]`.
2. **Définir le PNJ (durable, création MJ)** :
   - Identité : nom, rôle, première impression / façade.
   - **Motivation & agenda** : ce qu'il veut, ce qu'il fera pour l'obtenir (relié à une faction si pertinent).
   - **Secret / levier** : ce qu'il cache, ce qui le rend manipulable.
   - **Voix** : 2–3 tics de langage ou de comportement pour le jouer vite.
   - **Tags mécaniques** : forces/faiblesses, statuts éventuels (selon le système de jeu — consulter les références, ne pas inventer).
3. **Écrire dans `mj/`** : ajouter/compléter le PNJ dans `R/_univers/<univers>/mj/personnages.md` (une info dans un seul fichier, ne pas écraser, synthétiser si > ~250 lignes). `[[lier]]` la faction (`mj/` ou `canon/factions.md`). **Ne jamais écrire dans `canon/`**. Si le PNJ contredit le canon, le signaler.
4. **Spécifique à la campagne** : si le PNJ a un rôle/une posture propre à *cette* partie (lien à la ligne rouge du PJ, implication dans un front actif), le consigner côté campagne — dans le scénario concerné (`scenarios/`) ou `fronts.md` — en référençant la fiche `mj/`, sans la dupliquer. **Si aucune campagne n'existe encore** (pas de `config.yaml`), le write côté univers `mj/` (étape 3) **suffit** : différer les notes côté campagne jusqu'à l'amorce d'une campagne via `campaign` — ne jamais fabriquer de dossier campagne ici.
5. Mettre à jour l'`index.md` de la campagne (PNJ en jeu → lien vers `mj/`) — **si une campagne existe** ; sinon différer.

## Outputs

Entrée PNJ dans `R/_univers/<univers>/mj/personnages.md` (création MJ) + éventuelles notes de rôle côté campagne. `canon/` inchangé. Marquer les `[À compléter]`.

## Test

L'entrée PNJ vit dans `R/_univers/<univers>/mj/personnages.md` (jamais dans `canon/`, non dupliquée), contient au moins motivation/agenda + un secret/levier, les tags mécaniques (s'il y en a) proviennent des références des règles, et toute extension d'un PNJ canon le `[[lie]]` sans le réécrire.
