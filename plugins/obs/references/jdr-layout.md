# JDR Layout — convention locale d'un domaine de jeu

Référence unique de l'arborescence d'un **domaine JDR** (`R = <jeu>`) et de la façon dont les skills JDR s'y repèrent. Pointée par tous les skills JDR d'obs (producteurs et jeu en direct).

> **Pas de coffre global, pas de config par machine.** Plus de `<vault>`, plus de `~/.jdr.yaml`, plus de dépôt séparé. Un domaine JDR est un **répertoire autonome** dans `Documents/` (typiquement `Perso/RPG/<jeu>/`) : tout ce dont le jeu a besoin vit dessous, en chemins **relatifs**. Déplace le domaine n'importe où → tous les skills continuent de fonctionner.

---

## Résolution de `R` (locale, découverte — jamais hardcodée)

Chaque skill opère relativement à un **répertoire de référence** : l'argument passé, sinon le **CWD**. Quand il a besoin du niveau domaine `R`, il le **découvre** :

1. Partir du répertoire de référence (argument ou CWD).
2. Remonter les parents jusqu'au premier dossier contenant l'un des **marqueurs de domaine** : `_campagnes/`, `_univers/` ou `_pjs/`. Ce dossier est `R`.
3. Aucun marqueur trouvé → la cible n'est pas dans un domaine JDR initialisé : le signaler et proposer d'initialiser `R` au répertoire de référence (création de `_campagnes/`).
4. Toujours vérifier l'existence d'un chemin résolu avant lecture/écriture.

Ce mécanisme est le pendant JDR de la résolution d'ancre de `obs:tree` (qui remonte jusqu'à `Perso`/`Pro`) — mais ici le marqueur est **le contenu de `R`**, pas un nom de segment imposé. Aucun chemin absolu en dur dans un skill.

---

## Variables de chemin (toutes relatives à `R`)

