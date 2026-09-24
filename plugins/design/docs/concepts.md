# Concepts

Le modèle mental du plugin `design` : pourquoi il est construit comme ça, et ce que chaque pièce garantit. Pour savoir **quoi lancer**, va plutôt voir [`workflow.md`](workflow.md). Pour le détail normatif d'une règle, les fichiers autoritaires sont dans [`../references/`](../references/) — cette page y renvoie sans les recopier.

## Le problème

Un design system se documente d'ordinaire dans une charte en prose et un jeu de maquettes. Les deux dérivent : la charte dit une chose, les maquettes en montrent une autre, le code en fait une troisième. Personne ne ment — il n'y a simplement aucun arbitre.

Le parti pris du plugin tient en une phrase : **la seule référence opposable est celle qu'un outil sait lire**. Ni la charte, ni les maquettes. Des artefacts JSON, dont un linter dérive ses règles à chaque livraison. Tout le reste du design du plugin découle de là.

## L'entonnoir

**Cinq verbes** dans le pipeline, dans un ordre qui n'est pas arbitraire : la matière est **malléable** au début, **figée** au milieu, **vérifiée** à la fin. `detail` les précède sans en faire partie.

```
(detail) → define → destructure → adjust → enforce → diffuse
  verbe 0    poser    challenger   figer    verrou   produire
             └── malléable ──┘  └──── figé ────────────────┘
```

Le point de bascule est `adjust`. Avant lui, tout peut changer sans coût : les tokens bougent, l'inventaire de composants est de la prose, la charte porte la mention « brouillon ». Après lui, chaque changement est un **bump de version** qui déclenche une re-dérivation du linter et une réconciliation des instances existantes.

Cette asymétrie est délibérée. Elle rend la correction bon marché tant qu'elle est précoce, et traçable une fois qu'elle est tardive. C'est aussi pourquoi `destructure` — la phase divergente, celle qui critique la direction — vit **avant** le figeage et pas après.

`detail` (verbe 0) est en dehors de cette mécanique : lecture seule, aucun artefact. Il donne la carte et route une intention vers une séquence. Deux autres capacités restent hors entonnoir : `wireframes` explore la disposition, l’usage et les états d’une interface ; `harness` transforme les pages acceptées en référence multipage mesurable. Ni l’une ni l’autre n’accorde d’autorité au contrat de design.

Une wireframe est d’abord faite pour être regardée et commentée, pas pour documenter l’implémentation. Son socle et ses piliers optionnels sont définis une seule fois dans [`../references/wireframe-contract.md`](../references/wireframe-contract.md). Le handoff vers le harness conserve cette frontière : seule la page et son état initial migrent comme contenu, tandis que le harness reste propriétaire de son chrome et de ses viewports.

## Le contrat

`adjust` fige un **contrat** : cinq artefacts, racinés par `design/release.json`.

| Artefact | Contenu | Requis | Lecteur |
|---|---|---|---|
| `tokens.json` | valeurs nommées (W3C DTCG), source unique | ✓ | `lint-core.mjs`, adapters |
| `components.json` | anatomie des composants | ✓ | `lint-core.mjs` |
| `policies.json` | `mode`, préfixes utilitaires, usage, liste d'émission | ✓ | `lint-core.mjs`, `generate.py` |
| `oracle.json` | cibles de mesure et gate de fidélité figé par page | si référence mesurable | `config-gen.py` |
| `deviations.json` | registre des écarts tolérés | — | `measure.py`, `generate.py` |

`release.json` n'est pas un sixième artefact : c'est la **racine** qui déclare les autres, porte leurs versions, leurs empreintes, la provenance et le statut de maturité. Un dossier `design/` sans `release.json` est un contrat au format 1.x — le linter ne le parse pas, il sort en 3 et nomme la commande de migration.

`design-system.md` — la charte en prose — est une **entrée** du contrat, pas un artefact. Sa présence et sa version sont constatées dans `release.json`, mais aucun outil ne la lit. Elle sert aux humains ; elle ne fait pas autorité contre le code.

### La règle cardinale

