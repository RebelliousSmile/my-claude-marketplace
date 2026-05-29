---
name: rpg
description: >-
  Prépare le côté MJ d'une campagne de JDR solo dans le coffre Obsidian — écriture de scénarios et préparation
  de campagne : synopsis, fronts/horloges, PNJ, factions, lieux, prep de session, accroches. Complète `pc`
  (fiches de personnage-joueur) et `solo-mc` (jeu en direct) : on prépare ici, on joue avec solo-mc.
  Utiliser quand l'utilisateur invoque /obsidian:rpg avec une intention de scénario ou de prep de campagne.
  NE PAS utiliser pour jouer en direct (scene/oracle/roll → solo-mc), pour gérer la fiche de PJ (→ pc),
  ni pour de la fiction narrative non-JDR (→ plugin writing).
disable-model-invocation: true
---

# RPG — scénarios & préparation de campagne

Compagnon de préparation pour le JDR solo, stocké dans le coffre Obsidian. Produit la **matière de jeu** qu'un MJ prépare avant la table : situation, intrigues, PNJ, factions, lieux, prep de session. Cette matière s'appuie sur l'intention du PJ (skill `pc`) et est consommée pendant le jeu par `solo-mc`.

Découpage des trois skills : `pc` = la fiche du personnage-joueur · `rpg` = la prep MJ (ici) · `solo-mc` = le jeu en direct.

## Available actions

| #   | Action         | Role                                                                  | Input                        |
| --- | -------------- | --------------------------------------------------------------------- | ---------------------------- |
| 01  | `campaign`     | Amorce la couche de prep d'une campagne (synopsis, thèmes, index)     | nom de campagne              |
| 02  | `scenario`     | Écrit un scénario / une situation jouable                             | campagne, pitch/idée         |
| 03  | `prep-session` | Prépare la prochaine session (scènes probables, accroches, tables)    | campagne, n° de session      |
| 04  | `npc`          | Crée / développe un PNJ de campagne                                   | campagne, nom/rôle du PNJ    |
| 05  | `faction`      | Crée / développe une faction + ses fronts (horloges)                  | campagne, nom de faction     |
| 06  | `review`       | Vérifie la cohérence et l'état de jouabilité de la prep               | campagne                     |

## Default flow

Routeur — dispatch selon l'intention :

- "nouvelle campagne", "prépare ma campagne", "amorce la campagne <nom>" → `campaign`
- "écris un scénario", "scénario", "situation jouable", "aventure" → `scenario`
- "prépare la session", "prep session", "prochaine séance" → `prep-session`
- "crée un PNJ", "nouveau PNJ", "développe <PNJ>" → `npc`
- "crée une faction", "front", "horloge", "agenda d'une faction" → `faction`
- "vérifie ma prep", "review", "est-ce jouable", "cohérence" → `review`

## Transversal rules

- Racine JDR : `C:/Users/fxgui/Public/Notes/Perso/JDR/`. Une campagne vit dans `JDR/<campagne>/` (même convention que `solo-mc`), avec `config.yaml`, `sessions/`, `pj/`.
- **Deux niveaux à distinguer** :
  - **Données univers (durables, transverses aux campagnes)** — terminologie, factions, personnages, lieux/géographie, histoire. Elles vivent dans l'**arborescence partagée avec `lore-extract`** : `JDR/univers/<univers>/.docs/` en fichiers thématiques (`terminologie.md`, `factions.md`, `personnages.md`, `histoire.md`, `geographie.md`, + optionnels `magie.md`, `technologie.md`, `creatures.md`, `religions.md`, `economie.md`). Un univers documenté via `lore-extract` est directement réutilisable ici, et réciproquement.
  - **Prep de campagne (spécifique à une partie)** — scénarios, prep de session, fronts/horloges actifs, accroches PJ. Elle vit **dans le dossier de campagne** : `JDR/<campagne>/{scenarios,prep}/` + l'état des fronts.
- **Conventions de l'arborescence univers** (alignées sur `lore-extract`) : une information dans **un seul fichier** (les autres référencent/`[[lient]]`) ; max ~250 lignes par fichier (sinon synthétiser) ; rédaction en français ; ne jamais écraser un fichier `.docs/` existant — compléter.
- La campagne déclare son univers (`config.yaml › universe`) ; à défaut, demander quel univers (`JDR/univers/<univers>/`).
- Demander le nom de la campagne s'il n'est pas dans `$ARGUMENTS` ; lister les campagnes existantes sous `JDR/` (dossiers contenant un `config.yaml`).
- Si `config.yaml` est absent, **ne pas dupliquer** le questionnaire : orienter vers `/solo-mc setup` pour le créer, puis revenir préparer.
- Référence Parallaxe : `C:/Users/fxgui/Public/Notes/Perso/JDR/parallaxe/parallaxe-synthese.md`. **Ne jamais inventer de mécanique Parallaxe** — toujours consulter cette référence.
- Servir le PJ : ancrer scénarios et sessions sur l'`intention.md` du PJ (thèmes, ligne rouge, question viscérale) géré par `pc`. La prep sert les enjeux du joueur, pas l'inverse.
- Lire `config.yaml` (ton, rythme, difficulté, chaos, profondeur PNJ/lieux) et s'y conformer.
- La prep est **consommée par `solo-mc`** au moment du jeu (scènes, oracle, fronts/horloges) ; ne jamais jouer en direct ici.
- Préserver le contenu existant — compléter, ne jamais écraser ; marquer l'incomplet `[À compléter]` ; ne pas inventer ce qui manque à la source.
- Format de date : `YYYY-MM-DD`.

## Références externes (coffre)

- `JDR/<campagne>/config.yaml` — paramètres de campagne (créés par `solo-mc setup`)
- `JDR/univers/<univers>/.docs/` — données univers durables, **arborescence thématique partagée avec `lore-extract`** (writing)
- `JDR/pjs/<pj>/intention.md` — thèmes, ligne rouge, question viscérale du PJ (skill `pc`)
- `JDR/parallaxe/parallaxe-synthese.md` — mécaniques Parallaxe

## Evals

- `evals/scenarios.json`
