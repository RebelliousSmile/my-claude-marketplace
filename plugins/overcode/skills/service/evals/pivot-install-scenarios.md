# Pivot installers — Written-vs-Announced Behavioural Test Scenarios

<!--
One suite = one durable regression spec for ONE aspect of ONE target.
This suite pins THE GAP BETWEEN WHAT AN INSTALLER ANNOUNCES AND WHAT IT WROTE,
across every plugin that lays pivot files under .claude/rules/07-quality/.
It does NOT test detection quality, pivot content, or the consumer side —
only the honesty of the installer's own output.
-->

Behavioural tests for the **pivot installers** — `overcode:service 01-install`, and `sniff 02-install-pivots` in `sc-js`, `sc-php`, `sc-python`, `sc-rust` — verifies that an installer's output reports **what it actually wrote**, never a pre-decided list.

**This is the counterpart spec to issue #11.** A consumer can only report an honest provenance if the installer reported an honest installation. Three defects are pinned, and they are not the same: **a source declared by the installer that does not exist on disk**, **a fixed output block printed regardless of what happened**, and **an illustrated body that reads as the list to copy** — the third being what survives once the second is fixed at header level only.

This suite is **distinct** from:
- `pivot-provenance-scenarios.md` (`plugins/overcode/skills/web-optimize/evals/`) — what the **consumers** say about what they loaded.
- **this file** — what the **installers** claim to have written.

> **No verdict is announced in a scenario row.** A row states a situation, an expected behaviour and a falsifiable criterion — nothing else. Measurements taken at a given run live in *Appendix — instruction measurements by run*, dated, and a judge reads that appendix **after** grading, never before. This is not cosmetic: at run 2 the previous form would have returned six false FAILs to any judge that read it off the page.

