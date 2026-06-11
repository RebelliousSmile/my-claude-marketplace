# 01 - Comment

Evaluate a chapter through reader personas. Produces a structured 3-section report routing to `doctor`, `write --feedback`, or iteration.

## Inputs

- `chapter_file` (required) — path to the chapter to evaluate (e.g. `chapitres/chapitre03.md`)
- `persona_ids` (optional) — one or more persona IDs (e.g. `gm-practitioner fan-wot`); omit for auto-selection
- `--all` (optional flag) — use all discovered personas

## Outputs

```markdown
# [Chapter Title] — Persona Analysis

## Section 1 — Issues and Suggestions
[Ranked list of concrete findings with citations and priorities 🔴🟡🟢]

## Section 2 — Systemic Patterns
[Recurring patterns across the chapter — candidates for tone-finder update]

## Section 3 — Scores and Routing
| Persona         | Score  | Verdict        |
|-----------------|--------|----------------|
| [persona-name]  | X/20   | ✅ / ⚠️ / ❌  |
| **CONSENSUS**   | **X.X/20** | [routing decision] |

Routing:
- score ≥ 14/20 → `doctor` (optional improvements only)
- 11-13/20 → `doctor` (important fixes needed)
- ≤ 10/20 or ≥2 personas capped by must-haves → `write --feedback`
```

Saved to: `.wip/comments/<chapitre>-personas.md`

## Process

1. Discover personas in priority order: `<projet-root>/.templates/personas/*.yml` → `<univers-root>/.templates/personas/*.yml` → `<vault>/_shared/personas/*.yml`. Load the requested IDs or auto-select based on `document.type`. (`<projet-root>` = `<jeu>/_ecrits/<projet>/`, `<univers-root>` = `<jeu>/_univers/<univers>/`, `<vault>` = `C:/Users/fxgui/Public/Notes/Perso/RPG/`. See `setup/references/vault-layout.md`.)
2. For each persona: check `loading_strategy`. If `from_bank_yml` → load references from bank.yml (rules-files, universe docs) excluding declared exclusions. Else load static reference list.
3. **Mandatory pre-scoring checks (before scoring)**:
   - 3a. **Cross-reference check** (scenario/roleplaying only): verify all statblocks, mechanic values, and NPC names against `pj.md` and `document-rules.md`. Any mismatch → 🔴 CRITICAL `[CROSS-REF FAIL]`.
   - 3b. **Redundancy check** (chapters 02+): flag re-described NPCs, re-translated terms, repeated disclaimers, generic GM advice. ≥3 redundancies → Clarity -1pt.
   - 3c. **Craft checklist**: answer all checklist questions for the chapter type (NOVEL: N1-N6; RULES: R1-R5; SCENARIO: S1-S5). A question without an answer invalidates the review.
4. **Score each persona**: Engagement, Clarity, Immersion, Satisfaction (each /20, with weights summing to 1.0). Apply must-have cap (≤11/20 if any missing) and deal-breaker cap (≤8/20). Score = MIN(subtotal, must-have cap, deal-breaker cap).
5. **Divergence check**: compute standard deviation of scores. If < 1.0 → identify the most divergent persona and re-evaluate with "What is SPECIFICALLY missing for this reader?" Document ≥1 divergence.
6. **Devil's advocate**: each persona lists 3 concrete weaknesses with text citations (distinct from Section 1 findings). Add as 🟢 suggestions in Section 1.
7. **Consensus**: weighted average (project personas × 1.0, universe × 0.8, global × 0.5). Verify arithmetic before publishing.
8. Write routing recommendation based on consensus score.
9. Save to `.wip/comments/<chapitre>-personas.md`.

## Test

After `comment chapitres/chapitre01.md`, verify that `.wip/comments/chapitre01-personas.md` exists, contains a consensus score, and the scoring arithmetic is verifiable (sum of weighted scores / sum of weights = stated consensus ± 0.01).
