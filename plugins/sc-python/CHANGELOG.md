# Changelog — sc-python

## [0.8.2] — 2026-09-16

### Changed

- `cd automata` délègue son enveloppe de livraison à `overcode:deploy`.

## [0.8.1] — 2026-08-28

### Fixed

- `sc-python:audit` délègue à `aidd-dev:04-audit` avec le pilier `code-quality` et conserve le rapport AIDD comme artefact autoritatif ; le README reflète ce contrat.

## [0.8.0] — 2026-08-28

- CD v2 multi-cibles, migrations séparées des données/médias et topologie fédérée Railway plus Alwaysdata.

## [0.7.0] — 2026-08-28

### Added

- Skill `cd` pour Django, FastAPI, Flask et workers, qui conserve uv, Poetry, Pipenv ou la procédure d'environnement existante.
- Livraison SQL séparant artefact, migration et données, puis enveloppe CI/PaaS déléguée à `web-tiers`.

> Baseline établie le 2026-05-29 à partir de l'état courant ; transitions récentes reprises de l'historique git. Détail antérieur : `git log -- plugins/sc-python`.

## [0.6.3] — 2026-08-05

### Fixed — le corps illustré de `Case A` se lisait comme la liste à reproduire (S8, rouge au run 3)

`sniff/02-install-pivots` posait sa clause de sortie sur le seul **en-tête** — *Pick the header by what actually happened* — et ne disait rien du corps. Le bloc *Case B* voisin, lui, porte `Use this header verbatim`. Le fichier posait donc une norme de copie littérale sur un bloc et **aucune contre-instruction sur l'autre** : un lecteur qui reproduit *Case A* énumère les cibles des tables au lieu de celles qu'il a écrites. C'est le contrôle négatif **S8** de `plugins/web-tiers/skills/setup/evals/pivot-install-scenarios.md`, laissé délibérément non jugé en 0.3.0 et rendu **FAIL** au run 3 sur les quatre installeurs `sniff`.

- **Marqueur d'exemple** sous chaque famille du bloc : `… one line per target actually processed`.
- **Contre-instruction** au-dessus du bloc : les blocs sont des *formes, pas des contenus*, et seuls les pivots que le manifeste liste sont traités — un projet Django + ORM émet deux lignes, `perf-pivots-fastapi.md` et `data-pivots-sqlalchemy.md` n'apparaissent **pas même en `skipped`**.
- **Les `(skipped — not applicable)` sont retirés du corps illustré.** Ils contredisaient la règle d'installation du fichier lui-même, qui boucle *For each pivot in the manifeste* : un pivot absent du manifeste ne peut jamais ressortir en `skipped`. Ajouter le marqueur ne suffisait pas — ce que l'exemple **montrait** était faux.
- **Le fichier porte trois tables, pas deux** (`perf`, `data`, `protocol`), donc trois familles à ne pas recopier : c'est le seul des quatre plugins dont la sortie fautive pouvait annoncer un pivot `ap` jamais écrit.

## [0.6.2] — 2026-08-03

### Fixed — l'en-tête d'installation est dérivé de ce qui a été écrit

`sniff/02-install-pivots` n'avait qu'un bloc de sortie, en-tête `✅ pivots installed` compris. Un projet Python sans framework web ni ORM — une CLI, une bibliothèque, un script de données — recevait donc « pivots installed » alors qu'aucun fichier n'était écrit. La sortie se branche maintenant en trois cas : au moins un pivot écrit ou mis à jour · **rien à installer** (en-tête `✅ sc-python sniff — nothing to install`, verbatim) · tout déjà à jour. La clause est celle que `sc-js` portait déjà : *pick the header by what actually happened*.

### Changed — le pivot ActivityPub avait deux sources, il n'en a plus qu'une

Deux fichiers du plugin décrivaient la même stack et visaient la même cible `.claude/rules/07-quality/ap-pivots-django-activitypub.md` : `references/capabilities/ap/django-activitypub.md` et `references/capabilities/protocol/activitypub-django.md`. Deux sources pour une cible, c'est une installation dont le contenu dépend de quel fichier le lecteur a ouvert.

