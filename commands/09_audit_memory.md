---
name: 'aidd:09:audit_memory'
description: 'Audit project memory files for quality, freshness, contradictions and apply trivial fact fixes'
argument-hint: 'Optional scope override (default: aidd_docs/memory/ + aidd_docs/memory/internal/)'
---

# Memory Files Audit Prompt

## Resources

### Memory style rules

```markdown
@.claude/rules/01-standards/1-file-language-and-style.md
@.claude/rules/01-standards/1-normative-vs-archive.md
```

### Output template

```markdown
@aidd_docs/templates/dev/audit_memory.md
```

## Goal

Audit memory files (`aidd_docs/memory/**`) against ten explicit criteria, generate a report, and auto-apply Priority 1 trivial fact fixes only.

Scope: "$ARGUMENTS" (default: `aidd_docs/memory/*.md` + `aidd_docs/memory/internal/*.md`)

## Rules

- Never modify a file without high confidence the fact is wrong (P1 = trivial verifiable rewrites only)
- Never auto-fix anything beyond P1 — P2/P3 stay manual, listed in the report
- Never invent claims: every finding cites a file path and a line number
- Verify every cited path/script/file with Glob or Test-Path before flagging it broken
- Recount actual files before flagging a count drift; tolerate "X+" approximations
- Never duplicate content between memory and rules: rule wins, memory points to it
- File deletion is always P3 manual — never auto-applied, even when the rationale seems obvious

## Audit criteria

Each criterion below maps to a fixed priority. The priority determines whether the finding is auto-fixed (P1) or only reported (P2, P3).

| # | Criterion | Priority | Reason |
|---|-----------|----------|--------|
| 1 | Broken refs (paths, scripts, files cited but absent on disk) | P1 | Single-line rewrite, verifiable on disk |
| 2 | Drifted counts (stores, composables, pages, components, middlewares, contracts, e2e) | P1 | Single-number rewrite, verifiable via glob |
| 3 | Drifted versions (Node, framework, library vs `package.json` / `engines`) | P1 | Single-string rewrite, verifiable via file read |
| 4 | CLAUDE.md sync (every `@`-ref resolves; every root memory file is listed) | P1 | Add/remove a single line in `<aidd_project_memory>` |
| 5 | Inter-file contradictions (same fact described differently across files or vs rules) | P2 | Requires rewrite or human decision |
| 6 | Memory/rules duplication (content already in `.claude/rules/` repeated in memory) | P2 | Requires deciding which side to keep + rewrite |
| 7 | Frontmatter (presence and consistency of `name` + `description`) | P2 | Metadata add/fix, often multi-line |
| 8 | LLM-consumed style (English, bullets only, 3-15 words per bullet) | P2 | Reformulation, judgement-dependent |
| 9 | Normative vs archive (postmortems, dated audits, completed migrations to delete) | P3 | File-level deletion or major reformulation |
| 10 | Token cost (files > 300 lines or > 15 KB) | P3 | File split or major restructure |

## Priority taxonomy

- **P1 (auto-fix)** — trivial verifiable single-line rewrite. Must verify on disk before applying.
- **P2 (manual fix)** — factual but requires rewrite or human decision: contradiction, duplication, missing/wrong frontmatter, style migration.
- **P3 (structural, manual)** — file-level action: delete obsolete file, split oversized file, reformulate dated audit. **Never auto-applied** — listed in the report, executed by the user.

## Process steps

1. Resolve scope, list memory files, collect size + last-modified + frontmatter:
   - `! ls -1 aidd_docs/memory/*.md aidd_docs/memory/internal/*.md 2>/dev/null`
   - `! wc -l aidd_docs/memory/*.md aidd_docs/memory/internal/*.md 2>/dev/null`
2. Recount actual codebase entities (each one mandatory): stores (`store/*Store.js`), composables (`composables/**/*.js` minus `*.test.js`), pages (`pages/**/*.vue` excluding `_archive/`), components (`components/**/*.vue`), middlewares (`middleware/*.js`), contract tests (`tests/contracts/**/*.test.js`), e2e specs (`tests/e2e/**/*.spec.ts`). Keep numbers ready to cross-check claims.
3. Read `CLAUDE.md` `<aidd_project_memory>` block. Cross-check: every `@`-ref resolves on disk; every file in `aidd_docs/memory/*.md` (root level only) appears in the block.
4. Read each memory file fully (no skim, even files < 30 lines need explicit verdict). Run the 10 criteria, classify findings P1 / P2 / P3 per the table above.
5. For each P1 finding: verify on disk, then `Edit` the memory file (or `CLAUDE.md` for orphan @-refs) with the corrected value. Log every edit in the report (file, line, old → new).
6. For P2/P3: list in report with file path, line number, current text, proposed change, rationale. Never edit.
7. Save report to `aidd_docs/tasks/audits/<yyyy>_<mm>_<dd>_audit_memory.md` following the structure in the output template.
