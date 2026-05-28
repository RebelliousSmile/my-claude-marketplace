# Action 01 — scan

Detect project capabilities, map them to plugin pivots, and emit a structured pivot manifeste for `02-install-pivots` and `/sc-python:audit`.

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

### Step 2 — Classify framework

| Signal | Framework |
|---|---|
| `django` in any manifest, or `manage.py` present | Django |
| `fastapi` in any manifest | FastAPI |
| `flask` in any manifest | Flask |

A project may match multiple (e.g. Django + FastAPI in a hybrid monorepo).

### Step 3 — Classify data layer

| Signal | Data layer |
|---|---|
| Django detected and `sqlalchemy` not present | Django ORM (implicitly bundled with Django) |
| `sqlalchemy` in any manifest | SQLAlchemy |

If Django and SQLAlchemy are both detected, include both.

### Step 4 — Map capabilities to pivots

#### Capability pivots (loaded at audit time by `/sc-python:audit` — never installed to disk)

| Capability | Condition | Pivot path |
|---|---|---|
| Python idioms | Any Python project detected | `python/idioms.md` |

#### Perf pivots (installed to `.claude/rules/07-quality/`)

| Capability | Condition | Source → Target |
|---|---|---|
| Django perf | Django detected | `references/capabilities/perf/django.md` → `.claude/rules/07-quality/perf-pivots-django.md` |
| FastAPI perf | FastAPI detected | `references/capabilities/perf/fastapi.md` → `.claude/rules/07-quality/perf-pivots-fastapi.md` |
| Flask perf | Flask detected | — no pivot (report as gap) |

#### Data pivots (installed to `.claude/rules/07-quality/`)

| Capability | Condition | Source → Target |
|---|---|---|
| Django ORM | Django ORM detected | `references/capabilities/data/django-orm.md` → `.claude/rules/07-quality/data-pivots-django-orm.md` |
| SQLAlchemy | SQLAlchemy detected | `references/capabilities/data/sqlalchemy.md` → `.claude/rules/07-quality/data-pivots-sqlalchemy.md` |

### Step 5 — Status each perf/data pivot

For each required pivot, determine status:
- File does not exist → **MISSING**
- File exists, content matches plugin reference → **UP-TO-DATE**
- File exists, content differs from plugin reference → **OUTDATED**
- Condition not met → **NOT-APPLICABLE**

### Step 6 — Detect gaps

A **gap** is a capability detected but for which the plugin has no matching pivot.

Built-in gap: Flask has no dedicated perf pivot in this plugin version — always report it when Flask is detected.

## Output

Emit the pivot manifeste for `02-install-pivots`:

```
📊 sc-python sniff — pivot manifeste

Framework:
  ✅ Django (django==4.2.0 from requirements.txt)
  ❌ FastAPI — not detected
  ❌ Flask — not detected

Data layer:
  ✅ Django ORM (bundled with Django)
  ❌ SQLAlchemy — not detected

Capability pivots (loaded at audit time — not installed):
  python/idioms.md   ✅

Perf pivots (to install):
  perf/django.md     ✅ → .claude/rules/07-quality/perf-pivots-django.md
  perf/fastapi.md    — N/A (not detected)

Data pivots (to install):
  data/django-orm.md ✅ → .claude/rules/07-quality/data-pivots-django-orm.md
  data/sqlalchemy.md — N/A (not detected)

Skills support:
  /web-optimize    ✅ (perf-pivots-django.md ready)
  /data-optimize   ✅ (data-pivots-django-orm.md ready)
  /sc-python:audit ✅ (python/idioms.md will be loaded)

Gaps (no plugin pivot):
  (none)

Rule audit (.claude/rules/07-quality/):
  MISSING   perf-pivots-django.md
  OUTDATED  data-pivots-django-orm.md
  N/A       perf-pivots-fastapi.md (FastAPI not detected)
  N/A       data-pivots-sqlalchemy.md (SQLAlchemy not detected)

→ install-pivots will install 1 file, update 1 file.
```

Then proceed to `02-install-pivots`.
