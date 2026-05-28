# 02 - Parse errors

Extract and group Rust panics, ERROR-level tracing/log events, and HTTP 5xx responses.

## Inputs

- `env` (optional, default: auto-detect) — `local | docker | prod`
- `source` (optional, default: `app,web-server`) — comma-separated alias(es)
- `since` (optional) — time filter: `1h`, `30m`, `2026-05-27`, ISO datetime

## Outputs

```
## [docker] App — container stdout (tracing compact format)

| Level | Count | First seen | Target / Message (truncated 120 chars)              |
| ----- | ----- | ---------- | --------------------------------------------------- |
| ERROR | 4     | 09:12:34   | orders::service — order creation failed err=Db(..) |
| ERROR | 2     | 09:05:10   | auth::middleware — token validation failed          |
| WARN  | 11    | 08:55:01   | orders::handler — slow request duration_ms > 2000  |

Panics (thread 'tokio-runtime-worker'):
  1 × panicked at 'called `Option::unwrap()` on a `None` value', src/service/order.rs:67

## [docker] Web server — nginx access log

| Status | Count | Path             |
| ------ | ----- | ---------------- |
| 500    | 4     | POST /api/orders |
| 502    | 1     | GET /api/health  |
```

## Process

1. Auto-detect `env`. Resolve SSH target if `prod`.
2. Fetch log content per source, applying `since` filter if provided (see `references/log-formats.md` — Timestamp filtering).
3. **App log** — detect format (see `references/log-formats.md`):
   - **tracing compact/pretty**: parse lines starting with a log level marker (`ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`).
   - **tracing JSON**: parse NDJSON; group by `fields.level`.
   - **env_logger**: parse `[YYYY-MM-DD HH:MM:SS] [LEVEL target] message`.
   - Group by `(level, normalized_message)` — strip span IDs, timestamps, and specific IDs (e.g. `id=42` → `id=<id>`).
   - Sort by count desc.
4. **Panics** — detect lines containing `thread '...' panicked at` and collect the full backtrace (until next log entry or blank line). Group by the panic message.
5. **Web server** (nginx Combined Log Format): extract HTTP status codes, group 5xx by path.
6. Print grouped markdown tables per source.
7. List `target` values (Rust module paths) for ERROR entries — these are the hotspot modules.
8. If 0 errors/panics: print `No errors found in <sources>` and stop.
9. Suggest `search` on the top recurring error message to find surrounding span context.

## Test

Fetch last 200 lines from app stdout; assert output contains "App" section with level counts ≥ 0.
