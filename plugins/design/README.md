# design

*Plugin de design system en entonnoir : du brief ou de la référence jusqu'à des éléments répétables vérifiés par un gate de lint.*

Principe directeur : **la seule référence opposable est celle qu'un outil sait lire** — pas la charte (prose), pas les maquettes (divergentes), mais les artefacts JSON racinés par `release.json`, dont un linter dérive ses règles à chaque livraison.

## Documentation

| Page | Contenu |
|---|---|
| [`docs/concepts.md`](docs/concepts.md) | Le modèle mental — l'entonnoir, le contrat, les deux natures de gate, le seuil de maturité, l'enforcement distribué, copycat |
| [`docs/workflow.md`](docs/workflow.md) | Par où commencer — les six classes de cas, le parcours nominal, les checkpoints humains |
| [`docs/troubleshooting.md`](docs/troubleshooting.md) | Les codes de sortie et la correction attendue pour chacun |

Le détail normatif de chaque règle vit dans [`references/`](references/) ; le processus de chaque verbe, dans son `SKILL.md`.

`copycat` est un contrat d'agent interne (`agents/copycat.md`) chargé par `define`, `enforce` ou un orchestrateur compatible. Ce n'est pas une skill publique et aucune commande `design:copycat` n'existe.

## Flux

```
(detail) → define → destructure → adjust → enforce → diffuse
  verbe 0    poser    challenger   figer    verrou   produire
             └── malléable ──┘  └──── figé ────────────────┘
```

Le pipeline compte **cinq verbes**. Le point de bascule est `adjust` : avant lui tout change sans coût, après lui chaque changement est un bump de version. Trois skills sont hors pipeline — `detail` (verbe 0, lecture seule), `wireframes` (exploration d’interface standardisée) et `harness` (référence multipage mesurable). Quand l’UX reste à fixer, le chemin préparatoire est `brief UI → wireframes → review → harness` ; il ne modifie pas le contrat.

## Skills

| Skill | Capability | Description |
|-------|-----------|-------------|
| `detail` | `design:detail` | **Verbe 0, lecture seule, aucun artefact.** `explain` : la carte des verbes. `route` : la séquence exécutable pour l'une des six classes de cas, étendue par le workflow de plateforme du pivot `sc-*` installé. |
| `define` | `design:define` | Extraction depuis références (image, URL, CSS, dossier d'export d'outil de design) ou brief → tokens + inventaire + charte brouillon. Profil mobile-first optionnel. |
| `destructure` | `design:destructure` | Challenge la direction design — critique multi-angles + pistes alternatives. |
| `adjust` | `design:adjust` | Arbitrage maquettes + figeage du contrat + migration 1.x → 2.0. |
| `enforce` | `design:enforce` | Linter portable dérivé du contrat · 4 gates de vocabulaire + 1 gate de fidélité · pivot par langage. |
| `diffuse` | `design:diffuse` | Éléments répétables sous gate lint · baseline HTML/CSS · pivot par langage. |
| `wireframes` | `design:wireframes` | Génère, normalise et valide des planches HTML desktop/mobile, puis prépare les pages acceptées pour le harness. **Hors entonnoir, aucun artefact de contrat.** Contrat : [`references/wireframe-contract.md`](references/wireframe-contract.md). |
| `harness` | `design:harness` | Génère ou normalise le harness HTML autonome (`setPage`/`setViewport`) piloté par l'oracle de fidélité. **Hors entonnoir.** |

## Démarrage rapide

Invoquer ces capacités par leur nom dans Codex. Dans Claude Code, le même nom peut être appelé
comme slash command (`/design:define`, etc.). Le workflow ne dépend d'aucune syntaxe d'hôte :

```text
design:detail          # quelle séquence pour mon cas (lecture seule)
design:wireframes      # optionnel : fixer disposition, usages et états avant le harness
design:define          # poser le contrat depuis brief ou référence
design:destructure     # challenger avant de figer (recommandé)
design:adjust          # arbitrer + figer le contrat (ou migrer un contrat 1.x)
design:enforce         # câbler le linter + les gates
design:diffuse <comp>  # produire sous gate
```

## Artefacts produits dans le projet

```
design/
  release.json           # racine — versions, empreintes, provenance, statut, generated
  tokens.json            # valeurs — W3C DTCG, source unique
  components.json        # anatomie — nomenclature déclarée, base du linter
  policies.json          # mode, préfixes utilitaires, usage, liste d'émission
  oracle.json            # cibles de mesure de fidélité (optionnel)
  deviations.json        # registre des écarts tolérés — active sanctionne (optionnel)
  design-system.md       # entrée — charte prose, figée après adjust
  adapters/              # dérivés — produits par generate.py seul, jamais à la main
  lint/
    run-gates.py         # runner d'agrégation — seule commande du gate, aux trois sites d'appel
    lint-core.mjs        # linter portable dérivé du contrat, invoqué par le runner
    migrate-contract.py  # migration 1.x → 2.0, nommée par l'exit 3 du linter
    status.py            # statut de maturité — seule implémentation ; THRESHOLD importé par run-gates.py
    gates.config.json    # périmètre exécutable — contrat, cibles, rapports de pivot
```

## Licence

MIT — voir [LICENSE](../../LICENSE).
