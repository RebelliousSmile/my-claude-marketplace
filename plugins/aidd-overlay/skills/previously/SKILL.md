---
name: previously
model: haiku
description: Produces a concise analyzed snapshot of project state before starting work — covering tests, coverage, recent git activity, working tree status, and lint health. Triggers on "where are we in the project", "catch me up", "what's the current project state", "project snapshot", or "/previously". Accepts an optional depth argument (commit count or duration like 7d). Do NOT use for deploying, running the app, generating code, or any task that modifies the codebase.
---

# Previously

Generates a structured project snapshot so a developer can orient themselves before starting work. Runs test, git, and lint commands, synthesizes recent commit history by theme, and fills a standardized template.

## Available actions

| #  | Action     | Role                                        | Input                              |
|----|------------|---------------------------------------------|------------------------------------|
| 01 | `generate` | Produce full project snapshot from live data | Optional: depth (commit count or duration) |

## Default flow

Single action. Dispatch to `generate` on any trigger.

## Transversal rules

- Never invent data. Every metric must come from a live command output.
- If a command fails (e.g., no test runner configured), mark the relevant section as "N/A — command unavailable" and continue.
- Group commits by theme, not by individual hash.
- Depth defaults to 15 commits when `$ARGUMENTS` is empty.

## Assets

- `assets/previously.md` — Output template for the project snapshot
