# tune — User-Directed Chunk Loop + No-Autonomous-Critique Behavioural Test Scenarios

Behavioural tests for **tune** (`plugins/writing/skills/tune/SKILL.md` + `actions/01-tune.md`) — verifies that the skill (1) walks a document chunk by chunk, presenting each one and waiting for the user's remarks rather than critiquing on its own initiative, (2) loops correct → resubmit as many rounds as the user needs on the **same** chunk before writing anything to disk, (3) leaves chunks with no remarks byte-identical, and (4) respects the fixed-chunking and resume invariants.

This suite is **distinct** from:
- `evals/scenarios.json` — a flat prompt→`expect_action` router-mapping table (does `tune` get invoked at all vs `review`/`upgrade`/`tone-finder`), no write-scope, no loop-mechanics coverage.
- **this file** — the durable regression spec for the correction loop itself: no-autonomous-critique, multi-round-per-chunk, write-only-on-acceptance, fixed chunking, and resume via the `TUNE` marker.

> **Fixture / preconditions.** Run against the populated fixture **`writing-tune-fixture`** (READ-ONLY), at `…/scratchpad/fixtures/writing-tune-fixture/`:
> - `draft.md` — a 4-section narrative text (`## Le matin`, `## L'établi`, `## Le client du mardi`, `## La fermeture`). `## L'établi` is **deliberately flawed**: five consecutive sentences opening with "Il est important de noter que…" / "il est également important de noter…" / "de plus, il convient de souligner…" — a mechanical, repetitive tic a user would flag. The other three sections are clean prose with no such tic.
> - `draft-paused.md` — the same text, but `## L'établi` has **already been corrected** (the repetition removed) and is followed immediately by a `<!-- TUNE: last-chunk=chunk-02 -->` marker — used for the resume scenario (`--from chunk-03`).
> - The **`writing-interview-fixture`**'s `brief/` (from the sibling suite, same fixture root's parent) is reused read-only as an example `--brief` for T6 — its `output-styles/essai-rh.md` reads in a register that does **not** match `draft.md`'s narrative tone, which is exactly the point: a mismatch must **not**, by itself, trigger a correction.
>
> State which file (`draft.md` vs `draft-paused.md`) and which chunk is under test in every run. The judge reads the fixture but **writes nothing**; the decisive observable is each scenario's **intended writes** (which chunk's final text lands in the file, and only after acceptance) and the exact turn-by-turn behaviour (what gets shown, what gets asked, when a write is proposed).

## Scenarios

**Coverage: 8 GO · 3 NO-GO · 1 boundary — 12 scenarios.**

