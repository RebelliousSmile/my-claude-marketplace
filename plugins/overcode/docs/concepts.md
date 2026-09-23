# Concepts

Ce qu'`overcode` est, et pourquoi il est construit ainsi. Pour savoir **quelle skill lancer quand**, va voir [`workflow.md`](workflow.md). Pour les chaînes d'alias, [`aliases.md`](aliases.md).

## Ce qu'est overcode

Un **socle transversal**, pas une stack. C'est le seul plugin de la marketplace marqué `recommended` : il s'installe globalement et s'applique à tous les projets, quel que soit leur langage.

Il étend le framework [AIDD](https://github.com/ai-driven-dev/aidd-framework) sur cinq axes, en déléguant à AIDD les audits génériques qu'il couvre désormais :

| Axe | Question à laquelle il répond |
|---|---|
| **Recherche** | quelles sources fiables documentent ce sujet, et où se contredisent-elles ? |
| **Maintenance** | l'état du projet enregistré correspond-il encore à ce qu'il est ? |
| **Analyse** | qu'est-ce qui va casser, mal vieillir, ou coûter cher plus tard ? |
| **Documentation** | ce qui est écrit dit-il encore la vérité ? |
| **Enchaînement** | comment jouer une séquence de skills sans la retaper à chaque fois ? |

## Le principe : agnostique par défaut, spécialisé par pivot

Aucune skill d'`overcode` ne code en dur la connaissance d'une stack. C'est le point d'architecture central du plugin, et il explique la forme de presque toutes les skills d'audit.

Une skill d'audit fonctionne en deux temps :

1. **Détecter** la stack depuis les manifestes du projet (`package.json`, `composer.json`, `pyproject.toml`, `Cargo.toml`, les lockfiles).
2. **Charger les pivots** — des fichiers de règles installés par les plugins spécialisés (`sc-*`) sous `.claude/rules/07-quality/`. Aucun pivot trouvé → un schéma générique s'applique.

### La quittance : ce que la sortie dit de ce qu'elle n'a pas chargé

Une skill qui consomme un pivot **rend, en sortie, ce qu'elle a chargé et ce qu'elle n'a pas pu charger**. Ce n'est pas une politesse : un audit générique et un audit spécialisé ont la même forme, et sans cette ligne rien ne distingue les quatre situations qui y mènent.

| État | Ce que le terrain porte | Ce que la sortie permet |
|---|---|---|
| `installed` | un pivot chargé pour cette stack | nommer le fichier et sa stack — la **provenance** |
| `no provider` | aucun plugin ne couvre cette stack | proposer d'en générer un ; il n'y a pas d'installeur à recommander |
| `not installed` | un plugin la couvre, rien n'est installé ici | nommer le plugin **et** sa commande |
| `empty receptacle` | le réceptacle existe, sans aucun fichier de règle | même remède, diagnostic distinct |

Deux précisions que le compte à quatre rend nécessaires. **« Vide » se lit sur les règles, pas sur les fichiers** : un `.gitkeep` ne peuple pas un réceptacle, une règle hors pivot le peuple. Et **la quittance est par stack** — une ligne par stack applicable, jamais une valeur unique pour le dépôt : le pivot suit le fichier, donc un dépôt polyglotte n'a pas d'état global.

Le rationnel complet est dans DEC-010 (`aidd_docs/internal/decisions/`, dépôt de la marketplace). La forme exacte de chaque ligne vit dans le `SKILL.md` de chaque skill.

| Skill | Pivots consommés | Qui les installe |
|---|---|---|
| `web-optimize` | `perf-pivots-*.md` | `sc-js`, `sc-php`, `sc-python`, `sc-rust` — via leur skill `sniff` |
| `data-optimize` | `data-pivots-*.md` | les quatre mêmes, plus `web-tiers` via `setup` pour les SaaS de données |
| `ap-optimize` | `ap-pivots-*.md` | `sc-python` seul |
| `seo-optimize` | `seo-pivots-*.md` | **personne** — le réceptacle est déclaré, aucun plugin ne le remplit |

La dernière ligne est l'état `no provider` à l'état pur, et elle est écrite plutôt que tue : le réceptacle `seo-pivots-*` est une interface publique sans réalisateur. Une skill qui le tairait laisserait croire à un oubli d'installation là où il n'y a rien à installer.

Le détail par stack — quel plugin couvre quelle stack, et sous quelle commande — vit dans `references/pivot-providers.md`, pas ici : cette page nomme le plugin par famille, ce fichier fait la correspondance par stack.

L'inversion de dépendance est délibérée : `overcode` ne connaît pas Laravel, Nuxt ni Firebase. Ce sont `sc-php`, `sc-js` qui **déposent** leur savoir dans le projet, et `overcode` qui le ramasse. Ajouter le support d'une stack ou d'un service ne demande donc jamais de toucher `overcode` — les plugins spécialisés évoluent à leur propre rythme.

Conséquence pratique : `/overcode:web-optimize` sur un projet Laravel sans `sc-php` installé produit un audit générique correct mais moins précis. L'installation du pivot est ce qui fait la différence entre « ton bundle est trop gros » et « ton `@vite` charge le manifest en dev à chaque requête ».

## Le partage de frontière entre skills voisines

Plusieurs skills se ressemblent de loin. Les frontières sont explicites, parce que c'est là qu'un mauvais routage coûte le plus.

**`web-optimize` vs `data-optimize`** — les deux détectent des N+1, mais pas les mêmes. `web-optimize` traite le N+1 *au rendu* (une page qui déclenche N requêtes pendant sa construction) ; `data-optimize` traite le N+1 *de la couche données* (des requêtes répétées sur la même collection ou table, indépendamment du rendu). Un même symptôme, deux couches, deux corrections.

**`behave` vs `control`** — `behave` teste des **prompts** : skills, agents, workflows pilotés par le langage. `control` gouverne les tests de **code** d'un projet. Un scénario `behave` juge un comportement de LLM ; `control` décide si un test unitaire mérite d'exister.

**`taste` vs `foresee`** — `taste` garde une seule autorité locale : la fraîcheur pondérée des affirmations Markdown contre le dépôt. Une cible code part vers `aidd-dev:04-audit` ou `aidd-dev:03-assert`. `foresee` route de même les documents et le code vers `shadow-areas`, `challenge` ou `audit`; sa valeur locale commence après l'audit `dependencies`, sur la continuité des mainteneurs, l'isolation et le coût de sortie.

**Contrat de délégation AIDD** — les deux routeurs résolvent une skill depuis le catalogue de l'hôte, vérifient la baseline compatible et rendent une quittance (`capability`, `delegated_to`, `pillar`, `artifact`, `local_follow_up`). Package absent, skill absente ou version trop ancienne arrêtent la branche concernée : aucun ancien détecteur local ne revient en fallback. Le contrat versionné vit dans `references/aidd-delegation.md`.

**`harvest` vs `reconcile-normative`** — `harvest` est un cycle de maintenance large (tracker, décisions, purge de l'éphémère). `reconcile-normative` ne traite qu'une question : le normatif est-il cohérent entre les archives, la mémoire et les règles actives.

**`research` vs `taste`** — `research` cherche et croise des sources externes pour construire de la connaissance documentaire. `taste` vérifie qu'un document existant correspond encore au codebase local. L'un produit des faits sourcés ; l'autre détecte l'obsolescence d'affirmations déjà écrites.

## La densité, pas le nombre — le modèle de `control`

`control` mérite un mot à part, parce que son modèle est contre-intuitif.

Il ne borne **pas** le nombre de tests par un plafond. Il raisonne en **densité** : le nombre de cas de test rapporté aux points de branchement, lu contre **la médiane du projet lui-même**. Un module trois fois plus dense que la médiane du projet est suspect ; le même module dans un autre projet ne le serait pas.

La densité n'est pondérée par rien : elle se lit contre la médiane du projet, point. Ce que gouverne la **phase**, c'est **ce qui entre dans l'analyse** — à condition qu'elle liste ce qu'elle en écarte —, quels critères pèsent lourd en ce moment, et dans quel ordre le résultat est restitué. Jamais ce qu'une donnée signifie : une absence du rapport de couverture vaut « non couvert » dans toutes les phases.

La phase est déclarée ou demandée, **jamais déduite** :

| Phase | Ce qu'on attend de la suite |
|---|---|
| `scaffolding` | peu de tests, sur les seuls invariants qui tiennent |
| `hardening` | montée en couverture ciblée sur le risque |
| `production` | régression protégée, coût de maintenance assumé |
| `sustaining` | un solde négatif est attendu — jamais exigé |
| `default` | neutralité choisie : aucun biais de classement, aucun lot de suppression |
| `undetermined` | la question a été posée, elle est restée sans réponse |

Le fait que la phase ne soit **jamais déduite** est un choix : un projet en `sustaining` ressemble beaucoup à un projet abandonné, et se tromper coûte soit des tests supprimés à tort, soit une suite qui gonfle sans fin.

Le modèle complet — les quatre autorités, les domaines sémantiques, le chaînage des actions — est dans [`control.md`](control.md).

`control` porte `disable-model-invocation: true` — il ne se déclenche jamais tout seul, uniquement sur `/overcode:control`. C'est cohérent avec son pouvoir : une skill qui peut recommander de supprimer des tests ne doit pas s'inviter dans une conversation.

## Ce qu'overcode délègue

Le plugin décide et cadre ; il n'écrit pas le code de production.

- `control` décide du tier d'un test, puis **délègue l'écriture** à `aidd-dev:06-test`.
- Les skills d'audit produisent une **roadmap priorisée**, pas un patch.
- `decompose` produit un **graphe de dépendances** (méthode Mikado, fichiers YAML sous `mikado/<graphName>/`), pas une implémentation.

C'est la même séparation que dans `design` : le plugin garde le *quoi*, l'exécution revient à qui sait faire le *comment*.

## Voir aussi

- [`workflow.md`](workflow.md) — quelle skill pour quelle situation
- [`aliases.md`](aliases.md) — les sept chaînes d'enchaînement
