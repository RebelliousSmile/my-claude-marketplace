# ttrpg

*Outillage de JDR solo sur domaines de jeu autonomes (`R`) : fiches de personnage, prépa MJ, jeu en direct sous Claude Code.*

Extrait de `obs` en deux temps — voir `plugins/obs/CHANGELOG.md` : `pc`/`campaign`/`solo-mc` + agents (0.26.0), puis `lore-extract`/`rules-keeper` (0.28.0). `obs` reste en amont sur le même domaine `R` : `extract-pdf` y dépose les sources brutes, `research` y ajoute des rapports de recherche.

## Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `pc` | `/ttrpg:pc` | Gestion des PJ JDR solo (sous-système Parallaxe) : new, fill, reorganize, log-session, show, companion (team) |
| `campaign` | `/ttrpg:campaign` | Prep MJ du JDR solo — écriture de scénarios et préparation de campagne : campaign, scenario, prep-session, npc, faction, review (ex-`obs:rpg`) |
| `solo-mc` | `/ttrpg:solo-mc` | Maître de jeu du JDR solo en direct (**Claude Code**) : play, scene, oracle, roll, setup, journal-pdf… |
| `lore-extract` | `/ttrpg:lore-extract` | Extrait et organise le lore d'univers (canon/ + mj/) depuis les sources brutes produites par `obs:extract-pdf` |
| `rules-keeper` | `/ttrpg:rules-keeper` | Restructure les règles de jeu en format optimisé LLM (canon/ + house rules mj/) depuis les sources brutes produites par `obs:extract-pdf` |

## Agents

| Agent | Rôle |
|---|---|
| `narrateur` | Voix de MJ — génère les scènes, route description/dialogue vers les sous-systèmes, boucle micro-scène |
| `oracle` | Moteur de décision invisible — hasard et décisions du monde, routé vers les sous-systèmes appropriés |

> **Jeu en direct sous Claude Code** : `ttrpg:solo-mc` est le MJ solo, épaulé par les agents `narrateur` et `oracle`. Les outils de prépa (`pc`, `campaign`) jouent avec lui sur les mêmes données de jeu (le domaine `R`).

## Trio JDR solo

`pc` (la fiche du personnage-joueur) · `campaign` (la prep MJ : scénarios, prep de session, fronts) · **`solo-mc`** (le jeu en direct : scene, oracle, roll). On prépare avec `campaign`, on joue avec `solo-mc`. Le système de jeu est défini par la campagne (`config.yaml › system`) ; **Parallaxe, Cinério et Muses et Oracles** sont des **sous-systèmes génériques** qui s'y greffent (ce ne sont pas des jeux).

Arborescence (domaine autonome `R = <jeu>`, résolu localement — voir `references/jdr-layout.md`) : la **campagne** vit dans `R/_campagnes/<campagne>/` (`config.yaml`, `.session-state.yaml`, `pj/` + prep `scenarios/`, `prep/`, `fronts.md` — état durable) ; les **journaux de session datés** vont sous l'axe daté du domaine `R/<AAAA>/<MM>/<campagne>/` (même convention que les projets d'écriture) ; les **données d'univers durables** (terminologie, factions, personnages, lieux, histoire) vivent dans `R/_univers/<univers>/`, **scindées par provenance** : `canon/` (lore officiel, écrit par `lore-extract`) et `mj/` (contenu créé par le maître de jeu, écrit par `campaign`) — même structure thématique. `campaign` n'écrit jamais dans `canon/`.

Les **règles** sont maintenues au format `rules-keeper`, **scindées canon / mj**. Le **système de jeu** vit sous `R/_systeme/{canon,mj}/` — **référence partagée** par `pc`, `campaign` et `solo-mc`. Les **sous-systèmes génériques** (Parallaxe, Cinério, Muses et Oracles…) vivent sous `R/_subsystems/<nom>/{canon,mj}/` et sont **consommés par `solo-mc` seul**. Règles effectives = système + sous-systèmes actifs (canon + house rules déclarées), aucune mécanique inventée hors de ces références.

## Licence

MIT — voir [LICENSE](../../LICENSE).
