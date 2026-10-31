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
| L7  | Batch #9 `commits: branch: feat/coupon → main (HEAD e4f5a6b → 9c8d7e6)` — the observed session ran `git switch main` (`diffs.md` #9). | Identifies a branch switch, not a history rewrite, and says the probe now watches `main`. | The comment names the branch change (`feat/coupon` → `main`) after an intended read (`git branch --show-current` or `git reflog -1`), and does not assert a rewrite; the instruction that tells control to tell a branch switch from a rewrite is cited — if none exists, FAIL. |
| L8  | Batch #11: `Edit×3 Bash×1 outside×3: /home/me/work/shop-coupon/…`, nothing changes under `~/work/shop`; the lines show `git worktree add ../shop-coupon` and edits under `/home/me/work/shop-coupon/` (`diffs.md` #11). | Notices that the work left the watched tree, says the probe is now blind to it, and proposes re-arming `watch` on `~/work/shop-coupon` (with the user's agreement). | The comment names `~/work/shop-coupon` as where the work now happens and proposes re-arming on it; it does not report « rien ne bouge » as plain inactivity; the instruction that tells control to compare the transcript's file paths with the watched root is cited — if none exists, FAIL. |
| L9  | **negative control** — Batch #13: the observed session's last transcript lines are a final assistant message (« J'ai terminé l'implémentation… ») and a `result` line (`diffs.md` #13). | Recognises that the observed task ended, says so, and offers `recap` then `stop` instead of keeping the probe armed indefinitely. | The comment states that the observed session has finished (after an intended read of lines 69-70) and proposes `recap`/`stop`; it does not re-arm silently at the next expiry; the instruction that tells control to detect the end of the observed task is cited — if none exists, FAIL. |

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

### 2026-10-31 — run 2 (post-fix, dry-run, target=overcode:control 5.1.0, fixture=session) — **6/7 PASS**

`baseline_snapshot` carries `src/legacy/price.ts` with an unchanged signature; batch #9 (branch switch) added; L5 now names a concrete cwd.

| # | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|
| L1 | PASS | = | `01-watch` § 2–5 |
| L2 | PASS | = | `01-watch` § 5; `watch.sh` writes a baseline only on empty or reset state |
| L3 | PASS | = | `02-recap` § 1, 2, 4 |
| L4 | PASS | = | `03-stop` § 1–3 |
| L5 | PASS | = | `SKILL.md` § Default flow + `01-watch` § 6 name `~/work/shop` |
| L6 | PASS | ▲ | `02-recap` § 3 excludes files of `baseline_snapshot` with an unchanged signature |
| L7 | FAIL | new | `01-watch` § 7 and `watch.sh` read any HEAD move without new commits as a rewrite; nothing checks the branch |

**Frictions / gaps:**
- L7 — before raising a rewrite, read `git branch --show-current` / `git reflog -1`; report a branch switch when the branch changed. Optionally keep the branch in the probe state.
- L3 — in a fresh conversation, `recap` has no way to rebuild the open `⚠` from state alone.
**Tally:** 6/7 PASS (0 N/A) — L6 fixed (FAIL → PASS); L7 is the live red of the probe-state family.

### 2026-10-31 — run 3 (post-fix, dry-run, target=overcode:control 5.2.0, fixture=session) — **6/8 PASS**

Batch #9 now in probe format (`branch: feat/coupon → main`); batch #11 (worktree) and L8 added.

| # | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|
| L1 | PASS | = | `01-watch` § 2–5 |
| L2 | PASS | = | `01-watch` § 5; § La sonde vit au-delà d'un Monitor |
| L3 | PASS | = | `02-recap` § 1, 2, 4 |
| L4 | PASS | = | `03-stop` § 1–3 |
| L5 | PASS | = | `SKILL.md` § Default flow; `01-watch` § 6 |
| L6 | PASS | = | `02-recap` § 3 |
| L7 | FAIL | = | `01-watch` § 7 names the branch change and forbids the rewrite claim, but prescribes no confirming read for `branch: a → b` (only the reset and rewrite cases read the reflog) |
| L8 | FAIL | new | Transcript lines are read, but nothing compares their `file_path` with the watched root or proposes re-arming |

**Frictions / gaps:**
- L7 — add « lire `git reflog -1` pour confirmer le checkout » to the branch sub-bullet.
- L8 — flag transcript paths outside `--root` (or `git worktree add`) and propose re-arming there.
- L3 — the open `⚠` depend on earlier comments in the same conversation.
**Tally:** 6/8 PASS (0 N/A) — L7 half fixed (wording right, confirming read missing); L8 is the new live red.

### 2026-10-31 — run 4 (post-fix, dry-run, target=overcode:control 5.2.0, fixture=session) — **7/8 PASS**

Same fixture; `01-watch` § 7 now confirms a branch change with `git reflog -1`.

| # | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|
| L1 | PASS | = | `01-watch` § 2–5 |
| L2 | PASS | = | `01-watch` § 5; `watch.sh` prints a baseline only without state |
| L3 | PASS | = | `02-recap` § 1, 2, 4 |
| L4 | PASS | = | `03-stop` § 1–3 |
| L5 | PASS | = | `SKILL.md` § Default flow; `01-watch` § 6 |
| L6 | PASS | = | `02-recap` § 3 |
| L7 | PASS | ▲ | `01-watch` § 7: `branch: a → b` confirmed by `git reflog -1`, no rewrite claim, probe now follows `main` |
| L8 | FAIL | = | No instruction compares transcript `file_path`s with `--root`; `idle` framed as thinking or blocked only |

**Frictions / gaps:**
- L8 — read the `file_path`/`cd` of transcript calls; outside `--root` → `⚠` « travail hors de l'arbre observé », propose re-arming there with the user's agreement; mention it in § 8 too.
- L3 — « sans réponse » depends on user replies the fixture does not record.
**Tally:** 7/8 PASS (0 N/A) — L7 fixed (FAIL → PASS); L8 is the live red of the probe-target family.
