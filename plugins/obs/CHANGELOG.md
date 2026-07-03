# Changelog — obs

> Baseline établie le 2026-05-29 à partir de l'état courant ; transitions récentes reprises de l'historique git. Détail antérieur : `git log -- plugins/obs`.

## [0.36.0] — 2026-07-03

### Changed (`tree`) — scope strict de `check`/`fix`
- `check`/`fix` bornent leur report/plan au `<target>` seul : résoudre l'ancre localise le cache partagé (convention, cohérence cross-domaine) mais n'élargit pas l'action aux domaines frères sous l'ancre. Pour agir sur tout l'ancre, passer l'ancre comme `<target>`.

### Tests — baselines behave « intégrité des liens » (runs 2)
- `tree` 20/20 (S18 : move préserve wikilinks/embeds/PJ), `filler` 20/20 (S16 : `sort` co-déplace l'asset + met à jour le wikilink entrant ; S17 : `digest` redirige/signale la référence vers la source supprimée). Aucune régression.
- Note : la règle « intégrité des liens » vit en transversale (tree Transversal, filler T11) mais n'est pas encore opérationnalisée dans les étapes d'action (`fix`/`sort`/`judge`, `sort`/`digest`) — à renvoyer depuis les steps concernés.

## [0.35.0] — 2026-07-03

### Added (`mail`) — action `reply` : rédaction de réponses en Markdown
- Nouvelle action `06-reply` : `mail` fait désormais les **deux sens** — triage (communication → information) ET rédaction (information → communication). `reply <source> [intention]` lit le thread, compose une réponse **assistée**, et écrit un brouillon au format email dans `Thunderbird/_drafts/` — **jamais envoyé**, source jamais mutée, validation avant écriture. `_drafts/` exclu du scan. Scaffold behave dédié `mail-reply-scenarios.md` (9 scénarios). Défauts documentés dans `SKILL.md › Reply drafting` (ajustables).

### Fixed — backlog post-agnosticisation
- **`extract-pdf/scripts/extract-pdf.py`** : `discover_domain_root` remontait vers un marqueur `_savoir/` obsolète (retiré en 0.18.0) → aligné sur les marqueurs `_campagnes/`/`_univers/`/`_pjs/` et les chemins `R/_univers/`, `R/_systeme/`.
- **`brief`** : 2 contradictions de spec tranchées par autorité du contrat `writing:brief-model` — front-matter **YAML** (skeleton `01-assemble` corrigé) et **personas ≥3** enforced par `check` (`02-check`). Suite behave : S14 sort du N/A (devient un vrai GO).
- **`project`** : templates `commercial.md`/`communication.md` réalignés sur la structure réelle (Facturation · Accord commercial · Devis · Client · CR Réunions & échanges importants) ; **`## Accès` repositionné dans `projet.md`** (pas commercial.md) — propagé à `redistribution-rules`, `add-invoice` (`## Devis`), `log-meeting`, `distill`, suite behave.

## [0.34.1] — 2026-07-03

### Removed — action orpheline `extract-pdf/05-run.md`
- Suppression de l'orphelin `actions/05-run.md` (absent de la table d'actions 01–04, vocabulaire divergent `TODO`/`DONE`/`SKIP` + chemin `.docs/extraction/` — résidu relevé par le run behave). Le scénario S7 est reformulé en test d'adhérence au vocabulaire normalisé `pending/done/failed` + `docs/extraction/`, sans dépendre du fichier supprimé.

## [0.34.0] — 2026-07-03

### Removed — copie orpheline de `jdr-layout.md` dans `obs` (Phase 2 de l'agnosticisation)
- Les 3 skills de contenu agnosticisés en 0.33.0 ne référencent plus la copie obs de `jdr-layout.md` : ils s'appuient sur `references/domain-layout.md` (qui résume le profil JDR), le **layout de jeu complet restant possédé par le plugin `ttrpg`** (sa propre `references/jdr-layout.md`).
- Suppression des orphelins `obs/references/jdr-layout.md` + `jdr-layout-checks.py` — fin de la duplication obs↔ttrpg (les deux copies avaient dérivé). `writing:forge` pointait déjà vers la copie `ttrpg` (inchangé).

## [0.33.0] — 2026-07-03

### Changed (`brief`/`research`/`extract-pdf`) — agnosticisation (découplage du modèle JDR)
- Les 3 skills de contenu étaient couplés au modèle JDR (buckets `_univers`/`_systeme`, split `canon/mj`, feeders `ttrpg:*`) alors que leur mécanique est générique. Découplés : ils opèrent sur un **modèle générique**, le JDR devenant un **profil conditionnel** (`profile: jdr` dans `bank.yml`, ou présence de buckets).
- Nouveau `references/domain-layout.md` : `R` = sous-catégorie + `R/_<bucket>` + `bank.yml` ; `sources/` (brut) + `reference/` (synthétisé) ; scopes `shared`/`project` ; détection de profil.
- extract-pdf : sortie `<target>/sources/`, split univers/systeme en profil. research : scopes shared/project, `campagne` réintroduite par le profil ; cibles `reference/` / `canon/`. brief : consolide « ce que `bank.yml` catalogue » (buckets aux noms libres) ; contrat `writing` intact.
- 3 suites behave re-scaffoldées : cœur générique (fixture non-JDR) + variante profil-JDR + détection de profil testée dans les deux sens.

