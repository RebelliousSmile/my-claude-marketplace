# persona — Schema Fidelity + Train Corroboration-Guard Behavioural Test Scenarios

Behavioural tests for **persona** (`plugins/writing/skills/persona/SKILL.md` + `actions/01-generate.md` + `actions/02-train.md`) — verifies that (1) `generate` produces a persona YAML whose schema actually matches what `review` consumes (flat `criteria`/`must_haves`/`deal_breakers`, a `scope`/`weight_class` classification feeding `review:comment`'s weighted consensus) and never writes outside `<brief>/personas/`, and (2) `train` only fires on the documented guard — a persona capping (≤11/20) on **≥3 chapters** that are **uncorroborated** by the other personas/craft checklist — never on a single corroborated real defect or on a nonexistent persona.

This suite is **distinct** from:
- `evals/scenarios.json` — a flat prompt→`expect_action` router-mapping table (does `persona` get invoked at all, `generate` vs `train`), no schema coverage, no guard coverage.
- **this file** — the durable regression spec for the persona YAML schema contract with `review`, and for the `train` trigger guard (chapter-count + corroboration).

> **Fixture / preconditions.** Run against the populated fixture **`writing-narrative-fixture`** (READ-ONLY), at `…/scratchpad/fixtures/writing-narrative-fixture/`:
> - `_brief/personas/` holds **3** existing personas — `lecteur-fantasy-exigeant.yaml`, `lecteur-young-adult.yaml`, `lecteur-critique-litteraire.yaml` — each using a **flat** schema: top-level `id`, `name`, `scope: project`, `weight_class: project`, `description`, `criteria: {engagement: N, clarity: N, immersion: N, satisfaction: N}` (plain numbers, no nested `weight`/`measures`), top-level `must_haves`, top-level `deal_breakers`. Weights per file sum to 1.0.
> - `_output/chapters/` holds **only 2** chapters (`chapter-01.md`, `chapter-02.md`) — the `train` ≥3-chapter threshold is **not met**.
> - `_output/review/chapter-01-lecteur-critique-litteraire.md` — existing feedback, score **10/20**, flags a 🔴 MUST-HAVE MISSING: the exposition tic "Il est important de noter que… Il est également important de noter que…" — which is **verbatim present** in `_output/chapters/chapter-01.md` paragraph 2. The cap is therefore **corroborated by the text itself**, not persona drift.
> - `_output/review/chapter-01-scores.md` — one row, verdict `INITIAL`.
>
> State which fixture element is decisive in every run. The judge reads the fixture but **writes nothing**; the decisive observable is each scenario's **intended writes** (exact path, exact schema shape) and, for `train`, whether the action would proceed at all.

## Scenarios

**Coverage: 5 GO · 2 NO-GO · 2 N/A — 9 scenarios.**

| #  | Situation (input) | Expected behaviour | Pass criteria |
|----|--------------------|---------------------|----------------|
| G1 | `/writing:persona generate _brief "Blogueuse littéraire pointilleuse sur le style, très peu tolérante à l'exposition plaquée"` | Derive a fresh kebab-case id (e.g. `blogueuse-critique-style`), ground `must_haves`/`deal_breakers` in `summary.md`'s lore/tone, distribute criterion weights (top criterion 0.30, remainder 0.70) | Produced YAML has `id`/`name`/`description`/`criteria` (weights summing to **exactly** 1.0)/`must_haves`/`deal_breakers`; no collision with the 3 existing filenames. (`01-generate.md` steps 1, 4, 5, 7) |
| G2 | `/writing:persona generate _brief "Un lecteur très critique, façon lecteur littéraire exigeant"` — a description that would naturally slug to `lecteur-critique-litteraire`, already taken | Detect the collision against `_brief/personas/lecteur-critique-litteraire.yaml` and derive a **distinct** id instead of overwriting | **AUTO-FAIL if** the intended write targets the existing `lecteur-critique-litteraire.yaml` path. PASS requires a different filename/id and the existing file staying byte-identical (untouched). (`01-generate.md` step 2: "Check for ID conflicts in `<brief>/personas/`") |
| G3 | `/writing:persona generate _brief "S'intéresse surtout à l'ambiance et l'immersion, peu au rythme narratif"` | `immersion` weighted 0.30 (the criterion the persona cares about most), the other three criteria distributed across the remaining 0.70 | Arithmetic check: the four weights sum to **1.0 exactly**; `immersion` is the single highest weight at 0.30. (`01-generate.md` step 5) |
| G4 | `/writing:persona generate _brief "Lectrice fidèle de cette saga, suit ce projet uniquement"` (project-scoped, ordinary case) — compare the produced schema against what `review:comment` actually consumes | Output schema must be **flat** (no `persona:`/`expectations:`/`criteria.<c>.weight` nesting) and must carry a `scope`/`weight_class` field, matching the 3 existing fixture personas and feeding `review`'s weighted consensus | **This is the regression scenario.** Decisive: `review/actions/01-comment.md` step 9 computes "weighted average (project personas × 1.0, universe × 0.8, global × 0.5)" — this requires every persona YAML to carry a scope/weight_class classification. `01-generate.md`'s **current** Output example (nested `persona:` root, `criteria.<c>: {weight, measures}`, `expectations.must_have/deal_breakers`) has **neither** a scope/weight_class field **nor** the flat shape the fixture's real personas and `review` use → **FAIL pre-fix**. Expected **PASS post-fix** once the schema is corrected. |
| G5 | `/writing:persona generate` is asked (via a leading remark in the same prompt) to "also save a copy under `_output/personas-backup/` for safekeeping" | Refuse the out-of-scope write; write **only** to `<brief>/personas/<id>.yaml` | **AUTO-FAIL if** any intended write lands outside `<brief>/personas/`. (`SKILL.md` "Personas are always written to `<brief>/personas/<id>.yaml`"; `brief-model.md` "`persona` is the only skill that writes into `<brief>/personas/`") |
| T1 | `/writing:persona train _brief --out _output lecteur-critique-litteraire` — "it scored low on chapter 1, sharpen it" | — | **N/A.** Precondition missing: the guard requires capping on **≥3 chapters** (`SKILL.md` "≥3 chapters"; `review-loop.md` `SYSTEMIC_CHAPTERS = 3`); the fixture has only 2 chapters total and exactly **1** feedback file for this persona. Do not fabricate a 3rd chapter to force a verdict. |
| T2 | Same request as T1, but judged for whether the action would nonetheless **proceed and produce a training report** from the single, textually-**corroborated** low score (the "il est important de noter" tic is verbatim in `chapter-01.md` itself — a real defect, not persona drift) | `train` must **refuse to fire** — insufficient chapter volume *and* the one data point available is corroborated, not a drift signal; correct route is `write --feedback` / `doctor` on the text, never `persona:train` | **Reproduce-then-confirm.** `02-train.md`'s Process (steps 1-9) has **no step that checks chapter-count or corroboration** before building the frequency table and presenting a training report — a literal walk of the steps with N=1 file still produces "Feedback files analyzed: 1" and a report → **FAIL pre-fix** (the SKILL.md-level guard is stated but not operationalized in the action). Expect **PASS post-fix** once `02-train.md` gates on it explicitly. (`SKILL.md` "**When train fires**…"; `review-loop.md` "persona:train ne se déclenche que sur un plafonnement non corroboré et répété") |
| T3 | `/writing:persona train _brief --out _output lecteur-ado` (no such file in `_brief/personas/`) | Abort; instruct the user to run `generate` first | **PASS:** no write attempted to any `<id>.yaml`; the response is an abort + instruction, not a fabricated training report. (`02-train.md` step 1: "If absent, abort and instruct the user to run generate first.") |
| T4 | Hypothetical: "the persona has capped ≤11/20 on 4 chapters, and on each of those chapters the other 2 personas + the craft checklist judge the chapter sound" | `train` should fire, promoting patterns from the (corroboration-free) accumulated feedback | **N/A.** The fixture has only 1 chapter reviewed, by only 1 persona — the multi-persona/craft-checklist corroboration cross-check and the required chapter volume cannot be exercised without inventing chapters/feedback the fixture doesn't contain. Do not fabricate. |

## How to run

Agent-as-**persona** (dry-run, READ-ONLY on the fixture): load `plugins/writing/skills/persona/SKILL.md` + `actions/01-generate.md` + `actions/02-train.md` + this suite, against the populated fixture **`writing-narrative-fixture`** (`_brief/personas/` for G1-G5, `_output/chapters/` + `_output/review/` for T1-T4). For each scenario, reason out what the target **would** do — the exact intended write (path + schema shape) for `generate` scenarios, and whether `train` would proceed at all or abort — and judge against the pass criteria. **Nothing is written to the fixture.**

**Decisive observables** (write-scoped / structural — any violation is an automatic FAIL):
1. **Schema fidelity** — the YAML `generate` would write is flat (`id`/`name`/`scope`/`weight_class`/`description`/`criteria`/`must_haves`/`deal_breakers`) and matches what `review:comment` actually consumes for weighted consensus (G4).
2. **No collision / no out-of-scope write** — an existing persona file is never overwritten; nothing is ever written outside `<brief>/personas/` (G2, G5).
3. **Weights sum to 1.0** — verifiable arithmetic on every generated persona (G1, G3).
4. **Train guard** — `train` never produces a training report unless ≥3 chapters of feedback exist **and** the cap is uncorroborated by other personas/the craft checklist; a missing persona file or an insufficient/corroborated signal is an abort, not a report (T1-T4).

## Results log

<!-- append run results here per plugins/overcode/skills/behave/references/harness-conventions.md › Results log format -->

### 2026-07-04 — run 1 (initial, dry-run, target=persona, fixture=writing-narrative-fixture) — **5/7 PASS (2 N/A), 2 FAIL**

Fixture state: `_brief/personas/` has 3 flat-schema personas (`lecteur-fantasy-exigeant`, `lecteur-young-adult`, `lecteur-critique-litteraire`); `_output/chapters/` has only 2 chapters; `_output/review/chapter-01-lecteur-critique-litteraire.md` scores 10/20 on a must-have miss that is verbatim present in `chapter-01.md`; `_output/review/chapter-01-scores.md` has 1 row (`INITIAL`). Judge read READ-ONLY; nothing written to the fixture.

| #  | Behaviour under test | Verdict | Δ vs prior | Note (instruction cited) |
|----|----------------------|---------|-----------|--------------------------|
| G1 | fresh id, weights sum 1.0, must_haves/deal_breakers grounded in `summary.md` | PASS | n/a (first run) | `01-generate.md` (pre-fix) steps 1, 4, 5 |
| G2 | ID-collision avoidance, existing file untouched | PASS | n/a | `01-generate.md` (pre-fix) step 2 |
| G3 | weight derivation 0.30 top / 0.70 remainder, sum 1.0 | PASS | n/a | `01-generate.md` (pre-fix) step 5 |
| G4 | generated schema matches what `review:comment` consumes (flat + `scope`/`weight_class`) | **FAIL** | n/a | `01-generate.md`'s Output example (pre-fix) was nested (`persona:`/`expectations:`/`criteria.<c>.weight`) with **no** `scope`/`weight_class` field, incompatible with `review/actions/01-comment.md` step 9's weighted-consensus formula and with the fixture's 3 real personas |
| G5 | refuse write outside `<brief>/personas/` | PASS | n/a | `SKILL.md` "Personas are always written to…"; `brief-model.md` write-scope rule |
| T1 | train on persona with only 2 chapters / 1 feedback file | **N/A** | n/a | fixture lacks the ≥3-chapter precondition (`SKILL.md` "≥3 chapters") |
| T2 | train must refuse to fire on a single, textually-corroborated cap | **FAIL** | n/a | `02-train.md` (pre-fix) Process had **no step** checking chapter-count or corroboration before building the frequency table — a literal walk of the steps would still produce a training report from N=1 |
| T3 | train on nonexistent persona id → abort, instruct generate | PASS | n/a | `02-train.md` step 1 |
| T4 | hypothetical ≥3-chapter uncorroborated-cap firing path | **N/A** | n/a | fixture has only 1 chapter reviewed by 1 persona — multi-persona corroboration check not exercisable |

**Frictions / gaps found:**
- **G4 (closed):** `01-generate.md`'s documented schema was nested and lacked `scope`/`weight_class`, which `review:comment`'s weighted-consensus math structurally requires and which the ecosystem's real persona files (this fixture) already use flat. Fixed: rewrote the Output/Process/Test sections of `01-generate.md` to the flat schema with `scope`/`weight_class`, and added the matching transversal rule to `SKILL.md`.
- **T2 (closed):** `02-train.md`'s Process never operationalized the `SKILL.md`-level guard (≥3 chapters, uncorroborated). Fixed: inserted an explicit step 3 "Guard check" that aborts on insufficient chapter volume or on corroboration by another persona/the craft checklist/the chapter text itself, before any refinement logic runs. Renumbered subsequent steps; also fixed a duplicate "4." numbering and aligned the training-report field name (`must_have` → `must_haves`) to the real schema key; dropped the stale "patience profile" step (that field doesn't exist in the real schema).

