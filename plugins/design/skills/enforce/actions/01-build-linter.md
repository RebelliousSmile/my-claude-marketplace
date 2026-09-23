# Build-linter

## Rôle

Installer le gate dans le projet courant — runner d'agrégation, cœur portable, périmètre — et vérifier qu'il tourne sur le contrat figé.

## Prérequis

- `design/release.json` existe et déclare au moins `tokens.json`, `components.json` et `policies.json` (produits par `adjust`). Sans `release.json`, le contrat est au format 1.x : jouer `adjust/03-migrate` d'abord.
- Runtimes : `${DESIGN_PLUGIN_ROOT}/skills/enforce/references/gate-wiring.md § Prérequis d'exécution`.

## Étape 0 — Choisir `extend` ou `install`

Inventorier avant toute copie les commandes de lint réellement câblées (`package.json`, Makefile,
scripts CI/hook) et les fichiers qui vérifient déjà le vocabulaire ou les tokens du design system.

Le mode **`extend`** exige les deux signaux suivants :

1. un gate DS existant avec une commande unique déjà utilisée par le projet ;
2. un point d'extension machine-readable : `design/lint/integration.json` portant
   `{"mode":"extend","command":[...],"generatedBlock":"design-enforce-v2"}`, une clé équivalente
   `designEnforcement` dans la configuration du linter, ou les deux sentinelles
   `BEGIN/END DESIGN ENFORCEMENT GENERATED` dans son agrégateur.

Avec les deux signaux, **ne pas créer de seconde commande de gate et ne remplacer aucun linter**.
Installer les quatre fichiers portables de l'étape 2 sous `design/lint/generated/design-enforce-v2/`,
générer leur configuration dans le même répertoire, puis ajouter leur invocation uniquement dans le
bloc généré du gate existant. Le champ `command` reste l'unique commande exécutée et la vérification de
l'étape 4 la rejoue. Une seconde exécution remplace le contenu du bloc, elle ne duplique ni import ni
sous-commande.

Un linter existant **sans** point d'extension explicite est ambigu : montrer le diff d'intégration et
s'arrêter. Ne jamais l'écraser, ni installer silencieusement un système parallèle. Aucun linter DS
existant → mode **`install`**, étapes 1 à 4 ci-dessous, comportement portable historique.

## Étape 1 — Créer le répertoire de lint (`install`)

```
design/
  lint/
    run-gates.py         ← runner d'agrégation (source : ${DESIGN_PLUGIN_ROOT}/tools/run-gates.py)
    lint-core.mjs        ← cœur portable (source : ${DESIGN_PLUGIN_ROOT}/skills/enforce/adapters/lint-core.mjs)
    migrate-contract.py  ← script de migration (source : ${DESIGN_PLUGIN_ROOT}/tools/migrate-contract.py)
    status.py            ← calcul du statut de maturité (source : ${DESIGN_PLUGIN_ROOT}/tools/status.py)
    gates.config.json    ← périmètre du gate (schéma : ${DESIGN_PLUGIN_ROOT}/references/gate-config-schema.md)
```

Créer `design/lint/` s'il n'existe pas.

## Étape 2 — Copier les quatre fichiers dans le répertoire du mode

Copier `tools/run-gates.py`, `skills/enforce/adapters/lint-core.mjs`, `tools/migrate-contract.py` et `tools/status.py` depuis `${DESIGN_PLUGIN_ROOT}` vers `design/lint/`, à plat en mode `install`, ou vers `design/lint/generated/design-enforce-v2/` en mode `extend`.

Ils voyagent ensemble : `run-gates.py` invoque `lint-core.mjs` en frère ; sur un contrat 1.x, les deux sortent en 3 et impriment la commande de migration, cherchée à côté d'eux ; `migrate-contract.py` importe `status.py` en frère, seule implémentation du statut de maturité. Un fichier manquant fait sortir l'outil en 2 en le nommant — jamais un chemin mort ni une trace d'exception.

En mode `install`, si le projet a un gestionnaire de paquets, ajouter un script pointant sur la commande unique de `references/gate-wiring.md § La commande unique` :

```json
{
  "scripts": {
    "lint:design": "python design/lint/run-gates.py --config design/lint/gates.config.json"
  }
}
```

## Étape 3 — Créer la configuration du mode

C'est le **seul** endroit où le périmètre de la baseline est déclaré, et il est exécutable : `design/lint/gates.config.json` en mode `install`, `design/lint/generated/design-enforce-v2/gates.config.json` en mode `extend`. Ce qui n'y figure pas n'est pas linté. Champ par champ : `${DESIGN_PLUGIN_ROOT}/references/gate-config-schema.md`.

Les deux modes de contrat (`policies.json § mode`) ne diffèrent que par `targets` :

**Mode `bem`** — le vocabulaire porte sur les noms de classe, donc sur le markup :

```json
{
  "$schema": "design/references/gate-config-schema",
  "contract": "..",
  "linter": "lint-core.mjs",
  "targets": ["../src/**/*.html", "../templates/**/*.html"]
}
```

**Mode `utility-first`** — le vocabulaire porte sur l'usage des tokens : couvrir **tous** les fichiers de composants, pas seulement le markup statique, sinon la majorité du code échappe au gate :

```json
{
  "$schema": "design/references/gate-config-schema",
  "contract": "..",
  "linter": "lint-core.mjs",
  "targets": ["../../src/**/*.{vue,jsx,tsx,html}"]
}
```

Les chemins sont relatifs au fichier de configuration lui-même.

## Étape 4 — Vérification de fonctionnement

En mode `install`, exécuter la commande portable ci-dessous. En mode `extend`, exécuter exclusivement
la commande existante déclarée par le marqueur ; elle doit appeler la même baseline depuis son bloc
généré.

```bash
python design/lint/run-gates.py --config design/lint/gates.config.json
```

| Exit | Lecture | Suite |
|---|---|---|
| 0 | installation OK, aucune violation | `02-wire-gates` |
| 1 | des violations préexistent | les documenter, proposer `03-lint-instances` |
| 2 | runtime ou configuration | le message nomme ce qui manque (`references/gate-wiring.md § Prérequis d'exécution`) |
| 3 | contrat 1.x | `adjust/03-migrate` d'abord |

Le rapport liste aussi les règles **non réalisées** : déclarées, sans réalisateur disponible. Une preuve P0/P1 manquante rougit le gate ; une intégration P2 manquante avertit seulement. Aucune ne doit être lue comme vérifiée.

Si aucune cible du projet n'existe encore, smoke test sur les fixtures du plugin :

```bash
python plugins/design/tools/run-gates.py --config plugins/design/skills/enforce/fixtures/gates.clean.config.json
```

## Sortie attendue

> Mode : `extend` (gate existant `<commande>`, bloc `design-enforce-v2`) | `install` (nouveau gate portable).
> `run-gates.py` + `lint-core.mjs` installés dans le répertoire gouverné par ce mode, configuration créée (N cibles).
> Gate unique rejoué : [exit 0 / N violations] · règles non réalisées : [liste ou aucune].
> Prochaine étape : invoquer `design:enforce` → 02-wire-gates.
