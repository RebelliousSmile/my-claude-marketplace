# Tone Finder — Behavioural Test Scenarios

Behavioural tests for **tone-finder** (`plugins/writing/skills/tone-finder/SKILL.md`) — verifies that `analyze` produces output-styles correctly scoped to `<brief>/output-styles/` from the right mode (source / questionnaire / extend) without ever touching `<output>/chapters/`, and that `improve` only fires an output-style revision when `comment` has actually flagged a **systemic pattern on ≥3 chapters** (`SYSTEMIC_CHAPTERS`, `references/review-loop.md`) — never on a single chapter's feedback, however severe.

This suite is **distinct** from:
- `evals/scenarios.json` — router-trigger test (prompt → `analyze`/`improve` dispatch only); this file tests actual *behaviour* once an action is invoked.
- **this file** — content/scope correctness of `analyze` and the systemic-pattern gate of `improve`.

> **Fixture / preconditions.** Reference fixture: `fixtures/writing-narrative-fixture/` (dry-run, READ-ONLY — never mutated). Contains `_brief/output-styles/` with 3 distinct styles (`style-immersif-v1.md`, `style-minimaliste-v1.md`, `style-lyrique-v1.md`), `_brief/summary.md` (novel, fr), `_output/chapters/chapter-01.md` (violates `style-immersif-v1.md`: English quotes `"..."` instead of French `« »`) and `chapter-02.md` (conforms), `_output/review/chapter-01-lecteur-critique-litteraire.md` + `chapter-01-scores.md` (feedback exists for **chapter-01 only**).
>
> **Explicit precondition gap — read before running S6.** The fixture has only **2 chapters total**, and review feedback for only **1** of them. The `improve` trigger requires a pattern recurring over **≥3 chapters** (`SYSTEMIC_CHAPTERS = 3`, `references/review-loop.md`). This fixture structurally cannot host a positive "systemic trigger fires correctly on 3 chapters" scenario — it is **N/A by fixture design**, not fabricated to force a pass or fail. Do not add a 3rd chapter's feedback to make S6 executable; that would violate the read-only/no-mutation rule and manufacture a pattern that isn't really there.

## Scenarios

| #   | Situation (input) | Expected behaviour | Pass criteria |
|-----|-------------------|--------------------|---------------|
| S1  | `analyze <brief>` with source files `_output/chapters/chapter-01.md` + `chapter-02.md` (MODE SOURCE — complete source files, no `--extend`) | Deep style analysis (philosophy first, formatting second), 3+ real examples drawn from the two chapters (e.g. dialogue lines with `—`, the sensory Verre passage) | Written only to `<brief>/output-styles/<name>-novel.md`; examples are verbatim/paraphrased from the source chapters, never generic placeholders (`01-analyze.md` steps 2–3, 7) |
| S2  | `analyze <brief>` with no source files (MODE QUESTIONNAIRE) | Asks up to 15 questions across 4 batches (genre/tone 4, structure 4, formatting 4, examples 3), co-constructs examples, writes nothing until validated | No output-style file is produced before the questionnaire + validation step completes; question count ≤ 15 (`01-analyze.md` step 2, step 5, step 8→9) |
| S3  | `analyze <brief> chapter-02.md --extend` targeting the existing `style-immersif-v1.md` (chapter-02 conforms, no contradiction) | Loads the existing file first, enriches it, preserves its established rules (POV on Mira, `« »`, `—`) | Existing rules survive unchanged in the enriched file; the file's version metadata is tracked/incremented, not silently reset or left unspecified (`01-analyze.md` step 1, step 9) |
| S4  | Same as S1/S3, but `chapter-01.md` (the style-violating chapter) is among the analyzed sources | `analyze` never edits or "fixes" `chapter-01.md`'s English quotes — that correction belongs to `review`, not `tone-finder` | `_output/chapters/chapter-01.md` is untouched (0 writes to `_output/`); only `<brief>/output-styles/` is written (SKILL.md description: "Do NOT use for correcting chapter content — use `review` instead") |
| S5  | `improve <brief> --out <output>` invoked now, with feedback existing for **chapter-01 only** (1 chapter, pattern "guillemets anglais" flagged at 🟡/🔴 severity by the % classifier since it is present in 1/1 available chapters = 100%) | Must **not** propose or apply an output-style change yet — 1 chapter is below the `SYSTEMIC_CHAPTERS = 3` floor, regardless of the percentage it represents among chapters reviewed so far | No version bump, no changelog entry proposed; the action reports insufficient data (fewer than 3 chapters) and stops (SKILL.md transversal rule, `references/review-loop.md` § Constantes) |
| S6  | A pattern recurring with consistent feedback across exactly 3 chapters, testing that `improve` **does** fire correctly at the threshold | — | **N/A** — fixture has only 2 chapters total and feedback for only 1; this positive-trigger path cannot be exercised without fabricating data. See precondition note above. |

## How to run

