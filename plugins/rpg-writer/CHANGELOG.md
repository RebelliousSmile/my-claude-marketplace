# Changelog — rpg-writer

> Baseline établie le 2026-05-29 à partir de l'état courant. Détail : `git log -- plugins/rpg-writer` (avant 0.4.0 : `git log -- plugins/writing`).

## [0.10.0] — 2026-06-06

### Changed
- **Migration arborescence vault** : tous les dossiers de travail préfixés `_` — `_univers/`, `_systeme/`, `_subsystems/`, `_ecrits/`, `_campagnes/`, `_pjs/`. Variables de chemin mises à jour dans `vault-layout.md` (source de vérité), propagées à tous les skills. **Breaking** : les `bank.yml` existants (champ `project_path` : `<jeu>/ecrits/…`) et les CWD doivent migrer vers `<jeu>/_ecrits/…`.
- **`vault-layout.md`** : arbre ASCII, table des variables, patterns gitignore (`!**/_univers/*/canon/**` etc.), section interopérabilité et table de routage mis à jour.
- **`hermes:solo-mc` → `obsidian:solo-mc`** dans `rules-keeper/SKILL.md` et `vault-layout.md` (suite suppression plugin hermes).
- **Agents stale migrés** : `documentation-architect-jdr` et `claude-code-optimizer-jdr` alignés sur le nouveau modèle (`_univers/`, `<YYYY>/<MM>/`, `<campagne>-session-*.md`).
- Défaut vault Windows : `Perso/JDR` → `Perso/RPG` ; Linux : `~/JDR` → `~/RPG`.
- Repli sous-systèmes partagés : `<vault>/subsystems/` → `<vault>/_subsystems/`.

## [0.7.0] — 2026-06-01

### Added
- **`vault-layout.md` : branche `campagnes/<campagne>/mj/`** (fiction propre à la campagne) + table de routage des faits de fiction (campagne / univers / `systeme/mj/solo.md` / log de session seul).
- **Convention `systeme/mj/solo.md`** : house rules de jeu solo établies **en partie** par `hermes:solo-mc` (distinctes des house rules `rules-keeper --homemade`).
- **Sous-systèmes « structurés comme un jeu »** : `subsystems/<nom>/systeme/{canon,mj}/` (+ `ecrits/` pour la publication), au lieu de `subsystems/<nom>/{canon,mj}/`. `vault-layout.md`, `rules-keeper`, `bank-yml.md` alignés.

### Changed
- Références `obsidian:solo-mc` → **`hermes:solo-mc`** (solo-mc déplacé dans le plugin `hermes`) dans `vault-layout.md`, `rules-keeper/SKILL.md`, `setup/references/bank-yml.md`.

## [0.6.0] — 2026-05-31

### Changed
- **Lore d'univers : `.docs/{canon,mj}/` → `{canon,mj}/` (dossiers visibles).** Le lore quitte le wrapper `.docs/` (masqué par Obsidian) pour vivre directement sous `univers/<univers>/canon/` et `univers/<univers>/mj/`, aligné sur `systeme/{canon,mj}/` et `subsystems/<nom>/{canon,mj}/`. Une seule règle dans tout le coffre : `<root>/{canon,mj}/`. **Breaking** : les `bank.yml` et `config.yaml` qui pointaient vers `univers/<univers>/.docs/canon/` doivent retirer le `.docs/`. `.docs/` reste réservé aux docs internes des projets d'écriture (`ecrits/<projet>/.docs/` : `document-rules.md`, `scenarios-details.md`…). Skills alignés : `lore-extract`, `research`, `review`, `write`, `toc`, `forge`, `setup` (init + audit + `bank-yml.md` + `vault-layout.md`), `rules-keeper`, `tone-finder`, `upgrade`, `tabula-rasa`, `extract-pdf`.
- **`.gitignore` (`tnn-jdr`)** : exceptions `!**/univers/*/canon/**` et `!**/univers/*/mj/**` ajoutées (parallèles à `!**/systeme/canon/**`), avec ré-ignore des `sources/` nichés. `!**/.docs/**` conservé pour les projets d'écriture.

## [0.4.0] — 2026-05-29

### Changed
- **Plugin renommé `writing` → `rpg-writer`.** Breaking : l'identifiant marketplace devient `rpg-writer@my-marketplace` et les skills s'invoquent via `/rpg-writer:<skill>` (ex. `/rpg-writer:lore-extract`, `/rpg-writer:extract-pdf`). Mettre à jour `enabledPlugins` dans les `settings.json` qui activaient `writing@my-marketplace`. Aucun skill ni comportement modifié — renommage pur.

## [0.3.0] — 2026-05-29

### Changed
- **`rules-keeper` distingue canon et maison (mj)** : le ruleset **officiel** est restructuré dans `canon/` (défaut) ; les **house rules** du MJ dans `mj/` (option `--homemade`), sous forme d'overlay qui déclare explicitement les règles canon qu'il modifie (jamais de divergence silencieuse). Règles effectives = canon + house rules déclarées. Vaut pour un système de jeu comme pour un **sous-système générique** (Parallaxe, Cinério, Muses et Oracles…) ; mêmes sous-arbres partagés avec `obsidian:{pc,rpg,solo-mc}` (`JDR/subsystems/<nom>/{canon,mj}/`).
- **`lore-extract` distingue canon et maison (homemade)** : l'arborescence `.docs/` est scindée en deux sous-arbres thématiques identiques — `canon/` (lore officiel extrait des sources, défaut) et `mj/` (contenu maison/non-canon, option `--homemade`). Canon et maison ne sont jamais mélangés dans un même fichier ; le contenu maison ne contredit pas le canon en silence (canon = autorité). Ces sous-arbres sont **partagés avec `obsidian:rpg`** (qui écrit son contenu MJ dans le même `mj/`).

## [0.2.0] — 2026-05-29 (baseline)

Rédaction narrative (romans, scénarios JDR, guides). Skills : `setup`, `forge`, `toc`, `write`, `upgrade`, `review`, `persona`, `tone-finder`, `research`, `storyboard`, `lore-extract`, `extract-pdf`, `rules-keeper`, `tabula-rasa`.

Cycle de vie couvert : initialisation projet (`setup`), concept (`forge`), table des matières (`toc`), écriture des chapitres (`write`), amélioration (`upgrade`), relecture par persona (`review`/`persona`), style (`tone-finder`), recherche et lore (`research`/`lore-extract`/`extract-pdf`), illustration (`storyboard`), règles de jeu (`rules-keeper`), réinitialisation (`tabula-rasa`).

## Antérieur
- Voir `git log -- plugins/rpg-writer plugins/writing` pour l'historique complet (le plugin s'appelait `writing` avant 0.4.0).
