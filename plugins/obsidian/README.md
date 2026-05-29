# obsidian

*Gestion personnelle de notes Obsidian : projets Pro, JDR solo (personnages, scénarios, campagne) et tri des emails exportés.*

Plugin personnel orienté coffre Obsidian (chemins et conventions propres à l'auteur).

## Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `project` | `/obsidian:project` | Gestion des projets Pro : create, fill, reorganize, log-session, log-meeting, add-invoice, export-rag |
| `pc` | `/obsidian:pc` | Gestion des PJ JDR solo (sous-système Parallaxe) : new, fill, reorganize, log-session, show |
| `rpg` | `/obsidian:rpg` | Prep MJ du JDR solo — écriture de scénarios et préparation de campagne : campaign, scenario, prep-session, npc, faction, review |
| `solo-mc` | `/obsidian:solo-mc` | Maître de jeu du JDR solo en direct : play, scene, oracle, roll, setup, journal-pdf… |
| `mail` | `/obsidian:mail` | Trie, résume, fusionne et classe les emails exportés en Markdown dans le coffre |

### Trio JDR solo

`pc` (la fiche du personnage-joueur) · `rpg` (la prep MJ : scénarios, prep de session, fronts) · `solo-mc` (le jeu en direct : scene, oracle, roll). On prépare avec `rpg`, on joue avec `solo-mc`. Le système de jeu est défini par la campagne (`config.yaml › system`) ; **Parallaxe** est un **sous-système** de règles qui s'y greffe (pas un jeu).

Arborescence : la **campagne** vit dans `JDR/<campagne>/` (`config.yaml`, `sessions/`, `pj/` + prep `scenarios/`, `prep/`, `fronts.md`) ; les **données d'univers durables** (terminologie, factions, personnages, lieux, histoire) vivent dans `JDR/univers/<univers>/.docs/`, **scindées par provenance** : `canon/` (lore officiel, écrit par `lore-extract`) et `mj/` (contenu créé par le maître de jeu, écrit par `rpg`) — même structure thématique, **partagée avec `lore-extract`** (plugin `writing`). `rpg` n'écrit jamais dans `canon/`.

Les **règles** (système de jeu + le **sous-système Parallaxe** qu'il emploie) sont maintenues au format `writing:rules-keeper`, **scindées canon / mj**. Pour Parallaxe : `JDR/parallaxe/canon/` (règles officielles du sous-système) + `JDR/parallaxe/mj/` (house rules du MJ, qui déclarent ce qu'elles modifient). C'est **la référence partagée** par `pc`, `rpg` et `solo-mc` ; règles effectives = canon + house rules déclarées, aucune mécanique inventée hors de cette référence.

## Licence

MIT — voir [LICENSE](../../LICENSE).
