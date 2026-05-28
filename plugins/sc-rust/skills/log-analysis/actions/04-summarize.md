# 04 - Summarize

Produce a period digest across all Rust log sources: error counts by level, top recurring errors, panics, HTTP status distribution.

## Inputs

- `env` (optional, default: auto-detect) — `local | docker | prod`
- `since` (optional, default: `24h`) — time filter

## Outputs

```
## Log summary — [docker] — last 24h

### App log (tracing compact)
- Total events: 28,412
- ERROR: 6  ·  WARN: 34  ·  INFO: 28,370  ·  DEBUG: 2
- Top ERROR: "orders::service — order creation failed" × 4
- Top WARN:  "orders::handler — slow request (>2s)" × 18

### Panics
- Total: 1
- "called `Option::unwrap()` on a `None` value" at src/service/order.rs:67

### Web server (nginx)
- Total requests: 12,847
- 5xx: 6 (0.05%)  ·  4xx: 145 (1.1%)  ·  2xx: 12,696 (98.8%)
- Top 5xx path: POST /api/orders × 4

### Recommendations
- ⚠ Panic at src/service/order.rs:67 — replace unwrap() with ? or expect() with context
- ⚠ orders::service errors × 4 — investigate database connectivity or validation logic
- ℹ Slow requests × 18 — check query performance on /api/orders handler
```

## Process

1. Auto-detect `env`. Resolve SSH target if `prod`.
2. Fetch all default sources (see `references/environments.md`), applying `since` filter.
3. **App log** — detect format (tracing compact/pretty/JSON or env_logger):
   - Count events by level (TRACE, DEBUG, INFO, WARN, ERROR).
   - Group ERROR/WARN by `(target, normalized_message)` — strip IDs and dynamic values.
   - Find top 3 recurring errors and top 3 recurring warnings.
4. **Panics** — grep for `panicked at` across all app sources; group by panic message + file location.
5. **Web server** (nginx/traefik Combined Log Format): extract HTTP status codes; compute percentages; group 5xx by path.
6. Compose the summary markdown.
7. **Recommendations** section:
   - Any panic (always P0 — replace `unwrap()`).
   - ERROR recurring > 3 times in the period.
   - 5xx rate > 0.5%.
   - WARN for slow requests > 10 times (database or async issue).
8. If a source not found or empty: mark `[no data]` and continue.

## Test

Output contains at least "App log" and "Web server" sections with numeric counts ≥ 0; no crash on empty sources.
