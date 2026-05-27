---
name: setup
model: sonnet
description: >-
  Installs PHP ecosystem perf and data pivots to the current project's
  .claude/rules/. Use when starting a PHP project (Laravel, Symfony, WordPress)
  or when PHP-specific perf/data rules are missing. Covers: Laravel optimization
  (Eloquent N+1, Vite integration, Octane, Horizon), Symfony (Doctrine, OPcache,
  preloading), WordPress (autoload bloat, transient API, REST API caching), HTMX
  hybrid patterns, Eloquent ORM pivots, Doctrine ORM pivots.
  Do NOT use to update a single rule — edit it directly instead.
  Prefer /sc-php:sniff on already-configured projects (detects stack, installs only relevant rules, updates outdated ones).
---

# sc-php Setup

Installs the full set of PHP perf and data pivot rules to `.claude/rules/` in the current project. Each rule file is written verbatim from the plugin's references.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `install` | Write all PHP perf/data pivot files to `.claude/rules/` | current project path |

## Default flow

Single action. Any invocation of `/sc-php:setup` triggers `install`.

## Companion skill

- `/sc-php:sniff` — detects the actual PHP stack, then installs/updates only the matching pivots. Use instead of `setup` on projects that are already partially configured.

## References

### Perf pivots (consumed by `web-optimize`)

- `references/07-perf-pivots-laravel.md` — Laravel (Vite, Octane, Horizon, queues)
- `references/07-perf-pivots-symfony.md` — Symfony (OPcache, preloading, HttpCache, Messenger)
- `references/07-perf-pivots-wordpress.md` — WordPress (autoload bloat, object cache, REST)
- `references/07-perf-pivots-htmx.md` — HTMX hybrid (PHP/Python backend SSR + HTMX swaps)

### Data pivots (consumed by `data-optimize`)

- `references/08-data-pivots-eloquent.md` — Eloquent ORM (Laravel)
- `references/08-data-pivots-doctrine.md` — Doctrine ORM (Symfony / Laravel)

## Transversal rules

- Write files atomically — do not skip any rule.
- Preserve frontmatter (paths: globs) verbatim from each reference file.
- If a target file already exists, overwrite it without confirmation.
- Report each written file path at the end.
