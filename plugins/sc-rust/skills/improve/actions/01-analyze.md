# Action 01 — analyze

Read the Rust codebase and identify idiomatic Rust gaps, ownership pattern issues, and design opportunities.

## Inputs

- `path` (optional, default: project root) — scope of the analysis
- `focus` (optional) — specific area: `ownership`, `errors`, `iterators`, `async`, `design` (default: all)

## Process

### Step 1 — Map the codebase structure

Read the directory structure under `path`. Exclude `target/`.
Identify:
- Binary entry points (`src/main.rs`, `src/bin/`)
- Library root (`src/lib.rs`)
- Module structure (`src/handlers/`, `src/services/`, `src/models/`, `src/errors/`)
- Tests (`#[cfg(test)]` modules, `tests/`)

### Step 1.5 — Stack-specific anti-patterns from capability pivots

Re-detect capabilities from `Cargo.toml` (same conditions as `sniff/01-scan`). For each condition met, load the pivot from `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/<path>` and use its anti-patterns, prescriptive rules, and violation patterns as **additional detection criteria** in Step 2. Report findings under a `Stack-specific` category.

| Capability | Condition | Pivot |
|---|---|---|
| Rust idioms | Always | `rust/idioms.md` |
| PyO3 FFI safety | `pyo3` in dependencies | `rust/pyo3.md` |
| rusqlite patterns | `rusqlite` in dependencies | `data/rusqlite.md` |
| Tauri desktop patterns | `tauri` in dependencies | `rust/tauri.md` |

If a loaded pivot has a `## Anti-patterns` section, extract it directly. Otherwise read the full pivot and infer violations from its prescriptive rules.
Skip this step entirely if no `Cargo.toml` is found.

### Step 2 — Analyze each category

#### Error handling

- `unwrap()` / `expect()` outside of `#[cfg(test)]` or `#[test]` functions → should propagate with `?`
- `Box<dyn Error>` in public API signatures → should use a typed error (thiserror) or `anyhow::Error`
- Error types that derive `Debug` but not `Display` → `thiserror` `#[error("...")]` missing
- Overly broad `match err { _ => ... }` that hides error variants → handle each variant explicitly

#### Ownership and cloning

- `.clone()` on `String`, `Vec`, `HashMap` in hot paths (called in loops or per-request) → consider `Cow<str>`, `Arc<T>`, or restructure ownership
- Function takes ownership (`fn f(x: T)`) but never consumes or moves `x` → should take `&T`
- `to_owned()` / `to_string()` called immediately before passing to a function that accepts `&str` → pass `&str` directly

#### Iterators and loops

- `for i in 0..vec.len() { ... vec[i] ... }` → `for item in &vec { ... }` or `.iter().enumerate()`
- Manual filter + collect: `let mut v = vec![]; for x in xs { if cond(x) { v.push(x); } }` → `xs.into_iter().filter(cond).collect()`
- `map` followed by `filter` on `Option` → `and_then`, `filter`, `map` chaining
- Multiple `.iter().find()` calls on the same collection → consider a `HashMap` for O(1) lookup

#### Concurrency and async

- `Arc<Mutex<T>>` where `T` is only written once at startup → `Arc<RwLock<T>>` or just `Arc<T>` with initialization
- Locking `Mutex` across an `.await` point → deadlock risk; use `tokio::sync::Mutex` instead of `std::sync::Mutex`
- `tokio::spawn` with a closure that captures `Rc<T>` → `Rc` is not `Send`; use `Arc`
- Blocking operations (`std::fs::read_to_string`, `std::thread::sleep`) inside `async fn` → use `tokio::fs` / `tokio::time::sleep`

#### Design patterns

**Missing newtype pattern:**
- `user_id: u64` and `order_id: u64` parameters in the same function → easy to pass in wrong order; wrap in `UserId(u64)` and `OrderId(u64)`

**Missing builder pattern:**
- Struct with > 5 fields all set at construction, some optional → builder reduces construction noise

**Trait-based polymorphism:**
- Enum with per-variant `match` arms in multiple places → consider a trait with per-type implementations
- `if type_flag == "email" { ... } else if type_flag == "sms" { ... }` → trait object or enum dispatch

**Public API surface:**
- `pub struct` with all `pub` fields that should be constructed via constructor → encapsulate

### Step 3 — Emit findings

For each finding:
- Category
- Severity: `HIGH` (likely panic, deadlock, or data race) | `MEDIUM` (design improvement or unnecessary overhead) | `LOW` (idiomatic polish)
- File + approximate line
- Short description

## Output

```
📋 sc-rust improve — analysis

Scanned: 22 files (handlers: 4, services: 5, models: 6, errors: 1)

Error handling:
  HIGH   unwrap() in non-test code — 8 occurrences in 5 files
  MEDIUM Box<dyn Error> in public handler signatures — src/handlers/orders.rs:12, :34
  LOW    Error type missing Display impl — src/errors/mod.rs:8

Ownership:
  MEDIUM .clone() on Vec<OrderItem> in request handler loop — src/handlers/orders.rs:67
  MEDIUM fn process(order: Order) — never consumes order, should take &Order — src/service/order.rs:23

Iterators:
  MEDIUM Manual filter loop — 3 occurrences → .filter().collect() — src/service/search.rs:45
  LOW    Index-based loop — 2 occurrences → .iter().enumerate()

Async correctness:
  HIGH   std::sync::Mutex locked across .await — src/handlers/orders.rs:89
  HIGH   std::fs::read_to_string in async fn — src/config/loader.rs:15

Design:
  MEDIUM Missing newtype — user_id: u64 and order_id: u64 in same fn params (3 handlers)
  LOW    Large struct (8 fields) with no builder — src/models/report.rs

Total: 3 HIGH · 6 MEDIUM · 2 LOW
→ proceed to plan.
```

Then proceed to `02-plan`.
