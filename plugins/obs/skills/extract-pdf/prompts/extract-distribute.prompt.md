---
name: extract-distribute
description: Merge extracted content and distribute to reference sources/ destinations
argument-hint: <progress-file>
---

# Distribute Extracted Content

> **Frontière** : `extract-pdf` écrit uniquement dans `sources/` (jamais dans la couche synthétisée — `reference/` en générique, `canon/`/`mj/` en profil JDR).
> Voir `${CLAUDE_PLUGIN_ROOT}/references/domain-layout.md` pour la convention générique (§ profil JDR pour les spécificités JDR).

## Context

### Progress File

```markdown
@$PROGRESS
```

## Goal

Merge all classified content, distribute to `sources/` reference destinations, with git stash rollback.

---

## Step 0: Load Context & Validate

1. Parse progress file:
   - `Source` → original PDF path
   - `Project` → project dir (`R/<AAAA>/<MM>/<projet>/`)
   - `Univers` → target slug (`<target>`)

2. Resolve paths localement (aucun chemin global) et détecter le profil :
   - **Découvrir `R`** : partir du répertoire de référence (champ `Project` ou CWD). Générique : remonter jusqu'à un segment `Perso`/`Pro`, le niveau sous-catégorie est `R`. Raccourci profil JDR : remonter jusqu'au premier dossier contenant l'un des marqueurs `_campagnes/`, `_univers/` ou `_pjs/`.
   - **Profil** : JDR si `R/bank.yml` déclare `profile: jdr` ou si `R` contient `_univers/`/`_systeme/` ; sinon cœur générique.
   - **Générique** : `<target-root>` = `R/_<target>/` (ou le répertoire de work-unit) → sources sous `<target-root>/sources/`.
   - **Profil JDR** : `<univers-root>` = `R/_univers/<target>/`, `<systeme-root>` = `R/_systeme/`.

3. Verify ALL chunks have status `done`
   - IF any `pending` → STOP, list missing chunks

4. List files in `classified/`:
   ```bash
   dir /b "docs\extraction\<source-name>\classified"   # Windows
   ls "docs/extraction/<source-name>/classified"       # Unix
   ```

5. Calculate total size:
   - IF total > 80000 chars → warn, suggest batch processing

---

## Step 1: Merge Classified Files

For each file in `classified/`:

1. Read entire content
2. Remove YAML front matter blocks:
   ```
   ---
   chunk: XX
   pages: N-M
   extracted: YYYY-MM-DD
   ---
   ```
3. Deduplicate identical sections
4. Store merged content in memory

---

## Step 2: Prepare Rollback (Git Stash)

**Un seul dépôt = `R`** (univers, système et projet vivent tous sous `R`) :

```bash
git -C "<R>" stash push -m "pre-extraction-<source-name>"
```

Note: `git -C <path>` works on both Windows and Unix. Si `R` n'est pas versionné, sauter les étapes git.

Store stash state for potential rollback.

---

## Step 3: Preview Distributions

For each category with content:

**Cœur générique** — tout atterrit sous le `<target-root>/sources/<source-name>/` unique :

| Classified | Destination | Action |
|------------|-------------|--------|
| `raw/chunk_*.txt` (assemblés) | `<target-root>/sources/<source-name>/fulltext.md` | create — brut intégral, **ne jamais jeter** |
| `lore*.md` | `<target-root>/sources/<source-name>/lore.md` | create/append |
| `terminology*.md` | `<target-root>/sources/<source-name>/terminology.md` | create/merge |
| `rules*.md` | `<target-root>/sources/<source-name>/rules.md` | create/append |
| `style*.md` | `<target-root>/.output-styles/<target>-<source-name>.md` | create |
| `structure*.md` | `<project_dir>/.toc/INDEX.md` | create/update |
| `templates*.md` | `<target-root>/.templates/latex-patterns.md` | append |

**Profil JDR** — split par provenance (lore → univers, règles → système) :

