# 02 - Audit

Find low-value tests in an existing suite and propose their removal - never delete without explicit per-item confirmation.

## Inputs

- `project_path` (required) - absolute path to the target project root
- `scope` (optional, default: whole test suite) - a subdirectory or glob to limit the audit
- `phase` (optional) - overrides the resolved project phase for this run only

## Outputs

```
| file | test | reason | proposed_action |
|------|------|--------|------------------|
| tests/x.spec.js | "returns default" | duplicate of tests/y.spec.js:12 | propose-delete |
```

No file is deleted as part of producing this table.

## Process

1. Resolve `project_path` and `scope`. Enumerate test files using the active language plugin's `testing` pivot glob if loaded (`@../references/pivot-contract.md`), else a generic `**/*.{test,spec}.*` glob.
2. For each test, apply three low-value heuristics:
   - **Duplicate** - asserts the same behavior as another test already in the suite.
   - **Trivial** - test body under 5 lines AND asserting only a framework/library guarantee or an unbranched assignment, excluding imports and setup/teardown. A short test that asserts a real input -> output transformation (the ideal shape of a `contract` test per `decision-framework.md`) is not trivial merely for being short - line count alone is never sufficient to flag it.
   - **Getter/setter-only** - asserts only that a property was set or read, with no branching or business logic involved.
3. Build the candidates table with a one-line reason per row, referencing the duplicate's location when applicable.
3-bis. Resolve the project **phase** per `@../references/phase-framework.md`, state it with its provenance, and use it to **order** the table: a candidate sitting in a bucket the current phase lowers rises in the list, one in a bucket it raises falls. The phase **qualifies nothing**: a row is in this table because one of the three heuristics flagged it, never because of the phase. A test the phase deprioritises but no heuristic flags does not appear here at all - it stays.
4. Present the table to the user. Delete only the rows the user explicitly confirms (individually, or via an explicit batch selection they name) - anything not explicitly confirmed stays untouched.
5. Never invoke a delete on a row without that row's explicit confirmation, mirroring `overcode:harvest`'s per-item confirmation gate. **The per-item confirmation regime of this action is unchanged by the phase**: whatever the phase, however it re-orders the table, no row is removed without its own confirmation.

## Test

Run against a real project's test directory. Verify the report lists at least one candidate across the three heuristics, or explicitly states none were found. Verify no file on disk changes as a result of running this action alone - only the report is produced, deletion is a separate confirmed step.

**Never** a mocked test double for the target project's filesystem - the first real scan is the test.
