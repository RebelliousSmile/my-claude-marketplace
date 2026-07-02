# sc-php

*Knowledge provider pour les stacks PHP (Laravel, Symfony, WordPress, HTMX) : détection de stack, audit, modernisation et enseignement par pivots.*

Détecte la stack du projet et charge à la demande les pivots de capacité applicables. Les pivots perf/data alimentent `web-optimize` / `data-optimize` (plugin `overcode`).

## Skills

| Skill | Déclencheur | Description |
|---|---|---|
| `sniff` | `/sc-php:sniff` | Détecte la stack depuis `composer.json` et des sentinelles, installe/met à jour uniquement les règles pertinentes |
| `audit` | `/sc-php:audit` | Auditeur qualité PHP — détecte la stack via sniff puis délègue la revue à `aidd-dev:reviewer` avec les pivots applicables |
| `improve` | `/sc-php:improve` | Analyse le code PHP — opportunités de design patterns, idiomes du langage, plan d'amélioration |
| `legacy` | `/sc-php:legacy` | Scanne le code pour patterns dépréciés / spécifiques à une version, propose une migration |
| `log-analysis` | `/sc-php:log-analysis` | Analyse les logs PHP/Apache/Nginx (local, Docker, prod SSH) — tail, parse-errors, search, summarize |
| `teach` | `/sc-php:teach` | Enseigne PHP, patterns OOP et idiomes de framework |
| `bruno` | `/sc-php:bruno` | Tests API Bruno en CLI — itère jusqu'au vert (scripts, environnements, assertions) |
| `design-bridge` | `/sc-php:design-bridge` | Réceptacle du pivot design pour PHP/WP — linter natif PHP/WP + export de block patterns WordPress |
| `builder-coverage` | `/sc-php:builder-coverage` | Gate de couverture WYSIWYG pour un thème bloc WordPress FSE — prouve par parcours exhaustif que chaque composant a une block pattern éditable, et que les patterns sont rangées par rôle de section |

> `bruno`, `design-bridge` et `builder-coverage` sont spécifiques à PHP/WordPress et ne sont pas propagés aux autres plugins `sc-*`.

## Licence

MIT — voir [LICENSE](../../LICENSE).