| Classified | Destination | Action |
|------------|-------------|--------|
| `raw/chunk_*.txt` (assemblés) | `<univers-root>/sources/<source-name>/fulltext.md` (+ `<systeme-root>/…` si règles) | create — brut intégral, **ne jamais jeter** |
| `lore*.md` | `<univers-root>/sources/<source-name>/lore.md` | create/append |
| `terminology*.md` | `<univers-root>/sources/<source-name>/terminology.md` | create/merge |
| `rules*.md` | `<systeme-root>/sources/<source-name>/rules.md` | create/append |
| `style*.md` | `<univers-root>/.output-styles/<univers>-<source-name>.md` | create |
| `structure*.md` | `<project_dir>/.toc/INDEX.md` | create/update |
| `templates*.md` | `<univers-root>/.templates/latex-patterns.md` | append |

> **Générique** : tous les bundles → `<target-root>/sources/<source-name>/`.
> **Profil JDR** : lore et terminologie → `<univers-root>/sources/<source-name>/` (référence univers) ; règles → `<systeme-root>/sources/<source-name>/` (référence système).
> Ne jamais écrire dans la couche synthétisée (`reference/` en générique, `<univers-root>/canon/` ni `<systeme-root>/canon/` en profil JDR) depuis ce prompt.

**For each distribution:**

1. Show preview:
   ```
   === [Category] → [Destination] ===
   Action: [create | append | merge]
   Size: X chars
   Preview (500 chars):
   ---
   [content preview]
   ---
   ```

2. IF file exists, show what will change:
   ```bash
   git -C "<path>" diff --no-index "<existing>" "<new>"
   ```

3. **WAIT FOR USER APPROVAL** per category

---

## Step 4: Write Files

For each approved distribution:

1. Ensure parent directory exists:
   ```bash
   # Python (cross-platform)
   python -c "from pathlib import Path; Path('<dir>').mkdir(parents=True, exist_ok=True)"
   ```

2. Write content using Write tool

3. Log action

---

## Step 5: Validate or Rollback

**Ask user:** "Valider toutes les modifications ? [Y/n/diff]"

### IF `Y` (validate):

```bash
# Un seul dépôt R — stage les destinations du profil actif.
# Générique : "_<target>/sources/<source-name>/" (+ .output-styles/.templates) et "<project_dir>/.toc/".
# Profil JDR (exemple ci-dessous) : split univers + système.
git -C "<R>" add \
  "_univers/<univers>/sources/<source-name>/" \
  "_univers/<univers>/.output-styles/" \
  "_univers/<univers>/.templates/" \
  "_systeme/sources/<source-name>/" \
  "<project_dir>/.toc/"
git -C "<R>" commit -m "Extract sources: <source-name>"

# Drop stash (no longer needed)
git -C "<R>" stash drop
```

### IF `n` (rollback):

```bash
git -C "<R>" checkout .
git -C "<R>" stash pop
```

→ All files restored to pre-extraction state

### IF `diff` (review changes):

```bash
git -C "<R>" diff
```

→ Show all changes, then ask again

---

## Step 6: Generate Report

