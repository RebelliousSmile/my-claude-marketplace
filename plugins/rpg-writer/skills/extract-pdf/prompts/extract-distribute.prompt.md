---
name: extract-distribute
description: Merge extracted content and distribute to reference sources/ destinations
argument-hint: <progress-file>
---

# Distribute Extracted Content

> **Frontière** : `extract-pdf` écrit uniquement dans `sources/` (jamais dans `canon/` ni `mj/`).
> Voir `@setup/references/vault-layout.md` pour la convention complète.

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
   - `Project` → project path (`<jeu>/ecrits/<projet>`)
   - `Univers` → universe slug

2. Resolve paths:
   - `<jeu>` = premier segment sous `<vault>` (`C:/Users/fxgui/Public/Notes/Perso/JDR/`), déduit du champ `Project`
   - `<univers-root>` = `<jeu>/univers/<univers>/`
   - `<systeme-root>` = `<jeu>/systeme/`

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

**Cross-platform git commands:**

```bash
# Stash universe changes
git -C "<univers-root>" stash push -m "pre-extraction-<source-name>"

# Stash system changes (if different repo)
git -C "<systeme-root>" stash push -m "pre-extraction-<source-name>"

# Stash project changes (if different repo)
git -C "<project>" stash push -m "pre-extraction-<source-name>"
```

Note: `git -C <path>` works on both Windows and Unix.

Store stash state for potential rollback.

---

## Step 3: Preview Distributions

For each category with content:

| Classified | Destination | Action |
|------------|-------------|--------|
| `raw/chunk_*.txt` (assemblés) | `<univers-root>/sources/<source-name>/fulltext.md` (+ `<systeme-root>/…` si règles) | create — brut intégral, **ne jamais jeter** |
| `lore*.md` | `<univers-root>/sources/<source-name>/lore.md` | create/append |
| `terminology*.md` | `<univers-root>/sources/<source-name>/terminology.md` | create/merge |
| `rules*.md` | `<systeme-root>/sources/<source-name>/rules.md` | create/append |
| `style*.md` | `<univers-root>/.output-styles/<univers>-<source-name>.md` | create |
| `structure*.md` | `<project>/.toc/INDEX.md` | create/update |
| `templates*.md` | `<univers-root>/.templates/latex-patterns.md` | append |

> Lore et terminologie → `<univers-root>/sources/<source-name>/` (référence univers).
> Règles → `<systeme-root>/sources/<source-name>/` (référence système).
> Style et templates → artefacts de commodité sous `<univers-root>`.
> Ne jamais écrire dans `<univers-root>/.docs/canon/` ni `<systeme-root>/canon/` depuis ce prompt.

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
# Commit universe reference sources
git -C "<univers-root>" add "sources/<source-name>/" ".output-styles/" ".templates/"
git -C "<univers-root>" commit -m "Extract sources: <source-name> (univers)"

# Commit system reference sources
git -C "<systeme-root>" add "sources/<source-name>/"
git -C "<systeme-root>" commit -m "Extract sources: <source-name> (systeme)"

# Commit project changes (.toc)
git -C "<project>" add .
git -C "<project>" commit -m "Extract sources: <source-name>"

# Drop stashes (no longer needed)
git -C "<univers-root>" stash drop
git -C "<systeme-root>" stash drop
git -C "<project>" stash drop
```

### IF `n` (rollback):

```bash
# Restore universe
git -C "<univers-root>" checkout .
git -C "<univers-root>" stash pop

# Restore system
git -C "<systeme-root>" checkout .
git -C "<systeme-root>" stash pop

# Restore project
git -C "<project>" checkout .
git -C "<project>" stash pop
```

→ All files restored to pre-extraction state

### IF `diff` (review changes):

```bash
git -C "<univers-root>" diff
git -C "<systeme-root>" diff
git -C "<project>" diff
```

→ Show all changes, then ask again

---

## Step 6: Generate Report

```markdown
# Extraction Report: <source-name>

## Summary

- Source: [original PDF path]
- Project: [project path]
- Univers: [universe name]
- Chunks processed: [N]
- Total characters: [X]

## Distribution (sources de référence)

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

- `<univers-root>`: [commit hash] "Extract sources: <source-name> (univers)"
- `<systeme-root>`: [commit hash] "Extract sources: <source-name> (systeme)"
- `<project>`: [commit hash] "Extract sources: <source-name>"

## Coverage

- Extracted: X chars
- Total source: Y chars
- Coverage: XX%

## Files Created

1. `<path>` - [action]
2. ...

## Prochaines étapes

- Lore → `lore-extract <univers-root>/sources/<source-name>/lore.md` pour ventiler vers `<univers-root>/.docs/canon/`
- Règles → `rules-keeper restructure <systeme-root>/sources/<source-name>/rules.md` pour ventiler vers `<systeme-root>/canon/`
```

---

## Step 7: Cleanup

**D'abord, préserver le texte brut** (assembler `raw/chunk_*.txt` en `fulltext.md` dans chaque `sources/<source-name>/` peuplé) :

```bash
python -c "
from pathlib import Path
base = Path('docs/extraction/<source-name>/raw')
chunks = sorted(base.glob('chunk_*.txt'))
full = '\n\n'.join(p.read_text(encoding='utf-8') for p in chunks)
header = '# <source-name> — TEXTE BRUT INTÉGRAL\n\n> Contenu d\'extraction brut (normalisé). Matériau de référence ; la synthèse est dans canon/ (via lore-extract/rules-keeper).\n\n---\n\n'
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

Commits :
- <univers-root>: [hash]
- <systeme-root>: [hash]
- <project>: [hash]

Archive: docs/extraction/<source-name>/DONE-YYYY-MM-DD.md

Prochaines étapes :
  lore-extract <univers-root>/sources/<source-name>/lore.md
  rules-keeper restructure <systeme-root>/sources/<source-name>/rules.md

Pour supprimer l'archive:
  python -c "import shutil; shutil.rmtree('docs/extraction/<source-name>')"
```
