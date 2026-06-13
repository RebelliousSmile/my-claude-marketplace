# JDR Layout — convention locale d'un domaine de jeu

Référence unique de l'arborescence d'un **domaine JDR** (`R = <jeu>`) et de la façon dont les skills JDR s'y repèrent. Pointée par tous les skills JDR d'obsidian (producteurs et jeu en direct).

> **Pas de coffre global, pas de config par machine.** Plus de `<vault>`, plus de `~/.jdr.yaml`, plus de dépôt séparé. Un domaine JDR est un **répertoire autonome** dans `Documents/` (typiquement `Perso/RPG/<jeu>/`) : tout ce dont le jeu a besoin vit dessous, en chemins **relatifs**. Déplace le domaine n'importe où → tous les skills continuent de fonctionner.

---

## Résolution de `R` (locale, découverte — jamais hardcodée)

Chaque skill opère relativement à un **répertoire de référence** : l'argument passé, sinon le **CWD**. Quand il a besoin du niveau domaine `R`, il le **découvre** :

1. Partir du répertoire de référence (argument ou CWD).
2. Remonter les parents jusqu'au premier dossier contenant le **marqueur de domaine** `_savoir/`. Ce dossier est `R`. (`bank.yml` est un cache régénérable, pas un marqueur : un domaine initialisé a toujours `_savoir/`.)
3. Aucun marqueur trouvé → la cible n'est pas dans un domaine JDR initialisé : le signaler et proposer d'initialiser `R` au répertoire de référence (création de `_savoir/`).
4. Toujours vérifier l'existence d'un chemin résolu avant lecture/écriture.

Ce mécanisme est le pendant JDR de la résolution d'ancre de `obsidian:tree` (qui remonte jusqu'à `Perso`/`Pro`) — mais ici le marqueur est **le contenu de `R`**, pas un nom de segment imposé. Aucun chemin absolu en dur dans un skill.

---

## Variables de chemin (toutes relatives à `R`)

| Variable | Valeur résolue |
|----------|----------------|
| `R` | Racine du domaine de jeu — **découverte** (voir ci-dessus). Autonome et déplaçable. |
| `<savoir>` | `R/_savoir/` — savoir durable partagé du domaine |
| `<systeme-root>` | `R/_savoir/systeme/` |
| `<subsys-root>` | `R/_savoir/subsystems/<nom>/` |
| `<univers-root>` | `R/_savoir/univers/<univers>/` |
| `<pj-root>` | `R/_pjs/<pj>/` — état durable du PJ (pc) |
| `<campagne-root>` | `R/_campagnes/<campagne>/` — **prep + état durable** : `config.yaml`, `.session-state.yaml`, `mj/`, `research/` (rpg, solo-mc) |
| `<session-root>` | `R/<AAAA>/<MM>/<campagne\|pj>/` — **journaux de session datés** (solo-mc, pc) ; même axe daté que `<projet-root>`, feuille = campagne ou PJ |
| `<projet-root>` | `R/<AAAA>/<MM>/<projet>/` — projet d'écriture daté (modèle `brief`→`writing`) |
| `<sources>` | `<univers-root>/sources/<source>/` (lore) ou `<systeme-root>/sources/<source>/` (règles) |

> **Invariants de portabilité** (voir `obsidian:tree › tree-convention.md`) : les répertoires **de travail** sont préfixés `_` (`_savoir`, `_pjs`, `_campagnes`, `_brief`, `_output`) ; leur **contenu interne ne l'est pas** (`_savoir/systeme/`, pas `_savoir/_systeme/`). Slugs `kebab-case` portables ; dates `AAAA`/`MM` bien formées.

---

## Arborescence d'un domaine `R`

```
Perso/RPG/<jeu>/                       ← R = domaine autonome (un jeu)
├── bank.yml                           ← manifeste des ressources de R (cache, maintenu par obsidian:tree)
├── .current-session                   ← marqueur de la campagne active dans R (état, non versionné si voulu)
├── _shared/                           ← outillage/templates du domaine (ex. pj-manager.py, pj-template) — autonome dans R
├── _savoir/                           ← savoir durable partagé (canon/mj)
│   ├── systeme/
│   │   ├── canon/                     ← règles officielles restructurées (rules-keeper)
│   │   ├── mj/                        ← règles maison
│   │   │   └── solo.md                ← house rules de jeu SOLO établies en partie (solo-mc)
│   │   └── sources/<source>/          ← règles brutes (extract-pdf)
│   ├── subsystems/
│   │   └── <nom>/                     ← module générique greffé (parallaxe, cinerio, muses-et-oracles…)
│   │       ├── canon/                 ← règles du sous-système (rules-keeper)
│   │       ├── mj/
│   │       └── sources/<source>/      ← cartes / règles brutes (extract-pdf)
│   └── univers/
│       └── <univers>/                 ← un setting = un univers du jeu
│           ├── canon/                 ← lore officiel ventilé depuis sources/ (lore-extract)
│           │   ├── terminologie.md
│           │   ├── factions.md
│           │   └── ...
│           ├── mj/                    ← lore maison / non-canon (lore-extract --homemade, rpg)
│           ├── research/              ← rapports de recherche, portée univers (research)
│           └── sources/<source>/      ← lore brut (extract-pdf)
├── _pjs/
│   └── <pj>/                          ← personnages (pc)
├── _campagnes/
│   └── <campagne>/                    ← prep (rpg) + état durable de la campagne
│       ├── config.yaml                ← système, PJ, sous-systèmes actifs
│       ├── .session-state.yaml        ← état mécanique courant (solo-mc)
│       ├── mj/                        ← fiction décidée en partie (solo-mc)
│       └── research/                  ← rapports de recherche, portée campagne (research)
└── <AAAA>/<MM>/                       ← axe daté du domaine (unités de travail datées)
    ├── <campagne>/                    ← journaux de session datés (solo-mc) — `<campagne>-session-<AAAA-MM-JJ>-<N>.md`
    ├── <pj>/                          ← journaux de session perso datés (pc)
    └── <projet>/                      ← projet d'écriture (forge → _brief → writing → _output)
        ├── _brief/
        └── _output/
```

