# obsidian

*Gestion personnelle de notes Obsidian : projets Pro, JDR solo (personnages, scénarios, campagne) et tri des emails exportés.*

Plugin personnel orienté coffre Obsidian (chemins et conventions propres à l'auteur).

## Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `project` | `/obsidian:project` | Gestion des projets Pro : create, fill, reorganize, log-session, log-meeting, add-invoice, export-rag |
| `pc` | `/obsidian:pc` | Gestion des PJ JDR solo (Jauges & Tarot) : new, fill, reorganize, log-session, show |
| `rpg` | `/obsidian:rpg` | Prep MJ du JDR solo — écriture de scénarios et préparation de campagne : campaign, scenario, prep-session, npc, faction, review |
| `mail` | `/obsidian:mail` | Trie, résume, fusionne et classe les emails exportés en Markdown dans le coffre |

### Trio JDR solo

`pc` (la fiche du personnage-joueur) · `rpg` (la prep MJ : scénarios, PNJ, factions/fronts, prep de session) · [`solo-mc`](../aidd-overlay/README.md) du plugin `aidd-overlay` (le jeu en direct : scene, oracle, roll). On prépare avec `rpg`, on joue avec `solo-mc`. Campagne dans `JDR/<campagne>/` (`config.yaml`, `sessions/`, `pj/` + couche de prep `scenarios/`, `pnjs/`, `factions/`, `prep/`).

## Licence

MIT — voir [LICENSE](../../LICENSE).
