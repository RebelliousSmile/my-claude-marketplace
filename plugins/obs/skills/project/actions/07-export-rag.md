# 07 - Export RAG

Generate a RAG context file from the Obsidian project notes.

## Inputs

- `name` (required) - string, project name. Inferred from current folder if omitted; ask if ambiguous.
- `--dry-run` (optional) - display the output without writing the file
- `--challenge` (optional) - analyse source quality before generating (combinable with `--dry-run`)

## Outputs

File `Projets/<name>/project-notes.md` with 5 sections (unless `--dry-run`):

```markdown
---
name: project-notes
description: Contexte projet issu des notes Obsidian — généré par /export-rag
source: C:/Users/fxgui/Public/Notes/Pro/Projets/<name>/
date: <yyyy-mm-dd>
---

# Contexte projet — <name>

## Contexte
## Stack & architecture
## État du projet
## Points d'attention
## Snippets de référence
```

Empty sections are kept and marked `> ⚠️ Section vide — à compléter`.

## Process

1. Resolve `name` from `$ARGUMENTS` or current folder; ask if ambiguous.
2. If `--challenge`: analyse source files against these criteria and present a report before generating:
   - **Complétude** — critical sections filled? Empty placeholders reducing RAG value?
   - **Signal vs bruit** — redundant info across files? Overly generic content?
   - **Actionabilité** — decisions explained with rationale? Explicit constraints?
   - **Cohérence** — consistent info across files? Valid external links?
   If blockers are found, offer to fix the source files before continuing.
3. Read source files in order, skipping absent files:
   - `projet.md` — technical context, stack, decisions, access
   - `backlog.md` — task status
   - `snippets.md` — project-specific code memos
   Excluded: `memory.md`, `project-notes.md`, `commercial.md`.
4. Build the output using the structure above.
5. `--dry-run`: display content only. Otherwise write to `Projets/<name>/project-notes.md` and confirm the path.

## Test

`C:/Users/fxgui/Public/Notes/Pro/Projets/<name>/project-notes.md` exists on disk (unless `--dry-run`) and contains all 5 section headers.
