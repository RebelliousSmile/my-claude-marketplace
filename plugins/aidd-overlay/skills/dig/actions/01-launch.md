# 01 - Launch

Initialize the quiz session: greet as Ada, ask for source and theme, check for active background agents, scan files, select 5 distinct files, and create the session report.

## Inputs

- `source` (required) - string, `code` or `docs` — chosen by the user at session start
- `theme` (optional, default: random) - string, a module name or concept to filter files

## Outputs

Session context held in conversation:

```
source       = code | docs
theme        = <string> | random
files[5]     = [<path>, <path>, <path>, <path>, <path>]
report_path  = aidd_docs/tasks/<YYYY_MM>/<YYYY_MM_DD>-quiz-<N>.md
difficulty   = intermediate
score        = 0
question_num = 0
```

Session report file created at `report_path` from `@../assets/quiz_report.md`.

## Process

1. Read `@CLAUDE.md` to load project context (stack, conventions, source directories).
2. Greet the user as Ada:
   > "Hi! I'm Ada 👾 — ready to quiz you on this project. What should we explore today?"
3. Ask for the **source**:
   - `code` → scan project source directories (infer from `CLAUDE.md` stack, e.g. `src/`, `app/`, `lib/`)
   - `docs` → scan `aidd_docs/memory/`
4. Optionally ask for a **theme** (module name, concept) — if none given, pick randomly.
5. **Background agent check**: if a background agent is currently running a task that modifies source files, warn the user:
   > "⚠️ A background agent is active and may be modifying files right now — quiz questions could be based on in-progress code. Continue anyway?"
   Proceed only if the user confirms.
6. Scan files with Glob:
   - `code`: filter by project language extensions (`.ts`, `.tsx`, `.js`, `.py`, etc. per stack)
   - `docs`: `aidd_docs/memory/**/*.md`
   - Apply theme filter if specified.
7. Select **5 distinct files** at random (or filtered by theme). Never assign the same file twice.
8. Determine report number N: list existing `aidd_docs/tasks/<YYYY_MM>/<YYYY_MM_DD>-quiz-*.md` files, set N = count + 1.
9. Create the session report by copying `@../assets/quiz_report.md` to `aidd_docs/tasks/<YYYY_MM>/<YYYY_MM_DD>-quiz-<N>.md`. Fill in the header: date and quiz number.
10. Announce: `"5 questions — let's go! 🚀"`

## Test

Launch Ada, choose source `code`, no theme. Verify that the file `aidd_docs/tasks/<YYYY_MM>/<YYYY_MM_DD>-quiz-<N>.md` is created and contains the template sections: `## Score`, `## Questions`, `## Coherence checks`, `## Inconsistencies detected`, `## Plans generated`, `## Key takeaways`.
