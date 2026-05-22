---
name: foresee
description: Prospective analysis of documents, code, and dependencies — surfaces medium-term issues invisible to tests and linters, scores the target on action-specific dimensions, and tracks issue persistence across runs. Triggers on "foresee this plan", "what issues might arise from", "analyze this for future problems", "prospective analysis", or "/foresee <target> [--discuss | --plan]". Do NOT use for running test suites, implementing features, writing code, or performing code review against a style guide.
model: opus
---

# Foresee

Analyzes a target artifact prospectively to surface medium-term issues that tests and linters cannot catch. Scores three action-specific dimensions, lists improvements ranked by impact, and compares with previous runs on the same target when available.

## Available actions

| #  | Action          | Role                                                           | Input                                        |
|----|-----------------|----------------------------------------------------------------|----------------------------------------------|
| 01 | `analyze-doc`   | Score and surface issues in documents (plans, skills, rules, brainstorms, issues) | Path to document, or issue number |
| 02 | `analyze-code`  | Score and surface issues in code files, modules, or directories | File path or directory path                 |
| 03 | `analyze-dep`   | Score and surface risk in a package or all project dependencies | Package name, or "package.json" / manifest  |

## Default flow

Dispatch on target type:
- `.md` / `.markdown` path, issue number (`#N`), or document-related trigger → `analyze-doc`
- Code file extension (`.ts`, `.js`, `.vue`, `.php`, `.rs`, `.py`, etc.) or directory path → `analyze-code`
- Package name or dependency manifest trigger → `analyze-dep`

## Flags (all actions)

- `--discuss`: present each finding interactively and wait for response — do not create any file
- `--plan`: after inline output, create a correction plan in `aidd_docs/tasks/`
- Default (no flag): inline output only

## Transversal rules

- Read all adjacent context before scoring — never score in isolation. See `@../assets/context-map.md`.
- Every improvement item must carry a severity label: 🔴 Will break, 🟡 Will degrade, 🟢 Latent debt.
- Before scoring, check `aidd_docs/foresee/` for a prior run on the same target. If found, classify each improvement as ✅ Resolved, ⚠️ Persistent, or 🆕 New.
- Every run writes its output to `aidd_docs/foresee/YYYY-MM-DD-<slug>.md`.
- Scores must include a one-line justification each.
