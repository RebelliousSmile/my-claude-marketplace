---
name: sniff
model: sonnet
description: >-
  Capability mapper for Rust projects. Reads Cargo.toml (or workspace members)
  to detect the web framework (Axum, Actix-web) and data crates (SQLx, Diesel).
  For each detected capability, installs the matching coding rule from the plugin
  — only if a rule exists. Perf pivots (consumed by web-optimize) and data
  pivots (consumed by data-optimize) are installed selectively. Reports gaps
  when a capability is detected but no matching plugin rule exists.
  Prefer sniff over setup on already-configured projects.
  Do NOT use to update a single rule manually — edit it directly instead.
---

# sc-rust Sniff

Capability mapper. Detects what the Rust project DOES, then installs the matching rules from the plugin — only for what is detected, only when a rule exists.

Unlike `setup` (which installs all rules unconditionally), sniff is selective: it maps detected capabilities to available rules and reports gaps when no matching skill covers a capability.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `scan` | Detect capabilities, map to rules, audit installed rules | current project path |
| 02 | `sync` | Install missing rules, update outdated ones | scan manifest |

## Default flow

Always sequential: `scan` → `sync`.

1. `scan` reads `Cargo.toml`, detects framework/data crate/capabilities, maps to plugin rules, audits `.claude/rules/`, emits a structured manifest
2. `sync` reads the manifest and writes/updates only the files that need it

Never skip `sync` if `scan` reports missing or outdated rules.

## Conceptual model

Capabilities → rules → skills:

- A **capability** is something the app does: serve HTTP via a web framework, query the database via SQLx or Diesel, etc.
- A **rule** is the coding knowledge for the chosen solution (Axum/Actix-web, SQLx, Diesel)
- A **skill** (`web-optimize`, `data-optimize`) consumes perf/data pivots to act on the project

sniff installs rules for detected capabilities. It does NOT install rules for capabilities the project doesn't have.

## Transversal rules

- If `Cargo.toml` is absent, abort with an explicit message.
- Never install a rule for a capability not detected in `Cargo.toml`.
- Both `axum` and `actix-web` map to the same perf pivot (`perf-pivots-axum.md`), which covers both frameworks. Install it only once.
- Compare installed rule content against the plugin reference before updating — skip files already identical.
- Report every file written, updated, or skipped.
- Report gaps: capabilities detected but no matching plugin rule exists.
