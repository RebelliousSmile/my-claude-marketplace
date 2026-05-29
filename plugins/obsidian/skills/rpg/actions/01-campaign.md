# 01 - campaign

Amorce la couche de préparation d'une campagne (la matière MJ), par-dessus le `config.yaml` géré par `solo-mc`.

## Inputs

- `campagne` (requis) — nom de la campagne. Demander si absent ; lister les dossiers de `JDR/` contenant un `config.yaml`.

## Process

1. **Vérifier le `config.yaml`** dans `JDR/<campagne>/`. S'il manque, orienter vers `/solo-mc setup` (ne pas dupliquer le questionnaire), puis reprendre.
2. **Lire le contexte** : `config.yaml` (univers, ton, rythme, difficulté, chaos, profondeur PNJ/lieux) et, si un PJ est rattaché, son `JDR/pjs/<pj>/intention.md` (thèmes, ligne rouge, question viscérale).
3. **Rédiger `JDR/<campagne>/synopsis.md`** : prémisse, thèmes (alignés sur l'intention du PJ), ton, enjeux centraux, vérités cachées, question dramatique de campagne.
4. **Créer la structure de prep** si absente : `scenarios/`, `pnjs/`, `factions/`, `prep/`, plus un `index.md` qui recense scénarios, PNJ, factions et fronts en cours.
5. **Proposer 2–3 fronts de départ** (horloges/agendas) à détailler ensuite via `faction`.

## Outputs

`JDR/<campagne>/synopsis.md` + structure de prep (`scenarios/`, `pnjs/`, `factions/`, `prep/`, `index.md`). Lister les fronts proposés et les sections `[À compléter]`.

## Test

`synopsis.md` existe, ses thèmes renvoient à l'`intention.md` du PJ (si un PJ existe), la structure de prep est créée, et l'`index.md` recense les éléments présents.
