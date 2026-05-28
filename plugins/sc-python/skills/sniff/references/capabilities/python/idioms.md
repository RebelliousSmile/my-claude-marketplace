---
paths:
  - "**/*.py"
  - "!**/migrations/**"
  - "!**/venv/**"
  - "!**/.venv/**"
---
# Python Idioms — Code Quality Pivot

Criteria for `/sc-python:audit`. Loaded at audit time, never installed to `.claude/rules/`.

## Pythonic patterns

- Prefer list/dict/set comprehensions over `for` loops that build collections.
- Use `enumerate()` instead of manual index counters.
- Use `zip()` to iterate over multiple sequences in parallel.
- Use `any()` / `all()` instead of manual loop flags.
- Use `dict.get(key, default)` over `if key in dict: ... else: ...`.
- Prefer f-strings over `%`-formatting or `.format()`.

## Type hints

- All public functions must have parameter and return type annotations (PEP 484).
- Use `X | None` (PEP 604, Python 3.10+) over `Optional[X]`.
- Use built-in generics (`list[str]`, `dict[str, int]`) over `typing.List`, `typing.Dict` (Python 3.9+).
- Annotate instance variables in `__init__` or as class-level annotations.

## Error handling (EAFP)

- Prefer try/except (EAFP) over hasattr/isinstance guards (LBYL) for control flow.
- Catch specific exceptions — never bare `except:` or `except Exception:` without re-raise or logging.
- Use context managers (`with`) for all resource acquisition (files, connections, locks).

## Mutable defaults — critical

- Never use mutable default arguments (`def f(x=[])`, `def f(x={})`). Use `None` and initialize inside.
- Never use class-level mutable attributes shared across instances.

## Dataclasses and NamedTuple

- Prefer `@dataclass` over plain classes that only hold data.
- Prefer `NamedTuple` over plain tuples when field names matter.
- Use `frozen=True` for immutable value objects.

## Async

- Never call blocking I/O inside an async function without `run_in_executor`.
- Use `asyncio.gather()` for concurrent async calls, not sequential `await`.
- Never mix sync ORM calls (e.g. Django ORM) inside async views without `sync_to_async`.

## Imports

- Standard library → third-party → local: one blank line between groups (PEP 8).
- No wildcard imports (`from module import *`) outside `__init__.py`.
- No circular imports — restructure to a shared module if detected.
