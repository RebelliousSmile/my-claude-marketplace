# Action 01 — scan

Detect edition-specific patterns and deprecated APIs in the Rust codebase. Emit a structured manifest for `02-migrate`.

## Inputs

- `path` (optional, default: project root) — directory to scan
- `target-edition` (optional) — `"2018"` | `"2021"` | `"2024"` (default: latest stable = `"2024"`)

## Process

### Step 1 — Detect current edition and key crates

1. Read `Cargo.toml` → `[package] edition` (default if absent: `"2015"`)
2. Read `[dependencies]` to detect crates with known major breaking changes:
   - `tokio` version
   - `diesel` version
   - `failure` or `error-chain` presence
   - `futures` version (0.1 vs 0.3)
   - `actix-web` version
   - `sqlx` version

### Step 2 — Scan edition-specific patterns

Grep `.rs` files under `path`. Exclude `target/`.

#### Edition 2015 patterns (remove when migrating to 2018+)

| Pattern | Signal | Replacement |
|---|---|---|
| `extern crate name;` | `^\s*extern\s+crate\s+\w+;` | Remove (implicit in 2018+) — keep for `std`/`core`/`alloc` if no_std |
| `#[macro_use] extern crate` | `#\[macro_use\]` | Import macro directly: `use crate::macro_name!` or `use dep::macro_name!` |
| `mod.rs` module files | `src/.*/mod.rs` pattern | Directory module without `mod.rs` (2018 path hygiene) |
| `try!()` macro | `\btry!\(` | `?` operator |
| Anonymous lifetime `'_` not used | Explicit `'a` lifetimes that can be elided | Lifetime elision |
| `extern "C"` in unexpected places | Unneeded ABI specifiers | Remove if Rust-to-Rust only |

#### Edition 2021 patterns

| Pattern | Signal | Replacement |
|---|---|---|
| `IntoIterator` for arrays not imported | Implicit in 2021 | Update imports |
| `or_patterns` | `\|` in match arms manually split | Merge with `|` |
| Capture disjoint fields in closures | Closure captures whole struct | Fine-grained capture available |

#### Deprecated crate APIs

| Crate | Detected version | Pattern | Replacement |
|---|---|---|---|
| `tokio` | `0.x` | `tokio::runtime::Builder::new()` | `Builder::new_multi_thread()` |
| `tokio` | `0.x` | `#[tokio::main]` with old import path | Update `tokio` to `1.x` |
| `failure` | any | `use failure::{Error, Fail}` | `anyhow::Error` (bin) or `thiserror::Error` (lib) |
| `error-chain` | any | `error_chain! { ... }` | `thiserror` derive macro |
| `futures` | `0.1` | `impl Future<Item=T, Error=E>` | `impl Future<Output=Result<T,E>>` + `async/await` |
| `diesel` | `1.x` | `#[derive(Queryable)]` without field order attribute | Add `#[diesel(table_name = ...)]` for 2.x |
| `std` | any | `mem::uninitialized()` | `MaybeUninit::uninit()` |
| `std` | any | `Error::description()` | Implement `Display` instead |

#### Anti-patterns to flag (not edition-specific)

| Pattern | Signal | Issue |
|---|---|---|
| `unwrap()` outside tests | `\.unwrap\(\)` in non-test files | Should use `?` or explicit error handling |
| `clone()` on large types | `.clone()` on `Vec`, `HashMap`, `String` returned from functions | Consider `Rc`/`Arc` or returning references |
| `Box<dyn Error>` in public API | `Box<dyn Error>` in pub fn signatures | Use concrete error type or `thiserror` |

### Step 3 — Output manifest

```
📊 sc-rust legacy — scan results

Current edition: 2018 (Cargo.toml)
Target edition: 2021

Crates with breaking changes:
  ⚠  failure 0.1.8 detected — deprecated, use anyhow or thiserror
  ✅ tokio 1.38 — current
  ✅ diesel 2.1 — current

Edition patterns:
  MEDIUM  extern crate — 2 remaining (lib.rs:1, main.rs:1)
  LOW     try!() macro — 1 occurrence (src/legacy/fetch.rs:34)

Deprecated crate APIs:
  HIGH    failure::Error — 8 uses across 4 files → anyhow::Error
  HIGH    failure::Fail trait — 3 derive uses → thiserror::Error

Anti-patterns:
  WARN    unwrap() in non-test code — 12 occurrences in 6 files
  LOW     clone() on Vec<_> — 4 occurrences that may be avoidable

→ migrate will modify 7 files. failure → anyhow migration requires Cargo.toml update.
```

Then proceed to `02-migrate`.
