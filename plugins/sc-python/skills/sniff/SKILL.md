---
name: sniff
model: sonnet
description: >-
  Detects the Python stack in the current project and synchronizes .claude/rules/
  with the matching sc-python pivots. Reads requirements.txt, pyproject.toml,
  setup.py, Pipfile, and sentinel files (manage.py) to classify the framework
  (Django, FastAPI, Flask) and ORM (Django ORM, SQLAlchemy). Installs only the
  pivots relevant to what was detected, and updates existing rules that differ
  from the plugin references.
  Prefer sniff over setup on already-configured projects.
  Do NOT use to update a single rule manually — edit it directly instead.
---

# sc-python Sniff

Scans the current project, detects which Python frameworks and ORMs are in use, then installs or updates only the matching perf/data pivot rules in `.claude/rules/`. Unlike `setup` (which installs everything), sniff is selective: it writes only the rules relevant to what was actually detected.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `scan` | Detect Python stack and audit installed rules | current project path |
| 02 | `sync` | Install missing rules, update outdated ones | scan manifest |

## Default flow

Always sequential: `scan` → `sync`.

1. `scan` reads manifests and sentinel files, classifies the stack, audits `.claude/rules/`, emits a structured manifest
2. `sync` reads the manifest and writes/updates only the files that need it

Never skip `sync` if `scan` reports missing or outdated rules.

## Transversal rules

- Never install a pivot for a framework not detected in the project.
- Compare installed rule content against the plugin reference before updating — skip files already identical.
- Report every file written, updated, or skipped.
- If no Python manifest is found (no `requirements.txt`, `pyproject.toml`, `setup.py`, or `Pipfile`), abort with an explicit message instead of guessing.
