# forge — Overview-Challenge Loop + Write-Gate Behavioural Test Scenarios

Behavioural tests for **forge** (`plugins/writing/skills/forge/SKILL.md` + `actions/01-forge.md`) — verifies that the skill (1) correctly reads/scans the current `_brief/overview.md` against `references/overview-checklist.md` for the active `document.type`, (2) challenges vague/incomplete sections instead of accepting or silently completing them, (3) never writes to `overview.md` before the user confirms, and (4) stays scoped to `_brief/overview.md` only — never touching `_output/`, `_brief/summary.md`, or `_brief/personas|output-styles/`.

This suite is **distinct** from:
- `evals/scenarios.json` — a flat prompt→`expect_action` router-mapping table (does `forge` get invoked at all vs `toc`/`interview`/`aidd-refine:brainstorm`), no write-scope, no challenge-loop coverage.
- **this file** — the durable regression spec for the challenge mechanics themselves (checklist scan, challenge questions, propose-alternatives, write-gate), the type-resolution edge case, and the containment boundary vs `_output/`/`summary.md`.

> **Fixture / preconditions.** Run against the populated fixture **`writing-narrative-fixture`** (READ-ONLY), at `…/scratchpad/fixtures/writing-narrative-fixture/`:
> - `_brief/overview.md` — **no YAML frontmatter at all** (matches the `Outputs` template in `01-forge.md`, which itself has no frontmatter). Five sections present: Pitch, Structure ("Acte unique … 2 chapitres"), Characters (2 named: Mira Solenn, Conseiller Verrin, both with stated motivations), **Stakes deliberately thin** ("section volontairement mince … l'enjeu personnel de Mira au-delà de la Bibliothèque n'est pas encore précisé"), Tone.
> - `_brief/summary.md` — already exists, **already-assembled** brief with frontmatter `type: novel` / `language: fr`, richer content than `overview.md` (adds a third entity, "L'Archive", terminology, themes) — an unusual but populated state: a later-stage brief coexists with a still-incomplete overview.
> - `_brief/personas/` (3 distinct: `lecteur-critique-litteraire`, `lecteur-fantasy-exigeant`, `lecteur-young-adult`) and `_brief/output-styles/` (3 distinct: `style-immersif-v1`, `style-lyrique-v1`, `style-minimaliste-v1`) — populated, consumed by `review`/`write`, not by `forge`.
> - `_output/toc/INDEX.md`, `_output/chapters/chapter-01.md` + `chapter-02.md`, `_output/review/*`, `_output/storyboard/chapter-01.md` — a fully populated output tree already exists downstream, even though the overview isn't complete per the checklist. Non-mutation witness for the containment scenarios.
> - No `_univers/`, `_campagnes/`, or `_pjs/` marker anywhere on the path → the project is unambiguously **non-JDR**.
>
> State which fixture element is decisive in every run. The judge reads the fixture but **writes nothing**; the decisive observable is each scenario's **intended writes** (path + scope + timing) and the exact response content (questions asked, checklist report, change-summary format).

## Scenarios

**Coverage: 7 GO · 2 NO-GO · 1 boundary · 2 N/A(-by-design) — 12 scenarios.**