**Une donnée vit dans un seul artefact.** Toute couleur qui apparaît dans un composant est un token `color.*`. Toute classe dont le bloc est déclaré dans `components.json` doit y figurer entièrement — élément ou modificateur.

C'est la règle qui rend le linter dérivable. Dès qu'une valeur existe à deux endroits, il n'y a plus de source unique, donc plus de règle calculable, donc plus de gate.

### Vocabulaire ouvert par défaut

Une classe dont le bloc n'est pas déclaré dans `components.json` est traitée comme **utilitaire**, pas comme une violation. Le vocabulaire ne se referme que sous `--strict`, en `warning`, et seulement sur les classes de forme BEM.

Ce choix évite le piège habituel du linter de design system : bloquer un projet réel dès la première classe applicative légitime. Le gate porte sur ce que le contrat déclare, pas sur ce qu'il ignore.

Énoncé complet et opposable : [`../skills/adjust/references/manifest-schema.md`](../skills/adjust/references/manifest-schema.md) § Invariant 1.

## Artefacts dérivés : générés, jamais écrits

`tools/generate.py` est le **seul producteur** des artefacts dérivés. Il lit les sources du contrat et émet un fichier par entrée de `policies.json § adapters[]` déclarant un `consumer` — un rôle (feuille de style, source pré-processée, configuration de build, fichier de tokens de plateforme), jamais un nom de plateforme.

```bash
python ${DESIGN_PLUGIN_ROOT}/tools/generate.py --contract design/            # au figeage
python ${DESIGN_PLUGIN_ROOT}/tools/generate.py --check --contract design/    # avant tout rendu
```

Le figeage grave dans `release.json § generated` l'empreinte de chaque source lue. `--check` l'oppose ensuite aux fichiers présents. **Une retouche manuelle et une source périmée sortent toutes deux en 1**, et aucun drapeau ne neutralise l'échec : on change la source, on régénère.

Une retouche à la main d'un fichier dérivé n'est pas une correction — c'est une dérive, et elle est traitée comme telle.

## Deux natures de gate

Il y a deux gates, de natures différentes, qui doivent être verts **ensemble** et dont aucun ne remplace l'autre.

| | Gate vocabulaire | Gate fidélité |
|---|---|---|
| Outil | `lint-core.mjs` | `measure.py` |
| Référence | **interne** — le contrat | **externe** — la maquette résolue |
| Établit | le markup scanné n'utilise ni classe ni token hors contrat | le rendu correspond à la maquette, par propriété et par breakpoint |
| Portée | un fichier de markup à la fois, en texte | les cibles déclarées dans `oracle.json` |

Ce que ni l'un ni l'autre ne couvre — rôles ARIA, fond réellement appliqué, fichiers hors cibles déclarées — est un **gap déclaré**, pas une vérification silencieuse. Énoncé complet : [`../references/gate-natures.md`](../references/gate-natures.md).

Un point qui se comprend mal la première fois : le gate vocabulaire est un **scanner de chaînes**. Il ne voit pas les liaisons dynamiques (`:class`, `{expr}`), ni les feuilles de style, ni la cohérence entre deux fichiers. Un vert de sa part est une garantie précise et étroite, pas un satisfecit général.

## Le seuil de maturité

Au-dessus des deux gates, un troisième mécanisme : **la conformité ne s'affirme qu'à partir d'un certain statut**.

`release.json § status` porte un statut **calculé** par `tools/status.py`, jamais écrit à la main. C'est une échelle — le premier échelon dont la condition n'est pas remplie arrête la montée.

| Statut | Requiert | Autorise |
|---|---|---|
| `extracted` | les artefacts existent | la génération, aucune conformité |
| `normalized` | + charte présente | *(un contrat migré depuis 1.x entre ici)* |
| `validated` | + vérifications enregistrées (`checks`) | **l'invocation de la conformité** — le seuil |
| `production-ready` | + contraste vert sur un nombre de paires **non nul** et états déclaratifs complets | certifie l'a11y calculable |

`tools/run-gates.py` relève le statut après le lint et **sort en 4** en deçà du seuil : les violations restent listées, mais la conformité n'est pas affirmée, et le rapport nomme le chemin de remontée.

