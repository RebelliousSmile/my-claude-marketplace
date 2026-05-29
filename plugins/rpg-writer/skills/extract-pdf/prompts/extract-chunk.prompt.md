---
name: extract-chunk
description: Resume extraction of a single PDF chunk
argument-hint: <progress-file> [chunk-number]
---

# Extract Single Chunk

## Context

### Progress File

```markdown
@$PROGRESS
```

## Goal

Extract and classify content from chunk $CHUNK (or next pending chunk).

---

## Step 0: Load Context

1. Parse progress file header:
   - `Univers` → classification destinations
   - `Project` → for reference
   - `Tools Available` → extraction method

2. IF `$CHUNK` specified → use that chunk
3. ELSE → find first chunk with status `pending`

4. **Error conditions:**
   - No pending chunks → suggest Phase C (distribution)
   - progress.md unreadable → STOP, corrupted state

---

## Step 1: Extract Text

Identify chunk file:
```
docs/extraction/<source-name>/chunks/chunk_XX.pdf
```

Extract with available tool:
```bash
pdftotext -layout "docs/extraction/<source-name>/chunks/chunk_XX.pdf" -
```

IF garbled (>30% non-printable):
```bash
tesseract "docs/extraction/<source-name>/chunks/chunk_XX.pdf" stdout -l fra
```

Save raw text:
```bash
# Write to: docs/extraction/<source-name>/raw/chunk_XX.txt
```

---

## Step 2: Preview

1. Show first 500 chars of extracted text
2. Show detected sections (headers, separators)
3. Ask: "Continuer la classification ? [Y/n]"

IF `n` → note user feedback, adjust approach

---

## Step 3: Classify Content

Tag each section:

| Category | Patterns | File |
|----------|----------|------|
| Lore | histoire, monde, dates, lieux | `classified/lore.md` |
| Terminology | glossaire, definition, terme=explication | `classified/terminology.md` |
| Style | ton, ecriture, eviter, privilegier | `classified/style.md` |
| Rules | regle, jet, 2d6, stats, modificateur | `classified/rules.md` |
| Structure | chapitre, partie, sommaire, TOC | `classified/structure.md` |
| Templates | \begin, \newcommand, macros LaTeX | `classified/templates.md` |

**Append with YAML marker:**
```markdown
---
chunk: XX
pages: N-M
extracted: YYYY-MM-DD
---

[content here]

---
```

**Size check:**
- IF file > 30000 chars after append → split into `lore-1.md`, `lore-2.md`, etc.

---

## Step 4: Update Progress

Edit `progress.md`:
- Change chunk status: `pending` → `done`
- Add today's date
- Note character count extracted

---

## Step 5: Summary & End

```
Chunk XX termine.
- Sections classifiees: Y
- Caracteres extraits: Z
- Fichiers modifies: [list]

Progression: X/N chunks (XX%)
```

IF more pending chunks:
```
Prochain: chunk_YY
Commande: Reprendre: docs/extraction/<source-name>/progress.md
```

IF all chunks done:
```
Tous les chunks traites!
Lancer la distribution:
Reprendre: docs/extraction/<source-name>/progress.md (Phase C)
```

**END SESSION**
