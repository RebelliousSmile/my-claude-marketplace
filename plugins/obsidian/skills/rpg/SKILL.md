---
name: rpg
description: >-
  Prépare le côté MJ d'une campagne de JDR solo — écriture de scénarios et préparation
  de campagne : synopsis, fronts/horloges, PNJ, factions, lieux, prep de session, accroches. Complète `pc`
  (fiches de personnage-joueur) et `solo-mc` (jeu en direct) : on prépare ici, on joue avec solo-mc.
  Utiliser quand l'utilisateur invoque /obsidian:rpg avec une intention de scénario ou de prep de campagne.
  NE PAS utiliser pour jouer en direct (scene/oracle/roll → solo-mc), pour gérer la fiche de PJ (→ pc),
  ni pour de la fiction narrative non-JDR (→ plugin writing).
disable-model-invocation: true
---

# RPG — scénarios & préparation de campagne

Compagnon de préparation pour le JDR solo. Produit la **matière de jeu** qu'un MJ prépare avant la table : situation, intrigues, PNJ, factions, lieux, prep de session. Cette matière s'appuie sur l'intention du PJ (skill `pc`) et est consommée pendant le jeu par `solo-mc`.

Découpage des trois skills : `pc` = la fiche du personnage-joueur · `rpg` = la prep MJ (ici) · `solo-mc` = le jeu en direct.

**Mode de création interactif — pas un outil de rangement.** Ranger/distribuer des informations dans les bons fichiers, c'est le rôle de `lore-extract` (sources → `canon/`). `rpg` est différent : c'est un **atelier de création MJ** où l'on **part du canon** (lore officiel établi) et où l'on **imagine, en dialogue avec l'utilisateur, ce qui va se jouer avec les joueurs** — quelles situations, quels fronts, quelles accroches pour *ce* PJ et sa team. Les fichiers produits (`mj/`, synopsis, scénarios, fronts) sont le **résidu** de cette création, jamais le but. Donc : **procéder par allers-retours** — lire le canon, proposer 2-4 directions, laisser l'utilisateur choisir et infléchir, *puis* consigner. Ne jamais produire une campagne ou un scénario complet d'un seul bloc sans avoir fait émerger les choix avec l'utilisateur.

## Available actions

| #   | Action         | Role                                                                  | Input                        |
| --- | -------------- | --------------------------------------------------------------------- | ---------------------------- |
| 01  | `campaign`     | Crée la campagne (config.yaml + structure) si absente, puis amorce sa prep (synopsis, fronts, index) | nom de campagne              |
| 02  | `scenario`     | Écrit un scénario / une situation jouable                             | campagne, pitch/idée         |
| 03  | `prep-session` | Prépare la prochaine session (scènes probables, accroches, tables)    | campagne, n° de session      |
| 04  | `npc`          | Crée / développe un PNJ d'univers (durable, partagé)                  | univers/campagne, nom du PNJ |
| 05  | `faction`      | Faction (univers) + ses fronts/horloges actifs (campagne)            | campagne, nom de faction     |
| 06  | `review`       | Vérifie la cohérence et l'état de jouabilité de la prep               | campagne                     |

## Default flow

Routeur — dispatch selon l'intention :

- "nouvelle campagne", "prépare ma campagne", "amorce la campagne <nom>" → `campaign`
- "écris un scénario", "scénario", "situation jouable", "aventure" → `scenario`
- "prépare la session", "prep session", "prochaine séance" → `prep-session`
- "crée un PNJ", "nouveau PNJ", "développe <PNJ>" → `npc`
- "crée une faction", "front", "horloge", "agenda d'une faction" → `faction`
- "vérifie ma prep", "review", "est-ce jouable", "cohérence" → `review`

## Résolution du domaine `R` (locale, découverte)

`rpg` opère relativement à un **répertoire de référence** (argument passé, sinon CWD) et **découvre** le domaine de jeu `R` : remonter les parents jusqu'au premier dossier contenant le marqueur `_savoir/` — ce dossier est `R` (typiquement `Perso/RPG/<jeu>/`, mais déplaçable n'importe où). Aucun marqueur trouvé → la cible n'est pas dans un domaine JDR initialisé : le signaler. Toujours vérifier l'existence d'un chemin résolu avant lecture/écriture. **Aucun chemin absolu, aucune config par machine** : tout est relatif à `R`. Référence complète : `../../references/jdr-layout.md`.

