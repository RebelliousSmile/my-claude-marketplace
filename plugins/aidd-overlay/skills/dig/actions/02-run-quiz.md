# 02 - Run quiz

Drive the 5-question interactive loop: for each assigned file, read it, audit it for coherence, generate an alternating MCQ or open question at current difficulty, wait for the answer, score it, give feedback, and update the session report.

## Inputs

- `session_context` (required) - object, produced by `01-launch`: `source`, `files[5]`, `report_path`, `difficulty`, `score`, `question_num`

## Outputs

Updated session report at `report_path` with all 5 rows filled in `## Questions` and all coherence findings in `## Coherence checks`.

## Depends on

- `01-launch`

## Process

Repeat the following block for each question `i` from 1 to 5:

### Per-question loop

1. Read the source file `files[i]` entirely.
2. **Inline coherence observation** — while reading, note any obvious finding against `rules_summary` from the session context (no extra file reads). A finding is: a clear rule violation, a contradiction with another already-read file in this session, or a suspicious pattern. If nothing stands out: skip — leave the coherence row blank. Log only real findings in `## Coherence checks`; do not force a row per file.
3. **Inconsistency check** — if this file directly contradicts a previously read file in the same session, invoke `03-flag-inconsistency`. Do not block the quiz loop.
4. Generate a question based on the file content:
   - Odd questions (1, 3, 5): **MCQ** — 4 options, one correct, short labels.
   - Even questions (2, 4): **Open** — precise question, expected answer in 1–3 sentences.
   - Difficulty levels:
     - **Easy**: definitions, general concepts, tech stack
     - **Intermediate**: relations between entities, route patterns, auth flow
     - **Hard**: edge cases, architecture decisions, potential inconsistencies
5. Display:
   ```
   Question 2/5 · 📄 src/auth/session.ts · [Intermediate]
   <question text>
   ```
6. Wait for the user's answer.
7. **Score the answer**:

   **MCQ:**
   - Correct on 1st attempt → 4/4
   - Wrong on 1st attempt → give a hint (e.g. "It's in this file, around concept Y…"), let the user retry
   - Correct on 2nd attempt → 2/4
   - Wrong on 2nd attempt → 0/4, reveal and explain correct answer with a file excerpt

   **Open:**
   - 4/4: complete and precise
   - 3/4: correct idea but incomplete — explain what was missing
   - 2/4: right direction but important elements missing — explain
   - 1/4: one relevant element but overall insufficient — explain
   - 0/4: off-topic — explain

8. Display score: `Score: X/N` where N = 4 × `question_num`.
9. Update session report: add row to `## Questions` table (file, topic, points, justification, difficulty).
10. **Adapt difficulty**:
    - 2 consecutive full marks (4/4) → increase difficulty (easy → intermediate → hard)
    - 2 consecutive low scores (≤ 2/4) → decrease difficulty (hard → intermediate → easy)
11. If a risk or security issue was found during the coherence audit (step 2): mention it alongside the answer feedback, ask the user if they want to brainstorm it now or note it for later. If yes or if the risk is critical: write a plan outline in the session report under `## Plans generated`. Tell the user to invoke `/plan` for a full plan — Ada cannot launch skills herself.

## Test

Complete a full 5-question session; verify the session report has exactly 5 filled rows in `## Questions` and at least 5 rows in `## Coherence checks` (one per audited file), all written during the session, not after.