**`capabilities/protocol/activitypub-django.md` fait foi** ; l'autre est supprimé. Le choix n'est pas allé au plus long ni au plus récent : la lecture des deux corps montre que `protocol/` couvre la pagination de l'outbox (§3) et le circuit breaker avec `410 Gone` (§2), que `ap/` n'a pas. Ce que `ap/` avait en propre — le rate limiting `django-ratelimit` à **double clé, IP *et* domaine distant** — a été versé dans `protocol/` §1 avant le retrait, avec son snippet et sa commande de détection. Rien n'est perdu.

`sniff/SKILL.md` déclarait l'ancien chemin en source d'installation ; il pointe désormais le fichier qui fait foi. **Un intégrateur qui suivait le nom de la source doit le mettre à jour** — la cible installée dans le projet, elle, ne change pas de nom.

## [0.6.1] — 2026-07-30

### Changed — le pivot `testing` déclare le prérequis d'outillage de sa couverture

Mise en conformité avec la section `## Prerequisites` du contrat (`overcode` 4.2.0, DEC-009). Bloc **Prérequis** ajouté sous *Coverage command* : `pytest-cov` (et `coverage.py` seul pour la voie `manage.py test`), avec les commandes de constat — `python -m pytest --version` liste les plugins chargés, `python -c "import pytest_cov"` tranche. Le projet mesuré portait les deux paquets ; leur absence n'a pas été rejouée, et le fichier le dit à cet endroit plutôt que de laisser supposer une vérification qui n'a pas eu lieu.

## [0.6.0] — 2026-07-30

### Added — pivot `testing`, mesuré sur un projet Django réel

`skills/sniff/references/capabilities/tools/testing.md` — les dix champs du contrat de pivot d'`overcode:control`, dans le vocabulaire de la stack Python. Deuxième pivot `testing` du marketplace après celui de `sc-js`, et **pas une traduction du sien** : le contrat dit que chaque pivot écrit ce que sa propre stack rend lisible, et les deux divergent partout où pytest/coverage.py et Vitest/Playwright divergent.

Commandes et chiffres **relevés sur un projet Django réel** (Django 5.0, pytest 9.1.1, coverage.py 7.15, 80 fichiers de test, 1028 tests). Ce qui n'a pas pu être mesuré est signalé à l'endroit où il apparaît, plutôt que rendu au conditionnel partout.

Les cinq constats qui portent le fichier, tous vérifiés en exécution :

- **Deux runners qui ne collectent pas le même ensemble, et l'un peut n'en collecter aucun.** `manage.py test` ignore les fonctions de test au niveau module et les classes `Test*` ne dérivant pas de `TestCase` — le style pytest en entier. Sur la fixture : 280 fonctions, 218 classes nues, **0** `TestCase` ; `manage.py test` y collecterait **zéro test sur 1028**, sans erreur, en vert.
- **Le glob de test est une valeur de configuration, pas une convention.** `python_files` **remplace** le défaut de pytest au lieu de s'y ajouter — sur la fixture, `*_test.py`, l'un des deux défauts, n'est pas collecté. Le lire est la première opération ; le supposer est une erreur mesurée.
- **Le comptage par défaut est déjà filtré.** `addopts` s'applique à `--collect-only` aussi : la commande nue rend 1027 au lieu de 1028. La commande fournie neutralise le filtre (`-o addopts=''`) ou déclare le nombre comme filtré, et n'écrit rien dans le dépôt mesuré (`-p no:cacheprovider`, `--no-cov`).
- **Un rapport de couverture ment de deux façons, et aucune n'est visible dans le rapport.** `--cov=<package>` laisse `config/` hors du dénominateur — ni couvert, ni non couvert : absent. Et `omit` retire du code applicatif réel (deux fichiers de vues de 21 ko sur la fixture) pendant que leurs voisins restent. D'où la règle : le *Source glob* définit l'univers, le rapport ne fait que l'enrichir, et **un fichier du glob absent du rapport est non couvert, pas inexistant**. La gate est neutralisée (`--cov-fail-under=0`, vérifié : sortie 1 → 0, rapport écrit dans les deux cas) parce que lire un rapport n'est pas passer un gate.
- **Le test client Django n'ancre pas.** `django.test.Client`, le `client` de pytest-django et l'`APIClient` de DRF construisent la requête en mémoire et appellent le handler WSGI directement : l'observation reste **interne**, quel que soit le réalisme apparent de l'URL et du code de statut. C'est le champ le plus contre-intuitif du fichier, et celui dont dépend le classement d'une suite Django entière.

