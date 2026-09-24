# Codebase Audit: plugins/design — dependencies

Trois dépendances Python épinglées, dont une (Pillow) porte 13 CVE corrigées en amont ; pytest utilisé mais non déclaré.

- **Date**: 2026_09_24
- **Scope**: `plugins/design/` (fichiers suivis par git, hors `.venv/`)
- **Health**: fair
- **Findings**: 0 critical, 2 warning, 2 minor

## Findings

| Sev | Category     | Location | Issue | Suggested fix | Effort |
| --- | ------------ | -------- | ----- | ------------- | ------ |
| 🟡  | dependencies | `plugins/design/adapters/measure/requirements.txt:4` | `pillow==12.2.0` : 13 avis OSV, dont 10 HIGH (écritures heap hors bornes `Image.paste()`/`crop()` GHSA-6r8x-57c9-28j4, bombes de décompression, etc.), tous corrigés en 12.3.0. `pixeldiff.py:26` fait `Image.open` sur tout format et `:38-61` utilise `crop`/`paste`. Les entrées sont des captures produites localement, donc l'exploitation reste improbable, mais l'épinglage fige une version vulnérable connue | Passer à `pillow==12.3.0`, relancer pytest + `harness-selftest.sh` ; restreindre `Image.open(path, formats=["PNG"])` dans `pixeldiff.py:26` | S |
| 🟡  | dependencies | `tools/eval/sc-php-fse-behave.mjs:95` | La suite `adapters/measure/tests` tourne avec `python -m pytest` (Python système), mais `pytest` n'est déclaré nulle part : absent de `requirements.txt` et du `.venv` (`pip list` : playwright, pillow, numpy, greenlet, pyee, typing_extensions). Les tests importent aussi `playwright` (`tests/test_cascade_ownership.py:7`) depuis ce même Python système. Sur une machine neuve, l'éval échoue par environnement, pas par régression | Ajouter `requirements-dev.txt` (`-r requirements.txt` + `pytest==<pin>`) et lancer l'éval avec l'interpréteur du venv documenté | S |
| 🟢  | dependencies | `plugins/design/adapters/measure/requirements.txt:3` | En retard mais sans avis OSV : `playwright==1.60.0` (dernière 1.63.0) et `numpy==2.4.6` (dernière 2.5.3). La version de Chromium suit celle de Playwright, donc le rendu mesuré dérive de celui des navigateurs actuels | Monter lors du prochain bump Pillow, puis revalider les mesures de référence (`harness-selftest.sh`) | S |
| 🟢  | dependencies | `plugins/design/adapters/measure/requirements.txt:1` | Aucun lockfile ni hash d'intégrité : les dépendances transitives (`greenlet`, `pyee`, `typing_extensions`) ne sont pas épinglées, et `pip install` n'a pas de `--require-hashes` | Générer un `requirements.lock` via `pip-compile --generate-hashes` et le référencer dans `references/wireframe-render-setup.md:10` | S |

## Top actions

1. Bump `pillow==12.3.0`, et restreindre `Image.open` au PNG (ligne 1) : patch design, sans skill de handoff nécessaire.
2. Déclarer pytest dans un `requirements-dev.txt` et exécuter l'éval via le venv (ligne 2), ce qui fiabilise `pnpm test`.
3. Lockfile avec hashes et montée playwright/numpy groupée (lignes 3-4).

## Coverage

- **Scanned**: dependencies. Avis de sécurité via l'API OSV (`api.osv.dev/v1/query`, PyPI) pour les 3 paquets épinglés ; dernières versions et licences via PyPI JSON.
  - Licences : Apache-2.0 (playwright), MIT-CMU (pillow), BSD-3-Clause et autres licences permissives (numpy). Aucune GPL/AGPL.
  - Imports tiers réels (`playwright`, `PIL`, `numpy`) : tous déclarés, aucun déclaré inutilisé.
  - JS (`lint-core.mjs`) : modules Node intégrés seulement.
- **Skipped**: `pip-audit` absent (`No module named pip_audit`), remplacé par une requête OSV directe. Pas de manifeste npm propre au plugin (le `package.json` racine est hors périmètre).
