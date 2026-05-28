# Action 01 — audit

Orchestrate a Python code quality review: detect applicable pivots, load them from the plugin, and delegate analysis to `aidd-dev:reviewer`.

## Transversal rules

- Invoke `01-scan` only — never `02-install-pivots`. Audit is read-only.
- Never install any file to `.claude/rules/` or any project path.
- All knowledge is read from `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/` at runtime.

## Process

### Step 1 — Detect stack (invoke 01-scan only)

Run sniff `01-scan` on the project to detect the stack and obtain the pivot manifeste.

**Important**: invoke `01-scan` only — do not invoke `02-install-pivots`. Audit never triggers side effects.

If no Python manifest is found, abort with:
```
❌ sc-python audit — no Python project detected. Run from the project root.
```

### Step 2 — Load capability pivots

Always load `python/idioms.md` (applies to all Python projects). For each additional capability in the manifeste, load the corresponding pivot:

```
${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/<pivot-path>
```

Collect all loaded pivot contents into an acceptance criteria document:

```
Python Code Quality Criteria — sc-python 0.4.0

## Python idioms and best practices
<content of python/idioms.md>

## Django ORM conventions   (only if data/django-orm.md was in the manifeste)
<content of data/django-orm.md>

[...additional capability pivots from manifeste...]
```

### Step 3 — Identify review targets

From the `01-scan` output, identify Python source directories:
- Django: subdirectory containing `views.py`, `models.py`, or `apps.py`; exclude `migrations/`
- FastAPI: `routers/`, `api/`, `endpoints/`, or the directory containing `main.py`
- Generic: all `*.py` files at project root level; exclude `migrations/`, `venv/`, `.venv/`, `tests/`

These form the `review_target` for the reviewer agent.

### Step 4 — Delegate to aidd-dev:reviewer

Spawn an Agent with `subagent_type: aidd-dev:reviewer`, passing:

- `review_target`: the Python source files/directories identified in Step 3
- `agreed_plan`: the aggregated Python criteria document built in Step 2

### Step 5 — Present results

Display the reviewer's report. If `completion_score < 100`, note which criteria were not fully verified and suggest a follow-up targeted review.

## Output format

```
🔍 sc-python audit — Python code quality review

Stack detected: Django + Django ORM

Pivots loaded (2):
  python/idioms.md
  data/django-orm.md

Review scope: myapp/views.py, myapp/models.py, myapp/services/

→ Delegating to aidd-dev:reviewer...

[reviewer report here]
```
