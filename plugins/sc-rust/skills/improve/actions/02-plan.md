# Action 02 — plan

Produce a prioritized improvement plan with concrete before/after examples for each finding from `01-analyze`.

## Inputs

- Findings from `01-analyze` (required)

## Process

### Step 1 — Group by effort/impact

| Priority | Criteria | Action |
|---|---|---|
| P0 — Fix now | HIGH severity (potential panic, deadlock, data race) | Apply immediately |
| P1 — Next sprint | MEDIUM severity or HIGH + significant effort | Plan as a discrete task |
| P2 — Backlog | LOW severity, style/idiomatic improvements | Document and defer |

### Step 2 — Write the plan

For each finding:
1. **Title** — short action name
2. **Why** — the risk or pain if left as-is
3. **Before** — current code excerpt (actual file + line)
4. **After** — improved version
5. **Effort** — S (< 1h) · M (half-day) · L (> 1 day)

## Output

```
## sc-rust Improvement Plan

### P0 — Fix now

#### 1. Replace std::sync::Mutex across .await with tokio::sync::Mutex — S
**Why:** Holding a std Mutex guard across an await point causes a deadlock when
        the Tokio scheduler needs to poll the future on another thread.

**Before** (`src/handlers/orders.rs:89`):
```rust
use std::sync::Mutex;

async fn update_cache(state: &AppState, key: &str, value: String) {
    let mut cache = state.cache.lock().unwrap(); // std Mutex guard held across await
    expensive_operation().await;                 // ← deadlock risk
    cache.insert(key.to_string(), value);
}
```

**After:**
```rust
use tokio::sync::Mutex;

async fn update_cache(state: &AppState, key: &str, value: String) {
    expensive_operation().await;                 // await before locking
    let mut cache = state.cache.lock().await;    // tokio Mutex — await-safe
    cache.insert(key.to_string(), value);
}
```

#### 2. Replace std::fs::read_to_string in async fn with tokio::fs — S
**Why:** Blocking file I/O in an async function stalls the Tokio thread pool for
        the entire read duration, reducing throughput under concurrent load.

**Before** (`src/config/loader.rs:15`):
```rust
async fn load_config(path: &str) -> Result<Config> {
    let contents = std::fs::read_to_string(path)?;  // blocks Tokio thread
    Ok(toml::from_str(&contents)?)
}
```

**After:**
```rust
async fn load_config(path: &str) -> Result<Config> {
    let contents = tokio::fs::read_to_string(path).await?;
    Ok(toml::from_str(&contents)?)
}
```

#### 3. Replace unwrap() with ? in non-test code — M
**Why:** `unwrap()` panics on None/Err in production — a single bad input crashes the process.

Process the 8 occurrences systematically:
- If the enclosing function returns `Result`: use `?` or `.ok_or(MyError::NotFound)?`
- If the value "cannot be None" by invariant: replace with `.expect("reason invariant holds")`
- In `main()`: use `?` with `anyhow::Result<()>` return type

---

### P1 — Next sprint

#### 4. Replace Box<dyn Error> in handler signatures with anyhow::Error — S
**Why:** `Box<dyn Error>` erases the error type; `anyhow::Error` preserves full context chain.

**Before** (`src/handlers/orders.rs:12`):
```rust
pub async fn create_order(/* ... */) -> Result<Json<Order>, Box<dyn Error>> { ... }
```

**After:**
```rust
use anyhow::Result;
pub async fn create_order(/* ... */) -> Result<Json<Order>> { ... }
```

#### 5. Avoid unnecessary .clone() on Vec<OrderItem> — M
**Why:** Clones a potentially large collection on every request. Pass a reference.

**Before** (`src/handlers/orders.rs:67`):
```rust
fn process_items(items: Vec<OrderItem>) -> Total {
    // never consumes items, just reads
}
// Called as:
process_items(order.items.clone());
```

**After:**
```rust
fn process_items(items: &[OrderItem]) -> Total { ... }
// Called as:
process_items(&order.items);
```

#### 6. Replace manual filter loops with iterator chains — S
**Why:** Manual loops are more verbose and less composable.

**Before** (`src/service/search.rs:45`):
```rust
let mut active = vec![];
for order in &orders {
    if order.status == Status::Active {
        active.push(order);
    }
}
```

**After:**
```rust
let active: Vec<_> = orders.iter()
    .filter(|o| o.status == Status::Active)
    .collect();
```

#### 7. Introduce newtype for UserId and OrderId — M
**Why:** `u64` user_id and order_id can be silently swapped at call sites.

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct UserId(pub u64);

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct OrderId(pub u64);
```

---

### P2 — Backlog

#### 8. Add Display impl to error type — S
**Why:** `thiserror` `#[error("...")]` provides human-readable messages automatically.

#### 9. Builder for Report struct (8 fields) — M
**Why:** Large struct construction is noisy and error-prone without named builders.

---

### Summary

| # | Finding | Priority | Effort |
|---|---------|---------|--------|
| 1 | tokio::sync::Mutex across .await | P0 | S |
| 2 | Blocking fs in async | P0 | S |
| 3 | unwrap() in non-test code | P0 | M |
| 4 | Box<dyn Error> → anyhow | P1 | S |
| 5 | Clone on Vec → &[T] | P1 | M |
| 6 | Manual loops → iterators | P1 | S |
| 7 | Newtype UserId/OrderId | P1 | M |
| 8 | Display on error types | P2 | S |
| 9 | Builder for Report | P2 | M |
```
