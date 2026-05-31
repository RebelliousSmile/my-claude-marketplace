# 04 - Debug

Diagnostiquer les anomalies du pipeline d'extraction : chunks manquants, texte garbled, erreurs de classification, incohérences de `progress.md`.

## Inputs

- `project_path` (required) — string, format `<jeu>/ecrits/<projet>` (résolu depuis `<vault>/`)
- `source_name` (required) — nom du PDF source sans extension (ex. `engrenages-regles`). Si plusieurs extractions existent dans `docs/extraction/`, lister les dossiers disponibles et demander à l'utilisateur.
- `chunk_id` (optional) — chunk spécifique à débugger (ex. `03`) ; si omis, audit complet

## Outputs

```markdown
# Extraction Debug Report: <source-name>

**Date:** YYYY-MM-DD
**Scope:** [Full audit / Chunk 03]

## Environment
- pdftotext: [available/missing]
- tesseract: [available/missing]
- pdfplumber: [available/missing]
- pypdf: [available/missing]

## Progress Status
- Chunks: X done, Y pending, Z failed
- Last activity: [date]

## Issues Found

### [CHUNK-03] Texte garbled
- >30% caractères non-printable détectés
- Recommandation : utiliser tesseract OCR

### [CLASSIFIED] Doublons
- "saidin" dans terminology.md lignes 12 ET 47 avec définitions différentes
- Recommandation : fusionner en gardant la définition la plus longue

### [PROGRESS] Incohérence
- le chunk id 03 marqué `done` mais raw/chunk_03.txt est vide
- Recommandation : réinitialiser à `pending` et retraiter

## Recommended Actions
1. [action avec commande exacte]
2. [action]
```

## Process

1. Vérifier les outils disponibles (pdftotext, tesseract, pdfplumber, pypdf).
2. Lire `bank.yml` → extraire `document.univers` → construire `<univers-root>` = `<jeu>/univers/<document.univers>/` (où `<jeu>` est le premier segment sous `<vault>`, déduit du CWD). Tester si même dépôt : `git -C "<univers-root>" rev-parse --show-toplevel` vs `git rev-parse --show-toplevel`.
3. Lire `docs/extraction/<source-name>/progress.md`. Parser le tableau : statuts `pending/done/failed`, dates.
4. Vérifier les stashes git suspects :
   ```bash
   git -C "<univers-root>" stash list
   git stash list   # projet (CWD) ; inutile si same_repo = true
   ```
5. **Si `chunk_id` spécifié** → focus sur ce chunk. Sinon → audit complet.
6. **Intégrité des fichiers** :
   - Pour chaque chunk `done` : vérifier que le PDF `docs/extraction/<source-name>/chunks/*_part<XX>_*.pdf` ET `docs/extraction/<source-name>/raw/chunk_XX.txt` existent et sont non-vides.
   - Pour chaque chunk `pending` : vérifier que le PDF `docs/extraction/<source-name>/chunks/*_part<XX>_*.pdf` existe.
   - Pour chaque chunk `failed` : noter l'erreur connue.
7. **Qualité du texte brut** :
   ```python
   from pathlib import Path
   txt = Path('docs/extraction/<source-name>/raw/chunk_XX.txt').read_text(encoding='utf-8')
   non_print = sum(1 for c in txt if not c.isprintable() and c not in '\n\r\t')
   ratio = non_print / len(txt) if txt else 0
   print(f'Non-printable ratio: {ratio:.1%}')
   ```
8. **Fichiers classifiés** :
   - Lister les fichiers, leur taille et le nombre de marqueurs YAML (`chunk:` count).
   - Détecter les doublons de sections.
9. **Cohérence progress.md** : comparer les statuts avec l'état réel des fichiers. Signaler tout écart.
10. **Actions de réparation** proposées :
    - Réinitialiser un chunk `failed` → `pending` : modifier `progress.md` manuellement.
    - Re-extraire un chunk : supprimer `docs/extraction/<source-name>/raw/chunk_XX.txt`, remettre `pending`, relancer.
    - Nettoyer un stash obsolète : `git -C "<univers-root>" stash drop` ou `git stash drop`.
    - Repartir de zéro : `python -c "import shutil; shutil.rmtree('docs/extraction/<source-name>')"`.
11. Produire le rapport de debug avec toutes les anomalies et actions recommandées.

## Test

Après `debug <project_path> <source_name>` sur une extraction avec une incohérence connue (chunk `done` avec `raw/` vide), vérifier que le rapport signale l'incohérence et recommande la commande de correction.
