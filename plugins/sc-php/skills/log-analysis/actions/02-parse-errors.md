# 02 - Parse errors

Extract and group PHP, Apache, and Nginx errors by severity and recurring message pattern.

## Inputs

- `env` (optional, default: auto-detect) — `local | docker | prod`
- `source` (optional, default: `php,apache-error`) — comma-separated alias(es)
- `since` (optional) — time filter: `1h`, `30m`, `2026-05-27`, ISO datetime

## Outputs

```
## [docker] PHP errors — /var/log/php_errors.log

| Severity    | Count | First seen  | Message (truncated 120 chars)             |
| ----------- | ----- | ----------- | ----------------------------------------- |
| Fatal error | 2     | 09:12:34    | Uncaught TypeError: ... in index.php      |
| Warning     | 7     | 09:05:10    | Undefined variable $x in index.php:84     |
| Notice      | 3     | 08:55:01    | Undefined index: action in index.php:12   |

Unique files: index.php

## [docker] Apache errors — /var/log/apache2/error.log

| Level  | Count | Message (truncated 120 chars)                            |
| ------ | ----- | -------------------------------------------------------- |
| error  | 2     | PHP Fatal error: ... in /var/www/html/index.php          |
```

## Process

1. Auto-detect `env` (same as `tail`). Resolve SSH target if `prod`.
2. For `docker`: discover containers via `docker ps` if needed.
3. Fetch log content per source, applying `since` filter if provided (see `references/log-formats.md` — Timestamp filtering):
   - `docker-*` sources with `since`: `docker logs --since <duration> <container>`
   - `docker-*` sources without `since`: `docker logs --tail 5000 <container>` (cap to avoid flooding)
   - File sources with `since ≥ 1 day`: Strategy A (date-prefix grep) from `references/log-formats.md`
   - File sources with `since < 1 day`: Strategy B (PHP one-liner) from `references/log-formats.md`
   - File sources without `since`: `docker exec <container> cat <path>` / `cat <path>` / `ssh <host> "cat <path>"`
4. PHP log: parse lines matching `^\[.+\] PHP (Fatal error|Parse error|Error|Warning|Notice|Deprecated)` (see `references/log-formats.md`).
   - Group by `(severity, normalized_message)` — strip line numbers and memory addresses.
   - Sort by count desc.
5. Apache/Nginx error log: parse lines by level (see `references/log-formats.md`).
   - Group by `(level, normalized_message)`.
6. Print grouped markdown tables per source.
7. List unique PHP source files for Fatal/Error entries.
8. If 0 errors: print `No errors found in <sources>` and stop.
9. Suggest `search` action with the top recurring error message to find surrounding context.

## Test

On a project with running Docker: `docker exec <php-container> grep -c "" /var/log/php_errors.log` exits 0 and returns a non-negative integer.
