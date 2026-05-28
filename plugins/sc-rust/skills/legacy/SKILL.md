---
name: legacy
description: >-
  Scans Rust code for edition-specific patterns and deprecated APIs, then migrates
  to a target edition (2015 → 2018 → 2021 → 2024) or updates breaking crate API
  changes (tokio 0.x → 1.x, diesel 1.x → 2.x, failure → anyhow/thiserror,
  futures 0.1 → async/await). Detects extern crate declarations, old module syntax
  (mod.rs), try!() macro, pre-NLL borrow patterns, and deprecated std APIs.
  Use when the user says "migrate to Rust 2021", "upgrade edition", "this is old Rust",
  "update tokio", "replace failure crate", or when rustc produces edition warnings.
  Do NOT use for dependency management (Cargo), performance optimization (web-optimize),
  or general refactoring unrelated to Rust edition/API compatibility.
---

# sc-rust Legacy

Detects edition-specific patterns and deprecated APIs in the Rust codebase, then produces a migration plan and applies changes file by file — migrating to a newer edition or updating breaking crate API changes.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `scan` | Detect edition/API gaps and deprecated patterns | path, target edition |
| 02 | `migrate` | Apply edition migration and crate API transformations | scan manifest |

## Default flow

Always sequential: `scan` → `migrate`.

1. `scan` reads `Cargo.toml`, detects current edition, finds deprecated patterns and outdated crate API usage, emits a structured manifest
2. `migrate` reads the manifest and applies transformations file by file

## Transversal rules

- Always detect the current Rust edition from `Cargo.toml` (`edition = "2015"/"2018"/"2021"/"2024"`) before scanning.
- Never remove a working pattern without providing its replacement inline.
- For breaking changes: show a diff of what will change and ask for confirmation before writing.
- `extern crate` removal: verify the crate is in the standard prelude or Rust 2018+ implicit imports before removing.
- Error handling migration (failure/error-chain → anyhow/thiserror): prefer `anyhow` for binaries/applications, `thiserror` for library crates.
- Never touch `target/` or generated `build.rs` output.
