# Rust — obsolescence detection patterns

Extensions: `.rs`

---

## Detector A — Import / dependency extraction

Rust dependencies are declared in `Cargo.toml`, not inline in source files. The `use` keyword resolves within the crate dependency graph.

**Manifest to check**: `Cargo.toml` (`[dependencies]`, `[dev-dependencies]`, `[build-dependencies]`).

**Source-level patterns to extract** (top-level crate name only):

```regex
^use\s+([\w]+)(?:::\S+)?
^extern\s+crate\s+(\w+);
```

The first path segment is the crate name. Cross-reference against `Cargo.toml`.

**Deprecated check** (if cargo available):
```bash
cargo outdated --root-deps-only 2>/dev/null
```

If `cargo-outdated` is not installed, skip the deprecated check.

---

## Detector B — Symbol declaration patterns

```regex
# Functions
(pub(\s*\(\s*\w+\s*\))?\s+)?(async\s+)?fn\s+(\w+)\s*[<(]

# Structs, enums, traits
(pub(\s*\(\s*\w+\s*\))?\s+)?struct\s+(\w+)
(pub(\s*\(\s*\w+\s*\))?\s+)?enum\s+(\w+)
(pub(\s*\(\s*\w+\s*\))?\s+)?trait\s+(\w+)

# Type aliases
(pub(\s*\(\s*\w+\s*\))?\s+)?type\s+(\w+)\s*=

# Constants and statics
(pub(\s*\(\s*\w+\s*\))?\s+)?const\s+(\w+)\s*:
(pub(\s*\(\s*\w+\s*\))?\s+)?static\s+(\w+)\s*:
```

**Grep command**:
```bash
rg -n "^(pub\s+)?(async\s+)?fn\s+\w+|^(pub\s+)?struct\s+\w+|^(pub\s+)?enum\s+\w+|^(pub\s+)?trait\s+\w+" \
  --glob "**/*.rs"
```

---

## Detector C extension — Rust-specific forbidden patterns

Beyond `.claude/rules/` bullets, check for:

| Pattern | Signal | Suggested action |
|---|---|---|
| `unwrap()` on `Result`/`Option` in non-test code | Potential panic in production | Replace with `?`, `unwrap_or`, `expect` with message |
| `unsafe` block | Intentional or forgotten | Flag for review |
| `#[allow(unused_*)]` attributes | Suppressed warnings — may hide dead code | Review each attribute |

These are heuristics — flag only; do not auto-classify as "obsolete".

---

## Notes

- Rust's module system: a symbol can be defined in `mod.rs`, `lib.rs`, or a file named after the module. Search across all `.rs` files before flagging a symbol as missing.
- `#[deprecated]` attribute: if a function/type in a dependency carries `#[deprecated]`, the compiler will emit a warning. Check `cargo check` output for deprecation warnings:
  ```bash
  cargo check 2>&1 | rg "deprecated"
  ```
- Workspace crates: if `Cargo.toml` defines a `[workspace]`, check each member's `Cargo.toml` for dependency declarations.
- Macros (`macro_rules!`, proc macros): detection of missing macros is unreliable via static grep. Skip macro-name calls in Detector B to avoid false positives.