| Variable | Valeur résolue |
|----------|----------------|
| `R` | Racine du domaine de jeu — **découverte** (voir ci-dessus). Autonome et déplaçable. |
| `<univers-root>` | `R/_univers/<univers>/` — lore d'un univers du jeu |
| `<systeme-root>` | `R/_systeme/` — règles du système de jeu |
| `<subsys-root>` | `R/_subsystems/<nom>/` — sous-systèmes génériques greffés (parallaxe, cinério…) |
| `<pj-root>` | `R/_pjs/<pj>/` — état durable du PJ (pc) |
| `<campagne-root>` | `R/_campagnes/<campagne>/` — **prep + état durable** : `config.yaml`, `.session-state.yaml`, `mj/`, `research/` (rpg, solo-mc) |
| `<ecrits-root>` | `R/_ecrits/<projet>/` — projet d'écriture (writing pipeline) ; `bank.yml` à la racine |
| `<session-root>` | `R/<AAAA>/<MM>/<campagne\|pj>/` — **journaux de session datés** (solo-mc, pc) ; fichier `session-<AAAA-MM-JJ>-<N>.md` (**sans** préfixe slug — redondant avec le dossier parent). Scan : `session-*.md` (tolère d'anciens noms `session-N.md`). Ordre/numérotation : voir **Ordre canonique des séances** ci-dessous. |
| `<sources>` | `<univers-root>/sources/<source>/` (lore) ou `<systeme-root>/sources/<source>/` (règles) |

### Ordre canonique des séances (clé partagée `play` / `play-resume` / `pc`)

Le **numéro de séance `<N>`** fait foi pour l'ordre — pas la date du nom, pas l'ordre lexicographique, pas le `mtime`, pas `config.yaml`. La procédure porte sur **une seule entité** (la **campagne** courante pour `solo-mc`, le **PJ** pour `pc`) : un PJ jouant dans plusieurs campagnes a une séquence `<N>` **indépendante par campagne** — ne jamais agréger les `session-*.md` de plusieurs `<campagne>/` dans un même calcul de `<N>`. Procédure, sur l'ensemble des `session-*.md` balayés dans **tous** les mois `R/<AAAA>/<MM>/<entité>/` (même `<entité>`, tous `<AAAA>/<MM>`) :

1. **Exclure** les fichiers non-séance : tout nom contenant un marqueur auxiliaire (`-prep-`, `-prep`, etc.). Ils ne comptent ni pour `<N>` ni comme « dernière séance ».
2. **Extraire `<N>`** par forme du suffixe (après le préfixe `session-`) :
   - `session-<N>.md` (compteur nu, ex. `session-4.md`) → `<N>` = l'entier.
   - `session-<AAAA-MM-JJ>-<N>.md` (daté **+ suffixe**, ex. `session-2026-06-01-03.md`) → `<N>` = le segment numérique **après** la date (ici `3`) ; **jamais** un composant de la date.
   - `session-<AAAA-MM-JJ>.md` (daté **sans** suffixe, ex. `session-2025-12-03.md`) → **pas de `<N>`** (legacy) : le `JJ` (`03`) est le **jour**, pas un numéro. Ne pas le compter comme `<N>`.
3. **Prochain numéro** : `<N>_next = max(<N> extraits) + 1`. S'il n'existe aucun fichier numéroté (que des datés-purs legacy), `<N>_next = (nombre de séances datées-pures) + 1`.
4. **« Dernière séance »** (référence du recap « Précédemment… » et cible de `play-resume` *latest*) = le fichier de `<N>` **maximal**. En cas d'égalité de `<N>` (collision legacy, ex. `session-3.md` ⟷ `session-2026-06-01-03.md`), départager par date du nom puis `mtime`. À défaut total de numéro, la dernière = la date du nom la plus récente, puis `mtime`.

> Cette même clé sert à `play` (calcul de `<N>` + source du recap) et à `play-resume` (sélection de *latest*) : les deux doivent désigner **la même** séance.

> **Invariants de portabilité** (voir `obs:tree › tree-convention.md`) : les répertoires **de travail** sont préfixés `_` (`_univers`, `_systeme`, `_pjs`, `_campagnes`, `_ecrits`, `_subsystems`…) ; leur **contenu interne ne l'est pas** (`_univers/snake-bay/`, pas `_univers/_snake-bay/`). Slugs `kebab-case` portables ; dates `AAAA`/`MM` bien formées.

---

## Arborescence d'un domaine `R`

```
Perso/RPG/<jeu>/                       ← R = domaine autonome (un jeu)
├── bank.yml                           ← manifeste des ressources de R (cache, maintenu par obs:tree)
├── .current-session                   ← marqueur de la campagne active dans R (état, non versionné si voulu)
├── _shared/                           ← outillage/templates du domaine (ex. pj-manager.py, pj-template)
├── _univers/
│   └── <univers>/                     ← un setting = un univers du jeu (plusieurs possibles)
│       ├── canon/                     ← lore officiel ventilé depuis sources/ (lore-extract)
│       │   ├── terminologie.md
│       │   ├── factions.md
│       │   └── ...
│       ├── mj/                        ← lore maison / non-canon (lore-extract --homemade, rpg)
│       ├── research/                  ← rapports de recherche, portée univers (research)
│       └── sources/<source>/          ← lore brut (extract-pdf)
├── _systeme/                          ← règles du système de jeu
│   ├── canon/                         ← règles officielles restructurées (rules-keeper)
│   ├── mj/                            ← règles maison
│   │   └── solo.md                    ← house rules de jeu SOLO établies en partie (solo-mc)
│   └── sources/<source>/              ← règles brutes (extract-pdf)
├── _subsystems/                       ← présent uniquement si des sous-systèmes génériques sont actifs
│   └── <nom>/                         ← module générique greffé (parallaxe, cinerio, muses-et-oracles…)
│       ├── canon/                     ← règles du sous-système (rules-keeper)
│       ├── mj/
│       └── sources/<source>/
├── _pjs/
│   └── <pj>/                          ← personnages (pc)
├── _campagnes/
│   └── <campagne>/                    ← prep (rpg) + état durable de la campagne
│       ├── config.yaml                ← système, PJ, sous-systèmes actifs
│       ├── .session-state.yaml        ← état mécanique courant (solo-mc)
│       ├── mj/                        ← fiction décidée en partie (solo-mc)
│       └── research/                  ← rapports de recherche, portée campagne (research)
├── _ecrits/
│   └── <projet>/                      ← projet d'écriture (writing pipeline)
│       ├── bank.yml                   ← manifeste de ressources du projet (chemins relatifs à R)
│       └── ...                        ← chapitres/, output/, .toc/, personas/, etc.
└── <AAAA>/<MM>/                       ← axe daté du domaine (journaux de jeu)
    ├── <campagne>/                    ← journaux de session datés (solo-mc) — `session-<AAAA-MM-JJ>-<N>.md`
    └── <pj>/                          ← journaux de session perso datés (pc)
```

> **Publier un sous-système** (le décrire pour diffusion) = un projet d'écriture ordinaire sous `R/<AAAA>/<MM>/<projet>/` ; son canon de jeu reste dans `_subsystems/<nom>/`.

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
    ├── lore/terminologie → `<univers-root>/sources/<source>/`
    └── règles           → `<systeme-root>/sources/<source>/`  (ou `<subsys-root>/sources/<source>/`)
                                      ↓
lore-extract         → ventile sources/ vers `<univers-root>/canon/`   (ou `mj/`)
rules-keeper         → ventile sources/ vers `<systeme-root>/canon/`    (ou `mj/`, ou `<subsys-root>/canon/`)
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

Quand `obs:solo-mc` décide un fait en cours de partie, choisir la destination selon la portée :

| Destination | Ce qui va ici |
|---|---|
| `R/_campagnes/<campagne>/mj/` | Fait de fiction propre à la campagne en cours |
| `R/_univers/<univers>/mj/` | Fait de portée mondiale, réutilisable entre campagnes |
| `R/_systeme/mj/solo.md` | Règle de conduite du jeu solo établie en partie |
| Log de session seul | Détail trivial / sans enjeu |

`R/_systeme/mj/solo.md` n'accueille **que des règles** ; un fait de fiction durable va dans un `mj/` de fiction (univers ou campagne), jamais ici.

---

## Recherche documentaire (`research`) — par portée

`research` écrit selon une **portée** explicite (jamais « univers » par défaut) :

| Portée | Rapport de travail | Trouvailles vérifiées |
|--------|--------------------|-----------------------|
| **Setting/univers** (durable, partagé) | `<univers-root>/research/<slug>-<date>.md` | `<univers-root>/canon/<thème>.md` |
| **Campagne** (propre à une partie) | `<campagne-root>/research/<slug>-<date>.md` | restent dans la prep de campagne (`rpg`) ; promues en canon **sur décision explicite** |
| **Projet d'écriture** | `<projet-root>/research/<slug>-<date>.md` | `canon/` de l'univers du projet |

---

## Interopérabilité interne (obs)

Les sous-arbres `canon/` + `mj/` sont **partagés** au sein du plugin obs :

- `_systeme/{canon,mj}/` — référence mécanique partagée par `solo-mc`, `pc`, `rpg`. `mj/solo.md` est **écrit par `solo-mc`** en partie.
- `_subsystems/<nom>/{canon,mj}/` — **produit par `rules-keeper`, consommé par `solo-mc` uniquement** (outils de jeu en direct) ; ni `pc` ni `rpg` ne les référencent.
- `_univers/<univers>/{canon,mj}/` — `lore-extract` écrit `canon/` ; `rpg` écrit `mj/` (jamais `canon/`).
- `_campagnes/<campagne>/mj/` — **écrit par `solo-mc`** (périmètre campagne seul).

Ne jamais renommer ni déplacer ces dossiers sans coordination : c'est le contrat d'interopérabilité entre skills JDR.
