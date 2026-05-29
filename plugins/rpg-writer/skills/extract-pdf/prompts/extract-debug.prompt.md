---
name: extract-debug
description: Diagnose and fix extraction problems
argument-hint: <progress-file>
---

# Extract Debug Prompt

## Context

### Progress File

```markdown
@$PROGRESS
```

## Goal

Diagnose extraction problems and suggest fixes.

---

## Step 1: Check Environment

### 1.1 Extraction Tools

```bash
python -c "import shutil; tools = {'pdftotext': shutil.which('pdftotext'), 'tesseract': shutil.which('tesseract')}; print(tools)"
```

```bash
python -c "
try:
    import pdfplumber
    print('[OK] pdfplumber')
except: print('[MISSING] pdfplumber')
try:
    import PyPDF2
    print('[OK] PyPDF2')
except: print('[MISSING] PyPDF2')
"
```

### 1.2 Git Status

```bash
git -C "<univers>" status --short
git -C "<project>" status --short
```

### 1.3 Stash Status

```bash
git -C "<univers>" stash list
git -C "<project>" stash list
```

---

## Step 2: Check Progress File

### 2.1 Parse Status

- Total chunks: ?
- Pending: ?
- Done: ?
- Failed: ?

### 2.2 Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| All pending | Setup incomplete | Re-run Phase A |
| Some failed | Extraction error | Use --retry |
| progress.md missing | Deleted or moved | Re-run from scratch |
| Stale stash | Interrupted distribution | `git stash drop` |

---

## Step 3: Check Chunks

### 3.1 Verify Chunk Files Exist

```bash
python -c "
from pathlib import Path
chunks = list(Path('docs/extraction/<source-name>/chunks').glob('*.pdf'))
print(f'Found {len(chunks)} chunk files')
for c in chunks: print(f'  {c.name}: {c.stat().st_size} bytes')
"
```

### 3.2 Verify Raw Text Exists

```bash
python -c "
from pathlib import Path
raw = list(Path('docs/extraction/<source-name>/raw').glob('*.txt'))
print(f'Found {len(raw)} raw text files')
for r in raw: print(f'  {r.name}: {r.stat().st_size} bytes')
"
```

### 3.3 Test Extraction on Failed Chunk

```bash
pdftotext -layout "docs/extraction/<source-name>/chunks/chunk_XX.pdf" - | head -20
```

IF garbled:
```bash
tesseract "docs/extraction/<source-name>/chunks/chunk_XX.pdf" stdout -l fra | head -20
```

---

## Step 4: Check Classified Content

### 4.1 List Classified Files

```bash
python -c "
from pathlib import Path
classified = list(Path('docs/extraction/<source-name>/classified').glob('*.md'))
for c in classified:
    content = c.read_text(encoding='utf-8')
    chunks = content.count('chunk:')
    print(f'{c.name}: {len(content)} chars, {chunks} chunks')
"
```

### 4.2 Check for Duplicates

```bash
python -c "
from pathlib import Path
import re
for f in Path('docs/extraction/<source-name>/classified').glob('*.md'):
    content = f.read_text(encoding='utf-8')
    sections = re.findall(r'^## .+$', content, re.MULTILINE)
    unique = set(sections)
    if len(sections) != len(unique):
        print(f'{f.name}: {len(sections) - len(unique)} duplicates')
"
```

---

## Step 5: Repair Actions

### 5.1 Reset Failed Chunk to Pending

Edit `progress.md`:
- Change `failed` → `pending`
- Clear date

### 5.2 Force Re-extract a Chunk

```bash
# Delete raw text
python -c "from pathlib import Path; Path('docs/extraction/<source-name>/raw/chunk_XX.txt').unlink(missing_ok=True)"

# Reset status in progress.md
# Then re-run extraction
```

### 5.3 Recover from Stale Stash

```bash
# View stash content
git -C "<univers>" stash show -p

# Drop if not needed
git -C "<univers>" stash drop
```

### 5.4 Clean and Restart

```bash
python -c "import shutil; shutil.rmtree('docs/extraction/<source-name>', ignore_errors=True)"
```

Then re-run:
```
python scripts/extract-pdf.py <project> <source.pdf>
```

---

## Step 6: Report

```markdown
# Extraction Debug Report

## Environment

- pdftotext: [available/missing]
- tesseract: [available/missing]
- pdfplumber: [available/missing]
- PyPDF2: [available/missing]

## Progress Status

- Chunks: X done, Y pending, Z failed
- Last activity: [date]

## Issues Found

1. [Issue description]
   - Cause: [...]
   - Fix: [...]

## Recommended Actions

1. [Action]
2. [Action]
```
