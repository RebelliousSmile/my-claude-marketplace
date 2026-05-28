# Action 01 — scan

Detect project capabilities, map them to plugin rules, audit `.claude/rules/` to determine what is missing or outdated.

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

A project may match multiple (e.g. Django + FastAPI in a hybrid monorepo, though uncommon).

### Step 3 — Classify data layer

| Signal | Data layer |
|---|---|
| Django detected and `sqlalchemy` not present | Django ORM (implicitly bundled with Django) |
| `sqlalchemy` in any manifest | SQLAlchemy |

Note: if Django and SQLAlchemy are both detected, install both — the project may use Django ORM for some models and SQLAlchemy for raw queries.

### Step 4 — Map capabilities to rules

For each capability, evaluate the detection condition and determine the rule to install.

#### Perf pivots (consumed by `web-optimize`)

| Capability | Condition | Reference → Target |
|---|---|---|
| Django perf | Django detected | `references/07-perf-pivots-django.md` → `.claude/rules/07-quality/perf-pivots-django.md` |
| FastAPI perf | FastAPI detected | `references/07-perf-pivots-fastapi.md` → `.claude/rules/07-quality/perf-pivots-fastapi.md` |
| Flask perf | Flask detected | — no plugin rule (report as gap) |

#### Data pivots (consumed by `data-optimize`)

| Capability | Condition | Reference → Target |
|---|---|---|
| Django ORM | Django ORM detected | `references/08-data-pivots-django-orm.md` → `.claude/rules/07-quality/data-pivots-django-orm.md` |
| SQLAlchemy | SQLAlchemy detected | `references/08-data-pivots-sqlalchemy.md` → `.claude/rules/07-quality/data-pivots-sqlalchemy.md` |

### Step 5 — Status each rule

For each required rule, determine status:
- File does not exist → **MISSING**
- File exists, content matches plugin reference → **UP-TO-DATE**
- File exists, content differs from plugin reference → **OUTDATED**
- Condition not met → **NOT-APPLICABLE** (do not install, do not audit)

### Step 6 — Detect gaps

A **gap** is a capability that is detected but for which the plugin has no matching rule or skill.

Built-in gap: Flask has no dedicated perf pivot in this plugin version — always report it when Flask is detected.

Check: are there packages in manifests representing a capability not covered by any entry in Step 4?

Examples of gaps to report:
- `flask` detected — no Flask perf pivot in plugin
- `celery` detected — no task queue rule in plugin
- `alembic` detected — no migration rule in plugin

List all gaps explicitly in the output.

## Output

Emit a structured manifest for `02-sync`:

```
📊 sc-python sniff — capability scan

Framework:
  ✅ Django (django==4.2.0 from requirements.txt)
  ❌ FastAPI — not detected
  ❌ Flask — not detected

Data layer:
  ✅ Django ORM (bundled with Django)
  ❌ SQLAlchemy — not detected

Capabilities → rules:
  Perf (Django)     ✅ perf-pivots-django.md
  Perf (FastAPI)    — N/A (not detected)
  Data (Django ORM) ✅ data-pivots-django-orm.md
  Data (SQLAlchemy) — N/A (not detected)

Skills support:
  /web-optimize  ✅ (perf-pivots-django.md ready)
  /data-optimize ✅ (data-pivots-django-orm.md ready)

Gaps (no plugin rule):
  (none)

Rule audit:
  MISSING        .claude/rules/07-quality/perf-pivots-django.md
  OUTDATED       .claude/rules/07-quality/data-pivots-django-orm.md
  NOT-APPLICABLE perf-pivots-fastapi.md (FastAPI not detected)
  NOT-APPLICABLE data-pivots-sqlalchemy.md (SQLAlchemy not detected)

→ sync will install 1 file, update 1 file.
```

Then proceed to action `02-sync`.
