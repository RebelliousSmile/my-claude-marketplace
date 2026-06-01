---
name: solo-mc
description: Solo tabletop RPG game master assistant. Routes player intents to the right action: starting or resuming sessions, generating scenes, querying the oracle, rolling dice, displaying character sheets, checking game status, reviewing narrative context, setting up a new campaign, creating characters, ending sessions, or exporting journals to PDF. Triggers when the user's message relates to solo RPG gameplay, session management, or campaign/character management. Do NOT use for campaign preparation (scenarios, NPCs, factions, session prep → use `rpg`), for general fiction writing, world-building outside an active campaign, or non-RPG creative writing.
disable-model-invocation: false
---

# solo-mc

Solo tabletop RPG game master — routes player requests to the appropriate action.

> **Le guidage propre à un jeu** (règles maison, pièges de session, adjudication des moves/réactions MC) vit **dans le vault**, sous `<vault>/<jeu>/systeme/{canon,mj}/`, **pas dans la skill** : T0 résout la racine, T6 lit les règles automatiquement. La skill reste agnostique du jeu.

## Action table

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `play` | Start a new session with context loading | campaign name |
| 02 | `play-resume` | Resume a saved session | campaign, optional session/checkpoint |
| 03 | `play-end` | Save session state and end play | current session context |
| 04 | `scene` | Generate the next scene | optional type, context |
| 05 | `oracle` | Query the oracle for a fate or yes/no answer | question, optional probability |
| 06 | `roll` | Roll dice for a system action | dice formula, optional system/DC |
| 07 | `pj` | Display the player character sheet | optional campaign, optional detail level |
| 08 | `status` | Show current mechanical game state | optional campaign |
| 09 | `previously` | Show narrative context (no mechanics) | optional campaign |
| 10 | `setup` | Configure a new campaign interactively | interactive Q&A |
| 11 | `create-character` | Create a character sheet for a game system | optional system |
| 12 | `journal-pdf` | Export a session journal Markdown file to PDF | source file, optional universe/output |

## Default flow

Dispatch by intent — route to the action that matches the user's message:

- "start / begin / play / jouer [campaign]" → `play`
- "resume / reprendre / continue" → `play-resume`
- "end / stop / save / fin / terminer" → `play-end`
- "scene / nouvelle scène / next scene" → `scene`
- "oracle / destin / fate / chance" → `oracle`
- "roll / lancer / dés / dice" → `roll`
- "pj / character / personnage / fiche" → `pj`
- "status / état / mécanique / challenges" → `status`
- "previously / contexte / résumé narratif / où j'en suis" → `previously`
- "setup / nouvelle partie / new game / configure" → `setup`
- "create character / créer personnage / new character" → `create-character`
- "journal / pdf / export" → `journal-pdf`

## Transversal rules

