# obs

*Gestion personnelle de notes Obsidian : projets Pro, tri des emails, organisation de l'arborescence `Documents/` — et **assemblage des intrants** (brief, lore, données) consommés par le plugin `writing`.*

Plugin personnel orienté coffre Obsidian (chemins et conventions propres à l'auteur).

**Séparation des responsabilités** : `obs` **rassemble les intrants** (brief, lore, données, init projet) ; `writing` **produit** à partir de ces intrants ; `ttrpg` (plugin séparé) porte l'outillage JDR solo (`pc`, `campaign`, `solo-mc`) qui consomme `lore-extract`/`rules-keeper` produits ici.

## Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `project` | `/obs:project` | Gestion des projets Pro : create, fill, reorganize, log-session, log-meeting, add-invoice, export-rag |
| `mail` | `/obs:mail` | Trie, résume, fusionne et classe les emails exportés en Markdown dans le coffre |
| `tree` | `/obs:tree` | Organiseur de l'arborescence `Documents/`, piloté par un **cache** (pas de layout figé) : index, check, fix, sort (tri par arbitrage) |
| `filler` | `/obs:filler` | Gestion de fichiers de contenu dans n'importe quel répertoire — réduction continue : survey, sort, digest, merge, condense, clean |

### Assemblage des intrants (consommés par `writing` et `ttrpg`)

| Skill | Déclencheur | Description |
|---|---|---|
| `brief` | `/obs:brief` | Construit le répertoire de travail portable `_brief/` (summary.md autosuffisant + personas/ + output-styles/) consommé par writing |
| `forge` | `/obs:forge` | Développe et challenge le concept / brief narratif jusqu'à validation de la structure |
| `research` | `/obs:research` | Recherche documentaire cross-référencée ; extraction de terminologie |
| `lore-extract` | `/obs:lore-extract` | Extrait et organise le lore d'univers (canon/ + mj/) — partagé avec `ttrpg:campaign` |
| `rules-keeper` | `/obs:rules-keeper` | Restructure les règles de jeu en format optimisé LLM (canon/ + house rules mj/) — partagé avec la suite `ttrpg` |
| `extract-pdf` | `/obs:extract-pdf` | Pipeline multi-sessions d'extraction de gros PDF vers les sources |

> **JDR solo** : l'outillage de jeu (`pc`, `campaign`, `solo-mc`) a été extrait dans le plugin `ttrpg`. Il consomme `lore-extract` et `rules-keeper` (restés ici) sur le même domaine de jeu `R` — voir `references/jdr-layout.md`.

## Licence

MIT — voir [LICENSE](../../LICENSE).
