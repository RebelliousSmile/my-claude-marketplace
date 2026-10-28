# Practice

Generate a targeted PowerShell exercise modelled on the current project's patterns, then evaluate the solution.

## Inputs

- `topic` (required) — concept to practise (from `01-explain` or user-specified)
- `difficulty` (optional) — `beginner` | `intermediate` | `advanced` (default: infer from the project's scripts)

## Process

### Step 1 — Choose the exercise type

| Difficulty | Exercise |
|---|---|
| Beginner | Fix a snippet that misbehaves, given its real output |
| Intermediate | Write a function with a given contract (parameters, error behaviour, `-WhatIf`) |
| Advanced | Refactor an existing project pattern using the concept |

### Step 2 — Generate the exercise

1. Base it on a scenario from the project's domain (inferred from script and function names), on the host the project declares.
2. Give a clear spec: what to write or fix, what output or behaviour it must produce, one optional hint.
3. Beginner: run the faulty snippet and give its real output, per the transversal rules.

### Step 3 — Wait

Present the exercise and wait. Give no solution until the user has tried or asks.

### Step 4 — Evaluate and explain

1. Run the user's solution on the targeted host when the binary is present; judge from the run, not from reading.
2. Note idiomatic improvements.
3. Show the reference solution.
4. Link back to the project example from `01-explain`.
