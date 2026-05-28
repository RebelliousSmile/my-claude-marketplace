# Action 02 — practice

Generate a targeted Python coding exercise modelled on the current project's patterns, then evaluate the user's solution.

## Inputs

- `topic` (required) — concept to practice (from `01-explain` or user-specified)
- `difficulty` (optional) — `beginner` | `intermediate` | `advanced` (default: infer from project complexity)

## Process

### Step 1 — Choose exercise type

| Difficulty | Exercise type |
|---|---|
| Beginner | Fill in a blank / fix a bug in a provided snippet |
| Intermediate | Implement a small class or function from a spec |
| Advanced | Refactor an existing project pattern to use the concept |

### Step 2 — Generate the exercise

1. Use the project's naming conventions and detected framework (Django, FastAPI)
2. Base the exercise on a realistic scenario from the project domain (inferred from module names)
3. Provide a clear spec:
   - What to implement
   - What assertions it must satisfy (doctest-style or pytest-style)
   - One hint (marked as optional to avoid spoilers)

### Step 3 — Wait for user response

After presenting the exercise, wait. Do not provide the solution until the user has attempted it or explicitly asks.

### Step 4 — Evaluate and explain

When the user provides their solution:
1. Check correctness against the spec
2. Note any Pythonic improvements (type hints, generators, comprehensions, context managers)
3. Show the reference solution side-by-side
4. Link back to the project example from `01-explain`

## Output example (topic: generators, difficulty: intermediate)

```
## Practice — Python Generators

**Scenario:** The project exports order data to CSV. Currently `export_orders()`
returns a full `list[str]`, which causes memory issues for large exports.

**Exercise:** Rewrite `export_orders()` as a generator function.

Requirements:
- Yield the CSV header row first
- Yield one row per order (format: `{id},{customer_id},{total}`)
- Accept a Django QuerySet (use `.iterator()` internally)
- Add return type hint `Iterator[str]`
- Must NOT materialise the full list in memory

```python
from typing import Iterator
from orders.models import Order

def export_orders(queryset) -> list[str]:  # change this
    rows = ["id,customer_id,total"]
    for order in queryset:
        rows.append(f"{order.id},{order.customer_id},{order.total}")
    return rows
```

**Hint (optional):** Replace `return rows` with multiple `yield` statements.

Take your time — share your solution when ready.
```

## Evaluation output example

```
## Evaluation

✅ Correctness: header + rows yielded correctly
✅ .iterator() used — no full QuerySet load
✅ Return type updated to Iterator[str]

Suggestions:
  - Consider `yield from` for a nested generator pipeline
  - Could accept a custom field list for flexibility

Reference solution:
```python
from typing import Iterator
from orders.models import Order
from django.db.models import QuerySet

def export_orders(queryset: QuerySet) -> Iterator[str]:
    yield "id,customer_id,total"
    for order in queryset.iterator():
        yield f"{order.id},{order.customer_id},{order.total}"
```

Compare with `iter_orders_csv()` in `src/reports/export.py` — same pattern.
```
