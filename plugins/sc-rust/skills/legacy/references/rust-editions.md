# Rust Edition Reference

Key changes per Rust edition — use during `01-scan` to identify migration work.

## Edition detection

Read `Cargo.toml` `[package]` section:
```toml
edition = "2015"  # or "2018", "2021", "2024"
```

If absent, defaults to `2015` (pre-2018 crate).

## Edition 2015 → 2018

### Module system

| Old (2015) | New (2018+) |
|---|---|
| `extern crate foo;` required | Removed — crates available by name |
| `use std::io::Read;` in each file | Same but no `extern crate` needed |
| Module paths `::foo` (absolute) | `crate::foo` for crate-root paths |
| `mod.rs` files only | Inline module files `foo.rs` alongside `foo/` |

Detection: grep `extern crate` (excluding `std`, `core`, `alloc` which are still valid in `no_std`).

### Lifetime elision improvements

| Pattern | 2015 behavior | 2018+ behavior |
|---|---|---|
| `impl Trait` in function arg | Not available | `fn foo(x: impl Display)` |
| Anonymous lifetimes `'_` | Not available | `fn foo(x: &'_ str)` |
| `dyn Trait` required | `Trait` object (bare) | Must write `dyn Trait` |

Detection: grep bare trait objects `Box<Trait>` without `dyn` keyword.

### `async`/`await`

Available from Rust 1.39 (November 2019), syntax stabilized in edition 2018 context.

| Old | New |
|---|---|
| `futures::executor::block_on(async_fn())` | `tokio::main` / `.await` |
| Manual `Future` impl with `poll` | `async fn` + `.await` |
| `try!()` macro | `?` operator (stable since 1.13, preferred in 2018+) |

## Edition 2018 → 2021

### Resolver v2 (dependency resolution)

- `resolver = "2"` is default — may change feature unification behavior
- Check: crates with `default-features = false` may now behave differently across workspace members

### Closure captures

| Old (2018) | New (2021) |
|---|---|
| Closure captures entire struct if any field used | Captures only the fields used |
| `move \|\| foo.bar` captures `foo` entirely | Captures only `foo.bar` |

This may affect borrow checker errors — some code that required `clone()` may no longer need it.

### `IntoIterator` for arrays

```rust
// 2018: [1, 2, 3].into_iter() yields &i32
// 2021: [1, 2, 3].into_iter() yields i32 (by value)
```

Detection: grep `\.into_iter()` on array literals or `[T; N]` variables.

### `or_patterns` stabilized

```rust
// Old
match x { Some(0) | Some(1) => ... }
// 2021
match x { Some(0 | 1) => ... }
```

## Edition 2021 → 2024

### `async fn` in traits

```rust
// Pre-2024: required async-trait crate
#[async_trait]
trait Fetch { async fn fetch(&self) -> Result<()>; }

// 2024: native async fn in traits
trait Fetch { async fn fetch(&self) -> Result<()>; }
```

Detection: grep `#\[async_trait\]` or `use async_trait`.

### `gen` blocks (generators)

```rust
// 2024
let iter = gen { yield 1; yield 2; };
```

### `if let` / `while let` temporary lifetime extension

Temporaries in `if let` conditions now live for the entire block in 2024.

### `unsafe` stricter semantics

- `unsafe extern "C" {}` blocks now require explicit `unsafe` on individual items
- Bare `extern "C" fn` without unsafe block deprecated

Detection: grep `extern "C" \{` blocks without `unsafe`.

## `try!` macro → `?` operator

| Old | New |
|---|---|
| `try!(expr)` | `expr?` |
| `try!(file.read_to_string(&mut s))` | `file.read_to_string(&mut s)?` |

`try!` still works but emits deprecation warning since Rust 1.39. Detection: grep `try!(`.
