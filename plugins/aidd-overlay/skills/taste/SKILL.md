---
name: taste
description: Detects obsolete content in documents and source code. assess-doc: extracts and verifies claims in .md files against the codebase (including relative Markdown links), scan mode groups findings by root cause and produces an ordered fix plan (/taste with no argument). assess-code: detects deprecated imports, broken relative imports (Detector E), removed function calls, rule violations, and stale TODO/FIXME comments in code files. Triggers on "is this doc outdated", "taste this file", "/taste <path>", "/taste" (scan mode), "check this code for obsolete patterns", "are there broken imports". Do NOT use for creating files, generating code, or running tests.
model: haiku
---

# Taste

Assesses documents and source code for obsolescence. Reads the target, extracts verifiable signals, cross-references them against the live codebase and active rules, and returns a verdict with concrete suggested actions.

## Available actions

| #  | Action        | Role                                                               | Input                              |
|----|---------------|--------------------------------------------------------------------|------------------------------------|
| 01 | `assess-doc`  | Verify claims in a .md file (incl. relative Markdown links); scan mode groups findings by root cause and produces an ordered fix plan | File path (optional — scan if omitted) |
| 02 | `assess-code` | Detect obsolete imports, broken relative imports (E), removed symbols, rule violations, stale TODOs | File or directory path (required)  |

## Default flow

Dispatch on file extension (or absence of argument):
- No argument OR `.md` / `.markdown` path → `assess-doc`
- Any code file extension (`.ts`, `.js`, `.vue`, `.php`, `.py`, etc.) → `assess-code`

## Harvest integration

`harvest` invokes taste as a dedicated phase via `@../taste/SKILL.md`. Taste returns aggregated metrics (N docs obsolètes, N docs partiels, N code findings, N stale TODOs) for inclusion in the harvest final report.

## Transversal rules

- Extract only claims that are explicitly stated — never infer.
- Skip issue-status checks when no tracker CLI is detectable.
- Never modify any file during assessment.
- If `.claude/rules/` is absent in the project, skip the rule-violation check silently.
- Verdicts for docs: **Current** (≥80% claims match), **Partial** (20–79%), **Obsolete** (<20%), **Superseded** (≥80% accurate but decision overtaken by events — see `@assets/decision-doc.md`).
- In scan mode, process files oldest-first (modification date ascending).
