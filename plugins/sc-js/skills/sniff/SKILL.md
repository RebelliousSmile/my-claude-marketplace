---
name: sniff
model: sonnet
description: >-
  JS stack detector for JavaScript projects. Reads package.json to detect
  the runtime (web vs desktop), framework (Nuxt, Vue SPA, Vite, Alpine, Astro,
  11ty), ORMs (Prisma, Drizzle, TypeORM, Mongoose, GraphQL, tRPC), and
  capabilities in use (state management, icons, code splitting, SSR, etc.).
  Emits a pivot manifeste — the list of applicable JS knowledge references
  in the plugin — for use by /sc-js:audit. Installs perf pivots (for
  web-optimize) and data pivots (for data-optimize) to .claude/rules/07-quality/.
  Does not install capability rules to .claude/rules/ — those are loaded
  on demand at audit time. Run /sc-js:sniff clean to migrate from sc-js 0.3.0.
  Prefer sniff over setup on already-configured projects.
---

# sc-js Sniff

JS stack detector and pivot manifeste producer.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `scan` | Detect capabilities, emit pivot manifeste, map perf/data pivot install targets | current project path |
| 02 | `install-pivots` | Install perf/data pivots to `.claude/rules/07-quality/` | scan pivot manifeste |
| 03 | `clean` | Opt-in migration: remove orphaned 0.3.0 capability rules from `.claude/rules/capabilities/` | project path |

## Default flow

Sequential: `scan` → `install-pivots`.

`clean` is **opt-in only** — invoke explicitly via `/sc-js:sniff clean`. It is never part of the default flow.

## Conceptual model

- A **capability** is something the app does: manage state, split code, render icons, etc.
- A **pivot** is the JS knowledge for the chosen solution (e.g. Pinia patterns, lucide-vue-next usage)
- Pivots live in the plugin (`skills/sniff/references/capabilities/`) — they are loaded at audit time, not installed to the project
- **Perf pivots** and **data pivots** are the exception: they ARE written to `.claude/rules/07-quality/` because `web-optimize` and `data-optimize` read them from there

## Transversal rules

- If `package.json` is absent, abort with an explicit message.
- Never install a capability rule to `.claude/rules/capabilities/` — those are read from the plugin at audit time.
- Never install a perf pivot for a framework not detected.
- Never install a data pivot for an ORM not detected.
- `03-clean` is destructive — always show a dry-run scan before deleting anything.
- Report gaps: capabilities detected but no matching plugin pivot exists.
