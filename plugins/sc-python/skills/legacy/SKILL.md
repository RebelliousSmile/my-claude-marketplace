---
name: legacy
description: >-
  Scans Python code for version-specific and deprecated patterns, then proposes an
  upgrade (toward Python 3.12+) or a downgrade (for target Python version compatibility).
  Handles Python 2 remnants (print statements, xrange, unicode, iteritems), typing
  evolution (PEP 484 → 604 → 695, Optional → X|None, List → list), old-style string
  formatting (% and .format() → f-strings), and framework version migrations
  (Django, FastAPI).
  Use when the user says "modernize", "upgrade to Python 3.12", "add type hints",
  "this is Python 2 style", "downgrade for 3.8 compat", or when deprecated patterns
  appear in the codebase.
  Do NOT use for dependency management (pip/poetry), performance optimization
  (web-optimize), or general refactoring unrelated to Python version compatibility.
---

# sc-python Legacy

Detects version-specific and deprecated patterns in the Python codebase, then produces a migration plan and applies changes file by file — either upgrading to modern Python or downgrading to a target version for compatibility.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `scan` | Detect legacy patterns and version gaps | path, target Python version |
| 02 | `migrate` | Apply upgrade or downgrade transformations | scan manifest, direction |

## Default flow

Always sequential: `scan` → `migrate`.

1. `scan` reads `pyproject.toml`, `setup.py`, or `.python-version`, detects current and target Python versions, finds deprecated/missing patterns, emits a structured manifest
2. `migrate` reads the manifest and applies transformations file by file

## References

- `references/python-versions.md` — version-by-version change tables (ES5→3.12+, type hint evolution)
- `references/framework-migrations.md` — Django, FastAPI/Pydantic, SQLAlchemy breaking changes

## Transversal rules

- Always detect the current Python version from `pyproject.toml`, `.python-version`, or `tox.ini` before scanning.
- Never remove a working pattern without providing its replacement inline.
- For breaking changes: show a diff of what will change and ask for confirmation before writing.
- Downgrade migrations: never remove a feature without confirming the target version actually lacks it.
- Framework-specific patterns (Django, FastAPI): check for framework version before applying framework-level migrations.
- Never touch generated migration files (`migrations/`, `alembic/versions/`).
