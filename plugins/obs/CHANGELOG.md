# Changelog — obs

> Baseline établie le 2026-05-29 à partir de l'état courant ; transitions récentes reprises de l'historique git. Détail antérieur : `git log -- plugins/obs`.

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
