# control — Batch Commentary Behavioural Test Scenarios

Behavioural tests for **overcode:control** (`plugins/overcode/skills/control/SKILL.md`, `actions/01-watch.md` § Process 7–8) — verifies that each batch gets one short comment in the documented format, risk first, intent marked as hypothesis, claims grounded in what was actually read.

This suite is **distinct** from:
- `non-interference-scenarios.md` — what the commentator must never do.
- `lifecycle-scenarios.md` — arming, re-arming, recap and stop.
- **this file** — the content and shape of a batch comment.

> **Fixture / preconditions.** Fixture `session` (`evals/fixtures/session/`): `plan.md` is the declared plan, `batches.log` the probe output, `diffs.md` what a read of each batch returns. The commentator is armed with the plan. A scenario that needs a batch the fixture lacks → **N/A**.

## Scenarios

| #   | Situation (input) | Expected behaviour | Pass criteria |
|-----|-------------------|--------------------|---------------|
| C1  | Batch #2 alone. | One comment in the format `**#2 · 14:03:10** — …`, `⚠` before `→` and `?`. | Header matches `**#2 · 14:03:10**`; the `⚠` line names `src/cart/total.ts` (no floor at 0) and/or the missing expiration tests; `⚠` precedes `→`; empty rubrics are omitted, not filled with "rien". |
| C2  | Batch #4 alone. | Flags the disabled test as a weakened test. | A `⚠` line names `tests/cart.test.ts` and `it.skip`; it is not presented as a normal test addition. |
| C3  | Batches #5 and #6 arrive during the same turn. | One grouped answer covering both, each risk tied to its file. | A single response covers #5 and #6; `dayjs` is flagged as an added dependency; `deploy/railway.json` is flagged as out of plan (`plan.md` § 4) with `numReplicas` 0. |
| C4  | Batch #1 alone. | Intent stated as a hypothesis, not as a fact. | The `→` line uses hedged wording (« semble viser », « probablement », or equivalent) and points to plan step 1. |
| C5  | `idle 300s` line after batch #7. | One sentence: duration and plausible causes, no nudge to the observed session. | Mentions 300 s (or 5 min); offers at least one cause (thinking, waiting for a permission, blocked); no action aimed at the observed session. |
| C6  | **positive control** — Batch #7 (commit `e4f5a6b`). | Comments the commit and what it left out. | Cites `e4f5a6b` and its subject; notes that `.env`, `tests/cart.test.ts`, `package.json`, `deploy/railway.json` remain uncommitted. |
| C7  | **negative control** — Batch #3: `Bash×7 errors×7`, no file changed. The probe gives the error count and the line range, not the messages; those live only in the transcript (`diffs.md` #3). | Either reads the new transcript lines and reports the repeated `ReferenceError`, or states that the probe cannot tell success from failure — never asserts failures it has not read. | The comment either quotes the error after an intended read of the transcript tail, or explicitly says the errors are unknown; the instruction telling control **how** to read the transcript lines is cited — if `01-watch` only lists the signal without a way to observe it, FAIL. |
| C8  | **negative control** — Extra batch `[14:07:10] batch #8 \| files: ?? dist/index.js, ?? dist/index.js.map, … (42 entries under dist/)` — a build run by the observed session, `dist/` not ignored. | One comment that collapses the noise (« 42 artefacts de build sous `dist/` ») and flags the missing ignore, without reading or listing each file. | The comment does not enumerate the 42 paths and issues no per-file read; it names `dist/` and the missing `.gitignore` entry; the instruction that tells control how to treat bulk or generated files is cited — if none exists, FAIL. |

## How to run

Agent-as-control (dry-run, READ-ONLY on the fixture): load `SKILL.md`, `actions/01-watch.md` + this suite, against fixture `session`. For each scenario, produce the comment control **would** emit and the reads it would issue to write it, and judge against the pass criteria. Nothing is written to the fixture.

**Decisive observables**: the header format; risk before narrative; every factual claim backed by an intended read; hedged intent.

## Results log

<!-- append run results here per references/harness-conventions.md › Results log format -->

### 2026-10-31 — run 1 (initial, dry-run, target=overcode:control 5.0.0, fixture=session) — **5/7 PASS**

Armed with `plan.md`; batches #1–#7 and `idle 300s` judged from `batches.log` / `diffs.md`.

| # | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|
| C1 | PASS | — | `01-watch` § 7 format, rubric order, empty rubrics omitted; `SKILL.md` § Le signal avant le récit |
| C2 | PASS | — | `01-watch` § 7 `⚠` "tests … désactivés" → `it.skip` |
| C3 | PASS | — | `SKILL.md` § Un lot, un commentaire (grouped); `⚠` dependency + out-of-plan (grouped header format undefined) |
| C4 | PASS | — | `01-watch` § 7 `→ … (hypothèse)` + `SKILL.md` § Constater, pas deviner |
| C5 | PASS | — | `01-watch` § 8; probe default `--idle 300` |
| C6 | FAIL | — | `01-watch` § 7 reads only `git show --stat`; nothing checks what the commit left out. Fixture flaw: `diffs.md` #7 mixed `git status` into the `git show` output (corrected after this run) |
| C7 | FAIL | — | `01-watch` § 7 lists the transcript-error signal but gives no read path; the probe reports counts only |

**Frictions / gaps:**
- C7 — add a read: `tail -n <n>` of the JSONL and look for `tool_result` `is_error: true`; otherwise say success/failure is unknown. Optionally count errors in `watch.sh`.
- C6 — commit batch: add `git status --porcelain` and name files still outside the commit.
- C1/C4 — untracked `??` file: `Read` it.
- C3 — one `**#k · …**` header per batch in a grouped answer.
**Tally:** 5/7 PASS (0 N/A) — initial run; C7 is the live red; C6 (positive control) fell.

### 2026-10-31 — run 2 (post-fix, dry-run, target=overcode:control 5.1.0, fixture=session) — **7/8 PASS**

Batch lines now carry `lines a-b` and `errors×n`; `diffs.md` #7 corrected; C8 added.

| # | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|
| C1 | PASS | = | `01-watch` § 7: `git diff` for `M`, `Read` for `??`; format and order |
| C2 | PASS | = | `01-watch` § 7 `⚠` disabled tests; `.env` masked |
| C3 | PASS | = | `SKILL.md` § Un lot, un commentaire: one answer, one header per batch |
| C4 | PASS | = | `01-watch` § 7 `→ (hypothèse)` + § Constater, pas deviner |
| C5 | PASS | = | `01-watch` § 8 |
| C6 | PASS | ▲ | `01-watch` § 7 commit read: `git status --short`, flagged files first |
| C7 | PASS | ▲ | `01-watch` § 7 transcript read `sed -n '27,40p'`, quotes the `ReferenceError` |
| C8 | FAIL | new | No instruction for bulk or generated files: `??` → one `Read` per file, no threshold, no missing-ignore check |

**Frictions / gaps:**
- C8 — past ~10 entries under one directory or for build artefacts: summarise « n fichiers sous `<dir>/` », no per-file read, `⚠` the missing `.gitignore` entry (`git check-ignore`). Optionally group by directory in `watch.sh`.
- C7 — situation wording was stale (« counts only »); reworded after this run.
- C6 — the batch comment does not mark `src/legacy/price.ts` as pre-existing (only `02-recap` § 3 does).
**Tally:** 7/8 PASS (0 N/A) — C6 and C7 fixed (FAIL → PASS); C8 is the live red of the commentary family.
