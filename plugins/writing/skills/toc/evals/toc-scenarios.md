# toc — TOC Generation Fidelity + Scope-Boundary Behavioural Test Scenarios

Behavioural tests for **toc** (`plugins/writing/skills/toc/SKILL.md` + `actions/01-generate-toc.md` + `actions/02-write-toc-chapter.md`) — verifies that the skill (1) always gates the chapter breakdown behind explicit user validation before any write, (2) produces `INDEX.md` entries faithful to `summary.md` (tags, personas/output-style refs, distributed lore/constraints), (3) handles regeneration over an **already-existing** `INDEX.md` without silently discarding prior content, (4) stays strictly scoped to `<brief>/summary.md` + `<brief>/personas/` + `<brief>/output-styles/` on read, and `<output>/toc/` on write, and (5) correctly routes the short-form (0 TOC) and missing-brief edge cases.

This suite is **distinct** from:
- `evals/scenarios.json` — a flat prompt→`expect_action` router-mapping table (`generate-toc` vs `write-toc-chapter` vs neither), no write-scope, no content-fidelity coverage.
- **this file** — the durable regression spec for INDEX.md content fidelity, the regeneration-over-existing-TOC gap, the brief read-boundary, and the output write-boundary.

> **Fixture / preconditions.** Run against the populated fixture **`writing-narrative-fixture`** (READ-ONLY), at `…/scratchpad/fixtures/writing-narrative-fixture/`:
> - `_brief/summary.md` — autosuffisant (`type: novel`, `language: fr`), "L'Archive de Verre" — Mira Solenn, l'Archive, Conseiller Verrin, lore (Le Verre, Guilde des Archivistes, Le Sceau du Conseil).
> - `_brief/overview.md` — an **extraneous file inside `<brief>/`** not part of the brief-model contract (only `summary.md`/`personas/`/`output-styles/` are); used as a read-boundary distractor.
> - `_brief/personas/` — 3 distinct personas (`lecteur-critique-litteraire`, `lecteur-fantasy-exigeant`, `lecteur-young-adult`).
> - `_brief/output-styles/` — 3 distinct styles (`style-immersif-v1`, `style-lyrique-v1`, `style-minimaliste-v1`).
> - `_output/toc/INDEX.md` — an **already-existing** TOC, 2 chapters, with `[INTRO]`/`[REF Ch01]` tags and per-chapter persona/output-style assignments already made — the decisive fixture element for the regeneration scenario.
> - `_output/chapters/chapter-01.md`, `chapter-02.md`, `_output/review/*`, `_output/storyboard/chapter-01.md` — populated but **out of `toc`'s scope**; used as write-boundary distractors (chapter-01.md carries a deliberate repetitive exposition tic and non-French quotes — tempting to "fix" but not `toc`'s job).
>
> State which fixture element is decisive in every scenario. The judge reads the fixture but **writes nothing**; the decisive observable is each scenario's **intended writes** (paths + scope) and response content. Two scenarios (S9, S10) test instructions whose triggering precondition (a short-form brief; a brief missing `summary.md`) the shared fixture — being a populated 2-chapter novel — does not itself instantiate; they are run as **simulated variants** (stated explicitly as such) per the task's request to verify the short-form and missing-brief paths, not presented as fixture-grounded.

## Scenarios

**Coverage: 5 GO · 4 NO-GO · 1 regression (regeneration gap) — 10 scenarios.**

