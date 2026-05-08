---
name: audit-memory
description: Memory files audit report template
argument-hint: N/A
---

# Memory Audit — {{yyyy_mm_dd}}

- Scope: {{scope}}
- Files audited: {{file_count}}
- Score: {{score}}/10
- Confidence: {{confidence}}

## Synthèse

One-line verdict per criterion grouped by priority. Use 🟢 (clean) / 🟡 (minor) / 🔴 (blocking).

### P1 — auto-fix

| # | Criterion | Status | Findings |
|---|-----------|--------|----------|
| 1 | Broken refs | 🟢/🟡/🔴 | N |
| 2 | Drifted counts | 🟢/🟡/🔴 | N |
| 3 | Drifted versions | 🟢/🟡/🔴 | N |
| 4 | CLAUDE.md sync | 🟢/🟡/🔴 | N |

### P2 — manual fix

| # | Criterion | Status | Findings |
|---|-----------|--------|----------|
| 5 | Inter-file contradictions | 🟢/🟡/🔴 | N |
| 6 | Memory/rules duplication | 🟢/🟡/🔴 | N |
| 7 | Frontmatter | 🟢/🟡/🔴 | N |
| 8 | LLM-consumed style | 🟢/🟡/🔴 | N |

### P3 — structural

| # | Criterion | Status | Findings |
|---|-----------|--------|----------|
| 9 | Normative vs archive | 🟢/🟡/🔴 | N |
| 10 | Token cost | 🟢/🟡/🔴 | N |

## Auto-fixes P1 appliqués

Every edit applied automatically during the audit. One row per change.

| File | Line | Criterion | Old | New | Verified via |
|------|------|-----------|-----|-----|--------------|
| `aidd_docs/memory/example.md` | 42 | Drifted counts | `24 contract tests` | `27 contract tests` | `glob tests/contracts/**/*.test.js` |

## Constats P2 (manual fix required)

For each finding: file, line, current text, proposed change, rationale. Never auto-applied.

### {{file_path}}:{{line}} — {{criterion}}

- **Current:** `{{quoted current text}}`
- **Proposed:** {{proposed change}}
- **Rationale:** {{why this matters — link to rule or contradicting file}}

## Constats P3 (structural, manual)

File-level actions: deletion, split, major reformulation. Never auto-applied.

### {{file_path}} — {{criterion}}

- **Action:** delete | split | reformulate
- **Rationale:** {{why this file no longer fits — dated audit, oversized, completed migration}}
- **Successor (if any):** {{path to rule or replacement file}}

## Recount log

Numbers used to validate count drift findings. Run during process step 2.

| Entity | Glob | Actual | Memory claim | Drift |
|--------|------|--------|--------------|-------|
| stores | `store/*Store.js` | N | N | ✅/❌ |
| composables | `composables/**/*.js` | N | N | ✅/❌ |
| pages | `pages/**/*.vue` | N | N | ✅/❌ |
| components | `components/**/*.vue` | N | N | ✅/❌ |
| middlewares | `middleware/*.js` | N | N | ✅/❌ |
| contract tests | `tests/contracts/**/*.test.js` | N | N | ✅/❌ |
| e2e specs | `tests/e2e/**/*.spec.ts` | N | N | ✅/❌ |

## CLAUDE.md sync log

Cross-check between `<aidd_project_memory>` block and `aidd_docs/memory/*.md` root files.

- Orphan `@`-refs (listed but file missing): {{list or "none"}}
- Unlisted root memory files (file exists but not in block): {{list or "none"}}

## Final notes

- **Score breakdown:** {{rationale for the score}}
- **Follow-up:** {{next audit suggested date or trigger}}
- **Additional notes:** {{anything else}}