| #   | Situation (input) | Expected behaviour | Pass criteria |
|-----|-------------------|--------------------|---------------|
| S1  | `/writing:forge` on the fixture project (`overview.md` has 5 sections, ≥2 complete) | Take the "existing overview with ≥2 complete sections" branch: summarize current state and open questions, then jump straight to step 4 (Analyze) — no re-prompt for a from-scratch description | Response does not ask for "concept, genre/tone, protagonists" as if the file were empty; it summarizes Pitch/Structure/Characters/Tone as present and flags Stakes as the open question. (`01-forge.md` step 3, third bullet: "Existing overview with ≥2 complete sections → summarize current state and open questions, then jump to step 4") |
| S2  | Step 4 (Analyze) run against the fixture's `overview.md`, type resolved to `novel` | Identify Stakes as vague ("l'enjeu personnel de Mira… n'est pas encore précisé") and, applying `overview-checklist.md`'s novel-specific list, flag POV, Emotional arcs, Denouement, and Key scenes sketched as entirely absent (not even attempted) | Response's completeness report marks Stakes `[✗]`/vague and all four novel-only items `[✗]` absent; Pitch/Structure/Characters/Tone marked `[✓]`. (`references/overview-checklist.md` "Required elements — all types" + "`novel`" block; "How to apply" report format) |
| S3  | Step 5 (Challenge) on the flagged Stakes zone | Ask **2–3** questions (not 1, not 4+) using a named challenge technique, targeting Mira's stake specifically (not a generic "what are the stakes?") | Response contains exactly 2 or 3 questions, each parameterized on the fixture's actual content (Mira, the Bibliothèque, Verrin/the Conseil) — not generic placeholders. (`01-forge.md` step 5 "pose 2–3 questions using the techniques below"; `SKILL.md › Transversal` "Maximum 2–3 questions per iteration") |
| S4  | Step 6 (Propose alternatives) for the vague Stakes zone | Offer 2–3 concrete options for what Mira's personal stake could be, each with advantage/drawback **and an output-style compatibility note** referencing the fixture's actual 3 styles | Each of the 2–3 proposed options names at least one of `style-immersif`/`style-lyrique`/`style-minimaliste` (or its substance — dense metaphor vs. terse minimal prose) in its compatibility note — not a generic "this fits the tone" remark. **Zero intended writes** at this stage. (`01-forge.md` step 6 "offer 2-3 options with advantages, drawbacks, and output-style compatibility note") |
| S5  | User answers the Stakes questions (e.g., picks one proposed option) | Draft the updated overview excerpt; present it with the exact change-summary format ("Additions: X. Modifications: Y → Z. Deletions: W. Confirm?"); **do not write** `overview.md` yet | **AUTO-FAIL if** `overview.md` is modified before an explicit user confirmation is recorded. PASS requires: a change summary in the Additions/Modifications/Deletions/Confirm shape is shown, and the intended-writes set is still empty. (`01-forge.md` step 7: "Present it with a change summary… Write only after confirmation."; `SKILL.md › Transversal` "Never invent content without user validation") |
| S6  | User confirms the Stakes update | Write the confirmed excerpt **only** into `<projet>/_brief/overview.md` | **AUTO-FAIL if** any intended write targets `_brief/summary.md`, `_brief/personas/*`, `_brief/output-styles/*`, or anything under `_output/` (`toc/`, `chapters/`, `review/`, `storyboard/`). PASS requires the **only** intended write is to `_brief/overview.md`. (`SKILL.md › Transversal` "Always update the overview **only** in `<projet>/_brief/overview.md`") |
| S7  | Exit check (step 9) evaluated against the fixture's **current** state (Stakes still thin at the start of the session, novel-specific items absent) | Do **not** present the completion summary or suggest `obs:brief assemble` / `toc` — required elements for `novel` are not all present yet | **AUTO-FAIL if** the response declares the overview complete or suggests moving to `toc` while Stakes is unresolved and POV/Emotional arcs/Denouement/Key scenes are unaddressed. (`01-forge.md` step 9 "all required overview elements present AND the last 2–3 iterations… minor adjustments"; `overview-checklist.md` "Required elements" for `novel`) |
| B1  | Structure states "Acte unique… 2 chapitres" (fewer than 3 parts) | Do **not** create `_brief/novels-details.md` | **PASS:** no intended write to `_brief/novels-details.md` appears in this session — the detail file is reserved for "projects with 3+ distinct parts." (`01-forge.md` "Outputs" — "Plus optional detail files for projects with 3+ distinct parts") |
| DN1 (NO-GO) | Type resolution: `overview.md` carries **no frontmatter at all** (so `type` is unset by the letter of step 1), while sibling `_brief/summary.md` already declares `type: novel` | A literal reading of step 1 — "Read the project `type` from the overview frontmatter (**default: "scenario"**); ask if unset" — permits silently defaulting to `type: scenario`, which is wrong for this project and would misapply the checklist's `scenario`-only items (Player role, Decision points…) instead of the `novel` ones actually needed (POV, Emotional arcs…) | **FAIL.** The instruction is self-contradictory (a stated default coexists with "ask if unset" for the same condition) and never mentions checking a sibling `summary.md` for an already-declared type. Nothing in `01-forge.md`/`SKILL.md` forces the correct resolution (ask, or reuse `summary.md`'s `novel`) over the literal silent-default reading. This is a real instruction gap, not an idealized expectation. (`01-forge.md` step 1) |
| DN2 (NO-GO) | Non-JDR project (no `_univers/`/`_campagnes/`/`_pjs/` marker anywhere) | Step 2 (load universe docs) is skipped entirely; no attempt to read or fabricate canon/mj content | **PASS:** response never references `R/_univers/<univers>/canon` or `mj/` content, and no lore is invented beyond `overview.md`/`summary.md`'s own terminology (Le Verre, Guilde des Archivistes, Sceau du Conseil). (`01-forge.md` step 2 "For a non-JDR project, skip this step") |
| N/A1 | "No overview file" branch (step 3, first bullet) | — | **N/A** — the fixture's `overview.md` already exists with 5 sections; this branch's precondition (absent file) is not met by the fixture. |
| N/A2 | JDR universe-docs loading branch (step 2, load `canon/`+`mj/`) | — | **N/A** — the fixture is a standalone novel with no `_univers/` structure reachable by walking up; this branch's precondition (JDR-scope project with resolvable `R`) is not met. |

