---
name: audit-memory
description: Memory files audit report template
---
# Memory Audit — {{yyyy_mm_dd}}
- Scope: {{scope}}
- Files audited: {{file_count}}
- Score: {{score}}/10
## Summary
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
| 8 | LLM style | 🟢/🟡/🔴 | N |
## Auto-fixes P1 applied
| File | Line | Old | New |
|------|------|-----|-----|
## P2 findings (manual)
### {{file}}:{{line}} — {{criterion}}
- **Current:** `{{text}}`
- **Proposed:** {{change}}
## P3 findings (structural)
### {{file}} — {{criterion}}
- **Action:** delete | split | reformulate
## Recount log
| Entity | Glob | Actual | Memory claim | Drift |
|--------|------|--------|--------------|-------|
