# Regress

Re-run one or more existing scenario suites after a change and **confirm no behaviour regressed** — flag any PASS→FAIL, prove that a targeted fix now PASSes.

## Inputs

- `$ARGUMENTS` (required) — `<suite.md…>|<dir> <fixture> [--mode <m>]`
  - `suite.md…` or `dir`: one or more suites, or a directory of suites (e.g. a skill's `evals/`).
  - `fixture`: the populated target/domain to judge against (READ-ONLY).
  - `--mode <m>`: optional — `regression` (default) | `post-fix` | `generality`.

## Outputs

```
## Behave — regression (<N> suites, fixture=<f>)
| Suite | Tally | Δ vs prior | Regressions |
|-------|-------|-----------|-------------|
| <s1>  | X/Y PASS (Z N/A) | =/▲/▼ | none / <ids> |
| …     | | | |

Verdict: <0 regressions — green | N regressions — <ids> (suspected cause: <…>)>
```

Side effect: a dated `regression` run appended to each suite's Results log. Nothing is written to any fixture.

## Process

### Step 1 — Resolve the suite set

Collect the suites: explicit paths, or every `*-scenarios.md` under the given directory. For each, locate the **last recorded run** in its Results log — that is the Δ baseline.

### Step 2 — Run each suite (pipeline)

For each suite, execute the dry-run judge harness exactly as `@02-run.md` (load target instructions + suite, READ-ONLY fixture, score PASS/FAIL/N/A with intended-writes reasoning). Suites are independent — run them in parallel where possible.

### Step 3 — Compute Δ vs the prior run

Per suite and per scenario, compare to the baseline:
- **= held** — same verdict as before.
- **▲ improved** — FAIL/N-A → PASS (e.g. the targeted fix now passes — reproduce-then-confirm closed).
- **▼ REGRESSED** — PASS → FAIL. This is the signal `regress` exists to catch. Surface it first.
- N/A whose precondition is unchanged stays N/A (not a regression).

### Step 4 — Adjudicate the cross-suite verdict

- **0 ▼** → green: report each suite's tally and the held/improved deltas.
- **≥1 ▼** → a change broke a previously-passing behaviour. Name the regressed scenario(s), the suspected cause (the edit that touched the relevant instruction), and stop for the user — **do not "fix the test"**.

### Step 5 — Append a regression run to each suite + summarize

Append a dated `regression` run to **each** suite's Results log (verdict table + Δ column + tally). Then print a consolidated summary across suites.

## Test

Each suite in the set gains a dated `regression` run entry with a Δ-vs-prior column; the consolidated summary states an explicit regression count; any PASS→FAIL is surfaced first with a suspected cause; no suite was edited to mask a failure; nothing was written to the fixture.
