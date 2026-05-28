---
name: sniff
model: sonnet
description: >-
  PHP stack detector for PHP projects. Reads composer.json and sentinel files
  (artisan, bin/console, wp-config.php) to detect the framework (Laravel,
  Symfony, WordPress), data layer (Eloquent, Doctrine), frontend bridge (HTMX),
  and testing harness (Bruno). Uses a two-tier model: capability pivots (SOLID,
  Bruno) are loaded at audit time by /sc-php:audit and never written to disk;
  perf pivots (for web-optimize) and data pivots (for data-optimize) are
  installed selectively to .claude/rules/07-quality/. Emits a pivot manifeste
  for use by /sc-php:audit. Reports gaps when a capability is detected but no
  matching plugin pivot exists. Prefer sniff over setup on already-configured
  projects.
---

# sc-php Sniff

PHP stack detector and pivot manifeste producer.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `scan` | Detect capabilities, emit pivot manifeste, map perf/data install targets | current project path |
| 02 | `install-pivots` | Install perf/data pivots to `.claude/rules/07-quality/` | scan pivot manifeste |

## Default flow

Sequential: `scan` → `install-pivots`.

## Conceptual model

- A **capability** is something the app does: use SOLID patterns, test with Bruno, serve HTTP via a framework, query a database via an ORM, render lightweight HTML via HTMX, etc.
- A **pivot** is the PHP knowledge for the chosen solution (e.g. Laravel perf patterns, Eloquent query conventions)
- Capability pivots live in the plugin (`skills/sniff/references/capabilities/`) — they are loaded at audit time by `/sc-php:audit`, not installed to the project
- **Perf pivots** and **data pivots** are the exception: they ARE written to `.claude/rules/07-quality/` because `web-optimize` and `data-optimize` read them from there

## Transversal rules

- If no PHP manifest is found (`composer.json` absent and none of the sentinel files present), abort with an explicit message.
- Never install a capability pivot to `.claude/rules/` — those are loaded on demand at audit time.
- Never install a perf pivot for a framework not detected.
- Never install a data pivot for an ORM not detected.
- Compare installed pivot content against the plugin reference before updating — skip files already identical.
- Report every file written, updated, or skipped.
- Report gaps: capabilities detected but no matching plugin pivot exists.