## [0.32.0] — 2026-07-03

### Changed (`project`) — rework « communication → information »
- Le contenu daté d'un projet (`Pro/Projets/<name>/YYYY/MM/`) est désormais traité comme de la **communication transitoire** (emails + docs) ; les fichiers structurels (`projet.md`/`commercial.md`/`backlog.md`/`memory.md`) sont l'**information distillée durable**. Nouvelle action **`distill`** : réduction déléguée à `obs:filler` → classification (`references/redistribution-rules.md`) → **décroissance temporelle** (info actuelle ramenée au mois courant, **date conservée dans le document** ; obsolète archivée/supprimée). Balayage à la demande.
- **Chemins ancrés** via l'ancre `tree` — fin du chemin mort `C:/Users/fxgui/Public/Notes/…` (le vrai coffre est sous `Documents/`). **Templates + règles de redistribution** recréés, **auto-contenus** dans `references/projet-template/` et `references/redistribution-rules.md` (plus de dépendance au coffre). Couplage `obs:filler` dans `fill`/`reorganize`/`export-rag`/`distill`. Garde template vide/corrompu dans `01-create` (signaler le corps manquant, ne jamais inventer).
- Suite behave `project` re-scaffoldée sur le spec réécrit ; run dry-run post-rework **26/26**.

### Added — invariant « intégrité des liens au déplacement » (`project`, `tree`, `filler`)
- Aucun move/rename/suppression ne doit laisser un wikilink `[[…]]`, un embed `![[…]]` ou une pièce jointe cassé : mettre à jour les chemins / co-déplacer les assets, puis **vérifier l'absence de référence pendante**. Une action destructive (`digest`/`synthesize`/`clean`, `judge`) doit rediriger ou signaler les références vers une source supprimée. Porté en règle transversale dans les trois skills + NO-GO behave (`project` DN5, `tree` S18, `filler` S16/S17).

### Tests — baselines behave dry-run (2026-07-03)
- Runs des suites saines : `mail` 19/19, `filler` 18/18, `tree` 19/19 (fixtures synthétiques peuplés, juge lecture seule).

## [0.31.0] — 2026-07-02

### Tests — suites comportementales behave pour les 7 skills
- Scaffold → review → correctifs (via `overcode:behave`) d'une suite de scénarios par skill (`project`, `mail`, `brief`, `extract-pdf`, `filler`, `research`, `tree`) : ~107 scénarios GO/NO-GO/boundary aux critères **write-scoped**, Results logs vides (scaffold pur). Correctifs post-review : faux-FAIL désamorcés (`filler` S3, `brief` S2/S3), miroirs NO-GO de discriminance (phishing, age-gate, narrow→inline, merge/index, résumer/fusionner, I2/I4), fixtures étendus. Contradictions de spec des skills consignées en Finding notes / clauses N/A.

## [0.30.0] — 2026-07-02

