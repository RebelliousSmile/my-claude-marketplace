# obsidian

*Gestion personnelle de notes Obsidian : projets Pro, JDR solo (personnages, scénarios, campagne) et tri des emails exportés.*

Plugin personnel orienté coffre Obsidian (chemins et conventions propres à l'auteur).

## Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `project` | `/obsidian:project` | Gestion des projets Pro : create, fill, reorganize, log-session, log-meeting, add-invoice, export-rag |
| `pc` | `/obsidian:pc` | Gestion des PJ JDR solo (sous-système Parallaxe) : new, fill, reorganize, log-session, show, companion (team) |
| `rpg` | `/obsidian:rpg` | Prep MJ du JDR solo — écriture de scénarios et préparation de campagne : campaign, scenario, prep-session, npc, faction, review |
| `solo-mc` | `/obsidian:solo-mc` | Maître de jeu du JDR solo en direct (**Claude Code**) : play, scene, oracle, roll, setup, journal-pdf… |
| `mail` | `/obsidian:mail` | Trie, résume, fusionne et classe les emails exportés en Markdown dans le coffre |

> **Deux runtimes pour le jeu en direct** : `obsidian:solo-mc` (ici, **Claude Code**) et `hermes:solo-mc` (plugin `hermes`, **Hermes Agent**) sont deux portages du même MJ solo, partageant le coffre. Les outils Claude Code (`pc`, `rpg`) jouent avec `obsidian:solo-mc`.

### Trio JDR solo

`pc` (la fiche du personnage-joueur) · `rpg` (la prep MJ : scénarios, prep de session, fronts) · **`solo-mc`** (le jeu en direct : scene, oracle, roll). On prépare avec `rpg`, on joue avec `solo-mc` (variante Claude Code ici ; `hermes:solo-mc` pour le runtime Hermes Agent). Le système de jeu est défini par la campagne (`config.yaml › system`) ; **Parallaxe, Cinério et Muses et Oracles** sont des **sous-systèmes génériques** qui s'y greffent (ce ne sont pas des jeux).

Arborescence : la **campagne** vit dans `RPG/<jeu>/_campagnes/<campagne>/` (`config.yaml`, `pj/` + prep `scenarios/`, `prep/`, `fronts.md`) ; les **journaux de session** vont dans `RPG/<jeu>/<YYYY>/<MM>/` ; les **données d'univers durables** (terminologie, factions, personnages, lieux, histoire) vivent dans `RPG/<jeu>/_univers/<univers>/`, **scindées par provenance** : `canon/` (lore officiel, écrit par `lore-extract`) et `mj/` (contenu créé par le maître de jeu, écrit par `rpg`) — même structure thématique, **partagée avec `lore-extract`** (plugin `writing`). `rpg` n'écrit jamais dans `canon/`.

Les **règles** (système de jeu + ses **sous-systèmes génériques** : Parallaxe, Cinério, Muses et Oracles…) sont maintenues au format `writing:rules-keeper`, **scindées canon / mj**, sous `RPG/<jeu>/_subsystems/<nom>/canon/` (règles officielles) + `RPG/<jeu>/_subsystems/<nom>/mj/` (house rules du MJ, qui déclarent ce qu'elles modifient). C'est **la référence partagée** par `pc`, `rpg` et `solo-mc` ; règles effectives = système de jeu + sous-systèmes actifs (canon + house rules déclarées), aucune mécanique inventée hors de ces références.

## Licence

MIT — voir [LICENSE](../../LICENSE).
