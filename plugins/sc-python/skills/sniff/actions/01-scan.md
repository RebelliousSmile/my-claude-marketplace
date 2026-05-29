# Action 01 — scan

> **OUTPUT FORMAT — read this first, before any processing:**
>
> **ALL TABLES ARE FORBIDDEN** — no markdown tables (`| col |`), no ASCII box-drawing tables (`┌───┐`), no grid layouts of any kind. Use ONLY `✅ / ❌` indented lines as shown in the template below.
>
> **Section names are fixed** — copy them exactly from the template. Do NOT invent names like "Stack détectée", "Pivots à installer", "Capabilities", or any other label not present in the template.
>
> **DEPRECATED — DO NOT use:**
> - `Skills support:` → replaced by `→ /skill :` readiness lines inside each pivot subsection
> - `Gaps (no plugin pivot):` / `Gaps (capabilities sans pivot plugin):` → replaced by `Gaps — capability (pivot candidates):` and `Gaps — tooling / infra (no pivot expected):`
> - Flat pivot lines without `→ source → target   STATUS` → use the status format shown in the template

## Output format (reference template — use EXACTLY this structure)

```
📊 sc-python sniff — pivot manifeste

Source: pyproject.toml (project-name vX.Y.Z, Python >=3.10)

Framework:
  ✅ Django (django==4.2.0)
  ❌ FastAPI — not detected
  ❌ Flask — not detected

Data layer:
  ✅ Django ORM (bundled with Django)
  ❌ SQLAlchemy — not detected

Pivot manifeste:
  Capability pivots (loaded at audit time, not installed):
    ✅ python/idioms.md  (every Python project)
  → /sc-python:audit : PRÊT

  Perf pivots → .claude/rules/07-quality/:
    perf/django.md → perf-pivots-django.md   MISSING
    perf/fastapi.md                          NOT-APPLICABLE
    perf/httpx.md                            NOT-APPLICABLE
  → /web-optimize : PRÊT (will be installed)

  Data pivots → .claude/rules/07-quality/:
    data/django-orm.md → data-pivots-django-orm.md   MISSING
    data/sqlalchemy.md                               NOT-APPLICABLE
    data/datasets.md                                 NOT-APPLICABLE
  → /data-optimize : PRÊT (will be installed)

  Protocol pivots → .claude/rules/07-quality/:
    protocol/activitypub-django.md → ap-pivots-django-activitypub.md   MISSING
  → /ap-optimize : PRÊT (will be installed)

Gaps — capability (pivot candidates):
  (none)

Gaps — tooling / infra (no pivot expected):
  pytest + pytest-asyncio (testing)

→ Proceed to 02-install-pivots.
```

**Example — FastAPI (optional) + spaCy + datasets + httpx, no ORM:**
```
📊 sc-python sniff — pivot manifeste

Source: pyproject.toml (project-name v0.1.0, Python >=3.10)

Framework:
  ❌ Django — not detected
  ✅ FastAPI (fastapi>=0.115 from optional-dependencies.gateway)
  ❌ Flask — not detected

Data layer:
  ❌ Django ORM — not detected
  ❌ SQLAlchemy — not detected

Pivot manifeste:
  Capability pivots (loaded at audit time, not installed):
    ✅ python/idioms.md  (every Python project)
    ✅ python/spacy.md   (spacy detected)
  → /sc-python:audit : PRÊT

  Perf pivots → .claude/rules/07-quality/:
    perf/fastapi.md → perf-pivots-fastapi.md   UP-TO-DATE
    perf/httpx.md   → perf-pivots-httpx.md     MISSING
    perf/django.md                             NOT-APPLICABLE
  → /web-optimize : PRÊT (1 to install)

  Data pivots → .claude/rules/07-quality/:
    data/datasets.md → data-pivots-datasets.md   MISSING
    data/django-orm.md                           NOT-APPLICABLE
    data/sqlalchemy.md                           NOT-APPLICABLE
  → /data-optimize : PRÊT (will be installed)

Gaps — capability (pivot candidates):
  playwright + beautifulsoup4 — scraping, no pivot
  gradio — UI framework, no pivot

Gaps — tooling / infra (no pivot expected):
  pytest (testing)

→ Proceed to 02-install-pivots.
```

**Closing summary constraint:** If a free-text summary is emitted after the structured output, it must not contradict the manifeste. Only bucket-A capability gaps may be called gaps in prose.

---

## Process

Detect project capabilities, map them to plugin pivots, and emit the pivot manifeste above for `02-install-pivots` and `/sc-python:audit`.

### Step 1 — Read project manifests

Check for the following files (try each in order):

1. `requirements.txt` — parse package names and versions
2. `pyproject.toml` — parse:
   - `[project.dependencies]`
   - `[project.optional-dependencies.*]` (all extras groups)
   - `[tool.poetry.dependencies]`
   - `[tool.poetry.group.*.dependencies]` (all dependency groups)