> **Publier un sous-système** (le décrire pour diffusion) = un projet d'écriture ordinaire sous `R/<AAAA>/<MM>/<projet>/` ; son canon de jeu reste dans `_savoir/subsystems/<nom>/`.

---

## Canon vs maison (mj) — provenance, jamais mélangée

Lore et règles sont scindés par **provenance** en deux sous-arbres thématiques identiques :

- `canon/` — contenu **officiel** (extrait de sources canoniques). Fait foi.
- `mj/` — contenu **maison / non-canon** (créé par l'auteur ou le MJ ; `--homemade`). Pour les règles, c'est un **overlay** qui déclare explicitement quelle règle canon il remplace/étend.

Ne **jamais** mélanger les deux dans un même fichier. Le contenu maison ne contredit pas le canon en silence — signaler toute divergence (le canon fait autorité ; au jeu, une house rule déclarée prime). Une info vit dans **un seul** fichier ; les autres référencent.

---

## Pipeline canon — frontière décidée

```
PDF officiel
    ↓
extract-pdf          → sources de référence brutes (fidèles, non interprétées)
    ├── lore/terminologie → <univers-root>/sources/<source>/
    └── règles           → <systeme-root>/sources/<source>/  (ou <subsys-root>/sources/<source>/)
                                      ↓
lore-extract         → ventile sources/ vers <univers-root>/canon/   (ou mj/)
rules-keeper         → ventile sources/ vers <systeme-root>/canon/    (ou mj/, ou <subsys-root>/canon/)
```

**Règle d'or :** `extract-pdf` n'écrit **jamais** dans `canon/` ni `mj/` directement. Sa sortie (`sources/`) est un document de référence brut qui attend la ventilation.

| Input (sources) | Output (ventilé) |
|-----------------|------------------|
| `<univers-root>/sources/<source>/lore.md` | `<univers-root>/canon/<theme>.md` |
| `<univers-root>/sources/<source>/terminology.md` | `<univers-root>/canon/terminologie.md` |
| `<systeme-root>/sources/<source>/rules.md` | `<systeme-root>/canon/<fichier>.md` |
| `<subsys-root>/sources/<source>/rules.md` | `<subsys-root>/canon/<fichier>.md` |
| Sources maison (`--homemade`) | le `mj/` correspondant |

> Les `sources/` sont **volumineuses, dérivées de matériel commercial, et régénérables** depuis les PDF. Si `R` est versionné, c'est le bon candidat à gitignorer (`**/sources/`) — mais c'est un choix local au dépôt qui héberge `R`, pas une dépendance des skills.

---

## Routage des faits de fiction (solo-mc)

Quand `obsidian:solo-mc` décide un fait en cours de partie, choisir la destination selon la portée :

| Destination | Ce qui va ici |
|---|---|
| `<campagne-root>/mj/` | Fait de fiction propre à la campagne en cours |
| `<univers-root>/mj/` | Fait de portée mondiale, réutilisable entre campagnes |
| `<systeme-root>/mj/solo.md` | Règle de conduite du jeu solo établie en partie |
| Log de session seul | Détail trivial / sans enjeu |

`<systeme-root>/mj/solo.md` n'accueille **que des règles** ; un fait de fiction durable va dans un `mj/` de fiction (univers ou campagne), jamais ici.

---

## Recherche documentaire (`research`) — par portée

`research` écrit selon une **portée** explicite (jamais « univers » par défaut) :

| Portée | Rapport de travail | Trouvailles vérifiées |
|--------|--------------------|-----------------------|
| **Setting/univers** (durable, partagé) | `<univers-root>/research/<slug>-<date>.md` | `<univers-root>/canon/<thème>.md` |
| **Campagne** (propre à une partie) | `<campagne-root>/research/<slug>-<date>.md` | restent dans la prep de campagne (`rpg`) ; promues en canon **sur décision explicite** |
| **Projet d'écriture** | `<projet-root>/research/<slug>-<date>.md` | `canon/` de l'univers du projet |

---

## Interopérabilité interne (obsidian)

Les sous-arbres `canon/` + `mj/` sont **partagés** au sein du plugin obsidian :

- `_savoir/systeme/{canon,mj}/` — référence mécanique partagée par `solo-mc`, `pc`, `rpg`. `mj/solo.md` est **écrit par `solo-mc`** en partie.
- `_savoir/subsystems/<nom>/{canon,mj}/` — **produit par `rules-keeper`, consommé par `solo-mc` uniquement** (outils de jeu en direct) ; ni `pc` ni `rpg` ne les référencent.
- `_savoir/univers/<univers>/{canon,mj}/` — `lore-extract` écrit `canon/` ; `rpg` écrit `mj/` (jamais `canon/`).
- `_campagnes/<campagne>/mj/` — **écrit par `solo-mc`** (périmètre campagne seul).

Ne jamais renommer ni déplacer ces dossiers sans coordination : c'est le contrat d'interopérabilité entre skills JDR.
