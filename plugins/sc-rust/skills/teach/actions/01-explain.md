# Action 01 — explain

Explain a Rust concept or pattern using real examples found in the current project codebase.

## Inputs

- `topic` (required) — concept, pattern, or code excerpt to explain (e.g. "lifetimes", "traits", "ownership", "this error", "why the borrow checker rejects this", "async/await")
- `path` (optional, default: project root) — where to search for examples

## Process

### Step 1 — Identify the concept

Parse the user's input to determine the category:

| Category | Examples |
|---|---|
| Ownership & borrowing | ownership, move semantics, borrowing, shared vs mutable refs, clone vs copy |
| Lifetimes | lifetime annotations, `'a`, `'static`, elision rules, self-referential types |
| Traits | trait objects, `dyn Trait`, `impl Trait`, blanket impls, orphan rule, `Send`/`Sync` |
| Error handling | `Result`, `?` operator, `anyhow`, `thiserror`, `From` trait, error propagation |
| Async | async/await, `Future`, `Pin`, executor, Tokio tasks, `tokio::spawn` |
| Iterators | `Iterator` trait, `map`/`filter`/`fold`, `collect`, lazy chains |
| Smart pointers | `Box`, `Rc`, `Arc`, `RefCell`, `Mutex`, interior mutability |
| Pattern matching | `match`, `if let`, `while let`, `@` bindings, guards |
| Generics & types | generics, associated types, `PhantomData`, newtype pattern, builder pattern |
| Closures | `Fn`/`FnMut`/`FnOnce`, captures, `move` closures |

### Step 2 — Search the project for examples

Search `.rs` files for the concept. Exclude `target/`.

Useful patterns to grep:
- Lifetimes: `<'\w+>`
- Traits: `impl\s+\w+\s+for`, `dyn\s+\w+`
- Async: `async\s+fn`, `\.await`
- Iterators: `\.iter\(\)`, `\.map\(`, `\.collect\(`
- Error handling: `Result<`, `\?\s*;`, `anyhow\|thiserror`
- Arc/Mutex: `Arc::new\|Mutex::new`
- Generics: `<T\b`, `where\s+T:`

If found: pick the most illustrative example (prefer real domain logic over framework boilerplate).
If not found: proceed with a minimal invented snippet matching the project's crate versions and error handling style.

### Step 3 — Explain

Structure the explanation:

1. **One-line definition** — what it is
2. **Why it exists** — what problem it solves (or: what the compiler is protecting you from)
3. **The project example** — actual project code, annotated inline
4. **Key rules** — 3-5 bullet points: when to use, when NOT to use, common mistakes
5. **Compiler error** — if relevant (ownership, lifetimes, borrow checker): show the rejected code + the compiler error message, then the corrected version

Keep explanations concise. Real code > prose. For ownership/borrow topics, always show both the rejected and accepted form.

### Step 4 — Offer practice

End every explanation with:

```
---
Want to consolidate this with a practice exercise? Say "practice [topic]".
```

## Output example (topic: ownership)

```
## Rust Ownership

**What:** Every value in Rust has exactly one owner. When the owner goes out of scope,
         the value is dropped. There is no garbage collector.

**Why it exists:** Prevents use-after-free, double-free, and data races at compile time —
                   without a GC pause.

**In this project** (`src/service/order_service.rs`):
```rust
pub fn process(order: Order) -> ProcessedOrder {
    //                ^^^^^  — `order` is moved in here
    let total = calculate_total(&order.items); // borrow, not move
    ProcessedOrder { id: order.id, total }
    //                   ^^^^^^^^  — partial move of fields is fine here
} // `order` dropped here (if not moved out)
```

**Key rules:**
- ✅ Pass by reference (`&T`) when the caller still needs the value after the call
- ✅ Move into a function when you want to transfer ownership (and caller no longer needs it)
- ❌ Don't `clone()` reflexively — understand *why* the borrow checker rejects first
- ⚠  `Copy` types (integers, booleans) are copied, not moved — the rule looks different for them

**Compiler error example:**
```rust
let s = String::from("hello");
let s2 = s;        // s is moved into s2
println!("{}", s); // ❌ error[E0382]: borrow of moved value: `s`

// Fix: either clone or use s2 going forward
let s2 = s.clone(); // deep copy
println!("{} {}", s, s2); // ✅
```
```
