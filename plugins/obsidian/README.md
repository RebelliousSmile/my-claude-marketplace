# obsidian

*Gestion personnelle de notes Obsidian : projets Pro, JDR solo (personnages, scénarios, campagne) et tri des emails exportés.*

Plugin personnel orienté coffre Obsidian (chemins et conventions propres à l'auteur).

## Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `project` | `/obsidian:project` | Gestion des projets Pro : create, fill, reorganize, log-session, log-meeting, add-invoice, export-rag |
| `pc` | `/obsidian:pc` | Gestion des PJ JDR solo (sous-système Parallaxe) : new, fill, reorganize, log-session, show, companion (team) |
| `rpg` | `/obsidian:rpg` | Prep MJ du JDR solo — écriture de scénarios et préparation de campagne : campaign, scenario, prep-session, npc, faction, review |
| `mail` | `/obsidian:mail` | Trie, résume, fusionne et classe les emails exportés en Markdown dans le coffre |

> Le jeu en direct (`solo-mc` : scene, oracle, roll, journal-pdf…) a quitté ce plugin pour **`hermes:solo-mc`** — voir le plugin `hermes`.

### Trio JDR solo

`pc` (la fiche du personnage-joueur) · `rpg` (la prep MJ : scénarios, prep de session, fronts) · **`hermes:solo-mc`** (le jeu en direct : scene, oracle, roll — dans le plugin `hermes`). On prépare avec `rpg`, on joue avec `hermes:solo-mc`. Le système de jeu est défini par la campagne (`config.yaml › system`) ; **Parallaxe, Cinério et Muses et Oracles** sont des **sous-systèmes génériques** qui s'y greffent (ce ne sont pas des jeux).

Arborescence : la **campagne** vit dans `JDR/<campagne>/` (`config.yaml`, `sessions/`, `pj/` + prep `scenarios/`, `prep/`, `fronts.md`) ; les **données d'univers durables** (terminologie, factions, personnages, lieux, histoire) vivent dans `JDR/univers/<univers>/`, **scindées par provenance** : `canon/` (lore officiel, écrit par `lore-extract`) et `mj/` (contenu créé par le maître de jeu, écrit par `rpg`) — même structure thématique, **partagée avec `lore-extract`** (plugin `writing`). `rpg` n'écrit jamais dans `canon/`.

Les **règles** (système de jeu + ses **sous-systèmes génériques** : Parallaxe, Cinério, Muses et Oracles…) sont maintenues au format `writing:rules-keeper`, **scindées canon / mj**, sous `JDR/subsystems/<nom>/canon/` (règles officielles) + `JDR/subsystems/<nom>/mj/` (house rules du MJ, qui déclarent ce qu'elles modifient). C'est **la référence partagée** par `pc`, `rpg` et `solo-mc` ; règles effectives = système de jeu + sous-systèmes actifs (canon + house rules déclarées), aucune mécanique inventée hors de ces références.

## Licence

MIT — voir [LICENSE](../../LICENSE).
