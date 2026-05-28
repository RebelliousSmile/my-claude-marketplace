# 04 - Summarize

Produce a period digest across all Python log sources: error counts by level, top recurring exceptions, HTTP status distribution.

## Inputs

- `env` (optional, default: auto-detect) — `local | docker | prod`
- `since` (optional, default: `24h`) — time filter

## Outputs

```
## Log summary — [docker] — last 24h

### App log (Python logging / structlog)
- Total entries: 3,412
- ERROR: 12  ·  CRITICAL: 1  ·  WARNING: 45  ·  INFO: 3,354
- Top exception: "ValueError: invalid literal for int()" × 8 (orders/views.py)
- Top warning: "Slow query detected" × 23

### Web server (uvicorn)
- Total requests: 1,847
- 5xx: 12 (0.6%)  ·  4xx: 89 (4.8%)  ·  2xx: 1,746 (94.5%)
- Top 5xx path: POST /api/orders/ × 8

### Celery (if detected)
- Failed tasks: 3  ·  Retries: 7  ·  Revoked: 0
- Top failure: "orders.tasks.send_confirmation" — ConnectionError × 3

### Recommendations
- ⚠ Investigate ValueError in orders/views.py — 8 occurrences in 24h (likely input validation gap)
- ⚠ Slow query × 23 — run data-optimize to identify N+1 or missing index
- ℹ 5xx rate 0.6% — within normal range but watch POST /api/orders/
```

## Process

1. Auto-detect `env`. Resolve SSH target if `prod`.
2. Fetch all default sources (see `references/environments.md` — Default source sets), applying `since` filter.
3. **App log** — detect format (standard logging or structlog JSON):
   - Count entries by level (DEBUG, INFO, WARNING, ERROR, CRITICAL).
   - Collect and group tracebacks by normalized exception class + message.
   - Find top 3 recurring exceptions and top 3 recurring warnings.
4. **Web server** (uvicorn/gunicorn access log, Combined Log Format):
   - Extract HTTP status codes.
   - Count 2xx, 3xx, 4xx, 5xx; compute percentages.
   - Group 5xx by path; identify top endpoint.
5. **Celery** (if `celery` detected in dependencies): parse task result log for `FAILURE`, `RETRY`, `REVOKED`.
6. **Django request logger** (`django.request`): check for WARNING (4xx) and ERROR (5xx) entries.
7. Compose the summary markdown.
8. **Recommendations** section:
   - Any CRITICAL (always actionable).
   - Exception appearing > 5 times in the period (systemic).
   - 5xx rate > 1% (investigate endpoint).
   - Slow query warnings > 10 times (data layer issue).
9. If a source not found or empty: mark `[no data]` and continue.

## Test

Output contains at least "App log" and "Web server" sections with numeric counts ≥ 0; no crash on empty logs.
