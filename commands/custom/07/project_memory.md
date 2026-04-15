---
name: 'custom:07:project_memory'
description: 'Synthesize project memory files and decisions into a single exportable markdown'
---

# Project Memory Export

## Resources

### Decision template

```markdown
@aidd_docs/templates/dev/decision.md
```

### Output template

```markdown
@aidd_docs/templates/custom/project_memory.md
```

## Goal

Produce a single markdown document synthesizing all project memory files and recorded decisions, with size metrics to detect when memory becomes too large.

## Rules

- Source of truth is `aidd_docs/memory/` (project-created)
- Every memory file must be summarized in ≤6 lines — never copy raw content
- Every decision must be summarized as: ID, title, status, 1-line decision, 1-line rationale
- Decisions live in dedicated files (`DEC-*.md`, `adr-*.md`, `decision-*.md`) AND as inline sections inside memory files (`## Decision`, `## Decisions`, `DEC-XXX` tables) — both must be captured
- Flag any memory file over 300 lines or 15 KB as "oversized" (15 KB ≈ 3-4k tokens, ~2% of a 200k context window)
- Report total memory footprint (files, lines, bytes)
- Never invent decisions: if none found, report "no decisions recorded"

## Process steps

1. Prepare output directory: `! mkdir -p aidd_docs/tasks/memory`
2. Scan memory files:
   - `! find aidd_docs/memory -type f -name "*.md" -not -name ".gitkeep"`
   - `! wc -l aidd_docs/memory/*.md aidd_docs/memory/internal/*.md aidd_docs/memory/external/*.md 2>/dev/null`
   - `! du -b aidd_docs/memory/*.md aidd_docs/memory/internal/*.md aidd_docs/memory/external/*.md 2>/dev/null`
3. Scan dedicated decision files:
   - `! find aidd_docs docs -type f \( -name "DEC-*.md" -o -name "decision-*.md" -o -name "adr-*.md" \) 2>/dev/null`
   - Also check `aidd_docs/decisions/`, `aidd_docs/adr/`, `docs/adr/`
4. Scan inline decisions inside memory files: grep for `## Decision`, `## Decisions`, `DEC-\d+`, `ADR-\d+` patterns
5. Read each memory file and produce a ≤6 line synthesis: purpose, key facts, last update if datable
6. For each decision (dedicated file or inline), extract: ID, title, status, decision, rationale, consequences
7. Compute size metrics, derive verdict (✅ healthy / ⚠️ approaching / ❌ oversized), render report using template, save to `aidd_docs/tasks/memory/<yyyy>_<mm>_<dd>_project_memory.md`
