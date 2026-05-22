# Memory

Synthesizes all project memory files and decision records into a dated export document.

## Inputs

- `scope` (optional) - string: override path to memory files; defaults to `aidd_docs/memory/`

## Outputs

A filled memory export saved to `aidd_docs/tasks/memory/<yyyy>_<mm>_<dd>_project_memory.md`, rendered from `@../assets/project_memory.md`.

## Process

1. Run `mkdir -p aidd_docs/tasks/memory` to ensure the output directory exists.
2. Find and measure all memory files: run `find aidd_docs/memory -type f -name "*.md"`, then `wc -l` on each file and `du -b` to get sizes in bytes. Flag any file exceeding 300 lines or 15 KB as oversized.
3. Find dedicated decision files: run `find aidd_docs docs -type f \( -name "DEC-*.md" -o -name "decision-*.md" -o -name "adr-*.md" \)`, and also check `aidd_docs/decisions/`, `aidd_docs/adr/`, `docs/adr/` if present.
4. Scan inline decisions in all memory files: grep for `## Decision`, `## Decisions`, `DEC-\d+`, `ADR-\d+` patterns.
5. Read each memory file and write a synthesis of ≤6 lines covering: purpose, key facts, and last update signal.
6. For each discovered decision (dedicated file or inline): extract ID, title, status (Accepted/Deprecated/Superseded), the one-line decision, and the one-line rationale.
7. Compute size metrics: total file count, total lines, total size in KB, oversized file count, decision count. Apply health verdict: ✅ Healthy if no oversized files and all counts reasonable; ⚠️ Approaching limits if 1–2 oversized files; ❌ Oversized if >2 oversized files or total >50 KB.
8. Fill `@../assets/project_memory.md` with all gathered data and save the result to `aidd_docs/tasks/memory/<yyyy>_<mm>_<dd>_project_memory.md`.

## Test

Invoke in a project that has `aidd_docs/memory/` with at least one `.md` file; verify `aidd_docs/tasks/memory/<date>_project_memory.md` is created and contains a populated Footprint table and at least one Memory Files entry.
