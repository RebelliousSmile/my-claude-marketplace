# 01 - Tail

Display the last N lines from one or more Python application log sources in a given environment.

## Inputs

- `env` (optional, default: auto-detect) — `local | docker | prod`
- `source` (optional, default: `app,web-server`) — comma-separated alias(es) from `references/environments.md`
- `lines` (optional, default: `50`) — number of lines per source

## Outputs

```
=== [docker] app — /app/logs/app.log — last 50 lines ===
2026-05-27 09:12:34,123 ERROR orders.views Unhandled exception in create_order
Traceback (most recent call last):
  File "/app/orders/views.py", line 45, in create_order
    order = OrderService.create(data)
  ...

=== [docker] web-server — uvicorn stdout — last 50 lines ===
INFO:     192.168.1.1:54321 - "POST /api/orders HTTP/1.1" 500 Internal Server Error
...
```

## Process

1. Detect `env` if not specified: check for `docker-compose.yml` or running containers → `docker`; else `local`.
2. If `prod`, resolve SSH target (see `references/environments.md` — SSH target resolution).
3. For `docker`: discover Python app container and web server container via `docker ps`.
4. Resolve each source alias to container/path using `references/environments.md`.
5. Build and run the fetch command:
   - `local`: `tail -n <lines> <path>`
   - `docker` (file source): `docker exec <container> tail -n <lines> <path>`
   - `docker` (stdout/stderr): `docker logs --tail <lines> <container>`
   - `prod`: `ssh <host> "tail -n <lines> <path>"`
6. Print each source under a labeled header `=== [env] source — location — last N lines ===`.
7. Truncate individual lines to 300 chars — **exception**: never truncate mid-traceback. Keep the entire traceback intact even if it exceeds 300 chars per line.
8. Count ERROR/CRITICAL/exception lines across all output; if > 0, suggest running `parse-errors`.

## Test

In a project with Docker: `docker ps` shows at least one Python container; container is accessible.