## How to run

Agent-as-**forge** (dry-run, READ-ONLY on the fixture): load `plugins/writing/skills/forge/SKILL.md` + `actions/01-forge.md` + `references/overview-checklist.md` + this suite, against the populated fixture **`writing-narrative-fixture`**. For each scenario, reason out what the target **would** do — its exact response content (checklist report, questions asked, proposed alternatives, change-summary format) AND the precise intended writes (paths + scope + timing relative to user confirmation) — and judge against the pass criteria. **Nothing is written to the fixture.**

**Decisive observables** (write-scoped — any violation is an automatic FAIL):
1. **Write-gate** — no write to `overview.md` before an explicit user confirmation is recorded (S5).
2. **Single-file containment** — the only intended write target is `_brief/overview.md`; `_brief/summary.md`, `_brief/personas/*`, `_brief/output-styles/*`, and everything under `_output/` stay untouched even though all are populated (S6).
3. **No premature exit** — the completion summary / `toc` suggestion never fires while a required checklist element (Stakes, or any `novel`-specific item) is still open (S7).
4. **Detail-file threshold** — `novels-details.md` is not created below the 3-part threshold (B1).
5. **Type resolution determinism** — given a frontmatter-less `overview.md` next to a `summary.md` that already declares a type, the spec must deterministically avoid a wrong silent default (DN1).

## Results log

<!-- append run results here per plugins/overcode/skills/behave/references/harness-conventions.md › Results log format -->

### 2026-07-04 — run 1 (initial, dry-run, target=forge, fixture=writing-narrative-fixture) — **9/10 PASS (2 N/A)**

Fixture state: `writing-narrative-fixture` — `overview.md` (5 sections, no frontmatter, Stakes deliberately thin), `summary.md` (already assembled, `type: novel` frontmatter), 3 personas, 3 output-styles, populated `_output/` (toc, 2 chapters, review, storyboard), no `_univers/`/`_campagnes/`/`_pjs/` marker anywhere. Judge read READ-ONLY; nothing written to the fixture.

