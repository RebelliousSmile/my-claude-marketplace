# Python Version Reference

Key changes per Python version — use during `01-scan` to classify detected patterns.

## Python 2 remnants to remove

| Pattern | Replacement | Detection |
|---|---|---|
| `print "x"` | `print("x")` | grep `print [^(]` |
| `xrange()` | `range()` | grep `xrange` |
| `unicode(x)` | `str(x)` | grep `unicode(` |
| `basestring` | `str` | grep `basestring` |
| `dict.iteritems()` | `dict.items()` | grep `iteritems\|itervalues\|iterkeys` |
| `raw_input()` | `input()` | grep `raw_input` |
| `except E, e:` | `except E as e:` | grep `except.*,.*:` |
| `raise E, msg` | `raise E(msg)` | grep `raise .*, ` |
| `exec "code"` | `exec("code")` | grep `exec [^(]` |
| Integer division `/` | Use `//` explicitly | May silently change behavior |

## Python 3.x progression

### Python 3.6 — f-strings, secrets

| Old | New |
|---|---|
| `"hello %s" % name` | `f"hello {name}"` |
| `"hello {}".format(name)` | `f"hello {name}"` |
| `os.urandom()` for secrets | `secrets.token_bytes()` |

### Python 3.7 — dataclasses, dict ordering

| Old | New |
|---|---|
| `NamedTuple` with defaults manually | `@dataclass` with field defaults |
| `collections.OrderedDict` for insertion order | Plain `dict` (guaranteed ordered 3.7+) |
| `async` generators needed workaround | Native `async for` fully supported |

### Python 3.8 — walrus operator, positional-only params

| Old | New |
|---|---|
| `x = expr; if x:` | `if x := expr:` |
| `typing.TypedDict` (backport) | Built-in `typing.TypedDict` |

### Python 3.9 — built-in generics, `zoneinfo`

| Old | New |
|---|---|
| `typing.List[str]` | `list[str]` |
| `typing.Dict[str, int]` | `dict[str, int]` |
| `typing.Tuple[int, ...]` | `tuple[int, ...]` |
| `typing.Optional[str]` | `str \| None` (3.10+) |
| `pytz` timezone | `zoneinfo.ZoneInfo` |

### Python 3.10 — match statement, union types

| Old | New |
|---|---|
| `if/elif` chains on type | `match x: case int(): ...` |
| `Optional[X]` / `Union[X, Y]` | `X \| Y` |
| `isinstance(x, (A, B))` chains | `match x: case A() \| B(): ...` |

### Python 3.11 — exception groups, `tomllib`

| Old | New |
|---|---|
| Multiple except clauses for unrelated errors | `ExceptionGroup` + `except*` |
| Third-party TOML parser | `import tomllib` (stdlib) |
| `datetime.utcnow()` | `datetime.now(UTC)` (3.11 deprecates utcnow) |

### Python 3.12 — type aliases, `@override`

| Old | New |
|---|---|
| `TypeAlias = X` | `type Alias = X` (PEP 695) |
| Manual `TypeVar` | `def fn[T](x: T) -> T:` (PEP 695) |
| No `@override` decorator | `@typing.override` enforces LSP |
| `f"{x!r}"` inside f-strings broken | Allowed in 3.12 |

## Type hint evolution summary

| Syntax | Minimum version |
|---|---|
| `list[str]` instead of `List[str]` | 3.9 |
| `str \| None` instead of `Optional[str]` | 3.10 |
| `type Alias = X` | 3.12 |
| `def fn[T](x: T) -> T:` | 3.12 |
