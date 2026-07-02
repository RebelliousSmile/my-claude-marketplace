# Changelog — obs

> Baseline établie le 2026-05-29 à partir de l'état courant ; transitions récentes reprises de l'historique git. Détail antérieur : `git log -- plugins/obs`.

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
