# 01 - campaign

Amorce la couche de préparation d'une campagne (la matière MJ), par-dessus le `config.yaml` géré par `solo-mc`.

## Inputs

- `campagne` (requis) — nom de la campagne. Demander si absent ; lister les dossiers de `JDR/` contenant un `config.yaml`.

## Process

1. **Vérifier le `config.yaml`** dans `JDR/<campagne>/`. S'il manque, orienter vers `/solo-mc setup` (ne pas dupliquer le questionnaire), puis reprendre.
2. **Lire le contexte** : `config.yaml` (univers, ton, rythme, difficulté, chaos, profondeur PNJ/lieux) et, si un PJ est rattaché, son `JDR/pjs/<pj>/intention.md` (thèmes, ligne rouge, question viscérale).
3. **Rattacher l'univers** : depuis `config.yaml › universe`, cibler `JDR/univers/<univers>/`. Si l'arborescence `.docs/` n'existe pas, la créer (fichiers thématiques partagés avec `lore-extract` : `terminologie.md`, `factions.md`, `personnages.md`, `histoire.md`, `geographie.md`) — ou, s'il existe déjà des sources brutes, proposer `/writing:lore-extract` pour les consigner.
4. **Rédiger `JDR/<campagne>/synopsis.md`** : prémisse, thèmes (alignés sur l'intention du PJ), ton, enjeux centraux, vérités cachées, question dramatique de campagne.
5. **Créer la structure de prep de campagne** si absente : `scenarios/`, `prep/`, `fronts.md` (horloges actives), plus un `index.md` qui recense scénarios et fronts en cours et lie l'univers. *(Les PNJ, factions et lieux durables vivent dans l'univers, pas ici.)*
6. **Proposer 2–3 fronts de départ** (horloges) à détailler ensuite via `faction`.

## Outputs

`JDR/<campagne>/synopsis.md` + structure de prep de campagne (`scenarios/`, `prep/`, `fronts.md`, `index.md`) + l'arborescence univers `JDR/univers/<univers>/.docs/` (créée ou identifiée). Lister les fronts proposés et les `[À compléter]`.

## Test

`synopsis.md` existe et ses thèmes renvoient à l'`intention.md` du PJ (si un PJ existe) ; la structure de prep de campagne est créée ; l'univers est rattaché (arborescence `.docs/` présente) ; l'`index.md` lie l'univers et recense les éléments présents.
