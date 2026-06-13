# Python — obsolescence detection patterns

Extensions: `.py`

---

## Detector A — Import extraction

```regex
^import\s+([\w.]+)(?:\s+as\s+\w+)?
^from\s+([\w.]+)\s+import\s+
```

**External package heuristic**: the top-level module name is not in the Python standard library list below.

**Python standard library modules** (do NOT flag): `abc`, `argparse`, `ast`, `asyncio`, `builtins`, `collections`, `concurrent`, `contextlib`, `copy`, `csv`, `dataclasses`, `datetime`, `decimal`, `difflib`, `email`, `enum`, `functools`, `gc`, `glob`, `hashlib`, `html`, `http`, `importlib`, `inspect`, `io`, `itertools`, `json`, `logging`, `math`, `multiprocessing`, `operator`, `os`, `pathlib`, `pickle`, `platform`, `pprint`, `queue`, `random`, `re`, `shutil`, `signal`, `socket`, `sqlite3`, `ssl`, `stat`, `string`, `struct`, `subprocess`, `sys`, `tempfile`, `textwrap`, `threading`, `time`, `traceback`, `types`, `typing`, `unittest`, `urllib`, `uuid`, `warnings`, `weakref`, `xml`, `zipfile`, `zlib`.

**Manifest to check** (in priority order):
1. `pyproject.toml` (`[project] dependencies` or `[tool.poetry.dependencies]`)
2. `requirements.txt` / `requirements-dev.txt`
3. `setup.py` / `setup.cfg`

**Package name normalization**: Python import names often differ from package names (e.g., `import PIL` → package `Pillow`, `import cv2` → `opencv-python`, `import sklearn` → `scikit-learn`). Apply known aliases before flagging as missing.

Common aliases:
| Import name | Package name |
|---|---|
| `PIL` | `Pillow` |
| `cv2` | `opencv-python` |
| `sklearn` | `scikit-learn` |
| `bs4` | `beautifulsoup4` |
| `yaml` | `PyYAML` |
| `dotenv` | `python-dotenv` |
| `dateutil` | `python-dateutil` |

**Deprecated check** (if pip available):
```bash
pip list --outdated --format=json 2>/dev/null
```

---

## Detector B — Symbol declaration patterns

```regex
# Functions
def\s+(\w+)\s*\(

# Classes
class\s+(\w+)[\s(:]

# Async functions
async\s+def\s+(\w+)\s*\(

# Module-level constants / assignments (top-level, no indent)
^(\w+)\s*=
```

**Grep command**:
```bash
rg -n "^def\s+\w+|^class\s+\w+|^async\s+def\s+\w+" --glob "**/*.py"
```

---

## Notes

- `__init__.py` re-exports: a symbol may be declared in a sub-module and re-exported via `__init__.py`. Check both the direct file and the package's `__init__.py` before flagging as missing.
- Type annotations (Python 3.10+): `from __future__ import annotations` makes forward references strings — do not flag as missing.
- Virtual environment imports: if a `venv/` or `.venv/` directory is present, installed packages can be verified by scanning `<venv>/lib/python*/site-packages/`.