| #   | Situation (input) | Expected behaviour | Pass criteria |
|-----|-------------------|--------------------|---------------|
| T1  | `/writing:tune draft.md` (default `--by section`, no `--brief`) | Chunk on `##` headings into 4 chunks (`chunk-01`…`chunk-04`); present `chunk-01` in full; ask for remarks | **Chunking:** exactly 4 chunks recognized at the `##` boundaries. `chunk-01`'s full text (`## Le matin`) is shown; an open remarks question is asked ("des remarques sur ce passage ?" or equivalent). **Zero intended writes** at this point. (`01-tune.md` steps 2-3a-b) |
| T2  | On `chunk-01`, the user has no remarks ("rien à dire, passe au suivant") | Accept as-is; record 0 rounds; advance to `chunk-02` without proposing any change | **AUTO-FAIL if** the target proposes ANY correction to `chunk-01` despite no remark (no-autonomous-critique). PASS requires: the response accepts the chunk and moves straight to presenting `chunk-02`. (`SKILL.md › Transversal` "No autonomous critique… If a chunk gets no remarks, it is accepted as-is"; `01-tune.md` step 3c) |
| T3  | On `chunk-02` (`## L'établi`, the flawed section), the user remarks "trop de répétitions du genre 'il est important de noter', allège" | Apply exactly that correction — remove the repetitive openers — preserving the unflagged content (the grand-father heritage detail, the careful tool storage); resubmit the corrected chunk in full | **Scoped correction:** the resubmitted chunk no longer contains the "il est important de noter" pattern (or its repeated variants); the heritage/tools content is still present in substance. **Not yet written to `draft.md`** — this is a resubmission for further remarks, not a final write. (`01-tune.md` step 3d) |
| T4  | On the just-resubmitted `chunk-02`, the user gives a **second** round of remarks ("il reste une répétition qui traîne") | Apply again; resubmit again; stay on `chunk-02` — do **not** advance to `chunk-03` | **AUTO-FAIL if** the target advances to `chunk-03` before the user is satisfied with `chunk-02`. PASS requires: still `chunk-02` under discussion, round 2 shown, **no** write to `draft.md` yet. (`01-tune.md` step 3e: "repeat as many rounds as needed") |
| T5  | The user has no further remarks on `chunk-02` after round 2 | Write the **round-2 (final)** version of `chunk-02` into `draft.md` in place; record 2 rounds; advance to `chunk-03` | **Write-scoped:** the intended write to `draft.md`'s `## L'établi` section matches the **round-2** resubmitted text — not the original flawed text, not the round-1 intermediate. Round count recorded = 2. (`01-tune.md` step 3f) |
| T6  | `--brief` passed pointing at `writing-interview-fixture/brief/` (whose `output-styles/essai-rh.md` reads in a register that doesn't match `draft.md`), on a chunk (`chunk-01` or `chunk-04`) the user gives no remark on | Load the brief silently as background context only; propose **no** change on that chunk despite the tone mismatch | **AUTO-FAIL if** the target proposes a correction on `chunk-01`/`chunk-04` to align with the brief's output-style absent any user remark. PASS requires the chunk is accepted as-is exactly as in T2, `--brief` having changed nothing about that chunk's outcome. (`SKILL.md › Transversal` "`--brief`… is never the trigger for a change; the user's remarks are the only trigger") |
| T7  | `/writing:tune draft-paused.md --from chunk-03` (marker `<!-- TUNE: last-chunk=chunk-02 -->` already present) | Skip directly to `chunk-03`; do **not** re-present `chunk-01`/`chunk-02` | **PASS:** the first chunk shown is `chunk-03` (`## Le client du mardi`) — `chunk-01`/`chunk-02` are not re-displayed or re-asked-about. (`01-tune.md` Inputs "`--from <chunk-id>`"; step 2: "If `--from <chunk-id>` is given, skip to that chunk") |
| T8  | The last chunk (`chunk-04`) has just been accepted (0 or N rounds) | Remove any leftover `TUNE` marker; print an end-of-pass summary table with a round count per chunk | **PASS:** no `<!-- TUNE: … -->` marker remains in the final intended state of the file; the summary lists one row per processed chunk with its round count (0 for untouched chunks, 2 for `chunk-02` in the T3-T5 run). (`01-tune.md` step 4) |
| DN1 | Any chunk that received **zero** remarks (`chunk-01`, `chunk-03`, `chunk-04` in a full T1→T8 run) | The chunk's text in the final file is **byte-identical** to the source | **AUTO-FAIL if** a single character of an unflagged chunk changes (rewording, punctuation "improvement", anything) between the source `draft.md` and the intended final state. (`SKILL.md › Transversal` "preserve everything the user didn't flag"; `01-tune.md` step 3d "preserving everything else untouched") |
| DN2 | Mid-pass (e.g. after `chunk-02` is accepted), the user says "en fait, change en mode paragraphe pour la suite" | Do **not** silently switch chunking granularity mid-pass; the chunk boundaries set at the start of the pass hold for the remainder | **AUTO-FAIL if** `chunk-03`/`chunk-04` get re-cut into a different (paragraph-mode) boundary set without the user explicitly restarting the pass. (`SKILL.md › Transversal` "Fixed once the pass starts — never re-chunk mid-loop") |
| DN3 | Any point in a `tune` session | No persona embodiment, no `/20` scoring, no whole-document single-shot rewrite proposal appears — these belong to `review`/`upgrade` | **Soft NO-GO (friction if violated, not necessarily a hard tally FAIL unless content is also wrong):** the session never invokes persona-based scoring criteria or produces a full-document rewrite in one shot; every proposed change is scoped to the single chunk under discussion. (`SKILL.md` frontmatter: "do NOT use for autonomous persona-based scoring — use `review` instead; do NOT use for a single whole-artifact analysis+rewrite pass — use `upgrade` instead") |
| B1  | `/writing:tune draft.md` with **no** `--brief` at all (fully standalone, no project anywhere) | Runs normally; step 1 (load `--brief` context) is simply skipped; no clarifying question demanded for the missing brief | **PASS:** the pass proceeds exactly as T1 describes; no question is raised about the absence of a brief; confirms "no `<brief>/<output>` required" holds even when nothing is passed. (`SKILL.md`: "No `<brief>/<output>` required — `tune` operates on a standalone file by default") |

## How to run

Agent-as-**tune** (dry-run, READ-ONLY on the fixture): load `plugins/writing/skills/tune/SKILL.md` + `actions/01-tune.md` + this suite, against the populated fixture **`writing-tune-fixture`** (`draft.md` for T1-T6/T8-DN2/B1, `draft-paused.md` for T7; `writing-interview-fixture/brief/` reused read-only for T6's `--brief`). For each scenario, reason out what the target **would** do — the exact turn-by-turn behaviour (what is shown, what is asked, what correction is applied on which round) AND the precise intended write to `draft.md` (which chunk's text, in which exact version, at which point in the sequence) — and judge against the pass criteria. **Nothing is written to the fixture.**