### Fixed (`filler`) — `digest` ne s'applique plus aux messages humains
- `digest` extrayait les champs structurés d'un groupe homogène et supprimait les sources sans jamais reproduire le contenu verbatim — correct pour une notification automatique (l'information tient dans les champs), mais destructeur pour un message humain (l'information tient dans le corps du texte libre, non réductible à une colonne) : une fois la source supprimée, on savait seulement « untel a écrit à telle date », plus ce qui avait été dit.
- Garde ajoutée à l'étape 3 de `03-digest.md` : si un champ variable est un texte libre porteur de sens rédigé par un humain, le groupe n'est pas un candidat `digest`, même structurellement homogène — rediriger vers `synthesize`, qui préserve l'information sous forme de prose. Règle correspondante explicitée dans `references/digest-matrix.md` et dans le tableau des actions / la philosophie de `SKILL.md`. Scénario d'éval ajouté (`digest-refuse-human-messages`).

## [0.29.0] — 2026-07-02

### Removed — `forge` déplacé vers `writing`
- Le skill `forge` (développement/challenge du concept narratif) rejoint `writing` : il ne produit que du craft narratif générique (roman, scénario JDR écrit, guide), sans dépendance aux autres skills `obs`. `obs` reste en amont via `brief` (assemblage de `_brief/`) et `research` (données) ; les références croisées vers le concept pointent désormais vers `writing:forge`.
- `README.md`, `.claude-plugin/plugin.json`, `references/jdr-layout.md`, `skills/research/SKILL.md` et `skills/brief/` mis à jour en conséquence.

## [0.28.0] — 2026-07-02

### Removed — `lore-extract` et `rules-keeper` extraits vers `ttrpg`
- Les deux skills de ventilation JDR `lore-extract` et `rules-keeper`, laissés dans `obs` lors de la première extraction (0.27.0), rejoignent finalement `ttrpg` : tout l'outillage JDR (jeu **et** assemblage) vit désormais dans un seul plugin. `obs` reste en amont sur le même domaine `R` via `extract-pdf` (sources brutes) et `research` (rapports).
- `README.md`, `references/jdr-layout.md`, `references/jdr-layout-checks.py` et `references/bank-yml.md` mis à jour en conséquence ; références croisées (`brief`, `research`, `extract-pdf`) repointées vers `ttrpg:lore-extract`/`ttrpg:rules-keeper`.

## [0.27.0] — 2026-07-02

### Removed — extraction du plugin `ttrpg`
- Le trio JDR solo `pc`, `rpg` (renommé `campaign`) et `solo-mc`, ainsi que les agents `narrateur` et `oracle`, sont **extraits** dans un plugin séparé `ttrpg` (nouveau plugin, `plugins/ttrpg/`). `lore-extract` et `rules-keeper` **restent** dans `obs` — partagés par `writing` et `ttrpg` — de même que `references/jdr-layout.md` (dupliquée dans `ttrpg/references/`, à resynchroniser manuellement).
- `README.md` et `plugin.json` mis à jour en conséquence.

## [0.25.0] — 2026-06-25

### Changed (`tree/destinations`) — projets `pro-projet` = destinations email actives
- Les répertoires de projet `Projets/<projet>` sont désormais émis comme destinations **actives** (cible de la correspondance client classée sous `Projets/<projet>/<AAAA>/<MM>`), plus commentés. Seul `_code/` (et les autres répertoires de travail préfixés `_`) reste exclu.
- La liste des catégories commentées passe aux domaines **savoir/assets** sans email (`Dev`, `tech`, `Library`, `Design`…) en plus des médias.

## [0.24.0] — 2026-06-25

### Changed (`tree`) — skill invocable par le modèle
- Retrait de `disable-model-invocation` du frontmatter de `tree/SKILL.md` : `obs:tree` peut désormais être déclenché automatiquement par le modèle (index/check/fix/sort/judge/destinations) selon le trigger mapping, en plus de l'invocation explicite.

## [0.23.0] — 2026-06-25

### Added (`tree`) — action `destinations` : export de la routing map email
- Nouvelle action `06-destinations` : exporte la partie **durable** de l'arbo (`(Perso|Pro)/category/subcategory`, parent des niveaux datés `AAAA/MM`) en `destinations.txt` consommé par le routeur `email-to-markdown`. Dérive les destinations depuis le cache (auto-`index` si absent/périmé), une ligne par domaine préfixée du segment d'ancre, **sans** `AAAA/MM` (le routeur ajoute `/<Year>/<Month>`), groupée par catégorie ; règles de matching laissées vides (jamais inventées), catégories non-email (médias, `pro-projet`) commentées, catch-all `| default` commenté. Artefact dérivé : ne déplace/renomme/supprime jamais de contenu utilisateur ; n'écrase jamais un `destinations.txt` curé sans diff + confirmation.
- Référence `references/destinations-template.md` (format, attributs de matching, priorité, template) **déplacée** de `skills/tree/references/` vers la racine `references/` du plugin (à côté de `tree-convention.md`) pour que `${CLAUDE_PLUGIN_ROOT}/references/…` résolve correctement. Branchée dans `SKILL.md` (table, trigger mapping, External data) et `evals/scenarios.json`.

## [0.22.0] — 2026-06-15

### Added (`rpg`) — arbitrage des informations préparatoires (#6)
- Règle explicite pour traiter la prep (`R/_campagnes/<campagne>/prep/session-<n>.md`) comme un **fichier de travail**, jamais un artefact canonique : à chaque prep (et au `review`), **chaque information reçoit un statut** — **canon** (vérité durable → promue dans un `mj/` de fiction, campagne ou univers ; jamais `canon/`, réservé à `lore-extract`), **temporaire** (échafaudage de séance gardé dans `prep/`, nommé comme tel) ou **jetable** (obsolète → supprimé). Arbitrage **visible et reproductible** ; **rien d'important ne reste coincé** dans un fichier de travail.
- Référence canonique : nouvelle section `references/jdr-layout.md › Arbitrage des informations préparatoires (rpg)` (table des 3 statuts + invariants), pendant prep du *Routage des faits de fiction (solo-mc)*. Branchée dans `SKILL.md` (transversal rule), `03-prep-session` (étape 9 + Test), `06-review` (check 9 : signale toute vérité durable coincée en prep) et `scenarios.json`.

### Added (`solo-mc`) — suite comportementale Monsterhearts recentrée (#4, #5)
- Nouvelle suite `evals/monsterhearts-scenarios.md` **focalisée sur le canon MH2** : branches spécifiques au jeu que la suite générique délègue (économie d'*ascendant*/strings d'Allumer, Allumer sur cible non-consentante, précondition de Manipuler, texte des paliers, Darkest Self / *mues*) + garde anti-invention de mécanique. Les cas génériques (chance pure → oracle, fallback sans move, MC ne lance jamais, trigger-first) **restent** dans `rules-triggering-scenarios.md` (#4) — référence croisée ajoutée des deux côtés.
- `How to run` **sûr pour l'arbre généré** (#5) : ne référence **que des fichiers présents in-tree** (`SKILL.md` + `actions/{01-play,02-scene,04-roll}.md`) ; les rôles narrateur/oracle sont exercés via `SKILL.md › T2` plutôt que par des chemins `agents/…` absents de la copie générée du skill.

## [0.21.0] — 2026-06-14

### Fixed (`solo-mc`) — `play` s'ancrait sur l'avant-dernière séance
- Bug observé en jeu réel : `play` recréait la séance sur l'**avant-dernière** au lieu de la dernière. Cause racine : l'ordre des séances était **sous-spécifié** (pas de règle d'extraction de `<N>`, pas de clé de tri partagée `play`/`play-resume`) — avec des noms mêlés (compteurs nus `session-4.md`, datés+suffixe `session-2026-06-01-03.md`, datés-purs `session-2025-12-03.md` où le jour pouvait être lu comme `<N>`), un modèle fidèle pouvait s'ancrer sur la mauvaise séance, d'autant qu'une séance antérieure portait un bloc « Précédemment… » clé-en-main.
- Fix : **règle d'ordre canonique** unique dans `references/jdr-layout.md › Ordre canonique des séances` (`<N>` fait foi, extraction par forme de suffixe, exclusion `-prep-`, « dernière » = `<N>` max, clé **partagée** ; calcul **par entité courante** — un PJ multi-campagnes a une séquence `<N>` indépendante par campagne). Référencée par `01-play` (7-8 : recap sourcé de la séance de `<N>` max), `11-play-resume` (3 : *latest* = `<N>` max, même clé) et le pitfall `SKILL.md`.
- Prouvé par `/behave` (suite `play-scenarios.md`, L17/L18) : run 5 reproduce **0/2 FAIL** → run 6 post-fix **2/2 PASS**.

### Added (`pc`) — action `sessions` : toutes les séances d'un PJ
- Nouvelle action read-only **`pc sessions <pj>`** : découvre les campagnes du PJ via `_campagnes/*/config.yaml` (match tolérant aux chemins avec/sans préfixe `_`), agrège les séances de **chaque** axe campagne + l'axe PJ, groupées par source et ordonnées par la règle canonique (`<N>` indépendant par campagne ; campagne sans séance affichée explicitement). Branchée dans `SKILL.md` (table 08 + router) et `scenarios.json`.

### Changed (`pc`) — ordre des séances aligné sur `solo-mc`
- Propagation de la règle canonique à `04-log-session` (extraction de `<N>` par forme de suffixe), `05-show` (dernier log = `<N>` max), `03-reorganize` (nommage/numérotation) + nouvelle transversal rule « Session dating / numbering » dans `SKILL.md`. `pc` et `solo-mc` désignent désormais la **même** séance comme « la dernière ».
- Validé par `/behave` (suite `pc-scenarios.md`, C12/C13/C14) : reproduce-then-confirm spec-logic, **PASS**. (Data limit assumé : domaine réel sans séances sur l'axe PJ ni PJ multi-campagnes → verdicts spec-logic.)

## [0.20.0] — 2026-06-14

### Changed — revue R1-R10 des 12 skills (aidd-context `skills`)
- **5 skills migrés en anglais** (R10) : `extract-pdf`, `lore-extract`, `mail`, `research`, `rules-keeper` (frontmatter, corps, actions, références propres). Préservé en français à dessein : déclencheurs bilingues, chaînes de sortie utilisateur, templates écrits sur disque (`mail-config.yaml`, fiches compagnon, `terminologie.md`, `document-rules.md`), labels de classification load-bearing. Contenu de jeu et citations de sections partagées (`jdr-layout.md`) inchangés.
- **Anatomie R8** : `## Outputs` ajouté à `extract-pdf/05-run`, `rules-keeper/02-restructure-all`, `rules-keeper/03-update` (Inputs → Outputs → Process → Test) ; `tree` : `## Output` → `## Outputs` placé avant `## Process` (×5) + fragments FR traduits ; `pc/06-companion` : section `## Output shapes` renommée `## Companion sheet templates` (collision).
- **`brief`, `forge`, `project`** déjà conformes (anglais, anatomie OK). Les 4 skills JDR (`rpg`/`pc`/`solo-mc`/`tree`) finalisent la conformité du plugin entier.
- Migrations **doc-only et behaviour-preserving** (chaque règle préservée verbatim ; identifiants/chemins inchangés).

## [0.19.0] — 2026-06-14

### Changed — migration anglaise des skills JDR (R10) + `pc` aligné en routeur (R1)
- **`rpg`, `pc`, `solo-mc` migrés en anglais** (frontmatter, corps, actions, références propres au skill) — conformité R10 (aidd-context `skills`). Le **contenu de jeu** (univers/système, lore, artefacts produits, prompts d'eval, templates wrapper compagnon) reste en français ; les tables de dispatch gardent des déclencheurs bilingues FR+EN.
- **`pc` restructuré** : ses 7 actions, jusque-là **inline** dans `SKILL.md` (235 l.), sont extraites en `actions/01-new` … `07-background` (anatomie Inputs/Outputs/Process/Test) ; `SKILL.md` redevient un **routeur pur** (66 l.), aligné sur `rpg`/`solo-mc`.
- **`rpg`** : anatomie des 6 actions corrigée (`## Outputs` placé avant `## Process`).
- **Zéro régression comportementale** vérifiée par re-run des suites (`rules-triggering` 13/13, `rpg` 10/10, `pc` 9/11) — identiques aux baselines ; tous les identifiants/chemins (`_univers/`, `_systeme/`, labels T0–T14, slugs) préservés verbatim.

## [0.18.0] — 2026-06-13

### Changed — arborescence JDR recalée (`_savoir/` retiré)
- Révision corrigée : `_savoir/univers/`, `_savoir/systeme/`, `_savoir/subsystems/` reviennent à **`R/_univers/`**, **`R/_systeme/`**, **`R/_subsystems/`** (niveau domaine), conforme aux projets RPG existants. Résolution de `R` par **multi-marqueur** (`_campagnes/` · `_univers/` · `_pjs/`) au lieu du marqueur `_savoir/`. Propagé à tous les skills/agents/références. Préfixe d'invocation **`obsidian:` → `obs:`** partout.

### Added (`solo-mc`) — déclenchement des règles (fiction→rule bridge)
- La boucle de jeu **statue avec les règles du système actif dès qu'une action de PJ est incertaine et à enjeu**, au lieu de narrer librement (défaut observé en jeu réel). Porté par `agents/narrateur.md` (§ *Mechanic triggering — uncertainty → rules*), `SKILL.md` T13 Étape 1 (trigger-first) + Étape 3, `actions/02-scene.md`, `actions/04-roll.md` (entrée déclenchée par la fiction). **Système-agnostique** : déclencheur textuel (PbtA → 2d6+carac/paliers) **ou** jugement d'incertitude (d100 ≤ Compétence%+Carac%, vs DC…). Validé sur deux classes de systèmes (PbtA + d100).

### Added (`solo-mc`) — parallaxe : basculement de point de vue + division des subsystems
- L'**oracle** maîtrise `parallaxe` + `muses-et-oracles` (draw + interprétation → directive `POV → <vantage>`) ; le **narrateur** maîtrise `cinerio` + `conversation-cards` et **rend** la directive. La Focale tirée (Moi/Compagnon/PNJ/Tiers/Lieu) **recadre le point de vue** du beat. Résolution robuste du canon de sous-système (install domaine, bibliothèque partagée, top-level — `canon/` ou `systeme/canon/`).

### Added (`solo-mc`) — checklists de qualité go/no-go
- `references/dialogue-go-no-go.md` (norme du **bon dialogue** PNJ — narrateur) et `references/rebondissement-go-no-go.md` (norme du **bon rebondissement** — oracle), ancrées sur la craft (recherche + connaissances) ; les decks conversation-cards / rebondissements ne sont que des **outils d'aide**.

### Added — harnais de tests & checkers
- Suites comportementales : `rpg`, `pc`, `solo-mc` play-loop (T0–T14), rules-triggering, parallaxe-pov, dialogue-quality, rebondissement-quality (avec Results logs de régression). Checkers Python : `references/jdr-layout-checks.py` (conformité d'arborescence d'un domaine), `evals/oracle-data-checks.py` (intégrité des subsystems, résolution robuste alignée sur l'agent).

## [0.17.0] — 2026-06-13

### Changed (`solo-mc`, `pc`) — journaux de session sur l'axe daté du domaine
- Les **journaux de session** passent de `R/_campagnes/<campagne>/<AAAA>/<MM>/` à **`R/<AAAA>/<MM>/<campagne>/`** (axe daté au sommet de `R`, feuille = entité), aligné sur la convention des projets d'écriture `R/<AAAA>/<MM>/<projet>/`. L'état **durable** de la campagne (`config.yaml`, `.session-state.yaml`, `mj/`, `research/`, prep) reste dans `R/_campagnes/<campagne>/`. Actions solo-mc touchées : `play`, `previously`, `play-end`, `play-resume` (+ règle T10 et numérotation). Numérotation `<N>` désormais **globale** (balayage de tous les dossiers année/mois).
- **`pc` aligné** : `log-session` écrit désormais un **fichier daté par session** `R/<AAAA>/<MM>/<pj>/session-<AAAA-MM-JJ>-<N>.md` (miroir de solo-mc) au lieu d'un `journal.md` agrégé ; les fiches durables du PJ (`pj.md`, `fiche_technique`, `intention`, `etat-jeu`, `backlog`) restent dans `R/_pjs/<pj>/`. Référence : `references/jdr-layout.md` (nouvelle variable `<session-root>`).
- **Nommage de session simplifié** (solo-mc + pc) : le fichier daté **abandonne le préfixe slug** (redondant avec le dossier parent `<campagne>/` ou `<pj>/`) → `session-<AAAA-MM-JJ>-<N>.md` nu. Le scan de numérotation utilise le glob tolérant `session-*.md`, qui couvre les anciens noms (`session-N.md`). Surfacé par un run comportemental sur domaine réel (`monsterhearts`) où l'ancien glob préfixé matchait 0 fichier et réinitialisait `<N>`.

> ⚠ Données existantes : d'anciens journaux sous `_campagnes/<c>/<AAAA>/<MM>/` ou un `_pjs/<pj>/journal.md` ne sont pas migrés automatiquement (à déplacer/éclater à la main ou via `tree`). Le `pj-template` dans `R/_shared/` peut encore créer un `journal.md` — à retirer côté domaine.

## [0.15.0] — 2026-06-13

### Changed (`tree`)
- **Convention `Pro/Projets` formalisée** dans `references/tree-convention.md` : structure à trois niveaux (`<projet>/` + `_code/` pour le code + `<AAAA>/<MM>/` pour les travaux et suivi mensuel). Aucun `INDEX.md` n'est attendu ; le mois le plus récent est enregistré comme `entry` dans le cache.
- `index` reconnaît `Pro/Projets/` comme **domaine à convention fixe** (`kind: "pro-projet"`) — pas besoin d'inférer depuis le contenu ; I2–I3 exclus du contenu de `_code/`.
- `check` n'émet plus d'anomalie pour l'absence d'`INDEX.md`, la présence de `_code/`, ni pour des mois sans `_brief/`/`_output/` dans ce domaine.
- `sort` route par type : code/source → `_code/` ; note/suivi → mois courant (propose la création si le dossier n'existe pas encore).

## [0.14.0] — 2026-06-13

### Changed (`brief`)
- **Contrat resserré** : `_brief/personas/` et `_brief/output-styles/` exigent désormais **≥3 entrées distinctes** chacun ; `check` signale un brief en-deçà comme incomplet (aligné sur `writing:references/brief-model.md`, vérifié par `tools/eval/harness.mjs`).

### Fixed
- **`rules-keeper`** — `evals/scenarios.json` réparé : les `expect_action` utilisaient des ids de fichier périmés (`01-restructure`…) et des chemins `.docs/sources/` obsolètes ; remplacés par les vrais noms d'actions (`restructure`, `restructure-all`, `update`, `local`) et des prompts conformes au modèle `R` local.

## [0.13.0] — 2026-06-13

> **Migration JDR complète vers `Documents/` — BREAKING.** Abandon du coffre séparé (`tnn-jdr`, `~/.jdr.yaml`, variable globale `<vault>`). Tous les skills JDR (producteurs `lore-extract`/`rules-keeper`/`extract-pdf`/`research`/`forge` + trio `solo-mc`/`rpg`/`pc` + agents `narrateur`/`oracle`) passent au modèle **local autonome** : domaine `R = <jeu>` découvert via le marqueur `_campagnes/`, `_univers/` ou `_pjs/`, savoir durable en `R/_univers/` (canon/mj préservés), `bank.yml` n'est plus un input de résolution. Nouvelle réf `references/jdr-layout.md` (remplace `vault-layout.md`). Agents helper `*-jdr` supprimés. Détail : `git log -- plugins/obs`.

## [0.12.0] — 2026-06-13

### Added
- **`tree`** — organiseur de l'arborescence `Documents/`, **piloté par un cache** (pas de layout figé, car l'arbo bouge). 4 actions : `index` (scanne le réel → `<ancre>/_tree/cache.json` + régénère le manifeste `R/bank.yml` de chaque domaine en scannant `R/_univers/`, `R/_systeme/`, etc., fusion non destructive), `check` (vérifie les invariants de portabilité + la dérive vs la convention apprise, report-only), `fix` (corrige sûrement : rename/move uniquement, dry-run + confirmation, jamais de suppression/écrasement), `sort` (tri par arbitrage des éléments en vrac). Ancre découverte (`Perso`/`Pro`), jamais de chemin global en dur. Convention : `references/tree-convention.md`.
- Petit **noyau d'invariants** stables (préfixe `_` des répertoires de travail, contenu interne non préfixé, slugs `kebab-case` portables, dates bien formées) ; le schéma `(Perso|Pro)/cat/subcat/AAAA/MM/unité` n'est qu'un **défaut observé**, appris par domaine, non imposé.

### Changed (`brief`)
- **Distinction `R` (domaine) vs `<projet>` (unité de travail).** `R` = niveau `subcategory`, héberge les **ressources globales / savoir durable** (`R/_univers/`, `R/_systeme/`, etc.) ; `<projet>` = le projet d'écriture (typiquement `R/<Year>/<Month>/mon-projet/`) qui porte `_brief/`/`_output/` et que `brief` cible. `brief` lit les globales de `R` et les **consolide inline** dans `<projet>/_brief/summary.md` ; `writing` ne remonte jamais vers `R` (projet portable).
- **`R/bank.yml` ré-introduit avec un rôle neuf** : manifeste (cache) des ressources globales **au niveau domaine seulement** (jamais dans le projet), **maintenu par `tree`** (régénéré depuis `R/_univers/`, `R/_systeme/`, etc.), **lu uniquement par `brief`** à l'assemblage (sélection de pertinence via `summary`), **jamais par `writing`**. Distinct de l'ancien `bank.yml` par-projet lu au runtime (supprimé en 0.11.0). Réf : `skills/brief/references/bank-yml.md`.

> Note : `tree` est une vue d'ensemble **pour l'humain** — pas une dépendance d'exécution des skills de production (`writing`, `brief`), qui restent en chemins **locaux** relatifs. _(Superseded par 0.13.0 : `vault-layout.md` a depuis été remplacé par `jdr-layout.md` et tous les skills JDR sont migrés.)_

## [0.11.0] — 2026-06-13

> **Séparation des responsabilités** : `obs` devient le lieu d'**assemblage des intrants** (brief, lore, données, init projet) ; `writing` produit à partir de ces intrants.

### Added (absorption depuis rpg-writer / writing, dissous)
- **Assemblage des intrants** : `forge` (concept/brief), `research` (recherche documentaire / données).
- **`setup` → `brief`** (renommé + refondu) : construit le répertoire de travail **portable** `_brief/` (summary.md autosuffisant + personas/ + output-styles/) consommé par `writing`. Abandon de `bank.yml` et des chemins globaux (`~/.jdr.yaml`, `<vault>`) — chemins **locaux** relatifs à un répertoire de référence `R`. `references/bank-yml.md` supprimé.
- **Skills JDR** : `lore-extract` (lore univers → canon/mj), `rules-keeper` (règles de jeu → format LLM), `extract-pdf` (pipeline d'extraction PDF multi-sessions).
- **Agents JDR** : `claude-code-optimizer-jdr`, `documentation-architect-jdr`.

### Changed
- Refs internes vers les skills absorbés : `/rpg-writer:lore-extract` → `/obs:lore-extract`, `/rpg-writer:extract-pdf` → `/obs:extract-pdf` ; refs README `writing:rules-keeper` → `rules-keeper`, suppression de l'annotation « (plugin writing) » sur `lore-extract`.
- Refs cross-plugin vers le craft narratif (resté dans `writing`) namespacées : `write`/`review`/`toc` → `writing:write`/`writing:review`/`writing:toc` dans les descriptions de `rules-keeper`, `lore-extract`, `extract-pdf`, `forge`, `research`.

## [0.10.0] — 2026-06-06

### Changed
- **Migration arborescence vault** : dossiers de travail préfixés `_` (`_pjs/`, `_campagnes/`, `_univers/`, `_systeme/`, `_subsystems/`) ; journaux de session déplacés vers `<jeu>/<YYYY>/<MM>/<campagne>-session-<YYYY-MM-DD>-<N>.md` (classement daté). **Breaking** : mise à jour de `~/.jdr.yaml › vault` requise (renommage `JdR` → `RPG`).
- **`.session-state.yaml`** : déplacé de `campagnes/<campagne>/sessions/` vers `_campagnes/<campagne>/` (non daté).
- **Résolution « dernière session »** : balayage `<jeu>/<YYYY>/<MM>/` filtré sur `<campagne>-session-*.md` (remplace scan `sessions/`).
- **Setup de campagne** : plus de sous-dossier `sessions/` créé (les journaux vont dans les dossiers datés).
- **Suppression du plugin `hermes`** : `obs:solo-mc` devient l'unique portage de jeu en direct. Références `hermes:solo-mc` → `obs:solo-mc` dans tout le plugin.
- Chemin absolu défaut vault : `Perso/JDR` → `Perso/RPG` (renommage répertoire).
- Repli sous-systèmes partagés : `<vault>/subsystems/` → `<vault>/_subsystems/`.

## [0.8.0] — 2026-06-01

### Added
- **`solo-mc` réintroduit comme variante Claude Code** (`obs:solo-mc`) — copie de la version `hermes` (SKILL + actions + references + evals) avec ses agents `oracle` et `narrateur`. **Re-split par runtime** : `obs:solo-mc` (Claude Code) et `hermes:solo-mc` (Hermes Agent, en cours d'adaptation native) sont deux portages du même jeu en direct, partageant le coffre. Préserve la version Claude Code fonctionnelle (sous-agents) avant la conversion Hermes du plugin `hermes`.

## [0.7.0] — 2026-06-01

### Added
- **`pc` : compagnons (team du PJ)** — nouvelle action `companion` (create / fill / show). Fiches canoniques légères « Minimale jouable » dans `pjs/<pj>/compagnons/<slug>.md` (jouées par substitution pour le feeling table) ; roster actif dans le `config.yaml` de la campagne (clé `compagnons:`) qui référence les fiches. Lues par `obs:solo-mc` au jeu.

### Removed
- **`solo-mc` déplacé vers le plugin `hermes`** (`hermes:solo-mc`). Le jeu en direct quitte `obs` pour rejoindre un plugin sous contrat d'architecture Hermes Agent. Les agents `mj-solo` et `oracle` suivent. Le trio JDR solo est désormais réparti : `obs` (`pc`, `rpg`) + `hermes` (`solo-mc`). Renvois et invocations (`/hermes:solo-mc setup`) mis à jour dans `rpg` et `pc`.

## [0.6.0] — 2026-05-31

### Changed
- **Lore d'univers en dossiers visibles** : `JDR/<jeu>/univers/<univers>/.docs/{canon,mj}/` → `univers/<univers>/{canon,mj}/`. Aligné sur `systeme/{canon,mj}/` et `subsystems/<nom>/{canon,mj}/` ; le lore devient lisible dans Obsidian (les dossiers `.docs/` y étaient masqués). Convention partagée avec `rpg-writer:lore-extract`. Skills alignés : `rpg` (campaign / scenario / prep-session / npc / faction / review), `solo-mc`, `pc`.

## [0.4.0] — 2026-05-29

### Added
- **`rpg`** — prep MJ du JDR solo : écriture de scénarios et préparation de campagne. Actions : `campaign` (couche prep + synopsis + rattachement univers), `scenario` (situation jouable : lieux, PNJ, fronts, amorces, issues), `prep-session` (objectif, scènes probables, questions oracle pré-armées, tables, accroches), `npc`, `faction` (faction durable + fronts/horloges), `review` (cohérence et jouabilité). Complète `pc` (fiches PJ) et `solo-mc` (jeu en direct) ; campagne dans `JDR/<campagne>/`, ancrée sur l'`intention.md` du PJ et le **sous-système Parallaxe**.
- **`solo-mc`** — maître de jeu du JDR solo en direct (play, scene, oracle, roll, setup, journal-pdf…), **déplacé depuis `aidd-overlay`** pour regrouper la suite JDR solo. Skill inchangé.

### Changed
- **`pc` : sous-système Parallaxe** (auparavant Jauges & Tarot). Parallaxe est un sous-système (greffé sur le système de jeu), pas un jeu. Les termes de mécanique J&T (jauge narrative, échos, points de destin, as/cavaliers…) sont remplacés par une déférence à la référence ; le `_template/`, `pj-manager.py` et les règles `JDR/subsystems/parallaxe/` (hors dépôt) doivent être alignés côté coffre.
- **Données univers partagées, scindées canon / MJ** : l'univers vit dans `JDR/univers/<univers>/.docs/` avec deux sous-arbres thématiques identiques — `canon/` (lore officiel, écrit par `lore-extract`) et `mj/` (contenu créé par le maître de jeu, écrit par `rpg`). `rpg` n'écrit jamais dans `canon/` et ne contredit pas le canon en silence. Même arborescence partagée avec `lore-extract` (plugin writing).
- **Règles partagées, scindées canon / mj** : `pc`, `rpg` et `solo-mc` consultent la même référence de règles — système de jeu + **sous-systèmes génériques** (Parallaxe, Cinério, Muses et Oracles…) — au format `writing:rules-keeper`, en `JDR/subsystems/<nom>/canon/` (officiel) + `JDR/subsystems/<nom>/mj/` (house rules du MJ qui déclarent leurs overrides). Règles effectives = système de jeu + sous-systèmes actifs (canon + house rules déclarées) ; aucune mécanique inventée hors de ces références.

## [0.3.1] — 2026-05-29 (baseline)

Skills : `project`, `pc`, `mail`.

### Fixed
- `mail` : gestion d'un frontmatter non-YAML lors de l'insertion de `processed: true`.

## [0.3.0]
- `mail` ajouté — tri, classification, fusion et résumé des emails exportés (Thunderbird) en Markdown ; v0.3.0 intègre 9 améliorations issues d'une session réelle.

## [0.2.0]
- `pc` ajouté — gestion des PJ JDR solo (Jauges & Tarot) : new, fill, reorganize, log-session, show.

## Antérieur
- `project` (gestion des projets Pro). Voir `git log -- plugins/obs` pour l'historique complet.
