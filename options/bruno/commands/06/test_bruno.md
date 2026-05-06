---
name: 'custom:06:test_bruno'
description: 'Run Bruno API tests in CLI against the local environment'
argument-hint: '[folder or .bru file path, default: all]'
---

# Bruno Test Runner

## Goal

Run Bruno API tests in CLI and iterate until all targeted tests pass.

## Bruno rules

```md
@.claude/rules/custom/04-bruno.md
```

## Rules

- Run from the project root
- Always use `--env local` unless overridden by arguments
- Always use `--tests-only` to skip requests without assertions
- If a specific path is given, run only that folder/file; otherwise run the full collection recursively
- On failure, identify the failing request, fix the issue, re-run

## Steps

1. Determine the target scope from `$ARGUMENTS`
   - If empty → run full collection: `! bru run bruno/ -r --env local --tests-only`
   - If a folder/file is given → `! bru run $ARGUMENTS --env local --tests-only`
2. Analyze results
   - If all pass: report summary (requests run, passed, failed)
   - If failures: show failing request name + error message
3. On failure: investigate root cause (wrong endpoint, missing fixture, API change)
4. Fix, then re-run from step 1 until all pass
