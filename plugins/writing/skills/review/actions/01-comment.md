# 01 - Comment

Evaluate a chapter through reader personas from `<brief>/personas/`. Produces a structured 3-section report routing to `doctor`, `write --feedback`, or iteration.

## Inputs

- `<output>/chapters/chapter-<NN>.md` (required, positional) — path to the chapter to evaluate (e.g. `<output>/chapters/chapter-03.md`)
- `--brief <brief>` (required) — the brief directory (read-only); personas and output-styles are loaded from it
- `persona_ids` (optional) — one or more persona IDs (e.g. `gm-practitioner fan-wot`); omit for auto-selection
- `--all` (optional flag) — use all personas found in `<brief>/personas/`

## Outputs

```markdown
# [Chapter Title] — Persona Analysis

## Section 1 — Issues and Suggestions
[Ranked list of concrete findings with citations and priorities 🔴🟡🟢]

## Section 2 — Systemic Patterns
[Recurring patterns across the chapter — candidates for tone-finder update]

## Section 3 — Scores and Routing
| Persona         | Score      | Verdict        |
|-----------------|------------|----------------|
| [persona-name]  | X/20       | ✅ / ⚠️ / ❌  |
| **CONSENSUS**   | **X.X/20** | [routing decision] |

Routing:
- score ≥ 14/20 → `doctor` (optional improvements only)
- 11-13/20 → `doctor` (important fixes needed)
- ≤ 10/20 or ≥2 personas capped by must-haves → `write --feedback`
```

Saved to: `<output>/review/chapter-<NN>-<persona>.md` (one file per persona).

## Process

> Working dirs per `${CLAUDE_PLUGIN_ROOT}/references/brief-model.md`. `<brief>/` is read-only.

1. Resolve the chapter path (positional) and `<brief>` (`--brief`) from `$ARGUMENTS`. If `<brief>/summary.md` is missing → ABORT and report the brief is incomplete.
2. Load `<brief>/summary.md` — sole source of lore, mechanics, terminology, and type.
3. Discover personas: list `<brief>/personas/*.yaml` (or `*.yml`). Load the requested IDs (if provided) or auto-select based on `document.type` declared in `summary.md`. If `--all`, load every file found.
4. Load output-style from `<brief>/output-styles/` (the file referenced in the TOC entry for this chapter, or the only one present).
5. **Mandatory pre-scoring checks (before scoring)**:
   - 5a. **Cross-reference check** (scenario/roleplaying only): verify all statblocks, mechanic values, and NPC names against `summary.md`. Any mismatch → 🔴 CRITICAL `[CROSS-REF FAIL]`.
   - 5b. **Redundancy check** (chapters 02+): load previous chapters in `<output>/chapters/`, build NPC/term/disclaimer inventory. Flag re-described NPCs, re-translated terms, repeated disclaimers, generic GM advice. ≥3 redundancies → Clarity -1pt.
   - 5c. **Craft checklist**: answer all checklist questions for the chapter type (NOVEL: N1-N6; RULES: R1-R5; SCENARIO: S1-S5). A question without an answer invalidates the review.
6. **Score each persona**: Engagement, Clarity, Immersion, Satisfaction (each /20, with weights summing to 1.0). Apply must-have cap (≤11/20 if any missing) and deal-breaker cap (≤8/20). Score = MIN(subtotal, must-have cap, deal-breaker cap).
7. **Divergence check**: compute standard deviation of scores. If < 1.0 → identify the most divergent persona and re-evaluate with "What is SPECIFICALLY missing for this reader?" Document ≥1 divergence.
8. **Devil's advocate**: each persona lists 3 concrete weaknesses with text citations (distinct from Section 1 findings). Add as 🟢 suggestions in Section 1.
9. **Consensus**: weighted average (project personas × 1.0, universe × 0.8, global × 0.5). Verify arithmetic before publishing.
10. Write routing recommendation based on consensus score.
11. Create `<output>/review/` if absent. Save one file per evaluated persona: `<output>/review/chapter-<NN>-<persona>.md`. These files are consumed by `write --feedback` and `upgrade`.

## Test

After `comment <output>/chapters/chapter-01.md --brief <brief>`, verify that `<output>/review/chapter-01-<persona>.md` exists for each evaluated persona, contains a consensus score in Section 3, and that the scoring arithmetic is verifiable (sum of weighted scores / sum of weights = stated consensus ± 0.01).
