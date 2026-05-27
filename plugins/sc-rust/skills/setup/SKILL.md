---
name: setup
model: sonnet
description: >-
  Installs Rust ecosystem perf and data pivots to the current project's
  .claude/rules/. Use when starting a Rust web project (Axum, Actix-web) or
  when Rust-specific perf/data rules are missing. Covers: Tokio runtime, async
  patterns, release profile, SQLx compile-time checked queries, Diesel ORM.
  Do NOT use to update a single rule — edit it directly instead.
  Prefer /sc-rust:sniff on already-configured projects (detects crates, installs only relevant rules, updates outdated ones).
---

# sc-rust Setup

Installs the full set of Rust perf and data pivot rules to `.claude/rules/` in the current project. Each rule file is written verbatim from the plugin's references.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `install` | Write all Rust perf/data pivot files to `.claude/rules/` | current project path |

## Default flow

Single action. Any invocation of `/sc-rust:setup` triggers `install`.

## Companion skill

- `/sc-rust:sniff` — detects Axum/Actix-web, SQLx, Diesel from Cargo.toml, then installs/updates only the matching pivots. Use instead of `setup` on projects that are already partially configured.

## References

### Perf pivots (consumed by `web-optimize`)

- `references/07-perf-pivots-axum.md` — Axum / Actix-web (Tokio, tower middleware, release profile)

### Data pivots (consumed by `data-optimize`)

- `references/08-data-pivots-sqlx.md` — SQLx (compile-time checked queries, async pool)
- `references/08-data-pivots-diesel.md` — Diesel ORM (sync, query builder, migrations)

## Transversal rules

- Write files atomically — do not skip any rule.
- Preserve frontmatter (paths: globs) verbatim from each reference file.
- If a target file already exists, overwrite it without confirmation.
- Report each written file path at the end.
