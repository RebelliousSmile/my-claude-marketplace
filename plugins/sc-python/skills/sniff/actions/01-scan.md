# Action 01 — scan

Detect the Python stack in the current project and audit `.claude/rules/` to determine which rules are missing or outdated.

## Process

### Step 1 — Read project manifests

Check for the following files (try each in order):

1. `requirements.txt` — parse package names and versions
2. `pyproject.toml` — parse `[tool.poetry.dependencies]` or `[project.dependencies]`
3. `setup.py` — parse `install_requires` (heuristic, regex on `install_requires=[...]`)
4. `Pipfile` — parse `[packages]` section
5. `manage.py` — presence means Django even without manifest

If none of these exist, abort:
```
❌ sc-python sniff — no Python project detected
   Expected: requirements.txt, pyproject.toml, setup.py, Pipfile, or manage.py
   Aborting.
```

### Step 2 — Classify stack

Evaluate the following signals. A project can use multiple (e.g. Django + SQLAlchemy via Django-SQLAlchemy bridge is rare but possible).

| Signal | Stack |
|---|---|
| `django` in any manifest, or `manage.py` present | Django |
| `fastapi` in any manifest | FastAPI |
| `flask` in any manifest | Flask |
| `sqlalchemy` in any manifest | SQLAlchemy |
| `django` detected (step above) | Django ORM (implicitly bundled with Django) |

Note: if Django is detected, Django ORM is assumed active unless SQLAlchemy is also present (some projects swap the ORM).

### Step 3 — Audit installed rules

For each detected stack, determine the required rule file and its status:

| Stack detected | Rule file | Reference |
|---|---|---|
| Django | `.claude/rules/07-quality/perf-pivots-django.md` | `references/07-perf-pivots-django.md` |
| FastAPI | `.claude/rules/07-quality/perf-pivots-fastapi.md` | `references/07-perf-pivots-fastapi.md` |
| Django ORM | `.claude/rules/07-quality/data-pivots-django-orm.md` | `references/08-data-pivots-django-orm.md` |
| SQLAlchemy | `.claude/rules/07-quality/data-pivots-sqlalchemy.md` | `references/08-data-pivots-sqlalchemy.md` |

For each required rule file, check its status:
- File does not exist → **MISSING**
- File exists and content matches the plugin reference (ignore trailing whitespace) → **UP-TO-DATE**
- File exists but content differs from the plugin reference → **OUTDATED**

Note: Flask has no dedicated perf pivot in this plugin version. If Flask is the only framework detected, note it in the output and suggest installing FastAPI pivot as a general ASGI/WSGI reference, but do not install it automatically.

## Output

Emit a structured manifest for `02-sync`:

```
📊 sc-python sniff — scan results

Stack detected:
  ✅ Django (from: requirements.txt — django==4.2.0)
  ✅ Django ORM (bundled with Django)
  ❌ FastAPI — not detected
  ❌ Flask — not detected
  ❌ SQLAlchemy — not detected

Rule audit (required for detected stack):
  MISSING   .claude/rules/07-quality/perf-pivots-django.md
  OUTDATED  .claude/rules/07-quality/data-pivots-django-orm.md

→ sync will install 1 file, update 1 file.
```

Then proceed to action `02-sync`.