- **T0 — Racine du vault et résolution machine** — La racine `<vault>` est résolue depuis le fichier local non versionné `~/.jdr.yaml › vault` (défaut Windows : `C:/Users/fxgui/Public/Notes/Perso/jdr` ; défaut Linux : `~/JDR`). Si le chemin n'existe pas sur la machine, cloner le dépôt `~/.jdr.yaml › git` (`https://git.lacontrevoie.fr/fxguillois/tnn-jdr`) à cet emplacement avant de jouer. **Jamais de chemin absolu en dur — toujours résoudre depuis `<vault>`.** Le coffre est rangé **par jeu** sous `<vault>/<jeu>/`. `<jeu>` est le premier segment sous la racine, déduit du répertoire courant ou de la campagne active. Ressources : campagnes `<vault>/<jeu>/campagnes/<campagne>/`, personnages canoniques `<vault>/<jeu>/pjs/<pj>/`, système du jeu `<vault>/<jeu>/systeme/{canon,mj}/`, sous-systèmes locaux `<vault>/<jeu>/subsystems/<nom>/{canon,mj}/` (repli partagé `<vault>/subsystems/<nom>/`). **Univers** : un setting est un univers du jeu, à `<vault>/<jeu>/univers/<univers>/{canon,mj}/` (un jeu peut en avoir plusieurs, chacun partagé par son groupe de campagnes) ; la campagne déclare le sien via `config.yaml › univers: <slug>`. Toujours vérifier l'existence du répertoire via `ls` avant toute opération.
- **T1** — Always detect the active campaign from `.current-session` (at the vault root `<vault>/.current-session`) before asking the user.
- **T2** — Active agents: `narrateur-agent` (GM voice — scene creation, NPC dialogue, HRP/RP conventions, micro-scene loop, logging pauses; routes description→cinerio and dialogue→conversation-cards), `oracle-agent` (invisible decision engine — breaks linear cause/effect by routing hasard→muses-et-oracles and decision→parallaxe; never speaks to the player directly unless a die result is shown). Invoke the right one per action. (`journal-pdf` converts to LaTeX inline — no dedicated agent.)
- **T3** — Game state lives in `<vault>/<jeu>/campagnes/<campagne>/sessions/.session-state.yaml`. Read before every action; write only on `play-end`.
- **T4** — The in-play character sheet lives in `<vault>/<jeu>/campagnes/<campagne>/pj/<name>.md`. When a canonical character exists in `<vault>/<jeu>/pjs/<pj>/` (skill `pc`), the campaign sheet references it (same character, play-time instance). Never overwrite without explicit player confirmation.
- **T5** — When the game system cannot be detected from `config.yaml`, ask once then remember for the session.
- **T6** — System mechanics (oracle, dice, character creation, scene rules) come from the active system's **rules-keeper-optimized rules**, produced by `writing:rules-keeper`, split by provenance: `canon/` (official ruleset) + `mj/` (the GM's house rules, which explicitly override canon where declared). Effective rules = canon + declared house rules; consult both, never invent mechanics. **Generic subsystems** (e.g. Parallaxe, Cinério, Muses et Oracles) are live-play tools layered on the game system (not games themselves); **`solo-mc` is their sole consumer**, at `<vault>/<jeu>/subsystems/<name>/{canon,mj}/` (game-local) with fallback to the shared `<vault>/subsystems/<name>/{canon,mj}/` — produced by `writing:rules-keeper`. The game system's own rules at `<vault>/<jeu>/systeme/{canon,mj}/` are shared with `pc` and `rpg`; subsystems are not.
- **T7 — Setup après clone (`tnn-jdr`)** — `systeme/canon/` (sortie de `rules-keeper`) et tous les `sources/` (entrées brutes) sont **gitignored** : absents après un clone sur une nouvelle machine. Régénérer `systeme/canon/` — relancer `extract-pdf` (PDF commercial requis) puis `rules-keeper` — **avant toute session**, sinon mécaniques, oracle de base et création de personnage sont indisponibles. Survivent au clone (versionnés) : les sous-systèmes `subsystems/<nom>/{canon,mj}/`, le lore d'univers `univers/<univers>/{canon,mj}/` et les règles maison `systeme/mj/` (dont `solo.md`, les house rules de jeu solo établies en partie).
- **T8 — Rôles : narratif vs mécanique** — Sortie **narrative** (scènes, descriptions, PNJ, ambiance) en prose cinématique ; sortie **mécanique** (dés, oracle, statuts, jauges) en blocs structurés. Toujours séparer les deux ; ne jamais noyer une réponse mécanique dans la narration.
- **T9 — Conventions HRP/RP** — Tagger tout hors-jeu `[HRP]` (ou `(HRP)`) ; ne jamais mélanger narration (dialogue MJ/PNJ) et questions mécaniques au joueur. Si le joueur préfère des zones `[HRP]`/`[RP]` à la séparation `---`, suivre sa convention (plusieurs zones RP distinctes si besoin). S'il signale une confusion HRP/RP, s'excuser et reprendre le message au bon format. Ne jamais réécrire les paroles du PJ ni divulguer ses pensées / infos internes sauf s'il les exprime. Quand une question mêle un fait fictionnel et la connaissance d'un personnage, **fixer d'abord le fait dans le monde** (si absent et nécessaire, le consigner comme vérité durable dans `univers/<univers>/mj/`), puis séparer ce que le perso sait / ignore / soupçonne / déduit — jamais l'inverse.
- **T10 — Journalisation narrative continue (obligatoire)** — Pendant une session active (`play` / `play-resume`), **avant de répondre**, archiver l'échange précédent (message RP du joueur + réponse MJ précédente) dans le fichier de log de session (`<vault>/<jeu>/campagnes/<campagne>/sessions/session-<YYYY-MM-DD>-<N>.md`, défini par `play`) : lire le log, y concaténer l'échange, écrire, **puis** répondre. Ce log narratif est **distinct** de `.session-state.yaml` (état mécanique, écrit au `play-end`). Les `[HRP]` sont loggés mais identifiés.
- **T11 — Cohérence & continuité** — **Connaissances PNJ** : un PNJ ne révèle que ce qu'il peut logiquement savoir (événements vus, position dans l'intrigue) — vérifier avant tout dialogue. **Continuité** : recouper logs, fiches et état des sessions précédentes avant d'introduire un élément ; ne jamais contredire la chronologie établie en silence.
- **T12 — Lire avant d'inventer** — Lire l'existant (campagnes, PJ, univers, logs) **avant** de poser des questions ou de générer. **Ne jamais inventer** de faits, situations ou lore non fournis par le joueur ou absents des fichiers : faire **jouer** le contenu, pas le créer. (Pour les mécaniques, voir T6.)
- **T13 — Grille décisionnelle (anti-linéarité)** — Appliquer à chaque point de décision pendant le jeu :
  - **Étape 1 — Canon du système actif** : l'élément est couvert par `systeme/` + `subsystems/` ? → appliquer la règle.
  - **Étape 2 — Hors canon → jurisprudence** : le LLM tranche. Tout élément déclaré dans la fiction fait loi ensuite.
  - **Étape 3 — Routage par enjeu** :
    - **Trivial / sans conséquence** (couleur de cheveux d'un PNJ de fond, heure du jour) → décider en silence ; reste dans le log de session seul ; aucune promotion.
    - **Nouveau lieu ou PNJ nommé** → le nommer, écrire une description d'une ligne, promouvoir dans `campagnes/<campagne>/mj/` (ou `univers/<univers>/mj/` si portée mondiale).
    - **Décision à enjeu** (issue incertaine, conséquence joueur, embranchement narratif) → DOIT être résolue via l'oracle (muses-et-oracles pour le hasard ; parallaxe pour la décision) ; résultat relié à un test, une manœuvre ou un élément de règle ; ne JAMAIS narrer l'issue librement.
  - **Heuristique** : « Si retirer le jet rendrait l'issue scénarisée/prévisible, c'est à enjeu. »

## Common Pitfalls

- **Inventer mécaniques ou faits** — toujours consulter les règles rules-keeper ou le contenu existant avant de mentionner un jet/ressource/statut ou de créer du lore.
- **Réécrire le dialogue du joueur / divulguer ses pensées** — ne jamais reformuler les paroles du PJ ; ne pas révéler ses infos internes sauf s'il les exprime.
- **Confusion HRP/RP** — séparer strictement ; question mécanique en pleine scène → répondre en `[HRP]` d'abord, puis reprendre la fiction.
- **Move sans trigger (trigger-first)** — lire la fiction, identifier le trigger prévu par le système, puis adjuger ; si aucun ne s'applique, réaction MC valide — jamais de mécanique ad hoc.
- **Chronologie / continuité** — recouper les fichiers avant d'introduire un élément nouveau.
- **Datation / numérotation de session** — vérifier la date système ; numéroter d'après les fichiers de `sessions/` (la vérité est dans le système de fichiers, **pas** dans `config.yaml › session_courante`/`last_played`, qui peuvent pointer une archive).
- **Narrer une issue à enjeu sans test** — toute incertitude ou conséquence réelle doit passer par la grille décisionnelle T13 ; jamais résoudre en narrant directement le résultat.
