# Action 01 — analyze

Read the Python codebase and identify Pythonic idiom gaps, design pattern opportunities, and maintainability issues.

## Inputs

- `path` (optional, default: project root) — scope of the analysis
- `focus` (optional) — specific area: `pythonic`, `types`, `async`, `patterns`, `framework` (default: all)

## Process

### Step 1 — Map the codebase structure

Read the directory structure under `path`. Exclude `.venv/`, `venv/`, `__pycache__/`, `migrations/`.
Identify:
- Views/routers (`views.py`, `routers/`, `endpoints/`)
- Models (`models.py`, `models/`)
- Services/business logic (`services/`, `utils/`)
- Serializers/schemas (`serializers.py`, `schemas/`)
- Tests (`tests/`, `test_*.py`)

### Step 2 — Analyze each category

#### Pythonic idiom gaps

**EAFP vs LBYL:**
- `if key in dict: value = dict[key]` → `value = dict.get(key)` or `try/except KeyError`
- `if hasattr(obj, 'method'): obj.method()` → duck typing with try/except

**Mutable default arguments:**
- `def fn(items=[])` or `def fn(config={})` → `def fn(items=None)` + `if items is None: items = []`

**Missing context managers:**
- Manual `file.open()` / `file.close()` pairs without `with`
- Database connections not using context manager

**Comprehension opportunities:**
- `result = []` + `for x in items: result.append(f(x))` → `[f(x) for x in items]`
- `result = {}` + `for k, v in items: result[k] = v` → `{k: v for k, v in items}`

**Generator opportunities:**
- Large list comprehensions that are immediately iterated and discarded → generator expression
- Functions that build and return a full list only to be iterated once → `yield`

**String formatting:**
- `%` formatting or `.format()` where f-strings would be clearer

#### Type annotation coverage

- Public functions without return type annotations
- Function parameters without type annotations
- `Any` used where a narrower type is possible
- `Optional[X]` instead of `X | None` (Python 3.10+)
- Missing `TypedDict` for dict-heavy APIs

#### Async correctness

- `time.sleep()` in an async function → `asyncio.sleep()`
- Blocking I/O (file read, `requests.get()`) in an async function without a thread pool
- `asyncio.run()` called inside a running event loop
- Missing `await` on coroutines (bug: produces a coroutine object instead of executing)
- `async for` not used when iterating an async generator

#### Design patterns

**Missing dependency injection:**
- `from myapp.services import mailer` imported at module level inside a function → inject as parameter
- Hardcoded configuration inside functions that should be configurable

**God object / fat view:**
- View function > 50 lines containing DB queries, business logic, and response formatting
- Serializer with complex computed fields that belong in a service

**Repeated validation:**
- Same validation logic in multiple view functions that should be in a form/schema

#### Framework-specific (if detected)

**Django:**
- N+1: `for obj in queryset: obj.related_model.field` without `select_related`/`prefetch_related`
- Logic in templates that belongs in a template tag or context processor
- Missing `select_for_update()` in concurrent write scenarios
- `get_object_or_404` vs manual `try/except` inconsistency

**FastAPI:**
- Response model not declared on endpoints that return JSON
- Missing `Depends()` for shared logic (auth, DB session, pagination)
- Synchronous functions declared as `async def` without any actual await calls

### Step 3 — Emit findings

For each finding:
- Category
- Severity: `HIGH` (likely bug or hard to maintain) | `MEDIUM` (design improvement) | `LOW` (polish)
- File + line reference
- Short description

## Output

```
📋 sc-python improve — analysis

Scanned: 34 files (views: 6, models: 8, services: 3, serializers: 5)

Pythonic gaps:
  HIGH   Mutable default argument — orders/views.py:18: `def list_orders(filters={})`
  MEDIUM LBYL pattern — 4 occurrences of `if key in dict: val = dict[key]`
  MEDIUM Missing comprehension — 6 list-building loops that qualify

Type coverage:
  MEDIUM 11 public functions missing return type annotations
  LOW    6 functions using Optional[X] → could use X|None (Python 3.10+)

Async correctness:
  HIGH   time.sleep() in async function — notifications/tasks.py:45
  HIGH   requests.get() in async view — orders/views.py:67 (blocking I/O)

Design patterns:
  HIGH   N+1 — orders/views.py:34: `order.customer` in loop, no select_related
  MEDIUM Fat view — orders/views.py::create() — 73 lines, mixes validation + DB + email

Total: 4 HIGH · 5 MEDIUM · 1 LOW
→ proceed to plan.
```

Then proceed to `02-plan`.
