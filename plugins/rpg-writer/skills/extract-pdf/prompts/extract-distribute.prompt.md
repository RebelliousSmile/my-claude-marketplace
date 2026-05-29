---
name: extract-distribute
description: Merge extracted content and distribute to project destinations
argument-hint: <progress-file>
---

# Distribute Extracted Content

## Context

### Progress File

```markdown
@$PROGRESS
```

## Goal

Merge all classified content, distribute to destinations, with git stash rollback.

---

## Step 0: Load Context & Validate

1. Parse progress file:
   - `Source` → original PDF path
   - `Project` → project path
   - `Univers` → destination universe

2. Verify ALL chunks have status `done`
   - IF any `pending` → STOP, list missing chunks

3. List files in `classified/`:
   ```bash
   dir /b "docs\extraction\<source-name>\classified"   # Windows
   ls "docs/extraction/<source-name>/classified"       # Unix
   ```

4. Calculate total size:
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
git -C "<univers>" stash push -m "pre-extraction-<source-name>"

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
| `lore*.md` | `<univers>/.docs/UNIVERS.md` | append |
| `terminology*.md` | `<univers>/.docs/terminologie.md` | merge |
| `style*.md` | `<univers>/.output-styles/<univers>-<source>.md` | create |
| `rules*.md` | `docs/rules-files/<source>.md` | create |
| `structure*.md` | `<project>/toc.md` | create/update |
| `templates*.md` | `<univers>/.templates/latex-patterns.md` | append |

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
# Commit universe changes
git -C "<univers>" add .docs/ .output-styles/ .templates/
git -C "<univers>" commit -m "Extract: <source-name>"

# Commit project changes
git -C "<project>" add .
git -C "<project>" commit -m "Extract: <source-name>"

# Drop stashes (no longer needed)
git -C "<univers>" stash drop
git -C "<project>" stash drop
```

### IF `n` (rollback):

```bash
# Restore universe
git -C "<univers>" checkout .
git -C "<univers>" stash pop

# Restore project
git -C "<project>" checkout .
git -C "<project>" stash pop
```

→ All files restored to pre-extraction state

### IF `diff` (review changes):

```bash
git -C "<univers>" diff
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

## Distribution

| Category | Sections | Chars | Destination | Action |
|----------|----------|-------|-------------|--------|
| Lore | X | Y | .docs/UNIVERS.md | appended |
| Terminology | X | Y | .docs/terminologie.md | merged |
| Style | X | Y | .output-styles/... | created |
| Rules | X | Y | docs/rules-files/... | created |
| Structure | X | Y | toc.md | created |
| Templates | X | Y | .templates/... | appended |

## Git Commits

- `<univers>`: [commit hash] "Extract: <source-name>"
- `<project>`: [commit hash] "Extract: <source-name>"

## Coverage

- Extracted: X chars
- Total source: Y chars
- Coverage: XX%

## Files Modified

1. `<path>` - [action]
2. ...
```

---

## Step 7: Cleanup

**Remove extraction workspace (cross-platform):**

```bash
# Python (works on Windows and Unix)
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

Fichiers crees/modifies:
- [list with paths]

Commits:
- <univers>: [hash]
- <project>: [hash]

Archive: docs/extraction/<source-name>/DONE-YYYY-MM-DD.md

Pour supprimer l'archive:
  python -c "import shutil; shutil.rmtree('docs/extraction/<source-name>')"
```
