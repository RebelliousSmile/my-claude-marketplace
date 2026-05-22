# Audit

Audits memory files for quality, freshness, and contradictions across 10 criteria. Applies P1 auto-fixes directly; lists P2/P3 findings for manual review.

## Inputs

- `scope` (optional) - string: path override for memory files; defaults to `aidd_docs/memory/*.md` and `aidd_docs/memory/internal/*.md`

## Outputs

A filled audit report saved to `aidd_docs/tasks/audits/<yyyy>_<mm>_<dd>_audit_memory.md`, rendered from `@../assets/audit_memory.md`. P1 fixes are also applied in-place to the relevant memory files.

## Process

1. Resolve scope: run `ls -1 aidd_docs/memory/*.md aidd_docs/memory/internal/*.md` (or the override path). Run `wc -l` on each file. Build the file list.
2. Recount codebase entities by running targeted globs: stores (`store/*Store.js`), composables (`composables/**/*.js`), pages (`pages/**/*.vue`), components (`components/**/*.vue`), middlewares (`middleware/*.js`), contract tests (`tests/contracts/**/*.test.js`), e2e specs (`tests/e2e/**/*.spec.ts`). Record actual counts for use in P1 drift checks.
3. Read `CLAUDE.md` and locate the `<aidd_project_memory>` block. Cross-check every `@`-prefixed reference resolves to an existing file, and every root memory file in `aidd_docs/memory/` is listed. Note any gaps.
4. Read each memory file fully. Run all 10 audit criteria:
   - **P1-1 Broken refs**: every file path or `@`-reference cited in memory files resolves on disk.
   - **P1-2 Drifted counts**: entity counts stated in memory match the recount from step 2.
   - **P1-3 Drifted versions**: version numbers stated in memory match `package.json` or lock files.
   - **P1-4 CLAUDE.md sync**: every root memory file is listed in CLAUDE.md; all `@`-refs resolve.
   - **P2-5 Inter-file contradictions**: the same fact stated differently across two or more memory files.
   - **P2-6 Memory/rules duplication**: rules or constraints duplicated verbatim between memory and `.claude/` rules files.
   - **P2-7 Frontmatter**: every memory file has valid frontmatter (name, description fields present and non-empty).
   - **P2-8 LLM style**: prose is imperative, factual, and unambiguous — flag hedging language, passive voice, or undefined acronyms.
   - **P3-9 Normative vs archive**: memory files mixing current state with historical narrative that should be archived.
   - **P3-10 Token cost**: files exceeding 300 lines or 15 KB with no clear justification.
5. For each P1 finding: verify the issue on disk with high confidence, then apply the fix directly by editing the memory file. Log every edit in the Auto-fixes table (file, line, old value, new value).
6. For each P2/P3 finding: record in the report with `file:line`, current text, proposed change, and rationale. Do not modify the file.
7. Compute overall score out of 10: start at 10, subtract 1 per P1 finding cluster, 0.5 per P2 finding, 0.25 per P3 finding (minimum 0).
8. Save the filled report to `aidd_docs/tasks/audits/<yyyy>_<mm>_<dd>_audit_memory.md` using `@../assets/audit_memory.md`.

## Test

Invoke in a project with `aidd_docs/memory/`; verify `aidd_docs/tasks/audits/<date>_audit_memory.md` is created and contains P1/P2 summary tables with status indicators, a Recount log section, and a score.
