---
name: decompose
description: Applies the Mikado method to decompose a user-supplied goal into a dependency graph via iterative Q&A, then generates YAML node files in mikado/<graphName>/. Use when a user wants to break down a complex goal into safe, incremental steps: "decompose this goal", "apply Mikado to", "break this into steps", "create a Mikado graph for", "how do I safely tackle". Do NOT use for generating implementation code, writing tests, managing tasks in aidd_docs/tasks/, or any task that does not involve decomposing a goal into a dependency graph.
---

# Decompose

Decompose applies the Mikado method to a user-supplied goal: it walks through a depth-first iterative Q&A to surface all prerequisites, displays a Mermaid subtree after each iteration, and finally generates a YAML dependency graph under `mikado/<graphName>/`. Each leaf node is scoped to a single work session.

## Available actions

| #  | Action   | Role                                                                | Input                    |
|----|----------|---------------------------------------------------------------------|--------------------------|
| 01 | `mikado` | Full Mikado decomposition: name graph → DFS loop → generate YAML   | Goal string (`$ARGUMENTS`) |

## Default flow

Single action. Dispatch to `mikado` on any trigger.

## Transversal rules

- Node IDs must be in kebab-case.
- Each leaf node must be achievable in a single work session.
- Traverse the graph in DFS order.
- Display a Mermaid subtree after each iteration.
- Never write YAML files until the user validates the final complete graph.

## External data

- `docs/wiki/Storage-Format.md` — YAML node schema reference
- `mcp-server/src/resources/guide.md` — Mikado method guide
