---
name: sniff
model: sonnet
description: >-
  Detects the Rust stack in the current project and synchronizes .claude/rules/
  with the matching sc-rust pivots. Reads Cargo.toml to detect the web framework
  (Axum, Actix-web) and data crates (SQLx, Diesel). Installs only the pivots
  relevant to what was detected, and updates existing rules that differ from the
  plugin references.
  Prefer sniff over setup on already-configured projects.
  Do NOT use to update a single rule manually — edit it directly instead.
---

# sc-rust Sniff

Scans the current project's `Cargo.toml`, detects which Rust web framework and data crates are in use, then installs or updates only the matching perf/data pivot rules in `.claude/rules/`. Unlike `setup` (which installs everything), sniff is selective: it writes only the rules relevant to what was actually detected.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `scan` | Detect Rust stack and audit installed rules | current project path |
| 02 | `sync` | Install missing rules, update outdated ones | scan manifest |

## Default flow

Always sequential: `scan` → `sync`.

1. `scan` reads `Cargo.toml`, classifies the stack, audits `.claude/rules/`, emits a structured manifest
2. `sync` reads the manifest and writes/updates only the files that need it

Never skip `sync` if `scan` reports missing or outdated rules.

## Transversal rules

- Never install a pivot for a crate not detected in `Cargo.toml`.
- Both Axum and Actix-web map to `perf-pivots-axum.md` (covers both frameworks).
- Compare installed rule content against the plugin reference before updating — skip files already identical.
- Report every file written, updated, or skipped.
- If `Cargo.toml` is absent, abort with an explicit message instead of guessing.
