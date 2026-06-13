# Scaffold

Author a new behavioural **scenario suite** for a target (skill, agent, or loop), pinning its expected behaviour as durable, judgeable scenarios.

## Inputs

- `$ARGUMENTS` (required) — `<target> [--name <slug>] [--checker]`
  - `target`: path to the target's `SKILL.md` / `agent.md` / action files (the spec under test).
  - `--name <slug>`: optional — the aspect this suite covers (e.g. `rules-triggering`, `dialogue-quality`). Defaults to the target's name.
  - `--checker`: optional — also scaffold a Python data-integrity checker (see `@../references/checker-pattern.md`) when the target is data-backed.

## Outputs

```
## Behave — scaffolded <name>-scenarios.md
- Target: <path>
- Aspect: <one line>
- Scenarios: <N> (<G> GO, <K> NO-GO, <B> boundary)
- Fixture expected: <named populated fixture + required state>
- Checker: <path | none>
- Next: `/behave run <suite> <fixture>`
```

A scenario suite written to `<target>/evals/<name>-scenarios.md` (+ an optional `<name>-data-checks.py` when `--checker`).

## Process

### Step 1 — Read the target's spec

Read the target's `SKILL.md` / `agent.md` and its action/reference files. Extract the **behaviours, rules, and invariants** it claims: what it must do, refuse, name, route, and **write** (and to where), plus its transversal rules and pitfalls. These become the scenarios.

### Step 2 — Derive scenarios (one aspect per suite)

Pick **one aspect** to pin (don't mix unrelated behaviours in one suite). For that aspect, write scenarios that cover:
- **GO cases** — the behaviour fires correctly (each maps to a rule the spec states).
- **NO-GO / refuse cases** — the target must *not* do X (forbidden write, fabrication, mis-route).
- **Boundary / precondition cases** — what happens when a precondition is absent (→ judged N/A, or a graceful-degrade behaviour).
- A **data-precondition guard** row when the behaviour depends on data being present (root-cause guard).

Each scenario = `Situation → Expected behaviour → Pass criteria`. Make pass criteria **write-scoped** wherever possible (verifiable by diffing intended writes), per `@../references/harness-conventions.md`.

### Step 3 — Write the suite from the template

Use `@../assets/scenario-template.md`. Fill: the intro (what THIS suite tests vs siblings), the **Fixture / preconditions** note (what populated state the decisive scenarios need + a named reference fixture), the scenario table(s), the **How to run** section (load list + decisive write-scoped observables), and an empty **Results log**.

Write to the target's `evals/` dir as `<name>-scenarios.md` (create `evals/` if missing). Never overwrite an existing suite — if one exists, propose additions instead.

### Step 4 — (`--checker`) scaffold the data-integrity checker

If `--checker` and the target is data-backed: create a `<name>-data-checks.py` next to the suite, following `@../references/checker-pattern.md`. Mirror the target's own data-resolution logic; assert the invariants the target relies on; distinguish FAIL vs WARN. Note it in the suite's "Fixture / preconditions" as a pre-flight.

### Step 5 — Report

Report the suite path, the scenario count, the aspect covered, and the fixture the suite expects. If the suite targets a known defect, state that it is expected to FAIL until the fix (reproduce-then-confirm).

## Test

The scaffolded suite exists at the emitted path, contains a scenario table (≥1 GO and ≥1 NO-GO/refuse row), a "Fixture / preconditions" note naming a populated fixture, a "How to run" section listing the decisive write-scoped observables, and an empty "Results log" section.
