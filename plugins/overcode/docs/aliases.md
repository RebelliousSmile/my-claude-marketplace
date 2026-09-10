# Les alias

Un alias n'est pas une skill de plus : c'est un **prompt pré-écrit** qui enchaîne des skills existantes dans un ordre éprouvé. On l'appelle une fois, il tire la séquence complète.

L'intérêt est la reproductibilité. Une séquence retapée à la main dérive à chaque fois — celle-ci est figée dans un fichier versionné.

```
/overcode:alias <nom>
```

Le nom peut aussi être formulé en langage naturel : « clôture la tâche » atteint `endtask`, « où en est le projet » atteint `previously`. La table de correspondance est dans le `SKILL.md`.

## Table

| Alias | Ce qu'il enchaîne | Entrée |
|---|---|---|
| [`rechallenge`](#rechallenge) | plan → challenge, en boucle jusqu'à zéro objection | la tâche en cours |
| [`endtask`](#endtask) | commit → plan implémenté → learn → merge → changelog → tags → issue | la branche courante |
| [`bump-plugin`](#bump-plugin) | bump de version → commit → push marketplace | nom du plugin + version ou type de bump |
| [`previously`](#previously) | backlog optionnel → reprise de contexte documentaire (conversations, `aidd_docs/`, git) | profondeur optionnelle, `--backlog <fichier.md>`, puis `--milestone`/`--ml <titre>` et `--exclude-milestone`/`--em <titre>` (plusieurs possibles) |
| [`smarten`](#smarten) | réécriture minimale d'un fichier de prompt, sur place | un chemin `.md` |
| [`skillconf`](#skillconf) | classe les skills auto vs sur-invocation → écrit `skillOverrides` | *(rien)* |
| [`weeklyemail`](#weeklyemail) | commits de la semaine → e-mail client | `github` ou `gitlab` |
| [`gitit`](#gitit) | init → remote privé → commit → pull → push → tag | dossier cible (défaut : CWD) |
| [`mirror`](#mirror) | image deux navigateurs → diff → corrections via le contrat agent `design/agents/copycat.md` | une image |
| [`codex-vision`](#codex-vision) | audit critique et non mutant du code généré par un autre LLM | diff, branche, commit ou chemin |

---

## `rechallenge`

`/aidd-dev:01-plan` écrit le plan dans `aidd_docs/tasks/`, puis `/aidd-refine:02-challenge` l'attaque. Chaque objection — deal-breaker **et** suggestion — est corrigée directement dans le fichier, et le challenge est rejoué. La boucle s'arrête à **zéro deal-breaker et zéro suggestion**, sans confirmation intermédiaire.

Une vérification `ls` du fichier de plan est intercalée entre l'écriture et le challenge : sans elle, la boucle peut tourner sur un plan qui n'a jamais atteint le disque.

## `endtask`

La séquence de clôture complète : commit conventionnel → résolution du répertoire de feature dont `plan.md` porte `status: implemented` → extraction des apprentissages → merge et push → changelog → push des tags → fermeture de l'issue. Le plan moderne n'est ni renommé ni déplacé : son répertoire, ses phases et son statut constituent l'archive durable.

Le mode de branche est détecté, pas demandé : sur `main`, `master`, `develop` ou `staging`, il n'y a pas de branche de plan à merger et l'étape est sautée. Le numéro d'issue est résolu automatiquement ; si aucune source ne correspond, la fermeture d'issue est simplement ignorée.

## `bump-plugin`

Spécifique à cette marketplace. Localise la racine du dépôt (via `~/.claude/plugins/known_marketplaces.json`, sinon par recherche d'un `index.json` portant un tableau `plugins`), calcule le semver depuis un type de bump, met à jour les manifestes, vérifie, commit et pousse.

La version d'un plugin vit dans **deux** fichiers — `plugins/<nom>/.claude-plugin/plugin.json`, qui fait foi pour la version **et** la description, et `.claude-plugin/marketplace.json`, qui n'en est qu'une copie mais que Claude Code lit à l'installation. `index.json` ne porte que `{id, name}` : rien qui puisse dériver, donc rien à propager — l'alias n'y touche que pour enregistrer un plugin nouveau. Une étape de vérification s'exécute avant le commit — le gate de cohérence du dépôt s'il en fournit un, sinon une relecture des deux manifestes — et s'arrête plutôt que de livrer un bump partiel.

## `previously`

Reprise de contexte en début de session. Avec `--backlog <fichier.md>`, commence toujours par appeler `status backlog`, y compris lorsqu'un rapport récent existe ; `--milestone <titre>` et son raccourci strict `--ml <titre>` sont transmis à cette action, ainsi que `--exclude-milestone <titre>` et son raccourci `--em <titre>` (plusieurs exclusions possibles). Un échec de synchronisation arrête la routine avant le snapshot.

Reconstruit ensuite l'état du projet à partir de trois sources documentaires, jamais d'un build : les conversations précédentes (`~/.claude/history.jsonl` filtré sur le projet, titres de session et résumés de compaction des transcripts), ce qui a bougé dans `aidd_docs/` (statut des `plan.md`, phase en cours, `review.md`, banques touchées par `10-learn`, backlog, suivis autonomes) et l'état git (branche, log, arbre de travail). N'exécute jamais la suite de tests, le lint, une couverture ni `status report` ; chaque sonde a un budget de temps et se dégrade en `N/A` plutôt que de bloquer. La sortie mène par le point de reprise et peut diverger du code — les traitements suivants réalignent.

Syntaxe : `previously [<profondeur>] [--backlog <fichier.md>] [--milestone <titre> | --ml <titre>] [--exclude-milestone <titre> | --em <titre>]...`. La profondeur optionnelle reste un nombre de commits ou une durée du type `7d`, placée avant les options.

## `smarten`

Réécrit un fichier `.md` de prompt **sur place**, selon des critères fixes : suppression du remplissage, déduplication des contraintes, compression des étapes, listes à puces plutôt que prose, suppression du spéculatif.

Ce qui est explicitement **conservé** : les paragraphes narratifs porteurs de contexte nécessaire, les fallbacks documentés et les branches conditionnelles (`si X → faire Y`). L'alias abrège, il ne mutile pas la spécification.

Refuse tout ce qui n'est pas un `.md`.

## `skillconf`

Réduit le contexte passif consommé par les descriptions de skills. Chaque skill active est classée en auto-déclenchable ou sur-invocation-seule, puis `skillOverrides` est écrit dans le `.claude/settings.json` **du projet** — le fichier global n'est jamais touché.

La classification n'est pas heuristique : c'est un test d'appartenance à une **allowlist CORE** maintenue à la main (`assets/skillconf-core.json`). Aucune description n'est lue ni interprétée, ce qui rend l'action peu coûteuse à rejouer. Tout ce qui n'est pas dans la liste bascule en sur-invocation — la skill reste appelable par `/nom`, elle disparaît simplement du bloc passif.

## `weeklyemail`

Collecte les commits de la semaine sur tous les dépôts accessibles d'une plateforme (`github` ou `gitlab`), les synthétise par thème fonctionnel, et rédige un e-mail client prêt à envoyer.

Par défaut : les 7 derniers jours, l'utilisateur courant comme auteur. `since` accepte une date ISO ou un nombre de jours ; `author=all` inclut tout le monde.

## `gitit`

Transforme un dossier en dépôt git synchronisé en une commande : init local → remote GitHub via `gh` → commit → pull → push → tag SemVer si quelque chose a effectivement été poussé.

Deux garanties portées par l'action :

- **Le dépôt est privé par défaut, toujours.** Public uniquement sur `--public` explicite ; en cas d'ambiguïté, privé.
- **Chaque étape est idempotente** — précondition déjà satisfaite, étape sautée en silence. Si la création du remote est bloquée (scope `gh` manquant, politique SSO, absence de réseau), le commit local est préservé et seules pull/push/tag sont sautées.

## `mirror`

Reçoit une capture montrant deux navigateurs côte à côte — la référence et l'implémentation — identifie toutes les différences de texte et de style, puis les corrige. La référence est à gauche par défaut ; `--ref right` inverse. `--page <chemin>`, répétable, enchaîne plusieurs pages dans l'ordre fourni.

`mirror` ne rend pas le modèle plus intelligent : il apporte de la discipline de process et **délègue l'analyse de style à un sous-agent chargé avec `design/agents/copycat.md`**, qui repart d'un contexte neuf avec un prompt propriété-par-propriété. `copycat` n'est pas une skill publique. Ce gain a un coût réel en tokens et en latence.

| Situation | Choix |
|---|---|
| Une différence évidente (un titre, une couleur nommée) | prompt direct — `mirror` est du surcoût pur |
| Corrections précises déjà fournies | prompt direct soigné — équivalent |
| Analyse de style fine (fonds, puces, emphase, spacing) | **`mirror`** — la délégation à `copycat` est le vrai gain |
| Plusieurs pages à réconcilier | **`mirror --page`** — l'automatisation justifie le coût |

## `codex-vision`

Audite du code généré ou modifié par un autre LLM : défauts réels, simplifications trompeuses, régressions du contrat fonctionnel.

L'action est **non mutante vis-à-vis du code audité** — elle analyse et rapporte, elle ne corrige pas, ne reformate pas, ne commit pas, ne pousse pas. Les commandes de validation susceptibles d'écrire des artefacts ou des données persistantes sont écartées du périmètre.

Par défaut, la cible est l'ensemble des changements suivis et non suivis du working tree, comparés à `HEAD`. Fournir le contrat fonctionnel (issue, plan, critères d'acceptation) est optionnel mais change la qualité de l'audit : sans lui, l'action juge la cohérence interne du code ; avec lui, elle juge la conformité à ce qui était demandé.

## Voir aussi

- [`workflow.md`](workflow.md) — quelle skill pour quelle situation
- [`concepts.md`](concepts.md) — le modèle des pivots et les frontières entre skills