Deux bornes tenues par construction, conformément au contrat : les *Signaux de risque* ouvrent sur « **Ne classent jamais un tier** » et la *Frontière d'ancrage* sur « **Ne nomme aucun tier, et n'en dérive aucun** ». Le pivot fournit du savoir de stack ; l'arbitrage appartient au consommateur, et aucun champ ne nomme lequel.

- `README.md` § *Pivot de gouvernance `testing`* décrit le fichier et le tableau récapitulatif distingue ses trois modes de chargement.

### Impact mesuré sur le consommateur

Trois lignes d'éval d'`overcode:control` étaient N/A **faute de ce pivot** — `matrix` M15, `authority` S6, `domains` S3. Rejouées sur le même projet Django : M15 et S6 passent (`matrix` 17/18 → **18/18**, `authority` 12/17 → **13/17**), S3 reste N/A sur la moitié restante de sa cause — aucune fixture ne déclare de domaine — et le dit. Aucune ligne n'est plus N/A par absence de pivot.

## [0.5.4] — 2026-07-28

### Changed

- **Les titres `H1` des actions ne portent plus leur numéro** — `# Explain`, plus `# Action 01 — explain`. Le numéro vivait à trois endroits, il n'en occupe plus que deux : le nom de fichier et la table de `SKILL.md`, que le gate de cohérence du marketplace compare désormais. Changement transversal aux onze plugins, détaillé dans le journal du marketplace (3.4.0).

## [0.5.3] — 2026-07-27

### Fixed — discipline de sévérité (l'audit alimente des mutants)

Même correctif transversal que sc-css/sc-rust/sc-php. `legacy/01-scan`, `improve` sont read-only mais `legacy/02-migrate` mute in-place. Correction **inline**, conditionnée à une propriété **mesurée**. Les quatre classes A/B/C/E sont présentes ici.

- **(A) Verdict sur propriété supposée → mesurée.** La modernisation d'annotations (`Optional[X]`→`X | None` 3.10, `List[X]`→`list[X]` 3.9) était étiquetée « low risk, pure annotation change » **sans mesurer le plancher d'interpréteur**. Sur un projet `>=3.8`, l'annotation *évaluée* casse à l'import. Désormais conditionnée au plancher `requires-python` mesuré (ou `from __future__ import annotations`) ; plancher inconnu → ne plus supposer 3.9, marquer `warning` (`legacy/01-scan.md`, `improve/01-analyze.md`, `improve/02-plan.md`, `idioms.md`).
- **(B) Sévérité alimentant la mutation.** `02-migrate` écrit in-place ; la garde « simple identifiers » du `%→f-string` laissait passer `logger.info("%s", x)`. Ajout : les rewrites d'annotations attendent la couverture du plancher (`Skipped (interpreter floor not covered)`), le lazy logging n'est jamais converti (`legacy/02-migrate.md`).
- **(C) « Code mort » indécidable au scan statique.** Le pivot ActivityPub concluait « code mort critique » quand `grep` ne trouvait pas la view inbox dans un `urls.py` — aveugle au routage indirect Django/DRF (`include()`, `as_view()`, routers, dispatch dynamique). Remplacé par « câblage à confirmer manuellement — résoudre l'URL réelle », jamais un verdict (`sniff/references/capabilities/protocol/activitypub-django.md`).
- **(E) Le moteur d'analyse mal-juge les constructions qu'il recommande.** Le regex `print\s+[^(]` flaguait `print ("x")` (appel Py3 valide) → resserré pour exclure l'espace-avant-parenthèse et la réassignation. La conversion f-string était imposée au `logging` %-lazy (interpolation forcée + perte du template structuré) → exclusion des appels `logger.*`/`logging.*` sur toute la chaîne (`legacy/01-scan.md`, `02-migrate.md`, `idioms.md`, `improve/01-analyze.md`).

