---
name: sniff
model: sonnet
description: >-
  Python stack detector. Reads requirements.txt, pyproject.toml, setup.py,
  Pipfile, and sentinel files (manage.py) to detect the framework (Django,
  FastAPI, Flask), ORM (Django ORM, SQLAlchemy), and capabilities including
  ActivityPub federation (activitypub/ module + httpx + cryptography). Uses a
  three-tier model: capability pivots (Python idioms) are loaded at audit time
  by /sc-python:audit and never written to disk; perf pivots (for web-optimize),
  data pivots (for data-optimize), and AP pivots (for ap-optimize) are installed
  selectively to .claude/rules/07-quality/. Emits a pivot manifeste for use by
  /sc-python:audit. Reports gaps when a capability is detected but no matching
  plugin pivot exists.
  Do NOT use to update a single rule manually — edit it directly instead.
---

# sc-python Sniff

Python stack detector and pivot manifeste producer.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `scan` | Detect capabilities, emit pivot manifeste, map perf/data/ap install targets | current project path |
| 02 | `install-pivots` | Install perf/data/ap pivots to `.claude/rules/07-quality/` | scan pivot manifeste |

## Default flow

Sequential: `scan` → `install-pivots`.

## Conceptual model

- A **capability** is something the app does: serve HTTP via Django or FastAPI, query the database via an ORM, federate via ActivityPub, etc.
- A **pivot** is the Python knowledge for the chosen solution (e.g. Django perf patterns, SQLAlchemy query conventions, AP delivery patterns)
- Capability pivots live in the plugin (`skills/sniff/references/capabilities/`) — they are loaded at audit time by `/sc-python:audit`, not installed to the project
- **Perf pivots**, **data pivots**, and **AP pivots** are the exception: they ARE written to `.claude/rules/07-quality/` because `web-optimize`, `data-optimize`, and `ap-optimize` read them from there

## Detection — ActivityPub

Detect AP federation when ALL of the following are true:
- An `activitypub/` app directory exists in the project
- `httpx` is present in deps (outbound delivery)
- `cryptography` is present in deps (HTTP signatures)

Install target: `ap-pivots-django-activitypub.md` → `.claude/rules/07-quality/`
Source: `references/capabilities/ap/django-activitypub.md`

## Transversal rules

- If no Python manifest is found (no `requirements.txt`, `pyproject.toml`, `setup.py`, `Pipfile`, or `manage.py`), abort with an explicit message.
- Never install a capability pivot to `.claude/rules/` — those are loaded on demand at audit time.
- Never install a perf pivot for a framework not detected.
- Never install a data pivot for an ORM not detected.
- Never install an AP pivot unless ALL three AP detection signals are present.
- Compare installed pivot content against the plugin reference before updating — skip files already identical.
- Report every file written, updated, or skipped.
- Report gaps: capabilities detected but no matching plugin pivot exists.
