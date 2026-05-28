---
name: sniff
model: sonnet
description: >-
  Rust stack detector. Reads Cargo.toml (or workspace members) to detect the
  web framework (Axum, Actix-web) and data crates (SQLx, Diesel). Uses a
  two-tier model: capability pivots (Rust idioms) are loaded at audit time
  by /sc-rust:audit and never written to disk; perf pivots (for web-optimize)
  and data pivots (for data-optimize) are installed selectively to
  .claude/rules/07-quality/. Emits a pivot manifeste for use by /sc-rust:audit.
  Reports gaps when a capability is detected but no matching plugin pivot exists.
  Do NOT use to update a single rule manually — edit it directly instead.
---

# sc-rust Sniff

Rust stack detector and pivot manifeste producer.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `scan` | Detect capabilities, emit pivot manifeste, map perf/data install targets | current project path |
| 02 | `install-pivots` | Install perf/data pivots to `.claude/rules/07-quality/` | scan pivot manifeste |

## Default flow

Sequential: `scan` → `install-pivots`.

## Conceptual model

- A **capability** is something the app does: serve HTTP via Axum/Actix-web, query the database via SQLx or Diesel, etc.
- A **pivot** is the Rust knowledge for the chosen solution (e.g. Axum perf patterns, SQLx query conventions)
- Capability pivots live in the plugin (`skills/sniff/references/capabilities/`) — they are loaded at audit time by `/sc-rust:audit`, not installed to the project
- **Perf pivots** and **data pivots** are the exception: they ARE written to `.claude/rules/07-quality/` because `web-optimize` and `data-optimize` read them from there

## Transversal rules

- If `Cargo.toml` is absent and no workspace is found, abort with an explicit message.
- Never install a capability pivot to `.claude/rules/` — those are loaded on demand at audit time.
- Both `axum` and `actix-web` map to the same perf pivot (`perf/axum.md`). Install it only once.
- Never install a data pivot for a crate not detected in `Cargo.toml`.
- Compare installed pivot content against the plugin reference before updating — skip files already identical.
- Report every file written, updated, or skipped.
- Report gaps: capabilities detected but no matching plugin pivot exists.
