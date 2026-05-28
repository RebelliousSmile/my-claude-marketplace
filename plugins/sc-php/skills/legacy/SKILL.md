---
name: legacy
description: >-
  Scans PHP code for version-specific and deprecated patterns, then proposes an
  upgrade (toward PHP 8+) or a downgrade (to a target PHP version for hosting
  compatibility). Handles deprecated functions (mysql_*, ereg_*, create_function,
  each), missing PHP 8+ features (enums, readonly, match, named args, null safe),
  and framework version migrations (Laravel, Symfony).
  Use when the user says "modernize", "upgrade to PHP 8", "this is old PHP",
  "downgrade for PHP 7.4", "migrate to Laravel 11", or when deprecated functions
  appear in the codebase.
  Do NOT use for dependency management (Composer), performance optimization
  (web-optimize), or general refactoring unrelated to PHP version compatibility.
---

# sc-php Legacy

Detects version-specific and deprecated patterns in the PHP codebase, then produces a migration plan and applies changes file by file — either upgrading to modern PHP or downgrading to a target version for compatibility.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `scan` | Detect legacy patterns and version gaps | path, target PHP version |
| 02 | `migrate` | Apply upgrade or downgrade transformations | scan manifest, direction |

## Default flow

Always sequential: `scan` → `migrate`.

1. `scan` reads `composer.json`, detects current and target PHP versions, finds deprecated/missing patterns, emits a structured manifest
2. `migrate` reads the manifest and applies transformations file by file

## Transversal rules

- Always detect the current PHP version from `composer.json` or Dockerfile before scanning.
- Never remove a working pattern without providing its replacement inline.
- For breaking changes: show a diff of what will change and ask for confirmation before writing.
- Downgrade migrations: never remove a feature without confirming the target version actually lacks it.
- Framework-specific patterns (Laravel, Symfony): check composer.json for framework version before applying framework-level migrations.
- Never touch files under `vendor/`.
