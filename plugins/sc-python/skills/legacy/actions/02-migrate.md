# Action 02 — migrate

Apply upgrade or downgrade transformations identified by `01-scan`, file by file.

## Inputs

- Manifest from `01-scan` (required)
- `direction` — `upgrade` | `downgrade` (from manifest)
- `dry-run` (optional flag) — show diffs only, do not write

## Process

### Order of application

1. Python 2 removals first (runtime errors)
2. Type annotation updates
3. String formatting modernization
4. Missing type hints additions
5. Downgrade removals (if direction = downgrade)

Ask for user confirmation before processing string formatting changes (f-string conversion is sometimes stylistic).

### Per-pattern transformations

#### `Optional[X]` → `X | None`

```python
# Before
from typing import Optional
def find(id: int) -> Optional[str]: ...

# After
def find(id: int) -> str | None: ...
# (remove Optional import if no longer used)
```

#### `List[X]` / `Dict[X, Y]` → built-in generics (3.9+)

```python
# Before
from typing import List, Dict
def get_items() -> List[str]: ...
def get_map() -> Dict[str, int]: ...

# After
def get_items() -> list[str]: ...
def get_map() -> dict[str, int]: ...
# (remove List, Dict imports if no longer used)
```

#### `%` formatting → f-string

Only convert when all format variables are simple identifiers (no complex expressions).

```python
# Before
msg = "Hello %s, you have %d messages" % (name, count)

# After
msg = f"Hello {name}, you have {count} messages"
```

#### `.format()` → f-string

Only convert when format arguments are keyword-named or positional with simple variable names.

```python
# Before
msg = "Hello {name}, age {age}".format(name=user.name, age=user.age)

# After
name, age = user.name, user.age
msg = f"Hello {name}, age {age}"
```

#### Old `raise` / `except` syntax (Python 2)

```python
# Before
raise ValueError, "bad value"
except ValueError, e:

# After
raise ValueError("bad value")
except ValueError as e:
```

#### Missing type hints

Add minimal type hints to public function signatures based on usage patterns. Show diffs and ask for confirmation.

```python
# Before
def calculate_price(quantity, unit_price, discount):
    return quantity * unit_price * (1 - discount)

# After (inferred)
def calculate_price(quantity: int, unit_price: float, discount: float) -> float:
    return quantity * unit_price * (1 - discount)
```

### Write rules

- Write transformed files to the same path (in-place).
- Show a unified diff for each file before writing; proceed unless `dry-run`.
- Never modify `.venv/`, `venv/`, `__pycache__/`, migration files.
- Clean up unused `typing` imports after annotation updates.
- If removing `from typing import ...` leaves the import empty, remove the entire line.

## Output

```
✅ sc-python legacy — migration complete

  Modified (9 files):
    ↺ src/services/user_service.py — Optional × 4 → X|None, List × 2 → list
    ↺ src/models/order.py — Dict × 3 → dict, % formatting × 1 → f-string
    ↺ src/api/views.py — .format() × 5 → f-string
    ...
  Imports cleaned (3 files):
    ↺ src/services/user_service.py — removed Optional, List from typing
  Skipped (dry-run or user declined):
    - src/utils/helpers.py — type hints (complex signatures, needs manual review)
```
