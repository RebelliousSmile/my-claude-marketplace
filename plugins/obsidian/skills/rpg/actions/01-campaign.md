# 01 - campaign

Amorce la couche de préparation d'une campagne (la matière MJ), par-dessus le `config.yaml` géré par `solo-mc`.

## Inputs

- `campagne` (requis) — nom de la campagne. Demander si absent ; lister les dossiers de `JDR/` contenant un `config.yaml`.

## Process

1. **Vérifier le `config.yaml`** dans `JDR/<jeu>/campagnes/<campagne>/`. S'il manque, orienter vers `/solo-mc setup` (ne pas dupliquer le questionnaire), puis reprendre.
2. **Lire le contexte** : `config.yaml` (univers, ton, rythme, difficulté, chaos, profondeur PNJ/lieux) et, si un PJ est rattaché, son `JDR/<jeu>/pjs/<pj>/intention.md` (thèmes, ligne rouge, question viscérale).
3. **Rattacher l'univers** : depuis `config.yaml › universe`, cibler `JDR/<jeu>/univers/<univers>/`. Si l'arborescence n'existe pas, créer **deux sous-arbres thématiques** `canon/` (lore officiel) et `mj/` (création MJ), chacun avec `terminologie.md`, `factions.md`, `personnages.md`, `histoire.md`, `geographie.md`. S'il existe des sources brutes canoniques, proposer `/rpg-writer:lore-extract` pour les consigner **dans `canon/`** ; le contenu créé par le MJ ira dans `mj/` (via `npc`, `faction`, `scenario`).
4. **Rédiger `JDR/<jeu>/campagnes/<campagne>/synopsis.md`** : prémisse, thèmes (alignés sur l'intention du PJ), ton, enjeux centraux, vérités cachées, question dramatique de campagne.
5. **Créer la structure de prep de campagne** si absente : `scenarios/`, `prep/`, `fronts.md` (horloges actives), plus un `index.md` qui recense scénarios et fronts en cours et lie l'univers. *(Les PNJ, factions et lieux durables vivent dans l'univers, pas ici.)*
6. **Proposer 2–3 fronts de départ** (horloges) à détailler ensuite via `faction`.

## Outputs

`JDR/<jeu>/campagnes/<campagne>/synopsis.md` + structure de prep de campagne (`scenarios/`, `prep/`, `fronts.md`, `index.md`) + l'arborescence univers `JDR/<jeu>/univers/<univers>/{canon,mj}/` (créée ou identifiée). Lister les fronts proposés et les `[À compléter]`.

## Test

`synopsis.md` existe et ses thèmes renvoient à l'`intention.md` du PJ (si un PJ existe) ; la structure de prep de campagne est créée ; l'univers est rattaché avec ses deux sous-arbres `canon/` et `mj/` ; l'`index.md` lie l'univers et recense les éléments présents.
