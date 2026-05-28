---
paths:
  - "**/*.rs"
  - "!**/target/**"
---
# Rust Idioms — Code Quality Pivot

Criteria for `/sc-rust:audit`. Loaded at audit time, never installed to `.claude/rules/`.

## Ownership and borrowing

- Prefer borrowing (`&T`, `&mut T`) over cloning unless the value must be owned.
- Never call `.clone()` to satisfy the borrow checker without first considering lifetime restructuring.
- Use `Cow<'_, T>` when data may be either borrowed or owned depending on context.
- Prefer `&str` over `&String` and `&[T]` over `&Vec<T>` in function signatures.

## Lifetimes

- Annotate explicit lifetimes only when the compiler cannot elide them.
- Avoid `'static` bounds unless the value genuinely lives for the program's lifetime.
- Prefer `Arc<T>` over manual lifetime threading when sharing across async tasks.

## Error handling

- Use `?` for error propagation — never `.unwrap()` or `.expect()` in library code.
- `.unwrap()` and `.expect()` are acceptable only in tests or `main()` with a comment explaining invariant.
- Use `thiserror` for library errors, `anyhow` for application errors — do not mix them in the same crate.
- Define domain-specific error types with `#[derive(thiserror::Error)]`; avoid stringly-typed errors.

## Iterators

- Prefer iterator chains (`.map()`, `.filter()`, `.fold()`, `.collect()`) over `for` loops that build collections.
- Use `.iter()` for immutable iteration, `.iter_mut()` for mutable, `.into_iter()` for consuming.
- Prefer `.any()` / `.all()` / `.find()` over manual loop flags.
- Avoid `.collect::<Vec<_>>()` followed by `.iter()` — chain directly.

## Traits and generics

- Prefer `impl Trait` in function arguments over `Box<dyn Trait>` when dynamic dispatch is not required.
- Use `Box<dyn Trait>` only when the concrete type is unknown at compile time.
- Implement standard traits (`Display`, `From`, `Into`, `TryFrom`, `Default`) before inventing custom ones.
- Use `#[derive]` for `Clone`, `Debug`, `PartialEq`, `Hash` when semantically correct.

## Async

- Use `tokio::spawn` for CPU-bound work only with `spawn_blocking`; never block the async runtime.
- Prefer `tokio::select!` for concurrent futures over sequential `await` chains.
- Use `Arc<Mutex<T>>` (or `Arc<RwLock<T>>`) for shared mutable state across tasks — never `Rc<RefCell<T>>`.
- Annotate async functions that perform I/O with `#[tracing::instrument]` for observability.

## Clippy compliance

- All public items must pass `clippy::pedantic` without `#[allow]` suppressions unless justified by a comment.
- Suppress specific lints at the item level, not the crate level.
- Prefer `clippy::must_use` annotation on functions with non-trivial return values.
