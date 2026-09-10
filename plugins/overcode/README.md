# overcode

*Socle commun de la marketplace : workflows projet-agnostiques qui étendent le framework [AIDD](https://github.com/ai-driven-dev/aidd-framework).*

Plugin principal, installé globalement (`recommended`). Il ne cible pas une stack : il ajoute des workflows transversaux de maintenance, d'analyse, d'ingestion documentaire et de planification, plus des chaînes d'alias pour enchaîner des skills AIDD.

Aucune skill ne code en dur la connaissance d'une stack ou d'un service : les audits chargent les **pivots** déposés par les plugins spécialisés (`sc-*` et `web-tiers`) sous `.claude/rules/07-quality/`. Sans pivot, un schéma générique s'applique — et la sortie rend une **quittance** qui sépare quatre états, une ligne par stack : chargé, aucun fournisseur, fournisseur non installé ici, réceptacle sans règle. Détail dans [`docs/concepts.md`](docs/concepts.md).

## Documentation

| Page | Contenu |
|---|---|
| [`docs/concepts.md`](docs/concepts.md) | Le modèle mental — le socle, les pivots, les frontières entre skills voisines, la densité de `control` |
| [`docs/workflow.md`](docs/workflow.md) | Quelle skill pour quelle situation — table de routage et détail par skill |
| [`docs/aliases.md`](docs/aliases.md) | Les dix chaînes d'alias, ce qu'elles enchaînent et leurs garanties |
| [`docs/control.md`](docs/control.md) | Le modèle de `control` — les quatre autorités, les phases, les domaines, le chaînage |

Le processus de chaque skill vit dans son `SKILL.md` et ses `actions/`.

## Skills

| Skill | Invocation | Description |
|---|---|---|
| `alias` | `/overcode:alias <nom>` | Enchaîne des workflows en une commande — dix chaînes pré-écrites |
| `harvest` | `/overcode:harvest [all\|tracker\|normative\|cleanup\|freshness\|review]` | Maintenance complète par défaut, ou pilier ciblé avec ses seuls prérequis |
| `reconcile-normative` | `/overcode:reconcile-normative` | Cohérence du normatif entre archives, mémoire et règles actives |
| `taste` | `/overcode:taste [cible]` | Vérifie la fraîcheur documentaire ou juge la sobriété d'une cible : ajouter le minimum, conserver, simplifier, fusionner ou retirer avec preuves AIDD et empreinte complète |
| `foresee` | `/overcode:foresee <cible>` | Route les analyses vers AIDD, synthétise jusqu'à trois scénarios de résilience et conserve l'horizon d'abandon, d'isolation et de migration des dépendances |
| `behave` | `/overcode:behave <action>` | Harness de tests comportementaux pour **prompts** — scaffold, run jugé, régression, review |
| `control` | `/overcode:control <action>` | Gouvernance de la suite de tests d'un projet, bornée par une **densité** lue contre la médiane du projet et pondérée par sa **phase** déclarée. **Ne se déclenche jamais seule.** |
| `dig` | `/overcode:dig` | Quiz interactif de cinq questions sur le code ou la mémoire du projet — difficulté adaptative, score sur 20 et rapport sourcé |
| `web-optimize` | `/overcode:web-optimize` | Audit perf web (LCP, CLS, INP, bundle, N+1 au rendu) → roadmap priorisée |
| `data-optimize` | `/overcode:data-optimize` | Audit perf de la couche données (N+1, index, pagination, cache, quota) |
| `seo-optimize` | `/overcode:seo-optimize` | Audit SEO et GEO → roadmap priorisée + copy prêt à coller |
| `ap-optimize` | `/overcode:ap-optimize` | Audit d'une implémentation ActivityPub (inbox, outbox, signatures, fan-out, AS2) |
| `readme` | `/overcode:readme` | Rédige ou met à jour un README.md (`write` depuis zéro, `update` par section) |
| `changelog` | `/overcode:changelog` | Génère le CHANGELOG depuis git (Keep a Changelog) ; `curate` comble et condense l'historique |
| `decompose` | `/overcode:decompose` | Décompose un objectif en graphe de dépendances (méthode Mikado) |
| `journey` | `/overcode:journey` | Exécute un parcours utilisateur depuis une issue GitHub/GitLab (Playwright) |
| `status` | `/overcode:status <action>` | État durable du projet — mémoire, rapport, audit et synchronisation d'un backlog Markdown depuis les issues GitHub/GitLab, avec filtre et regroupement milestone |
| `baby` | `/overcode:baby` | Explique, réécrit ou compare un sujet en langage simple, sans jargon non défini |
| `research` | `/overcode:research` | Recherche documentaire cross-référencée et extraction de terminologie |
| `extract-pdf` | `/overcode:extract-pdf <action>` | Extraction multi-session de gros PDF vers des sources Markdown brutes sous `sources/`, sans synthèse aval implicite |

### Harvest par pilier

`/overcode:harvest` et `/overcode:harvest all` exécutent les cinq piliers dans l'ordre sûr historique. Un seul pilier peut être ciblé : `tracker`, `normative`, `cleanup`, `freshness` ou `review`. Les paramètres existants restent composables, par exemple `/overcode:harvest cleanup plan_stale_days=30`.

Une exécution ciblée charge uniquement son action et ses dépendances indispensables. `cleanup` réconcilie d'abord le tracker puis le normatif ; `review` consulte le tracker en lecture seule ; `freshness` ne charge ni cycle de vie ni tracker. La réponse développe le pilier demandé et résume brièvement les prérequis. Seul le mode `all` écrit le rapport Harvest global ; toutes les confirmations de clôture et de suppression restent obligatoires.

Chaînes d'alias fournies : `rechallenge`, `endtask`, `bump-plugin`, `previously`, `smarten`, `skillconf`, `weeklyemail`, `gitit`, `mirror`, `codex-vision` — détail dans [`docs/aliases.md`](docs/aliases.md). `mirror` charge le contrat feuille `design/agents/copycat.md` dans un sous-agent natif ; il n'appelle aucune skill `design:copycat`.

## Licence

MIT — voir [LICENSE](../../LICENSE).
