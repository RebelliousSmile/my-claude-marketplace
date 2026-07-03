# obs

*Gestion personnelle de notes Obsidian : projets Pro, tri des emails, organisation de l'arborescence `Documents/` — et **assemblage des intrants** (brief, données) consommés par le plugin `writing`.*

Plugin personnel orienté coffre Obsidian (chemins et conventions propres à l'auteur).

**Séparation des responsabilités** : `obs` **rassemble les intrants** (brief, données, init projet) ; `writing` **produit** à partir de ces intrants (et développe le concept via son propre `forge`) ; `ttrpg` (plugin séparé) porte l'outillage JDR solo (`pc`, `campaign`, `solo-mc`) ainsi que la ventilation lore/règles (`lore-extract`, `rules-keeper`) sur le même domaine de jeu `R`.

## Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `project` | `/obs:project` | Gestion des projets Pro (**communication → information**) : create, fill, reorganize, log-session, log-meeting, add-invoice, **distill**, export-rag |
| `mail` | `/obs:mail` | Trie, résume, fusionne et classe les emails exportés en Markdown dans le coffre |
| `tree` | `/obs:tree` | Organiseur de l'arborescence `Documents/`, piloté par un **cache** (pas de layout figé) : index, check, fix, sort (tri par arbitrage) |
| `filler` | `/obs:filler` | Gestion de fichiers de contenu dans n'importe quel répertoire — réduction continue : survey, sort, digest, merge, condense, clean |

### Assemblage des intrants (consommés par `writing` et `ttrpg`)

| Skill | Déclencheur | Description |
|---|---|---|
| `brief` | `/obs:brief` | Construit le répertoire de travail portable `_brief/` (summary.md autosuffisant + personas/ + output-styles/) consommé par writing |
| `research` | `/obs:research` | Recherche documentaire cross-référencée ; extraction de terminologie |
| `extract-pdf` | `/obs:extract-pdf` | Pipeline multi-sessions d'extraction de gros PDF vers les sources |

> **JDR solo** : tout l'outillage JDR (`pc`, `campaign`, `solo-mc`, `lore-extract`, `rules-keeper`) a été extrait dans le plugin `ttrpg`. `obs` reste en amont sur le même domaine de jeu `R` : `extract-pdf` y dépose les sources brutes, `research` y ajoute des rapports de recherche — voir `references/jdr-layout.md`.

## Licence

MIT — voir [LICENSE](../../LICENSE).