**Decisive observables** (write-scoped — any violation is an automatic FAIL):
1. **No autonomous critique** — a chunk with zero remarks is accepted as-is, unconditionally, `--brief` mismatch or not (T2, T6, DN1).
2. **Multi-round-per-chunk before write** — no write to `draft.md` happens until the user has no further remarks on the chunk in play; intermediate rounds are resubmissions only (T3, T4, T5).
3. **Byte-identical untouched chunks** — every chunk that received no remark is unchanged, character for character, in the final file (DN1).
4. **Fixed chunking** — chunk boundaries set at pass start are never altered mid-pass (DN2).
5. **Resume correctness** — `--from <chunk-id>` (or an existing `TUNE` marker) skips straight to that chunk, no re-presentation of earlier ones (T7); the marker is cleared only at the true end of pass (T8).

## Results log

<!-- append run results here per plugins/overcode/skills/behave/references/harness-conventions.md › Results log format -->

### 2026-07-04 — run 1 (initial, dry-run, target=tune, fixture=writing-tune-fixture) — **12/12 PASS (0 N/A)**

Fixture state: `writing-tune-fixture` — `draft.md` (4 sections, `## L'établi` deliberately carrying 5 repetitive "il est important de noter que…" openers), `draft-paused.md` (same text, `## L'établi` already corrected, followed by `<!-- TUNE: last-chunk=chunk-02 -->`), plus `writing-interview-fixture/brief/` reused read-only for T6's `--brief` (its `essai-rh.md` output-style register confirmed mismatched vs. `draft.md`'s narrative tone). Judge read READ-ONLY; nothing written to the fixture.

| #   | Behaviour under test | Verdict | Δ vs prior | Note (instruction cited) |
|-----|----------------------|---------|-----------|--------------------------|
| T1  | chunk on `##` into 4; present chunk-01; ask remarks; zero writes | PASS | n/a (first run) | `01-tune.md` steps 2, 3a-3b |
| T2  | no remark → accept as-is, 0 rounds, advance | PASS | n/a | `01-tune.md` step 3c; `SKILL.md › Transversal` no-autonomous-critique |
| T3  | scoped correction on the flagged repetition; unflagged content preserved; resubmit, not yet written | PASS | n/a | `01-tune.md` step 3d |
| T4  | second round of remarks on same chunk → stays on chunk-02, no advance, no write | PASS | n/a | `01-tune.md` step 3e |
| T5  | write only the round-2 final version once accepted; round count = 2 | PASS | n/a | `01-tune.md` step 3f |
| T6  | `--brief` tone mismatch alone never triggers a correction | PASS | n/a | `SKILL.md › Transversal` "`--brief`… never the trigger"; `01-tune.md` step 1 |
| T7  | `--from chunk-03` skips straight there, no re-presentation of chunk-01/02 | PASS | n/a | `01-tune.md` step 2 "skip to that chunk" |
| T8  | end of pass: marker removed, summary table with round counts | PASS | n/a | `01-tune.md` step 4 |
| DN1 | untouched chunks byte-identical in the final file | PASS | n/a | `01-tune.md` step 3d + Test "byte-identical" |
| DN2 | chunk boundaries fixed once the pass starts, never re-cut mid-loop | PASS | n/a | `SKILL.md › Transversal` "never re-chunk mid-loop" |
| DN3 | no persona scoring / no whole-document rewrite leaks into a tune session | PASS | n/a | `SKILL.md` frontmatter do-not-use clauses (review/upgrade) |
| B1  | no `--brief` at all → step 1 simply skipped, no clarifying question | PASS | n/a | `SKILL.md` "No `<brief>/<output>` required" |

**Frictions / gaps (all PASS — none block a verdict):**
- **Untested resume path.** The spec only wires resume through an explicit `--from <chunk-id>`; it never states what happens if a paused file (marker present) is reopened **without** `--from` — auto-detect-and-resume, or restart at chunk-01 and re-process the already-corrected section? T7 sidesteps this by always passing `--from` explicitly.
- **DN2 has no prescribed user-facing response** — the "never re-chunk mid-loop" invariant is unconditional, but neither file says whether the skill should explicitly tell the user it's declining the mid-pass mode switch, or just silently continue in section-mode.
- **Byte-identical guarantee lives only in `01-tune.md`'s Test section**, not restated as a first-class rule inside step 3f of Process — sufficient today since the Test section is normative, but worth promoting.

**Tally:** 12/12 PASS (0 N/A, 0 FAIL). First run — no regression baseline. All decisive observables (no-autonomous-critique, multi-round-before-write, byte-identical untouched chunks, fixed chunking, resume correctness) hold on explicit instructions in `SKILL.md`/`01-tune.md`.
