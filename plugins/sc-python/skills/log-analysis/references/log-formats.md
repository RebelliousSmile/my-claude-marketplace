# Log line formats and parsing patterns

## Python standard logging

Format: `%(asctime)s %(levelname)s %(name)s %(message)s`

Default output: `YYYY-MM-DD HH:MM:SS,mmm LEVEL module.name message`

Parse regex: `^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})\s+(DEBUG|INFO|WARNING|ERROR|CRITICAL)\s+([\w.]+)\s+(.+)`

Levels (ascending severity): `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`

### Multiline tracebacks

A traceback follows an ERROR/CRITICAL log line:
```
2026-05-27 09:12:34,123 ERROR orders.views Unhandled exception
Traceback (most recent call last):
  File "/app/orders/views.py", line 45, in create_order
    order = OrderService.create(data)
  File "/app/orders/services.py", line 23, in create
    raise ValueError("invalid amount")
ValueError: invalid amount
```

Collection strategy: after matching an ERROR/CRITICAL line, consume subsequent lines until the next line matching the timestamp prefix or a blank line.

## structlog (JSON format)

Format: NDJSON — one JSON object per line.

```json
{"timestamp": "2026-05-27T09:12:34.123Z", "level": "error", "logger": "orders.views", "event": "order creation failed", "order_id": 42, "exc_info": "...traceback..."}
```

Parse: `json.loads(line)` → use `level` for severity, `event` for message, `logger` for target.
Normalization: strip numeric IDs from the `event` field for grouping.

## Django request logger

Format (django.request): `YYYY-MM-DD HH:MM:SS,mmm WARNING django.request Internal Server Error: /api/orders`

Error entries include the full traceback as subsequent lines (same multiline strategy as standard logging).

4xx responses are logged as WARNING, 5xx as ERROR.

## uvicorn access log

Format: `INFO:     <ip>:<port> - "<method> <path> HTTP/<version>" <status> <phrase>`

Parse regex: `^INFO:\s+(\S+:\d+) - "(\S+) (\S+) HTTP/[\d.]+" (\d{3})`

## gunicorn access log (Combined Log Format)

Same as Apache Combined Log Format:
`<ip> - - [DD/Mon/YYYY:HH:MM:SS +ZZZZ] "<method> <path> <proto>" <status> <bytes>`

Parse regex: `^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) (\S+) [^"]*" (\d{3}) (\d+|-)`

## Celery task log

Format: `[YYYY-MM-DD HH:MM:SS,mmm: <LEVEL>/<ProcessName>] <message>`

```
[2026-05-27 09:12:34,123: ERROR/ForkPoolWorker-1] Task orders.tasks.send_confirmation[uuid] raised unexpected: ConnectionError(...)
Traceback (most recent call last):
  ...
```

Parse regex: `^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}): (ERROR|WARNING|INFO)/(\w+)\] (.+)`

## Timestamp filtering

### docker stdout sources

```bash
docker logs --since 1h   <container>
docker logs --since 30m  <container>
docker logs --since 2026-05-27T00:00:00 <container>
```

### File-based sources

#### Strategy A — Day-level precision (fast)

| Log format | Command |
|---|---|
| Standard logging | `grep "$(date '+%Y-%m-%d')" <path>` |
| Django request | `grep "$(date '+%Y-%m-%d')" <path>` |
| uvicorn | `grep "$(date '+%d/%b/%Y:')" <path>` |
| structlog JSON | `grep "$(date '+%Y-%m-%d')" <path>` |

#### Strategy B — Sub-day precision (Python one-liner)

```bash
python3 -c "
import sys, re
from datetime import datetime, timedelta
cutoff = datetime.utcnow() - timedelta(seconds=<seconds>)
pattern = re.compile(r'^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})')
for line in open('<path>'):
    m = pattern.match(line)
    if not m or datetime.strptime(m.group(1), '%Y-%m-%d %H:%M:%S') >= cutoff:
        sys.stdout.write(line)
"
```

Adapt prefix: `docker exec <container> python3 -c "..."` or `ssh <host> python3 -c '...'`

If `python3` is absent on the target, fall back to Strategy A.

### `since` → seconds conversion table

| User input | Seconds |
|---|---|
| `30m` | `1800` |
| `1h` | `3600` |
| `6h` | `21600` |
| `24h` | `86400` → prefer Strategy A |
| `YYYY-MM-DD` | → Strategy A |
| ISO datetime | → Strategy B with computed cutoff |
