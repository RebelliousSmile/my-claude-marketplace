---
name: sniff
model: sonnet
description: >-
  Detects the JavaScript stack in the current project and synchronizes
  .claude/rules/ with the matching sc-js coding rules and pivots. Reads
  package.json to classify the framework (Nuxt, Vue SPA, Vite, Alpine, Astro,
  11ty) and detect ORMs (Prisma, Drizzle, TypeORM, Mongoose, GraphQL, tRPC).
  Coding rules (component scope, icons, image optimization, design system, etc.)
  are always installed. Perf and data pivots are installed only for what is
  detected. Diffs installed rules against plugin references and updates only
  what changed.
  Prefer sniff over setup on already-configured projects.
  Do NOT use to update a single rule manually — edit it directly instead.
---

# sc-js Sniff

Scans the current project, reads `package.json`, classifies the JS/TS framework and detected ORMs, then installs or updates the matching coding rules and perf/data pivot rules in `.claude/rules/`. Unlike `setup` (which installs all rules), sniff is selective for perf and data pivots while always installing universal coding rules.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `scan` | Detect JS stack and audit installed rules | current project path |
| 02 | `sync` | Install missing rules, update outdated ones | scan manifest |

## Default flow

Always sequential: `scan` → `sync`.

1. `scan` reads `package.json`, classifies framework and ORMs, audits `.claude/rules/`, emits a structured manifest
2. `sync` reads the manifest and writes/updates only the files that need it

Never skip `sync` if `scan` reports missing or outdated rules.

## Transversal rules

- Universal coding rules are always installed regardless of detected stack.
- Never install a perf pivot for a framework not detected in `package.json`.
- Never install a data pivot for an ORM not detected in `package.json`.
- Compare installed rule content against the plugin reference before updating — skip files already identical.
- Report every file written, updated, or skipped.
- If `package.json` is absent, abort with an explicit message.
