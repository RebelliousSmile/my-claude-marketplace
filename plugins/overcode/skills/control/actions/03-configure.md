# Configure

Detect test-tooling misconfiguration and propose fixes, without ever proposing to replace an already-established tool.

## Inputs

- `project_path` (required) - absolute path to the target project root

**This action sits outside the phase model, and takes no other parameter - deliberately.** No `phase`, no `scope`, no `domain`. What it checks is whether the tooling is actually wired: a coverage gate declared but invoked by nothing, a threshold a config silently disables. Those defects are true or false regardless of who uses the product and of which part of the product they sit in - a phase would weight nothing here, a domain would order nothing, and a scope would only hide a broken gate by pointing away from it. It is the one action of this skill for which the answer does not depend on the project's situation, and adding those parameters would suggest it does.

**Given one of them anyway, run - and say in the output that it was ignored, and why.** Silently dropping a parameter leaves the user believing the report was narrowed or ordered when it was not, and a scope in particular reads as a promise that the rest of the project was left alone. Neither refuse the run nor honour the parameter: the check does not depend on it, so there is nothing to stop for. This differs from `scope` and `domain` given together elsewhere in the skill, where the run *does* stop - there, two mutually exclusive intents were expressed and only the user can say which was meant; here there is one intent, and it is simply not one this action has.

It is reachable and terminal in the chaining graph: `05-stats` routes into it for a measured wiring defect, and `01-write` routes into it when the selected cell requires a proof mechanism the project does not have. It routes out to nothing (`SKILL.md`, *Action chaining*).

## Outputs

```
| issue | severity | fix |
|-------|----------|-----|
| coverage gate silently disabled (invalid threshold schema) | high | <concrete config diff> |
```

## Process

1. Resolve `project_path`. Detect the applicable language plugins and load the `testing` pivot of each one shipping it (`@../references/pivot-contract.md`) - each lists known tooling gotchas and config-validation checks specific to its stack, and names two fields this action reads directly: **Coverage command** and **Canonical E2E tool**. **Both are per stack**: a polyglot project has one coverage command per stack and no single figure, and its E2E tool of one stack says nothing about the other. Run the tool-agnostic checks below for whichever stack contributed no pivot, naming that stack.
2. Tool-agnostic checks:
   - Is a coverage gate configured, and does it actually run in CI or a pre-commit hook - not only declared in a config file that nothing invokes?
   - When the pivot states a **Coverage command**, does it actually run **independently of the gate** - producing its per-file report even when the gate would exit non-zero? A command that only runs as part of the gate cannot be used to read coverage on a project that is failing it, which is exactly when reading it matters most.
   - Is an E2E runner already configured? If the pivot names a **Canonical E2E tool**, treat that as the project's tool for this and every future run of this skill; absent a pivot, detect it directly. Either way, never propose swapping it for another tool, only propose fixes to its own configuration - the field is informational, never licence to propose a replacement.
   - Is coverage running in **line mode with branch tracking never switched on** - `branch = true` absent from the config, `--cov-branch` absent from the invocation? This is the single most common configuration of all, and it is the one this skill is named as the fix for: `@../references/test-density.md` › *Degenerate cases* sends its third case here by name, and the whole density layer stays unmeasurable until this one flag moves. A report that exists and carries no branch data is **not** a missing report, and must not be reported as one.
   - Do any test-tooling config values fail structural validation against their own tool's accepted schema (a factual schema mismatch, not a style opinion)?
3. Run every pivot-supplied gotcha check on top of the tool-agnostic ones.
4. For each finding, propose a concrete fix (a config diff or a command) - never apply it automatically.
5. Present the table. Apply a fix only after the user confirms that specific row.
6. **A run that finds nothing says so in as many words, and says what it looked for.** `clean - <n> checks run, no misconfiguration found`, followed by the list of checks that were run and, separately, the checks that were **not** run because no pivot supplied them. An empty table is not a formulation: it reads identically to a run that crashed, to a run that found no config file, and to a run whose pivot was missing - three states with three different next moves. Naming the unrun checks matters more than naming the passed ones: a stack-specific gotcha nobody checked is exactly the defect this action exists to catch, and its absence is invisible unless stated.

## Test

**Referred by file, never by row number.** A row list goes stale on the next renumbering of a suite, and a stale list is worse than none - it points a reader at a scenario that now tests something else. Each suite below declares the actions it targets in its own opening paragraph; that declaration is the authority for this list, and it is the thing to re-read when a suite is added or re-scoped.

Covered by `../evals/authority-scenarios.md`, `../evals/confirmations-scenarios.md`, `../evals/phase-scenarios.md` and `../evals/chaining-scenarios.md`.

`authority-scenarios.md` owns the bound that an **established** runner is a project decision and never a wiring defect — S13 has exercised this action since that suite was written, and both this list and the suite's own header omitted it until 2026-07-29; `confirmations-scenarios.md` owns the confirmation of an applied config fix; `phase-scenarios.md` owns this action taking none of the three parameters; `chaining-scenarios.md` owns the graph position.

Run: `overcode:behave 02-run <suite> <fixture>`.
