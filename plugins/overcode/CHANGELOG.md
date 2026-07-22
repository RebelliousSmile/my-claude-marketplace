# Changelog — overcode

> Baseline établie le 2026-05-29 à partir de l'état courant ; transitions récentes reprises de l'historique git. Détail antérieur : `git log -- plugins/overcode plugins/aidd-overlay` (le plugin s'appelait `aidd-overlay` avant la 3.0.0).

## [3.4.0] — 2026-07-22

### Added — `changelog`
- **Action `curate` (02)** (`actions/02-curate.md`) — passe de maintenance sur un `CHANGELOG.md` existant, en deux temps. **Combler** : inventaire croisé entre les sections `## [x.y.z]` du fichier et `git tag`, classant chaque écart (version taguée mais non documentée → reconstruite depuis `git log <prev>..<tag>` et datée par le tag ; version documentée sans tag → signalée, non modifiée ; saut de numérotation sans tag → signalé comme trou de versionnage, jamais inventé ; commits postérieurs à la dernière version → `Unreleased`). **Condenser** : chaque cycle majeur strictement antérieur au majeur courant est remplacé par une seule section résumé, plafonnée à **20 items** toutes catégories confondues, portant la plage git qui détient le détail. Priorité de coupe explicite (breaking changes et actions de migration jamais retirés, puis fonctionnalités encore vivantes, puis renommages, puis fixes observables) ; fusion de lignes sœurs plutôt que sacrifice d'un thème. Le majeur courant reste intact mot pour mot, et l'action est idempotente — un résumé n'est jamais re-résumé. Ne tague pas.

### Changed — `changelog`
- **`SKILL.md`** — table de dispatch entre les deux actions (`curate` ne crée jamais le fichier, `generate` seul tague, release sur un fichier troué = `generate` puis proposition de `curate`) ; règles transversales ajoutées : ne jamais inventer version, date ou entrée (ce que ni le fichier ni git ne fournit est déclaré non récupérable), plafond de 20 items par résumé, pointeur git obligatoire sur tout résumé.
- **`actions/generate.md` → `actions/01-generate.md`** — alignement sur la convention de numérotation des actions du plugin. Contenu inchangé.

## [3.3.0] — 2026-07-22

### Added — `control`
- **Action `strengthen` (04)** (`actions/04-strengthen.md`) — miroir de `audit` : au lieu de retirer les tests sans valeur, identifie les tests manquants / la couverture manquante qui comptent vraiment, classés par **risque** (conséquence, branches non couvertes, churn git, blast radius, absence d'autre filet) et non par pourcentage de couverture. Produit une table `top_n` avec tier proposé et justification, plus la liste explicite de ce qui a été volontairement écarté (pass-through framework, code généré, chemins déjà couverts en e2e). N'écrit aucun test : chaque gap confirmé est repassé à `01-write` pour la décision de tier et la contrainte de nombre.
- **Action `stats` (05)** (`actions/05-stats.md`) — état des lieux en lecture seule, en un écran : quelle **stratégie de test fait autorité** (document projet cité par chemin, ou défaut générique `references/decision-framework.md`), sa **lisibilité** (actionnable vs simple gabarit non rempli, avec le mapping appliqué par défaut unit/integration → `contract`, e2e → `e2e`), le volume réel (fichiers/cas par tier, ratio tests/sources), l'outillage effectivement câblé (runner, gate de coverage *configurée et invoquée* vs inerte, outil e2e), et des flags nommant l'action qui traite chaque écart. N'écrit rien, ne propose rien : aucun chiffre n'y est un objectif, et un pourcentage de couverture déclaré n'est jamais lu comme un budget.

### Changed — `control`
- **`references/pivot-contract.md`** — trois champs optionnels formalisés dans la forme attendue d'un pivot `testing` : **Coverage command** (rapport machine-lisible par fichier, chemin du fichier produit, reporter à demander explicitement, production garantie indépendamment de tout gate de couverture), **Source glob & exclusions** (le code de production classable — c'est ce champ qui définit l'univers classé, le rapport de coverage ne fait que l'enrichir) et **Risk signals** (ce qui est structurellement à forte conséquence dans la stack). Chacun est marqué optionnel avec son repli explicite, et la frontière est écrite noir sur blanc : **les signaux de risque priorisent, ils ne classent jamais un tier**. Nouvelle section « Field names versus section titles » : une section par champ, un titre qui énonce le champ, liste de correspondance à la charge du pivot quand les titres divergent de l'anglais du contrat, et champ introuvable traité comme champ absent (jamais inféré d'une section voisine).
- **`actions/04-strengthen.md`** — l'action cesse d'être générique là où le pivot fournit une source de vérité : classement piloté par `Source glob & exclusions` (un fichier du glob absent du rapport de coverage est **non couvert**, jamais inexistant), `Coverage command` exécutée telle quelle avec code de sortie ignoré et lecture de `covered`/`total` plutôt que de `pct`, `Risk signals` branchés sur la pondération « conséquence » en priorisation seule. Deux cas limites bornés : **aucune suite de tests** → constat et renvoi vers la stratégie, aucun classement (classer tout l'arbre source nierait la contrainte de nombre) ; **saturation** → total annoncé et réduction de `scope` proposée plutôt qu'une liste déroulée. L'absence de stratégie documentée est déclarée dans le rapport avec sa conséquence (`limit` reste `null`). Garde de cumul : plusieurs lignes confirmées passent par `01-write` **une par une**, la contrainte de nombre étant réévaluée entre chaque.
- **`SKILL.md`** — règle transversale de **solde net** `audit` ⇄ `strengthen` : les deux actions sont deux directions d'un même jugement, aucune n'est un quota (ne rien trouver à retirer et ne rien trouver à ajouter sont deux résultats valides), `strengthen` ne repropose pas un test sur un chemin que `audit` vient de faire supprimer, et un enchaînement des deux se rapporte en effet net sur le nombre de tests.

## [3.2.0] — 2026-07-21

### Added
- **Nouvelle skill `control`** (`skills/control/`) — gouvernance de la suite de tests d'un projet. Décide du **tier** avant toute écriture (`01-write` : `contract` / `e2e` / `skip`, plus contrainte de nombre), audite une suite existante à la recherche des tests sans valeur (`02-audit`) et détecte l'outillage de test mal configuré (`03-configure`). N'écrit jamais de code de test elle-même : une fois le tier décidé, l'écriture est déléguée à `aidd-dev:06-test`. Précédence des décisions : stratégie documentée du projet → `references/decision-framework.md` générique, un pivot `testing` de plugin de langage venant superposer les mécaniques de la stack (`references/pivot-contract.md`, découverte par glob). Renommée depuis `test-govern`.

### Added — `behave`
- **Grille de qualité 7 axes** (`references/quality-grid.md`) — scoring par scénario (Fidélité au contrat, Observabilité, Non-ambiguïté, Réalisme du fixture, Anti-invention, Minimalité, Reproductibilité), 0–2 par axe (14 max), seuils vert/jaune/rouge, et catalogue d'anti-patterns (faux bon test, scénario trop vague, scénario trop large) avec remèdes et exemples avant/après.
- **Action `review` (04)** (`actions/04-review.md`) — audite une suite existante en deux passes indépendantes : couverture comportementale (carte des comportements du spec ↔ scénarios, détection des gaps priorisés) puis qualité par scénario (grille 7 axes + anti-patterns). Produit un rapport actionnable (table de couverture, table de qualité, lacunes prioritaires avec sketch, améliorations ciblées). Ne lance pas le juge, ne modifie pas la suite, n'append rien au Results log.

### Changed — `behave`
- **`references/harness-conventions.md`** — règles de jugement renforcées : conditions précises PASS / FAIL / N/A (distinction gap vs régression, limite de données vs FAIL logique) et sections de détection des faux bons tests, scénarios trop vagues et trop larges, avec test de discriminance.
- **`SKILL.md`** — enregistre l'action `review` et la grille de qualité ; ajoute la table « Two questions — two tools » qui sépare explicitement les deux niveaux d'analyse (« Ce test est-il bien écrit ? » → quality-grid ; « Cette suite couvre-t-elle le comportement cible ? » → action `review`) ; description étendue aux triggers de review.

## [3.1.5] — 2026-06-18

- Bump de synchronisation — aucun changement fonctionnel dans le plugin ; description du catalogue `marketplace.json` remise à jour.

## [3.1.4] — 2026-06-17

### Changed — `alias:mirror`
- Court-circuit de `design:copycat` quand aucun écart de style n'est constaté ; page non ancrable ignorée en multi-page au lieu de bloquer le parcours ; mode omis du rapport global ; arbitrage `mirror` vs prompt direct explicité dans « Context required ».

## [3.1.3] — 2026-06-17

### Fixed — `alias:mirror`
- Ancrage multi-page corrigé (origine vs page), étape 4b de layout, mode A forcé en multi-page, registre indexé par page.
- `alias:rechallenge` — étape 2 omise de la liste multi-page.

## [3.1.2] — 2026-06-17

### Fixed — `alias:mirror`
- Routage du mode B en cas d'entrée mixte, fallback `copycat`, liste de propriétés remplacée par un principe ouvert, deal-breakers de rechallenge résolus.

## [3.1.1] — 2026-06-17

### Added
- **`alias:mirror` (10)** — réconciliation maquette ↔ implémentation via `design:copycat`, avec option `--page` pour la comparaison multi-pages séquentielle et étape 5 non bloquante si le navigateur est déjà ouvert.

### Removed
- **`alias:aiddlegacy` (07)** — nettoyage des installations AIDD antérieures à v4, devenu sans objet.

## [3.1.0] — 2026-06-13

### Added
- **Nouvelle skill `behave`** (`skills/behave/`) — harness de tests comportementaux : `scaffold` (suites de scénarios), `run` (juge en dry-run, lecture seule), `regress` (delta vs run précédent, flag PASS→FAIL). Références `harness-conventions` (contrat dry-run, reproduce → confirm, N/A vs FAIL, écriture cadrée) et `checker-pattern`, plus un gabarit de scénario.

## [3.0.0] — 2026-06-13

### Changed (BREAKING)
- **Renommage du plugin `aidd-overlay` → `overcode`.** Le préfixe d'invocation passe de `/aidd-overlay:<skill>` à `/overcode:<skill>` (motif : nom plus court à taper). La clé d'installation devient `overcode@my-marketplace`. Le dossier source est désormais `plugins/overcode/`. Aucun changement fonctionnel sur les skills.
- **Action requise après mise à jour** : réinstaller via `/plugin install overcode@my-marketplace` et mettre à jour toute référence locale (`settings.json` skillOverrides, `~/.claude/CLAUDE.md`, `~/.claude/rules/plugins-marketplace.md`).

## [2.x] — 2026-05-29 → 2026-06-13 (résumé)

> Détail par version (2.0.0 → 2.2.0, plugin alors nommé `aidd-overlay`) : `git log ba3e0ba..b10cf78 -- plugins/aidd-overlay`.

### Added
- **Skill `seo-optimize`** (2.1.0) — audit SEO/GEO : indexabilité, title/meta/H1, données structurées, E-E-A-T, Core Web Vitals → roadmap priorisée.
- **Skill `ap-optimize`** (2.0.x) — audit d'implémentation ActivityPub (inbox, outbox, signatures HTTP, fan-out, conformance AS2), stack-aware via les pivots `sc-*`.
- **`alias:gitit`** (2.2.0) — transforme un dossier en dépôt git synchronisé en une commande : init → dépôt distant **privé** via `gh` → commit → pull → push → tag SemVer conditionnel. Idempotent, dégradation propre si la création distante est bloquée, public uniquement sur `--public` explicite.
- **`alias:weeklyemail`** (2.1.1) — synthèse hebdomadaire.
- **`alias:aiddlegacy`** (2.0.0) — nettoyage d'une installation AIDD antérieure à v4 (scan des handles v4, rapport dry-run, application sur confirmation, arbitrage des rules par catégorie). *(retiré en 3.1.1)*

### Changed
- **`alias:endtask` absorbe `endplan`** (2.1.3) — un seul enchaînement de fin de tâche ; l'action `learn` s'auto-valide.
- **`alias:afterdev` renommé `build`** (2.0.2), puis **retiré** (2.1.2) — redondant avec `aidd-dev:05-review`.

### Fixed
- **`alias:endtask`** (2.1.4) — le numéro d'issue est auto-détecté depuis cinq sources au lieu d'être demandé.

### Removed
- **`alias:build`** (2.1.2) — voir ci-dessus.

## [1.x] — 2026-05-22 → 2026-05-29 (résumé)

> Détail par version (jusqu'à la 1.9.0, baseline du fichier) : `git log 38a405b..ba3e0ba -- plugins/aidd-overlay`.

Constitution du socle projet-agnostique. À la clôture du cycle, les skills en place sont : `alias`, `harvest`, `reconcile-normative`, `taste`, `foresee`, `dig`, `web-optimize`, `data-optimize`, `readme`, `changelog`, `decompose`, `journey`, `status`.

### Added
- **`status`** + **`alias:previously`** (1.6.0) — santé projet et reprise de contexte.
- **`alias:smarten`** (1.7.0), puis corrections des actions 05/06 et de sa règle (1.7.1).
- **`alias:skillconf`** (1.8.0) — audit et classification des skills, mise à jour des `skillOverrides` du projet pour réduire la troncature de contexte.
- **`taste` v2, `foresee` v2, `harvest` phase 5b** (1.x) — premières refontes des skills de mémoire et de prospective.

### Changed
- **`alias:afterplan` renommé `afterdev`** (1.8.0) — évitait la confusion avec la phase de plan.
- **`solo-mc` déplacé vers le plugin `obsidian`** (1.9.0) — regroupement de la suite JDR solo ; skill inchangé.
