# Action 01 — scan

Detect version-specific and deprecated patterns in the PHP codebase. Emit a structured manifest for `02-migrate`.

## Inputs

- `path` (optional, default: project root) — directory to scan
- `target` (optional) — target PHP version (e.g. `8.3`) or `"modernize"` (latest stable)
- `direction` (optional) — `upgrade` | `downgrade` (inferred from context if omitted)

## Process

### Step 1 — Detect current PHP version

1. Read `composer.json` → `require.php` constraint (e.g. `^7.4`, `>=8.0`)
2. Check `Dockerfile` or `docker-compose.yml` for `FROM php:X.X`
3. Check `.php-version` or `.tool-versions`
4. If still unknown: assume PHP 7.4 and note the assumption in output

### Step 2 — Determine direction and target

- If user said "upgrade" or "modernize" or target > current: `direction = upgrade`, `target = 8.3` (or user value)
- If user said "downgrade" or "compat" or target < current: `direction = downgrade`, ask for target version if not provided
- If direction still unknown: ask the user before scanning

### Step 3 — Scan deprecated and version-specific patterns

Grep the source files (`.php`) under `path`. Exclude `vendor/`.

#### Removed/deprecated across PHP versions

| Pattern | Signal | Removed in | Replacement |
|---|---|---|---|
| `mysql_*()` | `mysql_connect\|mysql_query\|mysql_fetch` | PHP 7.0 | PDO or MySQLi |
| `ereg_*()` | `ereg\b\|eregi\b\|ereg_replace` | PHP 7.0 | `preg_*()` |
| `create_function()` | `create_function(` | PHP 8.0 | Anonymous function |
| `each()` | `each(` | PHP 8.0 | `foreach` |
| `__autoload()` | `function __autoload(` | PHP 8.0 | `spl_autoload_register()` |
| Short open tags | `^<\?[^=p]` | Config-deprecated | `<?php` |
| `$HTTP_*_VARS` | `\$HTTP_(POST\|GET\|SERVER)_VARS` | PHP 5.4 | `$_POST`, `$_GET`, etc. |
| `split()` | `\bsplit(` | PHP 7.0 | `explode()` or `preg_split()` |
| Null args to string functions | Triggers Deprecated in 8.1 | PHP 8.1 | Explicit `''` |
| `${var}` string interpolation | `"\${[^}]+}"` | PHP 8.2 | `"{$var}"` |

#### PHP 8+ upgrade opportunities (upgrade direction only)

| Feature | Detection heuristic | Since |
|---|---|---|
| Named arguments | Multiple params same type, no names in calls | 8.0 |
| Match expression | `switch` with `===` and `return`/`break` per case | 8.0 |
| Null safe operator | `if ($x !== null) { $x->method() }` pattern | 8.0 |
| Constructor promotion | `__construct` assigns all params to same-name props | 8.0 |
| Union types | `@param int\|string` docblock, no native type | 8.0 |
| Readonly properties | Property only assigned in constructor | 8.1 |
| Enums | Class constants acting as enum values | 8.1 |
| First class callables | `fn($x) => fn($x)` single-expression wrappers | 8.1 |
| Array unpacking with string keys | Not yet available — note as gap | 8.1 |
| Fibers | Coroutine-style patterns via Generators | 8.1 |

#### PHP 7.x downgrade targets (downgrade direction only)

| Feature to remove | Detection | Target |
|---|---|---|
| Named arguments `fn(name: val)` | `:` before `)` in function calls | < 8.0 |
| `match(` expression | `\bmatch\s*\(` | < 8.0 |
| Null safe `?->` | `\?\->` | < 8.0 |
| Constructor promotion | `public\|protected\|private` in constructor params | < 8.0 |
| Readonly props | `\breadonly\b` | < 8.1 |
| Enums | `^\s*enum\s` | < 8.1 |

### Step 4 — Detect framework version gaps (if detected)

If Laravel detected: check `laravel/framework` version and note patterns removed between detected and target major version.
If Symfony detected: check `symfony/framework-bundle` version and note patterns removed between detected and target major version.

### Step 5 — Output manifest

```
📊 sc-php legacy — scan results

Current PHP: 7.4 (from composer.json)
Target: 8.3 (upgrade)

Deprecated patterns found:
  CRITICAL  create_function() — 3 occurrences (removed PHP 8.0)
             src/Legacy/OldHelper.php:12, :45, :89
  CRITICAL  mysql_connect() — 1 occurrence (removed PHP 7.0)
             src/db.php:5
  WARN      Short open tags — 2 files
             templates/old.php, templates/header.php

Upgrade opportunities:
  MEDIUM    Match expression — 4 switch blocks qualify
             src/Controller/OrderController.php:34, :89
             src/Service/PricingService.php:12
  MEDIUM    Constructor promotion — 6 classes qualify
  LOW       Readonly properties — 3 properties qualify
  LOW       Enums — 2 constant groups qualify

→ migrate will modify 6 files (critical first).
```

Then proceed to `02-migrate`.
