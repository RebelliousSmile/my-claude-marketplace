# Changelog — overcode

> Baseline établie le 2026-05-29 à partir de l'état courant ; transitions récentes reprises de l'historique git. Détail antérieur : `git log -- plugins/overcode plugins/aidd-overlay` (le plugin s'appelait `aidd-overlay` avant la 3.0.0).

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

## [3.0.0] — 2026-06-13

### Changed (BREAKING)
- **Renommage du plugin `aidd-overlay` → `overcode`.** Le préfixe d'invocation passe de `/aidd-overlay:<skill>` à `/overcode:<skill>` (motif : nom plus court à taper). La clé d'installation devient `overcode@my-marketplace`. Le dossier source est désormais `plugins/overcode/`. Aucun changement fonctionnel sur les skills.
- **Action requise après mise à jour** : réinstaller via `/plugin install overcode@my-marketplace` et mettre à jour toute référence locale (`settings.json` skillOverrides, `~/.claude/CLAUDE.md`, `~/.claude/rules/plugins-marketplace.md`).

## [2.2.0] — 2026-06-13

### Added
- **`alias:gitit`** — nouvelle action : transforme un dossier `R` (argument, défaut CWD) en dépôt git synchronisé et versionné en une commande : init local → dépôt distant **privé** via `gh` (créé seulement s'il n'existe pas) → commit → pull (gardé) → push → tag SemVer **si** un push a eu lieu. Idempotent. Dégradation propre si la création distante est bloquée (commit local préservé, étapes distantes sautées, rapport `⚠ blocked`). Privé par défaut, public uniquement sur `--public` explicite.

## [2.0.1] — 2026-05-29

- Bump de synchronisation — aucun changement fonctionnel ; version montée en miroir de `sc-python` 0.4.9 dans le marketplace.

## [2.0.0] — 2026-05-29

### New alias — `aiddlegacy`

Nettoie une installation AIDD antérieure à v4 dans le `.claude/` du projet courant.

Flux en 4 étapes :
1. **Scan** — construit le référentiel des handles v4 depuis `~/.claude/plugins/cache/aidd-framework/` (aidd-dev, aidd-refine, aidd-context) ; inventorie `agents/`, `commands/`, `skills/`, `rules/` du projet ; classe chaque artefact comme transféré (match handle v4) ou sans équivalent (aucun match).
2. **Rapport dry-run** — affiche l'inventaire complet (à supprimer / à conserver / rules par catégorie) sans rien modifier. Attend confirmation.
3. **Appliquer** — sur confirmation : supprime `agents/` en entier, les `commands/` et `skills/` transférés. Les éléments sans équivalent sont conservés.
4. **Arbitrage rules** — présente les rules groupées par catégorie v4, une par une ; pour chaque groupe : `garder tout / supprimer tout / arbitrer un par un`. Rapport final listant les éléments conservés (sans équivalent plugin) pour traitement manuel ultérieur.

Triggers : `aiddlegacy`, `aidd legacy`, `clean aidd legacy`, `migrate aidd v4`, `nettoyer l'ancienne installation aidd`, `legacy cleanup`.

## [1.9.0] — 2026-05-29 (baseline)

Socle commun, projet-agnostique. Skills : `alias`, `harvest`, `reconcile-normative`, `taste`, `foresee`, `dig`, `web-optimize`, `data-optimize`, `readme`, `changelog`, `decompose`, `journey`, `status`.

### Changed
- **`solo-mc` déplacé vers le plugin `obsidian`** (`/obsidian:solo-mc`) — regroupement de la suite JDR solo (pc, rpg, solo-mc) dans obsidian. Le skill lui-même est inchangé.

## [1.8.0]

### Added
- `solo-mc` — assistant maître de jeu JDR solo (routage des intentions du joueur). *(déplacé vers obsidian en 1.9.0)*
- `alias` : action `skillconf` — audit + classification des skills, mise à jour des `skillOverrides` (réduction de la troncature de contexte), ciblant `.claude/settings.json` du projet.

### Changed
- `alias` : `afterplan` renommé `afterdev` (évite la confusion avec la phase de plan).

## [1.7.0] – [1.7.1]
- `alias:smarten` ajouté, puis corrections (smarten 05/06, règle smarten).

## [1.6.0]
- `status` ajouté + `alias:previously`.

## Antérieur
- Voir `git log -- plugins/overcode plugins/aidd-overlay` pour l'historique complet (ancien nom : `aidd-overlay`).