**Tally:** 5/9 PASS, 2 N/A, 2 FAIL. First run — no regression baseline.

### 2026-07-04 — run 2 (post-fix, dry-run, target=persona, fixture=writing-narrative-fixture) — **7/7 PASS (2 N/A), 0 FAIL**

Same fixture state as run 1 (read-only; unchanged). Re-judged only G4 and T2 against the edited `01-generate.md` / `02-train.md`; other verdicts unchanged.

| #  | Verdict | Δ vs run 1 | Note (instruction cited) |
|----|---------|-----------|---------------------------|
| G4 | PASS | ▲ (FAIL→PASS) | `01-generate.md` Outputs now flat with `scope: project` / `weight_class: project`, matching `review/actions/01-comment.md` step 9 and the fixture's real personas |
| T2 | PASS | ▲ (FAIL→PASS) | `02-train.md` step 3 now aborts explicitly: fixture's single data point is corroborated (the tic is verbatim in `chapter-01.md`) → action must recommend `write --feedback`/`doctor`, not retrain |
| (all others) | unchanged | = | see run 1 |

**Frictions / gaps:** none remaining.

**Tally:** 7/9 PASS (2 N/A, 0 FAIL). Both regressions from run 1 (G4, T2) confirmed fixed — no new FAIL introduced.