Agent-as-tone-finder (dry-run, READ-ONLY on the fixture): load `SKILL.md` + `actions/01-analyze.md` + `actions/02-improve.md` + `references/review-loop.md` + this suite, against the populated fixture `writing-narrative-fixture`. For each scenario, reason out what tone-finder **would** do — its response AND the precise set of files it would write/modify (paths + scope) — and judge against the pass criteria. Nothing is written to the fixture.

**Decisive observables** (write-scoped): `_output/chapters/` never written by `analyze` (S1, S3, S4); `analyze` output lands only under `_brief/output-styles/` (S1, S2, S3); `improve` never bumps `version:` or writes a changelog entry when fewer than 3 chapters have contributed feedback (S5) — a 100% rate over 1–2 chapters is not systemic.

## Results log

### 2026-07-04 — run 1 (initial, dry-run, target=tone-finder, fixture=writing-narrative-fixture) — **3/5 PASS (1 N/A)**

Fixture: 3 output-styles present (`style-immersif/minimaliste/lyrique-v1.md`); `chapter-01.md` violates `style-immersif` (English quotes), `chapter-02.md` conforms; review feedback exists for chapter-01 only.

| # | Situation | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| S1 | MODE SOURCE from chapter-01+02 | PASS | — | `01-analyze.md` steps 2–3, 7: mode detected, real examples extracted, never generic |
| S2 | MODE QUESTIONNAIRE, no sources | PASS | — | `01-analyze.md` step 2 + step 5 (4/4/4/3 batches, ≤15 Qs) + step 8→9 order (validate before write) |
| S3 | `--extend` on `style-immersif-v1.md` with conforming chapter-02 | **FAIL** | — | `01-analyze.md` step 1/9 never handled `version:` metadata on extend; `references/output-style.md` schema had no `version`/`applies_to` key at all, yet `02-improve.md` step 6 ("Increment version…") presupposes one exists — cross-action contract gap |
| S4 | Sources include style-violating chapter-01 | PASS | — | SKILL.md description: "Do NOT use for correcting chapter content — use `review` instead"; process never writes to `_output/` |
| S5 | `improve` with feedback for 1/1 chapter (100% severity) | **FAIL** | — | `02-improve.md` (old) step 2 classified severity by percentage only, no reference to `review-loop.md` `SYSTEMIC_CHAPTERS=3`, no absolute floor — would have proposed/applied a change on 1-chapter evidence, contradicting SKILL.md transversal rule ("once … recurring over ≥3 chapters") |
| S6 | Positive systemic-trigger fires on 3 chapters | **N/A** | — | Fixture has only 2 chapters total, feedback for 1 — precondition for a genuine ≥3-chapter trigger cannot be met without fabricating data (see suite precondition note) |

**Frictions / gaps:**
- `01-analyze.md`'s example-extraction slots ("one explanatory paragraph, one technical section, one atmospheric passage", step 3) don't map cleanly onto novel-type sources (no "technical section" in a chapter) — not a FAIL, but worth a type-aware note if this recurs across runs.
- (closed below) `references/output-style.md` schema missing `version`/`applies_to`.
- (closed below) `02-improve.md` missing the absolute ≥3-chapter floor before percentage-based severity classification.

**Tally:** 3/5 PASS (1 N/A) — 2 real gaps found (S3, S5), both closed this session (see run 2).

### 2026-07-04 — run 2 (post-fix, dry-run, target=tone-finder, fixture=writing-narrative-fixture) — **5/5 PASS (1 N/A)**

Same fixture and state as run 1. Fixes applied: (1) `references/output-style.md` frontmatter now declares `version:`/`applies_to:`; (2) `01-analyze.md` Outputs template uses that YAML frontmatter instead of prose "**Version:** 1.0", and step 1 now states `--extend` carries `version:` over unchanged; (3) `02-improve.md` gained an explicit new step 2 enforcing the `SYSTEMIC_CHAPTERS = 3` absolute floor (citing `references/review-loop.md`) before any percentage-based severity classification, plus a negative test case.

| # | Situation | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| S1 | MODE SOURCE from chapter-01+02 | PASS | = | unchanged |
| S2 | MODE QUESTIONNAIRE, no sources | PASS | = | unchanged |
| S3 | `--extend` on `style-immersif-v1.md` with conforming chapter-02 | PASS | ▲ | `01-analyze.md` step 1 now preserves `version:`; schema now consistently defines it in `references/output-style.md` and `01-analyze.md` Outputs |
| S4 | Sources include style-violating chapter-01 | PASS | = | unchanged |
| S5 | `improve` with feedback for 1/1 chapter (100% severity) | PASS | ▲ | `02-improve.md` new step 2 stops with "insufficient data" before classification fires — no version bump, no changelog entry |
| S6 | Positive systemic-trigger fires on 3 chapters | N/A | = | unchanged — still structurally untestable on this 2-chapter fixture, as documented |

**Frictions / gaps:** none blocking; the novel/technical-section example-slot mismatch noted in run 1 remains a low-priority polish item, not fixed (out of scope — would require type-specific templates, which is over-engineering for this pass).

**Tally:** 5/5 PASS (1 N/A) — regression fixed; both FAILs from run 1 now PASS.
