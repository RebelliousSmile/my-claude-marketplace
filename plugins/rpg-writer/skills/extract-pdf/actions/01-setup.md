# 01 - Setup

Session 1 du pipeline d'extraction PDF : valider l'environnement, découper le PDF en chunks via `split-pdf.py`, écrire `progress.md`.

## Inputs

- `project_path` (required) — string, format `<jeu>/ecrits/<projet>` (résolu depuis `<vault>/`)
- `source_document` (required) — chemin vers le PDF source

## Outputs

```
docs/extraction/<source-name>/
  progress.md         — fichier de tracking avec liste des chunks et statuts
  chunks/
    <source>_part01_p1-25.pdf   — premier chunk (PDF découpé, 25 pages max)
    <source>_part02_p26-50.pdf
    ...
  raw/                — dossier créé vide, rempli lors de process-chunk (raw/chunk_<NN>.txt)
  classified/         — dossier créé vide, rempli lors de process-chunk
```

Format `progress.md` :
```markdown
# Extraction Progress: <source-name>

**Source:** <source_document>
**Project:** <jeu>/ecrits/<projet>
**Univers:** <univers>
**Total chunks:** N
**Date started:** YYYY-MM-DD

## Chunks

| Chunk | Pages | Chars | Status | Session |
|-------|-------|-------|--------|---------|
| <source>_part01_p1-25.pdf | 1-25 | ~12500 | pending | - |
| <source>_part02_p26-50.pdf | 26-50 | ~12500 | pending | - |
```

> Statuts valides : **`pending`** / **`done`** / **`failed`**. Jamais `TODO` ni `DONE`.
> Colonne `Chunk` = nom de fichier RÉEL produit par `split-pdf.py` : `<source>_part<NN>_p<début>-<fin>.pdf`. L'`<chunk_id>` (argument de `process-chunk`) est le `<NN>` zéro-padé.

## Process

1. Vérifier que `bank.yml` existe dans le répertoire courant. Sinon → STOP : "Lancer le skill depuis le répertoire du projet (`<jeu>/ecrits/<projet>/`) ou exécuter `setup init` d'abord."
2. Extraire depuis `bank.yml` : `document.univers`, `document.name`.
3. Vérifier que `<source_document>` existe et est lisible (header `%PDF-`).
4. `<source-name>` = nom du fichier sans extension.
5. Vérifier les outils disponibles : `pdftotext`, `tesseract`, `pdfplumber`, `pypdf`. Vérifier que les scripts existent :
   - `scripts/split-pdf.py` — **requis** pour cette session. Si absent → STOP : "Script manquant : scripts/split-pdf.py. Copiez-le depuis le dossier `scripts/` du skill `extract-pdf` dans l'overlay."
   - `scripts/normalize-text.py` — utilisé lors de `process-chunk`. Si absent → WARN : "scripts/normalize-text.py manquant — l'étape de normalisation sera ignorée lors des extractions." Ne pas bloquer le setup.
6. Créer les dossiers `chunks/`, `raw/`, `classified/` sous `docs/extraction/<source-name>/`.
7. Estimer le découpage : `python scripts/split-pdf.py <source_document> --estimate`
8. Découper le PDF : `python scripts/split-pdf.py <source_document> --pages-per-chunk 25 --output-dir docs/extraction/<source-name>/chunks/`
9. Pour chaque chunk créé, noter pages et caractères estimés (~2500/page).
10. Écrire `docs/extraction/<source-name>/progress.md` avec le format exact ci-dessus.
11. Vérifier que `docs/prompts/workshop/` contient `extract.prompt.md`, `extract-chunk.prompt.md`, `extract-distribute.prompt.md`, `extract-debug.prompt.md`. Si des fichiers manquent → signaler : "Les prompts suivants sont manquants : [liste]. Copiez-les depuis le dossier `prompts/` du skill `extract-pdf` dans l'overlay." Ne pas tenter de les copier automatiquement.
12. Rapport : "Phase A terminée. N chunks créés. Lancer `extract-pdf process-chunk <project_path> <source_name> 01`."

## Test

Après `setup <project_path> <source_document>`, vérifier que :
- `docs/extraction/<source-name>/progress.md` existe avec au moins 1 chunk en statut `pending`
- le premier chunk existe dans `docs/extraction/<source-name>/chunks/` (ex. `<source>_part01_p1-25.pdf`)
