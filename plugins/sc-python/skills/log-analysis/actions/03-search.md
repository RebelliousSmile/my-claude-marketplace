# 03 - Search

Search for a specific string, exception type, regex, or HTTP status code across Python log files.

## Inputs

- `pattern` (required) — plain string, exception class name, regex, or HTTP status code (e.g. `500`, `ValueError`, `POST /api/orders`)
- `env` (optional, default: auto-detect) — `local | docker | prod`
- `source` (optional, default: all sources for the env) — comma-separated alias(es)
- `since` (optional) — time filter: `1h`, `30m`, date

## Outputs

```
=== Search: "ValueError" in [docker] app ===
3 matches:

L847:  2026-05-27 09:12:34,123 ERROR orders.views ValueError: invalid literal for int() ...
L848:  Traceback (most recent call last):
L849:    File "/app/orders/views.py", line 45, in create_order
L850:    ...
L901:  2026-05-27 09:15:02,456 ERROR orders.views ValueError: invalid literal for int() ...

Total: 3 matches across 1 source.
```

## Process

1. Auto-detect `env`. Resolve SSH target if `prod`.
2. If `pattern` is a 3-digit 4xx/5xx status code, auto-include `web-server` (uvicorn/gunicorn) in sources.
3. If `pattern` is a Python exception class name (e.g. `ValueError`, `IntegrityError`), also search for the full traceback lines following each match.
4. Build the grep command:
   - Default mode: `grep -F` (fixed-string).
   - Regex mode: `grep -E` only when user says "regex" or pattern is clearly a regex.
   - Local: `grep -nF -- '<escaped>' <path>`
   - Docker: `docker exec <container> grep -nF -- '<escaped>' <path>`
   - Prod SSH — escape pattern to prevent shell injection:
     ```bash
     SAFE=$(printf '%s' '<pattern>' | sed "s/'/'\\\\''/g")
     ssh <host> "grep -nF -- '$SAFE' <path>"
     ```
5. If `since` provided: for docker stdout sources use `docker logs --since <duration> | grep -F`; for file sources apply timestamp filter first (see `references/log-formats.md`).
6. For exception searches: after finding the matching line, also include the next N lines forming the traceback (up to the next blank line or next log entry timestamp).
7. Print matches per source with line numbers under a labeled header.
8. Truncate non-traceback lines to 300 chars; keep tracebacks intact.
9. Report match count per source and grand total.
10. If 0 matches: suggest broader pattern or different `env`.
11. If matches include HTTP 5xx responses: offer to run `parse-errors` on same env.

## Test

Docker project: `docker exec <python-container> grep -c "" /app/logs/app.log` exits 0.
