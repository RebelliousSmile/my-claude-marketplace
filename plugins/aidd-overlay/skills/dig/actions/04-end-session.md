# 04 - End session

Display the final score with grade, detail every question, summarize weak points, list all tasks and plans created, finalize the session report, and offer a replay.

## Inputs

- `session_context` (required) - object from `02-run-quiz`: `score`, `report_path`, per-question detail array

## Outputs

Finalized session report at `report_path` with `## Score` header and `## Key takeaways` filled. Console output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Ada — Session complete 🎓
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Score: 16/20 — Bonne compréhension

  Q1: 4/4 — src/auth/session.ts · correct on 1st attempt
  Q2: 2/4 — aidd_docs/memory/stack.md · right direction, missing X
  ...

  Weak points: <list>
  Tasks created: <list or "none">
  Plans noted: <list or "none">
━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Depends on

- `02-run-quiz`

## Process

1. Compute final score (sum of all question scores, max 20). Determine grade:
   - 18–20: Excellente maîtrise 🏆
   - 14–17: Bonne compréhension ✅
   - 10–13: Base correcte, points à approfondir 📖
   - 0–9: Besoin de révision 🔄
2. Display the session summary (see **Outputs** format).
3. List per-question detail: `Q<n>: <points>/4 — <file> · <brief justification>`.
4. Identify weak points: questions with score < 4/4. Summarize the concepts missed.
5. List all tasks created during the session (from `03-flag-inconsistency` calls) or "none".
6. List all plans noted in the session report or "none".
7. **Write the session report** (single write, all sections at once):
   - `## Score` — final score and grade.
   - `## Questions` — all 5 rows from `questions[]` in session context.
   - `## Coherence checks` — all rows from `coherence_findings[]`, or leave empty if none.
   - `## Inconsistencies detected` — task file links from any `03-flag-inconsistency` calls, or "none".
   - `## Plans generated` — plan outlines noted during the session, or "none".
   - `## Key takeaways` — 2–3 bullet points summarizing the session (main findings, weak areas, anomalies detected).
8. Offer replay:
   > "Play again? `same theme` / `new theme` / `other source`"

## Test

Complete a full 5-question session; verify that: (1) the final score is displayed with the correct grade label, (2) at least one weak point is listed if any question scored < 4/4, and (3) the session report's `## Key takeaways` section is non-empty after the action completes.
