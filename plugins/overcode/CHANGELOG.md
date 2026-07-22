# Changelog — overcode

> Baseline établie le 2026-05-29 à partir de l'état courant ; transitions récentes reprises de l'historique git. Détail antérieur : `git log -- plugins/overcode plugins/aidd-overlay` (le plugin s'appelait `aidd-overlay` avant la 3.0.0).

## [3.5.0] — 2026-07-22

### Added — `control`
- **Phase de projet** (`references/phase-framework.md`) — quatre valeurs sur un axe unique, l'exposition croissante puis la sédimentation : `scaffolding` (le modèle de domaine bouge encore), `hardening` (modèle figé, aucun utilisateur réel), `production` (des utilisateurs réels, des données non reconstituables), `sustaining` (plus de code neuf significatif). Chaque frontière est une question à réponse binaire. Toutes les actions résolvent la phase et la restituent avec sa provenance. **La phase priorise, elle ne classe jamais un tier** — même frontière que les *Risk signals* d'un pivot : un test se refuse sur un critère de tier, jamais « parce qu'on est en production ». « Développement » n'est délibérément pas une phase : le besoin qu'il décrit est le critère **churn**, déjà présent, dont la phase module le poids.
- **La phase n'est jamais déduite d'un dépôt.** Un dépôt porte des traces, il ne porte pas d'utilisateurs : un produit fini mais pas encore ouvert et le même produit servant des clients payants laissent exactement les mêmes traces — modèle figé, tags réguliers, déploiement câblé — alors que c'est précisément cette différence qui décide de ce que la suite doit protéger en premier. Trois sources, et trois seulement : **paramètre** `phase` de l'action, **déclaration** dans la documentation du projet, ou **question posée à l'utilisateur avant tout classement**. Les observations du dépôt ne servent qu'à nourrir la question. `undetermined` est une valeur de plein droit et signifie « question posée, sans réponse », jamais « déduction insuffisante ».
- **Sixième critère de risque : la dépendance à un contrat externe** (`04-strengthen`). Les cinq critères existants sont tous internes — churn, branches, blast radius, conséquence, absence d'autre filet — et aucun ne se déclenche quand c'est le fournisseur qui casse : une intégration Meta, GTM, Brevo, Klaviyo, un SDK de paiement ou un webhook sortant rompt sans qu'une ligne du dépôt ne bouge. Relevé en `production`, **dominant en `sustaining`**. Ce qu'un test prouve ici est écrit noir sur blanc : prouvable en process — la charge utile construite est bien celle qu'on croit envoyer, et le chemin dégradé se comporte correctement ; **non prouvable** — que le fournisseur accepte encore cette charge utile, renvoyé à la surveillance plutôt qu'à un test qui donnerait une fausse assurance. **Plafonné par frontière** : un test par défaut, un second seulement si la charge utile porte une donnée à conséquence vérifiable (montant, identifiant de commande, autorisation, consentement), aucun si l'échec ne se voit pas côté client. Sans ce plafond, dix intégrations produiraient vingt tests dans une skill qui existe pour borner le nombre.
- **Trois bassins comparés en ordre, jamais en part** — fondations / code récent / parcours critiques. La phase apporte un ordre de priorité attendu, pas un plafond ni un pourcentage : `05-stats` compare des rangs, et la classification d'un test existant dans un bassin est déclarée comme l'approximation qu'elle est.
- **Action `align` (06)** (`actions/06-align.md`) — audit de l'écart entre ce que le document de stratégie de test d'un projet **dit** et ce que le projet **fait**, puis proposition de sa mise à jour. Les écarts sont classés en trois natures : **fait absent**, **fait périmé**, **décision manquante** (aucune ligne ne tranche ce que la skill doit pourtant trancher à chaque exécution). L'audit s'adosse à la production de `05-stats` et n'en recalcule rien — deux sources de vérité pour une même mesure divergent, et celle qui diverge en silence est celle que personne ne joue. La proposition est faite en **deux blocs strictement séparés et approuvés indépendamment** : `MEASURED FACTS`, sous l'autorité de `control` parce qu'il en est la seule source (runner câblé, gate de couverture configurée *et invoquée* ou inerte, volume par tier, ordre observé des bassins, **inventaire des frontières externes** et lesquelles sont référencées par un test) ; `PROPOSED STRATEGY`, sous l'autorité du projet, rédigé en toutes lettres et validé ligne à ligne, jamais appliqué par défaut. Un document absent n'est **jamais créé d'office**. C'est l'action qui met fin au questionnement de la phase, en transformant une réponse valable une exécution en déclaration inscrite.

### Changed — `control`
- **La garantie « `control` n'écrit jamais le `testing.md` du projet » devient « il n'en décide jamais seul le contenu stratégique ».** Une garantie documentée ne se contredit pas en silence : elle est remplacée, et on dit par quoi. `06-align` est la seule exception, et sous ses propres termes — il inscrit ce qu'il a **mesuré** sous sa propre autorité, et *propose* une stratégie que l'utilisateur valide ligne à ligne avant qu'un mot n'atteigne le fichier.
- **Voie d'écriture déléguée** à la skill de mémoire projet d'`aidd-context`, qui possède `memory/`, porte sa propre porte d'approbation et resynchronise les fichiers de contexte IA — résolue **par son rôle, jamais par un numéro d'action figé**, les nommages ayant changé d'une majeure à l'autre. Repli en écriture directe, avec annonce explicite de la voie prise **et de ce que le repli ne fait pas**. **Règle de fidélité** : le délégataire analyse et reformule par contrat, donc le texte approuvé lui est remis comme **contenu littéral à inscrire**, le fichier écrit est relu et comparé, et tout écart est **rapporté sans jamais être corrigé d'office** — c'est le document d'un autre plugin.
- **`01-write`, `02-audit`, `04-strengthen`, `05-stats`** — chacune résout la phase et la restitue avec sa provenance (`argument` / `declared <chemin>` / `answered` / `undetermined`). `04-strengthen` repondère ses six critères par la phase et **pose la question avant de classer**, pas après : un tableau produit puis retrié est un tableau déjà lu dans le mauvais ordre. `05-stats` ajoute le bloc `PHASE`, la comparaison des ordres de bassins, et un flag qui renvoie vers `06-align` quand le document ne déclare pas la phase. Aucun tier ne change dans aucune des quatre.
- **`references/pivot-contract.md`** — le champ existant *Risk signals* porte désormais aussi les **frontières externes de la stack**, sans champ nouveau : `control` détient le critère, l'inventaire des SDK, tags et clients sortants d'une stack donnée est une connaissance de stack. Sans pivot, `control` se rabat sur le manifeste du projet et déclare l'inventaire générique.
- **`references/decision-framework.md` reste intact.** Non-changement assumé : la phase ne touche pas à l'autorité de la table de tiers.

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