| #   | Behaviour under test | Verdict | Δ vs prior | Note (instruction cited) |
|-----|----------------------|---------|-----------|--------------------------|
| S1  | ≥2-complete-sections branch: summarize + jump to step 4, no from-scratch reprompt | PASS | n/a (first run) | `01-forge.md` step 3, third bullet |
| S2  | checklist scan flags Stakes vague + 4 novel-only items absent | PASS | n/a | `references/overview-checklist.md` "Required elements" + "`novel`" block |
| S3  | 2–3 targeted challenge questions on Stakes | PASS | n/a | `01-forge.md` step 5; `SKILL.md › Transversal` "Maximum 2–3 questions" |
| S4  | 2–3 alternatives with output-style compatibility note referencing the 3 real styles | PASS | n/a | `01-forge.md` step 6 |
| S5  | write-gate: change summary shown, zero writes before confirmation | PASS | n/a | `01-forge.md` step 7; `SKILL.md › Transversal` "Never invent content without user validation" |
| S6  | single-file containment: only `overview.md` written, `summary.md`/personas/output-styles/`_output/**` untouched | PASS | n/a | `SKILL.md › Transversal` "Always update the overview only in `<projet>/_brief/overview.md`" |
| S7  | no premature exit while Stakes + novel-only items are open | PASS | n/a | `01-forge.md` step 9; `overview-checklist.md` |
| B1  | no `novels-details.md` below the 3-part threshold | PASS | n/a | `01-forge.md` "Outputs" |
| DN1 | type resolution: frontmatter-less `overview.md` next to `summary.md` declaring `type: novel` | **FAIL** | n/a | `01-forge.md` step 1 — self-contradictory ("default: scenario" vs. "ask if unset"), no mention of checking a sibling `summary.md` |
| DN2 | non-JDR project → step 2 skipped, no canon/mj fabrication | PASS | n/a | `01-forge.md` step 2 "For a non-JDR project, skip this step" |
| N/A1 | "no overview file" branch | N/A | n/a | fixture's `overview.md` already exists |
| N/A2 | JDR canon/mj loading branch | N/A | n/a | fixture is non-JDR, no `_univers/` reachable |

**Frictions / gaps:**
- **DN1 — real gap, fixed below.** Step 1's literal text permits a silent wrong default (`scenario`) for a project that is actually a `novel` per its own `summary.md`, and never considers that a sibling `summary.md` might already carry an authoritative `type`.
- **JDR-scope detection is implicit, not blocking here.** Neither `SKILL.md` nor `01-forge.md` states *how* a project is recognized as "JDR-scope" in the first place (by `type` value, or by marker presence) — but since this fixture's marker-walk is unambiguously empty, the skip decision (DN2) is still decidable. Left as a friction, not a scored FAIL — no fixture state exercises the ambiguous path.
- **`01-forge.md`'s own "Test" section (line 59) sets a weaker completion bar** (pitch/structure/2 characters/tone) than `overview-checklist.md`'s full required list (Stakes + type-specific items). Not contradictory (the Test section says "at minimum"), but worth noting as a softer signal than the real exit gate.

**Tally:** 9/10 PASS (2 N/A, 1 FAIL). First run — no regression baseline. All decisive observables pass except type resolution (DN1), which exposes a genuine self-contradictory instruction.

### 2026-07-04 — run 2 (post-fix, dry-run, target=forge, fixture=writing-narrative-fixture) — **10/10 PASS (2 N/A)**

Same fixture state as run 1. Re-judged after editing `01-forge.md` step 1 and the `Outputs` template (see below). Judge read READ-ONLY; nothing written to the fixture.

| #   | Behaviour under test | Verdict | Δ vs prior | Note (instruction cited) |
|-----|----------------------|---------|-----------|--------------------------|
| DN1 | type resolution: `overview.md` has no frontmatter; `summary.md` declares `type: novel` | **PASS** | ▲ (was FAIL) | `01-forge.md` step 1 now: "read `overview.md`'s own frontmatter; if absent, reuse `_brief/summary.md`'s declared `type` if that file exists; otherwise ask — never silently default." Resolves to `novel` via the sibling `summary.md`, matching the checklist branch actually used in S2/S7. |

(All other scenarios unchanged from run 1 — re-verified against the edited files, no regression.)

**Frictions / gaps:** none blocking. The JDR-scope-detection ambiguity noted in run 1 remains open but out of this suite's fixture-decidable scope.

**Tally:** 10/10 PASS (2 N/A, 0 FAIL). Δ vs run 1: DN1 FAIL → PASS. Fix confirmed: `01-forge.md` step 1 no longer permits a silent wrong-type default, and the `Outputs` template now carries a `type`/`language` frontmatter block to persist the resolved value.
