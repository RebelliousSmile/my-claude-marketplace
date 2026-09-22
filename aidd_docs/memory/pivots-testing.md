# Pivots — qui fournit, qui ne fournit pas, et pourquoi

> Deux campagnes sur le même objet. La première (#10) porte sur le champ `testing` du contrat de pivot, consommé par `overcode:control` — c'est tout ce qui suit jusqu'à la section *Le piège de mesure*. La seconde (#11, 2026-08-03) porte sur les pivots installés sous `.claude/rules/07-quality/` et sur ce que leurs consommateurs en disent — dernière section.

Le champ `testing` est consommé par `overcode:control`, découvert par glob `**/capabilities/**/testing.md` sous la racine du plugin de langage actif. Contrat : `plugins/overcode/skills/control/references/pivot-contract.md`.

## État des fournisseurs — 4 sur 6, et c'est un état stable

| Plugin | Pivot | Motif |
|---|---|---|
| `sc-js` | ✅ | premier livré, complété de *Domain resolution* |
| `sc-python` | ✅ | mesuré sur un projet Django réel |
| `sc-rust` | ✅ | mesuré sur un crate binaire Win32 |
| `sc-php` | ✅ | mesuré sur **trois** terrains — PrestaShop modulaire + WordPress |
| `sc-css` | ❌ **décision, pas oubli** | décompte 2026-07-30 : 1 champ sur 10, **0 des 5 requis**. Aucun outil n'exécute du CSS ; la régression visuelle est un test de *page*, outillée par la stack JS. Les 2 champs qui semblaient répondre sont déjà fournis, plus finement, par `sc-css:audit#01-audit.md` et `sniff#01-scan.md`. **Ne pas rouvrir sans nouvel outillage CSS réel.** |
| `sc-godot` | ❌ | squelette, et surtout **aucun projet Godot mesurable** sur le poste |

## La règle qui a coûté le plus cher à établir

**Un pivot est un fournisseur de savoir de stack, jamais un décideur** — aucun champ ne nomme son consommateur, ni ne raffine l'exigence de preuve, seulement sa position (DEC-007).

**Le pivot suit le fichier** (DEC-008) : sur un dépôt polyglotte, la détection rend un *ensemble* de plugins, les énumérations sont des **unions**, rien n'est sommé entre stacks, et l'absence se déclare par stack. Corollaire opérationnel : livrer un pivot pour une stack sans population de tests fait entrer ses fichiers dans l'univers source d'un run dont la contribution de tests est vide — le run rend un zéro qui n'est le défaut de personne. **L'absence déclarée vaut mieux qu'un pivot creux.**

**Deux suppositions tacites rendues explicites** (DEC-009) : source et test **ne sont pas garanties disjointes** (Rust met ses tests dans le fichier source) ; et **un prérequis constaté absent vaut champ absent pour ce run**, pour tout champ dont la réponse est une commande.

## Méthode de rédaction, éprouvée sur quatre pivots

- **Mesurer, jamais déduire.** Chaque commande du pivot est exécutée sur un projet réel, en **lecture seule** : caches redirigés hors dépôt (`CARGO_TARGET_DIR`, `--cache-directory`), `git status --porcelain` comparé octet pour octet avant/après. Sur une fixture non propre à HEAD, on **compare** au lieu d'exiger le vide.
- **Un terrain ne suffit pas toujours.** `sc-php` a demandé trois terrains parce que la stack couvre deux mondes sans intersection. Le terrain nommé par le plan peut être disqualifié à l'ouverture — celui de `sc-php` n'avait aucune infrastructure de test PHP.
- **Écrire ce que la mesure contredit.** Les constats de valeur sont ceux qui démentent le conseil courant : couverture PHP sans driver qui **sort 0 sans écrire de fichier**, `phpdbg -qrr` mort en PHPUnit 10, `vendor/bin/phpunit` présent mais inexécutable.
- **Langue du plugin, titres verbatim du contrat, frontmatter vide** — un `paths:` ferait charger le pivot à chaque édition de fichier de la stack, or il ne décrit pas une famille de fichiers mais une suite.
- Les 4 pivots sont **strictement homogènes** : même chemin, mêmes 10 titres, même ordre. Le contrat n'impose pas d'ordre ; l'homogénéité est une convention à tenir à la main.

## Le piège de mesure qui s'est répété

**La stack PHP n'a pas de point d'entrée unique** : neuf modules, neuf dépôts, neuf `vendor/`, aucune commande racine. Une mesure lancée à la racine rend *zéro test* sur un projet qui en porte 225. Avant de conclure « pas de tests », vérifier quelle est l'**unité de mesure** de la stack — dépôt, composant, ou espace de travail.

---

# Pivots `07-quality` — la quittance (#11, 2026-08-03)

Objet : les fichiers `<famille>-pivots-<stack>.md` que les `sc-*` déposent dans `.claude/rules/07-quality/`, et ce que les quatre `*-optimize` d'`overcode` disent de leur chargement. ADR : `aidd_docs/internal/decisions/010-pivot-consumer-receipt.md`.

## La quittance : rendre compte de ce qu'on n'a pas chargé

**Un repli n'est pas un défaut ; un repli silencieux en est un.** Une skill qui charge un pivot quand il est là et son schéma générique sinon rend deux rapports indiscernables pour deux situations opposées. La règle générale, valable au-delà de ces skills : **toute skill à chargement conditionnel rend une quittance** — d'où vient ce qu'elle a chargé, et pourquoi le reste ne l'a pas été.

**Quatre états, pas deux.** `installed` · `not installed` (un plugin le fournit, ce projet ne l'a pas) · `no provider` (aucun plugin de la marketplace n'écrit ce nom) · `empty receptacle` (la famille est une interface publique que personne ne remplit). Les trois derniers appellent trois suites incompatibles — installer ici, générer, n'attendre personne. Un binaire présent/absent les confond et fabrique une recommandation qui ne mène nulle part.

**Deux lectures qui ne se déduisent pas.** La quittance se lit **par stack**, jamais par dépôt (DEC-008 s'applique tel quel). Et « vide » se lit **sur les règles**, pas sur les fichiers : un réceptacle contenant un `.gitkeep` est vide.

**`no provider` exige une table statique.** Une skill qui tourne dans un projet ne voit pas les autres plugins de la marketplace : elle ne peut rien dériver à l'exécution. `plugins/overcode/references/pivot-providers.md` porte `<stack> → <plugin>, <commande>`, citée par les quatre skills, recopiée par aucune. **La commande est portée par plugin, jamais par famille** — `overcode` s'installe par `setup`, les quatre `sc-<langage>` par `sniff` ; un gabarit uniforme remplace un remède faux par un autre.

## Une déclaration d'installeur est une affirmation vérifiable

Neuf cibles `.claude/rules/` étaient déclarées sans aucun fichier source derrière — trois chez `overcode`, six chez `sc-css` — depuis des mois. Ce qui manquait n'était pas la vigilance mais **la garde**. Deux ont été ajoutées à `tools/eval/consistency.mjs` :

- **M4** — toute ligne d'action citant une cible `.claude/rules/` voit **toutes** ses sources résoudre sur disque. Trois choix de conception qui se paient si on les rate : ancrage sur la **forme** de la ligne et jamais sur l'intitulé de colonne (il varie d'un plugin à l'autre) · **deux** bases de résolution (`${CLAUDE_PLUGIN_ROOT}/x` → racine du plugin ; relatif → racine du skill) · formulée **par ligne**, parce qu'une action de `sc-python` met source et cible dans la même cellule.
- **M5** — chaque ligne de `pivot-providers.md` joint une paire (plugin, cible) que M4 a validée. Formulée ainsi, elle est **indépendante de l'ordre des parts** ; la formulation abandonnée (« désigne un fichier réellement produit ») rendait son verdict dépendant de ce qui avait déjà été corrigé.

**Le remède au fantôme est le retrait de la déclaration, pas l'écriture du contenu.** Écrire les neuf pivots manquants est une décision produit ; retirer la promesse corrige l'écart sans rien fabriquer. Corollaire pour un consommateur : la stack bascule de `not installed` à `no provider`, ce qui est vrai.

**Un doublon de source pour une même cible se tranche en lisant les corps.** Deux fichiers de `sc-python` visaient `ap-pivots-django-activitypub.md`. Un grep lexical plaidait pour l'un ; la lecture a montré que l'autre couvrait deux sections entières que le premier n'a pas. Le delta du perdant se **verse** dans le gagnant avant retrait — sinon le doublon se résout par une perte.

## Ce que le rejeu behave a appris (à ajouter à [`behave-eval-method`](behave-eval-method.md))

**Une suite tout-verte a changé de fonction.** Run 1 : 1 PASS / 16 FAIL / 1 N/A sur les deux suites. Run 2 sur le code corrigé : plus aucun rouge dans une famille de défauts entière — donc plus de **contrôle négatif**. Le contrôle positif seul n'établit plus qu'un cas fautif serait détecté. La suite est devenue une suite de **non-régression** là où elle était une suite de **reproduction** ; c'est structurel, pas réparable en éditant une ligne.

**Une colonne qui annonce ses verdicts périme à la correction.** *Instruction pinned* était biaisante au run 1 ; elle est **activement trompeuse** au run 2 — un juge qui la recopie rend six FAIL faux. Une suite qui écrit ses attentes doit prévoir où elles vont quand elles cessent d'être vraies.

**Une précondition peut mourir sans que son critère meure.** Une ligne décrivant « quatre pivots déclarés, trois absents » ne décrit plus rien après le retrait — mais son critère (« le compte n'est pas figé ») reste jugeable. Distinguer *situation* et *critère* est ce qui permet de rejouer.

**Un `FAIL → N/A` peut être l'issue nominale**, à condition d'être écrit d'avance : la ligne dont la cible est supprimée par la correction atteste la suppression. Écrit après coup, il est indiscernable d'une dette.

---

# La détection, la fixture, et le run qui doit laisser des rouges (#13, 2026-08-03)

Objet : ce que la clôture de #11 avait laissé derrière elle. Plan archivé : `aidd_docs/tasks/2026_08/2026_08_03-13-detection-rust-fixture-s7-run-3.md`.

## Une ligne peut être verte par la mauvaise route

`web-optimize` rendait `no provider` sur un crate Rust — la bonne valeur. Elle y arrivait par le fourre-tout `other`, faute de savoir reconnaître Rust. **La valeur et la route sont deux binaires indépendants**, et un critère qui ne mesure que le premier certifie un comportement qui deviendra faux sans que rien ne bouge dans la ligne : le jour où `sc-rust` livre un second pivot `perf`, `other` continue de rendre `no provider` et se met à mentir. Règle à emporter : quand deux chemins mènent à la même sortie et qu'un seul reste vrai sous évolution, **le critère nomme le chemin**.

## Le défaut peut être en amont de ce que la suite mesure

Deux lignes sur douze étaient rouges non pas parce que la quittance était fausse, mais parce que **la stack ne devenait jamais applicable** : ni `web-optimize` ni `data-optimize` ne mentionnait `Cargo.toml` comme signal de stack, alors que `pivot-providers.md` déclarait quatre pivots Rust. Une paire jamais construite ne peut pas être bien rendue. Avant de corriger une sortie, vérifier que l'entrée existe.

**La borne de recherche fait partie de l'instruction.** Aucun des cinq `Cargo.toml` du parc n'est à la racine (profondeurs 1 à 3), et le `[workspace]` de la fixture monorepo est à `engine/`, sans manifeste racine. Écrire « cherche `Cargo.toml` » sans dire jusqu'où, c'est laisser la ligne rouge sous une phrase neuve. La borne a été **simulée à la main contre les chemins réels** avant d'être écrite, jamais déduite.

## Provisionner une fixture n'est pas muter un run

Un barreau du modèle de provenance (`template`) n'était exercé par aucune fixture : la ligne restait `N/A` — **dette de fixture, pas de skill**, et les deux se ressemblent dans un tableau de résultats. Poser le fichier se fait **délibérément, hors de tout run**, et se déclare dans la suite. Trois précautions qui se paient si on les rate : **copier, jamais déplacer** (retirer le fichier de son emplacement d'origine aurait muté la fixture sur laquelle une autre ligne est mesurée) · ne pas toucher au réceptacle, qu'une ligne voisine mesure sur le même dépôt · **élargir le critère dans le même lot que la pose**, sinon la ligne devient jugeable *et fausse* — ici, deux lignes lisaient deux axes orthogonaux de la même sortie et leurs valeurs attendues se contredisaient.

## Un contrôle négatif se ferme, il ne se garde pas par confort

Le lot a été livré avec **deux rouges intacts**, et c'était le résultat visé : `S12` (provenance) et `S8` (install), écrits et mesurés au cycle précédent mais jamais adjugés. Les corriger avant leur première notation aurait détruit ce qu'ils établissent. Le plan a donc écrit noir sur blanc, avant le run, qu'**un run rendant 0 FAIL aurait mal jugé** — c'est cette phrase, pas le résultat, qui empêche de lire un rouge comme un échec de livraison.

Résultat : provenance **11 PASS / 1 FAIL / 0 N/A** sur 12, install **6 PASS / 1 FAIL / 1 N/A** sur 8, deux juges en contexte neuf, auteurs ni des suites ni des correctifs.

## Ce que deux juges indépendants trouvent qu'on ne cherchait pas

**Le classement d'exposition dépend de l'axe qu'on mesure.** Un corps illustré à 75 % *se lit* comme exhaustif (on croit la liste complète) ; à 100 % il **l'est**, donc une copie littérale y est indiscernable d'une sortie dérivée — aucune ligne manquante ne la trahit. Les deux classements sont justes et se contredisent ; c'est l'axe qui tranche l'ordre des remèdes, pas le pourcentage.

**Sept pivots réellement écrits sont inatteignables depuis la carte de leur consommateur.** Mesuré en marge du run : `data-pivots-datasets.md` et `data-pivots-sqlalchemy.md` n'ont aucun slug dans la carte de `data-optimize` ; `perf-pivots-{celery,drf,fastapi,httpx,vite}.md` n'en ont aucun dans celle de `web-optimize`. Trois d'entre eux sont installés sur des fixtures **en ce moment**. La quittance qui en résulte est vraie du fichier et fausse de la stack : elle rend `installed` un pivot que la carte ne peut pas atteindre. C'est la cause racine du contrôle négatif de la provenance, et elle est **sept fois plus large que la ligne qui l'épingle** — ce qui est exactement ce qu'un juge en contexte neuf est là pour trouver.

**Un critère peut devenir non falsifiable par sa propre clause de délégation.** Une ligne qui exige une valeur tout en déléguant à une autre la question de la route n'est pas jugeable quand *l'apparition de la valeur dépend de la route*. Séparer deux défauts en deux lignes est bon ; le faire quand l'un détermine l'autre produit deux lignes dont aucune ne mesure.

**Le parc de fixtures n'est pas gelé.** Un `Cargo.toml` a bougé le jour du run, par un développement sans rapport. Une ancre `fichier:ligne` dans un bloc de préconditions n'est garantie qu'à l'instant où on la lit.

## Le défaut de harnais qui revient sous une autre colonne

La révision précédente avait retiré la colonne *Instruction pinned* pour que le juge ne lise plus la réponse. Le même défaut est reparu **deux colonnes plus à gauche** : une ligne de contrôle négatif récitait sa propre mesure et son verdict dans sa case *Pass criteria* — sur la seule ligne que le run devait adjuger indépendamment. Retirer une colonne ne clôt pas le défaut ; **c'est la règle « une mesure vit dans un appendice daté » qui le clôt**, et elle s'applique à toutes les colonnes.

**Un critère non cadré peut rendre le verdict inverse du bon.** « Le bloc porte un marqueur d'exemple » — un grep non borné de l'ellipse la trouve ailleurs dans le même fichier, où elle tient lieu de chemin. Le test naïf notait vert les quatre fichiers réellement rouges. Un critère falsifiable doit dire **où** chercher, pas seulement quoi.

**La règle « ne lis pas l'appendice avant de noter » est inapplicable tant que critères et registres cohabitent dans un fichier.** Le juge charge le fichier pour connaître les critères, donc il charge les verdicts passés. La correction est structurelle — scinder — pas une instruction plus ferme.

**Tous les verts d'une suite d'honnêteté s'obtiennent aussi par retrait.** « Toute source déclarée résout sur disque » se satisfait en publiant la source *ou* en supprimant la déclaration, et les correctifs ont choisi le retrait (12 → 9 cibles chez l'un, 6 → 0 chez l'autre). C'est légitime et voulu — mais un run ultérieur lira ces PASS comme un progrès de couverture si personne ne l'écrit.

---

# Les pivots orphelins, et la garde qui les tient (#14, 2026-08-05)

Objet : les sept pivots que #13 avait épinglés en marge de son run. Plan : `aidd_docs/tasks/2026_08/2026_08_04-14-pivots-orphelins-s8-garde-appariement.md`.

## Déclarer son consommateur et lui être inatteignable sont deux propriétés distinctes

`pivot-providers.md` fait dire à chaque ligne *qui* la consomme. Sept lignes nommaient un consommateur **dont aucun slug ne menait au pivot** : fichier écrit, installé, présent sur le disque du projet, jamais chargé. Rien ne casse — l'audit est simplement moins bon que ce que le projet a payé. Une table de correspondance atteste que la ligne existe ; elle n'atteste **jamais** qu'un chemin y mène. Ce sont deux gardes, pas une.

**Le corollaire mord la quittance elle-même** : elle rend `installed` un pivot que la carte ne peut pas atteindre. La quittance est vraie **du fichier** et fausse **de la stack** — et aucune de ses quatre valeurs ne sait dire ça.

## Une désynchronisation interne à un fichier se corrige par une garde, pas par une passe

Deux endroits d'un même dépôt doivent rester d'accord (la table et la carte de l'étape 2). Une relecture les met d'accord **le jour où on relit**. `tools/eval/pivot-map.mjs` les tient d'accord à chaque `pnpm test` : il extrait les slugs de chaque consommateur et rend en erreur tout pivot fourni qu'aucun slug n'atteint. C'est la même leçon que M4/M5 en #11, appliquée un cran plus loin : **là où #11 vérifiait qu'une déclaration résout, #14 vérifie qu'elle est atteinte.**

**La borne d'un parseur qui lit de la prose est un marqueur sémantique, jamais le blanc typographique.** Première version : collecte des slugs jusqu'à la première ligne vide. La prose des deux `SKILL.md` sépare ses lignes de slugs par des lignes vides — la ligne des couches additives n'était jamais vue et la garde rendait **trois faux orphelins après correction**. La borne est devenue le `⚠` de fin d'étape, calculé à l'intérieur de l'étape numérotée courante. Un parseur de prose se mesure contre le fichier réel, pas contre l'idée qu'on s'en fait.

**Trois fixtures, dont deux rouges.** `no-anchor` et `orphan` doivent rester en erreur, `valid` en succès : un parseur devenu muet rendrait vert sur les trois. Une garde sans fixture négative n'atteste que d'elle-même.

## Une couche additive n'est jamais la seule valeur d'un projet

`celery`, `httpx`, `vite` — et `drf` sur `django` — se **concatènent** à un slug de stack au lieu de le remplacer. Un run qui rend `celery` seul n'a pas trouvé une stack Celery : il a mal détecté la stack. Deux modes d'échec symétriques, à écrire tous les deux : la couche qui **avale** la stack, la couche qui est **perdue**. C'est un genre de slug que les cartes ne portaient pas, et qu'un simple ajout au tableau des correspondances aurait rendu ambigu.

**Un slug peut être un nom commun sans que sa stack le soit.** `datasets` est HuggingFace `datasets` — chemin de lecture colonnaire/Arrow, audité sur le chargement memory-mapped et la forme des lots, pas sur la planification de requêtes. Symétriquement, `alembic.ini` est l'outil de migration, pas la couche d'accès : il ne prouve pas SQLAlchemy à l'exécution. Un slug lexicalement ambigu se paie d'une ligne de test qui dit ce qu'il n'est pas.

## Le remède d'un défaut de forme n'est pas toujours un marqueur

S8 disait : le corps illustré de `Case A` se lit comme la liste à reproduire. Le remède évident est un marqueur d'élision. Il ne suffisait pas — les corps eux-mêmes portaient des `(skipped — not applicable)` que **la règle d'installation du fichier rend impossibles** (elle boucle *For each pivot in the manifeste*, donc un pivot hors manifeste ne peut jamais ressortir en `skipped`). Le fichier se contredisait lui-même sous le défaut nommé. **Quand on corrige la forme d'un exemple, relire ce que l'exemple affirme.**

Second constat sur les mêmes fichiers : la seule instruction de reproduction qu'ils portaient pointait dans le mauvais sens — `Use this header verbatim` en `Case B`, aucune contre-instruction en `Case A`. Une norme de copie littérale posée sur un bloc **se propage** au bloc voisin qui ne dit rien.

## Le piège du contrôle négatif : corriger le défaut qu'on s'apprête à mesurer

En fermant S8, j'ai ajouté aux quatre installeurs la branche « une source qui ne résout pas est rapportée manquante » — **précisément le défaut que S9 devait poser en rouge vivant**. La clause a été retirée des quatre fichiers, et l'épisode consigné dans le registre. *Une ligne écrite contre un défaut que son propre auteur vient de corriger mesure l'auteur, pas la cible.* Le plan portait la contrainte ; c'est de l'avoir relu, pas de l'avoir su, qui a rattrapé la faute.

**Le cycle d'une ligne de contrôle négatif est fixe** : écrite et mesurée avant le run N, **hors décompte** au run N, en décompte au run N+1. Toute autre chronologie rend un verdict qui ne vaut rien.

## La règle « ne lis pas l'appendice avant de noter » est confirmée inapplicable — deux fois le même jour

Les **deux** juges du run 4, indépendants et en contexte neuf, ont buté sur le même mur : un seul `Read` charge le fichier entier, donc les critères viennent avec les réponses. Les deux l'ont déclaré et ont reconstruit leurs verdicts depuis les sources primaires — atténuation, pas garantie. Deux occurrences le même jour sur deux suites différentes ferment le débat : **le remède est de scinder le fichier (critères / registres), pas d'écrire l'instruction plus fort.** Premier point de l'issue de harnais.

Résultat du cycle : garde **33/33 pivots atteints, 0 défaut** · install **7 PASS / 0 FAIL** en décompte (S9 hors décompte, mesurée FAIL 4/4) · provenance **11 PASS / 1 FAIL** sur 12.
