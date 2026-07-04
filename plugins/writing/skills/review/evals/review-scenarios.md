# review — Comment/Doctor Convergence Loop + Craft-Checklist Gate Behavioural Test Scenarios

Behavioural tests for **review** (`plugins/writing/skills/review/SKILL.md` + `actions/01-comment.md` + `actions/02-doctor.md`) — verifies that the skill (1) runs `comment`'s mandatory pre-scoring checks (redundancy, craft checklist) and convergence bookkeeping (`Δ`, `INITIAL`/`CONTINUE`/`PLATEAU`, score-history row) exactly as specified, (2) applies `doctor`'s technical corrections bounded by priority and never leans on persona judgment, and (3) keeps `doctor`'s own rewrite-routing self-check aligned with `comment`'s full triage rule — not a truncated paraphrase of it.

This suite is **distinct** from:
- `evals/scenarios.json` (if any router-mapping table exists) — trigger-to-action selection, not loop mechanics.
- **this file** — the durable regression spec for `comment`'s scoring/convergence mechanics and `doctor`'s correction/routing behaviour.

> **Fixture / preconditions.** Run against the populated fixture **`writing-narrative-fixture`** (READ-ONLY), at `…/scratchpad/fixtures/writing-narrative-fixture/`:
> - `_brief/summary.md` — `type: novel`, `language: fr`, autosuffisant (L'Archive de Verre, 2 chapitres).
> - `_brief/personas/` — 3 distinct personas, none declaring a document-type discriminator field: `lecteur-critique-litteraire.yaml` (must-have: no exposition tic), `lecteur-fantasy-exigeant.yaml` (must-haves: lore consistency + a sensory Archive-speaks scene), `lecteur-young-adult.yaml` (must-have: chapter ends on tension/question).
> - `_brief/output-styles/style-immersif-v1.md` — French guillemets « », 3rd-limited POV, medium sensory density (the one referenced for both chapters).
> - `_output/chapters/chapter-01.md` — carries the deliberate exposition tic ("Il est important de noter que… Il est également important de noter que…") and English quotes (`"…"`) instead of French guillemets.
> - `_output/chapters/chapter-02.md` — clean: no tic, French guillemets already in place, ends on an open tension ("Elle ne répondit pas tout de suite.").
> - `_output/review/chapter-01-lecteur-critique-litteraire.md` — **pre-existing** feedback: 🔴 must-have miss (the tic), 🟡 guillemets, consensus 10/20, verdict ❌, route `write --feedback`.
> - `_output/review/chapter-01-scores.md` — **pre-existing** 1-row history: Iter 1, 2026-06-28, 10/20, Δ=—, `INITIAL`.
> - No `chapter-02-*` review files exist yet — clean slate for the fresh-`comment` scenarios.
> - `_output/storyboard/chapter-01.md` and `_output/toc/INDEX.md` also exist — distractors used to test the read/write boundary (`<brief>/` + `<output>/chapters,review` only).
>
> State which chapter and which pre-existing artifact is under test in every run. The judge reads the fixture but **writes nothing**; the decisive observable is each scenario's **intended writes** (paths + scope) and the exact arithmetic/routing it produces. **Never fabricate fixture state** (e.g. a 5-row score history) to force a scenario — mark it **N/A** instead and say what the fixture is missing.

## Scenarios

**Coverage: 7 GO · 3 NO-GO · 1 boundary (N/A) — 11 scenarios.**

| #   | Situation (input) | Expected behaviour | Pass criteria |
|-----|-------------------|--------------------|---------------|
| S1  | `comment _output/chapters/chapter-02.md --brief _brief` — no `chapter-02-*` history exists | Auto-select personas (no type discriminator on any persona file → all 3 loaded); run mandatory pre-scoring checks incl. craft checklist (NOVEL N1-N6); write one file per persona + `chapter-02-scores.md` row 1, verdict `INITIAL` | **FAIL pre-fix:** step 5c ("answer all checklist questions… NOVEL: N1-N6") cannot be executed — nowhere in `SKILL.md`/`01-comment.md`/`review-loop.md` are N1-N6 defined, so "a question without an answer invalidates the review" is unavoidably triggered. **PASS post-fix:** N1-N6 answerable from the inlined checklist; `INITIAL` verdict recorded, arithmetic verifiable (`01-comment.md` steps 3, 5c, 12) |
| S2  | `comment chapter-01.md`, simulating a **hypothetical** post-fix iteration where the tic and guillemets are both corrected, consensus rises to **15.0/20** | `Δ = |15.0 − 10| = 5.0` ≥ 1.0 → verdict `CONTINUE`; route (≥14) → `doctor` (optional only); new row appended to `chapter-01-scores.md` | **FAIL pre-fix** (same root cause as S1 — step 5c blocks every `comment` run). **PASS post-fix:** Δ and verdict computed correctly, route matches the ≥14 band (`01-comment.md` step 12; Section-3 routing table) |
| S3  | `comment chapter-01.md`, simulating a hypothetical iteration with only a **marginal** improvement, consensus **10.6/20** | `Δ = 0.6` < 1.0 → verdict `PLATEAU` **even though** the score is still low and the must-have-capped persona is still ≤11 | **FAIL pre-fix** (same root cause as S1). **PASS post-fix:** `PLATEAU` correctly declared despite the low score (`review-loop.md` "un PLATEAU n'implique pas un bon score"); **AUTO-FAIL condition never triggers**: verdict must never be `PLATEAU` while `Δ ≥ 1.0` — here Δ=0.6 so PLATEAU is legitimate (`01-comment.md` step 12: "Never emit PLATEAU when Δ ≥ 1.0") |
| S4  | `comment chapter-02.md` (same invocation as S1) — redundancy check against `chapter-01.md`'s NPC/term inventory (Mira, "Guilde des Archivistes" both appear in ch.01) | Ch.02 re-references "la Guilde des Archivistes" as a narrative callback, **not** a re-explained term → **no** `[REDUNDANCY]` flag | **PASS:** no false-positive redundancy flag for a bare callback (vs. a re-*described*/re-*translated* term); the check itself is still run and documented as performed (`01-comment.md` step 5b) |
| S5  | `doctor chapter-01.md --brief _brief` (no `--remarks`), `--dry-run` | Scan finds: 🟡 English quotes → French guillemets (typography); 🟢 the "il est important de noter" repetition (doctor's **own** repetition scan, not a persona must-have) — categorized **Optional**, not Critical, since no `--remarks` fed it in; report only, **zero file writes** | **PASS:** guillemets flagged 🟡, tic flagged 🟢 (not 🔴) absent `--remarks`; `chapter-01.md` unmodified; dry-run report lists ≥1 correction (`02-doctor.md` steps 6, 9) |
| S6  | `doctor chapter-01.md --remarks _output/review/chapter-01-lecteur-critique-litteraire.md --brief _brief` (real run, not dry-run) — the **same** invocation also exercises `doctor`'s own rewrite-routing self-check (step 11), given `chapter-01-scores.md` already records consensus 10/20 with only **1** persona evaluated (capped ≤11) | The must-have tic from the remarks file is added as a 🔴 Critical correction and fixed; guillemets fixed 🟡; changelog appended; **and** doctor's step-11 self-check should recommend `write --feedback` instead of proceeding (since comment's own triage rule fires on consensus ≤10/20 alone, independent of the persona-count clause) | **FAIL pre-fix:** `02-doctor.md` step 11 as written only checks "≥2 personas capped ≤11/20" — here only **1** persona was evaluated, so the literal condition never fires even though consensus (10/20) already meets `review-loop.md`'s independent "≤10/20" trigger; `SKILL.md`'s own paraphrase (line "Routing from `comment` to rewrite…") likewise omits the consensus-alone clause. **PASS post-fix:** step 11 (and the `SKILL.md` paraphrase) now OR's in "consensus ≤10/20", correctly recommending `write --feedback` on this exact fixture state (`review-loop.md` › Routes de triage, row 1) |
| S7  | `doctor chapter-01.md --remarks "corriger les guillemets anglais" --brief _brief` (inline string, not a `.md` path) | Treat the value as an inline note, not a file lookup; add it as a 🔴 Critical correction directly | **PASS:** no file-read attempted on the literal string; the guillemets correction is added as 🔴 Critical exactly as a file-sourced remark would be (`02-doctor.md` step 4: "if value ends with `.md` → file path… Else treat as inline string") |
| DN1 | `doctor`/`comment` invoked with `--brief <nonexistent-dir>` (no `summary.md` reachable) | ABORT immediately; report the brief as incomplete; **zero** reads/writes under `<output>/` | **AUTO-FAIL if** the target proceeds to score/correct despite the missing `summary.md`. PASS requires an explicit ABORT and incompleteness report (`01-comment.md` step 1; `02-doctor.md` step 1) |
| DN2 | Real (non-dry-run) `doctor chapter-01.md` run (S6's continuation) | Corrections appended to the **cumulative** `chapter-01-changelog.md`; **no** `.bak` backup file created anywhere | **AUTO-FAIL if** any `*.bak` file is among the intended writes, or if the changelog write **replaces** rather than **appends**. PASS requires changelog append only, chapter file modified in place, no backup artifact (`02-doctor.md` step 10: "do NOT create `.bak` backup files") |
| DN3 | Any `comment`/`doctor` invocation on this fixture, which also contains `_output/storyboard/chapter-01.md` and `_output/toc/INDEX.md` (both outside `review`'s declared inputs) | Neither file is read as an input nor touched as an output; `review` operates strictly on `<brief>/personas,output-styles,summary.md` + `<output>/chapters,review` | **AUTO-FAIL if** any intended read/write targets `storyboard/` or is justified by content from `toc/INDEX.md` (e.g. its per-chapter "Personas:" annotation silently overriding `comment`'s own auto-select rule). PASS requires the scope stays exactly `<brief>/` + `<output>/chapters,review` (`SKILL.md`: "`review` never reads outside `<brief>/` and `<output>/`") |
| CAP | A hypothetical `chapter-01-scores.md` with **5** prior rows, none `PLATEAU` — **this exact file does not exist in the fixture** (only 1 row is present) | *(reasoned only, not executed)* On a real 5-row file, the 5th `comment` pass would emit `CAP-ITERATIONS` regardless of `Δ`, never fabricating a `PLATEAU` to stop cleanly | **N/A — missing precondition.** The fixture's `chapter-01-scores.md` has exactly 1 row; a 5-row history is not fabricated to force this scenario (per harness invariant: reproduce on real fixture state only). Recorded here as a reasoned N/A, not a PASS: *if* the file had 5 rows, `01-comment.md` step 12 ("hard stop at 5 iterations → `CAP-ITERATIONS`… never declare PLATEAU when Δ ≥ 1.0") would apply |

## How to run

Agent-as-**review** (dry-run, READ-ONLY on the fixture): load `plugins/writing/skills/review/SKILL.md` + `actions/01-comment.md` + `actions/02-doctor.md` + `references/review-loop.md` + `references/brief-model.md` + this suite, against the populated fixture **`writing-narrative-fixture`**. For each scenario, reason out what the target **would** do — the exact report/correction content AND the precise intended writes (which file, which section, which priority tag) — and judge against the pass criteria. **Nothing is written to the fixture.**

**Decisive observables** (write/routing-scoped — any violation is an automatic FAIL):
1. **Craft checklist must be answerable** — `comment` cannot validly complete step 5c if the referenced checklist items (NOVEL N1-N6 etc.) are undefined (S1, S2, S3).
2. **PLATEAU never declared while `Δ ≥ 1.0`**, and conversely correctly declared on a low-but-marginal score (S2, S3).
3. **No false-positive redundancy** on a bare narrative callback vs. an actual re-description (S4).
4. **Doctor's own priority categorization differs from persona-fed remarks** — the same textual issue is 🟢 Optional when doctor finds it unaided vs. 🔴 Critical when routed through `--remarks` (S5 vs. S6).
5. **Doctor's rewrite-routing self-check must mirror `comment`'s full triage rule** (consensus ≤10/20 OR ≥2 personas capped), not a truncated one-branch paraphrase (S6).
6. **Abort on incomplete brief, no `.bak` files, append-only changelog** (DN1, DN2).
7. **Strict read/write containment to `<brief>/` + `<output>/chapters,review`** — `toc/`, `storyboard/` are never consulted or touched (DN3).

## Results log

<!-- append run results here per plugins/overcode/skills/behave/references/harness-conventions.md › Results log format -->

### 2026-07-04 — run 1 (initial, dry-run, target=review, fixture=writing-narrative-fixture) — **6/10 PASS (1 N/A) — 4 FAIL**

Fixture state: `chapter-01.md` (tic + English quotes), `chapter-02.md` (clean), `chapter-01-lecteur-critique-litteraire.md` + `chapter-01-scores.md` (1 row, Iter 1, 10/20, INITIAL) pre-existing, no `chapter-02-*` review files yet. Judge read READ-ONLY; nothing written to the fixture.

| #   | Behaviour under test | Verdict | Δ vs prior | Note (instruction cited) |
|-----|----------------------|---------|-----------|--------------------------|
| S1  | fresh `comment` chapter-02, craft checklist N1-N6 | **FAIL** | n/a (first run) | `01-comment.md` step 5c references NOVEL N1-N6/RULES R1-R5/SCENARIO S1-S5 nowhere defined in the plugin — unanswerable, invalidates every review |
| S2  | Δ=5.0 → CONTINUE, route=doctor | **FAIL** | n/a | same root cause as S1 (step 5c blocks all `comment` runs) |
| S3  | Δ=0.6 → PLATEAU at low score | **FAIL** | n/a | same root cause as S1 |
| S4  | redundancy check, no false positive on callback | PASS | n/a | `01-comment.md` step 5b |
| S5  | doctor dry-run, tic=🟢 vs guillemets=🟡, no write | PASS | n/a | `02-doctor.md` steps 6, 9 |
| S6  | doctor routing self-check (consensus ≤10, 1 persona only) | **FAIL** | n/a | `02-doctor.md` step 11 only checked "≥2 personas capped", missing the consensus-≤10-alone branch from `review-loop.md`'s actual triage table; `SKILL.md`'s own paraphrase had the same omission |
| S7  | inline `--remarks` string treated as note, not file path | PASS | n/a | `02-doctor.md` step 4 |
| DN1 | ABORT on missing `summary.md` | PASS | n/a | `01-comment.md`/`02-doctor.md` step 1 |
| DN2 | changelog append-only, no `.bak` | PASS | n/a | `02-doctor.md` step 10 |
| DN3 | scope stays in `<brief>/`+`<output>/chapters,review`; `toc/`/`storyboard/` untouched | PASS | n/a | `SKILL.md` "never reads outside `<brief>/` and `<output>/`" |
| CAP | 5-row history — fixture only has 1 row | N/A | n/a | precondition missing, not fabricated |

**Frictions / gaps:**
- **Craft checklist undefined** (S1/S2/S3): `01-comment.md` step 5c and `SKILL.md` both reference NOVEL/RULES/SCENARIO checklist IDs that exist nowhere as actual questions — blocking, not cosmetic, since step 5c says an unanswered question "invalidates the review".
- **Doctor's rewrite-routing self-check truncated** (S6): `02-doctor.md` step 11 and `SKILL.md`'s inline paraphrase both stated only the "≥2 personas capped" branch of `review-loop.md`'s actual triage rule, silently dropping the independent "consensus ≤10/20" branch — provably wrong on this exact fixture (chapter-01: consensus 10/20, only 1 persona ever evaluated).

**Tally:** 6/10 PASS (1 N/A, 4 FAIL). Two real gaps found: craft-checklist definitions missing (root cause behind 3 FAILs) and doctor's routing self-check out of sync with `comment`'s own triage rule.

### 2026-07-04 — run 2 (post-fix, dry-run, target=review, fixture=writing-narrative-fixture) — **10/10 PASS (1 N/A) — 0 FAIL**

Same fixture state as run 1 (unchanged — read-only). Fixes applied: `01-comment.md` step 5c now inlines NOVEL N1-N6/RULES R1-R5/SCENARIO S1-S5 as concrete questions; `02-doctor.md` step 11 and `SKILL.md`'s routing paraphrase now OR in "consensus ≤10/20" alongside the persona-cap-count branch, matching `review-loop.md`'s actual triage table.

| #   | Behaviour under test | Verdict | Δ vs prior | Note (instruction cited) |
|-----|----------------------|---------|-----------|--------------------------|
| S1  | fresh `comment` chapter-02, craft checklist N1-N6 | PASS | ▲ (was FAIL) | `01-comment.md` step 5c now answerable inline |
| S2  | Δ=5.0 → CONTINUE, route=doctor | PASS | ▲ (was FAIL) | same fix as S1 |
| S3  | Δ=0.6 → PLATEAU at low score | PASS | ▲ (was FAIL) | same fix as S1 |
| S4  | redundancy check, no false positive on callback | PASS | = | `01-comment.md` step 5b |
| S5  | doctor dry-run, tic=🟢 vs guillemets=🟡, no write | PASS | = | `02-doctor.md` steps 6, 9 |
| S6  | doctor routing self-check (consensus ≤10, 1 persona only) | PASS | ▲ (was FAIL) | `02-doctor.md` step 11 now fires on consensus ≤10/20 alone; recommends `write --feedback` matching `chapter-01-scores.md`'s already-recorded route |
| S7  | inline `--remarks` string treated as note, not file path | PASS | = | `02-doctor.md` step 4 |
| DN1 | ABORT on missing `summary.md` | PASS | = | step 1 |
| DN2 | changelog append-only, no `.bak` | PASS | = | step 10 |
| DN3 | scope stays in `<brief>/`+`<output>/chapters,review` | PASS | = | `SKILL.md` scope rule |
| CAP | 5-row history — fixture only has 1 row | N/A | = | precondition still missing (unchanged) |

**Frictions / gaps (residual, none block a verdict):**
- **`toc/INDEX.md`'s per-chapter "Personas:" annotation is never consulted by `comment`** (surfaced while checking DN3): `toc/SKILL.md` itself lists only `write-toc-chapter` and `write` as INDEX.md's consumers, not `review` — so `comment`'s auto-select (by `document.type` only) and TOC's per-chapter persona assignment are two independent mechanisms that happen to diverge in this fixture (TOC assigns 2 personas to ch.01, 1 to ch.02; auto-select would load all 3 for both, since no persona file carries a type-discriminator field). Left unfixed: this is a cross-skill design question (whether TOC's annotation should feed `review`), not a defect inside `review`'s own contract, and fixing it would require editing `toc`'s contract too — out of this suite's edit scope.
- **Persona `weight_class` tiers (project ×1.0 / universe ×0.8 / global ×0.5) untested**: all 3 fixture personas share `weight_class: project`, so the consensus-weighting formula in `SKILL.md`/`01-comment.md` step 9 never actually discriminates in this fixture — a data limit, not a logic defect.

**Tally:** 10/10 PASS (1 N/A, 0 FAIL). Regression baseline established; both real gaps from run 1 (craft-checklist definitions, doctor routing self-check) confirmed fixed.