```markdown
# Extraction Report: <source-name>

## Summary

- Source: [original PDF path]
- Project: [project path]
- Target (Univers): [target slug]
- Profile: [generic | jdr]
- Chunks processed: [N]
- Total characters: [X]

## Distribution (sources de référence brutes)

> Destinations montrées pour le **profil JDR** ; en **générique**, tout va sous `<target-root>/sources/<source-name>/`.

| Category | Sections | Chars | Destination | Action |
|----------|----------|-------|-------------|--------|
| Brut (fulltext) | — | Y | <univers-root>/sources/<source-name>/fulltext.md | created |
| Lore | X | Y | <univers-root>/sources/<source-name>/lore.md | created |
| Terminology | X | Y | <univers-root>/sources/<source-name>/terminology.md | created |
| Rules | X | Y | <systeme-root>/sources/<source-name>/rules.md | created |
| Style | X | Y | <univers-root>/.output-styles/... | created |
| Structure | X | Y | .toc/INDEX.md | created |
| Templates | X | Y | <univers-root>/.templates/... | appended |

## Git Commits

- `<R>`: [commit hash] "Extract sources: <source-name>"

## Coverage

- Extracted: X chars
- Total source: Y chars
- Coverage: XX%

## Files Created

1. `<path>` - [action]
2. ...

## Prochaines étapes

La ventilation vers la couche synthétisée est une étape **aval** (`extract-pdf` ne la fait jamais). En **profil JDR** :
- Lore → `ttrpg:lore-extract <univers-root>/sources/<source-name>/lore.md` pour ventiler vers `<univers-root>/canon/`
- Règles → `ttrpg:rules-keeper restructure <systeme-root>/sources/<source-name>/rules.md` pour ventiler vers `<systeme-root>/canon/`

En **générique** : les bundles sous `<target-root>/sources/<source-name>/` attendent la ventilation vers `<target-root>/reference/` par le skill aval adéquat.
```

---

## Step 7: Cleanup

**D'abord, préserver le texte brut** (assembler `raw/chunk_*.txt` en `fulltext.md` dans chaque `sources/<source-name>/` peuplé) :

```bash
# `roots` = les sources/<source-name>/ peuplés du profil actif.
# Générique : ['<target-root>/sources/<source-name>'].
# Profil JDR (exemple) : univers + système (système seulement si des règles ont été extraites).
python -c "
from pathlib import Path
base = Path('docs/extraction/<source-name>/raw')
chunks = sorted(base.glob('chunk_*.txt'))
full = '\n\n'.join(p.read_text(encoding='utf-8') for p in chunks)
header = '# <source-name> — TEXTE BRUT INTÉGRAL\n\n> Contenu d\'extraction brut (normalisé). Matériau de référence ; la synthèse vit dans la couche synthétisée (reference/ en générique, canon/ via ttrpg:lore-extract/ttrpg:rules-keeper en profil JDR).\n\n---\n\n'
for root in ['<univers-root>/sources/<source-name>', '<systeme-root>/sources/<source-name>']:
    d = Path(root)
    if d.exists():
        (d / 'fulltext.md').write_text(header + full, encoding='utf-8')
"
```

**Seulement ensuite, supprimer le dossier de travail (cross-platform) :**

```bash
# Python (works on Windows and Unix) — fulltext.md déjà écrit dans sources/
python -c "import shutil; shutil.rmtree('docs/extraction/<source-name>/chunks', ignore_errors=True)"
python -c "import shutil; shutil.rmtree('docs/extraction/<source-name>/raw', ignore_errors=True)"
python -c "import shutil; shutil.rmtree('docs/extraction/<source-name>/classified', ignore_errors=True)"
```

**Rename progress to archive:**

```bash
# Python (cross-platform)
python -c "from pathlib import Path; from datetime import date; Path('docs/extraction/<source-name>/progress.md').rename(f'docs/extraction/<source-name>/DONE-{date.today()}.md')"
```

---

## Final Message

```
Extraction complete!

Sources de référence créées :
- [list with paths under sources/]

Commit :
- <R>: [hash]

Archive: docs/extraction/<source-name>/DONE-YYYY-MM-DD.md

Prochaines étapes (aval — ventilation vers la couche synthétisée) :
  # Profil JDR :
  ttrpg:lore-extract <univers-root>/sources/<source-name>/lore.md
  ttrpg:rules-keeper restructure <systeme-root>/sources/<source-name>/rules.md
  # Générique : ventiler <target-root>/sources/<source-name>/ vers <target-root>/reference/

Pour supprimer l'archive:
  python -c "import shutil; shutil.rmtree('docs/extraction/<source-name>')"
```