> **Fixture / preconditions.** Judgement is a **dry-run**: the observable is the *intent to write* plus the output text the action prescribes. **No mutation is needed to conclude**, and none is permitted. Reference repositories, READ-ONLY, under `C:\Users\fxgui\Documents\Perso\Projects\`.
>
> Sources are read **in `plugins/`, never in the installed cache** — a cache copy proves nothing about the source of truth.
>
> **Fixture paths carry a `_code\` segment** — omitting it names a directory that does not exist (friction raised at run 1). Reference fixtures:
> - **`lyremember\_code\app`** — `rust-backend/Cargo.toml:10` declares **`rusqlite`**; the one fixture in the park that carries a stack `sc-rust` genuinely covers in family `data`. Fixture for S4.
> - **`email-to-markdown\_code\app`** — Rust, **no web framework and no ORM**; declares neither `axum`, nor `sqlx`, nor `diesel`, nor `rusqlite`. ⚠ Git refuses to operate here (*dubious ownership*): verify non-mutation by listing, never by `git status`, and **do not alter the global git config** to work around it.
> - **`winfxstart\_code`** — pure Win32 Rust (`tao`, `windows`, `serde`, JSON storage), no `.claude/` at all.
> - **`scriptami\_code\wp-2026`** — WordPress FSE, **no `composer.json`**. The only PHP fixture in the park, and the detection state is part of the observable. Fixture for S3.
> - **`suddenly\_code\app`** — Django (`manage.py`, `pyproject.toml`). Fixture for S5.
> - **`choix-narratifs\_code`** or **`lyremember\_code\site`** for `sc-js`.
>
> **No Symfony fixture and no Laravel fixture exist in the park.** S3 is therefore anchored on WordPress, where a frozen block misfires in the most legible way.
>
> **S8 needs no repository fixture**: its observable is the text of five action files, judged against each other.

## Scenarios

| #   | Situation (input) | Expected behaviour | Pass criteria | Judge load path |
|-----|-------------------|--------------------|---------------|-----------------|
| S1  | `overcode:service 01-install` on any target. The action declares a set of targets and draws each from a source file under `skills/setup/references/`. | The output counts and names **only what was written**, and a source that cannot be found is reported rather than silently counted. | Two independent binaries, both required: **(a)** every source the table declares resolves on disk; **(b)** the file count in the header is **derived**, not written into the file as a literal, and a not-found branch exists. A run that prints a fixed `✅ … N files written` with targets listed by name announces the outcome before the work. ⚠ **This row exhibits both defect families at once**, which is why it is the one to read when telling them apart: publishing missing sources would leave a frozen count intact, and deriving the count would leave unwritable targets declared. Both remedies are required here. | `overcode/skills/service/actions/01-install.md` + listing of `skills/setup/references/` |
| S2  | `sc-css:sniff 02-install-pivots`. | *(archived)* | **Row closed — the target no longer exists.** Arbitration A1 of the fix removed the action; a vanished target is unjudgeable, never red. The row is kept because it **attests to the removal**: it contributes nothing to coverage and must not be replayed. Its `FAIL → N/A` at run 2 is the nominal outcome it was written to record, and was written into the row *before* being observed. | — |
| S3  | `sc-php:sniff 02-install-pivots` on **`scriptami\_code\wp-2026`** — WordPress FSE, **no `composer.json`**. (Re-anchored at run 1: the park holds no Symfony and no Laravel fixture.) | The header reflects the outcome; a Laravel pivot is not reported installed on a WordPress project. | The output branches on what happened — a case structure exists, and a derivation clause orders the header to follow it. A single unconditional block FAILs, and on this fixture it fails legibly: it would announce Laravel and Eloquent installed on a project that is neither, and report WordPress skipped. Sources are 6 of 6 present, so the output alone is under test here. | `sc-php/skills/sniff/actions/02-install-pivots.md` |
| S4  | `sc-rust:sniff 02-install-pivots` on **`lyremember\_code\app`**, `rust-backend/` side — `Cargo.toml:10` declares **`rusqlite`** and no other covered stack. (Re-anchored at run 1: neither `winfxstart` nor `email-to-markdown/app` carries `rusqlite`.) | A stack the plugin genuinely covers is reachable in the outcome. | **Criterion narrowed after run 2, which found the old wording licensed two opposite readings.** The single binary is now: the output **branches**, and a derivation clause orders the header to follow what was written — so that `rusqlite`, declared among the targets, *can* appear when installed. Whether the illustrated body names it is **no longer judged here**: that question moved to S8, where it applies to all four `sniff` installers at once instead of to this one. | `sc-rust/skills/sniff/actions/02-install-pivots.md` |
| S5  | `sc-python:sniff 02-install-pivots` on **`suddenly/app`**. | Same requirement as S3. | Same binary: a case structure plus a derivation clause. Sources are 9 of 9 present; only the output is under test. | `sc-python/skills/sniff/actions/02-install-pivots.md` |
| S6  | `sc-js:sniff 02-install-pivots` on **`choix-narratifs`** or **`lyremember/site`**. **Positive control of the *frozen output* family.** | The output is derived, not pre-decided. | Same binary as S3 and S5, plus: every declared target resolves on disk. This row exists to witness that the suite is not written to make everything red — it was free to fall and must be graded with no allowance. ⚠ **The PASS it earns is narrower than it looks** (measured at run 1, still true): the derivation clause governs the **header**; the case *bodies* are fixed text. That residual is S8's subject, and S8 grades `sc-js` on it like the others. | `sc-js/skills/sniff/actions/02-install-pivots.md` |
| S7  | `sc-js:sniff 03-clean` on any target. | Every path the action names resolves on disk. | Each path listed by the action is found on disk, and the guard carries a branch for a candidate whose plugin reference is missing — skipped and reported, never deleted. ⚠ This is the **second** `sc-js` row and its subject is the *declared source missing* family, not the *frozen output* one: do not read S6's positive control as covering the whole plugin. | `sc-js/skills/sniff/actions/03-clean.md` |
| S8  | The Case A output block of the four `sniff` installers — `sc-js`, `sc-php`, `sc-python`, `sc-rust` — read side by side with `overcode:service 01-install`. **Negative control of the *frozen output* family.** | An illustrated output body reads as an **example**, not as the list to reproduce. | The Case A block carries an example marker — the shape `01-install.md:42` uses, `… one line per target actually processed` — **or** a clause ordering the body, not only the header, to follow what was written. ⚠ **Scope the search to the Case A fenced block.** The ellipsis also appears in the Case B and C prose of all four files, where it stands for a file path and not for an elided extract: an unscoped grep returns a hit in every file and grades this row green on all four, which is the opposite of the correct verdict. ⚠ Why this is not S3/S5's criterion restated: those rows are satisfied by a branching header, and all four installers satisfy them. This one grades the body, so the family can keep a live red after the header fix — without it the family has a positive control and nothing else. Grade the coverage of each illustrated body (targets named ÷ targets declared) and state it: an exhaustive body makes a literal copy **indistinguishable** from a derived output, a partial one only makes it *look* exhaustive. | the four `<plugin>/skills/sniff/actions/02-install-pivots.md` + `overcode/skills/service/actions/01-install.md` |
| S9  | `sniff 02-install-pivots` on the four plugins — `sc-js`, `sc-php`, `sc-python`, `sc-rust` — read side by side with `overcode:service 01-install`. **Negative control of the *declared source missing* family.** | A source file the plugin does not contain is reported as missing, never counted among the pivots installed. | The action carries a branch for a source that does not resolve: a clause ordering it, or an output shape holding it. ⚠ **The branch must govern the *source*, not the target.** An install rule of the form `If the target file does not exist → install` does not satisfy this row: it orders what to do about the destination and presumes the source readable. Reading it as satisfaction grades the family green on a text that never mentions the case. ⚠ **Do not grade on the disk.** Whether every declared source resolves today is S1's and S7's question; this row asks whether the file says what happens when one stops resolving. A run that answers "all sources are present, so PASS" has answered a different row. ⚠ Why this is not S1 restated: S1 grades `web-tiers`, which carries the branch, so the family holds a positive control and — since S7's fix — nothing else. | the four `<plugin>/skills/sniff/actions/02-install-pivots.md` + listing of each `skills/sniff/references/capabilities/` |

**Coverage.** Six installers at run 1; **five** after the fix, S2 being the row that attests to the removal. Seven rows judged, one archived. S9 is written and measured before run 4 and **enters the tally at run 5** — the cycle S8 went through, and the reason its verdict was independent of the hand that wrote it.

**The three defects are not one.** *Declared source missing* (S1, S7, S9) calls for publishing the source or withdrawing the declaration. *Frozen output over existing sources* (S3, S4, S5, S6) calls for deriving the header from the outcome. *Illustrated body read as a list* (S8) calls for an example marker — and it only becomes visible once the second is fixed, which is why it was added after run 2 rather than before run 1. A run that merges any two into "the installer lies" has not judged.

## How to run

Agent-as-installer (**dry-run, READ-ONLY**): load the target action file from `plugins/`, list the `references/` directory it draws from, and reason out — without writing — which files the action *would* lay down and which output text it *prescribes*. Judge the second against the first.

**Decisive observables:**
- **Sources are read in `plugins/`**, never in `~/.claude/plugins/cache/`.
- For each declared target, its source is either found or not found on disk — that binary is the whole of S1 and S7.
- For each installer, either the file carries a branch for a source that does not resolve or it does not — that binary is the whole of S9, and it is read in the text, not on the disk.
- For each output line, either it is derived from the outcome or it is fixed in the file — that binary is the whole of S3, S4, S5, S6.
- For each illustrated block, either it is marked as an example or it is not — that binary is the whole of S8.
- No fixture is mutated, and no file is written to any plugin. A dry-run that installs to check has invalidated itself.
- **Do not read the appendix before grading.** It records what was measured at a past run against a text that has since changed.

## Appendix — instruction measurements by run

> Archived measurements, kept for provenance. **Each entry is anchored to the file text as it stood at that run** and is not rebased: several verbatim quotes below no longer exist at any line. They are evidence of what was true then, never an expectation for now.

**Run 1 (2026-07-31), against the pre-fix text.** S1 — nothing ordered the header to be derived; `:7` ordered "write its content verbatim" with no not-found branch while `:36` announced `12 files written` hard-coded. S2 — the `❌ non disponible` branch existed (`:12`, `:29`), so the failure was honest but total, and the action declared no source path at all. S3 — `:39-56` was a single unconditional block, no case structure anywhere in the file, sources 6 of 6 present: a pure *frozen output*. S4 — same kind, opposite symptom, an omission rather than a false positive; sources 4 of 4 present. S5 — the named block `:49-64` was fixed and carried none of `sc-js`'s derivation clause. S6 — `:46` stated *"Pick the header by what actually happened — never claim 'installed' when nothing was written"*, honoured by real three-case branching (`:48`, `:68-70`, `:88-90`), 13 of 13 targets resolving; and already then, its bodies (`:53-59`) named three pivots with no example marker — *lift `:46` and `:70`, never the blocks*. S7 — `03-clean.md:26` listed `capabilities/styling/design-system.md`, absent from disk, 12 of 13 resolving.

**Run 2 (2026-08-03), against the corrected text.** The five surviving installers all carry a derivation clause and a three-case structure; `01-install.md:42` is the only one whose illustrated body carries an example marker. That asymmetry is what S8 was written from.

**Run 3 (2026-08-03), S8's first adjudication.** **0 of the 4** `sniff` installers carry either admitted form. No Case A block holds an ellipsis, `one line per`, or `actually processed`; the only clause on the subject reads `Pick the **header** by what actually happened` — the body is never mentioned. Aggravating and measured this run: a search for reproduction instructions returns exactly one, pointing the wrong way — **`Use this header verbatim`** in every Case B. The files set a literal-reproduction norm for one block and never post the counter-instruction on the other. Coverage of the illustrated bodies: `sc-php` 6/6, `sc-rust` 3/4, `sc-python` 4/9, `sc-js` 3/13. Run 2 read `sc-rust` as the most exposed (75 % *reads* as exhaustive); run 3 measures that `sc-php` at 6/6 **is** exhaustive — no missing line betrays a copy — and that on S3's WordPress fixture that copy asserts two PHP pivots installed. Both hold on their own axis; the remedy order follows the second.

**Suite revision (2026-08-05), the measurement S9 was written from — no run.** The four `sniff` installers hold **0** clause on a source that does not resolve; `01-install.md` holds **4** (`:34` the clause, `:47` the rule, `:51` the output shape, `:54` the total-failure header). The only near-miss in the four is `If the target file does not exist → install` — the target, not the source, in all four files. Declared sources resolving on disk this day: `sc-js` 13/13, `sc-python` 9/9, `sc-php` 6/6, `sc-rust` 4/4 — **32 of 32**, which is why the defect is latent and not visible in any output: it fires only once a source stops resolving. That has already happened once in this park (S7, run 1: `capabilities/styling/design-system.md` declared and absent), on the one plugin that had no branch for it. Same asymmetry as run 2's, one family over: the fix of 0.3.0 landed on `web-tiers` and on nothing else.

## Results log

### 2026-07-31 — run 1 (initial), before any target is edited

**1 PASS · 6 FAIL · 0 N/A** on 7. Judge: one subagent, fresh context, dry-run READ-ONLY, sources read in `plugins/`.

| # | Verdict | Anchor |
|---|---------|--------|
| S1 | **FAIL** | `web-tiers/…/01-install.md:26-29` declares 4 data pivots; `references/` holds **9 of 12** sources — `08-data-pivots-firebase.md` present, `supabase` / `dynamodb` / `hasura` absent. `:7` orders "write its content verbatim" with **no not-found branch**; `:36` announces `12 files written` hard-coded. |
| S2 | **FAIL** | `sc-css/…/02-install-pivots.md:17-23` declares 6 pivots; `skills/sniff/references/` **does not exist** — **0 of 6**. The honest branch is real (`:12`, `:29`). |
| S3 | **FAIL** | `sc-php/…/02-install-pivots.md:39-56` is a **single unconditional block**, no case structure anywhere in the file. Sources **6 of 6 present** → pure *frozen output*. |
| S4 | **FAIL** | `sc-rust/…/02-install-pivots.md:19-21` declares `rusqlite`; sources **4 of 4 present**; the frozen block `:37-51` never names it, and `:41` announces `axum` installed unconditionally. |
| S5 | **FAIL** | `sc-python/…/02-install-pivots.md` declares **9** targets (`:13-17`, `:23-25`, `:33`), sources **9 of 9 present**; block `:49-64` names 4 and is unconditional. No clause equivalent to `sc-js:46`. |
| S6 | **PASS** | `sc-js/…/02-install-pivots.md:46` carries the derivation clause verbatim; output **branches in three cases** (`:48`, `:68-70`, `:88-90`), `:70` reinforcing it. Targets **13 of 13** resolve on disk. |
| S7 | **FAIL** | `sc-js/…/03-clean.md:26` names `capabilities/styling/design-system.md`; `capabilities/styling/` holds only `css-transitions.md` → **12 of 13**. The guard `:38-45` has **no branch** for a missing reference. |

**The suite discriminates.** The positive control was free to fall and did not: `sc-js` genuinely derives its header, which is the model the four others must reach. *Reproduce-then-confirm* is satisfied — every pinned defect is red on current behaviour.

**Disclosed harness defects.**
- **Judge = suite author.** The suite was written in the same session that ran this judgement. Mitigation applied: the judge was ordered to measure first and deduce the verdict second, and to flag any disagreement with the suite's own "Expected FAIL" annotations. **Zero disagreement on 7 rows** — a clean result that is also, honestly, the weakest possible evidence against write-to-the-answer. S6 is the only real guard: it could have fallen.
- **The suite announces its expected verdicts** in the *Instruction pinned* column. Inherent to the 6-column form; open defect, not corrected here.
- The judge read no Results log — it was empty.

**Frictions raised, and what was done.** Fixture paths in the preconditions block omitted the `_code\` segment; S2 stated a fact rather than a falsifiable criterion; S3 and S4 named fixtures that do not carry the declared stack; S1 was filed under one defect family while exhibiting both. **All corrected below, after this run.** One judge conclusion was *not* adopted: it reported that no `rusqlite` fixture exists — `lyremember\_code\app\rust-backend\Cargo.toml:10` declares it, and S4 was re-anchored there rather than moved to `email-to-markdown`.

⚠ **The rows were amended after this run.** The verdicts above stand for the text as judged; the corrections are editorial (anchors, paths, criterion wording) and change no pinned behaviour, but a run 2 is what would re-validate them.

### 2026-08-03 — run 2 (post-fix), on the corrected installers

**6 PASS · 0 FAIL · 1 N/A** on 7. Judge: one subagent, **fresh context, author of neither the suite nor the fixes**, dry-run READ-ONLY, sources read in `plugins/`. Target: the working tree of parts 1–4 (six installer actions edited, one deleted).

| # | Before | After | Verdict of the delta |
|---|--------|-------|----------------------|
| S1 | FAIL | **PASS** | Both required remedies applied. The three orphan declarations are **removed** (`references/` holds 9 files, the table declares 9) — the alternative the row itself allowed, publish-or-withdraw, resolved by withdrawal. The frozen `12 files written` is gone: `:38` derives `<n>`, `:42` carries an example marker, `:50-52` adds the not-found branch, `:54` the total-failure header. |
| S2 | FAIL | **N/A** | **The intended outcome, written into the row at run 1 — not a suite debt.** `sc-css/skills/sniff/actions/02-install-pivots.md` no longer exists (arbitration A1 of part 4); no residual reference anywhere in the plugin. A vanished target is unjudgeable, never red. The row is now an **archive**: it attests to the removal and contributes nothing to coverage. It should be marked closed rather than replayed. |
| S3 | FAIL | **PASS** | The single unconditional block is gone. Three cases (`:41` A, `:62` B, `:83` C), derivation clause at `:39`, reinforced at `:64-66`. Sources 6/6. On the WordPress fixture the header is now derivable instead of announcing Laravel and Eloquent installed. |
| S4 | FAIL | **PASS**, with a residue named below | The pinned *mechanism* — the frozen block — is gone (`:37` clause, three cases at `:39`/`:57`/`:78`). The pinned *symptom* persists: the Case A illustration `:44-49` still names `axum`, `sqlx`, `diesel` and **not `rusqlite`**. Judged PASS for consistency with the standard the suite applies to its own positive control, which passes while naming 3 of its 13 targets. |
| S5 | FAIL | **PASS** | The clause whose absence the row pinned is present at `:49`, word for word identical to `sc-js:46`. Three cases at `:51`/`:70`/`:91`. Declaration tables unchanged, sources 9/9. |
| S6 | PASS | **PASS** | Positive control holds, **and for the measured reason**, not by carry-over: `:46` verbatim, real three-case branching, 13/13 targets resolve. It was free to fall — the same wave of edits deleted a source in `sc-python` (`capabilities/ap/django-activitypub.md`). |
| S7 | FAIL | **PASS** | `:18` announces **12** paths, `capabilities/styling/design-system.md` is out, 12/12 resolve. The missing guard branch exists at `:20`: a candidate with no plugin reference is skipped and reported, never deleted. Example arithmetic recalculated (`:67-69`, 5 + 1 + 6 = 12). |

**No `PASS → N/A` in this run** — no suite debt was created. The single `FAIL → N/A` is S2, the one the suite declared in advance as its nominal outcome.

**Five nominal disagreements with the run-1 annotations**, all in the same direction (annotated *Expected FAIL*, measured PASS): S1, S3, S4 (partial, see below), S5, S7. The judge was told the *Instruction pinned* column predates the fix and that *Expected FAIL* is no longer a valid expectation; it re-localised every anchor by meaning, the line numbers having moved on five files.

**Residues left open, none of them a regression.**
- **S4 is now ambiguous and should be rewritten.** Its criterion asserts that `rusqlite` "must appear in the outcome" and evidences this by "the frozen block never names it". The two propositions have come apart: the block is no longer frozen, the illustration still does not name it. Measured coverage of the Case A illustration: `sc-php` 6/6, `sc-rust` 3/4, `sc-python` 4/9, `sc-js` 3/13. A body at 75 % **reads as exhaustive** where one at 23 % reads as an extract — `sc-rust` is the most exposed to literal copying. Either the row demands an example marker (as `01-install.md:42` now carries), or it drops the naming requirement and keeps only the branching. As written it licenses two opposite readings.
- **The four `sniff` installers derive the header and nothing else.** The Case A bodies remain fixed text without an example marker — exactly what S6 warned about at run 1 (*lift `:46` and `:70`, not the blocks*). No scenario pins this as a pass criterion, so no row can fail on it. The only installer that shows the remedy is `01-install.md:42` — the one nobody took as a model.
- **S1's precondition is dead.** The row states "four data pivots are declared; three do not exist" — the table declares one. The row survives only because its *criterion* (the count is not frozen) outlives its *situation*.

**What the suite discriminates now, and what it no longer does.** It has changed function: at run 1 it separated honest installers from lying ones; all seven rows now fall on the same side. It still measures **degrees of derivation** — S1 overtakes the positive control (the only one with both an example marker and a dedicated missing-source branch), and the correction wave demonstrably followed S6's instruction, lifting the clause and the branching rather than the bodies. But **the negative control is gone**: with no red left in the *frozen output* family, the positive control alone no longer establishes that a faulty case would be caught. This is a non-regression suite now, not a reproduction one — structural, and not fixable by editing a row.

**Harness defects: one closed, one worsened.**
- **Closed — judge = suite author.** Fresh context, no part in writing the suite or the fixes, and 5 disagreements on 7 with the displayed expectations — the inverse of run 1's zero-disagreement, which was its own admission of weakness.
- **Worsened — the *Instruction pinned* column announces verdicts that are now false on 5 rows of 7.** At run 1 it was biasing; it is now actively misleading. A judge that copies it returns six wrong FAILs. The column needs rewriting before a run 3, or the annotations need moving out of the scenario rows.

**Non-mutation guard.** No write-class command of any kind; no `git` command in `email-to-markdown\_code\app` (*dubious ownership*), no `git config`. `find -newermt` over the fixtures returned zero results; all fixture mtimes predate the session. Declared for honesty: `lyremember\_code\app\.git` carries a directory mtime inside the session window with no file changed under it — attributed to an external process, reported rather than omitted.

### 2026-08-03 — suite revision, after run 2 and judged by no run

**Three of run 2's own findings applied to the suite, none to a target.** No skill, action or reference file was edited by this revision; the verdicts above stand unchanged.

- **The *Instruction pinned* column is removed.** Its content moved to *Appendix — instruction measurements by run*, dated and marked non-rebasable, and the rows lost their `Expected FAIL` / `PASS is the expected result` annotations. This closes the harness defect disclosed at both runs and worsened at run 2.
- **S8 added — the negative control the *frozen output* family lost.** Its subject is the residue run 2 named and no row could fail on: the illustrated body. Measured 0 of 4 on the `sniff` installers against `01-install.md:42`. **Not yet judged** — it enters the tally at run 3, and until then the family's red is documented but not adjudicated.
- **S4 narrowed and S2 archived.** S4 drops the naming requirement its run-2 verdict found ambiguous, keeping only the branching; the naming question is S8's, where it applies to four installers instead of one. S2 is marked closed rather than replayable. **S1's dead precondition is also repaired** — the row now states its criterion without asserting a count that the fix has changed.

**What a run 3 owes this suite.** Grade S8 for the first time, and re-grade S1, S3–S7 against criteria that no longer carry an announced verdict — the first run whose judge cannot read the answer off the page even by accident.

### 2026-08-03 — run 3 (negative control adjudicated), on the same installers

**6 PASS · 1 FAIL · 1 N/A** on 8. Judge: one subagent, **fresh context, author of neither the suite nor the fixes of issue #13**, dry-run READ-ONLY, sources read in `plugins/` only, no read under `~/.claude/plugins/cache/`.

**The FAIL is the point of this run, not its accident.** Run 2 closed every row and by doing so destroyed what the suite established: with no red left in the *frozen output* family, its positive control alone proved nothing about a *new* defect. S8 was written to hold that red and left unjudged on purpose. A run 3 returning 0 FAIL would have graded the negative control wrong.

| # | Before | After | Verdict of the delta |
|---|--------|-------|----------------------|
| S1 | PASS | **PASS** | Held, and re-measured rather than carried over: `references/` holds 9 files, the two tables declare 9 — 9/9, no orphan. Still the only installer carrying **both** an example marker and a clause ordering the enumeration, not merely the header. |
| S2 | N/A | **N/A** | Not replayed. `sc-css/skills/sniff/` holds two files, `SKILL.md` and `actions/01-scan.md`; the target is gone. Archived row, contributes nothing to coverage — as declared at run 2. |
| S3 | PASS | **PASS** on the criterion | Three cases and derivation clause present, sources 6/6, fixture reconfirmed (`scriptami\_code\wp-2026` has no `composer.json`). **But see D3: the row's *Expected behaviour* is false on the fixture it names.** |
| S4 | PASS | **PASS** | Branching present, sources 4/4, `rusqlite = { version = "0.30", … }` reconfirmed in the fixture. The run-2 residue — the Case A illustration still not naming `rusqlite` — persists but has moved rows: it is judged under S8, where it falls. |
| S5 | PASS | **PASS** | Clause present, character-identical across the four `sniff` installers (verified by grep, not by anchor). Sources 9/9, `capabilities/protocol/activitypub-django.md` included. |
| S6 | PASS | **PASS** | Positive control holds on a re-measured basis: 34 files listed under `capabilities/`, the 13 declared targets paired one by one. |
| S7 | PASS | **PASS**, with a placement reserve | 12/12 paths resolve, the example arithmetic closes (5 + 1 + 6 = 12), the missing-reference branch exists. **Reserve**: that branch lives in prose in *Closed path list*, while the numbered procedure an agent actually walks carries no trace of it — step 2 says "Read the corresponding reference file" with no exit if it is absent. |
| S8 | *(never judged)* | **FAIL** on all four | First adjudication. Neither admitted form is present: no example marker in any Case A block, and the existing clause says the opposite — `Pick the **header** by what actually happened`, the body never mentioned. |

**S8's measurement, and the trap it walks past.** A bare grep for the ellipsis returns a hit in each of the four files — and a judge stopping there scores S8 green on all four. Those hits sit in the **Case C** description, where the ellipsis stands for a file path, not for an elided extract. Framed on the Case A blocks proper, none contains an ellipsis, `one line per`, or `actually processed`. Coverage of the illustrated bodies, recounted target by target: `sc-php` 6/6 · `sc-rust` 3/4 · `sc-python` 4/9 · `sc-js` 3/13.

**An aggravating circumstance run 2 did not surface.** A search for reproduction instructions across the four files returns exactly one, and it points the wrong way: **`Use this header verbatim`**, in every Case B. The files establish a norm of literal reproduction for one block and never post the counter-instruction on the other. Case A is not merely unmarked — it is the unmarked block of a file that elsewhere orders copying word for word.

**Disagreements, and what was done with them.**
- **Adopted — `sc-php` is the more exposed, on a different axis than run 2 measured.** Run 2 ranked `sc-rust` most exposed because a body at 75 % *reads* as exhaustive. Run 3 measures that `sc-php` at 6/6 **is** exhaustive: a literal copy is indistinguishable from a derived output, no missing line betrays it, and on S3's WordPress fixture that copy asserts `perf-pivots-laravel.md (installed)` and `data-pivots-eloquent.md (installed)`. Both rankings hold on their own axis — one under-declares, the other certifies falsely. The remedy order follows the second.
- **Adopted on the fact, corrected on the attribution — the fixture park is not frozen.** `lyremember\_code\app\rust-backend\Cargo.toml` carries a same-day mtime (19:17). The judge attributes it plausibly to the issue-#13 fix lot; that is wrong. `Cargo.lock` 17:44, `src/` 18:51, `Cargo.toml` 19:17 is a live Rust session, and the #13 lot wrote nothing outside `plugins/` and one Nuxt fixture file. The fact stands and matters — the `Cargo.toml:10` anchor pinned in the preconditions block is not guaranteed at the next run — the cause does not.
- **Recorded, not resolved — S3 and S5 pass a criterion their *Expected behaviour* contradicts.** S3 expects that "a Laravel pivot is not reported installed on a WordPress project"; on the named fixture, with the current text, an agent following the action does exactly that. The *Pass criteria*, narrowed to branching plus derivation clause, cannot see it. Grading it FAIL would double-count S8's defect, so PASS stands — but a row whose *Expected behaviour* is a false assertion about its own fixture is not a thing a suite should carry in the clear.

**Frictions, one of them ours.**
- **The no-read rule is structurally unenforceable.** Criteria, appendix and results log share one file; loading the criteria loads the answers. The judge disclosed this rather than claiming compliance, and re-measured every observable before comparing. Remedy is a split, not a stronger instruction.
- **S8 announced its own verdict inside its *Pass criteria* cell** — the very defect the 2026-08-03 revision claimed to close by removing the *Instruction pinned* column, reappearing two columns to the left, and on the one row this run was meant to adjudicate independently. **Corrected below, after this run.**
- **The example-marker criterion was not scoped to the Case A block**, so its naive test returns the opposite of the correct verdict. **Corrected below.**
- **S4 no longer discriminates.** After narrowing, its criterion is word for word S3's and S5's; nothing in it depends on `rusqlite`, on `lyremember`, or on Rust. It would return the same verdict with no fixture at all.
- **No row of this suite loads the files edited by issue #13** (`web-optimize` / `data-optimize`). None were opened; no verdict above scores them.
- **Every green here is obtainable by withdrawal.** "Every declared source resolves on disk" is satisfied by publishing the source *or* by deleting the declaration, and the fixes chose deletion: `web-tiers` went 12 → 9 targets, `sc-css` 6 → 0. The suite measures honesty, not coverage. True and intended — but a later run must not read these PASS as functional progress.

**Non-mutation guard.** No write-class command of any kind (`mkdir`, `touch`, `cp`, `mv`, `rm`, `tee`, redirections, `sed -i`), no `Write`/`Edit`/`NotebookEdit`. **No `git` command anywhere in the park**, in particular none in `email-to-markdown\_code\app` (*dubious ownership*), and no `git config`. Verification by listing and mtimes only, never by `git status`. `find -newermt "2026-08-03"` over the five fixtures returned zero results on four of them; on `lyremember` it returned the two entries disclosed above, both stamped before this context opened.

### 2026-08-03 — suite revision, after run 3

**Two of run 3's frictions applied to the suite, none to a target.** The verdicts above stand unchanged.

- **S8's measurement leaves its criterion.** The `0 of the 4` count and the `red on the same four files` clause move to the appendix, dated. A criterion that recites its own measurement stops grading the target and starts grading the day it was written — the contract's rule, broken here on the row least able to afford it.
- **The example-marker criterion is scoped.** The search is bounded to the Case A fenced block; the ellipses in Case B and C are not marks of elision and must not be counted.

Left open for the next issue, deliberately: the file is not split (criteria / runs), S3's false *Expected behaviour* stands, S4 still duplicates S5, and S8 stays red — it is the family's only living red, and closing it before the next run would repeat run 2's mistake.

### 2026-08-05 — suite revision, before run 4

**S9 added — the negative control the *declared source missing* family is about to lose.** S8's fix lands on the four `sniff` installers this cycle, so the *frozen output* family will hold no living red. The *declared source missing* family has held none since S7's fix at run 2: S1 grades the one plugin that carries the branch. S9 grades the four that do not. Written and measured now (appendix, same date), **out of tally at run 4**, entering at run 5 — S8's cycle exactly, and the only reason its run-3 verdict was worth anything.

One correction the row must survive: the four installers were briefly given the missing clause in the same wave of edits that closed S8, which would have made S9 green at birth. It was withdrawn. A row written against a defect its own author has just fixed measures the author, not the target.

Not fixed, deliberately: the four installers keep no branch for an unresolvable source. That is the defect S9 names, and the next cycle's work.

### 2026-08-05 — run 4 (S8 re-graded after its fix), fresh-context judge

**Method breach, declared by the judge and recorded here rather than in its favour.** The first `Read` loaded the whole suite file, so *Appendix* and *Results log* were in context before any row was graded — the one instruction this suite has repeated since run 1. The judge rebuilt every verdict from the primary sources and reports no figure lifted from the appendix, but that is a mitigation, not the guarantee the rule exists to give. **This run's verdicts are weaker than run 3's by exactly that much.** It is the second run to hit the wall: the file is not split, and a judge cannot open the criteria without opening the answers. The remedy is structural — split the file — and it is the harness issue's first item, not a judge instruction to repeat louder.

| # | Before (run 3) | After (run 4) | Δ |
|---|---|---|---|
| S1 | PASS | **PASS** | = — 9 sources declared (`:11-26`), 9 resolve; `:38` derives `<n>`, `:47-52` the not-found branch, `:54` the total-failure header |
| S2 | N/A | **N/A** | = — `sc-css/skills/sniff/` holds `SKILL.md` and `01-scan.md` only. Archived row, re-confirmed vanished, not replayed |
| S3 | PASS | **PASS** | = — three cases (`:47`, `:67`, `:88`), derivation clause `:39`, sources 6/6 |
| S4 | PASS | **PASS** | = — `:37`/`:45`/`:64`/`:85`, sources 4/4 |
| S5 | PASS | **PASS** | = — `:49`/`:57`/`:76`/`:97`, sources 9/9 |
| S6 | PASS | **PASS** | = — `:46`/`:54`/`:74`/`:94`, sources 13/13. Positive control holds |
| S7 | PASS | **PASS**, with a placement reservation | = on the verdict — 12/12 paths resolve; the missing-reference branch is at `:20`, in the *Closed path list* prose, **outside** the numbered *Content-match guard* (`:39-47`) that an agent actually executes. Step 2 orders "read the corresponding reference file" and prescribes no exit if it is absent |
| S8 | **FAIL** on 4/4 | **PASS** on 4/4 | **↑ closed** — example marker inside the Case A fence: `sc-php:55,59` · `sc-rust:52,56` · `sc-python:64,68` · `sc-js:62`; plus the counter-instruction *"The blocks below are shapes, not contents — do not copy their lines"* at `sc-php:41` · `sc-rust:39` · `sc-python:51` · `sc-js:48`. Scope verified between the fences, Case B/C ellipses excluded as the row requires |
| S9 | *(did not exist)* | **out of tally — measured FAIL on 4/4** | new row — no branch governs an unresolvable **source** in any of the four; the only near-miss is `If the target file does not exist → install` (`sc-php:27-31`, `sc-rust:25-29`, `sc-python:37-41`, `sc-js:34-38`), which governs the target |

**Tally in force (S1, S3–S8): 7 PASS · 0 FAIL.** *Declared source missing* 2/2 · *frozen output* 4/4 · *illustrated body* 1/1. **The suite holds no living red in tally** — which is the state S9 was written for, and why it is dated the day before this run rather than after it.

**Frictions and disagreements, run 4.**
- **S3's *Expected behaviour* is not reproduced as false.** Run 3 held that on the WordPress fixture the text would report Laravel and Eloquent installed. Traced this run against `scriptami\_code\wp-2026`: no `composer.json`, no `artisan` at root, `wp-content/` present — `01-scan.md:16,32` never arms Laravel, WordPress arms alone. Either the text moved between runs or run 3 mislocated the source of truth: S3 loads `02-install-pivots.md`, which consumes `01-scan`'s manifeste and does no detection of its own. **The row's stated defect could not be reproduced; it is not thereby disproved** — the judge had to leave the declared load path to check, which is itself the finding.
- **S4 still discriminates nothing S3 and S5 do not.** The check the judge ran for S4 is bit-for-bit the one it ran for S3 and S5; nothing in it depends on `rusqlite` or on Rust. Run 3's revision narrowed S4 and this run measures the cost: it is now unfalsifiable independently. Third run in a row this is written down.
- **S7's PASS is thinner than its verdict.** See the placement reservation above. A stricter reading — the branch must live in the executed procedure, not in a preamble — grades it FAIL. Both readings are defensible on the current text, which is the defect.