## [0.5.2] — 2026-05-29

### Fixed
- `references/protocol/activitypub-django.md` §2 Delivery : `acks_late=True` + `soft_time_limit`/`time_limit` sur `deliver_activity` (exemple concret) ; signature des activités sortantes Accept/Reject/Announce (grep de détection inclus)
- `references/protocol/activitypub-django.md` §3 Conformance : `id` absolu obligatoire sur toutes les activités sortantes
- `references/protocol/activitypub-django.md` §4b : nouvelle section cache de clé d'acteur — TTL 24h + invalidation sur `Update(Person)` reçu
- `references/capabilities/ap/ap-protocol-specs.md` : anti-patterns Accept/Reject non signés (ignorés par Mastodon 4+, Misskey) et cache de clé sans TTL/invalidation
- `skills/ap-optimize/SKILL.md` Step 2 : chargement explicite des pivots perf/data supplémentaires après le pivot AP (comportement était implicite)

> Comble un gap de versions : `0.5.0`/`0.5.1`/`0.5.2` avaient été bumpés en plugin.json/marketplace.json sans entrée CHANGELOG correspondante. Reconstruit depuis `git log` (commits `db22060`, `63eb9ce`, `71d0d78`). Le commit `315a499` (2026-05-31, ajout de `references/capabilities/ap/django-activitypub.md`) n'a pas bumpé la version malgré un contenu nouveau — écart à surveiller, non corrigé ici pour ne pas réinventer une version qui n'a jamais été taguée.

## [0.5.1] — 2026-05-29

### Fixed
- `references/capabilities/ap/ap-protocol-specs.md` : anti-patterns livraison avant `transaction.on_commit`, inbox sécurisée non routée (view avec signature ≠ view dans `urls.py`), `coverage.omit` sur chemins AP critiques
- `references/protocol/activitypub-django.md` §0 Pre-flight : commandes de détection de code mort sur l'inbox (cross-check `urls.py` vs fichier contenant `verify_signature`), garde de couverture de test sur `inbox.py`/`signatures.py`/`tasks.py`

## [0.5.0] — 2026-05-29

### Added
- `references/capabilities/perf/httpx.md` — pivot perf httpx : AsyncClient singleton, timeouts, pool, retry `tenacity`, event hooks
- `references/capabilities/perf/drf.md` — pivot perf DRF : N+1 serializers, `select_related`, pagination cursor, JWT auth, throttling
- `references/capabilities/perf/celery.md` — pivot perf Celery : `time_limit`, `acks_late`, retry backoff, idempotence, queue routing, Flower
- `references/capabilities/data/datasets.md` — pivot data HuggingFace datasets : streaming, `map(batched=True)`, `cache_dir`, `select_columns`, `trust_remote_code`
- `references/capabilities/python/spacy.md` — capability pivot spaCy : chargement singleton avec `disable=`, `nlp.pipe()` par batch de langue, `PhraseMatcher`
- `references/capabilities/protocol/activitypub-django.md` — nouvelle catégorie protocol : inbox (signature + idempotence atomique + anti-replay), delivery (`on_commit` + circuit breaker), conformance AS2, SSRF allowlist, observability

### Changed
- `01-scan.md` : refonte de la spec sniff — optional-dependencies et groupes Poetry couverts, output template déplacé avant Process, tables markdown/ASCII interdites, readiness lines par sous-section, gap buckets A/B, détection ActivityPub (Step 3), nouvelle catégorie `protocol/` (Step 4), companions étendus (DRF, Celery, httpx, datasets, spaCy, AP)

## [0.4.9] — 2026-05-29

- Bump de synchronisation — marketplace aidd-overlay alignée sur 0.4.9 ; aucun changement fonctionnel.

## [0.4.8] — 2026-05-29

### Added
- `references/capabilities/perf/drf.md` — pivot perf DRF : N+1 dans les serializers, pagination cursor, `select_related` dans `get_queryset`, JWT vs SessionAuth, throttling, `cache_page` sur ViewSet
- `references/capabilities/perf/celery.md` — pivot perf Celery : `soft_time_limit`/`time_limit`, `acks_late`, retry backoff exponentiel, idempotence, queue routing par priorité, Flower