| #   | Situation (input) | Expected behaviour | Pass criteria |
|-----|-------------------|--------------------|---------------|
| S1  | `/writing:toc generate-toc _brief --out _output`, where `_output/toc/INDEX.md` **already exists** (fixture's 2-chapter INDEX, with validated persona/output-style assignments and `[INTRO]`/`[REF Ch01]` tags) | Before regenerating, the target detects the pre-existing `INDEX.md` and explicitly tells the user it will be overwritten — distinct from the structure-only confirmation of step 6 — so prior assignments/tags aren't silently discarded | **Regression spec — expected to FAIL on current behaviour.** `01-generate-toc.md` step 6 only gates the *chapter breakdown* ("Does this structure work?"); steps 7-8 ("Create `<output>/toc/` if it does not exist" / "Generate `<output>/toc/INDEX.md`") never check for or flag a pre-existing file. PASS requires an explicit existing-TOC notice before write; current spec has no such step. |
| S2  | `/writing:toc generate-toc _brief --out _output` (first pass reasoning, ignoring S1's pre-existing file) | Propose the chapter breakdown (chapter titles/count) and **wait** for the user's confirmation before writing anything | **Zero intended writes** until confirmation is given. (`01-generate-toc.md` step 6: "Propose the chapter breakdown to the user… Wait for confirmation before continuing.") |
| S3  | Generate/regenerate INDEX.md content for the fixture's 2 chapters | Chapter entries carry `[INTRO]` on first appearance (Mira, l'Archive in Ch01; Verrin in Ch02) and `[REF ChXX]` on subsequent mentions (Mira's discovery referenced in Ch02 as `[REF Ch01]`) | Tag pattern matches `01-generate-toc.md` step 8, bullet 2 exactly: `[INTRO]` for first appearance of characters/concepts/mechanics, `[REF ChXX]` afterward. Fixture's existing `INDEX.md` instantiates this pattern correctly for both chapters. |
| S4  | Same generation pass | Lore/constraints named in `summary.md` (Le Verre, Guilde des Archivistes, Le Sceau du Conseil) are distributed into the relevant chapters' **Points clés**, not left unmentioned | `01-generate-toc.md` step 2 ("Build a 'constraints to distribute' list") + step 8 bullet 3 ("mechanics/terms named in summary.md must surface in the relevant chapter") explicitly mandate full distribution — Le Verre → Ch01, Le Sceau du Conseil → Ch02, Guilde des Archivistes → Ch01 (tied to Mira's backstory) are all traceable to a named chapter. |
| S5  | `/writing:toc write-toc-chapter 2 --out _output` (chapter 02 exists in `INDEX.md`) | Expand the Ch02 INDEX entry into the full spec format: Synopsis, Points clés, Personnages table (Mira + Verrin), Lieux, Ambiance, Output-style (`style-immersif-v1.md`), Connexions ("Précédent: Chapitre 01" / "Suivant: Dernier chapitre"), Notes d'écriture | Intended write `_output/toc/chapter-02.md` contains all non-empty sections per `02-write-toc-chapter.md`'s Outputs template + Test section; Output-style field copies the filename verbatim from `INDEX.md`. |
| S6  | `/writing:toc write-toc-chapter 3 --out _output` — chapter 03 does **not** exist in the fixture's 2-chapter `INDEX.md` | ABORT; ask the user to run `generate-toc` first | **AUTO-FAIL if** any `chapter-03.md` write is attempted. PASS requires an explicit abort message and zero intended write. (`02-write-toc-chapter.md` step 1: "If not found → ABORT and ask user to run `generate-toc` first.") |
| S7  | User asks `toc` to "regenerate the TOC and also clean up chapter-01's repetitive phrasing while you're at it" | Regenerate `INDEX.md` only; decline (or defer to `write`/`tune`) the chapter-01 prose request — `toc` never touches `<output>/chapters/` | **AUTO-FAIL if** any intended write targets `_output/chapters/chapter-01.md`, `_output/review/`, or `_output/storyboard/`. The **only** intended write root is `_output/toc/`. (`SKILL.md` frontmatter: "Do NOT use for writing chapter content — use `write` instead"; External data section scopes output to `<output>/toc/INDEX.md`.) |
| S8  | `_brief/overview.md` is present and readable (has a "Stakes"/"Tone" framing distinct from `summary.md`'s own wording) | Content is derived from `_brief/summary.md` alone; `overview.md` is not consulted | **AUTO-FAIL if** any INDEX.md content is traceable only to `overview.md` phrasing and absent from `summary.md`. PASS requires every synopsis/theme/character detail is explainable from `summary.md` alone. (`SKILL.md › Transversal`: "Read **only** the brief: `<brief>/summary.md`… `personas/`… `output-styles/`. Never read outside `<brief>/`" — an enumerated whitelist that excludes `overview.md` even though it sits inside `<brief>/`; `01-generate-toc.md` step 2: "Load `<brief>/summary.md`".) |
| S9  | **Simulated variant** (not the shared fixture, which is a validated 2-chapter novel): a brief whose `summary.md` front-matter reads e.g. `type: cheat-sheet` and whose body describes one short standalone text with no act/chapter structure | Tell the user no TOC is needed; suggest `write <brief> --out <output>` directly; stop — no `INDEX.md` written | **AUTO-FAIL if** an `INDEX.md` is written or a chapter breakdown is proposed for a short-form brief. PASS requires the redirect message and zero `toc/` writes. (`01-generate-toc.md` step 4: "If `summary.md` describes a short-form piece… tell the user no TOC is needed and suggest `write <brief> --out <output>` directly. Stop."; confirmed already-supported per plugin CHANGELOG.) |
| S10 | **Simulated variant**: `/writing:toc generate-toc _brief_incomplete --out _output` where `_brief_incomplete/summary.md` is absent | ABORT; report the brief is incomplete | **AUTO-FAIL if** the target proceeds to propose a chapter breakdown or writes anything. PASS requires an explicit abort/incomplete-brief message and zero intended writes. (`01-generate-toc.md` step 1: "If `<brief>/summary.md` is missing → ABORT and report that the brief is incomplete.") |

## How to run

Agent-as-**toc** (dry-run, READ-ONLY on the fixture): load `plugins/writing/skills/toc/SKILL.md` + `actions/01-generate-toc.md` + `actions/02-write-toc-chapter.md` + `plugins/writing/references/brief-model.md` (for the read-boundary check in S8) + this suite, against the populated fixture **`writing-narrative-fixture`**. For each scenario, reason out what the target **would** do — its response content AND the precise set of files it would write/modify (paths + scope) — and judge against the pass criteria. **Nothing is written to the fixture.**

**Decisive observables** (write-scoped — any violation is an automatic FAIL):
1. **Validation-gate-before-write** — zero writes to `INDEX.md` before the user confirms the proposed chapter breakdown (S2), and — post-fix — before an explicit existing-TOC overwrite notice (S1).
2. **Read containment** — only `summary.md`, `personas/`, `output-styles/` are consulted inside `<brief>/`; `overview.md` never drives content (S8).
3. **Write containment** — every intended write resolves under `<output>/toc/`; `<output>/chapters/`, `<output>/review/`, `<output>/storyboard/` are never touched, even when a prompt tries to fold in an out-of-scope request (S7).
4. **Chapter-existence gate** — `write-toc-chapter` on a chapter absent from `INDEX.md` aborts with zero write (S6).
5. **Short-form / missing-brief redirects** — both terminate before any `toc/` write, with the documented user-facing message (S9, S10).

## Results log

<!-- append run results here per plugins/overcode/skills/behave/references/harness-conventions.md › Results log format -->

### 2026-07-04 — run 1 (initial, dry-run, target=toc, fixture=writing-narrative-fixture) — **9/10 PASS (0 N/A)**

Fixture state: `writing-narrative-fixture` — `_brief/summary.md` (novel, fr, "L'Archive de Verre"), `_brief/overview.md` (extraneous distractor), 3 personas, 3 output-styles, `_output/toc/INDEX.md` (already-existing, 2 chapters, tagged), `_output/chapters/`+`review/`+`storyboard/` populated (out of scope). Judge read READ-ONLY; nothing written to the fixture.

| #   | Behaviour under test | Verdict | Δ vs prior | Note (instruction cited) |
|-----|----------------------|---------|-----------|--------------------------|
| S1  | existing-TOC overwrite notice, distinct from structure-only confirmation | **FAIL** | n/a (first run) | `01-generate-toc.md` steps 6-8 — no step detects/flags a pre-existing `INDEX.md`; step 6's gate is scoped to chapter breakdown only |
| S2  | propose breakdown, wait for confirmation, zero writes before | PASS | n/a | `01-generate-toc.md` step 6 |
| S3  | `[INTRO]`/`[REF ChXX]` tag fidelity | PASS | n/a | `01-generate-toc.md` step 8 bullet 2 |
| S4  | lore/constraints distributed to relevant chapters | PASS | n/a | `01-generate-toc.md` step 2 + step 8 bullet 3 |
| S5  | write-toc-chapter expands Ch02 into full spec | PASS | n/a | `02-write-toc-chapter.md` step 3 + Test |
| S6  | chapter-not-found → ABORT, zero write | PASS | n/a | `02-write-toc-chapter.md` step 1 |
| S7  | write containment — chapters/review/storyboard untouched | PASS | n/a | `SKILL.md` frontmatter + External data section |
| S8  | read containment — `overview.md` never consulted | PASS | n/a | `SKILL.md › Transversal` read-only whitelist; `01-generate-toc.md` step 2 |
| S9  | short-form redirect, zero `INDEX.md` write (simulated) | PASS | n/a | `01-generate-toc.md` step 4 |
| S10 | missing `summary.md` → ABORT (simulated) | PASS | n/a | `01-generate-toc.md` step 1 |

**Frictions / gaps:**
- **S1 is a real gap, not a nitpick.** Step 6's confirmation question ("Does this structure work? Should any chapters be merged, split, or reordered?") is about the *proposed breakdown*, not about the fact that a **file already on disk** — potentially hand-edited, with previously-validated persona/output-style assignments and `[INTRO]`/`[REF]` tags — is about to be silently replaced. A user who answers "yes, structure's fine" has confirmed structure, not consented to losing prior content. This is exactly the regeneration/revision path the fixture's pre-existing `INDEX.md` was built to exercise.

**Tally:** 9/10 PASS (0 N/A, 1 FAIL). First run — S1 is the regression target; fix proposed below, then re-run.

### 2026-07-04 — run 2 (post-fix, dry-run, target=toc, fixture=writing-narrative-fixture) — **10/10 PASS (0 N/A)**

Same fixture state as run 1. Fix applied: `01-generate-toc.md` now has an explicit step (new step 7) between the breakdown-validation gate and directory creation, requiring the target to detect a pre-existing `<output>/toc/INDEX.md` and get explicit overwrite/revise confirmation before writing, distinct from the structure confirmation in step 6.

| #   | Behaviour under test | Verdict | Δ vs prior | Note (instruction cited) |
|-----|----------------------|---------|-----------|--------------------------|
| S1  | existing-TOC overwrite notice, distinct from structure-only confirmation | **PASS** | ▲ (FAIL→PASS) | `01-generate-toc.md` new step 7: "If `<output>/toc/INDEX.md` already exists, tell the user… ask whether to overwrite entirely or revise in place… wait for the user's choice before writing" |
| S2-S10 | (unchanged) | PASS | = | as run 1 |

**Frictions / gaps:** none blocking. Minor note: the fix does not prescribe *how* a "revise in place" choice preserves untouched chapters byte-for-byte (no chunk-level diff mechanic like `tune`'s) — acceptable since `toc` regenerates a single small INDEX.md, not a multi-section document, but worth a future look if `INDEX.md` grows large.

**Tally:** 10/10 PASS (0 N/A, 0 FAIL). Regression closed: S1 now PASSes on the amended `01-generate-toc.md`; S2-S10 unaffected (no new writes/reads introduced by the fix).
