# Harvest execution contract

## Execution context

Create one in-memory context per invocation and pass it between actions:

- detected OS and shell;
- tracker kind and CLI, or `Local` / `None`;
- effective configuration values;
- inventory records and detected project source roots;
- completed action ids and their metrics;
- pending confirmations and decisions.

An action consumes existing context and returns its updated records and metrics. Never infer a missing prerequisite as completed, rerun a completed action, or replace unavailable metrics with zero.

## Full-run guarantees

The `all` action owns orchestration. It loads actions only as they become due, preserves `tracker → normative → cleanup`, and runs inventory once. A skipped or blocked action is recorded with its reason and is not fabricated as successful.

Only a complete `all` run writes `aidd_docs/harvests/YYYY_MM_DD-harvest.md`. Delegated skills may write only artifacts already disclosed by their own contracts.

## User interaction

Dependency or orchestration does not weaken a confirmation boundary. Show tracker comments before closure, offer Learn when its trace is missing, enumerate purge candidates, resolve clarification rows, and obtain the final deletion confirmation at the action that owns it.

