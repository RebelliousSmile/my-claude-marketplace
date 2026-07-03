---
name: extract-setup
description: Setup PDF extraction workspace — Phase A
argument-hint: <project-dir> <source-pdf> <target>
---

# Extract PDF — Setup (Phase A)

Arguments reçus : `<project_dir> <source_pdf> <target>`

> **Rôle** : prépare l'espace de travail pour l'extraction. Les sources de référence brutes seront écrites sous `<target>/sources/` lors de la phase Distribute (profil JDR : `<univers-root>/sources/` + `<systeme-root>/sources/`). Jamais dans la couche synthétisée (`reference/` en générique, `canon/`/`mj/` en profil JDR).
> Voir `${CLAUDE_PLUGIN_ROOT}/references/domain-layout.md` pour la convention générique des chemins (et `references/jdr-layout.md` pour le profil JDR).

---

## Goal

Valider l'environnement, découper le PDF en chunks, écrire `progress.md`. Ne pas traiter de chunks dans cette session.

---

## Step 0: Validate Environment

### 0.1 Discover R (domain root) & detect profile

`R` = une **sous-catégorie** `(Perso|Pro)/<Catégorie>/<Sous-catégorie>/`. Partir du répertoire de référence (`<project_dir>` ou CWD). **Générique** : remonter jusqu'à un segment `Perso`/`Pro`, le niveau sous-catégorie est `R` (ancre `obs:tree`). **Raccourci profil JDR** : remonter jusqu'au premier dossier contenant l'un des marqueurs `_campagnes/`, `_univers/` ou `_pjs/`.

```bash
python -c "
from pathlib import Path
ref = Path('<project_dir>').resolve()
# Raccourci profil JDR : premier parent contenant un marqueur JDR
R = next((p for p in [ref, *ref.parents] if any((p / m).is_dir() for m in ['_campagnes', '_univers', '_pjs'])), None)
# Fallback générique : ancre Perso/Pro → niveau sous-catégorie
if R is None:
    for p in [ref, *ref.parents]:
        if p.parent.parent.name in ('Perso', 'Pro'):
            R = p; break
if R is None:
    print('[MISSING] ni ancre Perso/Pro ni marqueur JDR en remontant')
else:
    profile = 'jdr' if any((R / m).is_dir() for m in ['_univers', '_systeme']) else 'generic'
    print(f'[OK] R = {R} · profile = {profile}')
"
```

If missing → STOP: "Cible hors d'un domaine initialisé (ni ancre `Perso`/`Pro`, ni marqueur JDR en remontant). Initialiser `R` d'abord."

### 0.2 Check extraction tools

```bash
python -c "
import shutil
tools = {
    'pdftotext': shutil.which('pdftotext'),
    'tesseract': shutil.which('tesseract'),
}
print(tools)
"
```

```bash
python -c "
try:
    import pdfplumber; print('[OK] pdfplumber')
except: print('[MISSING] pdfplumber')
try:
    import pypdf; print('[OK] pypdf')
except: print('[MISSING] pypdf')
"
```

### 0.3 Validate source PDF

```bash
python -c "
from pathlib import Path
p = Path('<source_pdf>')
if not p.exists(): print('[MISSING] File not found')
elif p.stat().st_size < 1000: print('[WARN] File too small, may be empty')
else:
    header = p.read_bytes()[:5]
    print('[OK]' if header == b'%PDF-' else '[WARN] Not a PDF', p.name)
"
```

---

## Step 1: Determine Target & Source Name

- `<target>` = argument reçu (slug `kebab-case`) ; si absent, demander à l'utilisateur. Enregistré dans le champ `Univers` de `progress.md`. **Profil JDR** : univers cible → `<univers-root> = R/_univers/<target>/`. **Générique** : bucket/scope cible → `<target>/sources/`.
- `<source-name>` = `<source_pdf>` filename without extension

---

## Step 2: Create Extraction Workspace

```bash
python -c "
from pathlib import Path
for d in ['chunks', 'raw', 'classified']:
    Path('docs/extraction/<source-name>/' + d).mkdir(parents=True, exist_ok=True)
print('[OK] Workspace created')
"
```

---

## Step 3: Split PDF into Chunks

```bash
# Estimate chunk size first
python scripts/split-pdf.py <source_pdf> --estimate

# Split into chunks of 25 pages
python scripts/split-pdf.py <source_pdf> --pages-per-chunk 25 --output-dir docs/extraction/<source-name>/chunks/
```

List created chunks and note page ranges and estimated character counts (~2500 chars/page).

> `split-pdf.py` nomme les fichiers `<source>_part<NN>_p<début>-<fin>.pdf` (ex. `<source>_part01_p1-25.pdf`). C'est ce nom RÉEL qui figure dans la colonne `Chunk` de `progress.md`. L'`<chunk_id>` passé à `process-chunk` est le `<NN>` (zéro-padé) ; le chunk se localise par glob `chunks/*_part<NN>_*.pdf`.

---

## Step 4: Write progress.md

Create `docs/extraction/<source-name>/progress.md` with exact format below.

> ⚠️ Format strict — respecter les noms de colonnes et les valeurs de statut exactement.
> `<project_dir>` est le répertoire du projet d'écriture (`R/<AAAA>/<MM>/<projet>/`).

```markdown
# Extraction Progress: <source-name>

**Source:** <source_pdf>
**Project:** <project_dir>
**Univers:** <target>
**Total chunks:** N
**Date started:** YYYY-MM-DD

## Chunks

| Chunk | Pages | Chars | Status | Session |
|-------|-------|-------|--------|---------|
| <source>_part01_p1-25.pdf | 1-25 | ~12500 | pending | - |
| <source>_part02_p26-50.pdf | 26-50 | ~12500 | pending | - |
```

> Colonne `Chunk` = nom de fichier RÉEL produit par `split-pdf.py` (`<source>_part<NN>_p<début>-<fin>.pdf`), pas un `chunk_NN.pdf` générique.

Statuts valides : **`pending`** / **`done`** / **`failed`** — jamais `TODO` ni `DONE`.

---

## Step 5: Check Prompt Templates

```bash
python -c "
from pathlib import Path
prompts = ['extract.prompt.md', 'extract-chunk.prompt.md', 'extract-distribute.prompt.md', 'extract-debug.prompt.md']
missing = [p for p in prompts if not Path('docs/prompts/workshop/' + p).exists()]
if missing:
    print('WARN — Prompts manquants dans docs/prompts/workshop/ :')
    for p in missing: print(' -', p)
    print('Copiez-les depuis le dossier prompts/ du skill extract-pdf dans l\\'overlay.')
else:
    print('[OK] Tous les prompts sont présents.')
"
```

---

## Final Message

```
Phase A terminée.
- PDF: <source_pdf>
- Chunks créés: N (docs/extraction/<source-name>/chunks/)
- progress.md: docs/extraction/<source-name>/progress.md

Mode automatisé:
  python scripts/extract-pdf.py --resume docs/extraction/<source-name>/progress.md

Mode manuel:
  /extract-pdf process-chunk <project_dir> <source_name> 01
```

**END SESSION**
