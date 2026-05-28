# Action 02 — migrate

Apply edition and crate API transformations identified by `01-scan`, file by file.

## Inputs

- Manifest from `01-scan` (required)
- `dry-run` (optional flag) — show diffs only, do not write

## Process

### Order of application

1. `Cargo.toml` updates first (add/remove/update crates)
2. HIGH crate API migrations (failure, futures 0.1)
3. MEDIUM edition patterns (extern crate, try!)
4. LOW / WARN patterns

Ask for user confirmation before applying failure → anyhow/thiserror, since the choice (anyhow vs thiserror) depends on whether this is a library or binary.

### Per-pattern transformations

#### `extern crate name;` removal (2018+)

```rust
// Before
extern crate serde;
extern crate log;

// After
// (lines removed — crates are imported implicitly in edition 2018+)
// Keep: extern crate std; in no_std contexts
```

#### `try!()` → `?`

```rust
// Before
let val = try!(some_operation());

// After
let val = some_operation()?;
```

#### `failure` → `anyhow` (binary/application)

Cargo.toml:
```toml
# Before
failure = "0.1"

# After
anyhow = "1"
```

Source:
```rust
// Before
use failure::{Error, Fail};
#[derive(Debug, Fail)]
#[fail(display = "not found: {id}")]
struct NotFoundError { id: u32 }
fn do_thing() -> Result<(), Error> { ... }

// After
use anyhow::{Result, anyhow, Context};
fn do_thing() -> Result<()> {
    some_op().context("failed to do thing")?;
    Ok(())
}
```

#### `failure` → `thiserror` (library crate)

Cargo.toml:
```toml
# Before
failure = "0.1"

# After
thiserror = "1"
```

Source:
```rust
// Before
use failure::Fail;
#[derive(Debug, Fail)]
#[fail(display = "not found: {id}")]
struct NotFoundError { id: u32 }

// After
use thiserror::Error;
#[derive(Debug, Error)]
#[error("not found: {id}")]
struct NotFoundError { id: u32 }
```

#### `unwrap()` → `?` or explicit handling

Only convert when the function already returns `Result` or `Option`. Show each occurrence and ask which treatment to apply.

```rust
// Before
let val = risky_op().unwrap();

// After (propagate)
let val = risky_op()?;
// or (explicit message)
let val = risky_op().expect("risky_op should not fail here because X");
```

#### `futures` 0.1 → `async/await`

```rust
// Before
fn fetch() -> impl Future<Item=String, Error=MyError> {
    client.get(url).and_then(|res| res.into_body().concat2().map(|b| b.to_vec()))
}

// After
async fn fetch() -> Result<String, MyError> {
    let res = client.get(url).send().await?;
    Ok(res.text().await?)
}
```

### Update `Cargo.toml` edition

```toml
# Before
edition = "2018"

# After
edition = "2021"
```

### Write rules

- Update `Cargo.toml` first; show the full diff before writing.
- Write transformed source files to the same path (in-place).
- Show a unified diff for each file before writing; proceed unless `dry-run`.
- Never modify `target/` or `build.rs` output.
- After `failure` removal: run conceptual check — if `failure` was re-exported in a public API, note that downstream users also need to update.

## Output

```
✅ sc-rust legacy — migration complete

  Cargo.toml:
    ↺ edition "2018" → "2021"
    - failure 0.1.8 removed
    + anyhow 1 added

  Modified (7 files):
    ↺ src/main.rs — extern crate serde removed, extern crate log removed
    ↺ src/legacy/fetch.rs — try! × 1 → ?, failure::Error × 2 → anyhow::Result
    ↺ src/error.rs — failure::Fail × 3 → thiserror::Error (library types)
    ↺ src/service/order.rs — unwrap() × 3 → ? (function returns Result)
    ...
  Skipped (user declined):
    - src/util.rs — unwrap() × 4 (complex control flow, needs manual review)
```
