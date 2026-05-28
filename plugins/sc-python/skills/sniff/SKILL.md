---
name: sniff
model: sonnet
description: >-
  Capability mapper for Python projects. Reads requirements.txt, pyproject.toml,
  setup.py, Pipfile, and sentinel files (manage.py) to detect the framework
  (Django, FastAPI, Flask) and ORM (Django ORM, SQLAlchemy). For each detected
  capability, installs the matching coding rule from the plugin — only if a rule
  exists. Perf pivots (consumed by web-optimize) and data pivots (consumed by
  data-optimize) are installed selectively. Reports gaps when a capability is
  detected but no matching plugin rule exists.
  Prefer sniff over setup on already-configured projects.
  Do NOT use to update a single rule manually — edit it directly instead.
---

# sc-python Sniff

Capability mapper. Detects what the Python project DOES, then installs the matching rules from the plugin — only for what is detected, only when a rule exists.

Unlike `setup` (which installs all rules unconditionally), sniff is selective: it maps detected capabilities to available rules and reports gaps when no matching skill covers a capability.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `scan` | Detect capabilities, map to rules, audit installed rules | current project path |
| 02 | `sync` | Install missing rules, update outdated ones | scan manifest |

## Default flow

Always sequential: `scan` → `sync`.

1. `scan` reads manifests and sentinel files, detects framework/ORM/capabilities, maps to plugin rules, audits `.claude/rules/`, emits a structured manifest
2. `sync` reads the manifest and writes/updates only the files that need it

Never skip `sync` if `scan` reports missing or outdated rules.

## Conceptual model

Capabilities → rules → skills:

- A **capability** is something the app does: serve HTTP via Django or FastAPI, query the database via an ORM, etc.
- A **rule** is the coding knowledge for the chosen solution (Django vs FastAPI)
- A **skill** (`web-optimize`, `data-optimize`) consumes perf/data pivots to act on the project

sniff installs rules for detected capabilities. It does NOT install rules for capabilities the project doesn't have.

## Transversal rules

- If no Python manifest is found (no `requirements.txt`, `pyproject.toml`, `setup.py`, or `Pipfile`), abort with an explicit message.
- Never install a rule for a capability not detected in the project.
- Never install a perf pivot for a framework not detected.
- Never install a data pivot for an ORM not detected.
- Compare installed rule content against the plugin reference before updating — skip files already identical.
- Report every file written, updated, or skipped.
- Report gaps: capabilities detected but no matching plugin rule exists.
