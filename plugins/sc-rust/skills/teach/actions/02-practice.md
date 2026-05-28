# Action 02 — practice

Generate a targeted Rust coding exercise modelled on the current project's patterns, then evaluate the user's solution.

## Inputs

- `topic` (required) — concept to practice (from `01-explain` or user-specified)
- `difficulty` (optional) — `beginner` | `intermediate` | `advanced` (default: infer from project complexity)

## Process

### Step 1 — Choose exercise type

| Difficulty | Exercise type |
|---|---|
| Beginner | Fix a compiler error in a provided snippet (borrow, lifetime, trait bound) |
| Intermediate | Implement a struct with methods or a trait for a given type |
| Advanced | Refactor an existing project pattern using the concept |

### Step 2 — Generate the exercise

1. Use the project's crate versions, error handling style (anyhow vs thiserror), and async executor (Tokio vs none)
2. Base the exercise on a realistic scenario from the project domain (inferred from module names)
3. Provide a clear spec:
   - What to implement or fix
   - What the code must compile to / what assertions it must pass
   - One hint (marked as optional to avoid spoilers)

For beginner level: always provide the compiler error message so the user can reason about it.

### Step 3 — Wait for user response

After presenting the exercise, wait. Do not provide the solution until the user has attempted it or explicitly asks.

### Step 4 — Evaluate and explain

When the user provides their solution:
1. Check correctness: would it compile? Does it satisfy the spec?
2. Note any idiomatic improvements (iterator chains, `?` operator, trait bounds, etc.)
3. Show the reference solution side-by-side
4. Link back to the project example from `01-explain`

## Output example (topic: ownership, difficulty: beginner)

```
## Practice — Rust Ownership

**Scenario:** The following function is supposed to log an order then return its ID.
But it does not compile. Fix it.

```rust
fn log_and_get_id(order: Order) -> u32 {
    println!("Processing order: {:?}", order);
    process_order(order);   // takes ownership
    order.id                // ❌ use after move
}
```

**Compiler error:**
```
error[E0382]: use of moved value: `order`
 --> src/main.rs:5:5
  |
3 |     process_order(order);
  |                   ----- value moved here
4 |     order.id
  |     ^^^^^^^^^^^ value used here after move
```

**Your task:** Fix `log_and_get_id` so it compiles and returns the order's `id`.
You may change the function signature if needed.

**Hint (optional):** You can save `order.id` before moving, or change how you pass to `process_order`.

Take your time — share your solution when ready.
```

## Evaluation output example

```
## Evaluation

✅ Compiles correctly
✅ Returns the correct id

Solution A (save id before move):
```rust
fn log_and_get_id(order: Order) -> u32 {
    let id = order.id;          // copy u32 before moving
    println!("Processing: {:?}", order);
    process_order(order);
    id
}
```

Solution B (pass by reference to process_order):
```rust
fn log_and_get_id(order: Order) -> u32 {
    println!("Processing: {:?}", order);
    process_order(&order);      // borrow — order still valid
    order.id
}
// requires: fn process_order(order: &Order) { ... }
```

**Idiomatic note:** Prefer Solution B when `process_order` doesn't need to own the value.
Saving a copy (A) is fine for `Copy` types like `u32`, but would require `.clone()` for `String`.

Compare with `process()` in `src/service/order_service.rs` — same ownership decision point.
```
