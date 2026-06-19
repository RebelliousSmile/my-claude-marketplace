# Harness conventions — the behavioural-test contract

How `behave` runs behavioural tests for prompt-driven targets (skills, agents, loops). These conventions are the contract every action follows.

## What a behavioural test is

A target whose correctness is a **behaviour** — what it does, refuses, names, routes, and *writes* — not a return value. Examples: a skill that must write to `mj/` and never `canon/`; an agent that must trigger a game move instead of free-narrating; a router that must defer to a tool when one applies. Such behaviour can't be asserted by a unit test; it is **judged** against explicit pass criteria.

A **scenario suite** (`<target>-scenarios.md`) pins the behaviour: one row per scenario = `Situation → Expected behaviour → Pass criteria`. It is a **durable regression spec**, not a one-off check.

## The dry-run judge model

A run spawns one or more **judge subagents**. Each:

1. **Loads the target's own instructions** as its operating spec — the target's `SKILL.md` / `agent.md` / action files — plus the scenario suite and its pass criteria.
2. **Reads the fixture READ-ONLY.** The fixture is a real, populated domain/state. The judge **must not write, create, move, or delete anything** in it. The decisive observable is what the target *would do* — its **intended writes** (paths + scope) and **response content** — reasoned out, not executed against real data.
3. **Scores each scenario** PASS / FAIL / N/A against its pass criteria, citing the instruction (file + section) that maps or is missing, and the concrete fixture element it acted on.
4. **Returns a verdict table + frictions + tally.** No file written by the judge.

The orchestrator then appends a dated run to the suite's **Results log**. (Spawn judges with the Agent/Task tooling; for many scenarios across dimensions, fan out and judge in parallel.)

> Why dry-run: behavioural fixes must be provable **without** mutating the user's real campaign/repo/notes. Intended-writes reasoning captures the decisive observable (e.g. "would write to `_univers/<u>/mj/`, `canon/` untouched") at zero risk.

## Invariants

- **Reproduce-then-confirm.** When a suite targets a known defect, it must **FAIL on current behaviour** before the fix (proving the suite catches it), then **PASS after**. Keep both runs in the log — the Δ is the evidence the fix works.
- **Write-scoped observables beat prose.** A criterion you can verify by diffing *intended writes* (a forbidden path stays untouched; a key is never written; a fact lands in scope X not Y) is stronger than a prose judgement. Prefer them; make the decisive ones explicit in "How to run".
- **N/A vs FAIL.** A precondition the fixture doesn't meet (no active campaign, subsystem not installed, canon present so a "regenerate" gate can't fire) → **N/A**. It is a property of the test domain, not a defect. Only a real behavioural miss is **FAIL**. Never count N/A as PASS in the tally.
- **Populated fixture, not a stub.** Decisive behaviours only surface on **filled** content (a real `canon/` to defer to, ≥2 entries to force a listing, an established thread to ground onto). Name the fixture and the relevant state in every run; if a scenario needs state the fixture lacks, mark it N/A and say so.
- **Judge faithfully.** Credit only behaviour the target's instructions *actually specify*. If the target passes only because an idealized agent would do the right thing — but no instruction requires it — that is a **gap** to record, not a PASS.
- **Logic vs data limits.** If the behaviour (routing, scoping, triggering) is correct but a concrete value is unavailable (missing PC sheet, absent data file), that is a **data limit**, reported separately — the target should flag it (`[HRP]`/note), never fabricate. Do not fail the logic for a data gap.
- **Adapt surface, keep behaviour.** When a scenario's surface content doesn't fit the fixture's domain, adapt the names/entities to the fixture while testing the *same* behaviour. The behaviour under test is universal; only the surface adapts.

## Results log format

Each run appends:

```
### <YYYY-MM-DD> — run <N> (<mode>, dry-run, target=<t>, fixture=<f>) — **<tally>**

<one line: fixture state relevant to this run>

| # | <verdict columns> | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| … | … | PASS/FAIL/NA | =/▲/▼ | … |

**Frictions / gaps:** <bulleted, or "none">
**Tally:** X/Y PASS (Z N/A) — <regression statement>
```

`mode` ∈ { initial, post-fix, regression, generality }. Always state Δ vs the prior run on the same suite so PASS→FAIL regressions are visible at a glance.

## Severity of a suite's verdict

- **0 FAIL** → green; record the run, note any N/A and their fixture cause.
- **≥1 FAIL** → the suite caught a real behavioural miss. Report the root cause (which instruction is missing/contradictory), propose the minimal fix, and — only after the fix — re-run to confirm PASS. Do not silently "fix the test" to make it pass.

For detailed PASS / FAIL / N/A rules, false-good-test detection, and anti-patterns (too vague, too broad): see `@judgment-rules.md`.
