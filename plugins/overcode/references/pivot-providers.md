# Fournisseurs de pivots — quelle stack, quel plugin, quelle commande

Table de correspondance `<stack> → <plugin>, <commande>`, partagée par les quatre skills `*-optimize`. Elles la **citent**, aucune ne la recopie.

À quoi elle sert : quand une skill constate qu'un pivot manque pour une stack détectée, elle doit nommer le remède — le plugin qui le fournit **et** la commande qui l'installe dans ce projet. Une skill qui tourne dans un projet ne voit pas les autres plugins de la marketplace : elle ne peut rien dériver à l'exécution. D'où cette table, statique et unique.

**Une stack absente de cette table se rend `no provider`** — jamais un nom deviné.

## La commande est portée par plugin, jamais par famille

| Plugin | Commande | Ce qu'elle fait |
|---|---|---|
| `sc-js` | `/sc-js:sniff` | flux par défaut `01-scan` → `02-install-pivots` |
| `sc-php` | `/sc-php:sniff` | idem |
| `sc-python` | `/sc-python:sniff` | idem |
| `sc-rust` | `/sc-rust:sniff` | idem |
| `overcode` | `/overcode:service` | action `install`, qui est l'invocation par défaut |

Autrement dit : les pivots de services tiers s'installent par `overcode:service install`, les quatre autres par `sniff 02-install-pivots`. La commande se lit ici, elle ne se dérive pas.

## `perf-pivots-*` — consommés par `web-optimize`

| Pivot | Plugin | Commande |
|---|---|---|
| `perf-pivots-alpine.md` | `sc-js` | `/sc-js:sniff` |
| `perf-pivots-axum.md` | `sc-rust` | `/sc-rust:sniff` |
| `perf-pivots-celery.md` | `sc-python` | `/sc-python:sniff` |
| `perf-pivots-django.md` | `sc-python` | `/sc-python:sniff` |
| `perf-pivots-drf.md` | `sc-python` | `/sc-python:sniff` |
| `perf-pivots-fastapi.md` | `sc-python` | `/sc-python:sniff` |
| `perf-pivots-htmx.md` | `sc-php` | `/sc-php:sniff` |
| `perf-pivots-httpx.md` | `sc-python` | `/sc-python:sniff` |
| `perf-pivots-laravel.md` | `sc-php` | `/sc-php:sniff` |
| `perf-pivots-nuxt.md` | `sc-js` | `/sc-js:sniff` |
| `perf-pivots-static.md` | `sc-js` | `/sc-js:sniff` |
| `perf-pivots-sveltekit.md` | `sc-js` | `/sc-js:sniff` |
| `perf-pivots-symfony.md` | `sc-php` | `/sc-php:sniff` |
| `perf-pivots-vanilla.md` | `sc-js` | `/sc-js:sniff` |
| `perf-pivots-vite.md` | `sc-js` | `/sc-js:sniff` |
| `perf-pivots-vue-spa.md` | `sc-js` | `/sc-js:sniff` |
| `perf-pivots-wordpress.md` | `sc-php` | `/sc-php:sniff` |

## `data-pivots-*` — consommés par `data-optimize`

| Pivot | Plugin | Commande |
|---|---|---|
| `data-pivots-datasets.md` | `sc-python` | `/sc-python:sniff` |
| `data-pivots-diesel.md` | `sc-rust` | `/sc-rust:sniff` |
| `data-pivots-django-orm.md` | `sc-python` | `/sc-python:sniff` |
| `data-pivots-doctrine.md` | `sc-php` | `/sc-php:sniff` |
| `data-pivots-drizzle.md` | `sc-js` | `/sc-js:sniff` |
| `data-pivots-eloquent.md` | `sc-php` | `/sc-php:sniff` |
| `data-pivots-firebase.md` | `overcode` | `/overcode:service` |
| `data-pivots-graphql.md` | `sc-js` | `/sc-js:sniff` |
| `data-pivots-mongoose.md` | `sc-js` | `/sc-js:sniff` |
| `data-pivots-prisma.md` | `sc-js` | `/sc-js:sniff` |
| `data-pivots-rusqlite.md` | `sc-rust` | `/sc-rust:sniff` |
| `data-pivots-sqlalchemy.md` | `sc-python` | `/sc-python:sniff` |
| `data-pivots-sqlx.md` | `sc-rust` | `/sc-rust:sniff` |
| `data-pivots-trpc.md` | `sc-js` | `/sc-js:sniff` |
| `data-pivots-typeorm.md` | `sc-js` | `/sc-js:sniff` |

## `ap-pivots-*` — consommés par `ap-optimize`

| Pivot | Plugin | Commande |
|---|---|---|
| `ap-pivots-django-activitypub.md` | `sc-python` | `/sc-python:sniff` |

**Un seul fournisseur.** `sc-php`, `sc-js` et `sc-rust` n'en produisent aucun — toute autre stack ActivityPub se rend `no provider`.

## `seo-pivots-*` — consommés par `seo-optimize`

**Aucun fournisseur.** Le réceptacle `.claude/rules/07-quality/seo-pivots-<sitetype>.md` est une interface publique que personne ne remplit : aucun plugin de la marketplace n'écrit ce nom. `seo-optimize` scanne le réceptacle — un fichier déposé à la main y est chargé et a la précédence — mais toute absence s'y rend `no provider`, jamais `not installed` : il n'y a aucun installeur à recommander.

## Règle de dérivation

Cette table dérive des tables *Target* des installeurs, sous deux bornes.

**Borne de forme.** N'entre que la cible de la forme `.claude/rules/07-quality/<famille>-pivots-<stack>.md`, `famille ∈ {perf, data, ap, seo}`. Un installeur peut écrire sous `.claude/rules/` sans produire de pivot — `overcode:service` déclare ainsi neuf cibles dont huit n'en sont pas (`03-firebase-resources.md`, `12-pagespeed-insights.md`, …). Un autre peut nommer ses fichiers sans chemin de destination ni famille : aucune de ses lignes ne satisfait alors la forme, et le plugin n'apparaît pas ici du tout.

**Borne d'état.** Une ligne n'entre que si sa **source résout sur disque**. Une cible déclarée sans fichier source derrière est hors table : elle promet un remède qui ne s'installerait pas.

Total : **33 lignes**, toutes distinctes — aucune stack n'est revendiquée par deux plugins, la correspondance est donc une fonction. Si une collision apparaissait, aucune garde de build ne la verrait : elles valident chaque ligne isolément, pas l'unicité de la clé.
