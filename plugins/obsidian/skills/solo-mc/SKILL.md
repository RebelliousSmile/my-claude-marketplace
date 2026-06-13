---
name: solo-mc
description: Solo tabletop RPG game master assistant. Routes player intents to the right action: starting or resuming sessions, generating scenes, querying the oracle, rolling dice, displaying character sheets, checking game status, reviewing narrative context, setting up a new campaign, creating characters, ending sessions, or exporting journals to PDF. Triggers when the user's message relates to solo RPG gameplay, session management, or campaign/character management. Do NOT use for campaign preparation (scenarios, NPCs, factions, session prep → use `rpg`), for general fiction writing, world-building outside an active campaign, or non-RPG creative writing.
disable-model-invocation: false
---

# solo-mc

Solo tabletop RPG game master — routes player requests to the appropriate action.

> **Le guidage propre à un jeu** (règles maison, pièges de session, adjudication des moves/réactions MC) vit **dans le domaine de jeu**, sous `R/_savoir/systeme/{canon,mj}/`, **pas dans la skill** : T0 résout `R`, T6 lit les règles automatiquement. La skill reste agnostique du jeu. Convention d'arborescence : voir `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md`.

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

- **T0 — Résolution locale du domaine `R`** — Un domaine de jeu (`R = <jeu>`) est un **répertoire autonome** (typiquement `Perso/RPG/<jeu>/`), sans config par machine. **Aucun chemin absolu en dur — tout est relatif à `R`, découvert localement.** Partir du répertoire de référence (argument passé, sinon CWD) et **remonter les parents jusqu'au premier dossier contenant le marqueur `_savoir/`** : ce dossier est `R`. Si aucun marqueur n'est trouvé, la cible n'est pas dans un domaine JDR initialisé : le signaler et proposer d'initialiser `R`. Ressources : campagnes `R/_campagnes/<campagne>/`, personnages canoniques `R/_pjs/<pj>/`, système du jeu `R/_savoir/systeme/{canon,mj}/`, sous-systèmes `R/_savoir/subsystems/<nom>/{canon,mj}/`. **Univers** : un setting est un univers du jeu, à `R/_savoir/univers/<univers>/{canon,mj}/` (un jeu peut en avoir plusieurs, chacun partagé par son groupe de campagnes) ; la campagne déclare le sien via `config.yaml › univers: <slug>`. Toujours vérifier l'existence du répertoire via `ls` avant toute opération. Convention complète : `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md`.
- **T1** — Always detect the active campaign from `.current-session` (at the domain root `R/.current-session`) before asking the user.
- **T2** — Active agents: `narrateur-agent` (GM voice — scene creation, NPC dialogue, HRP/RP conventions, micro-scene loop, logging pauses; routes description→cinerio and dialogue→conversation-cards), `oracle-agent` (invisible decision engine — breaks linear cause/effect by routing hasard→muses-et-oracles and decision→parallaxe; never speaks to the player directly unless a die result is shown). Invoke the right one per action. (`journal-pdf` converts to LaTeX inline — no dedicated agent.)
- **T3** — Game state lives in `R/_campagnes/<campagne>/.session-state.yaml`. Read before every action; write only on `play-end`.
- **T4** — The in-play character sheet lives in `R/_campagnes/<campagne>/pj/<name>.md`. When a canonical character exists in `R/_pjs/<pj>/` (skill `pc`), the campaign sheet references it (same character, play-time instance). Never overwrite without explicit player confirmation.
- **T5** — When the game system cannot be detected from `config.yaml`, ask once then remember for the session.
- **T6** — System mechanics (oracle, dice, character creation, scene rules) come from the active system's **rules-keeper-optimized rules**, produced by `writing:rules-keeper`, split by provenance: `canon/` (official ruleset) + `mj/` (the GM's house rules, which explicitly override canon where declared). Effective rules = canon + declared house rules; consult both, never invent mechanics. **Generic subsystems** (e.g. Parallaxe, Cinério, Muses et Oracles) are live-play tools layered on the game system (not games themselves); **`solo-mc` is their sole consumer**, at `R/_savoir/subsystems/<name>/{canon,mj}/` — produced by `writing:rules-keeper`. The game system's own rules at `R/_savoir/systeme/{canon,mj}/` are shared with `pc` and `rpg`; subsystems are not.
- **T7 — Régénération des règles canon** — `R/_savoir/systeme/canon/` (sortie de `rules-keeper`) et tous les `sources/` (entrées brutes) sont **dérivés de matériel commercial et régénérables** depuis les PDF ; si `R` est versionné, ce sont les candidats naturels à gitignorer (`**/sources/`) — un choix local au dépôt qui héberge `R`, pas une dépendance de la skill. S'ils sont absents (p. ex. domaine fraîchement récupéré sans ces dossiers), régénérer `R/_savoir/systeme/canon/` — relancer `extract-pdf` (PDF commercial requis) puis `rules-keeper` — **avant toute session**, sinon mécaniques, oracle de base et création de personnage sont indisponibles. Durables (à conserver) : les sous-systèmes `R/_savoir/subsystems/<nom>/{canon,mj}/`, le lore d'univers `R/_savoir/univers/<univers>/{canon,mj}/` et les règles maison `R/_savoir/systeme/mj/` (dont `solo.md`, les house rules de jeu solo établies en partie).
- **T8 — Rôles : narratif vs mécanique** — Sortie **narrative** (scènes, descriptions, PNJ, ambiance) en prose cinématique ; sortie **mécanique** (dés, oracle, statuts, jauges) en blocs structurés. Toujours séparer les deux ; ne jamais noyer une réponse mécanique dans la narration.
- **T9 — Conventions HRP/RP** — Tagger tout hors-jeu `[HRP]` (ou `(HRP)`) ; ne jamais mélanger narration (dialogue MJ/PNJ) et questions mécaniques au joueur. Si le joueur préfère des zones `[HRP]`/`[RP]` à la séparation `---`, suivre sa convention (plusieurs zones RP distinctes si besoin). S'il signale une confusion HRP/RP, s'excuser et reprendre le message au bon format. Ne jamais réécrire les paroles du PJ ni divulguer ses pensées / infos internes sauf s'il les exprime. Quand une question mêle un fait fictionnel et la connaissance d'un personnage, **fixer d'abord le fait dans le monde** (si absent et nécessaire, le consigner comme vérité durable dans `R/_savoir/univers/<univers>/mj/`), puis séparer ce que le perso sait / ignore / soupçonne / déduit — jamais l'inverse.
- **T10 — Journalisation narrative continue (obligatoire)** — Pendant une session active (`play` / `play-resume`), **avant de répondre**, archiver l'échange précédent (message RP du joueur + réponse MJ précédente) dans le fichier de log de session (`R/<YYYY>/<MM>/<campagne>/<campagne>-session-<YYYY-MM-DD>-<N>.md`, défini par `play`) : lire le log, y concaténer l'échange, écrire, **puis** répondre. Ce log narratif (daté, sous l'axe `R/<YYYY>/<MM>/`) est **distinct** de `R/_campagnes/<campagne>/.session-state.yaml` (état mécanique durable, écrit au `play-end`). Les `[HRP]` sont loggés mais identifiés.
- **T11 — Cohérence & continuité** — **Connaissances PNJ** : un PNJ ne révèle que ce qu'il peut logiquement savoir (événements vus, position dans l'intrigue) — vérifier avant tout dialogue. **Continuité** : recouper logs, fiches et état des sessions précédentes avant d'introduire un élément ; ne jamais contredire la chronologie établie en silence.
- **T12 — Lire avant d'inventer** — Lire l'existant (campagnes, PJ, univers, logs) **avant** de poser des questions ou de générer. **Ne jamais inventer** de faits, situations ou lore non fournis par le joueur ou absents des fichiers : faire **jouer** le contenu, pas le créer. (Pour les mécaniques, voir T6.)
- **T13 — Grille décisionnelle (anti-linéarité)** — Appliquer à chaque point de décision pendant le jeu :
  - **Étape 1 — Canon du système actif** : l'élément est couvert par `systeme/` + `subsystems/` ? → appliquer la règle.
  - **Étape 2 — Hors canon → jurisprudence** : le LLM tranche. Tout élément déclaré dans la fiction fait loi ensuite.
  - **Étape 3 — Routage par enjeu** :
    - **Trivial / sans conséquence** (couleur de cheveux d'un PNJ de fond, heure du jour) → décider en silence ; reste dans le log de session seul ; aucune promotion.
    - **Nouveau lieu ou PNJ nommé** → le nommer, écrire une description d'une ligne, promouvoir dans `R/_campagnes/<campagne>/mj/` (ou `R/_savoir/univers/<univers>/mj/` si portée mondiale ; règle de conduite solo → `R/_savoir/systeme/mj/solo.md`). Routage complet : voir « Routage des faits de fiction » dans `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md`.
    - **Décision à enjeu** (issue incertaine, conséquence joueur, embranchement narratif) → DOIT être résolue via l'oracle (muses-et-oracles pour le hasard ; parallaxe pour la décision) ; résultat relié à un test, une manœuvre ou un élément de règle ; ne JAMAIS narrer l'issue librement.
  - **Heuristique** : « Si retirer le jet rendrait l'issue scénarisée/prévisible, c'est à enjeu. »
- **T14 — Substitution de compagnon (équipe séparée)** — Décision MC, pas une commande joueur. Signaux déclencheurs : une scène s'ouvre sur un lieu où seul le compagnon est présent ; la fiction crée un embranchement où deux personnages doivent agir simultanément en des lieux différents ; la dernière action du joueur envoie le PJ d'un côté et le compagnon ailleurs.
  - **Chargement** : lire `config.yaml › compagnons:` pour obtenir le roster de la campagne (noms, rôles, chemins de fiches) ; sélectionner le compagnon concerné par la séparation ; charger `R/_pjs/<pj>/compagnons/<slug>.md`.
  - **Gel** : noter la position narrative exacte du PJ dans `.session-state.yaml` (`active_character: <companion-slug>`, `pc_frozen_at: <beat-narratif>`).
  - **Jeu** : jouer UNE scène comme le compagnon via sa fiche minimale (rôle, voix/tics, 3-5 tags mécaniques, état courant). La grille T13 s'applique normalement pendant la scène compagnon.
  - **Timeline** : la scène compagnon rejoint le même moment temporel que le PJ. Le PJ était en avance ; la scène compagnon resynchronise l'équipe.
  - **Retour** : fin de scène compagnon → remettre `active_character` au PJ dans `.session-state.yaml` ; dégeler le fil du PJ.
  - **Dégradation gracieuse** : si la fiche compagnon est absente → `[HRP] Fiche compagnon pour <nom> introuvable à R/_pjs/<pj>/compagnons/<slug>.md. Lance /obsidian:pc companion create <nom> d'abord.`

## Common Pitfalls

- **Inventer mécaniques ou faits** — toujours consulter les règles rules-keeper ou le contenu existant avant de mentionner un jet/ressource/statut ou de créer du lore.
- **Réécrire le dialogue du joueur / divulguer ses pensées** — ne jamais reformuler les paroles du PJ ; ne pas révéler ses infos internes sauf s'il les exprime.
- **Confusion HRP/RP** — séparer strictement ; question mécanique en pleine scène → répondre en `[HRP]` d'abord, puis reprendre la fiction.
- **Move sans trigger (trigger-first)** — lire la fiction, identifier le trigger prévu par le système, puis adjuger ; si aucun ne s'applique, réaction MC valide — jamais de mécanique ad hoc.
- **Chronologie / continuité** — recouper les fichiers avant d'introduire un élément nouveau.
- **Datation / numérotation de session** — vérifier la date système ; numéroter d'après les fichiers `<campagne>-session-*.md` sous `R/<AAAA>/<MM>/<campagne>/` (balayer **tous** les dossiers année/mois ; la vérité est dans le système de fichiers, **pas** dans `config.yaml › session_courante`/`last_played`, qui peuvent pointer une archive).
- **Narrer une issue à enjeu sans test** — toute incertitude ou conséquence réelle doit passer par la grille décisionnelle T13 ; jamais résoudre en narrant directement le résultat.
