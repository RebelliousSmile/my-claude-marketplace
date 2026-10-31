# control — Lifecycle Behavioural Test Scenarios

Behavioural tests for **overcode:control** (`plugins/overcode/skills/control/SKILL.md`, `actions/01-watch.md`, `actions/02-recap.md`, `actions/03-stop.md`) — verifies that the probe is armed on the right target, survives Monitor expiry without replaying, and that `recap` and `stop` report the whole game truthfully.

This suite is **distinct** from:
- `non-interference-scenarios.md` — what the commentator must never do.
- `commentary-scenarios.md` — the content of a single batch comment.
- **this file** — routing between `watch`, `recap`, `stop` and the probe's state across them.

> **Fixture / preconditions.** Fixture `session` (`evals/fixtures/session/`): `transcripts.txt` lists the JSONL candidates, `batches.log` the probe output, state dir `/tmp/overcode-control-1234567` with `batch` = 7 after batch #7; the tree was already dirty at baseline (`src/legacy/price.ts`). A scenario that needs state the fixture lacks → **N/A**.

## Scenarios

| #   | Situation (input) | Expected behaviour | Pass criteria |
|-----|-------------------|--------------------|---------------|
| L1  | « fais le commentateur sur ~/work/shop, l'autre terminal implémente plan.md ». Transcript candidates: `transcripts.txt`. | Excludes its own (most recent) JSONL, proposes `4ab0…77`, poses the baseline with `--reset --once`, arms the Monitor. | Routed to `watch`; `9f1e…c2` is not selected; baseline command carries `--reset --once`; Monitor `command` carries `--interval 10` and `--transcript …4ab0…77.jsonl`; `timeout_ms` = 1 800 000; `description` = `control — shop`. |
| L2  | The Monitor expires after 30 min; the user never said stop. | Re-arms with the same `--state`, without `--reset`, without a new baseline. | Re-arm command keeps `--state /tmp/overcode-control-1234567`; no `--reset`; no second baseline line is expected or commented. |
| L3  | After batch #7: « fais le point ». | Routed to `recap`; reports 7 batches and commit `e4f5a6b`; lists open `⚠` (secret, `it.skip`, `railway.json`). | Batch count = 7 (from the `batch` file); `e4f5a6b` cited; at least the three open risks listed; no file written; the probe keeps running. |
| L4  | « arrête de commenter ». | Routed to `stop`: stops the Monitor, final recap, deletes the state dir. | Intended `TaskStop` on the control Monitor; a recap is produced; the state dir is deleted (or kept only on explicit request); no re-arm afterwards. |
| L5  | **positive control** — « watch the long-running task » with no path given; the commentator's cwd is `~/work/shop`. | Watches the current directory and says so in its first line. | Routed to `watch`; the announcement names `~/work/shop` (or `shop`) as the observed repo. |
| L6  | **negative control** — Same `recap` as L3. At baseline the tree already carried the user's own uncommitted change `src/legacy/price.ts`. | Attributes to the observed session only what changed after baseline; `src/legacy/price.ts` is shown as pre-existing or left out. | `src/legacy/price.ts` is **not** listed among the session's changes; the instruction that separates pre-existing dirt from the session's work is cited — `git diff --stat <baseline_head>` alone includes it, so if no instruction excludes it, FAIL. |
| L7  | **negative control** — Extra batch `[14:08:00] batch #9 \| commits: HEAD e4f5a6b → 9c8d7e6 (réécriture d'historique ?)`; in fact the observed session ran `git switch main` (`9c8d7e6` is `main`'s tip, an ancestor of nothing on `feat/coupon`). | Identifies a branch switch, not a history rewrite, and says the probe now watches `main`. | The comment names the branch change (`feat/coupon` → `main`) after an intended read (`git branch --show-current` or `git reflog -1`), and does not assert a rewrite; the instruction that tells control to tell a branch switch from a rewrite is cited — `01-watch` § 7 lists only « réécriture d'historique (`HEAD … → …`) », so if none exists, FAIL. |

## How to run

Agent-as-control (dry-run, READ-ONLY on the fixture): load `SKILL.md`, the three action files and `scripts/watch.sh --help` + this suite, against fixture `session`. For each scenario, reason out the route, the commands and tool calls control **would** issue (with their arguments) and its response, and judge against the pass criteria. Nothing is written to the fixture.

**Decisive observables**: chosen transcript; `--reset` present only at first arming; same `--state` on re-arm; batch count read from state; state dir fate at stop.

## Results log

<!-- append run results here per references/harness-conventions.md › Results log format -->

### 2026-10-31 — run 1 (initial, dry-run, target=overcode:control 5.0.0, fixture=session) — **5/6 PASS**

State dir `/tmp/overcode-control-1234567`, `batch` = 7; `src/legacy/price.ts` dirty before baseline.

| # | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|
| L1 | PASS | — | `01-watch` § Process 2 drops the most recent JSONL, proposes `4ab0…77`; § 4 `--reset --once`; § 5 `--interval 10`, `timeout_ms` 1 800 000, `control — shop` |
| L2 | PASS | — | `01-watch` § 5 and `SKILL.md` § Transversal rules: same `--state`, no `--reset`; `watch.sh` emits no baseline while `snapshot` exists |
| L3 | PASS | — | `02-recap` § 1–3: `batch` = 7, `git log a1b2c3d..HEAD` → `e4f5a6b`, open `⚠` from `01-watch` § 7 |
| L4 | PASS | — | `03-stop` § 1–3: `TaskStop`, final recap, state deleted unless kept |
| L5 | PASS | — | `SKILL.md` § Default flow: current directory, said in first line (weak discrimination: no concrete cwd in the row) |
| L6 | FAIL | — | `02-recap` § 2 `git diff --stat <baseline_head>` includes pre-existing dirt; no instruction separates it, and `watch.sh` overwrites `snapshot` every tick, so the baseline file list is lost |

**Frictions / gaps:**
- L6 — keep a never-overwritten `baseline_snapshot` in `watch.sh`, and make `02-recap` exclude (or mark « préexistant ») files whose signature is unchanged since baseline.
- L5 — give a concrete cwd in the situation to make the criterion discriminating.
- L1 — bundles four checks; split transcript selection into its own row if it ever fails.
**Tally:** 5/6 PASS (0 N/A) — initial run; L6 is the live red of the attribution family.
