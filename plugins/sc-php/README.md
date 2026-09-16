# sc-php

*Knowledge provider pour les stacks PHP (Laravel, Symfony, WordPress, HTMX) : détection de stack, audit, modernisation et enseignement par pivots.*

Détecte la stack du projet et charge à la demande les pivots de capacité applicables. Les pivots perf/data alimentent `web-optimize` / `data-optimize` (plugin `overcode`).

## Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `sniff` | `/sc-php:sniff` | Détecte la stack depuis `composer.json` et des sentinelles, installe/met à jour uniquement les règles pertinentes |
| `audit` | `/sc-php:audit` | Détecte la stack via sniff puis invoque `aidd-dev:04-audit` (`code-quality`) avec les pivots applicables ; le rapport AIDD reste autoritatif |
| `improve` | `/sc-php:improve` | Analyse le code PHP — opportunités de design patterns, idiomes du langage, plan d'amélioration |
| `legacy` | `/sc-php:legacy` | Scanne le code pour patterns dépréciés / spécifiques à une version, propose une migration |
| `log-analysis` | `/sc-php:log-analysis` | Analyse les logs PHP/Apache/Nginx (local, Docker, prod SSH) — tail, parse-errors, search, summarize |
| `teach` | `/sc-php:teach` | Enseigne PHP, patterns OOP et idiomes de framework |
| `bruno` | `/sc-php:bruno` | Tests API Bruno en CLI — itère jusqu'au vert (scripts, environnements, assertions) |
| `design-bridge` | `/sc-php:design-bridge` | Réceptacle du pivot design pour PHP/WP — linter natif PHP/WP + export de block patterns WordPress + lint du contenu stocké en base (règles `stored-content`), rendu au gate par un rapport de pivot ; possède le workflow de plateforme block theme / FSE |
| `builder-coverage` | `/sc-php:builder-coverage` | Gate de couverture WYSIWYG pour un thème bloc WordPress FSE — prouve par parcours exhaustif que chaque composant a une block pattern éditable, et que les patterns sont rangées par rôle de section |
| `cd` | `/sc-php:cd local\|server\|automata` | wp-env/Docker en local, façade de déploiement native du projet en production et enveloppe via `overcode:deploy`. WordPress sépare code, base, contenus et médias et adapte le transport aux capacités vérifiées de chaque cible. |

> `bruno`, `design-bridge` et `builder-coverage` sont spécifiques à PHP/WordPress et ne sont pas propagés aux autres plugins `sc-*`.

## Garanties FSE du design bridge

Trois preuves distinctes évitent un faux vert lorsqu'une classe DS est simplement posée sur un bloc core :

1. Le gate de **vocabulaire** vérifie que les classes et tokens du markup appartiennent au contrat. Il ne lit pas le rendu.
2. Le gate **stylesheet** vérifie statiquement que les feuilles composants et `fse-bindings.css` sont chargées et conformes. Il ne sait pas laquelle gagne.
3. Le gate de **propriété rendue** ouvre Chromium sur le front et dans le canvas éditeur, à chaque breakpoint. Pour chaque propriété déclarée, il exige que la règle gagnante provienne d'une feuille attendue et d'un sélecteur portant la classe DS.

Une valeur calculée identique ne compense donc pas un preset core, un style inline, un `!important`, une layer hôte ou un ordre de chargement gagnant. Sans session éditeur fournie par `WP_EDITOR_STORAGE_STATE` ou `WP_EDITOR_AUTH_HOOK`, cette surface reste `unrealized` et le verdict de fidélité reste `OPEN`. Les identifiants ne sont jamais écrits dans le config.

Le scaffold charge une entrée `assets/css/design/index.css` commune via `wp_enqueue_style()`,
`add_editor_style()` et `enqueue_block_assets` (chargement effectif dans le canvas iframe). Les patterns
auto-enregistrées sont des fichiers `patterns/*.php`, et toutes les commandes WP-CLI passent par
`pnpm wp` afin de conserver le garde-fou `COMPOSE_PROJECT_NAME`.

## CD multi-cibles

`sc-php:cd` garde une façade racine unique pour WordPress, Laravel ou Symfony. En staging, WordPress peut refléter base, contenu et uploads depuis le local après aperçu différentiel, sauvegarde et confirmation. En production, seuls code et migrations déclaratives sûres sont livrés ; base éditoriale, contenu et uploads restent autoritatifs sur chaque instance.

## Licence

MIT — voir [LICENSE](../../LICENSE).
