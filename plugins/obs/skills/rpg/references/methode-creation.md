# Notre méthode — Préparer une campagne de JdR solo depuis le canon

Cette méthode décrit **notre** façon de fabriquer de la matière de jeu pour le skill `rpg`. Elle porte exclusivement sur le **craft de préparation** — relations, situation, PNJ, scènes, indices — et **jamais** sur les mécaniques. Toute règle (récompense, tag, défi, jet) est déférée à `R/_systeme/{canon,mj}/` du jeu : on n'invente aucune mécanique ici.

Trois principes la gouvernent du début à la fin :

1. **Partir du canon.** Tout démarre du lore établi (`R/_univers/<univers>/canon/`) et de l'intention du PJ (`R/_pjs/<pj>/intention.md`). On ne crée pas dans le vide : on prolonge un univers et un personnage existants.
2. **Préparer une situation, pas une intrigue.** On installe des forces, des désirs et des tensions instables — pas une suite d'événements scriptée. L'histoire émerge des choix en jeu.
3. **Procéder par allers-retours.** À chaque étape, on **propose plusieurs directions**, l'utilisateur **choisit** (ou amende), puis on **consigne** dans `mj/` ou le dossier de campagne. Jamais de page écrite d'un bloc sans validation.

---

## Le process en 7 étapes

### Étape 1 — Ancrer sur le canon et l'intention du PJ

