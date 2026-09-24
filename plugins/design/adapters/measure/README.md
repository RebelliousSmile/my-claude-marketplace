# Oracle de fidélité (`adapters/measure/`)

Compare le style calculé d'une maquette et d'une implémentation, propriété par propriété et par breakpoint. Les nombres viennent de Chromium via Playwright, pas d'un modèle : mêmes entrées, même rapport.

## Installation

Python 3.13 validé. Un environnement virtuel par machine, hors du dépôt consommateur :

```sh
python -m venv .venv
# Windows : .venv\Scripts\activate    ·    POSIX : source .venv/bin/activate
python -m pip install -r requirements.txt       # playwright, pillow, numpy épinglés
python -m playwright install chromium
```

Pour lancer les tests des adapters (`pnpm test:design`), installer `requirements-dev.txt` à la place : il inclut `requirements.txt` et ajoute `pytest`. `DESIGN_PYTHON` désigne l'interpréteur du venv si ce n'est pas `python` (`python3` hors Windows).

## Scripts

| Script | Rôle |
| --- | --- |
| `config-gen.py` | Génère le config de mesure d'une page depuis le contrat figé ; `--check` prouve que le gate est complet |
| `measure.py` | L'oracle : Mode B (défaut) ou Mode A |
| `screenshot.py` | Captures maquette et implémentation par breakpoint |
| `pixeldiff.py` | Diff pixel : détecteur grossier, jamais une preuve (`references/visual-diff-procedure.md`) |

## Modes de `measure.py`

- **Mode B** (défaut) : diff maquette ↔ implémentation. C'est le gate de fidélité.
- **Mode A** (`--mode A --side mockup|implementation`) : extrait le style d'un seul côté. Sert à amorcer un contrat et à prouver, au figeage, que chaque sélecteur maquette résout.

```sh
python measure.py --config <cfg> --ledger-registry <dir>/deviations.json --out <projet>/<qa>/fidelity/<page>-B.json
python measure.py --config <cfg> --mode A --side mockup --ledger-registry <dir>/deviations.json --out <fichier>
```

`--ledger-registry` est obligatoire : sans registre d'écarts, sortie 2 au lieu d'une mesure. `--out` est un chemin absolu dans le projet consommateur, jamais dans le plugin.

## Verdict

Le verdict vit dans le rapport (`summary.verdict`, `summary.closed`), pas dans le code de sortie : `measure.py` sort 0 dès qu'il a mesuré, 2 sur une entrée invalide.

## Qui l'appelle

`enforce` (`skills/enforce/actions/05-fidelity-gate.md`), `adjust` au figeage (Mode A), l'agent `copycat` et `define` (`skills/define/actions/05-copycat-fanout.md`). Ce que le gate établit et n'établit pas : `references/gate-natures.md`.
