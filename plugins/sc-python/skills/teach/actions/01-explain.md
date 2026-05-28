# Action 01 — explain

Explain a Python concept or pattern using real examples found in the current project codebase.

## Inputs

- `topic` (required) — concept, pattern, or code excerpt to explain (e.g. "generators", "dataclasses", "type hints", "async/await", "this decorator", "why does this return None")
- `path` (optional, default: project root) — where to search for examples

## Process

### Step 1 — Identify the concept

Parse the user's input to determine the category:

| Category | Examples |
|---|---|
| Language feature | generators, decorators, context managers, dataclasses, walrus operator, match/case |
| Type system | type hints, generics, Protocol, TypeVar, Annotated, TypedDict |
| Async | async/await, asyncio, event loop, coroutines, tasks, aiohttp |
| OOP pattern | ABC/abstract classes, mixins, __slots__, property, __dunder__ methods |
| Functional | list/dict/set comprehensions, map/filter, functools, itertools |
| Python idiom | EAFP vs LBYL, duck typing, unpacking, *args/**kwargs |
| Framework feature | Django ORM, signals, middleware, views; FastAPI dependency injection, Pydantic models |

### Step 2 — Search the project for examples

Search `.py` files for the concept. Exclude `.venv/`, `venv/`, `__pycache__/`, `migrations/`.

Useful patterns to grep:
- Generators: `\byield\b`
- Dataclasses: `@dataclass`
- Async: `async def`, `await\s`
- Decorators: `^@\w+` (non-property/classmethod/staticmethod)
- Context managers: `__enter__`, `__exit__`, `@contextmanager`
- Protocols: `class\s+\w+\s*\(\s*Protocol\s*\)`
- TypedDict: `class\s+\w+\s*\(\s*TypedDict\s*\)`

If found: pick the most illustrative example (prefer real business logic over boilerplate).
If not found: proceed with a minimal invented snippet in the project's style (detected naming conventions, import style).

### Step 3 — Explain

Structure the explanation:

1. **One-line definition** — what it is
2. **Why it exists** — what problem it solves (the "before" without it)
3. **The project example** — actual project code, annotated inline
4. **Key rules** — 3-5 bullet points: when to use, when NOT to use, common pitfalls
5. **Contrast** — if relevant, contrast with the alternative (e.g. dataclass vs NamedTuple vs TypedDict)

Keep explanations concise. Real code > prose. For async topics, always show the sync equivalent first.

### Step 4 — Offer practice

End every explanation with:

```
---
Want to consolidate this with a practice exercise? Say "practice [topic]".
```

## Output example (topic: generators)

```
## Python Generators

**What:** A function that yields values one at a time, pausing between yields.
         Returns a lazy iterator instead of a fully materialized list.

**Why it exists:** Lets you iterate over large or infinite sequences without
                   loading everything into memory at once.

**In this project** (`src/reports/export.py`):
```python
def iter_orders_csv(queryset: QuerySet) -> Iterator[str]:
    yield "id,customer,amount,date"          # Header row first
    for order in queryset.iterator():        # DB cursor — not loaded all at once
        yield f"{order.id},{order.customer_id},{order.total},{order.created_at}"
```

**Key rules:**
- ✅ Use when the full sequence does not need to be in memory simultaneously
- ✅ Use for streaming large DB results (`queryset.iterator()` + generator = O(1) memory)
- ✅ Use for pipeline transformations (generator chaining)
- ❌ Don't use if you need random access (index by position) — materialise with `list()` then
- ⚠  Generators are consumed once — save to a list if you need to iterate twice

**vs list comprehension:** `[f(x) for x in items]` = eager (full list in memory);
                           `(f(x) for x in items)` = lazy generator expression.
```
