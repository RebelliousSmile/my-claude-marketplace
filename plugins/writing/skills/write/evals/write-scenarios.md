# write — Chapter Drafting + Feedback-Rewrite Behavioural Test Scenarios

Behavioural tests for **write** (`plugins/writing/skills/write/SKILL.md` + `actions/01-write-novel.md` + `actions/02-write-roleplaying.md`) — verifies that the skill (1) selects the correct mode and output-style deterministically from `summary.md`/the TOC, (2) grounds a new chapter in previously written chapters and never invents characters/elements absent from `summary.md`, (3) in `--feedback` mode performs a **full rewrite** without reading the existing chapter, applying must-have-derived structural constraints and standing output-style/typography rules, and (4) does not silently cross the novel/roleplaying boundary.

This suite is **distinct** from:
- `evals/scenarios.json` — a flat prompt→`expect_action` router-mapping table (does `write` get invoked at all, and which of its two actions), no write-scope, no feedback-mechanics coverage.
- **this file** — the durable regression spec for chapter-drafting behaviour itself: mode/style selection, continuity, anti-invention, the feedback full-rewrite invariant, and the novel/roleplaying mode boundary.

> **Fixture / preconditions.** Run against the populated fixture **`writing-narrative-fixture`** (READ-ONLY), at `…/scratchpad/fixtures/writing-narrative-fixture/`:
> - `_brief/summary.md` — front matter `type: novel` / `language: fr`, synopsis "L'Archive de Verre" (Mira Solenn, Conseiller Verrin, l'Archive), lore (Le Verre, Guilde des Archivistes, Le Sceau du Conseil). `_brief/overview.md` is a **distractor**: present in `<brief>/` but explicitly out of `write`'s scope (only `summary.md` is the source per `SKILL.md › External data`).
> - `_brief/output-styles/` — 3 distinct styles; `style-immersif-v1.md` (guillemets français « », tirets cadratins, 3e limité passé simple) is the one **named in the TOC** for both chapters.
> - `_output/toc/INDEX.md` — 2 chapters only (`Chapitre 01 : Le Sceau oublié`, `Chapitre 02 : Le Conseiller Verrin`), each with explicit key points; no chapter 03 exists anywhere.
> - `_output/chapters/chapter-01.md` — already written, **deliberately flawed**: English-style guillemets (`"Tu n'aurais pas dû venir"`) instead of « », and an exposition tic ("Il est important de noter que… Il est également important de noter que…").
> - `_output/chapters/chapter-02.md` — already written, clean (correct « » guillemets, no tic) — establishes continuity facts (Mira's scar, the Chalendre fire, Verrin's suspicion) that a fresh chapter must respect.
> - `_output/review/chapter-01-lecteur-critique-litteraire.md` + `chapter-01-scores.md` — existing feedback: score 10/20, ❌, explicit must-have miss ("Aucune exposition plaquée") from `_brief/personas/lecteur-critique-litteraire.yaml`, plus a 🟡 note on the guillemets mismatch.
>
> State which chapter and mode is under test in every run. The judge reads the fixture but **writes nothing**; the decisive observable is each scenario's **intended writes** (path, content shape) and reasoning trace (what was read, what was flagged, what was NOT read).

## Scenarios

**Coverage: 5 GO · 1 NO-GO · 1 ambiguity-boundary · 1 N/A-precondition — 8 scenarios.**

| #   | Situation (input) | Expected behaviour | Pass criteria |
|-----|-------------------|--------------------|---------------|
| S1  | `write-novel <brief> --out <output> --chapter 1` (reasoned as a fresh invocation) | Mode = `write-novel` (from `type: novel`); output-style loaded = `style-immersif-v1.md` specifically (named in the TOC entry), not `style-lyrique-v1.md`/`style-minimaliste-v1.md`; the 4 key points of the TOC's Chapitre 01 entry identified | **PASS requires:** style choice matches the TOC-named file, not an arbitrary pick among the 3 present; all 4 bullet key points ("Première apparition de Mira…", "Première apparition de l'Archive…", "révèle son existence via le Verre", "Mira comprend qu'elle doit choisir") are recognized as the source key points. (`SKILL.md` "## Default flow"; `01-write-novel.md` steps 3-4) |
| S2  | `write-novel` reasoned for chapter 02 (treating it as not-yet-written) | Pre-writing check reads `_output/chapters/chapter-01.md` for continuity (Mira's scar, the Chalendre fire, the Verre's revelation) before drafting; Verrin's dialogue must not contradict or re-introduce these as new | **PASS requires:** the reasoning trace explicitly checks `chapter-01.md` content and treats the scar/fire/revelation as established fact carried into chapter 02, consistent with the TOC's `[REF Ch01]` tag on Chapitre 02. (`01-write-novel.md` step 6: "check continuity with previously written chapters in `<output>/chapters/`") |
| S3  | User asks to add a scene featuring "Aldric, le frère de Mira" while writing chapter 1 — Aldric appears nowhere in `_brief/summary.md` or the TOC | Refuse to fabricate Aldric; report the brief as incomplete on this point rather than inventing the character | **AUTO-FAIL if** Aldric is woven into the drafted content as if defined. PASS requires an explicit gap report ("Aldric n'est pas défini dans summary.md") and no invented backstory for him. (`SKILL.md › Transversal` "Never invent content not present in `summary.md` or the TOC. If something needed is absent… report it"; `01-write-novel.md` step 6: "verify every character/location/term used is defined in `summary.md`") |
| S4  | `write-novel <brief> --out <output> --chapter 3` — `toc/INDEX.md` has no Chapitre 03 entry, no `toc/chapter-03.md` exists, and `summary.md` itself states "2 chapitres pour ce fixture" | Do not invent a third chapter's content; report the TOC/brief as incomplete for chapter 3 and stop | **PASS requires:** no drafted content for chapter 3 is produced; the response explicitly reports missing TOC coverage for `<NN>=03`, not a silently improvised chapter derived from thin air. **(Gap found in run 1 — see Results log.)** |
| S5  | `write-novel --feedback _output/review/chapter-01-lecteur-critique-litteraire.md` for chapter 01 | Full rewrite from TOC/`summary.md`; **does not read** `_output/chapters/chapter-01.md`; extracts the must-have miss ("Aucune exposition plaquée") as a structural directive; presents the constraint sheet before drafting | **AUTO-FAIL if** the reasoning trace treats the existing `chapter-01.md` text as a base to patch/diff rather than rewriting from TOC + `summary.md` + style. PASS requires: constraint sheet lists "remove exposition-tic pattern" as a structural directive derived from the 10/20 must-have miss, presented before the draft step. (`01-write-novel.md` step 5: "Do NOT read the existing chapter"; steps 5a, 5d) |
| S6  | Same `--feedback` rewrite (S5), evaluating the **intended output text** | Rewritten chapter-01 uses guillemets français « » throughout (no `"..."`), contains no "il est important de noter que" (or variant) tic, and still covers the same KEY_POINTs as the original | **Write-scoped:** intended chapter-01 text contains zero instances of straight double-quote dialogue markers and zero instances of the exposition-tic phrase; `<!-- KEY_POINT: ... - COVERED -->` markers still map to the TOC's 4 key points. (`SKILL.md › Transversal` "Follow output-style conventions STRICTLY"; "French typography: guillemets « »…"; `01-write-novel.md` step 10) |
| S7  | User says "écris-moi le livret du chapitre 1" (a `write-roleplaying`-style trigger phrase) against this fixture, whose `summary.md` declares `type: novel` | `type: novel` should govern; the roleplaying-phrased request conflicts with it | **Gap found in run 1:** `SKILL.md › Default flow` states mode is chosen from `type`, then separately lists trigger phrases per mode, without stating which wins on conflict. Judge for precedence + explicit mismatch handling. **(See Results log.)** |
| S8  | `write-roleplaying` reasoned against this fixture (no mechanics/statblocks/Callings anywhere in `summary.md`, `type: novel`) | RPG-specific pre-writing checks (statblocks, mechanics, Callings) cannot be evaluated — no such data exists in this brief | **N/A** — fixture precondition for a roleplaying run (RPG mechanics/lore in `summary.md`) is absent; this is a property of the fixture (novel-only), not a defect. (`02-write-roleplaying.md` step 6: "Pre-writing checks (RPG-specific)") |

## How to run

Agent-as-**write** (dry-run, READ-ONLY on the fixture): load `plugins/writing/skills/write/SKILL.md` + `actions/01-write-novel.md` + `actions/02-write-roleplaying.md` + `plugins/writing/references/brief-model.md` + this suite, against the populated fixture **`writing-narrative-fixture`**. For each scenario, reason out what the target **would** do — mode/style resolution, what gets read vs. explicitly skipped, the drafted content's shape, and the exact intended write (path + content) — and judge against the pass criteria. **Nothing is written to the fixture.**

**Decisive observables** (any violation is an automatic FAIL):
1. **Deterministic style selection** — the TOC-named output-style wins over an arbitrary pick among multiple present (S1).
2. **Continuity grounding** — a later chapter respects facts already established in an earlier written chapter (S2).
3. **Anti-invention** — any character/element absent from `summary.md`/TOC is reported as a gap, never fabricated (S3, S4).
4. **Feedback = full rewrite, never a read-then-patch** — the existing chapter file is never read in `--feedback` mode; the constraint sheet (must-have misses + standing style/typography rules) is derived and shown before drafting (S5, S6).
5. **Mode boundary** — `type` in `summary.md` is the actual selector; a conflicting user phrasing must not silently flip it (S7).

## Results log

### 2026-07-04 — run 1 (initial, dry-run, target=write, fixture=writing-narrative-fixture) — **5/7 PASS (1 N/A, 2 FAIL)**

Fixture state: `writing-narrative-fixture` — `_brief/summary.md` (`type: novel`), 3 output-styles (TOC names `style-immersif-v1.md`), `toc/INDEX.md` (2 chapters only), `chapter-01.md` (guillemets anglais + exposition tic), `chapter-02.md` (clean, establishes continuity facts), `review/chapter-01-lecteur-critique-litteraire.md` (10/20, must-have miss) + `chapter-01-scores.md`. Judge read READ-ONLY; nothing written to the fixture.

| #   | Behaviour under test | Verdict | Δ vs prior | Note (instruction cited) |
|-----|----------------------|---------|-----------|--------------------------|
| S1  | style-immersif-v1.md picked deterministically from TOC entry; 4 key points identified | PASS | n/a (first run) | `SKILL.md` "Default flow"; `01-write-novel.md` steps 3-4 |
| S2  | continuity check against chapter-01 before drafting chapter-02 | PASS | n/a | `01-write-novel.md` step 6 |
| S3  | Aldric (undefined character) refused, gap reported | PASS | n/a | `SKILL.md › Transversal` anti-invention; `01-write-novel.md` step 6 |
| S4  | chapter 3 requested, absent from TOC and summary | **FAIL** | n/a | `01-write-novel.md` step 4 has no clause for "toc/ exists but lacks this chapter's entry" — the two stated fallbacks (`INDEX.md` entry, or no-toc/ short-form derivation) both miss this case, leaving room to improvise a chapter the TOC never sanctioned |
| S5  | full rewrite, no read of existing chapter-01.md, constraint sheet before draft | PASS | n/a | `01-write-novel.md` step 5, 5a, 5d |
| S6  | rewritten output uses « », drops the exposition tic, keeps KEY_POINT coverage | PASS | n/a | `SKILL.md › Transversal` output-style + French typography; step 10 |
| S7  | roleplaying-phrased trigger vs. `type: novel` — which wins | **FAIL** | n/a | `SKILL.md › Default flow` states mode comes from `type` but also lists trigger phrases per mode with no stated precedence or conflict handling — a user could plausibly get routed to `write-roleplaying` against a `type: novel` brief |
| S8  | RPG pre-writing checks — no mechanics data in this brief | N/A | n/a | `02-write-roleplaying.md` step 6 — fixture precondition (RPG lore) absent |

**Frictions / gaps:**
- **S4 (real gap):** `01-write-novel.md`/`02-write-roleplaying.md` step 4 doesn't cover "TOC exists but has no entry for the requested chapter number" — distinct from both the "`chapter-<NN>.md` missing → fall back to `INDEX.md`" and "no `toc/` at all → short-form" cases it does cover.
- **S7 (real gap):** `SKILL.md › Default flow` doesn't state that `type` is authoritative over the trigger-phrase table when the user's own wording names the other mode.

**Tally:** 5/7 PASS (1 N/A, 2 FAIL). First run — no regression baseline. Both FAILs are genuine documentation gaps (missing fallback clause; missing precedence rule), not target misbehaviour beyond what the spec fails to pin down — fixed below, re-run follows.

### 2026-07-04 — run 2 (post-fix, dry-run, target=write, fixture=writing-narrative-fixture) — **7/7 PASS (1 N/A)**

Same fixture state as run 1. Fixes applied: `01-write-novel.md` and `02-write-roleplaying.md` step 4 now have an explicit clause for "TOC exists but no entry for `<NN>`" (report incomplete, don't invent); `SKILL.md › Default flow` now states `type` is authoritative and a conflicting trigger phrase must be flagged, not silently followed.

| #   | Behaviour under test | Verdict | Δ vs prior | Note (instruction cited) |
|-----|----------------------|---------|-----------|--------------------------|
| S4  | chapter 3 requested, absent from TOC and summary | PASS | ▲ (was FAIL) | `01-write-novel.md` step 4, new clause: "If `toc/` exists but has no entry for `<NN>`… report the TOC as incomplete for that chapter and stop" |
| S7  | roleplaying-phrased trigger vs. `type: novel` | PASS | ▲ (was FAIL) | `SKILL.md › Default flow`, new clause: "`type` is authoritative… flag the mismatch and ask before proceeding" |

(S1, S2, S3, S5, S6, S8 unchanged from run 1 — still PASS/N/A respectively; not re-tabulated.)

**Frictions / gaps:** none remaining.

**Tally:** 7/7 PASS (1 N/A, 0 FAIL). Both run-1 gaps closed; regression from FAIL→PASS confirmed on S4 and S7 with no other scenario disturbed.
