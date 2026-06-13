# 02 - Train

Refine an existing reader persona by analyzing patterns across accumulated review feedback files under `<output>/review/`.

## Inputs

- `<brief>` (required, positional) — path to the brief directory; the updated persona is written back to `<brief>/personas/<id>.yaml`.
- `--out <output>` (required) — path to the output directory; feedback files are read from `<output>/review/`.
- `persona_id` (required) — the persona's kebab-case slug (e.g. `fan-wot`); must match the filename stem in `<brief>/personas/`.

## Depends on

- `generate` (persona must already exist at `<brief>/personas/<persona_id>.yaml`)
- `review` (feedback files must exist under `<output>/review/`)

## Outputs

Updated persona YAML at `<brief>/personas/<id>.yaml` with:
- Refined must-haves (any pattern appearing in ≥3 feedback files → promoted to must-have)
- Sharpened deal-breakers (any pattern causing cap → confirmed as deal-breaker)
- Adjusted criterion weights (based on which criteria most often limited scores)
- Incremented version comment

Plus a training report:
```
Training report: fan-wot
Feedback files analyzed: N
Patterns found: M
Changes:
  must_have: added [list]
  deal_breakers: confirmed [list], added [list]
  criteria weights: engagement 0.25 → 0.30 (engagement was most-limiting factor)
Version: 1.0 → 1.1
```

## Process

1. Locate the persona YAML at `<brief>/personas/<persona_id>.yaml`. If absent, abort and instruct the user to run `generate` first.
2. List all feedback files under `<output>/review/` matching `chapter-*-<persona_id>.md`. Load each file. Parse for: scores per criterion, must-have failures, deal-breaker triggers, recurring weakness patterns.
3. Build a frequency table: for each issue or pattern, count occurrences across feedback files.
4. **Promote to must-have**: any pattern absent from current must-haves that appears in ≥3 feedback files as a blocking issue.
5. **Confirm/add deal-breakers**: any pattern that triggered the deal-breaker cap (≤8/20) across ≥2 feedback files.
6. **Adjust criterion weights**: identify which criterion most often had the lowest score and limited the total. Increase its weight by 0.05, decrease the least-limiting criterion by 0.05. Verify weights still sum to 1.0.
7. **Update patience profile** if present: any trigger that repeatedly caused score caps → add to `triggers_impatience`.
8. Present the changes to the user with the training report. Ask for validation before writing.
9. Write the updated YAML to `<brief>/personas/<persona_id>.yaml`. Increment the version comment (1.0 → 1.1 for minor adjustments, 2.0 for structural rework).

## Test

After `train <brief> --out <output> fan-wot` on a project with ≥3 feedback files under `<output>/review/`, verify that `<brief>/personas/fan-wot.yaml` has an incremented version comment and at least one change (added must-have, updated weight, or new deal-breaker).
