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

## Selective dependency closure

| Requested pillar | Inventory scope | Other dependencies |
|---|---|---|
| `tracker` | completed roots and tracker association candidates | tracker `reconcile` |
| `normative` | none | normative reconciliation |
| `cleanup` | cleanup candidates, Learn traces, and tracker association candidates | tracker `reconcile`, then normative reconciliation |
| `freshness` | eligible Markdown paths and source roots | Taste |
| `review` | remaining artifact units plus ownership metadata | tracker `status-only` |

`status-only` may detect the tracker and query states needed by review. It never builds closing comments, writes temporary comment files, posts, closes, or updates a Local story. `reconcile` preserves the full closure preview and confirmation contract.

If a cleanup prerequisite is declined or partially completes, continue only with candidates whose eligibility is established and name the excluded set. Normative must return before any purge. A skipped or unavailable hard prerequisite blocks the dependent branch, not unrelated work.

## Targeted response

Render a targeted run as:

1. the requested pillar result in full;
2. a compact dependency table with dependency, reason, and outcome;
3. effective configuration and explicit limits when relevant.

Omit unrelated sections completely. Do not render zeros for work that did not run. Do not invoke `report` or write a Harvest report. Prompts and confirmations owned by dependencies remain fully visible even though their final results are summarized.

The instruction-load boundary is part of correctness: after this small contract, load only the selected action, its dependency actions, and the references those actions require. A full run loads actions progressively through `all`.

## User interaction

Dependency or orchestration does not weaken a confirmation boundary. Show tracker comments before closure, offer Learn when its trace is missing, enumerate purge candidates, resolve clarification rows, and obtain the final deletion confirmation at the action that owns it.