3. `setup.py` — parse `install_requires` (heuristic, regex on `install_requires=[...]`)
4. `Pipfile` — parse `[packages]` section
5. `manage.py` — presence alone means Django even without manifest

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
| `fastapi` in any manifest (including optional-dependencies groups) | FastAPI |
| `flask` in any manifest | Flask |

A project may match multiple (e.g. Django + FastAPI in a hybrid monorepo).

### Step 3 — Detect protocol implementations

Check for ActivityPub signals (in order):

1. `activitypub/` directory present at project root or as a Django app subdirectory
2. Files named `inbox.py`, `delivery.py`, `activities.py` inside any subdirectory
3. `cryptography` AND `httpx` both present in the manifest (strong co-signal with Django)

If Django is detected AND any AP signal is found → mark **Django ActivityPub** detected.

### Step 3b — Classify data layer

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
| spaCy NLP | `spacy` in any manifest | `python/spacy.md` |

#### Perf pivots (installed to `.claude/rules/07-quality/`)

| Capability | Condition | Source → Target |
|---|---|---|
| Django perf | Django detected | `references/capabilities/perf/django.md` → `.claude/rules/07-quality/perf-pivots-django.md` |
| DRF perf | `djangorestframework` in any manifest | `references/capabilities/perf/drf.md` → `.claude/rules/07-quality/perf-pivots-drf.md` |
| Celery perf | `celery` in any manifest | `references/capabilities/perf/celery.md` → `.claude/rules/07-quality/perf-pivots-celery.md` |
| FastAPI perf | FastAPI detected | `references/capabilities/perf/fastapi.md` → `.claude/rules/07-quality/perf-pivots-fastapi.md` |
| httpx client | `httpx` in any manifest | `references/capabilities/perf/httpx.md` → `.claude/rules/07-quality/perf-pivots-httpx.md` |
| Flask perf | Flask detected | — no pivot (built-in gap) |

#### Data pivots (installed to `.claude/rules/07-quality/`)

| Capability | Condition | Source → Target |
|---|---|---|
| Django ORM | Django ORM detected | `references/capabilities/data/django-orm.md` → `.claude/rules/07-quality/data-pivots-django-orm.md` |
| SQLAlchemy | SQLAlchemy detected | `references/capabilities/data/sqlalchemy.md` → `.claude/rules/07-quality/data-pivots-sqlalchemy.md` |
| HuggingFace datasets | `datasets` in any manifest | `references/capabilities/data/datasets.md` → `.claude/rules/07-quality/data-pivots-datasets.md` |

#### Protocol pivots (installed to `.claude/rules/07-quality/`)

Loaded by `/ap-optimize` — not by `web-optimize` or `data-optimize`.

| Capability | Condition | Source → Target |
|---|---|---|
| ActivityPub / Django | Django detected AND (`activitypub/` directory OR `inbox.py`/`delivery.py` present) | `references/capabilities/protocol/activitypub-django.md` → `.claude/rules/07-quality/ap-pivots-django-activitypub.md` |

### Step 5 — Status each perf/data pivot

For each required pivot, determine status:
- File does not exist → **MISSING**
- File exists, content matches plugin reference → **UP-TO-DATE**
- File exists, content differs from plugin reference → **OUTDATED**
- Condition not met → **NOT-APPLICABLE**

Capability pivots are never statused — they are not installed to disk.

### Step 6 — Detect gaps

A **gap** is a capability detected but for which the plugin has no matching pivot. Sort into two buckets:

#### Bucket A — Capability gaps (pivot candidates)

Packages representing an application capability the plugin could cover with a future pivot: task queues, migrations, auth, caching, serialization, WebSocket, NLP, scraping, ML, etc. List every one explicitly. Built-in gap: Flask always appears here when detected.

Examples:
- `flask` — no Flask perf pivot in this plugin version
- `celery` / `arq` / `dramatiq` — task queue, no pivot
- `alembic` — migrations, no pivot
- `transformers` / `torch` / `tensorflow` — ML training/inference, no pivot
- `playwright` / `beautifulsoup4` — scraping, no pivot
- `Pillow` — image processing, no pivot

#### Bucket B — Tooling / infra (no pivot expected)

Test runners, linters, formatters, env loaders. Report grouped and condensed (one line per family). Never expand into one line per package.

**Companion packages — not gaps.** Drop packages that are companions of a covered pivot:
- `uvicorn`, `gunicorn` — covered by FastAPI perf pivot
- `pydantic-settings` — covered by FastAPI perf pivot
- `psycopg2`, `asyncpg` — covered by SQLAlchemy or FastAPI perf pivot
- `respx`, `tenacity` — covered by httpx perf pivot
- `huggingface_hub`, `tokenizers` — covered by datasets data pivot
- `fr-core-news-*`, `en-core-web-*` (spaCy language models) — covered by spaCy capability pivot
- `drf-spectacular`, `drf-extensions`, `djangorestframework-simplejwt` — covered by DRF perf pivot
- `django-celery-beat`, `kombu`, `celery[redis]` — covered by Celery perf pivot

Then proceed to `02-install-pivots`.
