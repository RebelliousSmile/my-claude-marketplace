---
name: sniff
model: sonnet
description: >-
  Detects the PHP stack in the current project and synchronizes .claude/rules/
  with the matching sc-php pivots. Use when you want to install only the pivots
  that match the actual stack (Laravel, Symfony, WordPress, HTMX), or to refresh
  outdated rules after a plugin update. Reads composer.json, artisan, bin/console,
  wp-config.php to classify the stack, then diffs installed rules against plugin
  references and applies only what changed.
  Prefer sniff over setup on already-configured projects.
  Do NOT use to update a single rule manually — edit it directly instead.
---

# sc-php Sniff

Scans the current project, detects which PHP frameworks and ORMs are in use, then installs or updates only the matching perf/data pivot rules in `.claude/rules/`. Unlike `setup` (which installs everything), sniff is selective: it writes only the rules relevant to what was actually detected.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `scan` | Detect PHP stack and audit installed rules | current project path |
| 02 | `sync` | Install missing rules, update outdated ones | scan manifest |

## Default flow

Always sequential: `scan` → `sync`.

1. `scan` reads manifests, classifies the stack, audits `.claude/rules/`, emits a structured manifest
2. `sync` reads the manifest and writes/updates only the files that need it

Never skip `sync` if `scan` reports missing or outdated rules.

## Transversal rules

- Never install a pivot for a framework not detected in the project.
- Compare installed rule content against the plugin reference before updating — skip files already identical.
- Report every file written, updated, or skipped.
- If no PHP manifest is found (`composer.json` absent and none of the sentinel files present), abort with an explicit message instead of guessing.
