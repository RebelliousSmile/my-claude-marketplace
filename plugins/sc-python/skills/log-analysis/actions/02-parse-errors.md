# 02 - Parse errors

Extract and group Python exceptions, Django/FastAPI errors, and HTTP 5xx responses.

## Inputs

- `env` (optional, default: auto-detect) — `local | docker | prod`
- `source` (optional, default: `app,web-server`) — comma-separated alias(es)
- `since` (optional) — time filter: `1h`, `30m`, `2026-05-27`, ISO datetime

## Outputs

```
## [docker] App log — /app/logs/app.log

| Level    | Count | First seen | Exception / Message (truncated 120 chars)       |
| -------- | ----- | ---------- | ----------------------------------------------- |
| ERROR    | 3     | 09:12:34   | ValueError: invalid literal for int() — views.py:45 |
| CRITICAL | 1     | 09:05:10   | IntegrityError: UNIQUE constraint failed — models.py |
| WARNING  | 8     | 08:55:01   | Slow query detected (2.3s) — db/utils.py:89     |

Unique source files: orders/views.py, orders/models.py

## [docker] uvicorn — stdout

| Status | Count | Path                    |
| ------ | ----- | ----------------------- |
| 500    | 3     | POST /api/orders/       |
| 422    | 5     | POST /api/orders/       |
```

## Process

1. Auto-detect `env`. Resolve SSH target if `prod`.
2. Fetch log content per source, applying `since` filter if provided (see `references/log-formats.md` — Timestamp filtering).
3. **Python/Django log** — detect format (plain logging, structlog JSON, Django request logger):
   - Parse lines matching `\d{4}-\d{2}-\d{2}.*\s(ERROR|CRITICAL|WARNING|INFO)` (standard logging).
   - For structlog JSON: parse NDJSON, group by `level` field.
   - Collect multiline tracebacks: group consecutive lines starting with `Traceback (most recent call last):` through the final `ExceptionType: message` line.
   - Group by `(level, normalized_exception_message)` — strip file line numbers and memory addresses.
   - Sort by count desc.
4. **Django request logger** — parse `django.request` WARNING/ERROR entries for 4xx/5xx.
5. **Web server access log** (uvicorn/gunicorn Combined-format):
   - Extract HTTP status codes (field 9 in Combined Log Format).
   - Count 5xx, 4xx; group 5xx by path.
6. Print grouped markdown tables per source.
7. List unique Python source files for ERROR/CRITICAL entries.
8. If 0 errors: print `No errors found in <sources>` and stop.
9. Suggest `search` action with the top recurring exception class to find surrounding context.

## Test

Fetch the last 100 lines from the app log; assert output contains "App log" section with numeric counts ≥ 0.
