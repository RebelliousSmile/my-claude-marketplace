---
name: review
model: opus
description: Quality review pipeline for writing chapters — persona-based qualitative analysis (comment) and technical correction (doctor). Use when evaluating a written chapter through reader personas, applying grammar/typography/terminology corrections, or preparing triage decisions (rewrite vs patch). Do NOT use for code review — use `aidd-dev:review` instead; do NOT use for rewriting chapters — use `write --feedback` instead.
---

# Review

Two-stage review pipeline for narrative chapters:
1. **Comment** — evaluates the chapter through reader personas, scores engagement/clarity/immersion/satisfaction on /20, and produces a structured 3-section output routing to doctor or rewrite.
2. **Doctor** — applies technical corrections (French grammar, typography, terminology, formatting, content enrichments) guided by the output-style.

Run `comment` first to identify what needs fixing, then `doctor` to apply patchable corrections. If ≥2 personas are capped at ≤11/20 by structural issues, route to `write --feedback` instead.

## Available actions

| #   | Action    | Role                                                               | Input                                             |
| --- | --------- | ------------------------------------------------------------------ | ------------------------------------------------- |
| 01  | `comment` | Persona-based chapter evaluation with scoring and triage routing   | chapter file [persona-ids…] [--all]              |
| 02  | `doctor`  | Technical corrections: grammar, typography, terminology, enrichments | chapter file [--remarks "notes" or file] [--dry-run] |

## Default flow

`01 → 02` (standard pipeline). `02` alone if corrections are known. After `02`, optionally return to `01` (max 3 iterations).

Trigger-to-action mapping:
- "review chapter", "evaluate chapter", "persona feedback", "comment on chapter", "reader analysis" → `comment`
- "doctor chapter", "fix chapter", "correct chapter", "apply corrections", "technical review" → `doctor`

## Transversal rules

- `comment`: embody each persona fully; run mandatory cross-reference check (stats vs pj.md) before scoring; run redundancy check (chapters 02+); complete craft checklist per chapter type; run devil's advocate (3 weaknesses per persona after scoring).
- `doctor`: preserve original meaning and narrative voice; never use personas (that is `comment`'s role); log ALL corrections to `.wip/changelog/chapitre<NN>-changelog.md`.
- Corrections priority: 🔴 Critical (grammar, orthography, terminology) → 🟡 Important (typography, Markdown format) → 🟢 Optional (style, flow).
- Doctor applies ALL priority levels by default; the priorities appear in the report, not as filters.
- Routing from `comment` to rewrite: if ≥2 personas scored ≤11/20 on structural must-haves → `write --feedback`.

## References

- `references/typographie.md` — French typography rules (guillemets, tirets, espaces insécables, etc.)

## External data

- `bank.yml` — declares output-style, universe docs, personas.
- `<univers>/.templates/personas/*.yml` — reader persona definitions.
- `.toc/toc-chapter<NN>.md` — chapter spec for cross-referencing.
- `<univers>/.docs/terminologie.md` — canonical terminology.
