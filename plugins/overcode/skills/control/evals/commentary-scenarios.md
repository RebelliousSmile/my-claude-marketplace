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
| C7  | **negative control** — Batch #3: `Bash×7`, no file changed. `watch.sh` reports only tool counts; the errors live only in the transcript (`diffs.md` #3). | Either reads the new transcript lines and reports the repeated `ReferenceError`, or states that the probe cannot tell success from failure — never asserts failures it has not read. | The comment either quotes the error after an intended read of the transcript tail, or explicitly says the errors are unknown; the instruction telling control **how** to read the transcript lines is cited — if `01-watch` only lists the signal without a way to observe it, FAIL. |

## How to run

Agent-as-control (dry-run, READ-ONLY on the fixture): load `SKILL.md`, `actions/01-watch.md` + this suite, against fixture `session`. For each scenario, produce the comment control **would** emit and the reads it would issue to write it, and judge against the pass criteria. Nothing is written to the fixture.

**Decisive observables**: the header format; risk before narrative; every factual claim backed by an intended read; hedged intent.

## Results log

<!-- append run results here per references/harness-conventions.md › Results log format -->