## Transversal rules

- **Tout est relatif à `R`** : une campagne vit dans `R/_campagnes/<campagne>/` (même convention que `solo-mc`), avec `config.yaml`, `pj/`.
- **`<univers-root>` (résolution de l'univers)** : un **setting est un univers du jeu**, rangé sous `R/_savoir/univers/<univers>/` — même s'il est vaste (gamme étendue, plusieurs éditions, ex. 7ème Mer / Théah pour le jeu Noblesse Oblige). Un domaine `R` peut avoir **plusieurs univers** ; chaque univers est partagé par le **groupe de campagnes** qui s'y déroulent. La campagne déclare le sien (`config.yaml › univers: <slug>`). Dans les règles ci-dessous, `<univers-root>` = `R/_savoir/univers/<univers>/`.
- **Deux niveaux à distinguer** :
  - **Données univers (durables, transverses aux campagnes)** — terminologie, factions, personnages, lieux/géographie, histoire. Elles vivent dans l'**arborescence partagée avec `lore-extract`** : `<univers-root>/` (= `R/_savoir/univers/<univers>/`), **scindée par provenance en deux sous-arbres thématiques identiques** :
    - `canon/` — lore **officiel/établi**, extrait des sources via `lore-extract`. Fait autorité.
    - `mj/` — contenu **créé par le maître de jeu** (inventé pour le jeu), écrit par `rpg`.

    Chaque sous-arbre contient les mêmes fichiers (`terminologie.md`, `factions.md`, `personnages.md`, `histoire.md`, `geographie.md`, + optionnels `magie.md`, `technologie.md`, `creatures.md`, `religions.md`, `economie.md`).
  - **Prep de campagne (spécifique à une partie)** — scénarios, prep de session, fronts/horloges actifs, accroches PJ. Elle vit **dans le dossier de campagne** : `R/_campagnes/<campagne>/{scenarios,prep}/` + l'état des fronts.
- **Conventions de l'arborescence univers** (alignées sur `lore-extract`) : une information dans **un seul fichier** (les autres référencent/`[[lient]]`) ; max ~250 lignes par fichier (sinon synthétiser) ; rédaction en français ; ne jamais écraser un fichier existant — compléter. Pour que les fichiers coïncident, `lore-extract` cible le `canon/` du même `<univers-root>`.
- **Provenance canon vs MJ** : `rpg` écrit **uniquement dans `mj/`** (contenu créé par le maître de jeu) et ne modifie **jamais `canon/`** (réservé à `lore-extract`, qui fait autorité). Une entité vit dans **un seul** sous-arbre — si le MJ étend une entité canon, créer la fiche dans `mj/` qui `[[lie]]` l'entrée canon, sans la dupliquer. Le contenu MJ ne doit **pas contredire le canon en silence** : signaler toute divergence. En lecture, `canon/` prime pour les faits établis, `mj/` ajoute la couche MJ.
- **PJ canonique vs instance de campagne** : le personnage durable vit dans `R/_pjs/<pj>/` (skill `pc`, source de l'`intention.md`) ; l'instance jouée d'une campagne vit dans `R/_campagnes/<campagne>/pj/` (`solo-mc`) et **référence** le PJ canonique. `rpg` s'ancre toujours sur l'`intention.md` canonique de `pc` ; si seul un PJ de campagne existe, le signaler et proposer de le rattacher à un PJ `pc`.
- La campagne déclare son univers (`config.yaml › univers: <slug>` → `R/_savoir/univers/<univers>/` ; un domaine peut en avoir plusieurs) ; à défaut, demander quel univers et lister ceux présents sous `R/_savoir/univers/`.
- Demander le nom de la campagne s'il n'est pas dans `$ARGUMENTS` ; lister les campagnes existantes sous `R/_campagnes/` (dossiers contenant un `config.yaml`).
- Si `config.yaml` est absent, l'action **`campaign` l'amorce** — mais **uniquement l'identité/wiring** (`jeu`, `univers`, `type`, `pjs`, `pj_canonique`, refs lore/système, roster compagnons). Le **réglage de jeu** (`ton`, `approche`, `difficulte`, `rythme`, chaos, jauges) **n'est PAS écrit par `rpg`** : il relève de `solo-mc` (son setup), au moment de jouer. **Ne pas dérouler de questionnaire** — ne demander que l'univers et le PJ à rattacher.
- **Système de jeu** : pour toute mécanique (récompenses, tags PNJ, défis), `rpg` consulte les règles du système de jeu au format rules-keeper (`obsidian:rules-keeper`), scindées canon/mj, sous `R/_savoir/systeme/{canon,mj}/`. Règles effectives = canon + house rules déclarées. **Ne jamais inventer de mécanique.** Les **sous-systèmes génériques** (Parallaxe, Cinério, Muses et Oracles) sont des **outils de jeu en direct** consommés par `solo-mc` uniquement — hors du ressort de `rpg`.
- **Procédure agent vs matière JDR** : si la demande porte sur la manière de travailler de l'agent, l'orchestration, ou le choix d'outils/skills, `rpg` s'appuie d'abord sur les skills pertinents pour le workflow. En revanche, la matière de jeu, le lore, les PNJ, les fronts et la campagne restent ancrés dans le domaine `R`.
- **Méthode de création (system-agnostic)** : la référence opérationnelle est **`references/methode-creation.md`** — *notre* process de prep en 8 étapes (canon + intention → amorce du PJ → carte de relations → fronts/secrets → PNJ → scénario en situation → entrelacer/arc → préparer la session) + garde-fou sécurité + check-list. Elle s'appuie sur **`references/corpus-recherche.md`** (corpus sourcé : R-map, bangs, kicker, flags, principe de Czege, fronts/horloges, cadeaux empoisonnés, PNJ miroir…) et **`references/methodes-mj.md`** (carte des graines + contraintes). Tout est **craft transversal** : **aucune mécanique** propre à un jeu. Un framework comme l'agenda/principes/manœuvres MC est **PbtA-spécifique** (→ `_savoir/systeme/canon/` de Monsterhearts, inapplicable à un sim comme Zombiology). Pour toute mécanique, déférer à `_savoir/systeme/{canon,mj}/`.
- Servir le PJ : ancrer scénarios et sessions sur l'`intention.md` du PJ (thèmes, ligne rouge, question viscérale) géré par `pc`. La prep sert les enjeux du joueur, pas l'inverse.
- Lire `config.yaml` (ton, rythme, difficulté, chaos, profondeur PNJ/lieux) et s'y conformer.
- La prep est **consommée par `solo-mc`** au moment du jeu (scènes, oracle, fronts/horloges) ; ne jamais jouer en direct ici.
- Préserver le contenu existant — compléter, ne jamais écraser ; marquer l'incomplet `[À compléter]` ; ne pas inventer ce qui manque à la source.
- Format de date : `YYYY-MM-DD`.

## Références externes (relatives à `R`)

- `R/_campagnes/<campagne>/config.yaml` — paramètres de campagne (réglage de jeu renseigné par `solo-mc setup`)
- `R/_savoir/univers/<univers>/canon/` — lore officiel (lecture seule pour `rpg` ; écrit par `lore-extract`)
- `R/_savoir/univers/<univers>/mj/` — contenu créé par le MJ (écrit par `rpg`) ; même arborescence thématique que `canon/`
- `R/_pjs/<pj>/intention.md` — thèmes, ligne rouge, question viscérale du PJ (skill `pc`)
- `R/_savoir/systeme/{canon,mj}/` — règles du **système de jeu** (format rules-keeper) ; seule référence mécanique de `rpg`. Les sous-systèmes (`R/_savoir/subsystems/<nom>/`) sont consommés par `solo-mc` uniquement.
- Convention d'arborescence complète : `../../references/jdr-layout.md`

## Evals

- `evals/scenarios.json`