### Changed
- `01-scan.md` : détection `djangorestframework` → `perf-pivots-drf.md`, `celery` → `perf-pivots-celery.md`
- `01-scan.md` : companions DRF (`drf-spectacular`, `drf-extensions`, `djangorestframework-simplejwt`) et Celery (`django-celery-beat`, `kombu`, `celery[redis]`) ajoutés à la liste de filtrage
- `01-scan.md` : `Pillow` ajouté aux exemples de Bucket A
- `02-install-pivots.md` : entrées DRF et Celery ajoutées

## [0.4.7] — 2026-05-29

- Bump post-session (exécution de `sc-python:improve` sur un projet consommateur).

## [0.4.6] — 2026-05-29

### Added
- `references/capabilities/perf/httpx.md` — pivot perf httpx : AsyncClient singleton, `Limits`/`Timeout`, retry via `tenacity`, `asyncio.gather`, event hooks de logging
- `references/capabilities/data/datasets.md` — pivot data HuggingFace datasets : `streaming=True`, `.map(batched=True)`, `cache_dir`, `select_columns`, `trust_remote_code`
- `references/capabilities/python/spacy.md` — capability pivot spaCy : chargement singleton avec `disable=`, `nlp.pipe()` par batch de langue, `PhraseMatcher`, `EntityRuler`, extensions `Doc.set_extension`

### Changed
- `01-scan.md` : détection `httpx`, `datasets`, `spacy` ajoutée dans Step 4 ; companions mis à jour (`respx`, `huggingface_hub`, `tokenizers`, spaCy language models) ; Bucket A — `spacy`/`datasets` retirés (couverts), `transformers`/`playwright`/`Pillow` ajoutés
- `02-install-pivots.md` : entrées httpx et datasets ajoutées

## [0.4.5] — 2026-05-29

### Changed
- `01-scan.md` : Output template déplacé **avant** le Process (ancrage avant tout traitement)
- `01-scan.md` : `ALL TABLES ARE FORBIDDEN` — interdiction explicite des tables markdown (`| col |`) ET ASCII box-drawing (`┌───┐`)
- `01-scan.md` : noms de sections fixés — interdiction d'inventer des noms alternatifs ; deuxième exemple mis à jour (FastAPI + spaCy + datasets + httpx)

## [0.4.4] — 2026-05-29

### Changed
- `01-scan.md` : bloc DEPRECATED enrichi — nomme explicitement `Skills support:`, `Gaps (no plugin pivot):` et le format plat des pivots comme structures à ne pas reproduire

## [0.4.3] — 2026-05-29

### Changed
- `01-scan.md` Step 1 : ajout de `[project.optional-dependencies.*]` et `[tool.poetry.group.*.dependencies]` — détection via optional-deps spécifiée (plus d'improvisation modèle)
- `01-scan.md` : enforcement header output format (tables markdown interdites, sections obligatoires)
- `01-scan.md` : readiness lines par sous-section (`→ /skill : PRÊT`) remplacent la section `Skills support:` autonome
- `01-scan.md` : closing summary constraint ajouté
- `01-scan.md` : gap buckets A (capability candidates) et B (tooling/infra) avec filtrage des companion packages
- `01-scan.md` : exemple Flask gap ajouté dans le second template

## [0.4.2] — 2026-05-29 (baseline)

Knowledge provider Python (Django, FastAPI, Flask). Skills : `sniff`, `audit`, `improve`, `legacy`, `log-analysis`, `teach`.

### Added
- `improve` : Step 1.5 — chargement des capability pivots pour les anti-patterns spécifiques à la stack.

## [0.4.1]
- `legacy` : ajout de `references/` (patterns dépréciés / spécifiques à une version).

## [0.4.0]
- Alignement sur le modèle sc-php v0.4.0 : sniff à deux niveaux (pivot model), skill `audit` déléguant la revue, evals. Bump 0.3.0 → 0.4.0.

## Antérieur
- Voir `git log -- plugins/sc-python` pour l'historique complet.
