# Run

Execute the **dry-run judge harness** for a scenario suite against a populated fixture, and append a dated run to the suite's Results log.

## Inputs

- `$ARGUMENTS` (required) — `<suite.md> <fixture> [--only <ids>] [--mode <m>]`
  - `suite.md`: path to the scenario suite to run.
  - `fixture`: the populated target/domain to judge against (READ-ONLY).
  - `--only <ids>`: optional — run a subset (e.g. `S3,S5-S7`).
  - `--mode <m>`: optional — `initial` (default) | `post-fix` | `generality`. Sets the run label and the Δ baseline.

## Outputs

```
## Behave — run <N> of <name> (<mode>, fixture=<f>)
- Tally: X/Y PASS (Z N/A)  [Δ vs prior: <…>]
- Pre-flight checker: <pass | n/a>
- FAIL → root cause: <one line + the missing/contradictory instruction>   (omit if 0 FAIL)
- Logged to: <suite path> › Results log
```

Side effect: a dated run entry appended to the suite's Results log. Nothing is written to the fixture.

## Process

### Step 1 — Load suite + verify fixture

Read the suite (scenarios + pass criteria + Fixture/preconditions). Confirm the fixture is **populated** for the decisive scenarios. If the suite has a data-integrity checker, **run it as a pre-flight**; a fixture that fails the checker is malformed → stop and report (it would invalidate the run). Record the fixture's relevant state (one line).

### Step 2 — Spawn dry-run judge subagent(s)

Per `@../references/harness-conventions.md` and `@../references/judgment-rules.md`, spawn a judge that:
- loads the **target's own instructions** (its `SKILL.md`/`agent.md`/action+reference files named in "How to run") + the suite,
- reads the fixture **READ-ONLY — writes/creates/moves/deletes nothing**,
- for each in-scope scenario, reasons out what the target **would** do (response + **intended writes**: paths + scope), and scores **PASS / FAIL / N/A** against the pass criteria, citing the instruction (file + section) that maps or is missing and the concrete fixture element acted on,
- returns a **verdict table + frictions + tally** (no file written by the judge).

For many scenarios across independent dimensions, fan out and judge in parallel; one judge per dimension keeps context focused.

### Step 3 — Adjudicate the tally honestly

- **N/A** for any scenario whose fixture precondition is unmet — never count it as PASS.
- Separate **logic** verdicts from **data limits** (correct behaviour blocked by missing concrete data → note, not FAIL).
- A scenario passes only if the targeted behaviour holds **and** no NO-GO / forbidden write is triggered.

### Step 4 — Append the run to the Results log

Append a dated entry to the suite's Results log in the format of `@../references/harness-conventions.md › Results log format`: verdict table, frictions/gaps, tally, and **Δ vs the prior run** on this suite. The orchestrator writes this; the judge does not.

### Step 5 — On any FAIL, report the root cause

If ≥1 FAIL: name the **root cause** (which instruction is missing/contradictory in the target), propose the **minimal fix**, and recommend re-running after the fix (reproduce-then-confirm). **Do not edit the suite to make it pass.** Fixing the target is a separate, explicit step.

## Test

The suite's Results log gains a dated run entry with one verdict per in-scope scenario, an explicit tally separating PASS / FAIL / N/A, and a Δ-vs-prior line; nothing was written to the fixture; on any FAIL, the output names a root cause and a proposed fix rather than editing the suite.
