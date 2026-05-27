---
name: setup
model: sonnet
description: >-
  Installs Python ecosystem perf and data pivots to the current project's
  .claude/rules/. Use when starting a Python web project (Django, FastAPI,
  Flask) or when Python-specific perf/data rules are missing. Covers: Django
  template caching, middleware budget, debug toolbar, FastAPI async patterns,
  Django ORM (select_related, prefetch_related, N+1), SQLAlchemy.
  Do NOT use to update a single rule — edit it directly instead.
  Prefer /sc-python:sniff on already-configured projects (detects stack, installs only relevant rules, updates outdated ones).
---

# sc-python Setup

Installs the full set of Python perf and data pivot rules to `.claude/rules/` in the current project. Each rule file is written verbatim from the plugin's references.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `install` | Write all Python perf/data pivot files to `.claude/rules/` | current project path |

## Default flow

Single action. Any invocation of `/sc-python:setup` triggers `install`.

## Companion skill

- `/sc-python:sniff` — detects Django/FastAPI/Flask and ORMs, then installs/updates only the matching pivots. Use instead of `setup` on projects that are already partially configured.

## References

### Perf pivots (consumed by `web-optimize`)

- `references/07-perf-pivots-django.md` — Django (templates, middleware, ASGI/WSGI, cache framework)
- `references/07-perf-pivots-fastapi.md` — FastAPI (async, Pydantic v2, BackgroundTasks)

### Data pivots (consumed by `data-optimize`)

- `references/08-data-pivots-django-orm.md` — Django ORM (select_related, prefetch_related, N+1)
- `references/08-data-pivots-sqlalchemy.md` — SQLAlchemy (async, eager loading, sessions)

## Transversal rules

- Write files atomically — do not skip any rule.
- Preserve frontmatter (paths: globs) verbatim from each reference file.
- If a target file already exists, overwrite it without confirmation.
- Report each written file path at the end.
