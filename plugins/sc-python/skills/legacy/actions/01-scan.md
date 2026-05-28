# Action 01 — scan

Detect version-specific and deprecated patterns in the Python codebase. Emit a structured manifest for `02-migrate`.

## Inputs

- `path` (optional, default: project root) — directory to scan
- `target` (optional) — target Python version (e.g. `3.12`) or `"modernize"` (latest stable)
- `direction` (optional) — `upgrade` | `downgrade` (inferred from context if omitted)

## Process

### Step 1 — Detect current Python version

1. Read `.python-version` (pyenv)
2. Read `pyproject.toml` → `[tool.poetry] python` or `[project] requires-python`
3. Read `setup.py` → `python_requires`
4. Read `tox.ini` → `[tox] envlist`
5. If still unknown: check Dockerfile `FROM python:X.X`, else assume 3.9 and note the assumption

### Step 2 — Determine direction and target

- If user said "upgrade" or "modernize" or target > current: `direction = upgrade`, `target = 3.12` (or user value)
- If user said "downgrade" or "compat" or target < current: `direction = downgrade`, ask for target if not provided
- If direction still unknown: ask the user before scanning

### Step 3 — Scan deprecated and version-specific patterns

Grep the source files (`.py`) under `path`. Exclude `.venv/`, `venv/`, `__pycache__/`, migration files (`migrations/`, `alembic/versions/`).

#### Python 2 remnants (upgrade direction)

| Pattern | Signal | Replacement |
|---|---|---|
| `print` statement | `^\s*print\s+[^(]` | `print()` function |
| `xrange()` | `\bxrange\(` | `range()` |
| `dict.iteritems()` | `\.iteritems\(\)` | `dict.items()` |
| `dict.iterkeys()` | `\.iterkeys\(\)` | `dict.keys()` |
| `dict.itervalues()` | `\.itervalues\(\)` | `dict.values()` |
| `dict.has_key()` | `\.has_key\(` | `in` operator |
| `unicode()` | `\bunicode\(` | `str()` |
| `basestring` | `\bbasestring\b` | `str` |
| Old `raise` syntax | `raise\s+\w+,\s*` | `raise Exception("msg")` |
| Old `except` syntax | `except\s+\w+,\s*\w+:` | `except Exception as e:` |
| `execfile()` | `\bexecfile\(` | `exec(open(file).read())` |
| Long integers `123L` | `\d+L\b` | plain `int` |

#### Type annotation modernization (upgrade, Python 3.9+/3.10+)

| Pattern | Signal | Replacement | Since |
|---|---|---|---|
| `Optional[X]` | `Optional\[` | `X \| None` | 3.10 |
| `Union[X, Y]` | `Union\[` | `X \| Y` | 3.10 |
| `List[X]` | `List\[` | `list[X]` | 3.9 |
| `Dict[X, Y]` | `Dict\[` | `dict[X, Y]` | 3.9 |
| `Tuple[X, ...]` | `Tuple\[` | `tuple[X, ...]` | 3.9 |
| `Set[X]` | `Set\[` | `set[X]` | 3.9 |
| `Type[X]` | `Type\[` | `type[X]` | 3.9 |
| Missing function type hints | Functions without annotations | Add hints | 3.5+ |

#### String formatting modernization (upgrade, Python 3.6+)

| Pattern | Signal | Replacement |
|---|---|---|
| `%` formatting | `%\s*(\(|[sdif])` | f-string |
| `.format()` | `\.format\(` | f-string (if variables are simple) |

#### Downgrade targets

| Feature | Signal | Target |
|---|---|---|
| Walrus operator `:=` | `:=` | < 3.8 |
| Positional-only params `/` | `def fn(..., /, ...)` | < 3.8 |
| `X \| Y` type union in annotations | `\bint\s*\|\s*str\b` | < 3.10 |
| `match`/`case` structural pattern matching | `^\s*match\s` | < 3.10 |
| `tomllib` stdlib | `import tomllib` | < 3.11 |
| `Self` type | `\bSelf\b` | < 3.11 |
| `TypeVarTuple`, `Unpack` | | < 3.11 |
| PEP 695 `type X =` | `^type\s+\w+\s*=` | < 3.12 |

### Step 4 — Detect framework version gaps (if detected)

If Django detected: check installed version and note patterns removed between detected and target major.
If FastAPI detected: check for deprecated `@app.on_event` → `lifespan` context manager pattern.

### Step 5 — Output manifest

```
📊 sc-python legacy — scan results

Current Python: 3.9 (from .python-version)
Target: 3.12 (upgrade)

Python 2 remnants:
  (none)

Type annotation updates:
  MEDIUM  Optional[X] → X|None — 14 occurrences in 6 files
  MEDIUM  List[X] → list[X] — 8 occurrences in 4 files
  MEDIUM  Dict[X, Y] → dict[X, Y] — 5 occurrences in 3 files

String formatting:
  LOW     % formatting — 3 occurrences → f-string candidates
  LOW     .format() — 11 occurrences → f-string candidates (simple vars only)

Missing type hints:
  LOW     12 public functions without annotations (src/services/)

→ migrate will modify 9 files.
```

Then proceed to `02-migrate`.
