---
name: bruno
model: haiku
description: Runs Bruno API tests in CLI mode and iterates until all targeted tests pass. Use when a user wants to run or fix API tests written in Bruno: "run Bruno tests", "test the API with Bruno", "run bruno/", "fix the Bruno tests", "bru run". Do NOT use for writing new Bruno test files from scratch, running Playwright tests, unit tests, or any testing that does not use the bru CLI.
---

# Bruno

Bruno runs the project's Bruno API test suite via the `bru` CLI, parses results, and iterates — investigating root causes and applying fixes — until all targeted tests pass.

## Available actions

| #  | Action | Role                                                          | Input                                                  |
|----|--------|---------------------------------------------------------------|--------------------------------------------------------|
| 01 | `test` | Run Bruno tests, parse results, fix failures, repeat until all pass | Folder or `.bru` file path (`$ARGUMENTS`, optional) |

## Default flow

Single action. Dispatch to `test` on any trigger.

## Transversal rules

- Always pass `--env local` to every `bru run` invocation.
- Always pass `--tests-only` to every `bru run` invocation.
- If `$ARGUMENTS` specifies a path, run only that path — never expand scope automatically.

## External data

- `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/testing/bruno.md` — Bruno conventions (capability pivot, loaded at audit time by /sc-php:audit)
