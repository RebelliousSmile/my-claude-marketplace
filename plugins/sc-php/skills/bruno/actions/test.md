# 01 - Test

Run Bruno API tests via the bru CLI, report results, and iterate with fixes until all targeted tests pass.

## Inputs

- `path` (optional, default: `bruno/`) - string, path to a Bruno folder or a `.bru` file to run; if empty, runs the entire `bruno/` folder recursively

## Outputs

A pass/fail summary for every Bruno test in the targeted scope, and confirmation that all tests pass before exiting.

## Process

1. **Determine scope**: if `$ARGUMENTS` is non-empty, use it as the path; otherwise default to `bruno/`.
2. **Run tests**:
   - If scope is the default folder: `bru run bruno/ -r --env local --tests-only`
   - If scope is a specific path: `bru run <path> --env local --tests-only`
3. **Parse results**:
   - If all tests pass: print a summary (`N tests passed`) and exit.
   - If any tests fail: for each failure, display the request name, the failing assertion, and the full error message.
4. **On failure — investigate and fix**:
   - Read the failing `.bru` file(s) and the relevant source code or API handler.
   - Identify the root cause (wrong assertion, changed API shape, environment issue, etc.).
   - Apply the minimal fix (to the test file or the source code, depending on the root cause).
5. **Re-run**: go back to step 2 with the same scope. Repeat until all tests pass.

## Test

Invoke with no arguments in a project that has a `bruno/` folder. Verify that `bru run bruno/ -r --env local --tests-only` is executed and a pass/fail summary is printed.
