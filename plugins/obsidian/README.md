# obsidian

*Gestion personnelle de notes Obsidian : projets Pro, JDR solo (personnages, scénarios, campagne), tri des emails — et **assemblage des intrants** (brief, lore, données) consommés par le plugin `writing`.*

Plugin personnel orienté coffre Obsidian (chemins et conventions propres à l'auteur).

**Séparation des responsabilités** : `obsidian` **rassemble les intrants** (brief, lore, données, init projet) ; `writing` **produit** à partir de ces intrants.

## Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `project` | `/obsidian:project` | Gestion des projets Pro : create, fill, reorganize, log-session, log-meeting, add-invoice, export-rag |
| `pc` | `/obsidian:pc` | Gestion des PJ JDR solo (sous-système Parallaxe) : new, fill, reorganize, log-session, show, companion (team) |
| `rpg` | `/obsidian:rpg` | Prep MJ du JDR solo — écriture de scénarios et préparation de campagne : campaign, scenario, prep-session, npc, faction, review |
| `solo-mc` | `/obsidian:solo-mc` | Maître de jeu du JDR solo en direct (**Claude Code**) : play, scene, oracle, roll, setup, journal-pdf… |
| `mail` | `/obsidian:mail` | Trie, résume, fusionne et classe les emails exportés en Markdown dans le coffre |
| `tree` | `/obsidian:tree` | Organiseur de l'arborescence `Documents/`, piloté par un **cache** (pas de layout figé) : index, check, fix, sort (tri par arbitrage) |

### Assemblage des intrants (consommés par `writing`)

| Skill | Déclencheur | Description |
|---|---|---|
| `brief` | `/obsidian:brief` | Construit le répertoire de travail portable `_brief/` (summary.md autosuffisant + personas/ + output-styles/) consommé par writing |
| `forge` | `/obsidian:forge` | Développe et challenge le concept / brief narratif jusqu'à validation de la structure |
| `research` | `/obsidian:research` | Recherche documentaire cross-référencée ; extraction de terminologie |
| `lore-extract` | `/obsidian:lore-extract` | Extrait et organise le lore d'univers (canon/ + mj/) |
| `rules-keeper` | `/obsidian:rules-keeper` | Restructure les règles de jeu en format optimisé LLM (canon/ + house rules mj/) |
| `extract-pdf` | `/obsidian:extract-pdf` | Pipeline multi-sessions d'extraction de gros PDF vers les sources |

> **Jeu en direct sous Claude Code** : `obsidian:solo-mc` est le MJ solo. Les outils Claude Code (`pc`, `rpg`) jouent avec lui sur les mêmes données de jeu (le domaine `R`).

### Trio JDR solo

`pc` (la fiche du personnage-joueur) · `rpg` (la prep MJ : scénarios, prep de session, fronts) · **`solo-mc`** (le jeu en direct : scene, oracle, roll). On prépare avec `rpg`, on joue avec `solo-mc`. Le système de jeu est défini par la campagne (`config.yaml › system`) ; **Parallaxe, Cinério et Muses et Oracles** sont des **sous-systèmes génériques** qui s'y greffent (ce ne sont pas des jeux).

Arborescence (domaine autonome `R = <jeu>`, résolu localement — voir `references/jdr-layout.md`) : la **campagne** vit dans `R/_campagnes/<campagne>/` (`config.yaml`, `pj/` + prep `scenarios/`, `prep/`, `fronts.md`) ; les **journaux de session** vont dans `R/_campagnes/<campagne>/<AAAA>/<MM>/` ; les **données d'univers durables** (terminologie, factions, personnages, lieux, histoire) vivent dans `R/_savoir/univers/<univers>/`, **scindées par provenance** : `canon/` (lore officiel, écrit par `lore-extract`) et `mj/` (contenu créé par le maître de jeu, écrit par `rpg`) — même structure thématique, **partagée avec `lore-extract`**. `rpg` n'écrit jamais dans `canon/`.

Les **règles** sont maintenues au format `rules-keeper`, **scindées canon / mj**. Le **système de jeu** vit sous `R/_savoir/systeme/{canon,mj}/` — **référence partagée** par `pc`, `rpg` et `solo-mc`. Les **sous-systèmes génériques** (Parallaxe, Cinério, Muses et Oracles…) vivent sous `R/_savoir/subsystems/<nom>/{canon,mj}/` et sont **consommés par `solo-mc` seul**. Règles effectives = système + sous-systèmes actifs (canon + house rules déclarées), aucune mécanique inventée hors de ces références.

## Licence

MIT — voir [LICENSE](../../LICENSE).