Les écarts connus vivent dans `release.json § gaps[]` et **plafonnent** le statut au lieu d'être notés en prose. Charte absente → plafond `extracted`. Contraste jamais calculé → plafond `normalized`. Contraste calculé sans aucune paire à comparer → plafond `normalized`. Une paire de contraste ou un état qui échoue → plafond `validated`.

Ces deux derniers plafonds ne disent pas la même chose, et la distinction est le cœur du contrôle de contraste. Une paire qui échoue est une **mesure** : le contrat a été regardé et il ne tient pas. Zéro paire est une **impossibilité de mesurer** : aucun composant ne déclare quelle couleur porte du texte sur quel fond, et un contrôle qui n'a rien eu à regarder ne peut pas passer. Il sort donc en 3 et le figeage est refusé, sauf dérogation explicitement enregistrée. La sortie se lève en déclarant les appariements (`components.json § .foregrounds`), jamais en renommant des tokens pour plaire à une heuristique.

L'intérêt de cette mécanique : un contrat fraîchement migré n'hérite d'aucun droit acquis, et un gap connu ne peut pas être oublié dans un paragraphe que personne ne relit. Table complète : [`../references/maturity-status.md`](../references/maturity-status.md).

## Enforcement distribué

Le cœur portable (`lint-core.mjs`, Node.js ≥ 18, aucune dépendance) ne peut pas tout vérifier. Plutôt que d'empiler des règles dans le linter, le plugin **route chaque règle vers un réalisateur nommé**.

1. **Baseline** — `lint-core.mjs`, dérivé du contrat à l'exécution, tourne toujours.
2. **Pivot** — si `sc-<langage>` est installé, sa skill `design-bridge` réalise nativement les règles que le cœur portable ne sait pas lire.

Le routage se fait sur le **type d'enforcement** de chaque règle, jamais sur le nom de la plateforme ([`../references/enforcement-registry.md`](../references/enforcement-registry.md)). Aucun pivot installé → le cœur portable tourne seul, et les règles qui exigeaient un réceptacle sont **déclarées non réalisées** dans le rapport.

Le point important : une règle non réalisée n'est ni une violation ni une conformité. Le code de sortie est inchangé. Le rapport dit ce qui n'a pas été vérifié plutôt que de laisser croire que tout l'a été.

`design` garde le **quoi** (le contrat fait autorité) ; `sc-<langage>` fait le **comment** (le linter réel, le câblage natif).

## copycat — réplication mesurée

Copier une maquette arbitraire vers le contrat est un travail répétitif et propice à l'à-peu-près. `copycat` l'industrialise **sans ajouter de verbe** :

- un **agent** (`agents/copycat.md`) — opérateur **par page**, qui classe chaque écart à sa couche et propose des contributions tokens/composants. Trois frontières : il propose (n'arbitre ni ne fige jamais), la mesure vit dans le script déterministe, et c'est une feuille (il ne spawn aucun agent) ;
- un **oracle Python** (`adapters/measure/`) — `getComputedStyle` par breakpoint, cross-OS, sans dépendance Node ;
- deux **câblages** : `define/05-copycat-fanout` (fan-out parallèle, une page par agent, agrégé en table de correspondance au checkpoint humain) et `enforce/05-fidelity-gate` (le gate de fidélité).

La séparation mesure/jugement est le point de conception : un LLM est mauvais pour lire un pixel et bon pour classer un écart. Le script mesure, l'agent classe, l'humain arbitre.

**Responsive** — règle *ask-or-derive* : mesurer chaque breakpoint si la maquette le fournit, sinon déduire du profil mobile-first **et le flaguer**. Le tablette est le cas « derive » canonique.

**Écarts tolérés** — un écart n'est sanctionné que par une entrée `active` non expirée dans `deviations.json` portant sa valeur `expected` ; sinon le verdict est `OPEN`. `ds-deviation-ledger.md` en est la vue Markdown *générée* : on édite le JSON, jamais la vue.

## Voir aussi

- [`workflow.md`](workflow.md) — par où commencer selon ta situation
- [`troubleshooting.md`](troubleshooting.md) — les codes de sortie et quoi en faire
- [`../references/`](../references/) — les fichiers normatifs, source de vérité de chaque règle
