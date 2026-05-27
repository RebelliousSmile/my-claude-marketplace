---
name: setup
model: sonnet
description: >-
  Installs Rust ecosystem perf and data pivots to the current project's
  .claude/rules/. Use when starting a Rust web project (Axum, Actix-web) or
  when Rust-specific perf/data rules are missing. Covers: Tokio runtime, async
  patterns, release profile, SQLx compile-time checked queries, Diesel ORM.
  Do NOT use to update a single rule — edit it directly instead.
---

# sc-rust Setup

Installs the full set of Rust perf and data pivot rules to `.claude/rules/` in the current project. Each rule file is written verbatim from the plugin's references.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `install` | Write all Rust perf/data pivot files to `.claude/rules/` | current project path |

## Default flow

Single action. Any invocation of `/sc-rust:setup` triggers `install`.

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
