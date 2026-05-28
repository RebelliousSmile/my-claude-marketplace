# Rust API Deprecations Reference

Deprecated standard library APIs and common crate migrations — use during `01-scan`.

## Standard library deprecations

### Error handling

| Deprecated | Replacement | Since |
|---|---|---|
| `std::error::Error::description()` | `Display` impl / `.to_string()` | 1.42 |
| `std::error::Error::cause()` | `.source()` | 1.33 |
| `Box<dyn Error + Send + Sync>` verbose | `anyhow::Error` for applications | pattern |
| Manual `From` impls for errors | `#[derive(thiserror::Error)]` | pattern |

Detection: grep `\.cause()\|\.description()`.

### Collections and iterators

| Deprecated | Replacement | Since |
|---|---|---|
| `std::collections::LinkedList` (performance) | `Vec` or `VecDeque` | style |
| `Vec::drain_filter` (unstable renamed) | `Vec::extract_if` (1.77+) | 1.77 |
| `Iterator::zip_eq` (not std) | `itertools::zip_eq` or assert lengths | external |
| `HashMap::get_key_value` | Stable since 1.40 — use it | availability |

### String and formatting

| Deprecated | Replacement | Since |
|---|---|---|
| `std::str::from_utf8_unchecked` in safe context | `std::str::from_utf8` + `?` | practice |
| `format!` + `push_str` loop | `String::from_iter` or `join()` | performance |

### I/O

| Deprecated | Replacement | Notes |
|---|---|---|
| `std::io::Error::new(kind, msg)` with `&str` | `.new(kind, msg.to_string())` or `io::Error::other()` (1.74+) |  |
| `Read::read_to_end` without capacity hint | Pre-allocate with `Vec::with_capacity` | performance |

## Common crate migrations

### `failure` → `thiserror` + `anyhow`

The `failure` crate is unmaintained. Migration:

| failure | Modern |
|---|---|
| `#[derive(Fail)]` | `#[derive(thiserror::Error)]` |
| `failure::Error` | `anyhow::Error` (apps) or `Box<dyn Error>` (libs) |
| `format_err!("msg")` | `anyhow::anyhow!("msg")` |
| `bail!("msg")` | `anyhow::bail!("msg")` |
| `ResultExt::context` | `anyhow::Context::context` |

Detection: grep `failure::` or `extern crate failure`.

### `futures` 0.1 → 0.3 / `tokio` 0.1 → 1.x

| Old (futures 0.1) | New (futures 0.3 / tokio 1.x) |
|---|---|
| `.wait()` | `.await` |
| `tokio::run(future)` | `#[tokio::main] async fn main()` |
| `tokio::spawn(future)` returns old type | `tokio::spawn(async { })` returns `JoinHandle` |
| `futures::future::ok(x)` | `async { Ok::<_, Err>(x) }` or `std::future::ready(Ok(x))` |
| `Stream::for_each(move \|item\| { ... Ok(()) })` | `while let Some(item) = stream.next().await` |

Detection: grep `extern crate futures\|tokio::run\|\.wait()`.

### `rand` 0.6 → 0.8+

| Old | New |
|---|---|
| `rand::random::<f64>()` | Same — still works |
| `rand::thread_rng().gen_range(0, 10)` | `rand::thread_rng().gen_range(0..10)` |
| `Rng::choose(&slice)` | `slice.choose(&mut rng)` |
| `Rng::shuffle(&mut slice)` | `slice.shuffle(&mut rng)` |

Detection: grep `gen_range(.*,` (comma instead of range syntax).

### `serde` patterns to modernize

| Pattern | Issue | Fix |
|---|---|---|
| `#[serde(rename_all = "camelCase")]` missing | Field naming mismatch with API | add attribute |
| Manual `Serialize`/`Deserialize` impl | Fragile | use `#[derive]` if possible |
| `serde_json::from_str` without error context | Hard to debug | add `.context("parsing foo")` via anyhow |

## Clippy lints to enforce during migration

```
cargo clippy -- \
  -W clippy::pedantic \
  -W clippy::nursery \
  -W clippy::unwrap_used \
  -W clippy::expect_used \
  -A clippy::module_name_repetitions
```

Key lints to not suppress without justification:
- `clippy::unwrap_used` — replace with `?` or explicit handling
- `clippy::expect_used` — same
- `clippy::panic` — panics in library code are a bug
- `clippy::todo` — unfinished code should not ship
