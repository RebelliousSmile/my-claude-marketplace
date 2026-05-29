# Changelog — writing

> Baseline établie le 2026-05-29 à partir de l'état courant. Détail : `git log -- plugins/writing`.

## [0.3.0] — 2026-05-29

### Changed
- **`lore-extract` distingue canon et maison (homemade)** : l'arborescence `.docs/` est scindée en deux sous-arbres thématiques identiques — `canon/` (lore officiel extrait des sources, défaut) et `mj/` (contenu maison/non-canon, option `--homemade`). Canon et maison ne sont jamais mélangés dans un même fichier ; le contenu maison ne contredit pas le canon en silence (canon = autorité). Ces sous-arbres sont **partagés avec `obsidian:rpg`** (qui écrit son contenu MJ dans le même `mj/`).

## [0.2.0] — 2026-05-29 (baseline)

Rédaction narrative (romans, scénarios JDR, guides). Skills : `setup`, `forge`, `toc`, `write`, `upgrade`, `review`, `persona`, `tone-finder`, `research`, `storyboard`, `lore-extract`, `extract-pdf`, `rules-keeper`, `tabula-rasa`.

Cycle de vie couvert : initialisation projet (`setup`), concept (`forge`), table des matières (`toc`), écriture des chapitres (`write`), amélioration (`upgrade`), relecture par persona (`review`/`persona`), style (`tone-finder`), recherche et lore (`research`/`lore-extract`/`extract-pdf`), illustration (`storyboard`), règles de jeu (`rules-keeper`), réinitialisation (`tabula-rasa`).

## Antérieur
- Voir `git log -- plugins/writing` pour l'historique complet.
