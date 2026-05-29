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

## Transversal rules

- **Racine par jeu** : le coffre `C:/Users/fxgui/Public/Notes/Perso/JDR/` est rangé **par jeu** sous `JDR/<jeu>/` (`<jeu>` = premier segment sous la racine, déduit du répertoire courant). Une campagne vit dans `JDR/<jeu>/campagnes/<campagne>/` (même convention que `solo-mc`), avec `config.yaml`, `sessions/`, `pj/`.
- **`<univers-root>` (résolution de l'univers)** : un **setting est un univers du jeu**, rangé au niveau jeu `JDR/<jeu>/univers/<univers>/` — même s'il est vaste (gamme étendue, plusieurs éditions, ex. 7ème Mer / Théah pour le jeu Noblesse Oblige). Un jeu peut avoir **plusieurs univers** ; chaque univers est partagé par le **groupe de campagnes** qui s'y déroulent. La campagne déclare le sien (`config.yaml › univers: <slug>`). Dans les règles ci-dessous, `<univers-root>` = `JDR/<jeu>/univers/<univers>/`.
- **Deux niveaux à distinguer** :
  - **Données univers (durables, transverses aux campagnes)** — terminologie, factions, personnages, lieux/géographie, histoire. Elles vivent dans l'**arborescence partagée avec `lore-extract`** : `<univers-root>/.docs/`, **scindée par provenance en deux sous-arbres thématiques identiques** :
    - `canon/` — lore **officiel/établi**, extrait des sources via `lore-extract`. Fait autorité.
    - `mj/` — contenu **créé par le maître de jeu** (inventé pour le jeu), écrit par `rpg`.

    Chaque sous-arbre contient les mêmes fichiers (`terminologie.md`, `factions.md`, `personnages.md`, `histoire.md`, `geographie.md`, + optionnels `magie.md`, `technologie.md`, `creatures.md`, `religions.md`, `economie.md`).
  - **Prep de campagne (spécifique à une partie)** — scénarios, prep de session, fronts/horloges actifs, accroches PJ. Elle vit **dans le dossier de campagne** : `JDR/<jeu>/campagnes/<campagne>/{scenarios,prep}/` + l'état des fronts.
- **Conventions de l'arborescence univers** (alignées sur `lore-extract`) : une information dans **un seul fichier** (les autres référencent/`[[lient]]`) ; max ~250 lignes par fichier (sinon synthétiser) ; rédaction en français ; ne jamais écraser un fichier existant — compléter. Pour que les fichiers coïncident, `lore-extract` doit cibler `<univers-root>/.docs/canon/` (via son `bank.yml` ou son répertoire courant).
- **Provenance canon vs MJ** : `rpg` écrit **uniquement dans `mj/`** (contenu créé par le maître de jeu) et ne modifie **jamais `canon/`** (réservé à `lore-extract`, qui fait autorité). Une entité vit dans **un seul** sous-arbre — si le MJ étend une entité canon, créer la fiche dans `mj/` qui `[[lie]]` l'entrée canon, sans la dupliquer. Le contenu MJ ne doit **pas contredire le canon en silence** : signaler toute divergence. En lecture, `canon/` prime pour les faits établis, `mj/` ajoute la couche MJ.
- **PJ canonique vs instance de campagne** : le personnage durable vit dans `JDR/<jeu>/pjs/<pj>/` (skill `pc`, source de l'`intention.md`) ; l'instance jouée d'une campagne vit dans `JDR/<jeu>/campagnes/<campagne>/pj/` (`solo-mc`) et **référence** le PJ canonique. `rpg` s'ancre toujours sur l'`intention.md` canonique de `pc` ; si seul un PJ de campagne existe, le signaler et proposer de le rattacher à un PJ `pc`.
- La campagne déclare son univers (`config.yaml › univers: <slug>` → `JDR/<jeu>/univers/<univers>/` ; un jeu peut en avoir plusieurs) ; à défaut, demander quel univers et le lister sous `JDR/<jeu>/univers/`.
- Demander le nom de la campagne s'il n'est pas dans `$ARGUMENTS` ; lister les campagnes existantes sous `JDR/<jeu>/campagnes/` (dossiers contenant un `config.yaml`).
- Si `config.yaml` est absent, **ne pas dupliquer** le questionnaire : orienter vers `/solo-mc setup` pour le créer, puis revenir préparer.
- **Sous-systèmes génériques** : des modules de règles réutilisables qui **se greffent sur le système de jeu** de la campagne (`config.yaml › system`) — p. ex. **Parallaxe**, **Cinério**, **Muses et Oracles**. Ce ne sont pas des jeux. Chacun a ses règles au format rules-keeper (`writing:rules-keeper`), scindées canon/mj, sous `JDR/<jeu>/subsystems/<sous-système>/{canon,mj}/` (local au jeu) avec repli sur les sous-systèmes **partagés** `C:/Users/fxgui/Public/Notes/Perso/JDR/subsystems/<sous-système>/{canon,mj}/` (réutilisables entre jeux/campagnes ; la campagne déclare les sous-systèmes actifs). Règles effectives = système de jeu + sous-systèmes actifs (canon + house rules déclarées). **Ne jamais inventer de mécanique** — toujours consulter ces références, partagées avec `solo-mc` et `pc`.
- Servir le PJ : ancrer scénarios et sessions sur l'`intention.md` du PJ (thèmes, ligne rouge, question viscérale) géré par `pc`. La prep sert les enjeux du joueur, pas l'inverse.
- Lire `config.yaml` (ton, rythme, difficulté, chaos, profondeur PNJ/lieux) et s'y conformer.
- La prep est **consommée par `solo-mc`** au moment du jeu (scènes, oracle, fronts/horloges) ; ne jamais jouer en direct ici.
- Préserver le contenu existant — compléter, ne jamais écraser ; marquer l'incomplet `[À compléter]` ; ne pas inventer ce qui manque à la source.
- Format de date : `YYYY-MM-DD`.

## Références externes (coffre)

- `JDR/<jeu>/campagnes/<campagne>/config.yaml` — paramètres de campagne (créés par `solo-mc setup`)
- `JDR/<jeu>/univers/<univers>/.docs/canon/` — lore officiel (lecture seule pour `rpg` ; écrit par `lore-extract`)
- `JDR/<jeu>/univers/<univers>/.docs/mj/` — contenu créé par le MJ (écrit par `rpg`) ; même arborescence thématique que `canon/`
- `JDR/<jeu>/pjs/<pj>/intention.md` — thèmes, ligne rouge, question viscérale du PJ (skill `pc`)
- `JDR/<jeu>/subsystems/<sous-système>/{canon,mj}/` (local) avec repli sur `JDR/subsystems/<sous-système>/{canon,mj}/` (partagé) — règles des **sous-systèmes génériques** (Parallaxe, Cinério, Muses et Oracles…), format rules-keeper (`writing:rules-keeper`), partagées avec `solo-mc` et `pc`
- `JDR/<jeu>/systeme/{canon,mj}/` — règles du **système de jeu** lui-même (format rules-keeper)

## Evals

- `evals/scenarios.json`
