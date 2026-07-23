# Changelog — overcode

> Baseline établie le 2026-05-29 à partir de l'état courant ; transitions récentes reprises de l'historique git. Détail antérieur : `git log -- plugins/overcode plugins/aidd-overlay` (le plugin s'appelait `aidd-overlay` avant la 3.0.0).

## [3.7.0] — 2026-07-22

### Changed — `control`
- **La contrainte de nombre devient une densité, et cesse d'être un compte** (`references/test-density.md`, nouveau) — `densité(f) = cas de test exerçant f / max(1, points de branchement de f)`, lue contre la **médiane de la distribution propre au projet**. Ce n'est pas un critère ajouté à côté du plafond : il le **remplace** comme contrainte par défaut. Un plafond absolu répondait à la mauvaise question — il ne distingue pas une suite trop grosse d'une base de code grosse, exige la même chose d'un module de validation truffé de branches et d'un fichier de ré-exports, et dégénère en cible sous laquelle on se range. Une densité dit ce qu'un compte ne peut pas dire : **si l'effort porté sur un fichier est proportionné à ce qu'il y a à s'y tromper**. Un plafond explicitement déclaré par le projet l'emporte toujours, en tant que plafond — la stratégie déclarée d'un projet ne se fait pas écraser par une mesure — et la densité est alors rapportée à côté, parce qu'un plafond dit *combien* et une densité dit *si c'est au bon endroit*.
- **Le facteur d'alerte 3× est calibré, pas posé** — mesuré sur un projet réel (72 fichiers source, 24 portant un cas apparié, médiane 0,714) : à 2× l'alerte désigne 21 % des fichiers testés, à 4× elle ne désigne plus rien, **à 3× elle en désigne 8 %** — une minorité assez petite pour être examinée une par une, ce qui est la seule forme sous laquelle ce signal vaut d'être émis. Un signal qu'on apprend à ignorer est pire que pas de signal.
- **`05-stats` : la ligne `budget : null` cesse de signifier « aucune contrainte »** — elle est complétée par la médiane du projet, le décompte des aberrants avec leur lecture, et la **règle d'appariement** des cas aux fichiers source accompagnée du nombre de non-appariés. Un ratio bâti sur une convention de nommage porte le taux d'erreur de cette convention, et une approximation non déclarée est la façon dont un nombre acquiert une autorité qu'il n'a pas gagnée.

### Added — `control`
- **Double lecture d'un aberrant, avec sa discrimination mesurée** — un fichier dans le **décile haut des points de branchement** du projet signale que **le code** branche trop : candidat au refactoring, énoncé et laissé à l'utilisateur (cette skill ne propose aucun refactoring). Sinon, c'est le **numérateur** qui est gonflé : beaucoup de cas sur peu de logique, donc des tests sans pouvoir de détection — le sujet de `02-audit`, nommé comme tel et pas jugé davantage. Le décile est recalculé à chaque run sur la distribution du projet : un seuil de branchement en dur réintroduirait la constante inter-projets que toute cette référence sert à éviter.
- **L'angle mort de la mesure est écrit dans la référence, pas contourné** — la discrimination par les données n'apparaît pas au dénominateur : une regex à huit alternatives, une table de correspondance, un schéma, comptent pour **un** point de branchement et méritent légitimement plusieurs cas. La calibration l'a produit noir sur blanc : des deux aberrants à 3×, l'un asserte des littéraux un par un (vrai positif, aucun pouvoir de détection), l'autre valide des formats d'e-mail dont chaque cas exerce une alternative distincte que le dénominateur ne voit pas (faux positif, tests légitimes). D'où la borne : **un aberrant est un fichier à regarder, jamais un verdict rendu sur lui**. `02-audit` peut être pointé vers ce fichier, mais une ligne de son tableau exige toujours qu'une de ses trois heuristiques tienne, et un fichier examiné puis blanchi est rapporté comme examiné et blanchi.
- **Cinq cas dégénérés traités explicitement** — pas de rapport de couverture (le plus fréquent : aucun dénominateur, donc **rien n'est calculé**, ni approximé ni remplacé par un compte de lignes → `03-configure`), aucun test du tout, **population insuffisante** pour qu'une médiane soit défendable (état normal d'un projet `scaffolding`, rapporté comme fait sur la mesure et non comme constat sur la suite), fichier sans point de branchement, et exclusion des fichiers à zéro cas de la médiane — les inclure la tirerait à zéro et ferait de tout fichier testé un aberrant.
- **Borne d'autorité, symétrique de celle de la phase** — **la densité ne refuse jamais un test** : un refus est une décision de tier, et vient de la table de tiers en vigueur. Elle priorise et elle rapporte ; elle ne classe pas. Et elle n'est jamais une cible : aucune action ne propose un travail dont la seule justification serait de rapprocher une densité de la médiane — ce serait l'erreur du pourcentage de couverture sous un autre nombre. `01-write` décide le tier **avant** de calculer la densité, et son test de non-régression est exactement là : même comportement, une fois sur un fichier sous la médiane et une fois sur un aberrant déclaré, **tier identique**.
- **`06-align` propose une densité plutôt qu'un plafond** dans le bloc de stratégie, et la propose comme **la médiane mesurée du projet** — un nombre que le projet reconnaît, pas un nombre inventé par la skill. Un plafond est un nombre qu'un projet dépasse sans s'en rendre compte, et le jour où il le dépasse il ne reste qu'à le relever ou l'ignorer. Le projet peut toujours choisir un plafond — c'est sa décision — mais il doit le choisir face à l'alternative, donc les deux sont énoncées. Et quand l'audit a rencontré l'angle mort, il entre lui aussi dans ce bloc : c'est le seul endroit où le projet peut l'inscrire comme **son jugement** plutôt que comme une erreur de mesure, et c'est ce qui empêche le run suivant de re-signaler le même fichier.

## [3.6.0] — 2026-07-22

### Added — `control`
- **Solde net de bascule de phase** (`actions/06-align.md`) — quand la phase résolue diffère de celle **déclarée dans le document**, ou que l'utilisateur la surcharge, l'action rapporte le déplacement **d'un seul tenant** : ce que la phase sortante rend caduc, ce que la phase entrante réclame, l'effet résultant sur le compte total, et le mouvement énoncé en une phrase. La bascule est détectée **par comparaison, jamais supposée** — un document qui ne déclare rien ne bascule pas, il déclare pour la première fois. Le solde net est un **constat, jamais une cible** : aucune phase n'exige un solde négatif, `sustaining` l'attend sans l'imposer, et une suite qui sort d'une bascule plus grosse n'est pas un échec.
- **Motif de retrait « obsolescence de phase »** — un test dont **la seule** justification est un critère que la phase sortante relevait et que la phase entrante abaisse. Unique motif de suppression ajouté par cette version, et borné par **trois exclusions cumulatives** : il ne qualifie jamais un test tenu par la conséquence (argent, autorisation, persistance, suppression), par une dépendance à un contrat externe, ou par son statut de seul filet sur son sujet. Il fallait ce motif propre : les heuristiques de `02-audit` (doublon, trivial, getter) ne croisent jamais une bascule — un test de forme de modèle écrit en `scaffolding` n'en relève d'aucune — et s'y limiter aurait rendu le lot vide par construction. La phase continue de ne rien décider en matière de **tier** : elle qualifie un retrait, jamais un classement.
- **Lot de suppression caractérisé par son critère de sélection** — le consentement porte sur **une règle qu'on comprend**, pas sur un défilement qu'on ne lit pas : à l'échelle où le lot devient utile, plusieurs centaines de lignes ne sont pas plus lisibles qu'un compteur. Quatre éléments, tous requis : le **critère de sélection** en une phrase, le **décompte par motif de rejet**, un **échantillon représentatif** à l'écran, et le chemin d'un fichier portant la **liste exhaustive**, écrit **avant** que la question ne soit posée. Le **refus est en bloc, sans condition et sans repli** — surtout pas vers une confirmation par item, qui contournerait le refus un test à la fois. Exclus de tout lot : frontières externes, tests tenus par la conséquence, seuls filets, et tout test qu'**aucun des deux motifs** ne qualifie — appartenir au bassin que la phase abaisse n'est jamais en soi une raison de supprimer. Quand rien ne qualifie, l'action le dit : un lot vide est un résultat légitime, pas un lot creux à présenter.
- **Exception `sustaining`** — les frontières externes sont exclues de tout lot de suppression et restent l'unique motif d'ajout légitime dans cette phase. C'est celle où plus rien d'interne ne bouge pendant que les contrats externes, eux, continuent de bouger : leur retirer leur seul filet à cet instant précis serait le pire moment possible.

### Added — `alias:codex-vision`
- **Audit critique non mutant du code généré par un autre LLM** — reconstitue le contrat fonctionnel depuis les spécifications, tests, API publiques et baseline, compare les chaînes de comportement avant/après, puis classe chaque capacité comme préservée, régressée ou non démontrée. Les findings exigent un chemin déclenchable et une preuve ; un build vert ne suffit jamais à conclure à l'absence de perte fonctionnelle.

### Changed — `control`
- **La règle « aucune application par lot » devient une exception bornée deux fois** (`SKILL.md`) — la confirmation par item reste le régime de toute suppression, `02-audit` inclus et inchangé ; le lot caractérisé est autorisé dans **`06-align` seulement**, et **seulement à l'occasion d'une bascule de phase**. La justification est conservée dans la règle elle-même : un test généré se réécrit à faible coût, donc la suppression n'est plus l'acte irréversible que la confirmation par item protégeait ; ce qui reste à protéger, c'est de **savoir ce qu'on supprime**, et c'est le critère qui le dit, pas l'énumération. Borne d'échelle reprise de `04-strengthen` : au-delà du volume rendant l'analyse non significative, exiger une réduction de `scope` plutôt que dérouler.
- **`06-align` n'invente aucune des deux moitiés du mouvement** — le sortant vient des heuristiques de `02-audit`, l'entrant du classement de `04-strengthen` rejoué avec la nouvelle phase en force, et chaque ajout confirmé repasse par `01-write` **une ligne à la fois**, la contrainte de nombre étant réévaluée entre chaque. Hors bascule, l'action ne propose toujours aucun test, ne classe aucun manque et ne supprime rien.
- **Un `03-sync` muet n'est pas une preuve de synchronisation** — l'étape de resynchronisation du délégataire sort légitimement sans aucune sortie quand les fichiers de contexte IA listent déjà le document, ce qui est indiscernable d'un échec ayant avalé son erreur. `06-align` ne prend plus un code de retour propre pour une preuve : il ouvre le fichier de contexte, vérifie que le bloc mémoire nomme bien le document, et **rapporte laquelle des deux situations** s'est produite — resynchronisé, ou déjà à jour.

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