**Quoi faire.** Avant toute création, lire le canon de l'univers (`canon/terminologie, factions, personnages, histoire, geographie`) et l'`intention.md` du PJ. En extraire trois choses : (a) la **tension thématique** de la campagne, formulée en une question ouverte dont l'issue n'est pas décidée (« Jusqu'où trahira-t-il pour les siens ? ») ; (b) la **ligne rouge / question viscérale** du PJ ; (c) une **palette de signes** récurrents (matière, couleur, geste, son) qui signera l'univers à la table. Proposer 2–3 formulations de tension thématique, laisser choisir, consigner dans le synopsis de campagne (`R/_campagnes/<campagne>/`).

**Techniques du corpus qui la nourrissent.**
- *S'inspirer d'un thème pour générer la prep (theme-driven prep)* — fixer le thème d'abord, en faire un filtre directeur ; le tirer de ce que le joueur a signalé vouloir explorer. (Premise de Ron Edwards, d'après Egri — [Narrativism: Story Now](http://www.indie-rpgs.com/_articles/narr_essay.html))
- *Décrire l'univers comme un ensemble de signes* — constituer une banque de détails-signes plutôt qu'une bible exhaustive ; chaque détail est un crochet qui pose une question. (Color dans la Forge — [De-signing the Design](https://www.gamedeveloper.com/design/de-signing-the-design-the-semiotics-of-choice))
- *Adapter une œuvre* — quand le canon contient un récit fort, on en extrait la **situation** (qui veut quoi, qui s'oppose à qui) et non la séquence de scènes. ([Don't Prep Plots](https://thealexandrian.net/wordpress/4147/roleplaying-games/dont-prep-plots))

### Étape 2 — Récolter l'amorce personnelle du PJ

**Quoi faire.** Demander à l'utilisateur **un événement bouleversant** survenu juste avant le début du jeu, qui force le PJ à agir et qu'il ne peut ignorer. C'est lui qui l'écrit (ou le valide parmi nos propositions), pas nous. Cet événement n'est pas résolu d'avance : il ouvre un éventail d'actions. On cartographie ensuite ce qu'il implique (qui, où, quel enjeu) pour bâtir la situation **autour** de lui. Consigner comme accroche de campagne.

**Techniques du corpus qui la nourrissent.**
- *Kicker (événement déclencheur authoré par le joueur)* — l'amorce vient du joueur ; le préparateur l'exploite, ne la fabrique pas, et bâtit la situation après. (Sorcerer, Ron Edwards — [Here's the Kicker](https://stepintorpgs.wordpress.com/2015/04/25/heres-the-kicker-character-creation-and-plot-hooks/))
- *Flags (signaux du joueur)* — recueillir les déclarations d'intention explicites (objectif, relation, idéal, peur) que la prep devra viser. (Chris Chinn — [Flag Framing](https://bankuei.wordpress.com/2015/01/07/flag-framing-1-setting-up-a-campaign/))
- En solo, l'amorce est co-écrite avec l'utilisateur : on propose des directions tirées du canon, il tranche.

### Étape 3 — Bâtir la situation : carte de relations

**Quoi faire.** Lister 6 à 10 acteurs (PNJ canon + PNJ à créer + factions), les poser en nœuds, puis tracer entre eux des **liens à double charge** : ce qui les unit ET ce qui les ronge (« sa sœur, qu'il protège et dont il convoite l'héritage »). Règle de densité : viser **2–3 liens par nœud** ; tout nœud à un seul lien est faiblement intégré (à reconnecter ou couper). **Brancher le PJ dans la carte** par au moins un fil (dette, secret, lien de sang). Proposer la carte, faire valider les liens, la consigner dans `mj/personnages.md` / `mj/factions.md` (en `[[liant]]` les entrées canon sans les dupliquer).

**Techniques du corpus qui la nourrissent.**
- *Cartographier les relations entre personnages (R-map)* — nœuds + arêtes dirigées et asymétriques, codées par type et intensité ; la carte rend la situation instable et prête à exploser sans dicter l'action. (Ron Edwards, Sorcerer's Soul — [Relationship Maps](http://sgcodex.wikidot.com/relationship-maps))
- *Générer des relations complexes entre PNJ (liens ambivalents)* — chaque PNJ porte un désir propre + un vecteur d'opposition ; la pression dramatique préexiste à l'arrivée du PJ. ([Relationship Mapping, Gnome Stew](https://gnomestew.com/relationship-mapping/))
- *Imaginer un PNJ miroir* — placer dans la carte au moins un PNJ qui reflète ou inverse le PJ (« comme lui, mais qui a choisi l'inverse »), branché par un besoin qui garantit la collision. ([Foil — Wikipedia](https://en.wikipedia.org/wiki/Foil_(narrative)))

### Étape 4 — Mettre la situation en mouvement : fronts, horloges, secrets

**Quoi faire.** La carte de relations est statique ; il faut lui donner une **trajectoire**. Limiter à **≈3 forces antagonistes** (factions, menaces, dynamiques d'univers). Pour chacune : un nom, sa **motivation propre** (ce qui la pousse à agir seule), une **chaîne d'étapes visibles** (du mauvais au pire) si personne n'intervient, et la **catastrophe finale** visée. Doser les vitesses : une lente de fond, une ou deux immédiates. En parallèle, **semer des secrets et indices redondants** : pour chaque vérité cachée que le PJ pourrait découvrir, prévoir **au moins trois indices** de natures différentes (témoin, trace physique, document/déduction), répartis dans des lieux et PNJ distincts. Proposer les forces + leurs étapes, faire choisir lesquelles activer, consigner l'état dans `R/_campagnes/<campagne>/`.

> Le formalisme mécanique d'avancement (jets, segments cochés) n'appartient pas à `rpg` : pour faire avancer une force par une règle, déférer à `R/_systeme/{canon,mj}/`. Ici on prépare des **étapes fictionnelles** et des **échéances**.

**Techniques du corpus qui la nourrissent.**
- *Fronts et horloges en tant qu'outil de préparation* — forces dotées d'une impulsion et d'étapes visibles, jouées « pour découvrir » ; ~3 fronts à vitesses variées. ([Fronts — Dungeon World SRD](https://www.dungeonworldsrd.com/gamemastering/fronts/), [SlyFlourish](https://slyflourish.com/looking_back_on_fronts.html)) — *Adapté system-agnostic : on garde l'idée de forces à trajectoire, on retire le vocabulaire mécanique propre au système.*
- *Laisser flotter des indices et des secrets* — nappe d'indices redondants ; règle des trois indices ; menaces dormantes qui escaladent. (Justin Alexander — [Three Clue Rule](https://thealexandrian.net/wordpress/1118/roleplaying-games/three-clue-rule))
- *Passer du scénario à la campagne* — tenir un document d'état (forces, fils en suspens, points chauds) mis à jour de session en session. ([Scenario Timelines](https://thealexandrian.net/wordpress/4154/roleplaying-games/dont-prep-plots-prepping-scenario-timelines))

### Étape 5 — Créer et relier les PNJ

**Quoi faire.** Pour chaque PNJ que la situation appelle, fixer le strict nécessaire : **un trait dominant + une signature (voix, geste ou objet) + un détail mémorable**, et surtout **ce qu'il veut** + **ce qui lui barre la route**. Pas de biographie longue : des briques activables. Vérifier que chaque PNJ est **bien branché dans la carte** (étape 3) et, si pertinent, lui donner un rôle de **miroir** d'un PJ. Désigner au moins un PNJ comme **porteur d'un cadeau empoisonné** (voir étape 6). Proposer une poignée de PNJ, faire valider, écrire les fiches dans `mj/personnages.md` (jamais dans `canon/` ; `[[lier]]` le canon si on l'étend).

> Pour les tags/stats d'un PNJ (capacités, niveau de menace), consulter `R/_systeme/{canon,mj}/` — ne pas inventer.

**Techniques du corpus qui la nourrissent.**
- *Singulariser et rendre des PNJ attachants* — 1–2 marqueurs saillants (trait + voix + détail) suffisent ; tenir un registre pour la récurrence et l'évolution. ([Quick & Dirty Memorable NPCs](http://ragingowlbear.blogspot.com/2018/05/gm-101-quick-dirty-memorable-npcs.html))
- *Créer un antagoniste mémorable (but / méthode / faille)* — pour l'adversaire central : motivation creusée par « Pourquoi ? » répété, méthode en étapes résilientes, faille exploitable, accrochée au passé du PJ. ([The Villain AS Plot](https://theangrygm.com/villains-and-plots-the-villain-as-plot/))
- *Imaginer un PNJ miroir* (rappel) — un PNJ peut refléter un PJ et en inverser un autre.

### Étape 6 — Concevoir un scénario jouable

**Quoi faire.** Choisir d'abord la **forme** adaptée à l'intention (nodale pour l'enquête/l'exploration, plus dirigée pour un one-shot cinématique) plutôt qu'une chaîne linéaire par défaut. Puis fabriquer la matière jouable :

- **Des scènes qui comptent.** Pour chaque scène anticipée, noter le cadre (où, qui), la **question dramatique** qu'elle pose et les **enjeux** (ce qui peut être gagné/perdu), prêts à être énoncés en une phrase. Cadrer au plus près du point de décision.
- **Une réserve de situations-déclencheurs.** Préparer 4–8 amorces en une ou deux phrases chacune — un événement qui place le PJ devant un **choix** qui compte, sans en dicter l'issue (« apprendre que la princesse est prisonnière », pas « sauver la princesse »). Ce sont des munitions jetables, pas un ordre de scènes.
- **Des objectifs contradictoires.** Vérifier que les désirs des acteurs se chevauchent et frottent : triangulation (un PNJ allié de l'un, menace de l'autre), ressource rivale unique, valeurs incompatibles. Le moteur est le frottement entre agendas, pas l'obstacle externe.
- **Des cadeaux empoisonnés.** Pour chaque chose que le PJ veut, pré-écrire un **coût ancré dans la fiction** (dette, secret compromettant, menace qui démarre, perte d'autre chose) et désigner qui en est le porteur et quand le prix refera surface.

Proposer les amorces + les frictions, laisser l'utilisateur choisir lesquelles retenir, consigner le scénario dans `R/_campagnes/<campagne>/`.

> **Garde-fou de craft (principe de Czege).** Ne jamais être seul auteur **du problème et de sa résolution**. On prépare des problèmes ouverts, pas leurs dénouements. En solo, la résolution est déléguée au système hôte et aux oracles consommés par `solo-mc` — c'est cette source externe qui tranche l'issue, pas la prep.

**Techniques du corpus qui la nourrissent.**
- *Choisir une structure narrative adaptée* — diagnostiquer l'intention et choisir linéaire / embranché / nodal selon le but, pas par automatisme. ([The Shape of Adventure](https://theangrygm.com/the-shape-of-adventure/))
- *Créer un scénario en situation plutôt qu'en intrigue / Story Now* — remplir une boîte à outils (PNJ, lieux, objectifs, situation intenable), pas un synopsis. ([Don't Prep Plots](https://thealexandrian.net/wordpress/4147/roleplaying-games/dont-prep-plots))
- *Bangs (situations provocantes forçant un choix)* — formuler des déclencheurs de choix, pas des résultats imposés ; même l'inaction a des conséquences. (Ron Edwards — [Prepping Bangs](https://thealexandrian.net/wordpress/36768/roleplaying-games/the-art-of-pacing-prepping-bangs))
- *Proposer des scènes qui comptent — cadrage & enjeux* — point de vue + question dramatique + enjeux ; couper tôt. ([The Art of Pacing: Scene-Framing](https://thealexandrian.net/wordpress/31520/roleplaying-games/the-art-of-pacing-part-2-scene-framing))
- *Diversifier et opposer les objectifs* — triangulation, ressource rivale, idéologies incompatibles ; garder le conflit dans la coopération. ([lumpley games](https://lumpley.games/2021/06/30/powered-by-the-apocalypse-part-7-qa-round-4/))
- *Faire des cadeaux empoisonnés* — offrir ce que le PJ veut avec un coût ancré et différé ; un porteur crédible avec ses propres motivations. ([A Mad Lib For Your Devil's Bargains](https://www.roleplayingtips.com/adventure-building-campaigns/a-mad-lib-for-your-devils-bargains/))
- *Principe de Czege* — séparer l'auteur de l'adversité de l'auteur de la résolution ; en solo, déléguer la résolution au système/oracle. ([Czege Principle](https://rpgmuseum.fandom.com/wiki/Czege_Principle))

### Étape 7 — Entrelacer les fils et tracer l'arc

**Quoi faire.** À l'échelle de la campagne, tenir **3 à 5 fils actifs** (un majeur, des mineurs, parfois un épisodique) et organiser leur **alternance** : qui est sous le projecteur, quand, et où les fils se **croisent** (un PNJ, un objet ou un lieu partagé par deux fils). Pour le PJ, formuler une **phrase d'arc** (« état initial → tension → issue possible ») et le **type** (changement / croissance / déchéance / arc plat), sans décider l'issue : c'est le choix du joueur qui clôt l'arc. Disposer les déclencheurs comme des points d'accroche modifiables. Proposer le tressage et l'arc, valider, consigner dans le document d'état de campagne.

**Techniques du corpus qui la nourrissent.**
- *Entremêler les intrigues* — grille de tressage (colonnes = fils, lignes = beats), points de croisement, équilibre du temps de projecteur. ([The Braiding of Plot Threads](https://www.campaignmastery.com/blog/the-braiding-of-plot-threads/))
- *Concevoir un arc de personnage* — phrase d'arc, type d'arc, prémisse en question ouverte, déclencheurs comme accroches jetables. ([Character Arcs, Gnome Stew](https://gnomestew.com/character-arcs/))
- *Passer du scénario à la campagne* — situation évolutive + document d'état mis à jour. ([Scenario Timelines](https://thealexandrian.net/wordpress/4154/roleplaying-games/dont-prep-plots-prepping-scenario-timelines))

### Étape 8 — Préparer une session

**Quoi faire.** Avant chaque séance : (a) relire l'état des forces/fronts et les fils chauds ; (b) sortir 4–8 **scènes-déclencheurs probables** ancrées sur l'intention du PJ et le fil le plus pressant, chacune avec sa question et ses enjeux en une ligne ; (c) noter une **douzaine de secrets/indices courts** non localisés, prêts à être placés là où le PJ ira ; (d) faire avancer d'un cran les forces dont l'échéance est due, **descriptivement** (on a vu le changement) ou via un déclencheur fictionnel ; (e) garder tout cela **jetable**. Proposer la sélection, faire valider, écrire la prep dans `R/_campagnes/<campagne>/prep/`. La matière est ensuite **consommée par `solo-mc`** au moment du jeu — on ne joue jamais en direct ici.

**Techniques du corpus qui la nourrissent.**
- *Bangs / bandoulière de bangs* — stock de déclencheurs par session, modulables et jetables. ([Prepping Bangs](https://thealexandrian.net/wordpress/36768/roleplaying-games/the-art-of-pacing-prepping-bangs))
- *Laisser flotter des indices (secrets pré-séance)* — liste d'environ 10 secrets non localisés, distribués au fil du jeu. ([Three Clue Rule](https://thealexandrian.net/wordpress/1118/roleplaying-games/three-clue-rule))
- *Fronts et horloges* — avancement descriptif vs déclenché ; rythme de la menace. ([Fronts — DW SRD](https://www.dungeonworldsrd.com/gamemastering/fronts/))

---

## Garde-fou transversal : sécurité et contrat (en amont)

Avant de produire la matière sensible d'une campagne, vérifier le **contrat social** déjà établi (si le domaine `R` contient un `CONTRAT_SOCIAL.md`) : thèmes exclus (**lignes**) à ne jamais faire apparaître, thèmes voilés (**voiles**) à traiter hors-champ. La prep doit être retravaillée pour qu'aucune ligne ne soit **structurellement nécessaire** au scénario. Inspiré de *Séance zéro, contrat social et garde-fous (lines & veils)* — Ron Edwards / John Stavropoulos ([Lines and veils](https://rpgmuseum.fandom.com/wiki/Lines_and_veils)). En solo, c'est l'utilisateur qui pose ses propres limites ; on les respecte dans tout ce qu'on consigne.

---

## Check-list de fin de préparation

- [ ] **Canon d'abord** : la prep découle du `canon/` de l'univers et de l'`intention.md` du PJ — rien d'inventé qui contredise le canon en silence.
- [ ] **Tension thématique** formulée en une question ouverte, non résolue d'avance.
- [ ] **Amorce du PJ** recueillie/validée par l'utilisateur ; la situation est bâtie autour.
- [ ] **Carte de relations** : 6–10 acteurs, ≥2–3 liens par nœud, aucun nœud isolé, **PJ branché** par au moins un fil.
- [ ] **Liens ambivalents** (double charge) et au moins un **PNJ miroir** du PJ.
- [ ] **≈3 forces** à motivation propre, chacune avec ses étapes visibles et sa catastrophe ; vitesses variées.
- [ ] **Secrets/indices** : ≥3 indices de natures différentes par vérité cachée, répartis.
- [ ] **PNJ** : trait + signature + détail + désir + opposition ; antagoniste central avec but/méthode/faille.
- [ ] **Scénario en situation**, pas en intrigue ; **structure** choisie en fonction de l'intention.
- [ ] **Objectifs contradictoires** vérifiés (triangulation / ressource rivale / valeurs).
- [ ] **Cadeaux empoisonnés** pré-écrits : coût ancré, porteur désigné, échéance notée.
- [ ] **Principe de Czege** respecté : problèmes ouverts, résolution déléguée au système/oracle (jamais auteur des deux).
- [ ] **Fils entrelacés** (3–5), points de croisement identifiés, temps de projecteur équilibré.
- [ ] **Arc du PJ** formulé (phrase + type), issue laissée au joueur.
- [ ] **Session** prête : 4–8 déclencheurs + ~10 secrets, forces dues avancées, matière jetable.
- [ ] **Aucune mécanique inventée** : tout renvoi de règle pointe vers `R/_systeme/{canon,mj}/`.
- [ ] **Lignes & voiles** respectés ; aucune ligne structurellement nécessaire.
- [ ] **Allers-retours** : chaque livrable a été proposé, choisi par l'utilisateur, puis consigné (`mj/` ou dossier de campagne) — jamais écrasé, complété.