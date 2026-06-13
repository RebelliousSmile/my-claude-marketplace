---
name: review
model: opus
description: Quality review pipeline for writing chapters — persona-based qualitative analysis (comment) and technical correction (doctor). Use when evaluating a written chapter through reader personas, applying grammar/typography/terminology corrections, or preparing triage decisions (rewrite vs patch). Do NOT use for code review — use `aidd-dev:review` instead; do NOT use for rewriting chapters — use `write --feedback` instead.
---

# Review

Two-stage review pipeline for narrative chapters:
1. **Comment** — evaluates the chapter through reader personas from `<brief>/personas/`, scores engagement/clarity/immersion/satisfaction on /20, and produces a structured 3-section output routing to doctor or rewrite.
2. **Doctor** — applies technical corrections (French grammar, typography, terminology, formatting, content enrichments) guided by the output-style; terminology reference comes from `<brief>/summary.md`.

Run `comment` first to identify what needs fixing, then `doctor` to apply patchable corrections. If ≥2 personas are capped at ≤11/20 by structural issues, route to `write --feedback` instead.

`comment` and `doctor` are the two stages of a **convergence loop**: comment → triage → fix (`doctor` / `write --feedback` / input revision) → re-comment → compare scores. The loop stops at **PLATEAU** (score delta `Δ < 1.0` between iterations). The full routing — triage routes, the `Δ`/PLATEAU criterion, the score-history artifact, and when input revision (`persona:train` / `tone-finder:improve`) fires — is specified in `${CLAUDE_PLUGIN_ROOT}/references/review-loop.md`.

Reads the **brief model**: `${CLAUDE_PLUGIN_ROOT}/references/brief-model.md`. The `<brief>/` is read-only; `review` never reads outside `<brief>/` and `<output>/`.

## Available actions

| #   | Action    | Role                                                               | Input                                                                         |
| --- | --------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| 01  | `comment` | Persona-based chapter evaluation with scoring and triage routing   | `<output>/chapters/chapter-<NN>.md` `--brief <brief>` [persona-ids…] [--all] |
| 02  | `doctor`  | Technical corrections: grammar, typography, terminology, enrichments | `<output>/chapters/chapter-<NN>.md` `--brief <brief>` [--remarks "notes" or file] [--dry-run] |

## Default flow

`01 → 02` (standard pipeline). `02` alone if corrections are known. After a fix (`02` or `write --feedback`), return to `01` (**re-comment / re-scoring**) and compare to the prior score: `Δ ≥ 1.0` → loop again; `Δ < 1.0` → **PLATEAU**, stop. Hard guard: **max 5 iterations** per chapter (cf. `review-loop.md`).

Trigger-to-action mapping:
- "review chapter", "evaluate chapter", "persona feedback", "comment on chapter", "reader analysis" → `comment`
- "doctor chapter", "fix chapter", "correct chapter", "apply corrections", "technical review" → `doctor`

## Transversal rules

- `comment`: embody each persona fully; run mandatory cross-reference check (stats vs `summary.md`) before scoring; run redundancy check (chapters 02+); complete craft checklist per chapter type; run devil's advocate (3 weaknesses per persona after scoring).
- `doctor`: preserve original meaning and narrative voice; never use personas (that is `comment`'s role); log ALL corrections to `<output>/review/chapter-<NN>-changelog.md`.
- Corrections priority: 🔴 Critical (grammar, orthography, terminology) → 🟡 Important (typography, Markdown format) → 🟢 Optional (style, flow).
- Doctor applies ALL priority levels by default; the priorities appear in the report, not as filters.
- Routing from `comment` to rewrite: if ≥2 personas scored ≤11/20 on structural must-haves → `write --feedback`. Full triage table (incl. systemic-pattern → `tone-finder:improve` over ≥3 chapters, and same-persona-capped → `persona:train` over ≥3 chapters) in `${CLAUDE_PLUGIN_ROOT}/references/review-loop.md`.
- `comment` maintains the score-history artifact `<output>/review/chapter-<NN>-scores.md` (one row per iteration: consensus, `Δ`, verdict, route) and never declares `PLATEAU` while `Δ ≥ 1.0`.

## External data

- `${CLAUDE_PLUGIN_ROOT}/references/brief-model.md` — the brief → output working-dir contract.
- `${CLAUDE_PLUGIN_ROOT}/references/review-loop.md` — convergence loop: triage routes, `Δ`/PLATEAU criterion, score-history artifact, input-revision triggers.
- `<brief>/summary.md` — autonomous brief; sole source of lore, terminology, and context.
- `<brief>/personas/` — YAML persona files consumed by `comment`.
- `<brief>/output-styles/` — writing conventions consumed by `comment` and `doctor`.
- `<output>/chapters/chapter-<NN>.md` — chapter(s) to review.
- `<output>/review/chapter-<NN>-<persona>.md` — persona feedback produced by `comment`, consumed by `write --feedback`.
