# Log line formats and parsing patterns

## tracing subscriber — compact format

Format: `YYYY-MM-DDTHH:MM:SS.mmmZ LEVEL target: message field=value`

```
2026-05-27T09:12:34.123Z ERROR orders::service: order creation failed id=42 err=DatabaseError(connection refused)
2026-05-27T09:12:34.456Z  WARN orders::handler: slow request duration_ms=2341 path="/api/orders"
```

Parse regex: `^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\s+(ERROR|WARN|INFO|DEBUG|TRACE)\s+([\w:]+):\s+(.+)`

Levels (ascending severity): `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`

Normalization for grouping: strip dynamic field values (`id=42` → `id=<id>`, `duration_ms=2341` → `duration_ms=<N>`).

## tracing subscriber — JSON format

Format: NDJSON — one JSON object per line.

```json
{"timestamp":"2026-05-27T09:12:34.123Z","level":"ERROR","target":"orders::service","fields":{"message":"order creation failed","id":42,"err":"DatabaseError(connection refused)"},"span":{"name":"create_order"}}
```

Parse: `serde_json::from_str(line)` equivalent — use `level`, `target`, `fields.message` for grouping.

## env_logger

Format: `[YYYY-MM-DD HH:MM:SS] [LEVEL target] message`

```
[2026-05-27 09:12:34] [ERROR orders::service] order creation failed
```

Parse regex: `^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] \[(ERROR|WARN|INFO|DEBUG|TRACE) ([\w:]+)\] (.+)`

## Panic output

Format:
```
thread 'tokio-runtime-worker' panicked at 'called `Option::unwrap()` on a `None` value', src/service/order.rs:67
stack backtrace:
   0: rust_begin_unwind
             at /rustc/.../library/std/src/panicking.rs:645
   1: core::panicking::panic_fmt
             at /rustc/.../library/core/src/panicking.rs:72
   2: orders::service::create_order
             at ./src/service/order.rs:67
   ...
note: Some details are omitted, run with `RUST_BACKTRACE=full` for a verbose backtrace.
```

Detection: `thread '.*' panicked at`

Collect: keep all lines from `thread '...' panicked at` through `note: Some details are omitted` (or next log timestamp).

## actix-web / tower-http access log

Format (Combined Log Format via `tracing` or middleware):
`<ip> - - [DD/Mon/YYYY:HH:MM:SS +ZZZZ] "<method> <path> <proto>" <status> <bytes>`

Or structured via tracing:
```
2026-05-27T09:12:34Z INFO  tower_http::trace: finished processing request latency=2ms status=500
```

## nginx access log (reverse proxy)

Same as Apache Combined Log Format.
Parse regex: `^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) (\S+) [^"]*" (\d{3}) (\d+|-)`

## Timestamp filtering

### docker stdout sources

```bash
docker logs --since 1h   <container> 2>&1
docker logs --since 30m  <container> 2>&1
docker logs --since 2026-05-27T00:00:00 <container> 2>&1
```

Note: Rust logs go to stderr; always use `2>&1` to capture both streams.

### File-based sources (local or prod SSH)

#### Strategy A — Day-level precision (fast)

| Log format | Command |
|---|---|
| tracing compact | `grep "$(date '+%Y-%m-%dT')" <path>` |
| env_logger | `grep "$(date '+\[%Y-%m-%d')" <path>` |
| JSON | `grep "$(date '+%Y-%m-%d')" <path>` |
| nginx access | `grep "$(date '+%d/%b/%Y:')" <path>` |

#### Strategy B — Sub-day precision

```bash
# Use awk on the ISO timestamp prefix (tracing compact/JSON)
awk -v cutoff="$(date -u -d '-<N> seconds' '+%Y-%m-%dT%H:%M:%S' 2>/dev/null || date -u -v-<N>S '+%Y-%m-%dT%H:%M:%S')" \
    '$1 >= cutoff' <path>
```

If `awk` or `date -d` not available on the target, fall back to Strategy A.

### `since` → seconds conversion table

| User input | Seconds |
|---|---|
| `30m` | `1800` |
| `1h` | `3600` |
| `6h` | `21600` |
| `24h` | `86400` → prefer Strategy A |
| `YYYY-MM-DD` | → Strategy A |
| ISO datetime | → Strategy B with computed cutoff |
